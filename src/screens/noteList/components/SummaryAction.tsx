import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";

interface SummaryActionProps {
  onPress?: () => void;
}

export default function SummaryAction({ onPress }: SummaryActionProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Ionicons name="sparkles-outline" size={16} color={COLORS.gold} />
        <Text style={styles.text}>Smart Summary</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: "transparent",
    borderRadius: borderRadius.lg,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  text: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: "600",
  },
});
