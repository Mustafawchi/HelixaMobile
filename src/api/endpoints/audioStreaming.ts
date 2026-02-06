import { firebaseAuth } from "../../config/firebase";
import type { AudioUploadRequest, StreamingCallbacks } from "../../types/audio";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://australia-southeast2-helixa-ai.cloudfunctions.net/audioProcessing";
const TIMEOUT_MS = 180000; // 3 minutes

/**
 * Convert file URI to base64
 */
async function fileToBase64(fileUri: string): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Process audio upload (non-streaming for React Native compatibility)
 * React Native doesn't support Web Streams API (response.body.getReader())
 */
export async function processAudioStreaming(
  params: AudioUploadRequest,
  callbacks: StreamingCallbacks,
  abortSignal?: AbortSignal,
): Promise<string> {
  const { onPhaseChange, onComplete, onError } = callbacks;

  try {
    // Phase 1: Converting
    onPhaseChange?.("converting");
    console.log("[AudioStreaming] Converting audio to base64...");

    const audioBase64 = await fileToBase64(params.fileUri);
    const fileName = params.fileUri.split("/").pop() || "recording.m4a";

    console.log("[AudioStreaming] Base64 length:", audioBase64.length);

    // Get auth token
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const idToken = await user.getIdToken();

    // Phase 2: Transcribing & Generating (server does both)
    onPhaseChange?.("transcribing");
    console.log("[AudioStreaming] Sending to server...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${API_BASE_URL}/upload-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        audioBase64,
        fileName,
        templateId: params.templateId,
      }),
      signal: abortSignal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Server responded with status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("[AudioStreaming] Server error:", errorData);
        const serverMsg = errorData.error || errorData.message;
        if (serverMsg) {
          errorMessage = `${serverMsg} (status: ${response.status})`;
        }
      } catch {
        const errorText = await response.text();
        console.error("[AudioStreaming] Server error text:", errorText);
      }
      throw new Error(errorMessage);
    }

    // Update phase to generating while waiting for response
    onPhaseChange?.("generating");

    const data = await response.json();
    console.log("[AudioStreaming] Response received:", Object.keys(data));

    if (!data.success) {
      throw new Error(data.error || data.message || "Audio processing failed");
    }

    // Extract content from response
    const content = data.fileNote || data.fileNoteRaw || data.text || "";

    // Complete
    onPhaseChange?.("complete");
    onComplete?.(content);
    console.log(
      "[AudioStreaming] Processing complete, content length:",
      content.length,
    );

    return content;
  } catch (error) {
    console.error("[AudioStreaming] Error:", error);
    onPhaseChange?.("error");

    const errorObj = error instanceof Error ? error : new Error(String(error));
    onError?.(errorObj);

    throw errorObj;
  }
}

/**
 * Retry wrapper for streaming upload
 */
export async function processAudioWithRetry(
  params: AudioUploadRequest,
  callbacks: StreamingCallbacks,
  maxRetries: number = 2,
): Promise<string> {
  let lastError: Error | null = null;
  const initialBackoffMs = 2000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[AudioStreaming] Retry attempt ${attempt}/${maxRetries}`);
      }
      return await processAudioStreaming(params, callbacks);
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (except timeout/rate limit)
      const isClientError =
        error?.message?.includes("status: 4") &&
        !error?.message?.includes("status: 408") &&
        !error?.message?.includes("status: 429");

      if (isClientError) {
        throw error;
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries) {
        const backoff = initialBackoffMs * Math.pow(2, attempt);
        console.log(`[AudioStreaming] Waiting ${backoff}ms before retry...`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  throw lastError ?? new Error("Upload failed after retries");
}
