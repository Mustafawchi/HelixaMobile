import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../../api/endpoints/tasks";
import type { UpdateTaskRequest } from "../../types/task";

interface TaskMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useToggleTask = (opts?: TaskMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { patientId: string; taskIndex: number }) =>
      tasksApi.updateTask({ ...params, action: "toggle" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "all"] });
      opts?.onSuccess?.();
    },
    onError: (error: Error) => opts?.onError?.(error),
  });
};

export const useDeleteTask = (opts?: TaskMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { patientId: string; taskIndex: number }) =>
      tasksApi.updateTask({ ...params, action: "delete" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "all"] });
      opts?.onSuccess?.();
    },
    onError: (error: Error) => opts?.onError?.(error),
  });
};

export const useAddTask = (opts?: TaskMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { patientId: string; newText: string }) =>
      tasksApi.updateTask({ ...params, action: "add" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "all"] });
      opts?.onSuccess?.();
    },
    onError: (error: Error) => opts?.onError?.(error),
  });
};

export const useReorderTask = (opts?: TaskMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { patientId: string; newOrder: number[] }) =>
      tasksApi.updateTask({ ...params, action: "reorder" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "all"] });
      opts?.onSuccess?.();
    },
    onError: (error: Error) => opts?.onError?.(error),
  });
};

export const useEditTask = (opts?: TaskMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      patientId: string;
      taskIndex: number;
      newText: string;
    }) => tasksApi.updateTask({ ...params, action: "edit" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "all"] });
      opts?.onSuccess?.();
    },
    onError: (error: Error) => opts?.onError?.(error),
  });
};
