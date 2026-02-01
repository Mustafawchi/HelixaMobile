import { useInfiniteQuery } from "@tanstack/react-query";
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
