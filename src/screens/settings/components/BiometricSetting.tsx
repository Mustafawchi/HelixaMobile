import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, spacing, borderRadius } from "../../../theme";
import { useBiometric } from "../../../context/BiometricContext";

export default function BiometricSetting() {
  const {
    biometricEnabled,
    biometricAvailable,
    biometryType,
    toggleBiometric,
  } = useBiometric();
  const [togglingBiometric, setTogglingBiometric] = useState(false);

  if (!biometricAvailable) return null;

  const biometricLabel =
    biometryType === "face"
      ? "Face ID"
      : biometryType === "fingerprint"
        ? "Touch ID"
        : "Biometric Lock";

  const biometricIcon =
    biometryType === "fingerprint" ? "finger-print" : "lock-closed";

  const handleToggleBiometric = async () => {
    setTogglingBiometric(true);
    try {
      const success = await toggleBiometric();
      if (!success && !biometricEnabled) {
        Alert.alert(
          "Biometric Unavailable",
          "Please make sure biometric authentication is set up on your device.",
        );
      }
    } finally {
      setTogglingBiometric(false);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.iconCircle}>
        <Ionicons name={biometricIcon} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{biometricLabel}</Text>
        <Text style={styles.rowSubtitle}>
          Require {biometricLabel} when opening the app
        </Text>
      </View>
      <Switch
        value={biometricEnabled}
        onValueChange={handleToggleBiometric}
        disabled={togglingBiometric}
        trackColor={{
          false: COLORS.border,
          true: COLORS.primaryLight,
        }}
        thumbColor={biometricEnabled ? COLORS.primary : COLORS.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rowText: {
    flex: 1,
  },
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
});
