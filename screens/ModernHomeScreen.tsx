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
  const [apiConnected, setApiConnected] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkApiConnection();
      fetchHomeData();
    }, [])
  );

  const checkApiConnection = async () => {
    try {
      await healthCheck();
      setApiConnected(true);
    } catch (error) {
      console.error('API connection failed:', error);
      setApiConnected(false);
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent expenses (limit to 5)
      const allExpenses = await expenseApi.getAll();
      const recent = allExpenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRecentExpenses(recent);

      // Calculate this month's total
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const thisMonthExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      });
      
      const monthlyTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalThisMonth(monthlyTotal);
      
    } catch (error) {
      console.error('Error fetching home data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkApiConnection();
    await fetchHomeData();
    setRefreshing(false);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseApi.delete(id);
      // Remove from local state
      setRecentExpenses(prev => prev.filter(expense => expense._id !== id));
      // Recalculate monthly total
      fetchHomeData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
    }
  };

  const renderHeader = () => (
    <LinearGradient
      style={styles.headerGradient}
      colors={[colors.background, colors.surfaceVariant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.text.secondary }]}>
              Good {getTimeOfDay()}!
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              Your Expenses
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <IconButton
              icon={isDark ? "white-balance-sunny" : "moon-waning-crescent"}
              size={24}
              onPress={toggleTheme}
              iconColor={colors.text.primary}
            />
          </View>
        </View>

        {/* Monthly Summary */}
        <View style={[styles.monthlyCard, { backgroundColor: colors.surface }]}>
          <View style={styles.monthlyContent}>
            <View style={styles.monthlyLeft}>
              <Text style={[styles.monthlyLabel, { color: colors.text.secondary }]}>
                This Month
              </Text>
              <Text style={[styles.monthlyAmount, { color: colors.accent }]}>
                {formatCurrency(totalThisMonth)}
              </Text>
            </View>
            
            <View style={styles.monthlyStats}>
              <Text style={[styles.sectionTitle, { fontSize: 32, color: colors.primary }]}>
                📊
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddExpense')}
              style={[styles.actionButton, { backgroundColor: colors.primary, padding: 12, borderRadius: 12 }]}
            >
              <Text style={{ color: colors.surface, fontWeight: '600', textAlign: 'center' }}>➕ Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('AddCategory')}
              style={[styles.actionButton, { backgroundColor: colors.accent, padding: 12, borderRadius: 12 }]}
            >
              <Text style={{ color: colors.surface, fontWeight: '600', textAlign: 'center' }}>🏷️ Categories</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Summary')}
              style={[styles.actionButton, { borderWidth: 2, borderColor: colors.primary, padding: 12, borderRadius: 12, backgroundColor: colors.surface }]}
            >
              <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>📊 View Summary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('History')}
              style={[styles.actionButton, { borderWidth: 2, borderColor: colors.primary, padding: 12, borderRadius: 12, backgroundColor: colors.surface }]}
            >
              <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>📋 View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const renderRecentExpenses = () => (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recent Expenses</Text>
        {recentExpenses.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading...</Text>
      ) : recentExpenses.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No expenses yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.text.disabled }]}>
            Tap the + button to add your first expense
          </Text>
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
  );

  const renderConnectionStatus = () => (
    <LinearGradient
      style={[styles.connectionBanner, apiConnected ? styles.connectedBanner : styles.disconnectedBanner]}
      colors={apiConnected ? [colors.success, colors.successLight] : [colors.error, colors.errorLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={[styles.connectionText, { color: colors.surface }]}>
        {apiConnected ? '✅ Connected to server' : '❌ Server disconnected'}
      </Text>
    </LinearGradient>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 80,
    },
    headerGradient: {
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerContent: {
      paddingHorizontal: themedStyles.spacing.lg,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: themedStyles.spacing.lg,
    },
    headerActions: {
      flexDirection: 'row',
    },
    greeting: {
      fontSize: 16,
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    monthlyCard: {
      paddingVertical: themedStyles.spacing.sm,
      paddingHorizontal: themedStyles.spacing.md,
      margin: themedStyles.spacing.md,
      borderRadius: themedStyles.borderRadius.md,
      ...themedStyles.shadows.small,
    },
    connectedBanner: {
      backgroundColor: colors.successLight,
    },
    disconnectedBanner: {
      backgroundColor: colors.errorLight,
    },
    connectionText: {
      ...themedStyles.typography.caption,
      textAlign: 'center',
    },
    connectionBanner: {
      margin: themedStyles.spacing.md,
      paddingVertical: themedStyles.spacing.sm,
      borderRadius: themedStyles.borderRadius.sm,
    },
    monthlyContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    monthlyLeft: {
      flex: 1,
    },
    monthlyLabel: {
      fontSize: 14,
      marginBottom: 4,
    },
    monthlyAmount: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    monthlyStats: {
      alignItems: 'center',
    },
    actionsGrid: {
      marginTop: themedStyles.spacing.md,
    },
    actionsRow: {
      flexDirection: 'row',
      marginBottom: themedStyles.spacing.sm,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: themedStyles.spacing.xs,
      paddingVertical: themedStyles.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      padding: themedStyles.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: themedStyles.spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '500',
    },
    loadingText: {
      textAlign: 'center',
      marginVertical: themedStyles.spacing.xl,
    },
    emptyState: {
      padding: themedStyles.spacing.xl,
      alignItems: 'center',
      borderRadius: themedStyles.borderRadius.md,
      ...themedStyles.shadows.small,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: themedStyles.spacing.sm,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      margin: themedStyles.spacing.lg,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderConnectionStatus()}
        {renderRecentExpenses()}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        size="medium"
        onPress={() => navigation.navigate('AddExpense')}
      />
    </View>
  );
};

export default HomeScreen;
