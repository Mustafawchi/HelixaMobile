export interface Note {
  id: string;
  patientId: string;
  title: string;
  text: string;
  type: string;
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

// Create Note
export interface CreateNoteRequest {
  patientId: string;
  title: string;
  text: string;
  type?: string;
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
