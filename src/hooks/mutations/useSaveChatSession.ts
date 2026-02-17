import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api/endpoints/chat";
import { chatKeys } from "../queries/useChat";

export const useSaveChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.saveChatSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
};
