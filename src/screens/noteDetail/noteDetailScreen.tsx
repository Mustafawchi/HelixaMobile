import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../../types/colors";
import { spacing } from "../../theme";
import type { PatientsStackParamList } from "../../types/navigation";
import RichTextEditor from "../../components/common/RichTextEditor";
import SaveNoteButton from "./components/SaveNoteButton";
import { useUpdateNote } from "../../hooks/mutations/useUpdateNote";
import { useAutoMedicalHistorySync } from "../../hooks/mutations/useAutoMedicalHistorySync";

type NoteDetailRoute = RouteProp<PatientsStackParamList, "NoteDetail">;

export default function NoteDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PatientsStackParamList>>();
  const route = useRoute<NoteDetailRoute>();
  const { patientId, noteId, noteTitle, noteText, noteType } = route.params;

  const [content, setContent] = useState(noteText);
  const originalContent = useRef(noteText);
  const hasChanges = content !== originalContent.current;

  const updateNote = useUpdateNote();
  const autoMedicalHistorySync = useAutoMedicalHistorySync();

  const handleSave = useCallback(() => {
    updateNote.mutate(
      { patientId, noteId, text: content },
      {
        onSuccess: () => {
          autoMedicalHistorySync.mutate(
            { patientId },
            {
              onError: (error) => {
                console.log(
                  "[MedicalHistorySync] Auto sync after note update failed:",
                  error,
                );
              },
            },
          );
          navigation.goBack();
        },
      },
    );
  }, [patientId, noteId, content, updateNote]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {noteTitle}
          </Text>
          <Text style={styles.headerSubtitle}>{noteType}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.editorWrapper}>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Note content..."
          minHeight={0}
        />
      </View>

      {hasChanges && <SaveNoteButton onPress={handleSave} />}
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
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  editorWrapper: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
