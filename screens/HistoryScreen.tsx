import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Expense, CashTransaction, CashWallet } from '../types/types';
import { offlineExpenseApi as expenseApi } from '../services/offlineApi';
import { cashWalletApi } from '../api/cashWalletApi';
import ExpenseCard from '../components/ExpenseCard';
import { formatCurrency } from '../utils/currency';
import { useTheme, useThemedStyles } from '../constants/ThemeProvider';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const themedStyles = useThemedStyles();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [filteredCashTransactions, setFilteredCashTransactions] = useState<CashTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'cash'>('all');
  const [showCashTransactions, setShowCashTransactions] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const fetchedExpenses = await expenseApi.getAll();
      setExpenses(fetchedExpenses);
      setFilteredExpenses(fetchedExpenses);
      
      // Fetch cash transactions
      const cashResponse = await cashWalletApi.getCashTransactions(100, 0);
      if (cashResponse.success && cashResponse.data) {
        setCashTransactions(cashResponse.data.transactions);
        setFilteredCashTransactions(cashResponse.data.transactions);
      } else {
        setCashTransactions([]);
        setFilteredCashTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Failed to fetch expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseApi.delete(id);
      // Remove from local state
      const updatedExpenses = expenses.filter(expense => expense._id !== id);
      setExpenses(updatedExpenses);
      filterExpenses(updatedExpenses, searchQuery);
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
    }
  };

  const filterExpenses = (expenseList: Expense[], query: string) => {
    let filtered = expenseList;

    // Filter by search query (category or note)
    if (query) {
      filtered = filtered.filter(expense =>
        expense.category.toLowerCase().includes(query.toLowerCase()) ||
        expense.note.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by month/year if set
    if (filterMonth && filterYear) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === filterMonth && 
               expenseDate.getFullYear() === filterYear;
      });
    }

    // Filter by transaction type
    if (filterType !== 'all') {
      if (filterType === 'expense') {
        filtered = filtered.filter(expense => expense.type === 'expense' || !expense.type);
      } else {
        filtered = filtered.filter(expense => expense.type === filterType);
      }
    }

    setFilteredExpenses(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (showCashTransactions) {
      // Filter cash transactions
      let filteredCash = cashTransactions;
      
      if (query) {
        filteredCash = filteredCash.filter(transaction =>
          transaction.description.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (filterMonth && filterYear) {
        filteredCash = filteredCash.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getMonth() + 1 === filterMonth && 
                 transactionDate.getFullYear() === filterYear;
        });
      }
      
      setFilteredCashTransactions(filteredCash);
    } else {
      // Filter regular expenses
      filterExpenses(expenses, query);
    }
  };

  const handleTypeFilter = (type: 'all' | 'income' | 'expense' | 'cash') => {
    setFilterType(type);
    setShowCashTransactions(type === 'cash');
    
    if (type === 'cash') {
      // Filter cash transactions
      let filteredCash = cashTransactions;
      
      if (searchQuery) {
        filteredCash = filteredCash.filter(transaction =>
          transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (filterMonth && filterYear) {
        filteredCash = filteredCash.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getMonth() + 1 === filterMonth && 
                 transactionDate.getFullYear() === filterYear;
        });
      }
      
      setFilteredCashTransactions(filteredCash);
      return;
    }
    
    // Re-filter regular expenses with new type
    let filtered = expenses;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.note.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply month/year filter
    if (filterMonth && filterYear) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === filterMonth && 
               expenseDate.getFullYear() === filterYear;
      });
    }

    // Apply type filter
    if (type !== 'all') {
      if (type === 'expense') {
        filtered = filtered.filter(expense => expense.type === 'expense' || !expense.type);
      } else {
        filtered = filtered.filter(expense => expense.type === type);
      }
    }

    setFilteredExpenses(filtered);
  };

  const filterByCurrentMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    setFilterMonth(currentMonth);
    setFilterYear(currentYear);
    
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    setFilteredExpenses(filtered);
  };

  const clearFilters = () => {
    setFilterMonth(null);
    setFilterYear(null);
    setFilterType('all');
    setSearchQuery('');
    setFilteredExpenses(expenses);
  };

  const getTotalAmount = () => {
    if (showCashTransactions) {
      const cashAdded = filteredCashTransactions
        .filter(t => t.type === 'add')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const cashSpent = filteredCashTransactions
        .filter(t => t.type === 'spend' || t.type === 'withdraw')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        income: cashAdded,
        expenses: cashSpent,
        net: cashAdded - cashSpent
      };
    }
    
    const totalIncome = filteredExpenses
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalExpenses = filteredExpenses
      .filter(item => item.type === 'expense' || !item.type) // Treat missing type as expense
      .reduce((sum, item) => sum + item.amount, 0);
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      net: totalIncome - totalExpenses
    };
  };

  const formatCurrencyLocal = (amount: number) => {
    return formatCurrency(amount);
  };

  const getFilterText = () => {
    if (filterMonth && filterYear) {
      const date = new Date(filterYear, filterMonth - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'All Time';
  };

  // Create styles inside component to access theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modernHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    headerIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    listContent: {
      paddingBottom: 80,
    },
    header: {
      padding: 20,
      paddingBottom: 12,
    },
    searchContainer: {
      marginBottom: 16,
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchBar: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      color: colors.text.primary,
    },
    clearButton: {
      padding: 4,
    },
    filterRow: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 12,
    },
    filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    summaryCard: {
      backgroundColor: colors.surface,
      marginBottom: 8,
      borderRadius: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    summaryRight: {
      alignItems: 'flex-end',
    },
    summaryAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.error,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.text.disabled,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    emptyButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    emptyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
      borderRadius: 28,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    cashTransactionCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginVertical: 6,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    cashTransactionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cashTransactionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    cashTransactionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    cashTransactionDetails: {
      flex: 1,
    },
    cashTransactionDescription: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    cashTransactionDate: {
      fontSize: 14,
    },
    cashTransactionRight: {
      alignItems: 'flex-end',
    },
    cashTransactionAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    cashTransactionType: {
      fontSize: 12,
      textTransform: 'uppercase',
      fontWeight: '500',
    },
  });

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseCard expense={item} onDelete={handleDeleteExpense} />
  );
  
  const renderCashTransactionItem = ({ item }: { item: CashTransaction }) => (
    <View style={[styles.cashTransactionCard, { backgroundColor: colors.surface }]}>
      <View style={styles.cashTransactionContent}>
        <View style={styles.cashTransactionLeft}>
          <View style={[
            styles.cashTransactionIcon,
            { backgroundColor: item.type === 'add' ? colors.success + '20' : colors.error + '20' }
          ]}>
            <Ionicons 
              name={item.type === 'add' ? 'add-circle' : item.type === 'spend' ? 'cart' : 'remove-circle'} 
              size={24} 
              color={item.type === 'add' ? colors.success : colors.error} 
            />
          </View>
          <View style={styles.cashTransactionDetails}>
            <Text style={[styles.cashTransactionDescription, { color: colors.text.primary }]}>
              {item.description}
            </Text>
            <Text style={[styles.cashTransactionDate, { color: colors.text.secondary }]}>
              {new Date(item.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        <View style={styles.cashTransactionRight}>
          <Text style={[
            styles.cashTransactionAmount,
            { color: item.type === 'add' ? colors.success : colors.error }
          ]}>
            {item.type === 'add' ? '+' : '-'}₹{item.amount.toLocaleString()}
          </Text>
          <Text style={[styles.cashTransactionType, { color: colors.text.secondary }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color={colors.text.disabled} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by category or note..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            placeholderTextColor={colors.text.disabled}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterMonth ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface }
          ]}
          onPress={filterByCurrentMonth}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filterMonth ? '#FFFFFF' : colors.text.primary }
          ]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.surface }]}
          onPress={clearFilters}
        >
          <Text style={[styles.filterButtonText, { color: colors.text.primary }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Type Filter Buttons */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'all' ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface }
          ]}
          onPress={() => handleTypeFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filterType === 'all' ? '#FFFFFF' : colors.text.primary }
          ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'income' ? { backgroundColor: colors.success } : { backgroundColor: colors.surface }
          ]}
          onPress={() => handleTypeFilter('income')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filterType === 'income' ? '#FFFFFF' : colors.text.primary }
          ]}>
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'expense' ? { backgroundColor: colors.error } : { backgroundColor: colors.surface }
          ]}
          onPress={() => handleTypeFilter('expense')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filterType === 'expense' ? '#FFFFFF' : colors.text.primary }
          ]}>
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'cash' ? { backgroundColor: colors.warning } : { backgroundColor: colors.surface }
          ]}
          onPress={() => handleTypeFilter('cash')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filterType === 'cash' ? '#FFFFFF' : colors.text.primary }
          ]}>
            Cash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Period: {getFilterText()}</Text>
            <Text style={styles.summaryLabel}>
              {showCashTransactions ? filteredCashTransactions.length : filteredExpenses.length} transaction{(showCashTransactions ? filteredCashTransactions.length : filteredExpenses.length) !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.summaryRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.summaryAmount, { color: colors.success, fontSize: 16 }]}>
                Income: {formatCurrencyLocal(getTotalAmount().income)}
              </Text>
              <Text style={[styles.summaryAmount, { color: colors.error, fontSize: 16 }]}>
                Expenses: {formatCurrencyLocal(getTotalAmount().expenses)}
              </Text>
              <View style={{ height: 1, backgroundColor: colors.border, width: '100%', marginVertical: 4 }} />
              <Text style={[styles.summaryAmount, { 
                color: getTotalAmount().net >= 0 ? colors.success : colors.error,
                fontSize: 20,
                fontWeight: 'bold'
              }]}>
                Net: {formatCurrencyLocal(getTotalAmount().net)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {showCashTransactions 
          ? (searchQuery || filterMonth ? 'No cash transactions found' : 'No cash transactions yet')
          : (searchQuery || filterMonth ? 'No expenses found' : 'No expenses yet')
        }
      </Text>
      <Text style={styles.emptySubtext}>
        {showCashTransactions
          ? (searchQuery || filterMonth 
              ? 'Try adjusting your search or filters'
              : 'Add some cash to your wallet to start tracking')
          : (searchQuery || filterMonth 
              ? 'Try adjusting your search or filters'
              : 'Tap the + button to add your first expense')
        }
      </Text>
      {!searchQuery && !filterMonth && !showCashTransactions && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.emptyButtonText}>Add Expense</Text>
        </TouchableOpacity>
      )}
      {!searchQuery && !filterMonth && showCashTransactions && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('CashWallet')}
        >
          <Text style={styles.emptyButtonText}>Go to Cash Wallet</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" translucent={false} />
      
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="filter" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {showCashTransactions ? (
        <FlatList
          data={filteredCashTransactions}
          renderItem={renderCashTransactionItem}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        size="medium"
        onPress={() => navigation.navigate('AddExpense')}
      />
    </SafeAreaView>
  );
};

export default HistoryScreen;
