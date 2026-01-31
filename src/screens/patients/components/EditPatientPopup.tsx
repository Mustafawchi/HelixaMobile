import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing, typography } from "../../../theme";
import type { Patient } from "../../../types/patient";

interface EditPatientPopupProps {
  visible: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSave?: (payload: {
    patientId: string;
    firstName: string;
    lastName: string;
  }) => void;
  isSubmitting?: boolean;
}

export default function EditPatientPopup({
  visible,
  patient,
  onClose,
  onSave,
  isSubmitting = false,
}: EditPatientPopupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (visible && patient) {
      setFirstName(patient.firstName || "");
      setLastName(patient.lastName || "");
    }
  }, [visible, patient]);

  const canSubmit = useMemo(() => firstName.trim().length > 0, [firstName]);

  const handleSave = () => {
    if (!canSubmit || isSubmitting || !patient) return;
    onSave?.({
      patientId: patient.patientId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  return (
    <AppPopup visible={visible} onClose={onClose}>
      <Text style={styles.title}>Edit Patient</Text>

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

      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[
            styles.saveButton,
            (!canSubmit || isSubmitting) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save</Text>
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
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
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
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  saveText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
