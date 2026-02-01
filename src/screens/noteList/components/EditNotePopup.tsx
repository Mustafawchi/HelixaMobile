import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing, typography } from "../../../theme";
import type { Note } from "../../../types/note";

interface EditNotePopupProps {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onSave?: (payload: { noteId: string; title: string }) => void;
  isSubmitting?: boolean;
}

export default function EditNotePopup({
  visible,
  note,
  onClose,
  onSave,
  isSubmitting = false,
}: EditNotePopupProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (visible && note) {
      setTitle(note.title || "");
    }
  }, [visible, note]);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const handleSave = () => {
    if (!note || !canSubmit || isSubmitting) return;
    onSave?.({ noteId: note.id, title: title.trim() });
  };

  return (
    <AppPopup visible={visible} onClose={onClose}>
      <Text style={styles.title}>Rename Note</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter note title"
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
        autoCapitalize="sentences"
      />
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
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: spacing.lg,
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
