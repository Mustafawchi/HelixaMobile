import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "../../api/endpoints/patients";
import type {
  CreatePatientRequest,
  GetPatientsListPaginatedResponse,
  Patient,
} from "../../types/patient";

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePatientRequest) => patientsApi.create(params),
    onMutate: async (params: CreatePatientRequest) => {
      await queryClient.cancelQueries({ queryKey: ["patients"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["patients"],
      });

      const now = new Date().toISOString();
      const tempPatient: Patient = {
        patientId: `temp-${Date.now()}`,
        name: [params.firstName, params.lastName].filter(Boolean).join(" "),
        firstName: params.firstName,
        lastName: params.lastName || null,
        noteCount: 0,
        createdAt: now,
        lastModified: now,
      };

      queryClient.setQueriesData(
        { queryKey: ["patients"] },
        (oldData: unknown) => {
          if (!oldData) return oldData;

          if (Array.isArray(oldData)) {
            return [tempPatient, ...oldData];
          }

          const infiniteData = oldData as {
            pages: GetPatientsListPaginatedResponse[];
            pageParams: unknown[];
          };
          if (infiniteData.pages?.length) {
            return {
              ...infiniteData,
              pages: infiniteData.pages.map((page, i) =>
                i === 0
                  ? {
                      ...page,
                      patients: [tempPatient, ...page.patients],
                      totalCount: page.totalCount + 1,
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
    onError: (_err, _params, context) => {
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
