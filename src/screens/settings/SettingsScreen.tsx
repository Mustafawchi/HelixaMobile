import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, spacing, typography, borderRadius } from "../../theme";
import { useBiometric } from "../../context/BiometricContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    biometricEnabled,
    biometricAvailable,
    biometryType,
    toggleBiometric,
  } = useBiometric();
  const [togglingBiometric, setTogglingBiometric] = useState(false);

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
    <ScrollView
      style={[styles.container, { paddingTop: 0, paddingHorizontal: 0 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your legal practice tools</Text>
      </View>

      <View style={styles.card}>
        <Pressable style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="trash" size={18} color={COLORS.error} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitleDanger}>Clear All Data</Text>
            <Text style={styles.rowSubtitle}>
              Remove all data from device and cloud
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-remove" size={18} color={COLORS.error} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitleDanger}>Delete Account</Text>
            <Text style={styles.rowSubtitle}>
              Permanently delete your account and all data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>
      </View>

      {biometricAvailable && (
        <>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={biometricIcon}
                  size={18}
                  color={COLORS.primary}
                />
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
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Support & Legal</Text>
      <View style={styles.card}>
        <Pressable style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="help-circle" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Help & Support</Text>
            <Text style={styles.rowSubtitle}>
              Common questions and contact support
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Terms of Service</Text>
            <Text style={styles.rowSubtitle}>Legal terms and conditions</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Privacy Policy</Text>
            <Text style={styles.rowSubtitle}>How we protect your data</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.linkText}>Apple's End User License Agreement</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="information-circle"
              size={18}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>App Version</Text>
            <Text style={styles.rowSubtitle}>1.2.8</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.signOutButton}>
        <Ionicons name="log-out" size={18} color={COLORS.white} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: COLORS.white,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: 4,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
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
  rowTitleDanger: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.error,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: spacing.sm,
  },
  linkText: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  signOutButton: {
    backgroundColor: COLORS.error,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  signOutText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
