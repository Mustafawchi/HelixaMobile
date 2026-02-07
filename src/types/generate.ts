// ============================================================================
// PATIENT LETTER
// ============================================================================

export interface GeneratePatientLetterRequest {
  noteContent: string;
  patientName: string;
  practiceName: string;
  doctorName: string;
}

export interface GeneratePatientLetterResponse {
  success: boolean;
  summary?: string;
  error?: string;
}

// ============================================================================
// REFERRAL LETTER
// ============================================================================

export interface ReferralPatientDetails {
  name: string;
  dob: string;
  email: string;
  address: string;
}

export interface ReferralDoctorPayload {
  name: string;
  surname: string;
}

export interface ReferralSenderDetails {
  name: string;
  position: string;
}

export interface GenerateReferralLetterRequest {
  noteContent: string;
  patientDetails: ReferralPatientDetails;
  medicalHistory: string;
  referralDoctor: ReferralDoctorPayload | null;
  senderDetails: ReferralSenderDetails;
}

export interface GenerateReferralLetterResponse {
  success: boolean;
  letterBody?: string;
  error?: string;
}

// ============================================================================
// DOCTOR
// ============================================================================

export interface Doctor {
  id: string;
  name: string;
  surname: string;
  email: string;
  specialty?: string;
}

export type CreateDoctorPayload = Omit<Doctor, "id">;
export type UpdateDoctorPayload = Partial<Omit<Doctor, "id">>;
