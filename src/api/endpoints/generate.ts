import { firebaseAuth } from "../../config/firebase";
import apiClient from "../client";
import type {
  GeneratePatientLetterRequest,
  GeneratePatientLetterResponse,
  GenerateReferralLetterRequest,
  GenerateReferralLetterResponse,
} from "../../types/generate";

/**
 * Audio processing server URL used by the referral letter endpoint.
 * Desktop uses VITE_AUDIO_SERVER_URL; mobile mirrors with EXPO_PUBLIC_AUDIO_SERVER_URL.
 */
const AUDIO_SERVER_URL =
  process.env.EXPO_PUBLIC_AUDIO_SERVER_URL ||
  "https://audioprocessing-iuqhn5zc6a-uc.a.run.app";

export const generateApi = {
  /**
   * Generate a patient summary letter.
   * Uses the main apiClient (Cloud Functions base URL).
   */
  patientLetter: async (
    params: GeneratePatientLetterRequest,
  ): Promise<GeneratePatientLetterResponse> => {
    const response = await apiClient.post<GeneratePatientLetterResponse>(
      "/generate-patient-letter",
      params,
      { timeout: 60000 },
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to generate patient letter",
      );
    }

    return response.data;
  },

  /**
   * Generate a referral letter.
   * Uses the audio processing server (separate from Cloud Functions).
   */
  referralLetter: async (
    params: GenerateReferralLetterRequest,
    signal?: AbortSignal,
  ): Promise<GenerateReferralLetterResponse> => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const idToken = await user.getIdToken();

    const response = await fetch(
      `${AUDIO_SERVER_URL}/generate-referral-letter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(params),
        signal,
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Failed to generate referral letter: ${errorText}`);
    }

    return (await response.json()) as GenerateReferralLetterResponse;
  },
};
