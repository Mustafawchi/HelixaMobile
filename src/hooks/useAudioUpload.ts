import { useMutation } from "@tanstack/react-query";
import { uploadRecording } from "../services/audioUpload";
import type { AudioUploadRequest } from "../types/audio";

export function useAudioUpload() {
  return useMutation({
    mutationFn: (params: AudioUploadRequest) => uploadRecording(params),
  });
}
