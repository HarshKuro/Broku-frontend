import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import { aiApi } from '../api/aiApi';
import axios from 'axios';

const AIDebugScreen = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      addResult('🔄 Testing backend connection...');
      
      // Test 1: Basic health check
      try {
        addResult('📡 Testing health endpoint...');
        const response = await fetch('http://192.168.0.206:5000/api/health');
        const healthData = await response.json();
        
        if (healthData.success) {
          addResult('✅ Backend connection successful!');
          addResult(`⏰ Server time: ${new Date(healthData.timestamp).toLocaleTimeString()}`);
        } else {
          addResult('❌ Backend health check failed');
        }
      } catch (error) {
        addResult(`❌ Health check failed: ${error}`);
        addResult('🔍 Trying localhost instead...');
        
        // Fallback to localhost
        try {
          const response = await fetch('http://localhost:5000/api/health');
          const healthData = await response.json();
          if (healthData.success) {
            addResult('✅ Localhost connection works!');
            addResult('⚠️ Issue might be with network IP configuration');
          }
        } catch (localError) {
          addResult(`❌ Localhost also failed: ${localError}`);
          addResult('🚨 Backend server might not be running');
        }
      }

      // Test 2: Check if it's a React Native specific issue
      try {
        addResult('📱 Testing React Native fetch...');
        const testResponse = await fetch('https://httpbin.org/json');
        const testData = await testResponse.json();
        addResult('✅ React Native networking works');
      } catch (error) {
        addResult(`❌ React Native networking issue: ${error}`);
      }
      
    } catch (error) {
      addResult(`❌ Connection error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAIEndpoints = async () => {
    try {
      setLoading(true);
      addResult('🤖 Testing AI endpoints...');

      // Test categorization
      try {
        addResult('🔄 Testing AI categorization...');
        const catResponse = await aiApi.categorizeExpense('lunch at restaurant', 450);
        addResult('✅ AI Categorization works!');
        addResult(`📊 Got ${catResponse.data?.suggestions?.length || 0} suggestions`);
        if (catResponse.data?.suggestions?.length > 0) {
          const topSuggestion = catResponse.data.suggestions[0];
          addResult(`🎯 Top: ${topSuggestion.name} (${(topSuggestion.confidence * 100).toFixed(0)}%)`);
        }
      } catch (error) {
        addResult(`❌ Categorization failed: ${error}`);
        console.error('Categorization error details:', error);
      }

      // Test insights
      try {
        addResult('🔄 Testing AI insights...');
        const insightsResponse = await aiApi.getInsights();
        addResult('✅ AI Insights endpoint works!');
        addResult(`💡 Got ${insightsResponse.data?.insights?.length || 0} insights`);
        if (insightsResponse.data?.insights?.length > 0) {
          const firstInsight = insightsResponse.data.insights[0];
          addResult(`💭 "${firstInsight.title}"`);
        }
      } catch (error) {
        addResult(`❌ Insights failed: ${error}`);
        console.error('Insights error details:', error);
      }

      // Test overview
      try {
        addResult('🔄 Testing AI overview...');
        const overviewResponse = await aiApi.getOverview();
        addResult('✅ AI Overview endpoint works!');
        addResult(`📈 AI Score: ${overviewResponse.aiScore || 'N/A'}`);
      } catch (error) {
        addResult(`❌ Overview failed: ${error}`);
        console.error('Overview error details:', error);
      }

    } catch (error) {
      addResult(`❌ AI test error: ${error}`);
      console.error('General AI test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAxiosConnection = async () => {
    try {
      setLoading(true);
      addResult('🔧 Testing Axios vs Fetch...');

      // Test with direct axios
      try {
        addResult('📡 Testing direct axios call...');
        const axiosResponse = await axios.get('http://192.168.0.206:5000/api/health', {
          timeout: 10000
        });
        addResult('✅ Axios direct call works!');
        addResult(`📊 Status: ${axiosResponse.status}`);
      } catch (axiosError) {
        addResult(`❌ Axios failed: ${axiosError}`);
      }

      // Test with aiApi
      try {
        addResult('🔌 Testing aiApi module...');
        const healthResponse = await axios.get('http://192.168.0.206:5000/api/health');
        addResult('✅ Direct API call successful!');
      } catch (apiError) {
        addResult(`❌ API module failed: ${apiError}`);
      }

      // Test with AbortController for timeout
      try {
        addResult('⏱️ Testing with AbortController...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const timeoutResponse = await fetch('http://192.168.0.206:5000/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await timeoutResponse.json();
        addResult('✅ Long timeout works!');
      } catch (timeoutError) {
        addResult(`❌ Timeout test failed: ${timeoutError}`);
      }

    } catch (error) {
      addResult(`❌ Axios test error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🔧 AI Debug Console</Text>
      
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Backend Connection</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: '#9b59b6' }]}
          onPress={testAxiosConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Axios vs Fetch</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.accent }]}
          onPress={testAIEndpoints}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test AI Endpoints</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: '#ff6b6b' }]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Log</Text>
        </Pressable>
      </View>

      <GlassCard style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>📋 Test Results:</Text>
        <ScrollView style={styles.resultsScroll}>
          {results.length === 0 ? (
            <Text style={styles.noResults}>No tests run yet. Tap a button above to start testing!</Text>
          ) : (
            results.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))
          )}
        </ScrollView>
      </GlassCard>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Debug Info:</Text>
        <Text style={styles.infoText}>• Backend URL: http://192.168.0.206:5000/api</Text>
        <Text style={styles.infoText}>• Server should be running on port 5000</Text>
        <Text style={styles.infoText}>• Make sure both devices are on same WiFi</Text>
        <Text style={styles.infoText}>• ✨ Now powered by Google Gemini AI!</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 10,
  },
  resultsScroll: {
    flex: 1,
  },
  noResults: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  resultText: {
    fontSize: 13,
    color: theme.colors.text.primary,
    marginBottom: 5,
    lineHeight: 18,
  },
  infoContainer: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
});

export default AIDebugScreen;
