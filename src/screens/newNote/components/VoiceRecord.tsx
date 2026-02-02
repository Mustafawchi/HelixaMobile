import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing } from "../../../theme";
import AudioWaveform from "./AudioWaveform";

export default function VoiceRecord() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(
    new Array(20).fill(0),
  );
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStartRecording = useCallback(() => {
    setElapsedSeconds(0);
    setIsRecording(true);
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const handleStopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
    setElapsedSeconds(0);
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setAudioLevels((prev) =>
        prev.map(() => (isPaused ? 0.2 : Math.random())),
      );
    }, 80);
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [elapsedSeconds]);

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
              onPress={handleStopRecording}
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
              onPress={() => setIsPaused((prev) => !prev)}
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
              onPress={() => {}}
            >
              <Ionicons name="arrow-up" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          <AudioWaveform levels={audioLevels} paused={isPaused} />

          <View style={styles.recordingStatusRow}>
            <Text style={styles.recordingStatusText}>Recording Active</Text>
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
});
