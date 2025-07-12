import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestAIScreen = ({ navigation }: any) => {
  const testBasicFetch = async () => {
    try {
      Alert.alert('Testing...', 'Checking network connectivity...');
      
      // Test 1: Public API
      const response = await fetch('https://httpbin.org/json');
      const data = await response.json();
      Alert.alert('✅ Success', 'Public API works! Network is functional.');
      
      // Test 2: Your backend
      try {
        const backendResponse = await fetch('http://192.168.0.206:5000/api/health');
        const backendData = await backendResponse.json();
        Alert.alert('🎉 Backend Works!', `Server says: ${backendData.message}`);
      } catch (backendError) {
        Alert.alert('❌ Backend Issue', `Cannot reach backend: ${backendError}`);
      }
      
    } catch (error) {
      Alert.alert('❌ Network Error', `Failed: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🔧 AI Test Screen</Text>
      <Text style={styles.subtitle}>If you can see this, navigation works!</Text>
      
      <Pressable style={styles.button} onPress={testBasicFetch}>
        <Text style={styles.buttonText}>Test Network</Text>
      </Pressable>
      
      <Text style={styles.info}>
        Can you see this screen? If yes, tap "Test Network" button above.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TestAIScreen;
