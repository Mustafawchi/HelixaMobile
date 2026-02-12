import { audioApiClient } from "../client";
import type { Note } from "../../types/note";
import type {
  ExtractMedicalHistoryParams,
  ExtractMedicalHistoryRequest,
  ExtractMedicalHistoryResponse,
} from "../../types/medicalHistory";

const stripHtmlTags = (html: string): string =>
  html
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();

const prepareNotesContent = (notes: Note[]): string =>
  notes
    .map(
      (note, idx) =>
        `--- Note ${idx + 1} (${note.createdAt || "Unknown date"}) ---\n${stripHtmlTags(note.text || "")}`,
    )
    .join("\n\n");

export const medicalHistoryApi = {
  stripHtmlTags,
  prepareNotesContent,

  extract: async (
    params: ExtractMedicalHistoryParams,
  ): Promise<ExtractMedicalHistoryResponse> => {
    const notesContent = prepareNotesContent(params.notes);

    const payload: ExtractMedicalHistoryRequest = {
      notesContent,
      existingHistory: params.existingHistory || "",
    };

    const response = await audioApiClient.post<ExtractMedicalHistoryResponse>(
      "/extract-medical-history",
      payload,
      { timeout: 60000 },
    );

    if (!response.data.success) {
      throw new Error("Medical history extraction failed");
    }

    return response.data;
  },
};
