import React, { useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing } from "../../../theme";
import AudioWaveform from "./AudioWaveform";
import { useAudioRecorder } from "../../../hooks/useAudioRecorder";
import type { AudioRecordingResult } from "../../../types/audio";

interface VoiceRecordProps {
  isUploading?: boolean;
  onRecordingComplete: (result: AudioRecordingResult) => void;
  onMicPress?: () => void;
}

function meteringToLevel(metering: number): number {
  const clamped = Math.max(-60, Math.min(0, metering));
  return (clamped + 60) / 60;
}

const WAVEFORM_BARS = 20;

// Generate spectrum-like levels from a single metering value
// Simulates frequency bands like Desktop's Web Audio API
function generateSpectrumLevels(baseLevel: number): number[] {
  const levels: number[] = [];
  const centerIndex = WAVEFORM_BARS / 2;

  for (let i = 0; i < WAVEFORM_BARS; i++) {
    // Create bell curve effect - higher in the middle (voice frequencies)
    const distanceFromCenter = Math.abs(i - centerIndex) / centerIndex;
    const bellCurve = 1 - distanceFromCenter * 0.6;

    // Add some pseudo-random variation based on index for spectrum effect
    const variation = Math.sin(i * 1.3) * 0.15 + Math.cos(i * 0.7) * 0.1;

    const level = Math.max(0.08, baseLevel * bellCurve + variation * baseLevel);
    levels.push(Math.min(1, level));
  }

  return levels;
}

export default function VoiceRecord({
  isUploading = false,
  onRecordingComplete,
  onMicPress,
}: VoiceRecordProps) {
  const {
    isRecording,
    isPaused,
    durationMs,
    metering,
    start,
    pause,
    resume,
    stop,
    cancel,
  } = useAudioRecorder();

  const [displayDurationMs, setDisplayDurationMs] = React.useState(0);

  useEffect(() => {
    if (!isRecording) {
      setDisplayDurationMs(0);
      return;
    }
    setDisplayDurationMs((prev) => Math.max(prev, durationMs));
  }, [isRecording, durationMs]);

  useEffect(() => {
    if (!isRecording || isPaused) return;
    const interval = setInterval(() => {
      setDisplayDurationMs((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const handleStartRecording = useCallback(async () => {
    onMicPress?.();
    const granted = await start();
    if (!granted) {
      Alert.alert(
        "Permission Required",
        "Microphone access is needed to record audio.",
      );
    }
  }, [start, onMicPress]);

  const handleSendRecording = useCallback(async () => {
    const result = await stop();
    console.log("[VoiceRecord] Recording stopped, result:", result);
    if (result) {
      console.log("[VoiceRecord] Sending recording:", {
        uri: result.uri,
        durationMs: result.durationMs,
      });
      onRecordingComplete(result);
    }
  }, [stop, onRecordingComplete]);

  const handleCancelRecording = useCallback(async () => {
    await cancel();
  }, [cancel]);

  const handleTogglePause = useCallback(async () => {
    if (isPaused) {
      await resume();
    } else {
      await pause();
    }
  }, [isPaused, pause, resume]);

  const formattedTime = useMemo(() => {
    const totalSeconds = Math.floor(displayDurationMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [displayDurationMs]);

  const audioLevels = useMemo(() => {
    if (isPaused) {
      return new Array(WAVEFORM_BARS).fill(0.15);
    }
    if (!isRecording) {
      return new Array(WAVEFORM_BARS).fill(0.08);
    }
    const level = meteringToLevel(metering);
    return generateSpectrumLevels(level);
  }, [metering, isPaused, isRecording]);

  if (isUploading) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.uploadingText}>Processing recording...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.recordingHeader}>
        <Text style={styles.title}>Voice Recording</Text>
        <Text style={[styles.timer, isRecording && styles.timerActive]}>
          {formattedTime}
        </Text>
      </View>

      {isRecording ? (
        <View style={styles.recordingActiveContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionCircle}
              activeOpacity={0.7}
              onPress={handleCancelRecording}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCircle}
              activeOpacity={0.7}
              onPress={handleTogglePause}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={22}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCircle}
              activeOpacity={0.7}
              onPress={handleSendRecording}
            >
              <Ionicons name="arrow-up" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          <AudioWaveform levels={audioLevels} paused={isPaused} />

          <View style={styles.recordingStatusRow}>
            <Text style={styles.recordingStatusText}>
              {isPaused ? "Paused" : "Recording Active"}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={styles.micButton}
            activeOpacity={0.7}
            onPress={handleStartRecording}
          >
            <Ionicons name="mic" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.micLabel}>Start Recording</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  recordingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  timer: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.error,
    fontVariant: ["tabular-nums"],
  },
  timerActive: {
    color: COLORS.error,
  },

  // Idle State
  micContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  micLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },

  // Recording Active State
  recordingActiveContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  recordingStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  // Uploading State
  uploadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
