import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
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
import { useStreamingAudioUpload } from "../../hooks/useStreamingAudioUpload";
import { useCreateNote } from "../../hooks/mutations/useCreateNote";
import { useAutoMedicalHistorySync } from "../../hooks/mutations/useAutoMedicalHistorySync";
import { getConsultationLabelColor } from "../../types/note";
import RichTextEditor from "../../components/common/RichTextEditor";
import ConsultationTemplatePopup from "./components/ConsultationTemplatePopup";
import VoiceRecord from "./components/VoiceRecord";
import ProcessingOverlay from "./components/ProcessingOverlay";
import SaveButton from "./components/SaveButton";
import type { AudioRecordingResult } from "../../types/audio";

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
  const {
    patientId,
    consultationTitle,
    consultationType,
    consultationLabelColor,
    patientName,
  } = route.params;
  const { user } = useAuth();
  const createNote = useCreateNote();
  const autoMedicalHistorySync = useAutoMedicalHistorySync();

  const practitionerName = user?.displayName || user?.email || "Practitioner";

  const defaultHTML = useMemo(
    () =>
      buildDefaultNoteHTML(practitionerName, patientName, consultationTitle),
    [practitionerName, patientName, consultationTitle],
  );

  const [content, setContent] = useState(defaultHTML);
  const [recordTarget, setRecordTarget] =
    useState<RecordTarget>("consultation");
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("standard");
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [consultationRecorded, setConsultationRecorded] = useState(false);
  const [procedureRecorded, setProcedureRecorded] = useState(false);

  // Track base content before streaming starts
  const baseContentRef = useRef(content);

  // Streaming audio upload hook
  const streamingUpload = useStreamingAudioUpload({
    onComplete: (generatedContent) => {
      console.log("[NewNoteScreen] Streaming complete, content length:", generatedContent.length);
      setContent(baseContentRef.current + generatedContent);
      // Mark the recorded section as completed
      if (recordTarget === "consultation") setConsultationRecorded(true);
      if (recordTarget === "procedure") setProcedureRecorded(true);
    },
    onError: (error) => {
      console.error("[NewNoteScreen] Streaming error:", error);
      Alert.alert(
        "Processing Failed",
        error.message || "Could not process the recording. Please try again.",
      );
    },
  });

  const handleRecordingComplete = useCallback(
    async (result: AudioRecordingResult) => {
      console.log("[NewNoteScreen] Recording complete:", result);

      // Save current content as base before streaming
      baseContentRef.current = content;

      // Start streaming upload
      try {
        await streamingUpload.upload({
          fileUri: result.uri,
          templateId: selectedTemplateId,
          patientId,
          consultationType,
          recordTarget,
        });
      } catch (error) {
        // Error is already handled in onError callback
        console.log("[NewNoteScreen] Upload error handled");
      }
    },
    [content, streamingUpload, selectedTemplateId, patientId, consultationType, recordTarget],
  );

  const handleCancelProcessing = useCallback(() => {
    streamingUpload.cancel();
    // Restore base content if canceled
    setContent(baseContentRef.current);
  }, [streamingUpload]);

  const showProcessingOverlay = streamingUpload.isUploading;

  const handleEditorInteraction = useCallback(() => {
    setShowSaveButton(true);
  }, []);

  const handleSavePress = useCallback(() => {
    if (createNote.isPending) return;
    createNote
      .mutateAsync({
        patientId,
        title: consultationTitle,
        text: content,
        type: consultationType,
        labelColor: getConsultationLabelColor(
          consultationType,
          consultationLabelColor,
        ),
      })
      .then(() => {
        autoMedicalHistorySync.mutate(
          { patientId },
          {
            onError: (error) => {
              console.log(
                "[MedicalHistorySync] Auto sync after new note save failed:",
                error,
              );
            },
          },
        );
        Alert.alert("Saved", "Your note has been saved.");
        navigation.goBack();
      })
      .catch((error) => {
        Alert.alert(
          "Save Failed",
          error?.message || "Could not save the note. Please try again.",
        );
      });
  }, [
    createNote,
    patientId,
    consultationTitle,
    content,
    consultationType,
    navigation,
  ]);

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
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {/* Controls section */}
        <View style={styles.card}>
          <VoiceRecord
            isUploading={streamingUpload.isUploading}
            onRecordingComplete={handleRecordingComplete}
            onMicPress={() => setShowSaveButton(true)}
          />

          <View style={styles.sectionDivider} />

          <View style={styles.tabRow}>
            <Pressable
              style={[
                styles.tab,
                recordTarget === "consultation" && !consultationRecorded && styles.tabSelected,
                consultationRecorded && styles.tabCompleted,
              ]}
              onPress={() => !consultationRecorded && setRecordTarget("consultation")}
              disabled={consultationRecorded}
            >
              <View
                style={[
                  styles.tabNumber,
                  consultationRecorded && styles.tabNumberCompleted,
                ]}
              >
                {consultationRecorded ? (
                  <Ionicons name="checkmark" size={12} color="#166534" />
                ) : (
                  <Text style={styles.tabNumberText}>1</Text>
                )}
              </View>
              <View style={styles.tabTextGroup}>
                <Text style={styles.tabTitle}>Consultation</Text>
                {consultationRecorded && (
                  <View style={styles.tabStatusRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#166534" />
                    <Text style={styles.tabStatusText}>Recorded</Text>
                  </View>
                )}
              </View>
              {recordTarget === "consultation" && !consultationRecorded && (
                <View style={styles.tabIndicator} />
              )}
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                recordTarget === "procedure" && !procedureRecorded && styles.tabSelected,
                procedureRecorded && styles.tabCompleted,
              ]}
              onPress={() => !procedureRecorded && setRecordTarget("procedure")}
              disabled={procedureRecorded}
            >
              <View
                style={[
                  styles.tabNumber,
                  procedureRecorded && styles.tabNumberCompleted,
                ]}
              >
                {procedureRecorded ? (
                  <Ionicons name="checkmark" size={12} color="#166534" />
                ) : (
                  <Text style={styles.tabNumberText}>2</Text>
                )}
              </View>
              <View style={styles.tabTextGroup}>
                <Text style={styles.tabTitle}>Procedure</Text>
                {procedureRecorded && (
                  <View style={styles.tabStatusRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#166534" />
                    <Text style={styles.tabStatusText}>Recorded</Text>
                  </View>
                )}
              </View>
              {recordTarget === "procedure" && !procedureRecorded && (
                <View style={[styles.tabIndicator, styles.tabIndicatorBlue]} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Editor with fixed height for scrollable page */}
        <View
          style={styles.editorWrapper}
          onStartShouldSetResponderCapture={() => {
            handleEditorInteraction();
            return false;
          }}
        >
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing your note..."
            minHeight={Math.round(Dimensions.get("window").height * 0.75)}
          />
        </View>
      </ScrollView>

      {showSaveButton && (
        <SaveButton
          onPress={handleSavePress}
          loading={createNote.isPending}
          style={[styles.saveButton, { bottom: insets.bottom + spacing.md }]}
        />
      )}

      {/* Processing Overlay */}
      {showProcessingOverlay && (
        <ProcessingOverlay
          phase={streamingUpload.state.phase}
          phaseText={streamingUpload.phaseText}
          progress={streamingUpload.state.progress}
          onCancel={handleCancelProcessing}
        />
      )}

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
  saveButton: {
    position: "absolute",
    right: spacing.md,
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
  editorWrapper: {
    marginTop: spacing.sm,
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

  // Section Selection Tabs
  tabRow: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  tabSelected: {
    borderColor: "#9ca3af",
  },
  tabCompleted: {
    backgroundColor: "#fafafa",
    borderColor: "#d1d5db",
  },
  tabNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  tabNumberCompleted: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  tabNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextGroup: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  tabStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  tabStatusText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#166534",
  },
  tabIndicator: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  tabIndicatorBlue: {
    backgroundColor: "#3b82f6",
  },

});
