import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface AudioWaveformProps {
  levels: number[];
  paused?: boolean;
}

export default function AudioWaveform({
  levels,
  paused = false,
}: AudioWaveformProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {levels.map((level, index) => {
          const height = paused ? 8 : Math.max(8, level * 32);
          return (
            <View
              key={index}
              style={[
                styles.bar,
                paused && styles.barPaused,
                { height },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 260,
    paddingHorizontal: spacing.md,
  },
  bars: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  bar: {
    width: 3,
    backgroundColor: COLORS.error,
    borderRadius: borderRadius.sm,
    minHeight: 8,
  },
  barPaused: {
    backgroundColor: COLORS.textMuted,
  },
});
