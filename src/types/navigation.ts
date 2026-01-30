export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Reports: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type ReportsStackParamList = {
  ReportList: undefined;
  ReportDetail: { id: string };
};
