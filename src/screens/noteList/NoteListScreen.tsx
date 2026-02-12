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
import { useSearchPatientNotes } from "../../hooks/queries/useNotes";
import { useUpdateNote } from "../../hooks/mutations/useUpdateNote";
import { useDeleteNote } from "../../hooks/mutations/useDeleteNote";
import { useDeleteNotes } from "../../hooks/mutations/useDeleteNotes";
import { useCreateNote } from "../../hooks/mutations/useCreateNote";
import { useGeneratePatientLetter } from "../../hooks/mutations/useGeneratePatientLetter";
import { useGenerateReferralLetter } from "../../hooks/mutations/useGenerateReferralLetter";
import { useGenerateSmartSummary } from "../../hooks/mutations/useGenerateSmartSummary";
import { useAutoMedicalHistorySync } from "../../hooks/mutations/useAutoMedicalHistorySync";
import { useUser } from "../../hooks/queries/useUser";
import {
  buildClinicalNotes,
  buildReferralFallbackBody,
  buildPatientLetterHtml,
  buildPatientEmailBodyHtml,
  buildReferralEmailBodyHtml,
  htmlToPlainText,
  plainTextToHtml,
} from "../../utils/generate";
import SearchBar from "../../components/common/SearchBar";
import GenerateLoadingOverlay from "../../components/common/GenerateLoadingOverlay";
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
import SelectDoctorPopup from "../generates/components/SelectDoctorPopup";
import { useUpdatePatient } from "../../hooks/mutations/useUpdatePatient";
import CreateNotePopup from "./components/CreateNotePopup";
import { usePdfExport } from "../../hooks/usePdfExport";
import { useWordExport } from "../../hooks/useWordExport";
import { buildNotesContentHtml } from "../../utils/pdfTemplate";
import type { PatientsStackParamList } from "../../types/navigation";
import type { Note } from "../../types/note";
import type { Doctor } from "../../types/generate";

type NoteListRoute = RouteProp<PatientsStackParamList, "NoteList">;

