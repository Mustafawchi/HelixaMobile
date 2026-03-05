import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing } from "../../../theme";
import type { CustomTemplate } from "../../../types/user";

interface Template {
  id: string;
  title: string;
  description: string;
}

type Section = "consultation" | "procedure";

interface ConsultationTemplatePopupProps {
  visible: boolean;
  onClose: () => void;
  section?: Section;
  selectedTemplateId: string;
  selectedCustomInstructions: string | null;
  onSelect: (template: Template) => void;
  onSelectCustom: (template: CustomTemplate) => void;
  onSelectNone?: () => void;
  customTemplates: CustomTemplate[];
  onOpenCreateCustomTemplate: () => void;
  onEditCustomTemplate: (template: CustomTemplate) => void;
  onDeleteCustomTemplate: (templateId: string) => void;
  isRegenerating?: boolean;
}

const CONSULTATION_TEMPLATES: Template[] = [
  {
    id: "standard",
    title: "Comprehensive Examination",
    description: "Comprehensive exam with all clinical sections",
  },
  {
    id: "emergencyVisit",
    title: "Emergency Visit",
    description: "Emergency dental visit documentation",
  },
  {
    id: "invisalignAssessment",
    title: "Clear Aligner Therapy",
    description: "Orthodontic assessment for clear aligners",
  },
  {
    id: "aestheticsConsultation",
    title: "Aesthetics Consultation",
    description: "Cosmetic dental consultation",
  },
  {
    id: "wisdomToothConsult",
    title: "Wisdom Tooth",
    description: "Wisdom tooth assessment and planning",
  },
  {
    id: "voiceMemo",
    title: "Voice Memo",
    description: "Simple dictation for personal notes",
  },
];

const PROCEDURE_TEMPLATES: Template[] = [
  {
    id: "procedure",
    title: "Standard Procedure",
    description: "General procedure documentation",
  },
];

type Tab = "templates" | "custom";

export default function ConsultationTemplatePopup({
  visible,
  onClose,
  section = "consultation",
  selectedTemplateId,
  selectedCustomInstructions,
  onSelect,
  onSelectCustom,
  onSelectNone,
  customTemplates,
  onOpenCreateCustomTemplate,
  onEditCustomTemplate,
  onDeleteCustomTemplate,
  isRegenerating = false,
}: ConsultationTemplatePopupProps) {
  const [activeTab, setActiveTab] = useState<Tab>("templates");

  const isProcedure = section === "procedure";
  const builtinTemplates = isProcedure ? PROCEDURE_TEMPLATES : CONSULTATION_TEMPLATES;
  const sectionLabel = isProcedure ? "Procedure" : "Consultation";

  const handleDone = () => {
    onClose();
  };

  const handleTemplatePress = (template: Template) => {
    onSelect(template);
  };

  const handleDeletePress = (templateId: string) => {
    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this custom template?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteCustomTemplate(templateId),
        },
      ],
    );
  };

  return (
    <AppPopup visible={visible} onClose={onClose}>
      <Text style={styles.heading}>
        {isRegenerating ? `Regenerate ${sectionLabel}` : `${sectionLabel} Template`}
      </Text>
      <Text style={styles.subheading}>
        {isRegenerating
          ? `Select a template to regenerate your ${section} notes`
          : isProcedure
            ? "Choose how your procedure will be documented"
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
          {customTemplates.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{customTemplates.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Template List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {activeTab === "templates" ? (
          <View>
            {/* None option for procedure */}
            {isProcedure && onSelectNone && (
              <Pressable
                style={[
                  styles.templateRow,
                  selectedTemplateId === "" && !selectedCustomInstructions && styles.templateRowSelected,
                ]}
                onPress={onSelectNone}
              >
                <View style={styles.templateTextGroup}>
                  <Text
                    style={[
                      styles.templateTitle,
                      selectedTemplateId === "" && !selectedCustomInstructions && styles.templateTitleSelected,
                    ]}
                  >
                    None (Skip Procedure)
                  </Text>
                  <Text style={styles.templateDesc}>
                    Record consultation only, no procedure notes
                  </Text>
                </View>
                <View style={styles.templateActions}>
                  {selectedTemplateId === "" && !selectedCustomInstructions && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    </View>
                  )}
                </View>
              </Pressable>
            )}

            {builtinTemplates.map((template) => {
              const isSelected =
                template.id === selectedTemplateId && !selectedCustomInstructions;
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
            })}
          </View>
        ) : (
          <View>
            {customTemplates.length > 0 ? (
              customTemplates.map((template) => {
                const isSelected =
                  selectedTemplateId === "custom" &&
                  selectedCustomInstructions === template.prompt;
                return (
                  <View
                    key={template.id}
                    style={[
                      styles.templateRow,
                      isSelected && styles.templateRowSelected,
                    ]}
                  >
                    <Pressable
                      style={styles.customTemplateSelectArea}
                      onPress={() => onSelectCustom(template)}
                    >
                      <Text
                        style={[
                          styles.templateTitle,
                          isSelected && styles.templateTitleSelected,
                        ]}
                      >
                        {template.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkCircle}>
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={COLORS.white}
                          />
                        </View>
                      )}
                    </Pressable>
                    <View style={styles.customActions}>
                      <Pressable
                        style={styles.editButton}
                        onPress={() => onEditCustomTemplate(template)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => handleDeletePress(template.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={COLORS.error}
                        />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyCustom}>
                <Text style={styles.emptyCustomText}>
                  You haven't created any custom {isProcedure ? "procedure" : ""} templates yet.
                </Text>
                <Text style={styles.emptyCustomText}>
                  Create your own template to personalize how your {isProcedure ? "procedures are" : "consultations are"} formatted.
                </Text>
              </View>
            )}

            {/* Create Custom Template Button */}
            <Pressable
              style={styles.createButton}
              onPress={onOpenCreateCustomTemplate}
            >
              <Ionicons name="add" size={18} color={COLORS.primary} />
              <Text style={styles.createButtonText}>
                Create Custom Template
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Done Button */}
      <View style={styles.footer}>
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>
            {isRegenerating ? "Cancel" : "Done"}
          </Text>
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
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
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
  tabBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
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
  customTemplateSelectArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  customActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  emptyCustom: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyCustomText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 4,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: borderRadius.md,
    borderStyle: "dashed",
    marginTop: spacing.sm,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
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
