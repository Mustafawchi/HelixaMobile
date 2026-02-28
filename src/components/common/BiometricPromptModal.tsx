import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPopup from "./AppPopup";
import { COLORS, borderRadius } from "../../theme";

interface BiometricPromptModalProps {
  visible: boolean;
  biometryType: "face" | "fingerprint" | "none";
  onEnable: () => void;
  onDismiss: () => void;
}

export default function BiometricPromptModal({
  visible,
  biometryType,
  onEnable,
  onDismiss,
}: BiometricPromptModalProps) {
  const icon =
    biometryType === "face" ? "scan-outline" : "finger-print-outline";

  return (
    <AppPopup
      visible={visible}
      onClose={onDismiss}
      dismissOnBackdrop={false}
      contentStyle={styles.card}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>Enable Biometrics?</Text>
      <Text style={styles.message}>
        Add an extra layer of security by requiring biometrics to access
        Helixa AI.
      </Text>
      <Text style={styles.hint}>
        You can always change this later in Settings.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onEnable}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={20} color={COLORS.white} />
        <Text style={styles.primaryButtonText}>Enable</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss}>
        <Text style={styles.secondaryButtonText}>Not Now</Text>
      </TouchableOpacity>
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    padding: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLighter,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  secondaryButtonText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
});
