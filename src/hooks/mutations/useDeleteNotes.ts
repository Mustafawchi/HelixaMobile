import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "../../api/endpoints/notes";
import type { DeleteNotesRequest, GetPatientNotesResponse } from "../../types/note";

export const useDeleteNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteNotesRequest) => notesApi.deleteMany(params),
    onMutate: async (params: DeleteNotesRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["notes", "list", params.patientId],
      });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["notes", "list", params.patientId],
      });

      const idsToDelete = new Set(params.noteIds);

      queryClient.setQueriesData(
        { queryKey: ["notes", "list", params.patientId] },
        (oldData: unknown) => {
          if (!oldData) return oldData;

          const infiniteData = oldData as {
            pages: GetPatientNotesResponse[];
            pageParams: unknown[];
          };
          if (infiniteData.pages) {
            return {
              ...infiniteData,
              pages: infiniteData.pages.map((page) => {
                const filtered = page.notes.filter(
                  (note) => !idsToDelete.has(note.id),
                );
                return {
                  ...page,
                  notes: filtered,
                  count: filtered.length,
                };
              }),
            };
          }

          return oldData;
        },
      );

      return { previousQueries };
    },
    onError: (_err, _params, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: (_data, _error, params) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", "list", params.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notes", "search", params.patientId],
      });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
