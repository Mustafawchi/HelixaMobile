import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import type { ChatMessage } from "../../../types/chat";

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.bubbleUser}>
          <Text style={styles.textUser}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>H</Text>
        </View>
        <Text style={styles.avatarLabel}>Helixa</Text>
      </View>
      <Markdown style={markdownStyles}>{message.content}</Markdown>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  strong: {
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  em: {
    fontStyle: "italic",
  },
  heading1: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading2: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading3: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  bullet_list: {
    marginBottom: spacing.sm,
  },
  ordered_list: {
    marginBottom: spacing.sm,
  },
  list_item: {
    marginBottom: spacing.xs,
  },
  code_inline: {
    fontSize: 14,
    backgroundColor: COLORS.surfaceSecondary,
    color: COLORS.textPrimary,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  fence: {
    fontSize: 14,
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  blockquote: {
    backgroundColor: COLORS.surfaceSecondary,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
});

const styles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: spacing.md,
  },
  bubbleUser: {
    maxWidth: "78%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.sm,
    backgroundColor: COLORS.primary,
  },
  textUser: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.white,
  },
  assistantRow: {
    marginBottom: spacing.lg,
    paddingRight: spacing.lg,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
});
