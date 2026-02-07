import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/endpoints/user";

export const useUser = (enabled = true) => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: userApi.getProfile,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};
