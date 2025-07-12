import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';

const SimpleNetworkTest = () => {
  const [result, setResult] = useState('Not tested yet');

  const testNetwork = async () => {
    try {
      setResult('Testing...');
      
      // Test 1: Public API
      const publicTest = await fetch('https://httpbin.org/json');
      const publicData = await publicTest.json();
      setResult('✅ Public API works');
      
      // Test 2: Local backend
      const localTest = await fetch('http://192.168.0.206:5000/api/health');
      const localData = await localTest.json();
      setResult('✅ Local backend works: ' + localData.message);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult('❌ Error: ' + errorMessage);
      Alert.alert('Network Test Failed', errorMessage);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Network Test</Text>
      <Button title="Test Network" onPress={testNetwork} />
      <Text style={{ marginTop: 20, fontSize: 14 }}>{result}</Text>
    </View>
  );
};

export default SimpleNetworkTest;
