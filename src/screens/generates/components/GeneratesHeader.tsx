import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

export type GenerateTab = "document" | "email";

interface GeneratesHeaderProps {
  patientName: string;
  patientEmail?: string;
  activeTab: GenerateTab;
  onTabChange: (tab: GenerateTab) => void;
}

export default function GeneratesHeader({
  patientName,
  patientEmail,
  activeTab,
  onTabChange,
}: GeneratesHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Document / Email Tab Toggle */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === "document" && styles.tabActive]}
          onPress={() => onTabChange("document")}
        >
          <Ionicons
            name="document-text-outline"
            size={16}
            color={activeTab === "document" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "document" && styles.tabTextActive,
            ]}
          >
            Document
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "email" && styles.tabActive]}
          onPress={() => onTabChange("email")}
        >
          <Ionicons
            name="mail-outline"
            size={16}
            color={activeTab === "email" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "email" && styles.tabTextActive,
            ]}
          >
            Email
          </Text>
        </Pressable>
      </View>

      {/* Patient Info Card */}
      <View style={styles.patientCard}>
        <Text style={styles.patientLabel}>
          To: <Text style={styles.patientName}>{patientName}</Text>
        </Text>
        {!!patientEmail && (
          <Text style={styles.patientEmail}>{patientEmail}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  patientCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  patientLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  patientName: {
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  patientEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
