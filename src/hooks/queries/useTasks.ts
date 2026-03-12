import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "../../api/endpoints/tasks";
import type { PatientTasksData } from "../../types/task";

export const useAllTasks = () => {
  return useQuery<PatientTasksData[], Error>({
    queryKey: ["tasks", "all"],
    queryFn: tasksApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
