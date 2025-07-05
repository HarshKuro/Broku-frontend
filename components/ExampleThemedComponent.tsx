// Example of how to update other components to use the new dual theme system

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, useThemedStyles } from '../constants/ThemeProvider';

const ExampleThemedComponent = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const themedStyles = useThemedStyles();

  // Create component-specific styles that use the theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: themedStyles.spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      padding: themedStyles.spacing.md,
      borderRadius: themedStyles.borderRadius.md,
      ...themedStyles.shadows.level2,
      marginBottom: themedStyles.spacing.md,
    },
    title: {
      ...themedStyles.typography.h3,
      color: colors.text.primary,
      marginBottom: themedStyles.spacing.sm,
    },
    subtitle: {
      ...themedStyles.typography.body2,
      color: colors.text.secondary,
      marginBottom: themedStyles.spacing.md,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      padding: themedStyles.spacing.md,
      borderRadius: themedStyles.borderRadius.md,
      alignItems: 'center',
      marginBottom: themedStyles.spacing.sm,
    },
    primaryButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    accentButton: {
      backgroundColor: colors.accent,
      padding: themedStyles.spacing.md,
      borderRadius: themedStyles.borderRadius.md,
      alignItems: 'center',
      marginBottom: themedStyles.spacing.sm,
    },
    accentButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    outlineButton: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      padding: themedStyles.spacing.md,
      borderRadius: themedStyles.borderRadius.md,
      alignItems: 'center',
    },
    outlineButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    themeToggle: {
      backgroundColor: colors.surfaceVariant,
      padding: themedStyles.spacing.sm,
      borderRadius: themedStyles.borderRadius.full,
      alignItems: 'center',
      marginTop: themedStyles.spacing.lg,
    },
    themeToggleText: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to the Modern Theme!</Text>
        <Text style={styles.subtitle}>
          This component automatically adapts to light and dark modes.
          Current mode: {isDark ? 'Dark' : 'Light'}
        </Text>
        
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Primary Action (₹4C7EFF)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.accentButton}>
          <Text style={styles.accentButtonText}>Accent Action (₹FFA657)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Outline Action</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Text style={styles.themeToggleText}>
          {isDark ? '🌞 Switch to Light' : '🌚 Switch to Dark'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExampleThemedComponent;
