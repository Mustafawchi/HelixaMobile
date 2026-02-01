import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AppCard from "../../../components/common/AppCard";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import { formatDate, formatDateTime } from "../../../utils/formatting";
import type { Note } from "../../../types/note";

interface NoteCardProps {
  note: Note;
  onPress?: (note: Note) => void;
}

export default function NoteCard({ note, onPress }: NoteCardProps) {
  const lastEdited = note.lastEdited || note.updatedAt || note.createdAt;

  return (
    <AppCard>
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress?.(note)}
        activeOpacity={0.5}
      >
        <Text style={styles.title}>
          {formatDate(note.createdAt)} - {note.title || "Untitled"}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{note.type}</Text>
          </View>
          <Text style={styles.metaText}>
            Last edited: {formatDateTime(lastEdited)}
          </Text>
        </View>
      </TouchableOpacity>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    width: "100%",
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
