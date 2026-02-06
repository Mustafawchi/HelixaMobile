import { audioApi } from "../api/endpoints/audio";
import type { AudioUploadRequest, AudioUploadResponse } from "../types/audio";

const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

export async function uploadRecording(
  params: AudioUploadRequest,
): Promise<AudioUploadResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await audioApi.processRecording(params);
    } catch (error: any) {
      lastError = error;

      const status = error?.response?.status;
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        throw error;
      }

      if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  throw lastError ?? new Error("Upload failed after retries");
}
