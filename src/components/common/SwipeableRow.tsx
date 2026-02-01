import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { COLORS } from "../../types/colors";
import { spacing, borderRadius } from "../../theme";

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface RightActionsProps {
  dragX: SharedValue<number>;
  onEdit?: () => void;
  onDelete?: () => void;
}

function RightActions({ dragX, onEdit, onDelete }: RightActionsProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(dragX.value, [-140, -70, 0], [1, 0.85, 0], {
      extrapolateLeft: Extrapolation.CLAMP,
      extrapolateRight: Extrapolation.CLAMP,
    });
    return { transform: [{ scale }] };
  }, [dragX]);

  return (
    <Animated.View style={[styles.actions, animatedStyle]}>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Ionicons name="pencil" size={18} color={COLORS.white} />
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash" size={18} color={COLORS.white} />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SwipeableRow({
  children,
  onEdit,
  onDelete,
}: SwipeableRowProps) {
  return (
    <ReanimatedSwipeable
      renderRightActions={(_progress, dragX) => (
        <RightActions dragX={dragX} onEdit={onEdit} onDelete={onDelete} />
      )}
      overshootRight={false}
    >
      <View>{children}</View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginRight: 10,
  },
  editButton: {
    width: 70,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 70,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.white,
  },
});
