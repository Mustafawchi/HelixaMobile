import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import type { Task } from "../../../types/task";

interface TaskItemProps {
  task: Task;
  taskIndex: number;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (newText: string) => void;
}

export default function TaskItem({
  task,
  taskIndex,
  onToggle,
  onDelete,
  onEdit,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.text) {
      onEdit(trimmed);
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        <Ionicons
          name={task.completed ? "checkbox" : "square-outline"}
          size={22}
          color={task.completed ? COLORS.primary : COLORS.textMuted}
        />
      </TouchableOpacity>

      {isEditing ? (
        <TextInput
          style={styles.editInput}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleSaveEdit}
          onSubmitEditing={handleSaveEdit}
          autoFocus
          returnKeyType="done"
        />
      ) : (
        <TouchableOpacity
          style={styles.textContainer}
          onPress={() => {
            setEditText(task.text);
            setIsEditing(true);
          }}
        >
          <Text
            style={[styles.text, task.completed && styles.textCompleted]}
            numberOfLines={2}
          >
            {task.text}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  checkbox: {
    padding: 2,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  textCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textMuted,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
  },
  deleteBtn: {
    padding: 4,
  },
});
