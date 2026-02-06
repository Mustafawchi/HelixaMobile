import React from "react";
import { Modal, Pressable, StyleSheet, View, Text } from "react-native";
import { COLORS } from "../../types/colors";
import { borderRadius, spacing, typography } from "../../theme";

interface SortPopupProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SortPopup({
  visible,
  title = "Sort",
  onClose,
  children,
}: SortPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    textAlign: "center",
    color: COLORS.textPrimary,
    marginBottom: spacing.lg,
  },
  content: {
    gap: spacing.md,
  },
});
