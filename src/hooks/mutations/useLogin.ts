import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/endpoints/auth";
import type {
  SendLoginCodeRequest,
  SendLoginCodeResponse,
  VerifyLoginCodeRequest,
  VerifyLoginCodeResponse,
} from "../../types/authType";

/**
 * Step 1: Send OTP code to user's email
 * Returns twoFactorEnabled to know if 2FA input is needed
 */
export const useSendLoginCode = () => {
  return useMutation<SendLoginCodeResponse, Error, SendLoginCodeRequest>({
    mutationFn: authApi.sendLoginCode,
  });
};

/**
 * Step 2: Verify OTP code (+ optional 2FA) and sign in
 * This also calls signInWithCustomToken internally,
 * so Firebase Auth state updates automatically via onAuthStateChanged
 */
export const useVerifyLoginCode = () => {
  return useMutation<VerifyLoginCodeResponse, Error, VerifyLoginCodeRequest>({
    mutationFn: authApi.verifyLoginCode,
  });
};

/**
 * Logout - signs out from Firebase Auth
 */
export const useLogout = () => {
  return useMutation<void, Error, void>({
    mutationFn: authApi.logout,
  });
};
