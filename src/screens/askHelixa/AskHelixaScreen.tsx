import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../types/colors";
import { spacing } from "../../theme";
import ChatBubble from "./components/ChatBubble";
import ThinkingIndicator from "./components/ThinkingIndicator";
import ChatInput from "./components/ChatInput";
import PatientContextSelector, {
  type PatientOption,
} from "./components/PatientContextSelector";
import ChatHistoryDrawer from "./components/ChatHistoryDrawer";
import { useChatHistory, useChatMessages } from "../../hooks/queries/useChat";
import { useDeleteChatSession } from "../../hooks/mutations/useDeleteChatSession";
import { useSaveChatSession } from "../../hooks/mutations/useSaveChatSession";
import { chatApi } from "../../api/endpoints/chat";
import type { ChatMessage } from "../../types/chat";

const GENERAL_CONTEXT: PatientOption = { id: null, name: "General Questions" };

export default function AskHelixaScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionRestoredRef = useRef(false);

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  // undefined = AsyncStorage henüz okunmadı, null = kayıtlı session yok
  const [savedSessionId, setSavedSessionId] = useState<string | null | undefined>(undefined);
  const [selectedPatient, setSelectedPatient] =
    useState<PatientOption>(GENERAL_CONTEXT);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: sessions = [] } = useChatHistory();
  const { data: sessionMessages, isLoading: isLoadingSession } =
    useChatMessages(activeSessionId);
  const deleteChatSession = useDeleteChatSession();
  const saveChatSession = useSaveChatSession();

  // When session messages load from server, sync to local state
  const prevSessionIdRef = useRef<string | null>(null);
  if (
    activeSessionId &&
    sessionMessages &&
    prevSessionIdRef.current !== activeSessionId
  ) {
    prevSessionIdRef.current = activeSessionId;
    setLocalMessages(sessionMessages);
  }

  const messages = localMessages;
  const hasMessages = messages.length > 0;
  const isWaitingForResponse =
    isStreaming && messages[messages.length - 1]?.role !== "assistant";

  useEffect(() => {
    if (hasMessages) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    const event = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(event, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => sub.remove();
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
      };
      const updatedMessages = [...localMessages, userMessage];
      setLocalMessages(updatedMessages);
      setIsStreaming(true);

      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const patientId = selectedPatient.id;

      await chatApi.sendMessage(
        apiMessages,
        patientId,
        // onChunk
        (chunk) => {
          setLocalMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + chunk },
              ];
            }
            return [
              ...prev,
              { id: "streaming", role: "assistant", content: chunk },
            ];
          });
        },
        // onDone
        async (fullContent) => {
          setIsStreaming(false);
          const finalMessages: ChatMessage[] = [
            ...updatedMessages,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              content: fullContent,
            },
          ];
          setLocalMessages(finalMessages);

          // Save session
          try {
            const sessionId = await saveChatSession.mutateAsync({
              sessionId: activeSessionId,
              messages: finalMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              patientId,
              patientName: selectedPatient.id ? selectedPatient.name : null,
              title: null,
            });
            if (!activeSessionId) {
              setActiveSessionId(sessionId);
              prevSessionIdRef.current = sessionId;
            }
          } catch (error) {
            console.error("Failed to save chat session:", error);
          }
        },
        // onError
        (error) => {
          setIsStreaming(false);
          console.error("Chat error:", error);
          setLocalMessages((prev) => {
            const filtered = prev.filter((m) => m.id !== "streaming");
            return [
              ...filtered,
              {
                id: `e-${Date.now()}`,
                role: "assistant",
                content:
                  "Sorry, I encountered an error processing your request. Please try again.",
              },
            ];
          });
        },
        abortController.signal,
      );

      setIsStreaming(false);
    },
    [isStreaming, localMessages, selectedPatient, activeSessionId, saveChatSession],
  );

  const handleNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLocalMessages([]);
    setActiveSessionId(null);
    setIsStreaming(false);
    prevSessionIdRef.current = null;
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setActiveSessionId(sessionId);
    setLocalMessages([]);
    setIsStreaming(false);
    prevSessionIdRef.current = null;
  }, []);

  // Faz 1: Mount'ta AsyncStorage'dan son session ID'yi oku
  useEffect(() => {
    AsyncStorage.getItem("helixa_last_session_id").then((id) => {
      setSavedSessionId(id ?? null);
    });
  }, []);

  // Faz 2: Sessions ve savedSessionId hazır olunca son sohbeti restore et
  useEffect(() => {
    if (savedSessionId === undefined || sessions.length === 0 || activeSessionId) return;
    if (sessionRestoredRef.current) return;

    const sessionExists = savedSessionId && sessions.some((s) => s.id === savedSessionId);
    const sessionToSelect = sessionExists ? savedSessionId : sessions[0].id;

    sessionRestoredRef.current = true;
    handleSelectSession(sessionToSelect);
  }, [savedSessionId, sessions, activeSessionId, handleSelectSession]);

  // activeSessionId değişince AsyncStorage'a kaydet
  useEffect(() => {
    if (activeSessionId) {
      AsyncStorage.setItem("helixa_last_session_id", activeSessionId);
    } else {
      AsyncStorage.removeItem("helixa_last_session_id");
    }
  }, [activeSessionId]);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      deleteChatSession.mutate(sessionId);
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    },
    [activeSessionId, deleteChatSession, handleNewChat],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.white} />
          <Text style={styles.headerTitle}>Ask Helixa</Text>
        </View>
        <View style={styles.menuButton} />
      </View>

      {/* Patient Context */}
      <PatientContextSelector
        selected={selectedPatient}
        onSelect={setSelectedPatient}
        onOpenChange={setContextOpen}
      />

      {/* Chat Body */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoadingSession ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : hasMessages || isWaitingForResponse ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id ?? item.content}
            renderItem={({ item }) => <ChatBubble message={item} />}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={
              isWaitingForResponse ? <ThinkingIndicator /> : null
            }
          />
        ) : (
          <Pressable style={styles.emptyState} onPress={Keyboard.dismiss}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={48}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>Ask Helixa</Text>
            <Text style={styles.emptySubtitle}>
              Ask clinical questions, get insights about your patients, or
              explore medical knowledge.
            </Text>
          </Pressable>
        )}

        {/* Input */}
        {!contextOpen && (
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        )}
      </KeyboardAvoidingView>

      {/* Drawer */}
      <ChatHistoryDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        sessions={sessions.map((s) => ({
          id: s.id,
          title: s.title,
          lastMessageAt: s.lastMessageAt,
          patientId: s.patientId,
          patientName: s.patientName,
        }))}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLighter,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
