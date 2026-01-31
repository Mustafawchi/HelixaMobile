import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "../../api/endpoints/patients";
import type {
  Patient,
  GetPatientsListPaginatedResponse,
} from "../../types/patient";

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientsApi.delete,
    onMutate: async (patientId: string) => {
      await queryClient.cancelQueries({ queryKey: ["patients"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["patients"],
      });

      queryClient.setQueriesData(
        { queryKey: ["patients"] },
        (oldData: unknown) => {
          if (!oldData) return oldData;

          if (Array.isArray(oldData)) {
            return oldData.filter(
              (p: Patient) => p.patientId !== patientId,
            );
          }

          const infiniteData = oldData as {
            pages: GetPatientsListPaginatedResponse[];
            pageParams: unknown[];
          };
          if (infiniteData.pages) {
            return {
              ...infiniteData,
              pages: infiniteData.pages.map((page) => ({
                ...page,
                patients: page.patients.filter(
                  (p) => p.patientId !== patientId,
                ),
                totalCount: page.totalCount - 1,
              })),
            };
          }

          return oldData;
        },
      );

      return { previousQueries };
    },
    onError: (_err, _patientId, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
