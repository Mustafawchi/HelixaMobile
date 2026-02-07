import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/endpoints/user";
import type { UserProfile } from "../../types/user";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onMutate: async (updatedData: Partial<UserProfile>) => {
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });

      const previousProfile = queryClient.getQueryData<UserProfile | null>([
        "user",
        "profile",
      ]);

      if (previousProfile) {
        queryClient.setQueryData<UserProfile | null>(["user", "profile"], {
          ...previousProfile,
          ...updatedData,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["user", "profile"], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
};
