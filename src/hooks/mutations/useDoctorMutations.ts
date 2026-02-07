import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorsApi } from "../../api/endpoints/doctors";
import type { CreateDoctorPayload, UpdateDoctorPayload } from "../../types/generate";

export const useAddDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDoctorPayload) => doctorsApi.add(payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateDoctorPayload) =>
      doctorsApi.update(id, payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => doctorsApi.remove(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};
