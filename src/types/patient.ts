export interface Patient {
  patientId: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  noteCount: number;
  createdAt: string;
  lastModified: string;
  dateOfBirth?: string;
  email?: string;
  homeAddress?: string;
  medicalHistorySummary?: string;
  medicalHistoryLastUpdated?: string;
  medicalHistoryLastNoteId?: string;
}

export interface GetPatientsListResponse {
  success: boolean;
  patients: Patient[];
  count: number;
}

export interface GetPatientsListPaginatedRequest {
  limit: number;
  lastDocId?: string;
  sortBy?: 'lastModified' | 'createdAt' | 'name';
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
}

export interface GetPatientsListPaginatedResponse {
  success: boolean;
  patients: Patient[];
  totalCount: number;
  totalNotes: number;
  hasMore: boolean;
  lastDocId: string | null;
}

export interface SearchPatientsRequest {
  searchQuery: string;
  limit?: number;
}

export interface SearchPatientsResponse {
  success: boolean;
  patients: Patient[];
  count: number;
}

export interface UpdatePatientRequest {
  patientId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  email?: string;
  homeAddress?: string;
  medicalHistorySummary?: string;
  medicalHistoryLastUpdated?: string;
  medicalHistoryLastNoteId?: string;
}

export interface UpdatePatientResponse {
  success: boolean;
  message: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName?: string;
}

export interface CreatePatientResponse {
  success: boolean;
  patientId: string;
  message: string;
}
