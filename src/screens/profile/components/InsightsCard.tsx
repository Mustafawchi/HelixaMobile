import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface InsightItem {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  text: string;
}

interface InsightsCardProps {
  items: InsightItem[];
}

export default function InsightsCard({ items }: InsightsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={20} color={COLORS.primary} />
        <Text style={styles.headerText}>Insights</Text>
      </View>
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={`${item.text}-${index}`} style={styles.row}>
            <Ionicons name={item.icon} size={16} color={item.color} />
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
