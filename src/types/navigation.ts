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
  Folder: { folderKey: string };
  NewNote: { folderKey?: string };
  NoteDetail: { folderKey: string; noteId: string };
};
