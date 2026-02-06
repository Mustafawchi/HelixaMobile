import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import AppPopup from "../../../components/common/AppPopup";

const NOTE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "comprehensive_examination", label: "Comprehensive Examination" },
  { value: "emergency_visit", label: "Emergency Visit" },
  { value: "orthodontics", label: "Orthodontics" },
  { value: "aesthetics", label: "Aesthetics" },
  { value: "wisdom_tooth", label: "Wisdom Tooth Consultation" },
] as const;

export type NoteTypeValue = (typeof NOTE_TYPES)[number]["value"];

interface FilterSortBarProps {
  selectedFilter?: NoteTypeValue;
  onFilterChange?: (filter: NoteTypeValue) => void;
  onSort?: () => void;
}

export default function FilterSortBar({
  selectedFilter = "all",
  onFilterChange,
  onSort,
}: FilterSortBarProps) {
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const selectedLabel = NOTE_TYPES.find((t) => t.value === selectedFilter)?.label || "All Types";
  const isFiltered = selectedFilter !== "all";

  const handleSelectFilter = (value: NoteTypeValue) => {
    onFilterChange?.(value);
    setShowFilterPopup(false);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, isFiltered && styles.buttonActive]}
          onPress={() => setShowFilterPopup(true)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={isFiltered ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.text, isFiltered && styles.textActive]}>
            {isFiltered ? selectedLabel : "Filter"}
          </Text>
          {isFiltered && (
            <TouchableOpacity
              onPress={() => onFilterChange?.("all")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onSort}>
          <Ionicons name="swap-vertical" size={20} color={COLORS.textMuted} />
          <Text style={styles.text}>Sort</Text>
        </TouchableOpacity>
      </View>

      <AppPopup
        visible={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        contentStyle={styles.popup}
      >
        <Text style={styles.popupTitle}>Filter by Type</Text>
        <View style={styles.optionsList}>
          {NOTE_TYPES.map((type) => (
            <Pressable
              key={type.value}
              style={[
                styles.optionItem,
                selectedFilter === type.value && styles.optionItemSelected,
              ]}
              onPress={() => handleSelectFilter(type.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedFilter === type.value && styles.optionTextSelected,
                ]}
              >
                {type.label}
              </Text>
              {selectedFilter === type.value && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </AppPopup>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  buttonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  text: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  textActive: {
    color: COLORS.primary,
  },
  popup: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: spacing.md,
  },
  optionsList: {
    gap: spacing.xs,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.surfaceSecondary,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primaryLighter,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
