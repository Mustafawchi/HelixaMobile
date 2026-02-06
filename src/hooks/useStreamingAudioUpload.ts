import { useState, useCallback, useRef } from "react";
import { processAudioWithRetry } from "../api/endpoints/audioStreaming";
import type {
  AudioUploadRequest,
  StreamingPhase,
  StreamingState,
} from "../types/audio";

interface UseStreamingAudioUploadOptions {
  maxRetries?: number;
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
}

interface UseStreamingAudioUploadReturn {
  state: StreamingState;
  upload: (params: AudioUploadRequest) => Promise<string>;
  cancel: () => void;
  reset: () => void;
  isUploading: boolean;
  phaseText: string;
}

const initialState: StreamingState = {
  phase: "idle",
  error: null,
  progress: 0,
};

const phaseTextMap: Record<StreamingPhase, string> = {
  idle: "",
  converting: "Preparing audio...",
  transcribing: "Transcribing speech...",
  generating: "Generating note...",
  complete: "Complete",
  error: "Error occurred",
};

const phaseProgressMap: Record<StreamingPhase, number> = {
  idle: 0,
  converting: 10,
  transcribing: 30,
  generating: 60,
  complete: 100,
  error: 0,
};

export function useStreamingAudioUpload(
  options: UseStreamingAudioUploadOptions = {},
): UseStreamingAudioUploadReturn {
  const { maxRetries = 2, onComplete, onError } = options;

  const [state, setState] = useState<StreamingState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (params: AudioUploadRequest) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState({
        ...initialState,
        phase: "converting",
        progress: phaseProgressMap.converting,
      });

      try {
        const finalContent = await processAudioWithRetry(
          params,
          {
            onPhaseChange: (phase) => {
              setState((prev) => ({
                ...prev,
                phase,
                progress: phaseProgressMap[phase],
                error: phase === "error" ? prev.error : null,
              }));
            },
            onComplete: (content) => {
              setState((prev) => ({
                ...prev,
                phase: "complete",
                progress: 100,
              }));
              onComplete?.(content);
            },
            onError: (error) => {
              setState((prev) => ({
                ...prev,
                phase: "error",
                error: error.message,
                progress: 0,
              }));
              onError?.(error);
            },
          },
          maxRetries,
        );

        return finalContent;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        // State and onError already handled via callbacks in processAudioStreaming
        // Only update state here if it wasn't already set to error
        setState((prev) => {
          if (prev.phase === "error") return prev;
          return {
            ...prev,
            phase: "error",
            error: errorObj.message,
            progress: 0,
          };
        });
        throw errorObj;
      }
    },
    [maxRetries, onComplete, onError],
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState(initialState);
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState(initialState);
  }, []);

  const isUploading = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";
  const phaseText = phaseTextMap[state.phase];

  return {
    state,
    upload,
    cancel,
    reset,
    isUploading,
    phaseText,
  };
}
