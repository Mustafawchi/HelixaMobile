import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "../../api/endpoints/notes";
import type { DeleteNoteRequest, GetPatientNotesResponse } from "../../types/note";

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteNoteRequest) => notesApi.delete(params),
    onMutate: async (params: DeleteNoteRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["notes", "list", params.patientId],
      });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["notes", "list", params.patientId],
      });

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
              pages: infiniteData.pages.map((page) => ({
                ...page,
                notes: page.notes.filter((note) => note.id !== params.noteId),
                count: Math.max(0, page.count - 1),
              })),
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
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
