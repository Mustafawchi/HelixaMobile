import apiClient from '../client';
import type { Report, ReportFilter } from '../../types/report';

export const reportsApi = {
  getAll: (filters?: ReportFilter) =>
    apiClient.get<Report[]>('/reports', { params: filters }),

  getById: (id: string) =>
    apiClient.get<Report>(`/reports/${id}`),
};
