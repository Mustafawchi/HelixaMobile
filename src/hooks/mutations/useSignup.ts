import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/endpoints/auth";
import type {
  SendSignupCodeRequest,
  SendSignupCodeResponse,
  VerifySignupCodeRequest,
  VerifySignupCodeResponse,
} from "../../types/authType";

/**
 * Step 1: Send OTP code to user's email for signup
 */
export const useSendSignupCode = () => {
  return useMutation<SendSignupCodeResponse, Error, SendSignupCodeRequest>({
    mutationFn: authApi.sendSignupCode,
  });
};

/**
 * Step 2: Verify OTP code and create account
 * This also calls signInWithCustomToken internally,
 * so Firebase Auth state updates automatically via onAuthStateChanged
 */
export const useVerifySignupCode = () => {
  return useMutation<VerifySignupCodeResponse, Error, VerifySignupCodeRequest>({
    mutationFn: authApi.verifySignupCode,
  });
};
