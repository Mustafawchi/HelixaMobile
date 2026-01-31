import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, spacing, typography } from '../../theme';

export default function ReportDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rapor Detay</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: COLORS.textPrimary,
  },
});
