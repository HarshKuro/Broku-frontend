import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-gesture-handler';
import Navigation from './navigation';

export default function App() {
  return (
    <PaperProvider>
      <Navigation />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
