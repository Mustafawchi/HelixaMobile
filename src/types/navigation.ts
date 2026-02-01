export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Patients: undefined;
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
};
