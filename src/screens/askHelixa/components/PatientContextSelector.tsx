import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
  Modal,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../types/colors";
import { spacing, borderRadius } from "../../../theme";
import {
  usePatients,
  useSearchPatients,
} from "../../../hooks/queries/usePatients";
import type { Patient } from "../../../types/patient";

export interface PatientOption {
  id: string | null;
  name: string;
  noteCount?: number;
}

interface PatientContextSelectorProps {
  selected: PatientOption;
  onSelect: (patient: PatientOption) => void;
  onOpenChange?: (open: boolean) => void;
}

const GENERAL_OPTION: PatientOption = {
  id: null,
  name: "General Questions (No Patient)",
};

const patientToOption = (p: Patient): PatientOption => ({
  id: p.patientId,
  name: p.name,
  noteCount: p.noteCount,
});

export default function PatientContextSelector({
  selected,
  onSelect,
  onOpenChange,
}: PatientContextSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const selectorRef = useRef<View>(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  const { data: allPatients, isLoading: isLoadingAll } = usePatients();
  const { data: searchResults, isLoading: isSearching } =
    useSearchPatients(search.trim());

  const isSearchMode = search.trim().length > 0;
  const isLoading = isSearchMode ? isSearching : isLoadingAll;

  const options: PatientOption[] = useMemo(() => {
    if (isSearchMode) {
      const patients = (searchResults ?? []).map(patientToOption);
      const generalMatches = GENERAL_OPTION.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return generalMatches ? [GENERAL_OPTION, ...patients] : patients;
    }
    const patients = (allPatients ?? []).map(patientToOption);
    return [GENERAL_OPTION, ...patients];
  }, [allPatients, searchResults, isSearchMode, search]);

  const handleOpen = useCallback(() => {
    Keyboard.dismiss();
    selectorRef.current?.measureInWindow((_x, y, _w, h) => {
      setDropdownTop(y + h);
    });
    setSearch("");
    setVisible(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleSelect = useCallback(
    (item: PatientOption) => {
      onSelect(item);
      setVisible(false);
      onOpenChange?.(false);
    },
    [onSelect, onOpenChange],
  );

  const displayName =
    selected.id === null ? "General Questions" : selected.name;

  return (
    <>
      <TouchableOpacity
        ref={selectorRef}
        style={styles.selector}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>Patient Context:</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value} numberOfLines={1}>
            {displayName}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            Keyboard.dismiss();
            setVisible(false);
            onOpenChange?.(false);
          }}
        />
        <View style={[styles.dropdown, { top: dropdownTop }]}>
          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search patients..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
          </View>
          {isLoading ? (
            <ActivityIndicator
              style={styles.loader}
              size="small"
              color={COLORS.primary}
            />
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.id ?? "general"}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const isGeneral = item.id === null;
                const isSelected =
                  item.id === selected.id && item.name === selected.name;
                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionText,
                          isGeneral && styles.optionTextGeneral,
                          isSelected && styles.optionTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {!isGeneral && item.noteCount !== undefined && (
                        <Text style={styles.noteCount}>
                          {item.noteCount} notes
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No patients found</Text>
              }
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  valueRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    maxHeight: 340,
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  list: {
    maxHeight: 280,
  },
  loader: {
    paddingVertical: spacing.lg,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },
  optionSelected: {
    backgroundColor: COLORS.primaryLighter,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  optionTextGeneral: {
    fontStyle: "italic",
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  noteCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});
