import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../types/colors";
import { borderRadius, spacing } from "../../theme";

interface GenerateLoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export default function GenerateLoadingOverlay({
  visible,
  text = "Generating...",
}: GenerateLoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
});
