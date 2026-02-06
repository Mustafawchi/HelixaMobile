import apiClient from "../client";
import type { AudioUploadRequest, AudioUploadResponse } from "../../types/audio";

async function fileToBase64(fileUri: string): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/m4a;base64,")
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const audioApi = {
  processRecording: async (
    params: AudioUploadRequest,
  ): Promise<AudioUploadResponse> => {
    console.log("[AudioAPI] processRecording called with params:", {
      fileUri: params.fileUri,
      templateId: params.templateId,
      patientId: params.patientId,
      consultationType: params.consultationType,
      recordTarget: params.recordTarget,
    });

    // Convert audio file to base64
    console.log("[AudioAPI] Converting audio file to base64...");
    const audioBase64 = await fileToBase64(params.fileUri);
    console.log("[AudioAPI] Base64 conversion complete, length:", audioBase64.length);

    const fileName = params.fileUri.split("/").pop() || "recording.m4a";

    const requestBody = {
      audioBase64,
      fileName,
      templateId: params.templateId,
    };

    console.log("[AudioAPI] Sending request to /upload-json...");

    const response = await apiClient.post<AudioUploadResponse>(
      "/upload-json",
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 120000,
      },
    );

    console.log("[AudioAPI] Server response:", response.data);

    if (!response.data.success) {
      console.error("[AudioAPI] Processing failed:", response.data.message);
      throw new Error(response.data.message || "Audio processing failed");
    }

    console.log("[AudioAPI] Processing successful, returning data");
    return response.data;
  },
};
