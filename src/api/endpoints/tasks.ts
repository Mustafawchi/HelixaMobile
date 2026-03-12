import { loggedCallable } from "../../utils/networkLogger";
import { audioApiClient } from "../client";
import { functions } from "../../config/firebase";
import type {
  PatientTasksData,
  UpdateTaskRequest,
  ExtractTasksRequest,
  ExtractTasksResponse,
} from "../../types/task";

interface GetAllTasksResponse {
  success: boolean;
  patients: PatientTasksData[];
}

interface UpdateTaskResponse {
  success: boolean;
}

export const tasksApi = {
  getAll: async (): Promise<PatientTasksData[]> => {
    const getAllTasks = loggedCallable<void, GetAllTasksResponse>(
      functions,
      "getAllTasks",
    );
    const result = await getAllTasks();

    if (!result.data.success) {
      throw new Error("Failed to load tasks");
    }
    return result.data.patients;
  },

  updateTask: async (params: UpdateTaskRequest): Promise<UpdateTaskResponse> => {
    const updateTask = loggedCallable<UpdateTaskRequest, UpdateTaskResponse>(
      functions,
      "updateTask",
    );
    const result = await updateTask(params);

    if (!result.data.success) {
      throw new Error("Failed to update task");
    }
    return result.data;
  },

  extractTasks: async (
    params: ExtractTasksRequest,
  ): Promise<ExtractTasksResponse> => {
    const response = await audioApiClient.post<ExtractTasksResponse>(
      "/extract-tasks",
      params,
      { timeout: 60000 },
    );

    if (!response.data.success) {
      throw new Error("Task extraction failed");
    }
    return response.data;
  },
};
