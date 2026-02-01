import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "../../api/endpoints/notes";
import type { CreateNoteRequest, GetPatientNotesResponse, Note } from "../../types/note";

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateNoteRequest) => notesApi.create(params),
    onMutate: async (params: CreateNoteRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["notes", "list", params.patientId],
      });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["notes", "list", params.patientId],
      });

      const now = new Date().toISOString();
      const tempNote: Note = {
        id: `temp-${Date.now()}`,
        patientId: params.patientId,
        title: params.title,
        text: params.text,
        type: params.type || "General",
        matter: params.matter,
        createdAt: now,
        lastEdited: now,
        updatedAt: now,
      };

      queryClient.setQueriesData(
        { queryKey: ["notes", "list", params.patientId] },
        (oldData: unknown) => {
          if (!oldData) return oldData;

          const infiniteData = oldData as {
            pages: GetPatientNotesResponse[];
            pageParams: unknown[];
          };
          if (infiniteData.pages?.length) {
            return {
              ...infiniteData,
              pages: infiniteData.pages.map((page, i) =>
                i === 0
                  ? {
                      ...page,
                      notes: [tempNote, ...page.notes],
                      count: page.count + 1,
                    }
                  : page,
              ),
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
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
