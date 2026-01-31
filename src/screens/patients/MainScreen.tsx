import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import ScreenHeader from "../../components/common/ScreenHeader";
import SearchBar from "../../components/common/SearchBar";
import PatientCard from "./components/PatientCard";
import { usePatients } from "../../hooks/queries/usePatients";
import { COLORS } from "../../types/colors";
import { spacing } from "../../theme";
import type { Patient } from "../../types/patient";

export default function MainScreen() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading, error, refetch } = usePatients();

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    if (!search.trim()) return patients;
    const query = search.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(query));
  }, [patients, search]);

  const totalNotes = useMemo(() => {
    if (!patients) return 0;
    return patients.reduce((sum, p) => sum + p.noteCount, 0);
  }, [patients]);

  const handlePatientPress = useCallback((patient: Patient) => {
    // TODO: Navigate to FolderScreen
  }, []);

  const handlePatientEdit = useCallback((patient: Patient) => {
    // TODO: Open edit modal
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Patient }) => (
      <PatientCard
        patient={item}
        onPress={handlePatientPress}
        onEdit={handlePatientEdit}
      />
    ),
    [handlePatientPress, handlePatientEdit],
  );

  const keyExtractor = useCallback((item: Patient) => item.patientId, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenHeader
        title="Patients"
        subtitle={`${patients?.length ?? 0} matters · ${totalNotes} total notes`}
        actions={[
          { icon: "filter", onPress: () => {} },
          { icon: "add", onPress: () => {} },
        ]}
      />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search matters..."
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load patients</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No patients found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
