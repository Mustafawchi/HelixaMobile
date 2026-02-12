import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "../../api/endpoints/notes";
import type { UpdateNoteRequest, GetPatientNotesResponse } from "../../types/note";

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateNoteRequest) => notesApi.update(params),
    onMutate: async (params: UpdateNoteRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["notes", "list", params.patientId],
      });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["notes", "list", params.patientId],
      });

      const now = new Date().toISOString();

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
                notes: page.notes.map((note) =>
                  note.id === params.noteId
                    ? {
                        ...note,
                        ...(params.title !== undefined && { title: params.title }),
                        ...(params.text !== undefined && { text: params.text }),
                        ...(params.type !== undefined && { type: params.type }),
                        ...(params.matter !== undefined && { matter: params.matter }),
                        lastEdited: now,
                        updatedAt: now,
                      }
                    : note,
                ),
              })),
            };
          }

          return oldData;
        },
      );

      return { previousQueries };
    },
    onError: (_err, params, context) => {
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
    },
  });
};
