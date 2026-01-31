import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../types/colors';
import { spacing, borderRadius } from '../../../theme';
import { formatDate } from '../../../utils/formatting';
import type { Patient } from '../../../types/patient';

interface PatientCardProps {
  patient: Patient;
  onPress: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

export default function PatientCard({ patient, onPress, onEdit }: PatientCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(patient)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="folder" size={28} color={COLORS.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {patient.name}
        </Text>
        <Text style={styles.noteCount}>
          {patient.noteCount} {patient.noteCount === 1 ? 'note' : 'notes'}
        </Text>
        <Text style={styles.dates}>
          Created: {formatDate(patient.createdAt)}
        </Text>
        <Text style={styles.dates}>
          Modified: {formatDate(patient.lastModified)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => onEdit(patient)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="pencil" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  noteCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dates: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  editButton: {
    padding: spacing.sm,
  },
});
