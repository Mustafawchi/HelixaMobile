import { httpsCallable } from "firebase/functions";
import { functions } from "../../config/firebase";

export interface GenerateTotpSecretResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface VerifyAndEnableTwoFactorRequest {
  totpSecret: string;
  verificationCode: string;
}

export interface VerifyAndEnableTwoFactorResponse {
  success: boolean;
  backupCodes?: string[];
}

export interface DisableTwoFactorResponse {
  success: boolean;
}

export interface VerifyTwoFactorLoginRequest {
  uid: string;
  code: string;
}

export interface VerifyTwoFactorLoginResponse {
  success: boolean;
  customToken?: string;
  message?: string;
}

export const twoFactorApi = {
  generateTotpSecret: async (): Promise<GenerateTotpSecretResponse> => {
    const fn = httpsCallable<void, GenerateTotpSecretResponse>(
      functions,
      "generateTotpSecret",
    );
    const result = await fn();
    return result.data;
  },

  verifyAndEnableTwoFactor: async (
    payload: VerifyAndEnableTwoFactorRequest,
  ): Promise<VerifyAndEnableTwoFactorResponse> => {
    const fn = httpsCallable<
      VerifyAndEnableTwoFactorRequest,
      VerifyAndEnableTwoFactorResponse
    >(functions, "verifyAndEnableTwoFactor");
    const result = await fn(payload);
    return result.data;
  },

  disableTwoFactor: async (): Promise<DisableTwoFactorResponse> => {
    const fn = httpsCallable<void, DisableTwoFactorResponse>(
      functions,
      "disableTwoFactor",
    );
    const result = await fn();
    return result.data;
  },

  verifyTwoFactorLogin: async (
    payload: VerifyTwoFactorLoginRequest,
  ): Promise<VerifyTwoFactorLoginResponse> => {
    const fn = httpsCallable<
      VerifyTwoFactorLoginRequest,
      VerifyTwoFactorLoginResponse
    >(functions, "verifyTwoFactorLogin");
    const result = await fn(payload);
    return result.data;
  },
};
