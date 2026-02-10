import * as LocalAuthentication from "expo-local-authentication";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export const BiometricService = {
  async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  },

  /** Try Face ID / Touch ID only (no passcode fallback) */
  async authenticateBiometric(
    promptMessage = "Authenticate to access Helixa AI",
  ): Promise<AuthResult> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: true,
      cancelLabel: "Cancel",
    });
    if (result.success) {
      return { success: true };
    }
    const error = (result as { error?: string }).error;
    return { success: false, error: error || "failed" };
  },

  /** Face ID / Touch ID first, passcode as fallback */
  async authenticateWithPasscode(
    promptMessage = "Authenticate to access Helixa AI",
  ): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: false,
      fallbackLabel: "Use Passcode",
    });
    return result.success;
  },

  async getBiometryType(): Promise<"face" | "fingerprint" | "none"> {
    const types =
      await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (
      types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
    ) {
      return "face";
    }
    if (
      types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ) {
      return "fingerprint";
    }
    return "none";
  },
};
