import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { COLORS } from "../../../types/colors";
import { spacing } from "../../../theme";

export default function ThinkingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.3],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>H</Text>
        </View>
        <Text style={styles.label}>Helixa</Text>
      </View>
      <View style={styles.thinkingRow}>
        <Text style={styles.thinkingText}>Thinking</Text>
        <View style={styles.dots}>
          <Animated.Text style={[styles.dot, dotStyle(dot1)]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, dotStyle(dot2)]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, dotStyle(dot3)]}>.</Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    paddingRight: spacing.lg,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thinkingText: {
    fontSize: 13,
    fontStyle: "italic",
    color: COLORS.textMuted,
  },
  dots: {
    flexDirection: "row",
    marginLeft: 1,
  },
  dot: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
});
