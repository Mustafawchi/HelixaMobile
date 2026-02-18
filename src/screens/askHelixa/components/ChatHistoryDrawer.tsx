import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

export interface ChatSessionItem {
  id: string;
  title: string;
  lastMessageAt: string;
  patientId: string | null;
  patientName: string | null;
}

interface ChatHistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  sessions: ChatSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

interface Section {
  title: string;
  data: ChatSessionItem[];
}

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

function buildSections(sessions: ChatSessionItem[]): Section[] {
  const generalSessions = sessions.filter((s) => !s.patientId);
  const patientSessions = sessions.filter((s) => s.patientId);

  const patientGroups: Record<string, ChatSessionItem[]> = {};
  patientSessions.forEach((s) => {
    const key = s.patientId!;
    if (!patientGroups[key]) patientGroups[key] = [];
    patientGroups[key].push(s);
  });

  const sections: Section[] = [];

  if (generalSessions.length > 0) {
    sections.push({ title: "GENERAL", data: generalSessions });
  }

  Object.entries(patientGroups).forEach(([, groupSessions]) => {
    sections.push({
      title: (groupSessions[0].patientName || "Unknown Patient").toUpperCase(),
      data: groupSessions,
    });
  });

  return sections;
}

export default function ChatHistoryDrawer({
  visible,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatHistoryDrawerProps) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, overlayOpacity]);

  if (!visible) return null;

  const sections = buildSections(sessions);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }], paddingTop: insets.top + spacing.md },
        ]}
        pointerEvents="auto"
      >
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            onNewChat();
            onClose();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.newChatText}>New Chat</Text>
        </TouchableOpacity>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionLabel}>{section.title}</Text>
          )}
          renderItem={({ item }) => {
            const isActive = item.id === activeSessionId;
            return (
              <TouchableOpacity
                style={[styles.sessionItem, isActive && styles.sessionActive]}
                onPress={() => {
                  onSelectSession(item.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={isActive ? COLORS.primary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.sessionTitle,
                    isActive && styles.sessionTitleActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteSession(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={15}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No chat history yet</Text>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingTop: spacing.md,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.lg,
    backgroundColor: COLORS.primary,
  },
  newChatText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  sessionActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  sessionTitle: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sessionTitleActive: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});
