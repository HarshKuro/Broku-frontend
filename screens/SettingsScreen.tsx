import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, Snackbar } from 'react-native-paper';
import { OfflineStatusCard, OfflineIndicator } from '../components/OfflineStatus';
import { useOfflineStatus } from '../services/offlineManager';
import { offlineExpenseApi, offlineCategoryApi } from '../services/offlineApi';
import { Expense, Category } from '../types/types';

export const SettingsScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const offlineStatus = useOfflineStatus();

  // Load data
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [expenseData, categoryData] = await Promise.all([
        offlineExpenseApi.getAll(),
        offlineCategoryApi.getAll(),
      ]);
      setExpenses(expenseData);
      setCategories(categoryData);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleTestOfflineCreate = async () => {
    try {
      const testExpense = {
        category: 'Test Category',
        amount: 25.50,
        date: new Date(),
        note: 'Test offline expense creation',
        type: 'expense' as const,
      };

      await offlineExpenseApi.create(testExpense);
      await loadData();
      showSnackbar('Test expense created successfully');
    } catch (error) {
      console.error('Error creating test expense:', error);
      showSnackbar('Failed to create test expense');
    }
  };

  const handleTestOfflineCategory = async () => {
    try {
      const testCategoryName = `Test Category ${Date.now()}`;
      await offlineCategoryApi.create(testCategoryName);
      await loadData();
      showSnackbar('Test category created successfully');
    } catch (error) {
      console.error('Error creating test category:', error);
      showSnackbar('Failed to create test category');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadData} />
      }
    >
      {/* Offline Status Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings & Offline Status</Text>
        <OfflineIndicator />
      </View>

      {/* Offline Status Card */}
      <OfflineStatusCard />

      {/* Data Summary */}
      <Card style={styles.card}>
        <Card.Title title="Local Data Summary" />
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses:</Text>
            <Text style={styles.summaryValue}>{expenses.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Categories:</Text>
            <Text style={styles.summaryValue}>{categories.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Connection Status:</Text>
            <Text style={[
              styles.summaryValue,
              { color: offlineStatus.isOnline ? '#6BCF7F' : '#FF6B6B' }
            ]}>
              {offlineStatus.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Test Offline Functionality */}
      <Card style={styles.card}>
        <Card.Title title="Test Offline Functionality" />
        <Card.Content>
          <Text style={styles.description}>
            Use these buttons to test creating data while offline. 
            The data will be stored locally and synced when you're back online.
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleTestOfflineCreate}
              style={styles.testButton}
              disabled={refreshing}
            >
              Create Test Expense
            </Button>
            
            <Button
              mode="contained"
              onPress={handleTestOfflineCategory}
              style={styles.testButton}
              disabled={refreshing}
            >
              Create Test Category
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Offline Instructions */}
      <Card style={styles.card}>
        <Card.Title title="How Offline Mode Works" />
        <Card.Content>
          <Text style={styles.instructionText}>
            • <Text style={styles.bold}>Automatic Sync:</Text> Data syncs automatically when you come back online
          </Text>
          <Text style={styles.instructionText}>
            • <Text style={styles.bold}>Local Storage:</Text> All data is cached locally for offline access
          </Text>
          <Text style={styles.instructionText}>
            • <Text style={styles.bold}>Pending Changes:</Text> Your changes are queued and applied when online
          </Text>
          <Text style={styles.instructionText}>
            • <Text style={styles.bold}>Force Sync:</Text> Use the sync button to manually sync your data
          </Text>
          <Text style={styles.instructionText}>
            • <Text style={styles.bold}>Conflict Resolution:</Text> Server data takes precedence during sync
          </Text>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  testButton: {
    marginVertical: 4,
  },
  instructionText: {
    fontSize: 14,
    marginVertical: 4,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
});

export default SettingsScreen;
