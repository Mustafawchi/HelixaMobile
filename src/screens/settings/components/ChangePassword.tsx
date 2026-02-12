import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPopup from "../../../components/common/AppPopup";
import { COLORS, spacing, borderRadius } from "../../../theme";
import { firebaseAuth } from "../../../config/firebase";
import { usePasswordReset } from "../../../hooks/mutations/usePasswordReset";

export default function ChangePassword() {
  const [visible, setVisible] = useState(false);
  const { mutateAsync, isPending } = usePasswordReset();
  const email = firebaseAuth.currentUser?.email || "";

  const requirements = useMemo(
    () => [
      "At least 8 characters long",
      "At least one uppercase letter (A-Z)",
      "At least one lowercase letter (a-z)",
      "At least one number (0-9)",
      "Special characters recommended",
    ],
    [],
  );

  const handleSendEmail = async () => {
    try {
      await mutateAsync({ email });
      Alert.alert(
        "Email sent",
        `We've sent a password reset link to ${email}.`,
      );
      setVisible(false);
    } catch (error: unknown) {
      let message = "Failed to send reset email. Please try again.";
      const firebaseError = error as { code?: string; message?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found":
          message = "Account not found. Please contact support.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your connection and try again.";
          break;
        default:
          if (firebaseError.message) message = firebaseError.message;
          break;
      }
      Alert.alert("Password Reset", message);
    }
  };

  return (
    <>
      <Pressable style={styles.row} onPress={() => setVisible(true)}>
        <View style={styles.iconCircle}>
          <Ionicons name="key" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Change Password</Text>
          <Text style={styles.rowSubtitle}>
            Send a reset link to your email
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </Pressable>

      <AppPopup
        visible={visible}
        onClose={() => setVisible(false)}
        contentStyle={styles.popupContent}
      >
        <View style={styles.popupBody}>
          <View style={styles.popupIcon}>
            <Ionicons
              name="shield-checkmark"
              size={28}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.popupTitle}>Secure Password Change</Text>
          <Text style={styles.popupSubtitle}>
            We'll send a verification link to your email for security.
          </Text>

          <View style={styles.emailBox}>
            <Ionicons name="mail" size={16} color={COLORS.textMuted} />
            <Text style={styles.emailText}>{email || "No email found"}</Text>
          </View>

          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            {requirements.map((item, idx) => (
              <View key={item} style={styles.requirementRow}>
                <Ionicons
                  name={
                    idx === requirements.length - 1
                      ? "information-circle"
                      : "checkmark"
                  }
                  size={14}
                  color={
                    idx === requirements.length - 1
                      ? COLORS.textMuted
                      : COLORS.success
                  }
                />
                <Text style={styles.requirementText}>{item}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.primaryButton, isPending && styles.buttonDisabled]}
            onPress={handleSendEmail}
            disabled={isPending || !email}
          >
            <Ionicons name="paper-plane" size={16} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>
              {isPending ? "Sending..." : "Send Verification Email"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </AppPopup>
    </>
  );
}

const styles = StyleSheet.create({
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
  popupContent: {
    padding: spacing.lg,
  },
  popupBody: {
    alignItems: "center",
  },
  popupIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  popupSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: spacing.md,
  },
  emailBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: spacing.md,
  },
  emailText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  requirementsBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: COLORS.surface,
    marginBottom: spacing.md,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: spacing.sm,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  primaryButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
  },
  cancelButton: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
});
