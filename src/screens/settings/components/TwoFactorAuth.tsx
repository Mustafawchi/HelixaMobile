import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS, spacing, borderRadius } from "../../../theme";
import { useUser } from "../../../hooks/queries/useUser";
import {
  useGenerateTotpSecret,
  useVerifyAndEnableTwoFactor,
  useDisableTwoFactor,
} from "../../../hooks/mutations/useTwoFactor";

type Step = "setup" | "verify" | "backup";

function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

export default function TwoFactorAuth() {
  const queryClient = useQueryClient();
  const { data: userProfile } = useUser();
  const isEnabled = !!userProfile?.twoFactorEnabled;

  const [showSetup, setShowSetup] = useState(false);
  const [step, setStep] = useState<Step>("setup");
  const [totpSecret, setTotpSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const generateSecret = useGenerateTotpSecret();
  const enableTwoFactor = useVerifyAndEnableTwoFactor();
  const disableTwoFactor = useDisableTwoFactor();

  useEffect(() => {
    if (!showSetup) return;
    if (totpSecret || generateSecret.isPending) return;
    generateSecret
      .mutateAsync()
      .then((data) => {
        setTotpSecret(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
      })
      .catch((error: unknown) => {
        Alert.alert(
          "2FA Setup",
          (error as Error)?.message || "Failed to generate secret.",
        );
        setShowSetup(false);
      });
  }, [showSetup, totpSecret, generateSecret]);

  const handleCopySecret = async () => {
    await Clipboard.setStringAsync(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = async () => {
    await Clipboard.setStringAsync(backupCodes.join("\n"));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleOpenAuthenticator = async () => {
    if (!qrCodeUrl) return;
    try {
      const supported = await Linking.canOpenURL(qrCodeUrl);
      if (supported) {
        await Linking.openURL(qrCodeUrl);
      } else {
        Alert.alert(
          "No Authenticator App",
          "Install Google Authenticator or Authy, then try again.",
        );
      }
    } catch {
      Alert.alert("Error", "Could not open authenticator app.");
    }
  };

  const handleVerify = async () => {
    if (!totpSecret || verificationCode.trim().length !== 6) return;
    try {
      const result = await enableTwoFactor.mutateAsync({
        totpSecret,
        verificationCode: verificationCode.trim(),
      });
      setBackupCodes(result.backupCodes || []);
      setStep("backup");
      await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    } catch (error: unknown) {
      Alert.alert(
        "Verification Failed",
        (error as Error)?.message || "Invalid code. Please try again.",
      );
    }
  };

  const handleDisable = () => {
    Alert.alert(
      "Disable Two-Factor Authentication",
      "Your account will only be protected by email verification. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: async () => {
            try {
              await disableTwoFactor.mutateAsync();
              await queryClient.invalidateQueries({
                queryKey: ["user", "profile"],
              });
            } catch (error: unknown) {
              Alert.alert(
                "Error",
                (error as Error)?.message || "Failed to disable 2FA.",
              );
            }
          },
        },
      ],
    );
  };

  const closeSetup = () => {
    setShowSetup(false);
    setStep("setup");
    setTotpSecret("");
    setQrCodeUrl("");
    setVerificationCode("");
    setBackupCodes([]);
    setCopiedSecret(false);
    setCopiedBackup(false);
  };

  /* ── Step 1: Instructions ── */
  const renderSetupStep = () => (
    <>
      {generateSecret.isPending ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginVertical: spacing.xl }}
        />
      ) : (
        <>
          {/* 1. Download */}
          <Text style={styles.instrNumber}>
            1. Download an authentication app
          </Text>
          <Text style={styles.instrDesc}>
            We recommend downloading Google Authenticator or Authy if you don't
            have one installed.
          </Text>

          {/* 2. Copy key or open app */}
          <Text style={styles.instrNumber}>
            2. Copy the key or add it to your app
          </Text>
          <Text style={styles.instrDesc}>
            Copy the key below and paste it in the authentication app, or tap
            "Add to App" to open it directly.
          </Text>

          <Text style={styles.secretKeyDisplay} selectable>
            {formatSecret(totpSecret)}
          </Text>

          <Pressable style={styles.outlineButton} onPress={handleCopySecret}>
            <Ionicons
              name={copiedSecret ? "checkmark" : "copy-outline"}
              size={16}
              color={copiedSecret ? COLORS.success : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.outlineButtonText,
                copiedSecret && { color: COLORS.success },
              ]}
            >
              {copiedSecret ? "Copied!" : "Copy key"}
            </Text>
          </Pressable>

          {!!qrCodeUrl && (
            <Pressable
              style={styles.outlineButton}
              onPress={handleOpenAuthenticator}
            >
              <Ionicons
                name="open-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.outlineButtonText}>Add to App</Text>
            </Pressable>
          )}

          {/* 3. Enter code */}
          <Text style={styles.instrNumber}>3. Enter the 6-digit code</Text>
          <Text style={styles.instrDesc}>
            After the key has been added, your authentication app will generate
            a 6-digit code. Tap "Next" to enter it.
          </Text>
        </>
      )}

      <Pressable
        style={[
          styles.nextButton,
          generateSecret.isPending && styles.buttonDisabled,
        ]}
        onPress={() => setStep("verify")}
        disabled={generateSecret.isPending}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>

      <Pressable style={styles.textButton} onPress={closeSetup}>
        <Text style={styles.textButtonLabel}>Cancel</Text>
      </Pressable>
    </>
  );

  /* ── Step 2: Enter code ── */
  const renderVerifyStep = () => (
    <>
      <Text style={styles.instrNumber}>Enter code</Text>
      <Text style={styles.instrDesc}>
        Enter the 6-digit code generated by your authentication app.
      </Text>

      <TextInput
        style={styles.codeInput}
        value={verificationCode}
        onChangeText={(t) => setVerificationCode(t.replace(/\D/g, ""))}
        placeholder="Enter code"
        keyboardType="number-pad"
        maxLength={6}
        placeholderTextColor={COLORS.textMuted}
        autoFocus
      />

      <Pressable
        style={[
          styles.nextButton,
          (verificationCode.length !== 6 || enableTwoFactor.isPending) &&
            styles.buttonDisabled,
        ]}
        onPress={handleVerify}
        disabled={verificationCode.length !== 6 || enableTwoFactor.isPending}
      >
        <Text style={styles.nextButtonText}>
          {enableTwoFactor.isPending ? "Verifying..." : "Next"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.textButton}
        onPress={() => {
          setVerificationCode("");
          setStep("setup");
        }}
        disabled={enableTwoFactor.isPending}
      >
        <Ionicons name="arrow-back" size={14} color={COLORS.textMuted} />
        <Text style={styles.textButtonLabel}>Back</Text>
      </Pressable>
    </>
  );

  /* ── Step 3: Backup codes ── */
  const renderBackupStep = () => (
    <>
      <View style={styles.successBadge}>
        <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
      </View>
      <Text style={styles.popupTitle}>2FA Enabled</Text>
      <Text style={styles.instrDesc}>
        Save these backup codes in a safe place. Each code can only be used once
        if you lose access to your authenticator app.
      </Text>

      <View style={styles.backupBox}>
        <View style={styles.backupGrid}>
          {backupCodes.map((code) => (
            <View key={code} style={styles.backupCodeItem}>
              <Text style={styles.backupCode}>{code}</Text>
            </View>
          ))}
        </View>
        <Pressable style={styles.copyAllRow} onPress={handleCopyBackupCodes}>
          <Ionicons
            name={copiedBackup ? "checkmark" : "copy-outline"}
            size={16}
            color={copiedBackup ? COLORS.success : COLORS.primary}
          />
          <Text
            style={[
              styles.copyAllText,
              copiedBackup && { color: COLORS.success },
            ]}
          >
            {copiedBackup ? "Copied!" : "Copy All"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="warning" size={16} color="#d97706" />
        <Text style={styles.warningText}>
          You won't be able to see these codes again.
        </Text>
      </View>

      <Pressable style={styles.nextButton} onPress={closeSetup}>
        <Text style={styles.nextButtonText}>Done</Text>
      </Pressable>
    </>
  );

  return (
    <>
      <Pressable
        style={styles.row}
        onPress={isEnabled ? handleDisable : () => setShowSetup(true)}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={isEnabled ? COLORS.success : COLORS.primary}
          />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Two-Factor Authentication</Text>
          <Text style={styles.rowSubtitle}>
            {isEnabled
              ? "Enabled for your account"
              : "Add an extra layer of security"}
          </Text>
        </View>
        <Text style={[styles.actionText, isEnabled && { color: COLORS.error }]}>
          {isEnabled ? "Disable" : "Enable"}
        </Text>
      </Pressable>

      <AppPopup
        visible={showSetup}
        onClose={closeSetup}
        contentStyle={styles.popupContent}
      >
        <ScrollView
          style={styles.popupScroll}
          contentContainerStyle={styles.popupBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.popupHeader}>
            <View style={styles.popupIconCircle}>
              <Ionicons
                name="shield-checkmark"
                size={22}
                color={COLORS.primary}
              />
            </View>
            {step !== "backup" && (
              <Text style={styles.popupTitle}>Instructions for setup</Text>
            )}
          </View>

          {step === "setup" && renderSetupStep()}
          {step === "verify" && renderVerifyStep()}
          {step === "backup" && renderBackupStep()}
        </ScrollView>
      </AppPopup>
    </>
  );
}

