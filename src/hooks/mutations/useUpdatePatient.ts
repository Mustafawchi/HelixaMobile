import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "../../api/endpoints/patients";
import type {
  UpdatePatientRequest,
  Patient,
  GetPatientsListPaginatedResponse,
} from "../../types/patient";

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientsApi.update,
    onMutate: async (updated: UpdatePatientRequest) => {
      await queryClient.cancelQueries({ queryKey: ["patients"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["patients"],
      });

      const newName = [updated.firstName, updated.lastName]
        .filter(Boolean)
        .join(" ");

      const patch: Partial<Patient> = {
        ...(updated.firstName !== undefined && { firstName: updated.firstName }),
        ...(updated.lastName !== undefined && { lastName: updated.lastName }),
        ...(newName && { name: newName }),
        ...(updated.dateOfBirth !== undefined && {
          dateOfBirth: updated.dateOfBirth,
        }),
        ...(updated.email !== undefined && { email: updated.email }),
        ...(updated.homeAddress !== undefined && {
          homeAddress: updated.homeAddress,
        }),
        lastModified: new Date().toISOString(),
      };

      queryClient.setQueriesData(
        { queryKey: ["patients"] },
        (oldData: unknown) => {
          if (!oldData) return oldData;

          if (Array.isArray(oldData)) {
            return oldData.map((p: Patient) =>
              p.patientId === updated.patientId ? { ...p, ...patch } : p,
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
                patients: page.patients.map((p) =>
                  p.patientId === updated.patientId ? { ...p, ...patch } : p,
                ),
              })),
            };
          }

          return oldData;
        },
      );

      return { previousQueries };
    },
    onError: (_err, _updated, context) => {
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
