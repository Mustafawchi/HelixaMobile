import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api/endpoints/chat";
import { chatKeys } from "../queries/useChat";
import type { ChatSession } from "../../types/chat";

/**
 * Hook to save a chat session.
 * New session → prepend to history cache (no refetch).
 * Existing session → no cache change needed (append-only).
 */
export const useSaveChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.saveChatSession,
    onSuccess: (sessionId, variables) => {
      if (variables.sessionId === null) {
        const newSession: ChatSession = {
          id: sessionId,
          title:
            variables.messages.find((m) => m.role === "user")?.content?.substring(0, 60) ||
            "New Chat",
          patientId: variables.patientId,
          patientName: variables.patientName,
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          messageCount: variables.messages.length,
        };

        queryClient.setQueryData<ChatSession[]>(chatKeys.history(), (old) =>
          old ? [newSession, ...old] : [newSession],
        );
      }
    },
  });
};
