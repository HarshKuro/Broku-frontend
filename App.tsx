import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-gesture-handler';
import Navigation from './navigation';
import { ThemeProvider, useTheme } from './constants/ThemeProvider';

const AppContent = () => {
  const { colors, isDark } = useTheme();

  const paperTheme = {
    colors: {
      primary: colors.primary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.surface,
      text: colors.text.primary,
      onSurface: colors.onSurface,
      disabled: colors.text.disabled,
      placeholder: colors.text.disabled,
      backdrop: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
      notification: colors.error,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <Navigation />
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={colors.background} 
      />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
