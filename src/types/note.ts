export interface Note {
  id: string;
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
