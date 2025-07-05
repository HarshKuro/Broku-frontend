import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Searchbar, Button, Card, FAB } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Expense } from '../types/types';
import { expenseApi } from '../api/expenseApi';
import ExpenseCard from '../components/ExpenseCard';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);

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

    setFilteredExpenses(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterExpenses(expenses, query);
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
    setSearchQuery('');
    setFilteredExpenses(expenses);
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getFilterText = () => {
    if (filterMonth && filterYear) {
      const date = new Date(filterYear, filterMonth - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'All Time';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseCard expense={item} onDelete={handleDeleteExpense} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search by category or note..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        <Button
          mode={filterMonth ? 'contained' : 'outlined'}
          onPress={filterByCurrentMonth}
          style={styles.filterButton}
        >
          This Month
        </Button>
        <Button
          mode="outlined"
          onPress={clearFilters}
          style={styles.filterButton}
        >
          Clear Filters
        </Button>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard} mode="outlined">
        <Card.Content>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Period: {getFilterText()}</Text>
              <Text style={styles.summaryLabel}>
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryAmount}>{formatCurrency(getTotalAmount())}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {searchQuery || filterMonth ? 'No expenses found' : 'No expenses yet'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery || filterMonth 
          ? 'Try adjusting your search or filters'
          : 'Tap the + button to add your first expense'
        }
      </Text>
      {!searchQuery && !filterMonth && (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddExpense')}
          style={styles.emptyButton}
        >
          Add Expense
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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
  listContent: {
    paddingBottom: 80,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    marginRight: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default HistoryScreen;
