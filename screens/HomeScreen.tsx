import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, FAB, Divider } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Expense } from '../types/types';
import { expenseApi, healthCheck } from '../api/expenseApi';
import ExpenseCard from '../components/ExpenseCard';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // Get current month data
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useFocusEffect(
    useCallback(() => {
      checkConnection();
      fetchData();
    }, [])
  );

  const checkConnection = async () => {
    try {
      const isHealthy = await healthCheck();
      setConnectionStatus(isHealthy);
    } catch (error) {
      setConnectionStatus(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent expenses (last 10)
      const allExpenses = await expenseApi.getAll();
      setRecentExpenses(allExpenses.slice(0, 10));

      // Fetch current month expenses for total
      const monthlyExpenses = await expenseApi.getAll({
        month: currentMonth,
        year: currentYear,
      });
      
      const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalThisMonth(total);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please check your internet connection and make sure the backend server is running.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkConnection();
    await fetchData();
    setRefreshing(false);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseApi.delete(id);
      // Refresh data after deletion
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Connection Status */}
        {connectionStatus !== null && (
          <View style={[
            styles.connectionStatus,
            connectionStatus ? styles.connected : styles.disconnected
          ]}>
            <Text style={styles.connectionText}>
              {connectionStatus ? '🟢 Connected to server' : '🔴 Server disconnected'}
            </Text>
          </View>
        )}

        {/* Monthly Summary Card */}
        <Card style={styles.summaryCard} mode="outlined">
          <Card.Content>
            <Text style={styles.summaryTitle}>This Month ({getMonthName()})</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(totalThisMonth)}</Text>
            <Divider style={styles.divider} />
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Summary')}
                style={styles.summaryButton}
              >
                View Summary
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('History')}
                style={styles.summaryButton}
              >
                View History
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard} mode="outlined">
          <Card.Content>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <Text style={styles.actionButtonText}>💰 Add Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddCategory')}
              >
                <Text style={styles.actionButtonText}>📝 Add Category</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Expenses */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('History')}
              labelStyle={styles.viewAllText}
            >
              View All
            </Button>
          </View>

          {recentExpenses.length === 0 ? (
            <Card style={styles.emptyCard} mode="outlined">
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyText}>No expenses yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the + button to add your first expense
                </Text>
              </Card.Content>
            </Card>
          ) : (
            recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onDelete={handleDeleteExpense}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        size="medium"
        onPress={() => navigation.navigate('AddExpense')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  connectionStatus: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 8,
  },
  connected: {
    backgroundColor: '#d4edda',
  },
  disconnected: {
    backgroundColor: '#f8d7da',
  },
  connectionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  recentSection: {
    marginBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6200ee',
  },
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default HomeScreen;
