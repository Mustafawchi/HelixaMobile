import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api/endpoints/chat";
import { chatKeys } from "../queries/useChat";
import type { ChatSession } from "../../types/chat";

export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteChatSession,
    onMutate: async (sessionId: string) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.all });

      const previousHistory = queryClient.getQueryData<ChatSession[]>(
        chatKeys.history(),
      );

      queryClient.setQueryData<ChatSession[]>(chatKeys.history(), (old) =>
        old ? old.filter((s) => s.id !== sessionId) : [],
      );

      return { previousHistory };
    },
    onError: (_err, _sessionId, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(chatKeys.history(), context.previousHistory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
};
