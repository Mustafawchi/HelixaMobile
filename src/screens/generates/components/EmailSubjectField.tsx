import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface EmailSubjectFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function EmailSubjectField({
  value,
  onChangeText,
  placeholder = "Email subject",
}: EmailSubjectFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
