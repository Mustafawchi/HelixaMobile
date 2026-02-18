export interface Note {
  id: string;
  patientId: string;
  title: string;
  text: string;
  type: string;
  labelColor?: string;
  createdAt: string;
  lastEdited?: string;
  updatedAt?: string;
  matter?: string;
}

export interface PatientDetails {
  medicalHistorySummary: string | null;
  medicalHistoryLastUpdated: string | null;
  medicalHistoryLastNoteId: string | null;
  dateOfBirth: string | null;
  email: string | null;
  homeAddress: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface GetPatientNotesRequest {
  patientId: string;
  pageSize?: number;
  lastNoteId?: string | null;
}

export interface GetPatientNotesResponse {
  success: boolean;
  notes: Note[];
  hasMore: boolean;
  lastVisibleNoteId: string | null;
  count: number;
  patientDetails?: PatientDetails;
}

export interface SearchNotesRequest {
  patientId: string;
  searchQuery: string;
  limit?: number;
}

export interface SearchNotesResponse {
  success: boolean;
  notes: Note[];
  count: number;
}

// Create Note
export interface CreateNoteRequest {
  patientId: string;
  title: string;
  text: string;
  type?: string;
  labelColor?: string;
  matter?: string;
}

export interface CreateNoteResponse {
  success: boolean;
  noteId: string;
  message: string;
}

// Update Note
export interface UpdateNoteRequest {
  patientId: string;
  noteId: string;
  title?: string;
  text?: string;
  type?: string;
  labelColor?: string;
  matter?: string;
}

export interface UpdateNoteResponse {
  success: boolean;
  message: string;
}

// Delete Note
export interface DeleteNoteRequest {
  patientId: string;
  noteId: string;
}

export interface DeleteNoteResponse {
  success: boolean;
  message: string;
}

// Batch Delete Notes
export interface DeleteNotesRequest {
  patientId: string;
  noteIds: string[];
}

export interface DeleteNotesResponse {
  success: boolean;
  deletedCount: number;
  message: string;
}

export const consultationTypes = [
  "Comprehensive Examination",
  "Emergency Visit",
  "Orthodontics",
  "Aesthetics",
  "Wisdom Tooth Consultation",
  "Other",
] as const;

export const consultationTypeLabelColors: Record<string, string> = {
  "Comprehensive Examination": "#E3F2EA",
  "Emergency Visit": "#F6E3EA",
  Orthodontics: "#F4F0D8",
  Aesthetics: "#E2ECF7",
  "Wisdom Tooth Consultation": "#EEE7F6",
  Other: "#E9EDF1",
};

export const defaultConsultationLabelColor = "#E9EDF1";

export const getConsultationLabelColor = (
  type?: string,
  storedLabelColor?: string,
): string => {
  if (storedLabelColor) return storedLabelColor;
  if (!type) return defaultConsultationLabelColor;
  return consultationTypeLabelColors[type] || defaultConsultationLabelColor;
};
