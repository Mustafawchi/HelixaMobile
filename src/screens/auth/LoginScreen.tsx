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
import { COLORS, spacing, borderRadius } from "../../theme";
import {
  useSendLoginCode,
  useVerifyLoginCode,
} from "../../hooks/mutations/useLogin";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const codeInputRef = useRef<TextInput>(null);
  const twoFactorInputRef = useRef<TextInput>(null);

  const sendLoginCode = useSendLoginCode();
  const verifyLoginCode = useVerifyLoginCode();

  const loading = sendLoginCode.isPending || verifyLoginCode.isPending;

  const handleSendCode = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    sendLoginCode.mutate(
      { email: trimmedEmail },
      {
        onSuccess: (data) => {
          setCodeSent(true);
          setTwoFactorRequired(data.twoFactorEnabled);
          setTimeout(() => codeInputRef.current?.focus(), 300);
        },
        onError: (error: any) => {
          const msg = getErrorMessage(error);
          Alert.alert("Error", msg);
        },
      },
    );
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code.");
      return;
    }
    if (twoFactorRequired && twoFactorCode.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit authenticator code.");
      return;
    }

    verifyLoginCode.mutate(
      {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        twoFactorCode: twoFactorRequired ? twoFactorCode.trim() : undefined,
      },
      {
        onError: (error: any) => {
          const msg = getErrorMessage(error);
          Alert.alert("Error", msg);
        },
      },
    );
  };

  const handleResendCode = () => {
    setCode("");
    setTwoFactorCode("");
    handleSendCode();
  };

  const handleBack = () => {
    setCodeSent(false);
    setCode("");
    setTwoFactorCode("");
    setTwoFactorRequired(false);
    sendLoginCode.reset();
    verifyLoginCode.reset();
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
            <Ionicons name="leaf" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.brandTitle}>Helixa AI</Text>
          <Text style={styles.brandSubtitle}>File Note Management</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            {codeSent && twoFactorRequired
              ? "Enter both verification codes"
              : codeSent
                ? "Enter the code sent to your email"
                : "Enter your email to receive a login code"}
          </Text>
          {codeSent && twoFactorRequired && (
            <Text style={styles.verificationEmail}>{email}</Text>
          )}

          {codeSent ? (
            <>
              {twoFactorRequired ? (
                <>
                  <View style={styles.verificationHeader}>
                    <View style={styles.verificationIcon}>
                      <Ionicons name="key" size={28} color={COLORS.primary} />
                    </View>
                  </View>

                  <Text style={styles.fieldLabel}>Email Verification Code</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
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

                  <Text style={styles.fieldLabel}>
                    Google Authenticator Code
                  </Text>
                  <View
                    style={[styles.inputWrapper, styles.inputWrapperAccent]}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={COLORS.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={twoFactorInputRef}
                      style={[styles.input, styles.codeInput]}
                      placeholder="000000"
                      placeholderTextColor={COLORS.textMuted}
                      value={twoFactorCode}
                      onChangeText={(val) =>
                        setTwoFactorCode(val.replace(/\D/g, "").slice(0, 6))
                      }
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                  </View>
                </>
              ) : (
                <>
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
                </>
              )}

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
                  <Ionicons name="key-outline" size={20} color={COLORS.white} />
                )}
                <Text style={styles.buttonText}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Text>
              </TouchableOpacity>

              {/* Resend */}
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
            </>
          ) : (
            <>
              {/* Email Input */}
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
                  onSubmitEditing={handleSendCode}
                  returnKeyType="go"
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
                  {loading ? "Sending..." : "Send Login Code"}
                </Text>
              </TouchableOpacity>

              {/* Signup Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Create one</Text>
                </TouchableOpacity>
              </View>

              {/* Legal */}
              <Text style={styles.legalText}>
                By signing in, you agree to our{" "}
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
  if (code === "functions/not-found") {
    return "No account found with this email.";
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
    paddingTop: 70,
    paddingBottom: 36,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  // ---- Form ----
  formContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  // ---- Input ----
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 16,
  },
  inputWrapperAccent: {
    borderColor: COLORS.primary,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  codeInput: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  verificationHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  verificationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  },
  // ---- Button ----
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.lg,
    height: 54,
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
  // ---- Back ----
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // ---- Resend ----
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
  // ---- Signup ----
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  signupText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // ---- Legal ----
  legalText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 28,
    paddingHorizontal: 8,
  },
  legalLink: {
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
