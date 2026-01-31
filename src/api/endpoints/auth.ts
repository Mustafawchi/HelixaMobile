import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { firebaseAuth, functions } from "../../config/firebase";
import type {
  SendLoginCodeRequest,
  SendLoginCodeResponse,
  VerifyLoginCodeRequest,
  VerifyLoginCodeResponse,
  SendSignupCodeRequest,
  SendSignupCodeResponse,
  VerifySignupCodeRequest,
  VerifySignupCodeResponse,
} from "../../types/authType";

export const authApi = {
  sendLoginCode: async (
    data: SendLoginCodeRequest,
  ): Promise<SendLoginCodeResponse> => {
    const sendLoginCode = httpsCallable<
      SendLoginCodeRequest,
      SendLoginCodeResponse
    >(functions, "sendLoginCode");
    const result = await sendLoginCode(data);
    return result.data;
  },

  verifyLoginCode: async (
    data: VerifyLoginCodeRequest,
  ): Promise<VerifyLoginCodeResponse> => {
    const verifyLoginCode = httpsCallable<
      VerifyLoginCodeRequest,
      VerifyLoginCodeResponse
    >(functions, "verifyLoginCode");
    const result = await verifyLoginCode(data);

    // Sign in with the custom token from Firebase
    await signInWithCustomToken(firebaseAuth, result.data.customToken);

    return result.data;
  },

  sendSignupCode: async (
    data: SendSignupCodeRequest,
  ): Promise<SendSignupCodeResponse> => {
    const sendSignupCode = httpsCallable<
      SendSignupCodeRequest,
      SendSignupCodeResponse
    >(functions, "sendSignupCode");
    const result = await sendSignupCode(data);
    return result.data;
  },

  verifySignupCode: async (
    data: VerifySignupCodeRequest,
  ): Promise<VerifySignupCodeResponse> => {
    const verifySignupCode = httpsCallable<
      VerifySignupCodeRequest,
      VerifySignupCodeResponse
    >(functions, "verifySignupCode");
    const result = await verifySignupCode(data);

    // Sign in with the custom token from Firebase
    await signInWithCustomToken(firebaseAuth, result.data.customToken);

    return result.data;
  },

  logout: async (): Promise<void> => {
    await signOut(firebaseAuth);
  },
};
