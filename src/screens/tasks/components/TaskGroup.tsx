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
import TaskItem from "./TaskItem";

interface TaskGroupProps {
  patientId: string;
  patientName: string;
  color: string;
  tasks: Task[];
  defaultExpanded?: boolean;
  onToggleTask: (patientId: string, taskIndex: number) => void;
  onDeleteTask: (patientId: string, taskIndex: number) => void;
  onEditTask: (patientId: string, taskIndex: number, newText: string) => void;
  onAddTask: (patientId: string, text: string) => void;
}

export default function TaskGroup({
  patientId,
  patientName,
  color,
  tasks,
  defaultExpanded = true,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
}: TaskGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleAdd = () => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    onAddTask(patientId, trimmed);
    setNewTaskText("");
    setShowAddInput(false);
  };

  return (
    <View style={styles.container}>
      {/* Group Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color={COLORS.textSecondary}
        />
        <View style={[styles.colorDot, { backgroundColor: color }]} />
        <Text style={styles.patientName} numberOfLines={1}>
          {patientName}
        </Text>
        <Text style={styles.badge}>
          {completedCount}/{tasks.length}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            setExpanded(true);
            setShowAddInput(true);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Tasks List */}
      {expanded && (
        <View style={styles.taskList}>
          {tasks.map((task, index) => (
            <TaskItem
              key={`${patientId}-${index}`}
              task={task}
              taskIndex={index}
              onToggle={() => onToggleTask(patientId, index)}
              onDelete={() => onDeleteTask(patientId, index)}
              onEdit={(newText) => onEditTask(patientId, index, newText)}
            />
          ))}

          {/* Add Task Input */}
          {showAddInput && (
            <View style={styles.addInputRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Add a task..."
                placeholderTextColor={COLORS.textMuted}
                value={newTaskText}
                onChangeText={setNewTaskText}
                onSubmitEditing={handleAdd}
                autoFocus
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addConfirmBtn,
                  !newTaskText.trim() && styles.addConfirmBtnDisabled,
                ]}
                onPress={handleAdd}
                disabled={!newTaskText.trim()}
              >
                <Text style={styles.addConfirmText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowAddInput(false);
                  setNewTaskText("");
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  patientName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  badge: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  addBtn: {
    padding: 2,
  },
  taskList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  addInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  addInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: COLORS.background,
    borderRadius: borderRadius.md,
  },
  addConfirmBtn: {
    paddingHorizontal: spacing.base,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.md,
  },
  addConfirmBtnDisabled: {
    opacity: 0.4,
  },
  addConfirmText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});
