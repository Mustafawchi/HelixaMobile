import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { spacing } from "../../theme";

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function AppCard({ children, style }: AppCardProps) {
  return <View style={[styles.wrapper, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
  },
});
