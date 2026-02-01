import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
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
import NoteCard from "./components/NoteCard";
import type { PatientsStackParamList } from "../../types/navigation";
type NoteListRoute = RouteProp<PatientsStackParamList, "NoteList">;

export default function NoteListScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const route = useRoute<NoteListRoute>();
  const patientId = route.params?.patientId ?? "";
  const routePatientName = route.params?.patientName;

  const { data, isLoading, error } = usePatientNotes(patientId);

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

  return (
    <View style={styles.container}>
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
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={COLORS.white} />
            </View>
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
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : error ? (
          <Text style={styles.placeholder}>Failed to load notes.</Text>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NoteCard note={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.placeholder}>No notes yet.</Text>
            }
          />
        )}
      </View>
    </View>
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
    paddingBottom: spacing.lg,
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
  listContent: {
    paddingBottom: spacing.lg,
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
