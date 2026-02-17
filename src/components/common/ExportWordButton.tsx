import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../types/colors";
import { borderRadius, spacing } from "../../theme";

interface ExportWordButtonProps {
  onPress: () => void;
  isExporting?: boolean;
  variant?: "filled" | "outlined";
}

export default function ExportWordButton({
  onPress,
  isExporting = false,
  variant = "filled",
}: ExportWordButtonProps) {
  const isFilled = variant === "filled";

  return (
    <Pressable
      style={[
        styles.base,
        isFilled ? styles.filled : styles.outlined,
        isExporting && { opacity: 0.6 },
      ]}
      onPress={onPress}
      disabled={isExporting}
    >
      <Ionicons
        name="document-outline"
        size={isFilled ? 16 : 18}
        color={isFilled ? COLORS.white : COLORS.word}
      />
      <Text
        style={[
          styles.text,
          isFilled ? styles.filledText : { color: COLORS.word },
        ]}
      >
        {isExporting ? "Exporting..." : "Export Word"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  filled: {
    paddingVertical: 13,
    borderRadius: borderRadius.xl,
    backgroundColor: COLORS.word,
    shadowColor: COLORS.word,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  outlined: {
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
  },
  filledText: {
    color: COLORS.white,
  },
});
