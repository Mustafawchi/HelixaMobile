import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../../components/common/AppCard";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing } from "../../../theme";
import type { Patient } from "../../../types/patient";

interface NewPatientCardProps {
  patient: Patient;
  onPress: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

const AVATAR_COLORS = [
  "#65d6c2",
  "#ea964b",
  "#8a6adf",
  "#5caef7",
  "#e67ab8",
  "#6bcf7b",
];

function getInitials(patient: Patient): string {
  const first = (patient.firstName || patient.name || "").trim();
  const last = (patient.lastName || "").trim();

  const firstLetter = first.charAt(0);
  const lastLetter = last.charAt(0);

  if (firstLetter && lastLetter) {
    return `${firstLetter}${lastLetter}`.toUpperCase();
  }

  const nameParts = (patient.name || "").trim().split(/\s+/).filter(Boolean);
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return "P";
}

function getAvatarColor(patient: Patient): string {
  const key = `${patient.patientId}-${patient.name}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatLastActivity(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDayStart = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );
  const diffDays = Math.floor(
    (dayStart.getTime() - itemDayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function RightActions({
  translation,
  onEdit,
  onDelete,
}: {
  translation: SharedValue<number>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translation.value,
      [-160, -80, 0],
      [1, 0.8, 0],
      "clamp",
    );
    return { transform: [{ scale }] };
  });

  return (
    <View style={styles.actionsRow}>
      <TouchableOpacity
        style={styles.editAction}
        onPress={onEdit}
        activeOpacity={0.7}
      >
        <Reanimated.View style={[styles.actionContent, animatedStyle]}>
          <Ionicons name="pencil" size={20} color={COLORS.white} />
          <Text style={styles.actionText}>Edit</Text>
        </Reanimated.View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={onDelete}
        activeOpacity={0.7}
      >
        <Reanimated.View style={[styles.actionContent, animatedStyle]}>
          <Ionicons name="trash" size={20} color={COLORS.white} />
          <Text style={styles.actionText}>Delete</Text>
        </Reanimated.View>
      </TouchableOpacity>
    </View>
  );
}

export default function NewPatientCard({
  patient,
  onPress,
  onEdit,
  onDelete,
}: NewPatientCardProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const rowHeight = useRef(new Animated.Value(1)).current;

  const handleDelete = useCallback(() => {
    Animated.timing(rowHeight, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onDelete(patient);
    });
  }, [onDelete, patient, rowHeight]);

  const handleEditSwipe = useCallback(() => {
    swipeableRef.current?.close();
    onEdit(patient);
  }, [onEdit, patient]);

  const renderRightActions = useCallback(
    (_progress: SharedValue<number>, translation: SharedValue<number>) => (
      <RightActions
        translation={translation}
        onEdit={handleEditSwipe}
        onDelete={handleDelete}
      />
    ),
    [handleDelete, handleEditSwipe],
  );

  const initials = getInitials(patient);
  const avatarColor = getAvatarColor(patient);
  const noteLabel = `${patient.noteCount} ${patient.noteCount === 1 ? "Note" : "Notes"}`;
  const activityText = formatLastActivity(patient.lastModified);

  return (
    <AppCard>
      <Animated.View
        style={{
          width: "100%",
          maxHeight: rowHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          opacity: rowHeight,
          transform: [
            {
              scale: rowHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }}
      >
        <ReanimatedSwipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          overshootRight={false}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(patient)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${patient.name}, ${noteLabel}, last activity ${activityText}`}
          >
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>
                {patient.name}
              </Text>
              <Text style={styles.activity}>
                Last activity · {activityText}
              </Text>
            </View>

            <View style={styles.rightSection}>
              <View style={styles.notePill}>
                <Text style={styles.notePillText}>{noteLabel}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(patient)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${patient.name}`}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={16}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ReanimatedSwipeable>
      </Animated.View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    marginBottom: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 96,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2b2f38",
    marginBottom: 3,
  },
  activity: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  rightSection: {
    width: 96,
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    alignSelf: "stretch",
  },
  notePill: {
    backgroundColor: "#57b867",
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 88,
    alignItems: "center",
  },
  notePillText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: "700",
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#edf3f0",
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: spacing.sm,
  },
  editAction: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    width: 76,
    borderRadius: borderRadius.lg,
    marginRight: 6,
  },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    width: 76,
    borderRadius: borderRadius.lg,
    marginRight: 10,
  },
  actionContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
