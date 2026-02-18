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
  ActionSheetIOS,
  Linking,
} from "react-native";
import * as Sharing from "expo-sharing";
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
import * as MailComposer from "expo-mail-composer";
import { htmlToPlainText } from "../../../utils/email";
import ExportPdfButton from "../../../components/common/ExportPdfButton";
import ExportWordButton from "../../../components/common/ExportWordButton";

type SummaryRoute = RouteProp<PatientsStackParamList, "SummaryToPatient">;

const PLACEHOLDER_LETTER_HTML =
  "<p>Dear [Patient Name],</p>" +
  "<p>Thank you for visiting us at our practice.</p>" +
  "<p>During your recent visit, we discussed your condition and treatment options. Please feel free to reach out if you have any questions or need further assistance.</p>" +
  "<p>Kind regards,<br>Dr. [Your Name]</p>";

const DEFAULT_EMAIL_BODY_HTML =
  "<p>Dear Patient,</p>" +
  "<p>Please find attached a summary of your recent visit.</p>" +
  "<p>Kind regards</p>";

export default function SummaryToPatientScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const route = useRoute<SummaryRoute>();

  const { patientName, patientEmail, generatedContent, generatedEmailBody } =
    route.params;

  const [activeTab, setActiveTab] = useState<GenerateTab>("document");
  const [letterContent, setLetterContent] = useState(
    generatedContent || PLACEHOLDER_LETTER_HTML,
  );
  const [emailSubject, setEmailSubject] = useState(
    `Your Recent Visit Summary - ${patientName}`,
  );
  const [emailBody, setEmailBody] = useState(
    generatedEmailBody || DEFAULT_EMAIL_BODY_HTML,
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const focusedEditorY = useRef(0);
  const editorPositions = useRef<Record<string, number>>({});
  const { exportPdfViaServer, createPdfFileViaServer, isServerExporting } =
    usePdfExport();
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

    const recipient = patientEmail?.trim();
    if (!recipient) {
      Alert.alert(
        "Missing Email",
        "No patient email found. Please add an email address first.",
      );
      return;
    }

    try {
      setIsSendingEmail(true);

      const attachmentUri = await createPdfFileViaServer(
        letterContent,
        `Summary_${patientName}_${new Date().toISOString().slice(0, 10)}`,
      );

      const EMAIL_APPS = [
        { label: "Mail", scheme: "mailto:test@test.com", type: "mail" as const },
        { label: "Gmail", scheme: "googlegmail://co?to=test@test.com", type: "gmail" as const },
        { label: "Outlook", scheme: "ms-outlook://compose?to=test@test.com", type: "outlook" as const },
        { label: "Yahoo Mail", scheme: "ymail://mail/compose?to=test@test.com", type: "yahoo" as const },
        { label: "Spark", scheme: "readdle-spark://compose?recipient=test@test.com", type: "spark" as const },
      ];

      const availability = await Promise.all(
        EMAIL_APPS.map(async (app) => ({
          ...app,
          available: await Linking.canOpenURL(app.scheme),
        })),
      );
      const availableApps = availability.filter((a) => a.available);

      if (availableApps.length === 0) {
        Alert.alert("Email Unavailable", "No email app is configured on this device.");
        return;
      }

      const openWithApp = async (type: typeof EMAIL_APPS[number]["type"]) => {
        const encodedTo = encodeURIComponent(recipient ?? "");
        const encodedSubject = encodeURIComponent(emailSubject);
        const encodedBody = encodeURIComponent(htmlToPlainText(emailBody));

        if (type === "mail") {
          const isMailAvailable = await MailComposer.isAvailableAsync();
          if (isMailAvailable) {
            await MailComposer.composeAsync({
              recipients: recipient ? [recipient] : [],
              subject: emailSubject,
              body: htmlToPlainText(emailBody),
              attachments: [attachmentUri],
            });
            return;
          }
        }

        const urlMap: Record<string, string> = {
          gmail: `googlegmail://co?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`,
          outlook: `ms-outlook://compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`,
          yahoo: `ymail://mail/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`,
          spark: `readdle-spark://compose?recipient=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`,
        };

        const url = urlMap[type];
        if (url) {
          await Linking.openURL(url);
        }

        await Sharing.shareAsync(attachmentUri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: emailSubject,
        });
      };

      if (availableApps.length === 1) {
        await openWithApp(availableApps[0].type);
        return;
      }

      const options = [...availableApps.map((a) => a.label), "Cancel"];
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1, title: "Choose Email App" },
        (idx) => {
          if (idx < availableApps.length) {
            void openWithApp(availableApps[idx].type);
          }
        },
      );
    } catch (error: any) {
      Alert.alert(
        "Email Error",
        error?.message || "Unable to open an email application.",
      );
    } finally {
      setIsSendingEmail(false);
    }
  }, [
    isSendingEmail,
    patientEmail,
    emailSubject,
    emailBody,
    createPdfFileViaServer,
    letterContent,
    patientName,
  ]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: focusedEditorY.current, animated: true });
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

        <Text style={styles.topBarTitle}>Summary to Patient</Text>

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
            patientName={patientName}
            patientEmail={patientEmail}
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
                  placeholder="Patient summary letter content..."
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
              { paddingTop: spacing.xs, paddingBottom: spacing.xs },
            ]}
          >
            {activeTab === "document" ? (
              <View style={styles.buttonRow}>
                <ExportPdfButton
                  onPress={() =>
                    exportPdfViaServer(letterContent, `Summary_${patientName}`)
                  }
                  isExporting={isServerExporting}
                  variant="outlined"
                />
                <ExportWordButton
                  onPress={() =>
                    exportLetterWord(
                      {
                        id: `summary-${Date.now()}`,
                        title: `Summary_${patientName}`,
                        text: letterContent,
                        type: "Patient Summary",
                        createdAt: new Date().toISOString(),
                        lastEdited: new Date().toISOString(),
                      },
                      {
                        folderName: patientName,
                        folderType: "Summary",
                      },
                      `PatientLetter_${patientName}_${new Date()
                        .toISOString()
                        .slice(0, 10)}`,
                    )
                  }
                  isExporting={isExportingWord}
                  variant="outlined"
                />
              </View>
            ) : (
              <Pressable
                style={[styles.sendEmailButton, isSendingEmail && { opacity: 0.6 }]}
                onPress={() => {
                  void handleSendEmail();
                }}
                disabled={isSendingEmail}
              >
                <Ionicons name="send-outline" size={16} color={COLORS.primary} />
                <Text style={styles.buttonText}>
                  {isSendingEmail ? "Opening..." : "Send Email"}
                </Text>
              </Pressable>
            )}
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
    paddingBottom: spacing.sm,
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
    gap: spacing.xs,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonRow: { flexDirection: "row", gap: spacing.sm },
  sendEmailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "transparent",
    marginTop: 0,
  },
  buttonText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
});
