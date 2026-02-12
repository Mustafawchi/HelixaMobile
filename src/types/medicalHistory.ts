import type { Note } from "./note";

export interface ExtractMedicalHistoryRequest {
  notesContent: string;
  existingHistory: string;
}

export interface ExtractMedicalHistoryResponse {
  success: boolean;
  medicalHistory: string;
  extractedAt: string;
  hasNewItems?: boolean;
  newItems?: string[];
}

export interface ExtractMedicalHistoryParams {
  notes: Note[];
  existingHistory: string;
}
