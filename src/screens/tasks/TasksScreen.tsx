import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../types/colors";
import { spacing, borderRadius } from "../../theme";
import { PATIENT_COLORS } from "../../types/task";
import { useAllTasks } from "../../hooks/queries/useTasks";
import {
  useToggleTask,
  useDeleteTask,
  useAddTask,
  useEditTask,
} from "../../hooks/mutations/useUpdateTask";
import TaskGroup from "./components/TaskGroup";
import EmptyTaskState from "./components/EmptyTaskState";
import SearchBar from "../../components/common/SearchBar";

type FilterMode = "all" | "todo" | "done";

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { data: patientsTaskData, isLoading, refetch } = useAllTasks();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Mutations
  const toggleMutation = useToggleTask({
    onError: (error) => console.error("Toggle task error:", error),
  });
  const deleteMutation = useDeleteTask({
    onError: (error) => console.error("Delete task error:", error),
  });
  const addMutation = useAddTask({
    onError: (error) => console.error("Add task error:", error),
  });
  const editMutation = useEditTask({
    onError: (error) => console.error("Edit task error:", error),
  });

  // Build color map
  const patientColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!patientsTaskData) return map;
    const ids = patientsTaskData.map((p) => p.patientId).sort();
    ids.forEach((id, i) => {
      map[id] = PATIENT_COLORS[i % PATIENT_COLORS.length];
    });
    return map;
  }, [patientsTaskData]);

  // Filter and search
  const filteredGroups = useMemo(() => {
    if (!patientsTaskData) return [];

    return patientsTaskData
      .map((patient) => {
        let tasks = patient.tasks;

        // Apply filter
        if (filter === "todo") {
          tasks = tasks.filter((t) => !t.completed);
        } else if (filter === "done") {
          tasks = tasks.filter((t) => t.completed);
        }

        // Apply search
        if (search.trim()) {
          const q = search.toLowerCase();
          const nameMatch = patient.patientName.toLowerCase().includes(q);
          if (!nameMatch) {
            tasks = tasks.filter((t) => t.text.toLowerCase().includes(q));
          }
        }

        return {
          ...patient,
          tasks,
          color: patientColorMap[patient.patientId] || PATIENT_COLORS[0],
        };
      })
      .filter((group) => group.tasks.length > 0);
  }, [patientsTaskData, filter, search, patientColorMap]);

  // Counts
  const totalPending = useMemo(() => {
    if (!patientsTaskData) return 0;
    return patientsTaskData.reduce(
      (sum, p) => sum + p.tasks.filter((t) => !t.completed).length,
      0,
    );
  }, [patientsTaskData]);

  const totalCompleted = useMemo(() => {
    if (!patientsTaskData) return 0;
    return patientsTaskData.reduce(
      (sum, p) => sum + p.tasks.filter((t) => t.completed).length,
      0,
    );
  }, [patientsTaskData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleToggle = useCallback(
    (patientId: string, taskIndex: number) => {
      toggleMutation.mutate({ patientId, taskIndex });
    },
    [toggleMutation],
  );

  const handleDelete = useCallback(
    (patientId: string, taskIndex: number) => {
      deleteMutation.mutate({ patientId, taskIndex });
    },
    [deleteMutation],
  );

  const handleEdit = useCallback(
    (patientId: string, taskIndex: number, newText: string) => {
      editMutation.mutate({ patientId, taskIndex, newText });
    },
    [editMutation],
  );

  const handleAdd = useCallback(
    (patientId: string, text: string) => {
      addMutation.mutate({ patientId, newText: text });
    },
    [addMutation],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>
          {totalPending} pending · {totalCompleted} completed
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks..."
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(["all", "todo", "done"] as FilterMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.filterChip,
              filter === mode && styles.filterChipActive,
            ]}
            onPress={() => setFilter(mode)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === mode && styles.filterChipTextActive,
              ]}
            >
              {mode === "all" ? "All" : mode === "todo" ? "To Do" : "Done"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            filteredGroups.length === 0
              ? styles.emptyContentContainer
              : styles.contentContainer
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {filteredGroups.length === 0 ? (
            <EmptyTaskState />
          ) : (
            filteredGroups.map((group) => (
              <TaskGroup
                key={group.patientId}
                patientId={group.patientId}
                patientName={group.patientName}
                color={group.color}
                tasks={group.tasks}
                onToggleTask={handleToggle}
                onDeleteTask={handleDelete}
                onEditTask={handleEdit}
                onAddTask={handleAdd}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyContentContainer: {
    flex: 1,
  },
});
