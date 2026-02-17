export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  patientId: string | null;
  patientName: string | null;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface SaveChatSessionRequest {
  sessionId: string | null;
  messages: { role: string; content: string }[];
  patientId: string | null;
  patientName: string | null;
  title: string | null;
}

export interface SaveChatSessionResponse {
  success: boolean;
  sessionId: string;
}

export interface GetChatHistoryRequest {
  patientId?: string | null;
  limit?: number;
}

export interface GetChatHistoryResponse {
  success: boolean;
  sessions: ChatSession[];
}

export interface GetChatMessagesRequest {
  sessionId: string;
}

export interface GetChatMessagesResponse {
  success: boolean;
  messages: ChatMessage[];
}

export interface DeleteChatSessionRequest {
  sessionId: string;
}

export interface DeleteChatSessionResponse {
  success: boolean;
}
