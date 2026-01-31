import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing, typography } from "../../../theme";

interface CreatePatientPopupProps {
  visible: boolean;
  onClose: () => void;
  onCreate?: (payload: { firstName: string; lastName: string }) => void;
  isSubmitting?: boolean;
}

export default function CreatePatientPopup({
  visible,
  onClose,
  onCreate,
  isSubmitting = false,
}: CreatePatientPopupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (!visible) {
      setFirstName("");
      setLastName("");
    }
  }, [visible]);

  const canSubmit = useMemo(() => firstName.trim().length > 0, [firstName]);

  const handleCreate = () => {
    if (!canSubmit || isSubmitting) return;
    onCreate?.({ firstName: firstName.trim(), lastName: lastName.trim() });
  };

  return (
    <AppPopup visible={visible} onClose={onClose}>
      <Text style={styles.title}>Add New Patient</Text>

      <View style={styles.field}>
        <Text style={styles.label}>
          First Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="words"
        />
      </View>

      <Text style={styles.helperText}>
        You can add more details (DOB, email, etc.) in the patient folder.
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[
            styles.createButton,
            (!canSubmit || isSubmitting) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
        >
          <Text style={styles.createText}>Create</Text>
        </Pressable>
      </View>
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    textAlign: "center",
    color: COLORS.textPrimary,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.surface,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  createText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
