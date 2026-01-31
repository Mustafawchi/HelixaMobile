import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { COLORS } from "../../types/colors";
import { borderRadius, spacing } from "../../theme";

interface AppPopupProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  dismissOnBackdrop?: boolean;
}

export default function AppPopup({
  visible,
  onClose,
  children,
  contentStyle,
  dismissOnBackdrop = true,
}: AppPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropPressable}
          onPress={dismissOnBackdrop ? onClose : undefined}
        />
        <View style={[styles.card, contentStyle]}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
});
