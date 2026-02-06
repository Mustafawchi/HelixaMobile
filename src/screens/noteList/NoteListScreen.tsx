import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
import { useQueryClient } from "@tanstack/react-query";
import { COLORS } from "../../types/colors";
import { spacing, borderRadius } from "../../theme";
import { usePatientNotes } from "../../hooks/queries/useNotes";
import { useUpdateNote } from "../../hooks/mutations/useUpdateNote";
import { useDeleteNote } from "../../hooks/mutations/useDeleteNote";
import { useDeleteNotes } from "../../hooks/mutations/useDeleteNotes";
import { useCreateNote } from "../../hooks/mutations/useCreateNote";
import SearchBar from "../../components/common/SearchBar";
import NoteCard from "./components/NoteCard";
import FilterSortBar, { NoteTypeValue } from "./components/FilterSortBar";
import SummaryAction from "./components/SummaryAction";
import NewNoteButton from "./components/NewNoteButton";
import SelectionActionBar from "./components/SelectionActionBar";
import SelectionBottomBar from "./components/SelectionBottomBar";
import EditNotePopup from "./components/EditNotePopup";
import PatientDetails from "./components/PatientDetails";
import GenerateNotesPopup from "./components/GenerateNotesPopup";
import SortOptionsPopup, {
  type NoteSortKey,
} from "./components/SortOptionsPopup";
import { useUpdatePatient } from "../../hooks/mutations/useUpdatePatient";
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
  const [showSortPopup, setShowSortPopup] = useState(false);
  const [sortKey, setSortKey] = useState<NoteSortKey>("created-desc");
  const updatePatient = useUpdatePatient();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePatientNotes(patientId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const deleteNotes = useDeleteNotes();
  const createNote = useCreateNote();
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [filterType, setFilterType] = useState<NoteTypeValue>("all");

  const allNotes = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.notes);
  }, [data]);

  const notes = useMemo(() => {
    const filtered =
      filterType === "all"
        ? allNotes
        : allNotes.filter((note) => note.type === filterType);

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "created-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "edited-asc": {
          const aDate = a.lastEdited || a.updatedAt || a.createdAt;
          const bDate = b.lastEdited || b.updatedAt || b.createdAt;
          return new Date(aDate).getTime() - new Date(bDate).getTime();
        }
        case "edited-desc": {
          const aDate = a.lastEdited || a.updatedAt || a.createdAt;
          const bDate = b.lastEdited || b.updatedAt || b.createdAt;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });
    return sorted;
  }, [allNotes, filterType, sortKey]);

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

  useEffect(() => {
    if (!patientId) return;
    queryClient.removeQueries({ queryKey: ["notes", "list", patientId] });
    refetch();
  }, [filterType, sortKey, patientId, queryClient, refetch]);

  const overscrollStartRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const distancePastEnd =
        contentOffset.y + layoutMeasurement.height - contentSize.height;

      if (
        isDragging &&
        distancePastEnd > 12 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        if (!overscrollStartRef.current) {
          overscrollStartRef.current = Date.now();
        }
        setIsPulling(true);
      } else {
        overscrollStartRef.current = null;
        setIsPulling(false);
      }
    },
    [hasNextPage, isFetchingNextPage, isDragging],
  );

  const handleScrollEndDrag = useCallback(() => {
    setIsDragging(false);
    setIsPulling(false);
    if (overscrollStartRef.current) {
      const elapsed = Date.now() - overscrollStartRef.current;
      if (elapsed >= 200 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
      overscrollStartRef.current = null;
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const listFooter = useCallback(() => {
    if (!hasNextPage && !isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        {isFetchingNextPage ? (
          <>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.footerText}>Loading more...</Text>
          </>
        ) : (
          <Text style={styles.footerText}>Load more...</Text>
        )}
      </View>
    );
  }, [hasNextPage, isFetchingNextPage]);

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
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.patientDetailsButton}
            activeOpacity={0.8}
            onPress={() => setShowPatientDetails(true)}
          >
            <Text style={styles.title}>{patientName}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.notesPill}>
            <Text style={styles.notesCount}>{allNotes.length}</Text>
            <Text style={styles.notesLabel}>notes</Text>
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
            <FilterSortBar
              selectedFilter={filterType}
              onFilterChange={setFilterType}
              onSort={() => setShowSortPopup(true)}
            />
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
            onScrollBeginDrag={() => setIsDragging(true)}
            onScroll={handleScroll}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={() => {
              setIsDragging(false);
              setIsPulling(false);
              overscrollStartRef.current = null;
            }}
            scrollEventThrottle={16}
            ListFooterComponent={listFooter}
            ListEmptyComponent={
              <Text style={styles.placeholder}>
                {filterType !== "all" ? "No notes match the filter." : "No notes yet."}
              </Text>
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
        onSave={(payload) => {
          updatePatient.mutate({
            patientId,
            firstName: payload.firstName || undefined,
            lastName: payload.lastName || undefined,
            dateOfBirth: payload.dateOfBirth || undefined,
            email: payload.email || undefined,
            homeAddress: payload.homeAddress || undefined,
          });
          setShowPatientDetails(false);
        }}
        isSubmitting={updatePatient.isPending}
      />
      <GenerateNotesPopup
        visible={showGeneratePopup}
        onClose={() => setShowGeneratePopup(false)}
        onSummaryToPatient={() => setShowGeneratePopup(false)}
        onReferPatient={() => setShowGeneratePopup(false)}
      />
      <SortOptionsPopup
        visible={showSortPopup}
        selected={sortKey}
        onSelect={(key) => {
          setSortKey(key);
          setShowSortPopup(false);
        }}
        onClose={() => setShowSortPopup(false)}
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
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  patientDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: spacing.sm,
    gap: spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  notesPill: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
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
  footer: {
    paddingVertical: 6,
    alignItems: "center",
  },
  footerText: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
