import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../../components/common/AppCard";
import SwipeableRow from "../../../components/common/SwipeableRow";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import { formatDate, formatDateTime } from "../../../utils/formatting";
import type { Note } from "../../../types/note";

interface NoteCardProps {
  note: Note;
  onPress?: (note: Note) => void;
  onLongPress?: (note: Note) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}

export default function NoteCard({
  note,
  onPress,
  onLongPress,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const lastEdited = note.lastEdited || note.updatedAt || note.createdAt;

  const handlePress = () => {
    if (selectionMode) {
      onToggleSelect?.(note);
    } else {
      onPress?.(note);
    }
  };

  return (
    <SwipeableRow
      onEdit={!selectionMode ? () => onEdit?.(note) : undefined}
      onDelete={!selectionMode ? () => onDelete?.(note) : undefined}
    >
      <AppCard>
        <TouchableOpacity
          style={styles.container}
          onPress={handlePress}
          onLongPress={() => onLongPress?.(note)}
          activeOpacity={0.5}
          delayLongPress={400}
        >
          {selectionMode && (
            <View style={styles.checkboxContainer}>
              <View
                style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                )}
              </View>
            </View>
          )}

          <View style={styles.contentArea}>
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
          </View>
        </TouchableOpacity>
      </AppCard>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
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
  checkboxContainer: {
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  contentArea: {
    flex: 1,
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
