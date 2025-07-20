import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import Navigation from './navigation';
import { ThemeProvider, useTheme } from './constants/ThemeProvider';
import { OfflineManager } from './services/offlineManager';
import { useOTAUpdates } from './hooks/useOTAUpdates';

const AppContent = () => {
  const { colors, isDark } = useTheme();
  
  // Initialize OTA updates
  const { updateInfo } = useOTAUpdates();

  // Initialize offline functionality
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        await OfflineManager.initialize();
        console.log('Offline functionality initialized');
      } catch (error) {
        console.error('Failed to initialize offline functionality:', error);
      }
    };

    initializeOffline();
  }, []);

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
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <Navigation />
        <StatusBar 
          style={isDark ? "light" : "dark"} 
          translucent={false}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
