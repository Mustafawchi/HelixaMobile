import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing, typography } from "../../../theme";

interface GenerateNotesPopupProps {
  visible: boolean;
  onClose: () => void;
  onSummaryToPatient?: () => void;
  onReferPatient?: () => void;
}

export default function GenerateNotesPopup({
  visible,
  onClose,
  onSummaryToPatient,
  onReferPatient,
}: GenerateNotesPopupProps) {
  return (
    <AppPopup visible={visible} onClose={onClose}>
      <Text style={styles.title}>Generate</Text>
      <View style={styles.optionList}>
        <Pressable style={styles.option} onPress={onSummaryToPatient}>
          <Ionicons name="document-text" size={16} color={COLORS.primary} />
          <Text style={styles.optionText}>Summary to Patient</Text>
        </Pressable>
        <Pressable style={styles.option} onPress={onReferPatient}>
          <Ionicons name="person-add" size={16} color={COLORS.primary} />
          <Text style={styles.optionText}>Refer Patient</Text>
        </Pressable>
      </View>
      <Pressable style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    color: COLORS.textPrimary,
    marginBottom: spacing.md,
  },
  optionList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
