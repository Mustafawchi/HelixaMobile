import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface RecentActivityCardProps {
  name: string;
  subtitle: string;
}

export default function RecentActivityCard({
  name,
  subtitle,
}: RecentActivityCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="time" size={20} color={COLORS.primary} />
        <Text style={styles.headerText}>Recent Activity</Text>
      </View>
      <View style={styles.activityRow}>
        <View style={styles.avatar}>
          <Ionicons name="briefcase" size={16} color={COLORS.primary} />
        </View>
        <View style={styles.activityText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLighter,
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
