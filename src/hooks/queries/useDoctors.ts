import { useQuery } from "@tanstack/react-query";
import { doctorsApi } from "../../api/endpoints/doctors";

export const useDoctors = (enabled = true) => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: doctorsApi.getAll,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};
