import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { theme } from '../constants/theme';

// Try to import BlurView with fallback
let BlurView: any;
try {
  BlurView = require('@react-native-community/blur').BlurView;
} catch (error) {
  console.warn('BlurView not available, using fallback');
  BlurView = null;
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'light' | 'dark';
  blurAmount?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blurType = 'light',
  blurAmount = 10,
}) => {
  // Use blur effect only if BlurView is available and on iOS
  const shouldUseBlur = BlurView && Platform.OS === 'ios';

  if (shouldUseBlur) {
    return (
      <View style={[styles.container, style]}>
        <BlurView
          style={styles.blurView}
          blurType={blurType}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor="white"
        />
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  // Fallback for Android or when BlurView is not available
  return (
    <View style={[styles.container, styles.fallbackContainer, style]}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...theme.shadows.medium,
  },
  fallbackContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: theme.spacing.md,
  },
});

export default GlassCard;