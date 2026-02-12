import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { notesApi } from "../../api/endpoints/notes";
import type { GetPatientNotesRequest } from "../../types/note";

const NOTES_PER_PAGE = 10;

export const usePatientNotes = (
  patientId: string,
  pageSize: number = NOTES_PER_PAGE,
) => {
  return useInfiniteQuery({
    queryKey: ["notes", "list", patientId, pageSize],
    queryFn: async ({ pageParam }) => {
      const params: GetPatientNotesRequest = {
        patientId,
        pageSize,
        lastNoteId: pageParam as string | null,
      };
      return notesApi.getPatientNotes(params);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastVisibleNoteId : undefined;
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchPatientNotes = (
  patientId: string,
  searchQuery: string,
  limit: number = 30,
) => {
  const normalizedQuery = searchQuery.trim();

  return useQuery({
    queryKey: ["notes", "search", patientId, normalizedQuery, limit],
    queryFn: () =>
      notesApi.searchNotes({
        patientId,
        searchQuery: normalizedQuery,
        limit,
      }),
    enabled: !!patientId && normalizedQuery.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
};
