import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ScreenHeader from "../../components/common/ScreenHeader";
import SearchBar from "../../components/common/SearchBar";
import PatientCard from "./components/PatientCard";
import CreatePatientPopup from "./components/CreatePatientPopup";
import EditPatientPopup from "./components/EditPatientPopup";
import SortOptionsPopup, {
  type PatientSortKey,
} from "./components/SortOptionsPopup";
import { usePaginatedPatients } from "../../hooks/queries/usePatients";
import { useDeletePatient } from "../../hooks/mutations/useDeletePatient";
import { useCreatePatient } from "../../hooks/mutations/useCreatePatient";
import { useUpdatePatient } from "../../hooks/mutations/useUpdatePatient";
import { notesApi } from "../../api/endpoints/notes";
import { COLORS } from "../../types/colors";
import { spacing } from "../../theme";
import type { Patient } from "../../types/patient";
import type { PatientsStackParamList } from "../../types/navigation";

export default function MainScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<PatientSortKey>("name-asc");
  const [showSortPopup, setShowSortPopup] = useState(false);
  const sortBy =
    sortKey === "created-desc"
      ? "createdAt"
      : sortKey === "name-asc" || sortKey === "name-desc"
        ? "name"
        : "lastModified";
  const sortDirection =
    sortKey === "name-desc" || sortKey === "created-desc" || sortKey === "last-modified-desc"
      ? "desc"
      : "asc";
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePaginatedPatients({
    searchQuery: search || undefined,
    sortBy,
    sortDirection,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { mutate: deletePatient } = useDeletePatient();
  const { mutate: createPatient, isPending: isCreating } = useCreatePatient();
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const patients = useMemo(() => {
    if (!data?.pages) return [];
    const flat = data.pages.flatMap((page) => page.patients);
    return flat;
  }, [data, sortKey]);

  const totalNotes = useMemo(() => {
    const backendTotal = data?.pages?.[0]?.totalNotes;
    if (backendTotal !== undefined) return backendTotal;
    return patients.reduce((sum, p) => sum + p.noteCount, 0);
  }, [data, patients]);

  const handlePatientPress = useCallback(
    (patient: Patient) => {
      void notesApi.getPatientNotes({ patientId: patient.patientId });
      navigation.navigate("NoteList", {
        patientId: patient.patientId,
        patientName: patient.name,
      });
    },
    [navigation],
  );

  const handlePatientEdit = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setShowEditPopup(true);
  }, []);

  const handleCreatePatient = useCallback(
    (payload: { firstName: string; lastName: string }) => {
      createPatient({
        firstName: payload.firstName,
        lastName: payload.lastName || undefined,
      });
      setShowCreatePopup(false);
    },
    [createPatient],
  );

  const handlePatientDelete = useCallback(
    (patient: Patient) => {
      deletePatient(patient.patientId);
    },
    [deletePatient],
  );

  const handleEditClose = useCallback(() => {
    setShowEditPopup(false);
    setEditingPatient(null);
  }, []);

  const handleUpdatePatient = useCallback(
    (payload: { patientId: string; firstName: string; lastName: string }) => {
      updatePatient({
        patientId: payload.patientId,
        firstName: payload.firstName || undefined,
        lastName: payload.lastName || undefined,
      });
      handleEditClose();
    },
    [updatePatient, handleEditClose],
  );

  const renderItem = useCallback(
    ({ item }: { item: Patient }) => (
      <PatientCard
        patient={item}
        onPress={handlePatientPress}
        onEdit={handlePatientEdit}
        onDelete={handlePatientDelete}
      />
    ),
    [handlePatientPress, handlePatientEdit, handlePatientDelete],
  );

  const keyExtractor = useCallback((item: Patient) => item.patientId, []);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

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

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  }, [refetch]);

  const listFooter = useCallback(() => {
    if (search.trim().length > 0) return null;
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
  }, [hasNextPage, isFetchingNextPage, search]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <ScreenHeader
        title="Patients"
        subtitle={`${patients.length} patients · ${totalNotes} total notes`}
        actions={[
          { icon: "filter", onPress: () => setShowSortPopup(true) },
          { icon: "add", onPress: () => setShowCreatePopup(true) },
        ]}
      />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search patients..."
      />

      {isLoading && patients.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load patients</Text>
          <Text style={styles.errorDetail}>{(error as Error)?.message}</Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No patients found</Text>
            </View>
          }
        />
      )}

      <CreatePatientPopup
        visible={showCreatePopup}
        onClose={() => setShowCreatePopup(false)}
        onCreate={handleCreatePatient}
        isSubmitting={isCreating}
      />

      <EditPatientPopup
        visible={showEditPopup}
        patient={editingPatient}
        onClose={handleEditClose}
        onSave={handleUpdatePatient}
        isSubmitting={isUpdating}
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
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
  errorText: {
    fontSize: 15,
    color: COLORS.error,
  },
  errorDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: "center" as const,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
