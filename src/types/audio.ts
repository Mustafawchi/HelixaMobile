export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  durationMs: number;
  metering: number;
}

export interface AudioRecordingResult {
  uri: string;
  durationMs: number;
}

export interface AudioUploadRequest {
  fileUri: string;
  templateId: string;
  patientId: string;
  consultationType: string;
  recordTarget: "consultation" | "procedure";
}

export interface AudioUploadResponse {
  success: boolean;
  text: string;
  message?: string;
}

// Streaming types
export type StreamingPhase = "idle" | "converting" | "transcribing" | "generating" | "complete" | "error";

export interface StreamingState {
  phase: StreamingPhase;
  error: string | null;
  progress: number; // 0-100
}

export interface StreamingCallbacks {
  onPhaseChange?: (phase: StreamingPhase) => void;
  onComplete?: (finalContent: string) => void;
  onError?: (error: Error) => void;
}
