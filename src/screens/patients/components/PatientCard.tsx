import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../../components/common/AppCard";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import { formatDate } from "../../../utils/formatting";
import type { Patient } from "../../../types/patient";

interface PatientCardProps {
  patient: Patient;
  onPress: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export default function PatientCard({
  patient,
  onPress,
  onEdit,
  onDelete,
}: PatientCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const rowHeight = useRef(new Animated.Value(1)).current;

  const handleDelete = useCallback(() => {
    Animated.timing(rowHeight, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onDelete(patient);
    });
  }, [patient, onDelete, rowHeight]);

  const renderRightActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: [-100, -50, 0],
        outputRange: [1, 0.8, 0],
        extrapolate: "clamp",
      });

      return (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[styles.deleteContent, { transform: [{ scale }] }]}
          >
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.deleteText}>Delete</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    },
    [handleDelete],
  );

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
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          overshootRight={false}
        >
          <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(patient)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="folder" size={28} color={COLORS.primary} />
            </View>

            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>
                {patient.name}
              </Text>
              <Text style={styles.noteCount}>
                {patient.noteCount}{" "}
                {patient.noteCount === 1 ? "note" : "notes"}
              </Text>
              <Text style={styles.dates}>
                Created: {formatDate(patient.createdAt)}
              </Text>
              <Text style={styles.dates}>
                Modified: {formatDate(patient.lastModified)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(patient)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    width: "100%",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.primaryLighter,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  noteCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dates: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.primaryLighter,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    marginRight: 10,
  },
  deleteContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
