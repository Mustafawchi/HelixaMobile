import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS, spacing, borderRadius } from "../../theme";
import {
  useSendSignupCode,
  useVerifySignupCode,
} from "../../hooks/mutations/useSignup";
import type { AuthStackParamList } from "../../types/navigation";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Signup">;

export default function SignupScreen() {
  const navigation = useNavigation<Nav>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [positionInPractice, setPositionInPractice] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const codeInputRef = useRef<TextInput>(null);

  const sendSignupCode = useSendSignupCode();
  const verifySignupCode = useVerifySignupCode();

  const loading = sendSignupCode.isPending || verifySignupCode.isPending;

  const handleSendCode = () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPractice = practiceName.trim();
    const trimmedPosition = positionInPractice.trim();

    if (!trimmedFirst) {
      Alert.alert("Error", "Please enter your first name.");
      return;
    }
    if (!trimmedLast) {
      Alert.alert("Error", "Please enter your last name.");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    if (!trimmedPractice) {
      Alert.alert("Error", "Please enter your practice name.");
      return;
    }
    if (!trimmedPosition) {
      Alert.alert("Error", "Please enter your position in the practice.");
      return;
    }

    sendSignupCode.mutate(
      {
        email: trimmedEmail,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        practiceName: trimmedPractice,
        positionInPractice: trimmedPosition,
      },
      {
        onSuccess: () => {
          setCodeSent(true);
          setTimeout(() => codeInputRef.current?.focus(), 300);
        },
        onError: (error: any) => {
          Alert.alert("Error", getErrorMessage(error));
        },
      },
    );
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit verification code.");
      return;
    }

    verifySignupCode.mutate(
      {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        practiceName: practiceName.trim(),
        positionInPractice: positionInPractice.trim(),
      },
      {
        onError: (error: any) => {
          Alert.alert("Error", getErrorMessage(error));
        },
      },
    );
  };

  const handleResendCode = () => {
    setCode("");
    handleSendCode();
  };

  const handleEditInfo = () => {
    setCodeSent(false);
    setCode("");
    sendSignupCode.reset();
    verifySignupCode.reset();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={26} color={COLORS.white} />
          </View>
          <Text style={styles.brandTitle}>Helixa AI</Text>
          <Text style={styles.brandSubtitle}>File Note Management</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {codeSent ? (
            <>
              {/* Verification Step */}
              <View style={styles.verificationHeader}>
                <View style={styles.verificationIcon}>
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <Text style={styles.welcomeTitle}>Enter Verification Code</Text>
              <Text style={styles.welcomeSubtitle}>
                We've sent a 6-digit code to
              </Text>
              <Text style={styles.verificationEmail}>
                {email.trim().toLowerCase()}
              </Text>
              <Text style={styles.codeExpiryText}>
                Code expires in 10 minutes.
              </Text>

              {/* Code Input */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={codeInputRef}
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  placeholderTextColor={COLORS.textMuted}
                  value={code}
                  onChangeText={(val) =>
                    setCode(val.replace(/\D/g, "").slice(0, 6))
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={COLORS.white}
                  />
                )}
                <Text style={styles.buttonText}>
                  {loading ? "Creating Account..." : "Verify & Create Account"}
                </Text>
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={loading}
              >
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>

              {/* Edit Info */}
              <TouchableOpacity
                style={styles.editInfoButton}
                onPress={handleEditInfo}
                disabled={loading}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.editInfoText}>Edit my information</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Info Collection Step */}
              <Text style={styles.welcomeTitle}>Create Account</Text>
              <Text style={styles.welcomeSubtitle}>
                Create your account to get started
              </Text>

              {/* Name Row */}
              <View style={styles.nameRow}>
                <View style={[styles.inputWrapper, styles.nameInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={COLORS.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
                <View style={[styles.inputWrapper, styles.nameInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor={COLORS.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              {/* Practice Name */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Practice Name"
                  placeholderTextColor={COLORS.textMuted}
                  value={practiceName}
                  onChangeText={setPracticeName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {/* Position in Practice */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Position (e.g., Dentist, Hygienist)"
                  placeholderTextColor={COLORS.textMuted}
                  value={positionInPractice}
                  onChangeText={setPositionInPractice}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {/* Send Code Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.white}
                  />
                )}
                <Text style={styles.buttonText}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={styles.signupLink}>Sign in</Text>
                </TouchableOpacity>
              </View>

              {/* Legal */}
              <Text style={styles.legalText}>
                By creating an account, you agree to our{" "}
                <Text style={styles.legalLink}>Privacy Policy</Text>,{" "}
                <Text style={styles.legalLink}>Terms of Service</Text>, and{" "}
                <Text style={styles.legalLink}>
                  Apple's End User License Agreement
                </Text>
                .
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getErrorMessage(error: any): string {
  const code = error?.code || "";
  if (code === "functions/already-exists") {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (code === "functions/not-found") {
    return "No pending signup found. Please request a new code.";
  }
  if (code === "functions/permission-denied") {
    return "Invalid code. Please try again.";
  }
  if (code === "functions/deadline-exceeded") {
    return "Code has expired. Please request a new one.";
  }
  if (code === "functions/resource-exhausted") {
    return "Too many attempts. Please request a new code.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // ---- Header ----
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  // ---- Form ----
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  // ---- Verification ----
  verificationHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  verificationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  verificationEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 4,
  },
  codeExpiryText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 18,
  },
  // ---- Input ----
  nameRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  nameInput: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  codeInput: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
  // ---- Button ----
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.lg,
    height: 48,
    gap: 8,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  // ---- Resend / Edit ----
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  editInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  editInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  // ---- Login Link ----
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // ---- Legal ----
  legalText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  legalLink: {
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
