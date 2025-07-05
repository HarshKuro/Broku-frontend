import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MonthlySummary } from '../types/types';
import { expenseApi } from '../api/expenseApi';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../constants/ThemeProvider';

type SummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Summary'>;

interface Props {
  navigation: SummaryScreenNavigationProp;
}

const SummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'income' | 'expenses' | 'savings'>('expenses');

  const screenWidth = Dimensions.get('window').width;

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [selectedMonth, selectedYear])
  );

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const summaryData = await expenseApi.getMonthlySummary(selectedMonth, selectedYear);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching summary:', error);
      Alert.alert('Error', 'Failed to fetch summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  const getMonthName = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Generate demo savings trend data
  const generateSavingsTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [8000, 12000, 15000, 18000, 22000, 25000];
    
    return {
      labels: months,
      datasets: [{
        data: data,
        color: (opacity = 1) => colors.success,
        strokeWidth: 3,
      }]
    };
  };

  // Generate table data based on view mode
  const generateTableData = () => {
    if (!summary) return [];
    
    const mockData = [
      { category: 'Food', income: 0, expense: 8500, balance: -8500 },
      { category: 'Transport', income: 0, expense: 3200, balance: -3200 },
      { category: 'Entertainment', income: 0, expense: 2800, balance: -2800 },
      { category: 'Salary', income: 50000, expense: 0, balance: 50000 },
      { category: 'Freelance', income: 15000, expense: 0, balance: 15000 },
    ];

    if (viewMode === 'income') {
      return mockData.filter(item => item.income > 0);
    } else if (viewMode === 'expenses') {
      return mockData.filter(item => item.expense > 0);
    } else {
      return mockData.map(item => ({
        ...item,
        balance: item.income - item.expense
      }));
    }
  };

  const totalIncome = 65000; // Demo data
  const totalExpense = 14500;
  const savings = totalIncome - totalExpense;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          📈 Financial Summary
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Track your financial progress
        </Text>
      </View>

      {/* Month Navigation */}
      <View style={[styles.monthNavigator, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthText, { color: colors.text.primary }]}>
          {getMonthName(selectedMonth, selectedYear)}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, { backgroundColor: colors.success + '20' }]}>
          <Ionicons name="trending-up" size={24} color={colors.success} />
          <Text style={[styles.cardLabel, { color: colors.text.secondary }]}>Total Income</Text>
          <Text style={[styles.cardAmount, { color: colors.success }]}>
            ₹{totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.error + '20' }]}>
          <Ionicons name="trending-down" size={24} color={colors.error} />
          <Text style={[styles.cardLabel, { color: colors.text.secondary }]}>Total Expenses</Text>
          <Text style={[styles.cardAmount, { color: colors.error }]}>
            ₹{totalExpense.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="wallet" size={24} color={colors.primary} />
          <Text style={[styles.cardLabel, { color: colors.text.secondary }]}>Net Savings</Text>
          <Text style={[styles.cardAmount, { color: savings > 0 ? colors.success : colors.error }]}>
            ₹{savings.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={[styles.toggleLabel, { color: colors.text.primary }]}>View Mode</Text>
        <View style={styles.toggleButtons}>
          {[
            { key: 'income', label: 'Income', icon: 'trending-up' },
            { key: 'expenses', label: 'Expenses', icon: 'trending-down' },
            { key: 'savings', label: 'Savings', icon: 'wallet' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.toggleButton,
                { 
                  backgroundColor: viewMode === option.key ? colors.primary : colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setViewMode(option.key as any)}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={viewMode === option.key ? colors.surface : colors.text.primary} 
              />
              <Text style={[
                styles.toggleButtonText,
                { color: viewMode === option.key ? colors.surface : colors.text.primary }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Line Graph - Monthly Savings Trend */}
      <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.chartHeader}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
            Monthly Savings Trend
          </Text>
        </View>
        
        <LineChart
          data={generateSavingsTrend()}
          width={screenWidth - 64}
          height={200}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.success,
            labelColor: (opacity = 1) => colors.text.primary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.success
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Table-style view */}
      <View style={[styles.tableContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.tableHeader}>
          <Ionicons name="list" size={20} color={colors.primary} />
          <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
            {viewMode === 'income' ? 'Income Sources' : 
             viewMode === 'expenses' ? 'Expense Categories' : 'Balance Overview'}
          </Text>
        </View>

        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderText, { color: colors.text.primary }]}>Category</Text>
          {viewMode === 'savings' && (
            <>
              <Text style={[styles.tableHeaderText, { color: colors.success }]}>Income</Text>
              <Text style={[styles.tableHeaderText, { color: colors.error }]}>Expense</Text>
            </>
          )}
          <Text style={[styles.tableHeaderText, { color: colors.primary }]}>
            {viewMode === 'income' ? 'Amount' : viewMode === 'expenses' ? 'Amount' : 'Balance'}
          </Text>
        </View>

        {generateTableData().map((item, index) => (
          <View key={index} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.tableCellText, { color: colors.text.primary }]}>
              {item.category}
            </Text>
            {viewMode === 'savings' && (
              <>
                <Text style={[styles.tableCellText, { color: colors.success }]}>
                  ₹{item.income.toLocaleString()}
                </Text>
                <Text style={[styles.tableCellText, { color: colors.error }]}>
                  ₹{item.expense.toLocaleString()}
                </Text>
              </>
            )}
            <Text style={[
              styles.tableCellText, 
              { 
                color: viewMode === 'income' ? colors.success : 
                       viewMode === 'expenses' ? colors.error : 
                       item.balance > 0 ? colors.success : colors.error,
                fontWeight: '600'
              }
            ]}>
              ₹{(viewMode === 'income' ? item.income : 
                 viewMode === 'expenses' ? item.expense : 
                 item.balance).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Download CSV Button */}
      <TouchableOpacity style={[styles.downloadButton, { backgroundColor: colors.primary }]}>
        <Ionicons name="download" size={20} color={colors.surface} />
        <Text style={[styles.downloadButtonText, { color: colors.surface }]}>
          Download as CSV
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryCards: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tableContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 126, 255, 0.1)',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableCellText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SummaryScreen;
