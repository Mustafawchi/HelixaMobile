export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Patients: undefined;
  AskHelixa: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type PatientsStackParamList = {
  PatientList: undefined;
  PatientDetails: { patientId: string };
  NoteList: { patientId: string; patientName?: string };
  Folder: { folderKey: string };
  NewNote: { patientId: string; patientName: string; consultationType: string; consultationTitle: string };
  NoteDetail: { patientId: string; noteId: string; noteTitle: string; noteText: string; noteType: string };
  ReferPatient: { patientId: string; patientName: string; patientEmail?: string; selectedNoteIds?: string[]; generatedContent?: string; generatedEmailBody?: string; doctorName?: string; doctorEmail?: string };
  SummaryToPatient: { patientId: string; patientName: string; patientEmail?: string; selectedNoteIds?: string[]; generatedContent?: string; generatedEmailBody?: string };
  SmartSummary: { patientId: string; patientName: string; patientEmail?: string; selectedNoteIds?: string[]; generatedContent?: string; generatedEmailBody?: string; notesCount?: number; generatedAt?: string; folderType?: string };
};
