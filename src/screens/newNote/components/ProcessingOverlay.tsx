import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import type { StreamingPhase } from "../../../types/audio";

interface ProcessingOverlayProps {
  phase: StreamingPhase;
  phaseText: string;
  progress: number;
  onCancel?: () => void;
}

const phaseIcons: Record<StreamingPhase, keyof typeof Ionicons.glyphMap> = {
  idle: "mic",
  converting: "cloud-upload",
  transcribing: "ear",
  generating: "sparkles",
  complete: "checkmark-circle",
  error: "alert-circle",
};

export default function ProcessingOverlay({
  phase,
  phaseText,
  progress,
  onCancel,
}: ProcessingOverlayProps) {
  const pulseValue = useSharedValue(1);

  React.useEffect(() => {
    if (phase === "generating") {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      pulseValue.value = 1;
    }
  }, [phase, pulseValue]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <Ionicons
            name={phaseIcons[phase]}
            size={32}
            color={phase === "error" ? COLORS.error : COLORS.primary}
          />
        </Animated.View>

        {/* Phase Text */}
        <Text style={styles.phaseText}>{phaseText}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
                phase === "error" && styles.progressError,
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Loading Indicator */}
        {phase !== "complete" && phase !== "error" && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loader}
          />
        )}

        {/* Cancel Button */}
        {onCancel && phase !== "complete" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    zIndex: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  phaseText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressError: {
    backgroundColor: COLORS.error,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    width: 36,
    textAlign: "right",
  },
  loader: {
    marginBottom: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
});
