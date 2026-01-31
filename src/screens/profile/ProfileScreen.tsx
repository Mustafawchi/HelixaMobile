import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, spacing, typography } from '../../theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
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
    ...typography.h1,
    color: COLORS.textPrimary,
  },
});
