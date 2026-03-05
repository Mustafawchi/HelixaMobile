import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing } from "../../../theme";

interface CustomTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  editingId: string | null;
  name: string;
  onNameChange: (value: string) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

export default function CustomTemplateModal({
  visible,
  onClose,
  editingId,
  name,
  onNameChange,
  prompt,
  onPromptChange,
  isSaving,
  onSave,
}: CustomTemplateModalProps) {
  return (
    <AppPopup visible={visible} onClose={onClose} dismissOnBackdrop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>
          {editingId ? "Edit Custom Template" : "Create Custom Template"}
        </Text>
        <Text style={styles.subheading}>Consultation template</Text>

        {/* Template Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Template Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={onNameChange}
            placeholder="e.g., My Extraction Notes"
            placeholderTextColor={COLORS.textMuted}
            maxLength={50}
          />
        </View>

        {/* Instructions */}
        <View style={styles.field}>
          <Text style={styles.label}>Instructions for AI</Text>
          <Text style={styles.hint}>
            Describe how you want your notes formatted. The AI will follow these
            instructions when transcribing your recording.
          </Text>
          <TextInput
            style={styles.textarea}
            value={prompt}
            onChangeText={onPromptChange}
            placeholder={
              "Example: Write the notes in bullet points. Include sections for:\n- Patient consent\n- Anesthesia used\n- Procedure steps\n- Post-op instructions given\n\nUse dental abbreviations where appropriate."
            }
            placeholderTextColor={COLORS.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsBox}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.primary} />
            <Text style={styles.tipsTitle}>Tips for good instructions:</Text>
          </View>
          <Text style={styles.tipItem}>
            {"\u2022"} Be specific about the format you want (bullet points,
            headings, etc.)
          </Text>
          <Text style={styles.tipItem}>
            {"\u2022"} List the sections you want included
          </Text>
          <Text style={styles.tipItem}>
            {"\u2022"} Mention if you want dental abbreviations used
          </Text>
          <Text style={styles.tipItem}>
            {"\u2022"} Specify any terminology preferences
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSaving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveButton,
              (!name.trim() || !prompt.trim() || isSaving) &&
                styles.saveButtonDisabled,
            ]}
            onPress={onSave}
            disabled={isSaving || !name.trim() || !prompt.trim()}
          >
            <Text style={styles.saveText}>
              {isSaving
                ? "Saving..."
                : editingId
                  ? "Update Template"
                  : "Create Template"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
    lineHeight: 17,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  textarea: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    minHeight: 160,
  },
  tipsBox: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  tipItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    paddingLeft: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
});
