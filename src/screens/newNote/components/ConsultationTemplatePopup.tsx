import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing } from "../../../theme";

interface Template {
  id: string;
  title: string;
  description: string;
}

interface ConsultationTemplatePopupProps {
  visible: boolean;
  onClose: () => void;
  selectedTemplateId: string;
  onSelect: (template: Template) => void;
  isRegenerating?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "standard",
    title: "Comprehensive Examination",
    description: "Comprehensive exam with all clinical sections",
  },
  {
    id: "emergency",
    title: "Emergency Visit",
    description: "Emergency dental visit documentation",
  },
  {
    id: "clear-aligner",
    title: "Clear Aligner Therapy",
    description: "Orthodontic assessment for clear aligners",
  },
  {
    id: "aesthetics",
    title: "Aesthetics Consultation",
    description: "Cosmetic dental consultation",
  },
  {
    id: "wisdom-tooth",
    title: "Wisdom Tooth",
    description: "Wisdom tooth assessment and planning",
  },
  {
    id: "voice-memo",
    title: "Voice Memo",
    description: "Simple dictation for personal notes",
  },
];

type Tab = "templates" | "custom";

export default function ConsultationTemplatePopup({
  visible,
  onClose,
  selectedTemplateId,
  onSelect,
  isRegenerating = false,
}: ConsultationTemplatePopupProps) {
  const [activeTab, setActiveTab] = useState<Tab>("templates");

  const handleDone = () => {
    onClose();
  };

  const handleTemplatePress = (template: Template) => {
    onSelect(template);
  };

  return (
    <AppPopup visible={visible} onClose={onClose}>
      <Text style={styles.heading}>
        {isRegenerating ? "Regenerate with Template" : "Consultation Template"}
      </Text>
      <Text style={styles.subheading}>
        {isRegenerating
          ? "Select a template to regenerate your note"
          : "Choose how your consultation will be formatted"}
      </Text>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "templates" && styles.tabActive]}
          onPress={() => setActiveTab("templates")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "templates" && styles.tabTextActive,
            ]}
          >
            Templates
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "custom" && styles.tabActive]}
          onPress={() => setActiveTab("custom")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "custom" && styles.tabTextActive,
            ]}
          >
            Custom Templates
          </Text>
        </Pressable>
      </View>

      {/* Template List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {activeTab === "templates" ? (
          TEMPLATES.map((template) => {
            const isSelected = template.id === selectedTemplateId;
            return (
              <Pressable
                key={template.id}
                style={[
                  styles.templateRow,
                  isSelected && styles.templateRowSelected,
                ]}
                onPress={() => handleTemplatePress(template)}
              >
                <View style={styles.templateTextGroup}>
                  <Text
                    style={[
                      styles.templateTitle,
                      isSelected && styles.templateTitleSelected,
                    ]}
                  >
                    {template.title}
                  </Text>
                  <Text style={styles.templateDesc}>
                    {template.description}
                  </Text>
                </View>
                <View style={styles.templateActions}>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={COLORS.white}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyCustom}>
            <Text style={styles.emptyCustomText}>No custom templates yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* Done Button */}
      <View style={styles.footer}>
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>{isRegenerating ? "Cancel" : "Done"}</Text>
        </Pressable>
      </View>
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  list: {
    maxHeight: 360,
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  templateRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  templateTextGroup: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  templateTitleSelected: {
    color: COLORS.primary,
  },
  templateDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  templateActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCustom: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyCustomText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  footer: {
    alignItems: "flex-end",
    marginTop: spacing.md,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  doneText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
});
