import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPopup from "../../../components/common/AppPopup";
import SwipeableRow from "../../../components/common/SwipeableRow";
import { useDoctors } from "../../../hooks/queries/useDoctors";
import {
  useAddDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
} from "../../../hooks/mutations/useDoctorMutations";
import { COLORS } from "../../../types/colors";
import { borderRadius, spacing } from "../../../theme";
import type { Doctor, CreateDoctorPayload } from "../../../types/generate";

const SPECIALIST_TYPES = [
  "General Practitioner",
  "Endodontist",
  "Orthodontist",
  "Periodontist",
  "Oral Surgeon / Oral & Maxillofacial Surgeon",
  "Prosthodontist",
  "Pediatric Dentist",
  "Oral Pathologist",
  "Oral Radiologist",
  "Implantologist",
  "TMJ Specialist",
  "Sleep Medicine Specialist",
  "ENT Specialist",
  "Dermatologist",
  "Other",
] as const;

interface SelectDoctorPopupProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (doctor: Doctor | null) => void;
}

type PopupView = "list" | "form";

const EMPTY_FORM: CreateDoctorPayload = {
  name: "",
  surname: "",
  email: "",
  specialty: "",
};

export default function SelectDoctorPopup({
  visible,
  onClose,
  onSelect,
}: SelectDoctorPopupProps) {
  const { data: doctors = [], isLoading } = useDoctors(visible);
  const addDoctor = useAddDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();

  const [currentView, setCurrentView] = useState<PopupView>("list");
  const [form, setForm] = useState<CreateDoctorPayload>(EMPTY_FORM);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingDoctor(null);
    setCustomSpecialty("");
    setShowSpecialtyPicker(false);
    setCurrentView("list");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSelectDoctor = useCallback(
    (doctor: Doctor) => {
      resetForm();
      onSelect(doctor);
    },
    [resetForm, onSelect],
  );

  const handleSkip = useCallback(() => {
    resetForm();
    onSelect(null);
  }, [resetForm, onSelect]);

  const handleAddNew = useCallback(() => {
    setEditingDoctor(null);
    setForm(EMPTY_FORM);
    setCurrentView("form");
  }, []);

  const handleEdit = useCallback((doctor: Doctor) => {
    setEditingDoctor(doctor);
    const isKnownType = (SPECIALIST_TYPES as readonly string[]).includes(doctor.specialty || "");
    if (doctor.specialty && !isKnownType) {
      setForm({
        name: doctor.name,
        surname: doctor.surname,
        email: doctor.email,
        specialty: "Other",
      });
      setCustomSpecialty(doctor.specialty);
    } else {
      setForm({
        name: doctor.name,
        surname: doctor.surname,
        email: doctor.email,
        specialty: doctor.specialty || "",
      });
      setCustomSpecialty("");
    }
    setShowSpecialtyPicker(false);
    setCurrentView("form");
  }, []);

  const handleDelete = useCallback(
    (doctor: Doctor) => {
      Alert.alert(
        "Delete Doctor",
        `Are you sure you want to delete Dr. ${doctor.name} ${doctor.surname}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteDoctor.mutate(doctor.id),
          },
        ],
      );
    },
    [deleteDoctor],
  );

  const handleSaveDoctor = useCallback(() => {
    if (!form.name.trim() || !form.surname.trim() || !form.email.trim()) {
      Alert.alert("Required Fields", "Name, Surname, and Email are required.");
      return;
    }

    const effectiveSpecialty = form.specialty === "Other" ? customSpecialty.trim() : (form.specialty?.trim() || "");
    const payload: CreateDoctorPayload = {
      name: form.name.trim(),
      surname: form.surname.trim(),
      email: form.email.trim(),
      specialty: effectiveSpecialty,
    };

    if (editingDoctor) {
      updateDoctor.mutate(
        { id: editingDoctor.id, ...payload },
        { onSuccess: () => resetForm() },
      );
    } else {
      addDoctor.mutate(payload, { onSuccess: () => resetForm() });
    }
  }, [form, editingDoctor, addDoctor, updateDoctor, resetForm]);

  const isSaving = addDoctor.isPending || updateDoctor.isPending;

  return (
    <AppPopup
      visible={visible}
      onClose={handleClose}
      contentStyle={styles.popupContent}
    >
      {currentView === "list" ? (
        <>
          <View style={styles.headerRow}>
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              style={styles.iconButton}
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color={COLORS.textPrimary}
              />
            </Pressable>
            <Text style={styles.title}>Select Doctor</Text>
            <Pressable
              onPress={handleAddNew}
              hitSlop={8}
              style={styles.iconButton}
            >
              <Ionicons
                name="person-add"
                size={18}
                color={COLORS.textPrimary}
              />
            </Pressable>
          </View>
          <View style={styles.headerDivider} />

          {/* Doctor List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : doctors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={36}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>No doctors added yet</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.listScroll}
              showsVerticalScrollIndicator={false}
            >
              {doctors.map((doctor) => (
                <SwipeableRow
                  key={doctor.id}
                  onEdit={() => handleEdit(doctor)}
                  onDelete={() => handleDelete(doctor)}
                >
                  <Pressable
                    style={styles.doctorCard}
                    onPress={() => handleSelectDoctor(doctor)}
                  >
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>
                        Dr. {doctor.name} {doctor.surname}
                      </Text>
                      <Text style={styles.doctorEmail}>{doctor.email}</Text>
                      {doctor.specialty ? (
                        <Text style={styles.doctorSpecialty}>
                          {doctor.specialty}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                </SwipeableRow>
              ))}
            </ScrollView>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>
                Skip - Add doctor details later
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Pressable
              style={styles.iconButton}
              onPress={resetForm}
              hitSlop={8}
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color={COLORS.textPrimary}
              />
            </Pressable>
            <Text style={styles.title}>
              {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
            </Text>
            <View style={styles.iconButton} />
          </View>
          <View style={styles.headerDivider} />

          {/* Form */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="First name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Surname *</Text>
              <TextInput
                style={styles.input}
                value={form.surname}
                onChangeText={(v) => setForm((p) => ({ ...p, surname: v }))}
                placeholder="Last name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
                placeholder="Email address"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Specialty</Text>
              <Pressable
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowSpecialtyPicker((prev) => !prev)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: form.specialty ? COLORS.textPrimary : COLORS.textMuted,
                  }}
                >
                  {form.specialty || "Select specialist type..."}
                </Text>
              </Pressable>
              {showSpecialtyPicker && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: borderRadius.md,
                    maxHeight: 200,
                    marginTop: 4,
                    backgroundColor: COLORS.surface,
                  }}
                >
                  <ScrollView nestedScrollEnabled>
                    <Pressable
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: spacing.sm,
                      }}
                      onPress={() => {
                        setForm((p) => ({ ...p, specialty: "" }));
                        setShowSpecialtyPicker(false);
                      }}
                    >
                      <Text style={{ fontSize: 14, color: COLORS.textMuted }}>
                        No specialty
                      </Text>
                    </Pressable>
                    {SPECIALIST_TYPES.map((type) => (
                      <Pressable
                        key={type}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: spacing.sm,
                          backgroundColor:
                            form.specialty === type
                              ? "rgba(26, 77, 62, 0.08)"
                              : "transparent",
                        }}
                        onPress={() => {
                          setForm((p) => ({ ...p, specialty: type }));
                          setShowSpecialtyPicker(false);
                          if (type !== "Other") setCustomSpecialty("");
                        }}
                      >
                        <Text style={{ fontSize: 14, color: COLORS.textPrimary }}>
                          {type}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
              {form.specialty === "Other" && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={customSpecialty}
                  onChangeText={setCustomSpecialty}
                  placeholder="Enter custom specialty..."
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              )}
            </View>
          </ScrollView>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <Pressable style={styles.cancelOutlineButton} onPress={resetForm}>
              <Text style={styles.cancelOutlineText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleSaveDoctor}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingDoctor ? "Update Doctor" : "Add Doctor"}
                </Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </AppPopup>
  );
}

const styles = StyleSheet.create({
  popupContent: {
    minHeight: 420,
    maxHeight: "80%",
    padding: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  listScroll: {
    maxHeight: 360,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  doctorCard: {
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: spacing.xs,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  doctorEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  formScroll: {
    maxHeight: 340,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  formContent: {
    paddingBottom: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  formActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  saveButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
  cancelOutlineButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancelOutlineText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
