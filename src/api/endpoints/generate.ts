import apiClient from "../client";
import type {
  GeneratePatientLetterRequest,
  GeneratePatientLetterResponse,
  GenerateReferralLetterRequest,
  GenerateReferralLetterResponse,
  GenerateSummaryRequest,
  GenerateSummaryResponse,
} from "../../types/generate";

/** Strip HTML tags and normalize whitespace for plain-text API payloads. */
function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

/** Combine multiple note bodies into a single clinical-notes string. */
function combineNoteContent(notes: GeneratePatientLetterRequest["notes"]): string {
  return notes
    .filter((n) => n.text?.trim())
    .map((n) => stripHtml(n.text))
    .join("\n\n---\n\n");
}

export const generateApi = {
  /**
   * Generate a patient summary letter from one or more clinical notes.
   * Notes are combined into a single payload before hitting the backend,
   * keeping the combining logic in the service layer rather than in UI code.
   */
  patientLetter: async (
    params: GeneratePatientLetterRequest,
  ): Promise<GeneratePatientLetterResponse> => {
    if (params.notes.length === 0) {
      throw new Error("At least one note is required to generate a patient letter");
    }

    const noteContent = combineNoteContent(params.notes);

    const response = await apiClient.post<GeneratePatientLetterResponse>(
      "/generate-patient-letter",
      {
        noteContent,
        patientName: params.patientName,
        practiceName: params.practiceName,
        doctorName: params.doctorName,
      },
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

  /**
   * Generate a smart summary for selected notes.
   * Uses audio processing service (same base as other generate endpoints).
   */
  smartSummary: async (
    params: GenerateSummaryRequest,
  ): Promise<GenerateSummaryResponse> => {
    const response = await apiClient.post<GenerateSummaryResponse>(
      "/generate-summary",
      params,
      { timeout: 60000 },
    );

    if (!response.data?.summary) {
      throw new Error("Failed to generate smart summary");
    }

    return response.data;
  },
};
