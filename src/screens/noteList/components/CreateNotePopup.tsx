import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing, typography } from "../../../theme";
import {
  consultationTypes,
  getConsultationLabelColor,
} from "../../../types/note";

interface CreateNotePopupProps {
  visible: boolean;
  onClose: () => void;
  onCreate?: (payload: { title: string; type: string; labelColor: string }) => void;
  isSubmitting?: boolean;
}

export default function CreateNotePopup({
  visible,
  onClose,
  onCreate,
  isSubmitting = false,
}: CreateNotePopupProps) {
  const [selectedType, setSelectedType] = useState("");
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    if (visible) {
      setSelectedType("");
      setOtherText("");
    }
  }, [visible]);

  const canSubmit = useMemo(() => {
    if (!selectedType) return false;
    if (selectedType === "Other") return otherText.trim().length > 0;
    return true;
  }, [selectedType, otherText]);

  const handleCreate = () => {
    if (!canSubmit || isSubmitting) return;
    const finalType =
      selectedType === "Other" ? otherText.trim() : selectedType;
    onCreate?.({
      title: finalType,
      type: selectedType === "Other" ? "Other" : selectedType,
      labelColor: getConsultationLabelColor(
        selectedType === "Other" ? "Other" : selectedType,
      ),
    });
  };

  return (
    <AppPopup visible={visible} onClose={onClose}>
      <Text style={styles.heading}>Select Consultation Type</Text>
      <View style={styles.typeList}>
        {consultationTypes.map((type) => (
          <View key={type}>
            <Pressable
              style={[
                styles.typeItem,
                selectedType === type && styles.typeItemSelected,
              ]}
              onPress={() => {
                setSelectedType(type);
                if (type !== "Other") setOtherText("");
              }}
            >
              <View
                style={[
                  styles.typeColorDot,
                  { backgroundColor: getConsultationLabelColor(type) },
                ]}
              />
              <Text
                style={[
                  styles.typeItemText,
                  selectedType === type && styles.typeItemTextSelected,
                ]}
              >
                {type}
              </Text>
            </Pressable>
            {type === "Other" && selectedType === "Other" && (
              <TextInput
                style={styles.otherInput}
                placeholder="Enter consultation type..."
                placeholderTextColor={COLORS.textMuted}
                value={otherText}
                onChangeText={setOtherText}
                autoFocus
              />
            )}
          </View>
        ))}
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
          onPress={handleCreate}
          disabled={!canSubmit || isSubmitting}
        >
          <Text style={styles.saveText}>Continue</Text>
        </Pressable>
      </View>
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.h3,
    textAlign: "left",
    color: COLORS.textPrimary,
    marginBottom: spacing.md,
  },
  typeList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  typeItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  typeItemTextSelected: {
    color: COLORS.white,
  },
  typeColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  otherInput: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    fontSize: 13,
    color: COLORS.textPrimary,
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
});
