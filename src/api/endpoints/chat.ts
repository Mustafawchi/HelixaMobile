import { loggedCallable } from "../../utils/networkLogger";
import { functions } from "../../config/firebase";
import { firebaseAuth } from "../../config/firebase";
import type {
  ChatMessage,
  ChatSession,
  SaveChatSessionRequest,
  SaveChatSessionResponse,
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  GetChatMessagesRequest,
  GetChatMessagesResponse,
  DeleteChatSessionRequest,
  DeleteChatSessionResponse,
} from "../../types/chat";

const AUDIO_SERVER_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://australia-southeast2-helixa-ai.cloudfunctions.net/audioProcessing";

/**
 * Parse SSE lines from raw text, extracting new lines since lastIndex.
 */
function parseSSEChunks(
  raw: string,
  lastIndex: number,
): { lines: string[]; newIndex: number } {
  const newText = raw.slice(lastIndex);
  const parts = newText.split("\n");
  // Last part might be incomplete — don't consume it
  const complete = parts.slice(0, -1);
  const consumed = complete.join("\n").length + 1; // +1 for the trailing \n
  return { lines: complete, newIndex: lastIndex + consumed };
}

export const chatApi = {
  /**
   * Send chat message with SSE streaming via XMLHttpRequest
   * (React Native compatible — no ReadableStream needed)
   */
  sendMessage: (
    messages: { role: string; content: string }[],
    patientId: string | null,
    onChunk: (content: string) => void,
    onDone: (fullContent: string) => void,
    onError: (error: Error) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    const user = firebaseAuth.currentUser;

    if (!user) {
      onError(new Error("User not authenticated"));
      return Promise.resolve();
    }

    return user.getIdToken().then(
      (idToken) =>
        new Promise<void>((resolve) => {
          let fullContent = "";
          let doneCalled = false;
          let lastParsedIndex = 0;

          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${AUDIO_SERVER_URL}/chat-with-helixa`);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);

          // Handle abort
          if (signal) {
            signal.addEventListener("abort", () => {
              xhr.abort();
              resolve();
            });
          }

          const processChunk = (raw: string) => {
            const { lines, newIndex } = parseSSEChunks(raw, lastParsedIndex);
            lastParsedIndex = newIndex;

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              try {
                const eventData = JSON.parse(line.slice(6));

                if (eventData.content) {
                  fullContent += eventData.content;
                  onChunk(eventData.content);
                }

                if (eventData.success && !doneCalled) {
                  doneCalled = true;
                  onDone(fullContent);
                }

                if (eventData.error) {
                  if (!doneCalled) {
                    doneCalled = true;
                    onError(new Error(eventData.error));
                  }
                }
              } catch {
                // Ignore partial JSON
              }
            }
          };

          xhr.onprogress = () => {
            processChunk(xhr.responseText);
          };

          xhr.onload = () => {
            // Process any remaining data
            processChunk(xhr.responseText);
            if (fullContent && !doneCalled) {
              doneCalled = true;
              onDone(fullContent);
            }
            resolve();
          };

          xhr.onerror = () => {
            if (!doneCalled) {
              doneCalled = true;
              onError(new Error("Chat request failed"));
            }
            resolve();
          };

          xhr.ontimeout = () => {
            if (!doneCalled) {
              doneCalled = true;
              onError(new Error("Chat request timed out"));
            }
            resolve();
          };

          xhr.send(JSON.stringify({ messages, patientId }));
        }),
    );
  },

  /**
   * Get chat history (list of sessions)
   */
  getChatHistory: async (
    params: GetChatHistoryRequest = {},
  ): Promise<ChatSession[]> => {
    const getChatHistoryFn = loggedCallable<
      GetChatHistoryRequest,
      GetChatHistoryResponse
    >(functions, "getChatHistory");

    const result = await getChatHistoryFn(params);
    if (!result.data.success) {
      throw new Error("Failed to load chat history");
    }
    return result.data.sessions;
  },

  /**
   * Get messages for a specific session
   */
  getChatMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const getChatMessagesFn = loggedCallable<
      GetChatMessagesRequest,
      GetChatMessagesResponse
    >(functions, "getChatMessages");

    const result = await getChatMessagesFn({ sessionId });
    if (!result.data.success) {
      throw new Error("Failed to load chat messages");
    }
    return result.data.messages;
  },

  /**
   * Save a chat session
   */
  saveChatSession: async (
    params: SaveChatSessionRequest,
  ): Promise<string> => {
    const saveChatSessionFn = loggedCallable<
      SaveChatSessionRequest,
      SaveChatSessionResponse
    >(functions, "saveChatSession");

    const result = await saveChatSessionFn(params);
    if (!result.data.success) {
      throw new Error("Failed to save chat session");
    }
    return result.data.sessionId;
  },

  /**
   * Delete a chat session
   */
  deleteChatSession: async (sessionId: string): Promise<void> => {
    const deleteChatSessionFn = loggedCallable<
      DeleteChatSessionRequest,
      DeleteChatSessionResponse
    >(functions, "deleteChatSession");

    const result = await deleteChatSessionFn({ sessionId });
    if (!result.data.success) {
      throw new Error("Failed to delete chat session");
    }
  },
};
