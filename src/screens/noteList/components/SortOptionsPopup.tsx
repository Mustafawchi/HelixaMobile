import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SortPopup from "../../../components/common/SortPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing } from "../../../theme";

export type NoteSortKey =
  | "created-desc"
  | "created-asc"
  | "edited-desc"
  | "edited-asc"
  | "title-asc"
  | "title-desc";

interface SortOptionsPopupProps {
  visible: boolean;
  selected: NoteSortKey;
  onSelect: (key: NoteSortKey) => void;
  onClose: () => void;
}

const OPTIONS: { key: NoteSortKey; label: string }[] = [
  { key: "created-desc", label: "Date Created (Newest)" },
  { key: "created-asc", label: "Date Created (Oldest)" },
  { key: "edited-desc", label: "Last Edited (Newest)" },
  { key: "edited-asc", label: "Last Edited (Oldest)" },
  { key: "title-asc", label: "Title (A-Z)" },
  { key: "title-desc", label: "Title (Z-A)" },
];

export default function SortOptionsPopup({
  visible,
  selected,
  onSelect,
  onClose,
}: SortOptionsPopupProps) {
  return (
    <SortPopup visible={visible} onClose={onClose} title="Sort">
      <Text style={styles.sectionLabel}>Sort by:</Text>
      <View style={styles.list}>
        {OPTIONS.map((option) => {
          const isActive = selected === option.key;
          return (
            <Pressable
              key={option.key}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => onSelect(option.key)}
            >
              <Text
                style={[styles.optionText, isActive && styles.optionTextActive]}
              >
                {option.label}
              </Text>
              {isActive && (
                <Ionicons name="checkmark" size={18} color={COLORS.primary} />
              )}
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.doneButton} onPress={onClose}>
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </SortPopup>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  optionTextActive: {
    color: COLORS.primary,
  },
  doneButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
