import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface AudioWaveformProps {
  levels: number[];
  paused?: boolean;
}

const BAR_MIN_HEIGHT = 8;
const BAR_MAX_HEIGHT = 36;
const ANIMATION_DURATION = 50;

interface WaveformBarProps {
  level: number;
  paused: boolean;
}

function WaveformBar({ level, paused }: WaveformBarProps) {
  const animatedHeight = useSharedValue(BAR_MIN_HEIGHT);

  useEffect(() => {
    const targetHeight = paused
      ? BAR_MIN_HEIGHT
      : Math.max(BAR_MIN_HEIGHT, level * BAR_MAX_HEIGHT);

    animatedHeight.value = withTiming(targetHeight, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.ease),
    });
  }, [level, paused, animatedHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View
      style={[styles.bar, paused && styles.barPaused, animatedStyle]}
    />
  );
}

export default function AudioWaveform({
  levels,
  paused = false,
}: AudioWaveformProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {levels.map((level, index) => (
          <WaveformBar key={index} level={level} paused={paused} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 280,
    paddingHorizontal: spacing.md,
  },
  bars: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  bar: {
    width: 3,
    backgroundColor: COLORS.error,
    borderRadius: borderRadius.sm,
    minHeight: BAR_MIN_HEIGHT,
  },
  barPaused: {
    backgroundColor: COLORS.textMuted,
  },
});
