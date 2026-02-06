import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../types/colors";
import { spacing, borderRadius } from "../../theme";

interface DatePickerProps {
  value: string; // Format: "DD/MM/YYYY" or "YYYY-MM-DD"
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
}

// Convert DD/MM/YYYY to YYYY-MM-DD for calendar
function toCalendarFormat(dateStr: string): string {
  if (!dateStr) return "";

  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Convert from DD/MM/YYYY
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
}

// Convert YYYY-MM-DD to DD/MM/YYYY for display
function toDisplayFormat(dateStr: string): string {
  if (!dateStr) return "";

  // Check if in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  return dateStr;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  minDate,
  maxDate,
  disabled = false,
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const calendarValue = toCalendarFormat(value);
  const displayValue = toDisplayFormat(value);

  const handleDayPress = useCallback(
    (day: DateData) => {
      onChange(toDisplayFormat(day.dateString));
      setShowCalendar(false);
    },
    [onChange],
  );

  const markedDates = calendarValue
    ? {
        [calendarValue]: {
          selected: true,
          selectedColor: COLORS.primary,
        },
      }
    : {};

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.inputContainer, disabled && styles.inputDisabled]}
        onPress={() => !disabled && setShowCalendar(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[styles.inputText, !displayValue && styles.placeholder]}>
          {displayValue || placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={18}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCalendar(false)}
        >
          <Pressable style={styles.calendarContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Calendar
              current={calendarValue || undefined}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              minDate={minDate}
              maxDate={maxDate}
              theme={{
                backgroundColor: COLORS.surface,
                calendarBackground: COLORS.surface,
                textSectionTitleColor: COLORS.textSecondary,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: COLORS.white,
                todayTextColor: COLORS.primary,
                dayTextColor: COLORS.textPrimary,
                textDisabledColor: COLORS.textMuted,
                monthTextColor: COLORS.textPrimary,
                arrowColor: COLORS.primary,
                textMonthFontWeight: "600",
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              }}
              style={styles.calendar}
            />

            <View style={styles.calendarActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  onChange("");
                  setShowCalendar(false);
                }}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.todayButton}
                onPress={() => {
                  const today = new Date().toISOString().split("T")[0];
                  onChange(toDisplayFormat(today));
                  setShowCalendar(false);
                }}
              >
                <Text style={styles.todayText}>Today</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  calendarContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.xl,
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  calendar: {
    borderRadius: 0,
  },
  calendarActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  clearButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  todayButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: COLORS.primaryLighter,
    borderRadius: borderRadius.md,
  },
  todayText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
