export interface Report {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilter {
  search?: string;
  page?: number;
  limit?: number;
}
