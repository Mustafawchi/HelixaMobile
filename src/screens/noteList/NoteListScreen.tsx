import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../../types/colors";
import { spacing, borderRadius } from "../../theme";
import { usePatientNotes } from "../../hooks/queries/useNotes";
import { useUpdateNote } from "../../hooks/mutations/useUpdateNote";
import { useDeleteNote } from "../../hooks/mutations/useDeleteNote";
import { useDeleteNotes } from "../../hooks/mutations/useDeleteNotes";
import { useCreateNote } from "../../hooks/mutations/useCreateNote";
import SearchBar from "../../components/common/SearchBar";
import NoteCard from "./components/NoteCard";
import FilterSortBar from "./components/FilterSortBar";
import SummaryAction from "./components/SummaryAction";
import NewNoteButton from "./components/NewNoteButton";
import SelectionActionBar from "./components/SelectionActionBar";
import SelectionBottomBar from "./components/SelectionBottomBar";
import EditNotePopup from "./components/EditNotePopup";
import PatientDetails from "./components/PatientDetails";
import GenerateNotesPopup from "./components/GenerateNotesPopup";
import CreateNotePopup from "./components/CreateNotePopup";
import type { PatientsStackParamList } from "../../types/navigation";
import type { Note } from "../../types/note";

type NoteListRoute = RouteProp<PatientsStackParamList, "NoteList">;

export default function NoteListScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const route = useRoute<NoteListRoute>();
  const patientId = route.params?.patientId ?? "";
  const [search, setSearch] = useState("");
  const routePatientName = route.params?.patientName;
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);

  const { data, isLoading, error, refetch } = usePatientNotes(patientId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const deleteNotes = useDeleteNotes();
  const createNote = useCreateNote();
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const notes = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.notes);
  }, [data]);

  const patientDetails = data?.pages?.[0]?.patientDetails;
  const patientName =
    routePatientName ||
    [patientDetails?.firstName, patientDetails?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Patient";

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleLongPress = useCallback((note: Note) => {
    setSelectionMode(true);
    setSelectedIds(new Set([note.id]));
  }, []);

  const handleToggleSelect = useCallback((note: Note) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(note.id)) {
        next.delete(note.id);
      } else {
        next.add(note.id);
      }
      return next;
    });
  }, []);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(notes.map((n) => n.id)));
  }, [notes]);

  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note);
    setShowEditPopup(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setShowEditPopup(false);
    setEditingNote(null);
  }, []);

  const handleEditSave = useCallback(
    (payload: { noteId: string; title: string }) => {
      updateNote.mutate(
        { patientId, noteId: payload.noteId, title: payload.title },
        { onSettled: handleEditClose },
      );
    },
    [patientId, updateNote, handleEditClose],
  );

  const handleDeleteNote = useCallback(
    (note: Note) => {
      Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNote.mutate({ patientId, noteId: note.id }),
        },
      ]);
    },
    [patientId, deleteNote],
  );

  const handleBatchDelete = useCallback(() => {
    const count = selectedIds.size;
    Alert.alert(
      "Delete Notes",
      `Are you sure you want to delete ${count} note${count > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteNotes.mutate(
              { patientId, noteIds: Array.from(selectedIds) },
              {
                onSettled: () => {
                  setSelectionMode(false);
                  setSelectedIds(new Set());
                },
              },
            );
          },
        },
      ],
    );
  }, [patientId, selectedIds, deleteNotes]);

  const handleNotePress = useCallback(
    (note: Note) => {
      navigation.navigate("NoteDetail", {
        patientId,
        noteId: note.id,
        noteTitle: note.title,
        noteText: note.text,
        noteType: note.type,
      });
    },
    [patientId, navigation],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  }, [refetch]);

  const handleCreateNote = useCallback(
    (payload: { title: string; type: string }) => {
      setShowCreatePopup(false);
      navigation.navigate("NewNote", {
        patientId,
        patientName,
        consultationType: payload.type,
        consultationTitle: payload.title,
      });
    },
    [patientId, navigation],
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.8}
              onPress={() => setShowPatientDetails(true)}
            >
              <Ionicons name="person" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleGroup}>
            <Text style={styles.title}>{patientName}</Text>
          </View>

          <View style={styles.rightGroup}>
            <View style={styles.notesPill}>
              <Text style={styles.notesCount}>{notes.length}</Text>
              <Text style={styles.notesLabel}>notes</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {selectionMode ? (
          <SelectionActionBar
            onCancel={handleCancelSelection}
            onSelectAll={handleSelectAll}
            onGenerate={() => setShowGeneratePopup(true)}
          />
        ) : (
          <View style={styles.searchArea}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search notes..."
            />
            <FilterSortBar />
            <SummaryAction />
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : error ? (
          <Text style={styles.placeholder}>Failed to load notes.</Text>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NoteCard
                note={item}
                onPress={handleNotePress}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(item.id)}
                onLongPress={handleLongPress}
                onToggleSelect={handleToggleSelect}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            ListEmptyComponent={
              <Text style={styles.placeholder}>No notes yet.</Text>
            }
          />
        )}
      </View>

      <EditNotePopup
        visible={showEditPopup}
        note={editingNote}
        onClose={handleEditClose}
        onSave={handleEditSave}
        isSubmitting={updateNote.isPending}
      />
      <PatientDetails
        visible={showPatientDetails}
        initialValues={{
          firstName: patientDetails?.firstName || "",
          lastName: patientDetails?.lastName || "",
          dateOfBirth: patientDetails?.dateOfBirth || "",
          email: patientDetails?.email || "",
          homeAddress: patientDetails?.homeAddress || "",
          medicalHistorySummary: patientDetails?.medicalHistorySummary || "",
        }}
        onClose={() => setShowPatientDetails(false)}
        onSave={() => setShowPatientDetails(false)}
      />
      <GenerateNotesPopup
        visible={showGeneratePopup}
        onClose={() => setShowGeneratePopup(false)}
        onSummaryToPatient={() => setShowGeneratePopup(false)}
        onReferPatient={() => setShowGeneratePopup(false)}
      />

      <CreateNotePopup
        visible={showCreatePopup}
        onClose={() => setShowCreatePopup(false)}
        onCreate={handleCreateNote}
        isSubmitting={createNote.isPending}
      />

      {selectionMode && selectedIds.size > 0 ? (
        <SelectionBottomBar
          selectedCount={selectedIds.size}
          onPdf={() => {}}
          onWord={() => {}}
          onDelete={handleBatchDelete}
        />
      ) : (
        !selectionMode && (
          <NewNoteButton onPress={() => setShowCreatePopup(true)} />
        )
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleGroup: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notesPill: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 56,
  },
  notesCount: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
    lineHeight: 14,
  },
  notesLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: spacing.sm,
  },
  searchArea: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