export default function NoteListScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const route = useRoute<NoteListRoute>();
  const patientId = route.params?.patientId ?? "";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const routePatientName = route.params?.patientName;
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);
  const [showSelectDoctorPopup, setShowSelectDoctorPopup] = useState(false);
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
  const { data: searchedData, isFetching: isSearching } = useSearchPatientNotes(
    patientId,
    debouncedSearch,
    50,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const deleteNotes = useDeleteNotes();
  const createNote = useCreateNote();
  const generatePatientLetter = useGeneratePatientLetter();
  const generateReferralLetter = useGenerateReferralLetter();
  const generateSmartSummary = useGenerateSmartSummary();
  const autoMedicalHistorySync = useAutoMedicalHistorySync();
  const { data: userProfile } = useUser();
  const { exportPdf, isExporting } = usePdfExport();
  const { exportMultipleWord, isExportingWord } = useWordExport();
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [filterType, setFilterType] = useState<NoteTypeValue>("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const allNotes = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.notes);
  }, [data]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const notes = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    const hasSearch = q.length > 0;
    const hasServerSearch = q.length >= 2;

    const baseNotes = hasSearch
      ? hasServerSearch
        ? searchedData?.notes || []
        : allNotes.filter(
            (note) =>
              note.title?.toLowerCase().includes(q) ||
              note.type?.toLowerCase().includes(q) ||
              note.text?.toLowerCase().includes(q),
          )
      : allNotes;

    let filtered =
      filterType === "all"
        ? baseNotes
        : baseNotes.filter((note) => note.type === filterType);

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
  }, [allNotes, filterType, sortKey, debouncedSearch, searchedData]);

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

  const getNotesForGeneration = useCallback(() => {
    return selectedIds.size > 0
      ? allNotes.filter((n) => selectedIds.has(n.id))
      : allNotes;
  }, [allNotes, selectedIds]);

  const handleReferWithDoctor = useCallback(
    (doctor: Doctor | null) => {
      setShowSelectDoctorPopup(false);
      const notesToUse = getNotesForGeneration();
      if (notesToUse.length === 0) {
        Alert.alert("No Notes", "No notes available to generate a referral from.");
        return;
      }
      const noteContent = buildClinicalNotes(notesToUse);
      const senderName = userProfile
        ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
        : "";
      const senderPosition = userProfile?.positionInPractice || "";
      const medicalHistory = patientDetails?.medicalHistorySummary || "";
      const patientDob = patientDetails?.dateOfBirth || "";
      const patientAddress = patientDetails?.homeAddress || "";
      const patientEmailVal = patientDetails?.email || "";
      const referralDoctor = doctor
        ? { name: doctor.name, surname: doctor.surname }
        : null;
      const doctorName = doctor
        ? `${doctor.name} ${doctor.surname}`.trim()
        : undefined;
      const doctorEmail = doctor?.email || undefined;
      setIsGenerating(true);
      generateReferralLetter.mutate(
        {
          noteContent,
          patientDetails: {
            name: patientName,
            dob: patientDob,
            email: patientEmailVal,
            address: patientAddress,
          },
          medicalHistory,
          referralDoctor,
          senderDetails: { name: senderName, position: senderPosition },
        },
        {
          onSuccess: (data) => {
            setIsGenerating(false);
            const letterHtml = data.letterBody
              ? plainTextToHtml(data.letterBody)
              : undefined;
            const emailBodyHtml = buildReferralEmailBodyHtml({
              patientName,
              senderName,
              doctorName,
            });
            navigation.navigate("ReferPatient", {
              patientId,
              patientName,
              patientEmail: patientDetails?.email ?? undefined,
              selectedNoteIds: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
              generatedContent: letterHtml,
              generatedEmailBody: emailBodyHtml,
              doctorName,
              doctorEmail,
            });
          },
          onError: (err) => {
            setIsGenerating(false);
            const fallback = buildReferralFallbackBody({
              doctorSurname: doctor?.surname,
              patientFullName: patientName,
              patientDOB: patientDob,
              medicalHistory,
              senderName,
              senderPosition,
            });
            Alert.alert(
              "Generation Failed",
              err instanceof Error
                ? `${err.message}\n\nA template letter has been loaded instead.`
                : "Failed to generate letter. A template has been loaded instead.",
            );
            navigation.navigate("ReferPatient", {
              patientId,
              patientName,
              patientEmail: patientDetails?.email ?? undefined,
              selectedNoteIds: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
              generatedContent: plainTextToHtml(fallback),
              generatedEmailBody: buildReferralEmailBodyHtml({
                patientName,
                senderName,
                doctorName,
              }),
              doctorName,
              doctorEmail,
            });
          },
        },
      );
    },
    [
      generateReferralLetter,
      getNotesForGeneration,
      navigation,
      patientDetails,
      patientId,
      patientName,
      selectedIds,
      userProfile,
    ],
  );

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

  const handleBatchPdf = useCallback(() => {
    const selectedNotes = allNotes.filter((n) => selectedIds.has(n.id));
    if (selectedNotes.length === 0) return;
    const html = buildNotesContentHtml(selectedNotes);
    exportPdf(html, `${patientName}_Notes`, { includeSignature: false });
  }, [allNotes, selectedIds, patientName, exportPdf]);

  const handleBatchWord = useCallback(() => {
    const selectedNotes = allNotes.filter((n) => selectedIds.has(n.id));
    if (selectedNotes.length === 0) return;

    void exportMultipleWord(
      selectedNotes.map((note) => ({
        id: note.id,
        title: note.title,
        text: note.text,
        type: note.type,
        matter: note.matter,
        createdAt: note.createdAt,
        lastEdited: note.lastEdited,
        updatedAt: note.updatedAt,
      })),
      {
        folderName: patientName,
      },
      selectedNotes.length > 1,
    );
  }, [allNotes, selectedIds, patientName, exportMultipleWord]);

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
  }, [patientId, queryClient, refetch]);

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
    if (debouncedSearch.length > 0) return null;
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
  }, [hasNextPage, isFetchingNextPage, debouncedSearch]);

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

  const loadingOverlayText = useMemo(() => {
    if (isGenerating) return "Generating...";
    if (isExportingWord) return "Exporting Word...";
    return "";
  }, [isGenerating, isExportingWord]);

  const isGlobalLoadingVisible = isGenerating || isExportingWord;

  const handleSmartSummary = useCallback(() => {
    if (isGenerating) return;

    const notesToUse = getNotesForGeneration();
    if (notesToUse.length === 0) {
      Alert.alert("No Notes", "No notes available to generate a smart summary.");
      return;
    }

    const notesForApi = notesToUse.map((note) => ({
      title: note.title || "Untitled",
      type: note.type || "General",
      text: htmlToPlainText(note.text || ""),
      createdAt: note.createdAt,
    }));

    setIsGenerating(true);
    generateSmartSummary.mutate(
      {
        notes: notesForApi,
        folderName: patientName,
        folderType: "Patient Notes",
      },
      {
        onSuccess: (data) => {
          setIsGenerating(false);
          navigation.navigate("SmartSummary", {
            patientId,
            patientName,
            patientEmail: patientDetails?.email ?? undefined,
            selectedNoteIds:
              selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
            generatedContent: plainTextToHtml(data.summary),
            generatedEmailBody: buildPatientEmailBodyHtml({
              patientName,
              practiceName: userProfile?.practiceName || "",
            }),
            notesCount: data.notesCount,
            generatedAt: data.generatedAt,
            folderType: data.folderType,
          });
        },
        onError: (err) => {
          setIsGenerating(false);
          Alert.alert(
            "Smart Summary Failed",
            err instanceof Error ? err.message : "Failed to generate summary.",
          );
        },
      },
    );
  }, [
    isGenerating,
    getNotesForGeneration,
    generateSmartSummary,
    patientName,
    navigation,
    patientId,
    patientDetails?.email,
    selectedIds,
    userProfile?.practiceName,
  ]);

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
            <SummaryAction onPress={handleSmartSummary} />
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
                {search.trim()
                  ? isSearching
                    ? "Searching notes..."
                    : "No notes match your search."
                  : filterType !== "all"
                    ? "No notes match the filter."
                    : "No notes yet."}
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
        onUpdateFromNotes={() => {
          autoMedicalHistorySync.mutate(
            { patientId },
            {
              onError: (error) => {
                Alert.alert(
                  "Update Failed",
                  error instanceof Error
                    ? error.message
                    : "Failed to update medical history.",
                );
              },
            },
          );
        }}
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
        isSubmitting={
          updatePatient.isPending || autoMedicalHistorySync.isPending
        }
        isUpdatingFromNotes={autoMedicalHistorySync.isPending}
      />
      <GenerateNotesPopup
        visible={showGeneratePopup}
        onClose={() => setShowGeneratePopup(false)}
        onSummaryToPatient={() => {
          setShowGeneratePopup(false);
          const notesToUse = getNotesForGeneration();
          if (notesToUse.length === 0) {
            Alert.alert("No Notes", "No notes available to generate a summary from.");
            return;
          }
          const noteContent = buildClinicalNotes(notesToUse);
          const doctorName = userProfile
            ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
            : "";
          const practiceName = userProfile?.practiceName || "";
          setIsGenerating(true);
          generatePatientLetter.mutate(
            { noteContent, patientName, practiceName, doctorName },
            {
              onSuccess: (data) => {
                setIsGenerating(false);
                const letterHtml = data.summary
                  ? buildPatientLetterHtml({
                      summary: data.summary,
                      patientName,
                      practiceName,
                      doctorName,
                    })
                  : undefined;
                const emailBodyHtml = buildPatientEmailBodyHtml({
                  patientName,
                  practiceName,
                });
                navigation.navigate("SummaryToPatient", {
                  patientId,
                  patientName,
                  patientEmail: patientDetails?.email ?? undefined,
                  selectedNoteIds: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
                  generatedContent: letterHtml,
                  generatedEmailBody: emailBodyHtml,
                });
              },
              onError: (err) => {
                setIsGenerating(false);
                Alert.alert(
                  "Generation Failed",
                  err instanceof Error ? err.message : "Failed to generate summary.",
                );
                navigation.navigate("SummaryToPatient", {
                  patientId,
                  patientName,
                  patientEmail: patientDetails?.email ?? undefined,
                  selectedNoteIds: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
                });
              },
            },
          );
        }}
        onReferPatient={() => {
          setShowGeneratePopup(false);
          const notesToUse = getNotesForGeneration();
          if (notesToUse.length === 0) {
            Alert.alert("No Notes", "No notes available to generate a referral from.");
            return;
          }
          setShowSelectDoctorPopup(true);
        }}
      />
      <SelectDoctorPopup
        visible={showSelectDoctorPopup}
        onClose={() => setShowSelectDoctorPopup(false)}
        onSelect={handleReferWithDoctor}
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
          onPdf={handleBatchPdf}
          onWord={handleBatchWord}
          onDelete={handleBatchDelete}
        />
      ) : (
        !selectionMode && (
          <NewNoteButton onPress={() => setShowCreatePopup(true)} />
        )
      )}

      <GenerateLoadingOverlay
        visible={isGlobalLoadingVisible}
        text={loadingOverlayText}
      />
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