const styles = StyleSheet.create({
  /* ── Settings row ── */
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  rowSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  /* ── Popup shell ── */
  popupContent: {
    padding: spacing.lg,
  },
  popupScroll: {
    maxHeight: 560,
  },
  popupBody: {
    paddingBottom: spacing.sm,
  },
  popupHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  popupIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },

  /* ── Instruction steps ── */
  instrNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    alignSelf: "flex-start",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  instrDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },

  /* ── Secret key display ── */
  secretKeyDisplay: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: 1,
    lineHeight: 28,
    textAlign: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    width: "100%",
  },

  /* ── Outline buttons (Copy key, Add to App) ── */
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
    paddingVertical: 11,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: spacing.sm,
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  /* ── Code input ── */
  codeInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },

  /* ── Primary action (Next) ── */
  nextButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  /* ── Text button (Cancel / Back) ── */
  textButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  textButtonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  /* ── Backup codes ── */
  successBadge: {
    alignSelf: "center",
    marginBottom: spacing.xs,
  },
  backupBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: COLORS.surface,
    marginBottom: spacing.md,
  },
  backupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  backupCodeItem: {
    width: "48%",
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  backupCode: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  copyAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: spacing.xs,
  },
  copyAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  /* ── Warning ── */
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: "#fef3c7",
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: "#92400e",
    lineHeight: 16,
  },
});
