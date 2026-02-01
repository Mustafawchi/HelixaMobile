import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface SelectionBottomBarProps {
  selectedCount: number;
  onPdf?: () => void;
  onWord?: () => void;
  onDelete?: () => void;
}

export default function SelectionBottomBar({
  selectedCount,
  onPdf,
  onWord,
  onDelete,
}: SelectionBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}>
      <Text style={styles.countText}>{selectedCount} selected</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onPdf}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text" size={24} color={COLORS.primary} />
          <Text style={styles.actionLabel}>PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onWord}
          activeOpacity={0.7}
        >
          <Ionicons name="document" size={24} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Word</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={24} color={COLORS.error} />
          <Text style={[styles.actionLabel, { color: COLORS.error }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  countText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: COLORS.surfaceSecondary,
    minWidth: 80,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 4,
  },
});
