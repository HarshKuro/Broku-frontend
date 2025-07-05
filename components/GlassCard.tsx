import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { theme } from '../constants/theme';

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