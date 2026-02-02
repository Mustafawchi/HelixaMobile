import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../../types/colors";
import { spacing, borderRadius } from "../../theme";
import type { PatientsStackParamList } from "../../types/navigation";
import { useAuth } from "../../hooks/useAuth";
import RichTextEditor from "../../components/common/RichTextEditor";
import ConsultationTemplatePopup from "./components/ConsultationTemplatePopup";
import VoiceRecord from "./components/VoiceRecord";

type NewNoteRoute = RouteProp<PatientsStackParamList, "NewNote">;

type RecordTarget = "consultation" | "procedure";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function buildDefaultNoteHTML(
  practitioner: string,
  patientName: string,
  consultationType: string,
): string {
  const now = new Date();
  return `<h1 style="text-align:center">Patient Note</h1>
<p><strong>Date:</strong> ${formatDate(now)}</p>
<p><strong>Time:</strong> ${formatTime(now)}</p>
<p><strong>Practitioner:</strong> ${practitioner}</p>
<p><strong>Patient:</strong> ${patientName}</p>
<p><strong>Type:</strong> ${consultationType}</p>
<p><strong>Clinical Notes:</strong></p>
<p></p>`;
}

export default function NewNoteScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const route = useRoute<NewNoteRoute>();
  const { consultationTitle, consultationType, patientName } = route.params;
  const { user } = useAuth();

  const practitionerName = user?.displayName || user?.email || "Practitioner";

  const defaultHTML = useMemo(
    () =>
      buildDefaultNoteHTML(practitionerName, patientName, consultationTitle),
    [practitionerName, patientName, consultationTitle],
  );

  const [content, setContent] = useState(defaultHTML);
  const [recordTarget, setRecordTarget] =
    useState<RecordTarget>("consultation");
  const [procedureType, setProcedureType] = useState("Standard Procedure");
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("standard");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{consultationTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Voice Recording & Select What to Record */}
        <View style={styles.card}>
          {/* Recording */}
          <VoiceRecord />

          <View style={styles.sectionDivider} />

          {/* Select What to Record */}
          <View style={styles.tabRow}>
            <Pressable
              style={[
                styles.tab,
                recordTarget === "consultation" && styles.tabActive,
              ]}
              onPress={() => setRecordTarget("consultation")}
            >
              <View
                style={[
                  styles.tabNumber,
                  recordTarget === "consultation" && styles.tabNumberActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabNumberText,
                    recordTarget === "consultation" &&
                      styles.tabNumberTextActive,
                  ]}
                >
                  1
                </Text>
              </View>
              <View style={styles.tabTextGroup}>
                <Text
                  style={[
                    styles.tabTitle,
                    recordTarget === "consultation" && styles.tabTitleActive,
                  ]}
                >
                  Consultation
                </Text>
                <Text style={styles.tabSubtitle} numberOfLines={1}>
                  {consultationTitle}
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                recordTarget === "procedure" && styles.tabActive,
              ]}
              onPress={() => setRecordTarget("procedure")}
            >
              <View
                style={[
                  styles.tabNumber,
                  recordTarget === "procedure" && styles.tabNumberActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabNumberText,
                    recordTarget === "procedure" && styles.tabNumberTextActive,
                  ]}
                >
                  2
                </Text>
              </View>
              <View style={styles.tabTextGroup}>
                <Text
                  style={[
                    styles.tabTitle,
                    recordTarget === "procedure" && styles.tabTitleActive,
                  ]}
                >
                  Procedure
                </Text>
                <Text style={styles.tabSubtitle} numberOfLines={1}>
                  {procedureType}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={18} color={COLORS.info} />
            <Text style={styles.infoBannerText}>
              Press the record button below to record{" "}
              <Text style={styles.infoBannerBold}>{recordTarget}</Text>
            </Text>
          </View>
        </View>

        {/* Rich Text Editor */}
        <View style={styles.editorCard}>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing your note..."
            minHeight={700}
          />
        </View>
      </ScrollView>

      <ConsultationTemplatePopup
        visible={showTemplatePopup}
        onClose={() => setShowTemplatePopup(false)}
        selectedTemplateId={selectedTemplateId}
        onSelect={(template) => setSelectedTemplateId(template.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.sm,
    paddingBottom: spacing.xxl,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: spacing.md,
  },

  // Select What to Record
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  tabNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tabNumberActive: {
    backgroundColor: COLORS.primary,
  },
  tabNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  tabNumberTextActive: {
    color: COLORS.white,
  },
  tabTextGroup: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  tabTitleActive: {
    color: COLORS.primary,
  },
  tabSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.infoLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  infoBannerText: {
    fontSize: 12,
    color: COLORS.info,
    flex: 1,
  },
  infoBannerBold: {
    fontWeight: "700",
  },

  // Editor
  editorCard: {
    marginBottom: spacing.sm,
  },
});
