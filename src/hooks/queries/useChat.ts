import { useQuery } from "@tanstack/react-query";
import { chatApi } from "../../api/endpoints/chat";

export const chatKeys = {
  all: ["chats"] as const,
  history: () => [...chatKeys.all, "history"] as const,
  messages: (sessionId: string) =>
    [...chatKeys.all, "messages", sessionId] as const,
};

/**
 * Hook to fetch chat history (list of sessions)
 */
export const useChatHistory = () => {
  return useQuery({
    queryKey: chatKeys.history(),
    queryFn: () => chatApi.getChatHistory(),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch messages for a specific session
 */
export const useChatMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: chatKeys.messages(sessionId || ""),
    queryFn: () => chatApi.getChatMessages(sessionId!),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });
};
