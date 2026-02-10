import apiClient from "../client";
import type {
  GeneratePatientLetterRequest,
  GeneratePatientLetterResponse,
  GenerateReferralLetterRequest,
  GenerateReferralLetterResponse,
} from "../../types/generate";

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
   * Uses the same apiClient (Cloud Functions base URL) as the patient letter.
   */
  referralLetter: async (
    params: GenerateReferralLetterRequest,
  ): Promise<GenerateReferralLetterResponse> => {
    const response = await apiClient.post<GenerateReferralLetterResponse>(
      "/generate-referral-letter",
      params,
      { timeout: 60000 },
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to generate referral letter",
      );
    }

    return response.data;
  },
};
