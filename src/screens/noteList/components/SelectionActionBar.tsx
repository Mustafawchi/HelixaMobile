import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface SelectionActionBarProps {
  onCancel: () => void;
  onSelectAll: () => void;
  onGenerate?: () => void;
}

export default function SelectionActionBar({
  onCancel,
  onSelectAll,
  onGenerate,
}: SelectionActionBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle" size={16} color={COLORS.white} />
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.selectAllButton}
        onPress={onSelectAll}
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
        <Text style={styles.selectAllText}>Select All</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={onGenerate}
        activeOpacity={0.7}
      >
        <Ionicons name="sparkles" size={16} color={COLORS.primary} />
        <Text style={styles.generateText}>Generate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  selectAllButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  selectAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  generateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  generateText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
