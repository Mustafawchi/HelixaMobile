import { useState, useRef, useEffect, useCallback } from "react";
import * as recorder from "../services/audioRecorder";
import type { AudioRecordingResult, AudioRecordingState } from "../types/audio";

const METERING_INTERVAL = 80;

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isPaused: false,
    durationMs: 0,
    metering: -160,
  });

  const meteringRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (meteringRef.current) clearInterval(meteringRef.current);
      recorder.cancelRecording();
    };
  }, []);

  const startMetering = useCallback(() => {
    meteringRef.current = setInterval(async () => {
      const status = await recorder.getStatus();
      if (!status || !isMountedRef.current) return;

      if (status.isRecording) {
        setState((prev) => ({
          ...prev,
          durationMs: status.durationMillis,
          metering: status.metering ?? -160,
        }));
      }
    }, METERING_INTERVAL);
  }, []);

  const stopMetering = useCallback(() => {
    if (meteringRef.current) {
      clearInterval(meteringRef.current);
      meteringRef.current = null;
    }
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    const granted = await recorder.requestPermissions();
    if (!granted) return false;

    await recorder.startRecording();
    setState({ isRecording: true, isPaused: false, durationMs: 0, metering: -160 });
    startMetering();
    return true;
  }, [startMetering]);

  const pause = useCallback(async () => {
    await recorder.pauseRecording();
    stopMetering();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [stopMetering]);

  const resume = useCallback(async () => {
    await recorder.resumeRecording();
    setState((prev) => ({ ...prev, isPaused: false }));
    startMetering();
  }, [startMetering]);

  const stop = useCallback(async (): Promise<AudioRecordingResult | null> => {
    stopMetering();
    const result = await recorder.stopRecording();
    setState({ isRecording: false, isPaused: false, durationMs: 0, metering: -160 });
    return result;
  }, [stopMetering]);

  const cancel = useCallback(async () => {
    stopMetering();
    await recorder.cancelRecording();
    setState({ isRecording: false, isPaused: false, durationMs: 0, metering: -160 });
  }, [stopMetering]);

  return { ...state, start, pause, resume, stop, cancel };
}
