import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/endpoints/reports';
import type { ReportFilter } from '../types/report';

export const useReports = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportsApi.getAll(filters).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};
