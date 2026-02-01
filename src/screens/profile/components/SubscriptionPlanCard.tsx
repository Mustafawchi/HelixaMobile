import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface SubscriptionPlanCardProps {
  planName: string;
  planTag?: string;
  details: string;
  onUpgrade?: () => void;
}

export default function SubscriptionPlanCard({
  planName,
  planTag = "Free Plan",
  details,
  onUpgrade,
}: SubscriptionPlanCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="ribbon" size={16} color={COLORS.primary} />
        <Text style={styles.headerText}>Subscription Plan</Text>
      </View>
      <Text style={styles.planName}>{planName}</Text>
      <Text style={styles.planTag}>{planTag}</Text>
      <Text style={styles.details}>{details}</Text>
      <Pressable style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeText}>Upgrade Plan</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
      </Pressable>
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
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  planTag: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  details: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  upgradeButton: {
    marginTop: spacing.md,
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  upgradeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
