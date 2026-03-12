import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing } from "../../../theme";

export default function EmptyTaskState() {
  return (
    <View style={styles.container}>
      <Ionicons
        name="checkbox-outline"
        size={48}
        color={COLORS.textMuted}
        style={styles.icon}
      />
      <Text style={styles.title}>No tasks yet</Text>
      <Text style={styles.subtitle}>
        Tasks will appear here when extracted from patient notes or added
        manually.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
  },
  icon: {
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
