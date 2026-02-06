import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import AppPopup from "../../../components/common/AppPopup";
import DatePicker from "../../../components/common/DatePicker";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing, typography } from "../../../theme";

interface PatientDetailsPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  homeAddress: string;
  medicalHistorySummary: string;
}

interface PatientDetailsProps {
  visible: boolean;
  initialValues?: Partial<PatientDetailsPayload>;
  locked?: boolean;
  onClose: () => void;
  onSave?: (payload: PatientDetailsPayload) => void;
  onUpdateFromNotes?: () => void;
  isSubmitting?: boolean;
}

export default function PatientDetails({
  visible,
  initialValues,
  locked = true,
  onClose,
  onSave,
  onUpdateFromNotes,
  isSubmitting = false,
}: PatientDetailsProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [medicalHistorySummary, setMedicalHistorySummary] = useState("");

  useEffect(() => {
    if (!visible) return;
    setFirstName(initialValues?.firstName || "");
    setLastName(initialValues?.lastName || "");
    setDateOfBirth(initialValues?.dateOfBirth || "");
    setEmail(initialValues?.email || "");
    setHomeAddress(initialValues?.homeAddress || "");
    setMedicalHistorySummary(initialValues?.medicalHistorySummary || "");
  }, [visible, initialValues]);

  const canSave = useMemo(() => firstName.trim().length > 0, [firstName]);

  const handleSave = () => {
    if (!canSave || isSubmitting) return;
    onSave?.({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      email: email.trim(),
      homeAddress: homeAddress.trim(),
      medicalHistorySummary: medicalHistorySummary.trim(),
    });
  };

  return (
    <AppPopup visible={visible} onClose={onClose} contentStyle={styles.popup}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Patient Details</Text>
        <View style={styles.lockedPill}>
          <Text style={styles.lockedText}>{locked ? "Locked" : "Unlocked"}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.field}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
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
          />
        </View>

        <DatePicker
          label="Date of Birth"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          placeholder="Select date of birth"
          maxDate={new Date().toISOString().split("T")[0]}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Home Address</Text>
          <TextInput
            value={homeAddress}
            onChangeText={setHomeAddress}
            placeholder="Enter home address"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medical & Dental History</Text>
          <Pressable style={styles.updateButton} onPress={onUpdateFromNotes}>
            <Text style={styles.updateText}>Update from Notes</Text>
          </Pressable>
        </View>

        <View style={styles.updatedBadge}>
          <Text style={styles.updatedText}>
            Last updated: 01/02/2026 at 14:49:34
          </Text>
        </View>

        <View style={styles.medicalBox}>
          <Text style={styles.medicalText}>
            {medicalHistorySummary ||
              "Medical Conditions & History\n- No information documented\n\nAllergies\n- No known allergies\n\nCurrent Medications\n- No current medications"}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[
            styles.saveButton,
            (!canSave || isSubmitting) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </Pressable>
      </View>
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  popup: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    height: "75%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: COLORS.textPrimary,
  },
  lockedPill: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.surfaceSecondary,
  },
  lockedText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  field: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  updateText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "600",
  },
  updatedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.sm,
  },
  updatedText: {
    fontSize: 11,
    color: COLORS.successDark,
    fontWeight: "600",
  },
  medicalBox: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.surfaceSecondary,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  medicalText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
});
