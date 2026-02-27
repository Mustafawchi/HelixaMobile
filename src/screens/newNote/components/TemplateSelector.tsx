import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing } from "../../../theme";

export const TEMPLATE_NAMES: Record<string, string> = {
  standard: "Comprehensive Examination",
  emergencyVisit: "Emergency Visit",
  invisalignAssessment: "Clear Aligner Therapy",
  aestheticsConsultation: "Aesthetics Consultation",
  wisdomToothConsult: "Wisdom Tooth",
  voiceMemo: "Voice Memo",
  procedure: "Standard Procedure",
};

interface TemplateSelectorProps {
  selectedTemplateId: string;
  selectedCustomTemplateName: string | null;
  onPress: () => void;
  disabled?: boolean;
  onRegenerate?: () => void;
}

export default function TemplateSelector({
  selectedTemplateId,
  selectedCustomTemplateName,
  onPress,
  disabled = false,
  onRegenerate,
}: TemplateSelectorProps) {
  const displayName =
    selectedTemplateId === "custom" && selectedCustomTemplateName
      ? selectedCustomTemplateName
      : TEMPLATE_NAMES[selectedTemplateId] || "Select Template";

  const isCustom = selectedTemplateId === "custom" && !!selectedCustomTemplateName;

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.container, disabled && styles.containerDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Ionicons
          name="document-text-outline"
          size={16}
          color={disabled ? COLORS.textMuted : COLORS.primary}
        />
        <View style={styles.textGroup}>
          <Text style={styles.label}>Template</Text>
          <Text
            style={[styles.value, disabled && styles.valueDisabled]}
            numberOfLines={1}
          >
            {displayName}
            {isCustom && <Text style={styles.customBadge}> *</Text>}
          </Text>
        </View>
        {!onRegenerate && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={disabled ? COLORS.textMuted : COLORS.textSecondary}
          />
        )}
      </Pressable>
      {onRegenerate && (
        <TouchableOpacity
          style={styles.regenerateButton}
          activeOpacity={0.7}
          onPress={onRegenerate}
        >
          <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: COLORS.primaryLighter,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textMuted,
    marginBottom: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  valueDisabled: {
    color: COLORS.textMuted,
  },
  customBadge: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  regenerateButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
