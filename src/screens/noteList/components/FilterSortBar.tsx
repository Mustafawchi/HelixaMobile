import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface FilterSortBarProps {
  onFilter?: () => void;
  onSort?: () => void;
}

export default function FilterSortBar({
  onFilter,
  onSort,
}: FilterSortBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onFilter}>
        <Ionicons name="filter" size={20} color={COLORS.textMuted} />
        <Text style={styles.text}>Filter</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onSort}>
        <Ionicons name="swap-vertical" size={20} color={COLORS.textMuted} />
        <Text style={styles.text}>Sort</Text>
      </TouchableOpacity>
    </View>
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
  text: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
});
