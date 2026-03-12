export interface Task {
  text: string;
  completed: boolean;
  addedAt: string;
}

export interface PatientTasksData {
  patientId: string;
  patientName: string;
  createdAt: string;
  tasks: Task[];
  taskLastUpdated: string | null;
  taskLastNoteId: string | null;
}

export type TaskAction = "toggle" | "edit" | "delete" | "add" | "reorder";

export interface UpdateTaskRequest {
  patientId: string;
  action: TaskAction;
  taskIndex?: number;
  newText?: string;
  newOrder?: number[];
}

export interface ExtractTasksRequest {
  notesContent: string;
  existingTasks?: Task[];
  matterType: string;
}

export interface ExtractTasksResponse {
  success: boolean;
  tasks: Task[];
  isUpdate: boolean;
  hasNewTasks: boolean;
  extractedAt: string;
}

export const PATIENT_COLORS = [
  "#1a4d3e",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#0891b2",
  "#4f46e5",
  "#059669",
  "#d97706",
  "#be123c",
];
