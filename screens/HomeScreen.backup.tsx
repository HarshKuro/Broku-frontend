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
import { FAB, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Expense } from '../types/types';
import { expenseApi, healthCheck } from '../api/expenseApi';
import ExpenseCard from '../components/ExpenseCard';
import { formatCurrency, formatCurrencyCompact } from '../utils/currency';
import { useTheme, useThemedStyles } from '../constants/ThemeProvider';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const themedStyles = useThemedStyles();
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
    return formatCurrencyCompact(amount);
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surfaceVariant]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
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
        <View style={styles.summaryCard}>
          <View style={styles.actionsCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
              style={styles.actionsGradient}
            >
              <Text style={styles.sectionTitle}>Expenses this {getMonthName()}</Text>
              <Text style={[styles.sectionTitle, { fontSize: 32, color: theme.colors.primary }]}>
                {formatCurrency(totalThisMonth)}
              </Text>
              <Text style={styles.viewAllText}>Total spent this month</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={styles.actionsGradient}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary, padding: 12, borderRadius: 12 }]}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>💰 Add Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.secondary, padding: 12, borderRadius: 12 }]}
                onPress={() => navigation.navigate('AddCategory')}
              >
                <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>📝 Add Category</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { borderWidth: 2, borderColor: theme.colors.primary, padding: 12, borderRadius: 12 }]}
                onPress={() => navigation.navigate('Summary')}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: '600', textAlign: 'center' }}>📊 View Summary</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { borderWidth: 2, borderColor: theme.colors.primary, padding: 12, borderRadius: 12 }]}
                onPress={() => navigation.navigate('History')}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: '600', textAlign: 'center' }}>📋 View History</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Expenses */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentExpenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.emptyCard}
              >
                <Text style={styles.emptyIcon}>🎯</Text>
                <Text style={styles.emptyText}>No expenses yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the + button to add your first expense
                </Text>
              </LinearGradient>
            </View>
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
      <View style={styles.fabContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.fabGradient}
        >
          <FAB
            style={styles.fab}
            icon="plus"
            size="medium"
            onPress={() => navigation.navigate('AddExpense')}
            color="#FFFFFF"
          />
        </LinearGradient>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  connectionStatus: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  connected: {
    backgroundColor: theme.colors.successLight,
  },
  disconnected: {
    backgroundColor: theme.colors.errorLight,
  },
  connectionText: {
    textAlign: 'center',
    ...theme.typography.caption,
    fontWeight: '500',
  },
  summaryCard: {
    margin: theme.spacing.md,
  },
  actionsCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  actionsGradient: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  recentSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  viewAllText: {
    ...theme.typography.body2,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    marginHorizontal: theme.spacing.md,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.h4,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.typography.body2,
    color: theme.colors.text.disabled,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.large,
  },
  fabGradient: {
    borderRadius: theme.borderRadius.full,
  },
  fab: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
});

export default HomeScreen;
