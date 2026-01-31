import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { patientsApi } from '../../api/endpoints/patients';
import type { GetPatientsListPaginatedRequest } from '../../types/patient';

const PATIENTS_PER_PAGE = 10;

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
};

export interface UsePaginatedPatientsOptions {
  sortBy?: 'lastModified' | 'createdAt' | 'name';
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
}

export const usePaginatedPatients = (
  options: UsePaginatedPatientsOptions = {},
) => {
  const {
    sortBy = 'lastModified',
    sortDirection = 'desc',
    searchQuery,
  } = options;

  return useInfiniteQuery({
    queryKey: ['patients', 'paginated', { sortBy, sortDirection, searchQuery }],
    queryFn: async ({ pageParam }) => {
      const params: GetPatientsListPaginatedRequest = {
        limit: PATIENTS_PER_PAGE,
        lastDocId: pageParam as string | undefined,
        sortBy,
        sortDirection,
        searchQuery: searchQuery?.trim() || undefined,
      };
      return patientsApi.getPaginated(params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.lastDocId) return undefined;
      return lastPage.lastDocId;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchPatients = (searchQuery: string) => {
  return useQuery({
    queryKey: ['patients', 'search', searchQuery],
    queryFn: () => patientsApi.search({ searchQuery, limit: 20 }),
    enabled: !!searchQuery.trim(),
    staleTime: 1000 * 60 * 2,
  });
};
