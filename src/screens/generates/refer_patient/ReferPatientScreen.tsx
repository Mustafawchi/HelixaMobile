import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import type { PatientsStackParamList } from "../../../types/navigation";
import GeneratesHeader, {
  type GenerateTab,
} from "../components/GeneratesHeader";
import EmailSubjectField from "../components/EmailSubjectField";
import EmailBodyEditor from "../components/EmailBodyEditor";
import PdfAttachmentEditor from "../components/PdfAttachmentEditor";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { usePdfExport } from "../../../hooks/usePdfExport";
import { useWordExport } from "../../../hooks/useWordExport";
import { composeAndOpenEmail, htmlToPlainText } from "../../../utils/email";

type ReferPatientRoute = RouteProp<PatientsStackParamList, "ReferPatient">;

const PLACEHOLDER_LETTER_HTML =
  "<p>Dear Dr. [Doctor Name],</p>" +
  "<p>I am writing to refer [Patient Name] for your expert consultation.</p>" +
  "<p>Please see the attached clinical notes for further details.</p>" +
  "<p>I would appreciate your professional opinion on this case.</p>" +
  "<p>Kind regards,<br>Dr. [Your Name]</p>";

const DEFAULT_EMAIL_BODY_HTML =
  "<p>Dear Doctor,</p>" +
  "<p>Please find attached a referral letter for the patient.</p>" +
  "<p>Kind regards</p>";

export default function ReferPatientScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const route = useRoute<ReferPatientRoute>();

  const {
    patientName,
    patientEmail,
    generatedContent,
    generatedEmailBody,
    doctorName,
    doctorEmail,
  } = route.params;

  const [activeTab, setActiveTab] = useState<GenerateTab>("document");
  const [letterContent, setLetterContent] = useState(
    generatedContent || PLACEHOLDER_LETTER_HTML,
  );
  const [emailSubject, setEmailSubject] = useState(
    `Patient Referral - ${patientName}`,
  );
  const [emailBody, setEmailBody] = useState(() => {
    if (generatedEmailBody) return generatedEmailBody;
    if (doctorName) {
      return (
        `<p>Dear Dr. ${doctorName},</p>` +
        "<p>Please find attached a referral letter for the patient.</p>" +
        "<p>Kind regards</p>"
      );
    }
    return DEFAULT_EMAIL_BODY_HTML;
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const focusedEditorY = useRef(0);
  const editorPositions = useRef<Record<string, number>>({});
  const { exportPdf, isExporting } = usePdfExport();
  const { exportLetterWord, isExportingWord } = useWordExport();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEditorFocus = useCallback((key: string) => {
    focusedEditorY.current = editorPositions.current[key] || 0;
    if (isKeyboardVisible) {
      scrollRef.current?.scrollTo({ y: focusedEditorY.current, animated: true });
    }
  }, [isKeyboardVisible]);

  const handleSendEmail = useCallback(async () => {
    if (isSendingEmail) return;

    const recipient = (doctorEmail || patientEmail || "").trim();
    if (!recipient) {
      Alert.alert(
        "Missing Email",
        "No recipient email found. Please add an email address first.",
      );
      return;
    }

    try {
      setIsSendingEmail(true);
      await composeAndOpenEmail({
        to: recipient,
        subject: emailSubject,
        body: htmlToPlainText(emailBody),
      });
    } catch (error: any) {
      Alert.alert(
        "Email Error",
        error?.message || "Unable to open an email application.",
      );
    } finally {
      setIsSendingEmail(false);
    }
  }, [isSendingEmail, doctorEmail, patientEmail, emailSubject, emailBody]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: focusedEditorY.current,
          animated: true,
        });
      }, 100);
    });
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Refer Patient</Text>

        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <GeneratesHeader
            patientName={doctorName ? `Dr. ${doctorName}` : patientName}
            patientEmail={doctorEmail || patientEmail}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "document" ? (
            <View
              style={styles.editorSection}
              onLayout={(e) => {
                editorPositions.current.document = e.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.sectionLabel}>Letter Content (PDF/Word)</Text>
              <View style={styles.editorWrapper}>
                <RichTextEditor
                  value={letterContent}
                  onChange={setLetterContent}
                  placeholder="Referral letter content..."
                  minHeight={420}
                  showZoomControls={false}
                  onFocus={() => handleEditorFocus("document")}
                />
              </View>
            </View>
          ) : (
            <View style={styles.editorSection}>
              <EmailSubjectField
                value={emailSubject}
                onChangeText={setEmailSubject}
                placeholder="Email subject"
              />
              <View
                onLayout={(e) => {
                  editorPositions.current.emailBody = e.nativeEvent.layout.y;
                }}
              >
                <EmailBodyEditor
                  value={emailBody}
                  onChange={setEmailBody}
                  placeholder="Email content"
                  minHeight={250}
                  onFocus={() => handleEditorFocus("emailBody")}
                />
              </View>
              <View
                onLayout={(e) => {
                  editorPositions.current.pdfAttachment = e.nativeEvent.layout.y;
                }}
              >
                <PdfAttachmentEditor
                  value={letterContent}
                  onChange={setLetterContent}
                  placeholder="Letter content for PDF attachment"
                  minHeight={350}
                  onFocus={() => handleEditorFocus("pdfAttachment")}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        {!isKeyboardVisible && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: insets.bottom || spacing.sm },
            ]}
          >
            {activeTab === "document" ? (
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.pdfButton, isExporting && { opacity: 0.6 }]}
                  onPress={() => exportPdf(letterContent, `Referral_${patientName}`)}
                  disabled={isExporting}
                >
                  <Ionicons
                    name="document-outline"
                    size={16}
                    color={COLORS.white}
                  />
                  <Text style={styles.buttonText}>
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.wordButton, isExportingWord && { opacity: 0.6 }]}
                  onPress={() =>
                    exportLetterWord(
                      {
                        id: `referral-${Date.now()}`,
                        title: `Referral_${patientName}`,
                        text: letterContent,
                        type: "Referral",
                        createdAt: new Date().toISOString(),
                        lastEdited: new Date().toISOString(),
                      },
                      {
                        folderName: patientName,
                        folderType: "Referral",
                      },
                      `Referral_${patientName}_${new Date()
                        .toISOString()
                        .slice(0, 10)}`,
                    )
                  }
                  disabled={isExportingWord}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={COLORS.white}
                  />
                  <Text style={styles.buttonText}>
                    {isExportingWord ? "Exporting..." : "Export Word"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.sendEmailButton, isSendingEmail && { opacity: 0.6 }]}
                onPress={() => {
                  void handleSendEmail();
                }}
                disabled={isSendingEmail}
              >
                <Ionicons name="send-outline" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>
                  {isSendingEmail ? "Opening..." : "Send Email"}
                </Text>
              </Pressable>
            )}
            <Pressable style={styles.cancelButton} onPress={handleBack}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  flex: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  editorSection: { gap: spacing.sm },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  editorWrapper: { borderRadius: borderRadius.lg, overflow: "hidden" },
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: 6,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonRow: { flexDirection: "row", gap: spacing.sm },
  pdfButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: borderRadius.xl,
    backgroundColor: COLORS.pdf,
    shadowColor: COLORS.pdf,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  wordButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: borderRadius.xl,
    backgroundColor: COLORS.word,
    shadowColor: COLORS.word,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendEmailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: borderRadius.xl,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: spacing.sm,
  },
  buttonText: { fontSize: 14, fontWeight: "700", color: COLORS.white },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: COLORS.border,
    borderRadius: borderRadius.xl,
    marginTop: spacing.sm,
  },
  cancelText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
});
