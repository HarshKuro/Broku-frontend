import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: [string, string];
  shadowLevel?: 'small' | 'medium' | 'large';
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  gradient = false,
  gradientColors = ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],
  shadowLevel = 'medium',
}) => {
  const shadowStyle = theme.shadows[shadowLevel] || theme.shadows.medium;
  
  const containerStyle = [
    styles.container,
    shadowStyle,
    style,
  ];

  if (gradient) {
    return (
      <View style={containerStyle}>
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientContent}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.solidBackground]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  gradientContent: {
    padding: theme.spacing.md,
  },
  solidBackground: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
});

export default ModernCard;
