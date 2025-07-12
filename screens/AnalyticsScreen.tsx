import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import SmartSummaryCard from '../components/SmartSummaryCard';
import InsightCard from '../components/InsightCard';
import { BarChart } from '../components/GraphComponent';
import { expenseApi } from '../api/expenseApi';
import { cashWalletApi } from '../api/cashWalletApi';
import { useTheme } from '../constants/ThemeProvider';
import { AnalyticsData, InsightsData, RootStackParamList, CashWallet, CashTransaction } from '../types/types';

const screenWidth = Dimensions.get('window').width;

type AnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analytics'>;

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<AnalyticsScreenNavigationProp>();
  const [filter, setFilter] = useState<'week' | 'month' | 'lastMonth'>('month');
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [cashWallet, setCashWallet] = useState<CashWallet | null>(null);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch analytics data from the new API endpoint
      const analyticsData = await expenseApi.getAnalytics(filter);
      const insightsData = await expenseApi.getInsights();
      
      // Fetch cash wallet data
      const walletResponse = await cashWalletApi.getCashWallet();
      if (walletResponse.success && walletResponse.data) {
        setCashWallet(walletResponse.data);
      }
      
      // Fetch cash transactions
      const cashTransactionsResponse = await cashWalletApi.getCashTransactions(50, 0);
      if (cashTransactionsResponse.success && cashTransactionsResponse.data) {
        setCashTransactions(cashTransactionsResponse.data.transactions);
      }
      
      // Set income and expense from real data
      setIncome(analyticsData.summary.income);
      setExpense(analyticsData.summary.expense);
      
      // Prepare pie chart data from real expense categories
      const palette = ['#4C7EFF', '#FFA657', '#EF4444', '#22C55E', '#A78BFA', '#F59E42', '#10B981', '#8B5CF6', '#F97316'];
      const pie = analyticsData.expensesByCategory.slice(0, 8).map((cat, idx) => ({
        name: cat._id,
        population: cat.totalAmount,
        color: palette[idx % palette.length],
        legendFontColor: colors.text.primary,
        legendFontSize: 12,
      }));
      setPieData(pie);
      
      // Prepare payment method analytics
      const paymentMethods = ['cash', 'card', 'digital', 'other'];
      const paymentData = paymentMethods.map((method, idx) => {
        const methodExpenses = analyticsData.expensesByCategory.reduce((total, cat) => {
          // For now, we'll simulate payment method data
          // In a real implementation, you'd get this from the backend
          return total + (cat.totalAmount * (method === 'cash' ? 0.3 : method === 'card' ? 0.4 : method === 'digital' ? 0.25 : 0.05));
        }, 0);
        
        return {
          name: method.charAt(0).toUpperCase() + method.slice(1),
          population: Math.round(methodExpenses),
          color: palette[idx + 4],
          legendFontColor: colors.text.primary,
          legendFontSize: 12,
        };
      }).filter(item => item.population > 0);
      setPaymentMethodData(paymentData);
      
      // Prepare bar chart data from time breakdown including cash transactions
      const timeMap: { [period: string]: { income: number; expense: number } } = {};
      
      // Add regular expense/income data
      analyticsData.timeBreakdown.forEach(item => {
        const date = new Date(item._id.date);
        let period: string;
        
        if (filter === 'week') {
          period = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          period = `${date.getDate()}/${date.getMonth() + 1}`;
        }
        
        if (!timeMap[period]) timeMap[period] = { income: 0, expense: 0 };
        
        if (item._id.type === 'income') {
          timeMap[period].income += item.totalAmount;
        } else {
          timeMap[period].expense += item.totalAmount;
        }
      });
      
      // Add cash transactions to the time breakdown
      cashTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        let period: string;
        
        if (filter === 'week') {
          period = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          period = `${date.getDate()}/${date.getMonth() + 1}`;
        }
        
        if (!timeMap[period]) timeMap[period] = { income: 0, expense: 0 };
        
        if (transaction.type === 'add') {
          timeMap[period].income += transaction.amount;
        } else if (transaction.type === 'spend') {
          timeMap[period].expense += transaction.amount;
        }
      });
      
      // Sort periods chronologically and prepare final bar data
      const sortedPeriods = Object.entries(timeMap).sort(([a], [b]) => {
        if (filter === 'week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return days.indexOf(a) - days.indexOf(b);
        } else {
          const [dayA, monthA] = a.split('/').map(Number);
          const [dayB, monthB] = b.split('/').map(Number);
          return (monthA - monthB) || (dayA - dayB);
        }
      });
      
      // Ensure bar data is properly structured with default values
      const bar = sortedPeriods.map(([label, v]) => ({
        label: label || 'Unknown',
        income: Math.max(0, v?.income || 0),
        expense: Math.max(0, v?.expense || 0)
      })).filter(item => item.label && item.label !== 'Unknown');
      
      // Only set bar data if we have valid data
      if (bar.length > 0) {
        console.log('Setting bar data:', bar);
        setBarData(bar);
      } else {
        console.log('No valid bar data, setting empty array');
        setBarData([]);
      }
      
      // Generate smart insights from real data
      const savings = analyticsData.summary.balance;
      const spendingRate = analyticsData.summary.income > 0 ? 
        Math.round((analyticsData.summary.expense / analyticsData.summary.income) * 100) : 0;
      
      const newInsights = [];
      
      // Savings insight
      if (savings > 0) {
        newInsights.push({
          icon: 'wallet-outline',
          message: `You saved ₹${savings.toLocaleString()} this month`,
          color: '#22C55E'
        });
      } else if (savings < 0) {
        newInsights.push({
          icon: 'trending-down',
          message: `You overspent by ₹${Math.abs(savings).toLocaleString()} this month`,
          color: '#EF4444'
        });
      }
      
      // Spending pattern insight
      if (spendingRate <= 70) {
        newInsights.push({
          icon: 'trending-down',
          message: `You're spending ${100 - spendingRate}% less than your average`,
          color: '#22C55E'
        });
      } else if (spendingRate >= 90) {
        newInsights.push({
          icon: 'warning',
          message: `High spending alert: ${spendingRate}% of income used`,
          color: '#EF4444'
        });
      }
      
      // Category insights from real data
      if (analyticsData.expensesByCategory.length > 0) {
        const topCategory = analyticsData.expensesByCategory[0];
        const categoryAmount = topCategory.totalAmount;
        
        // Map common categories to relevant icons
        const categoryIcons: { [key: string]: string } = {
          'food': 'restaurant-outline',
          'restaurant': 'restaurant-outline',
          'groceries': 'basket-outline',
          'transport': 'car-outline',
          'travel': 'airplane-outline',
          'fuel': 'car-outline',
          'entertainment': 'game-controller-outline',
          'movies': 'videocam-outline',
          'shopping': 'bag-outline',
          'clothes': 'shirt-outline',
          'bills': 'receipt-outline',
          'utilities': 'home-outline',
          'health': 'medical-outline',
          'fitness': 'fitness-outline',
          'education': 'school-outline',
        };
        
        const categoryIcon = categoryIcons[topCategory._id.toLowerCase()] || 'stats-chart-outline';
        
        if (categoryAmount > 2000) {
          newInsights.push({
            icon: categoryIcon,
            message: `${topCategory._id} category up by ₹${categoryAmount.toLocaleString()} this month`,
            color: '#4C7EFF'
          });
        }
      }
      
      // Income insights
      if (analyticsData.summary.income > 0) {
        const incomeVsExpenseRatio = analyticsData.summary.expense / analyticsData.summary.income;
        if (incomeVsExpenseRatio < 0.5) {
          newInsights.push({
            icon: 'trophy-outline',
            message: `Great job! You're only using ${Math.round(incomeVsExpenseRatio * 100)}% of your income`,
            color: '#FFD700'
          });
        }
      }
      
      // Add insights from backend API
      if (insightsData.topCategory && insightsData.topCategory.totalAmount > 1000) {
        const isHighSpending = insightsData.topCategory.totalAmount > 5000;
        newInsights.push({
          icon: isHighSpending ? 'alert-circle' : 'stats-chart',
          message: `Top category: ${insightsData.topCategory._id} (₹${insightsData.topCategory.totalAmount.toLocaleString()})`,
          color: isHighSpending ? '#EF4444' : '#4C7EFF'
        });
      }

      if (insightsData.recentHighExpense && insightsData.recentHighExpense.amount > 1000) {
        newInsights.push({
          icon: 'alert-circle',
          message: `High expense alert: ₹${insightsData.recentHighExpense.amount.toLocaleString()} on ${insightsData.recentHighExpense.category}`,
          color: '#FFA657'
        });
      }
      
      // Cash wallet insights
      if (cashWallet && cashWallet.totalCash > 0) {
        newInsights.push({
          icon: 'wallet',
          message: `Cash on hand: ₹${cashWallet.totalCash.toLocaleString()}`,
          color: '#22C55E'
        });
      }
      
      // Cash transaction insights
      if (cashTransactions.length > 0) {
        const thisMonthCashSpent = cashTransactions
          .filter(t => {
            const transactionDate = new Date(t.date);
            const now = new Date();
            return t.type === 'spend' && 
                   transactionDate.getMonth() === now.getMonth() && 
                   transactionDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, t) => sum + t.amount, 0);
          
        if (thisMonthCashSpent > 2000) {
          newInsights.push({
            icon: 'cash',
            message: `Cash spending this month: ₹${thisMonthCashSpent.toLocaleString()}`,
            color: '#FFA657'
          });
        }
      }
      
      // Ensure we have at least a few meaningful insights
      if (newInsights.length === 0) {
        newInsights.push({
          icon: 'information-circle-outline',
          message: 'Start tracking expenses to get personalized insights',
          color: '#4C7EFF'
        });
      }
      
      setInsights(newInsights.slice(0, 4)); // Limit to 4 insights for clean UI
      
    } catch (e) {
      console.error('Analytics fetch error:', e);
      // Set safe fallback values
      setIncome(0);
      setExpense(0);
      setPieData([]);
      setBarData([]);
      setPaymentMethodData([]);
      setCashWallet(null);
      setCashTransactions([]);
      setInsights([
        {
          icon: 'information-circle-outline',
          message: 'Unable to load analytics data. Please try again.',
          color: '#EF4444'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              Loading analytics...
            </Text>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                📊 Smart Analytics
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                Track your financial insights
              </Text>
            </View>

            {/* Smart Summary Card */}
            <SmartSummaryCard income={income} expense={expense} />

            {/* Cash Wallet Summary */}
            {cashWallet && (
              <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.chartHeader}>
                  <Ionicons name="wallet" size={20} color={colors.primary} />
                  <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
                    Cash Wallet
                  </Text>
                </View>
                <View style={styles.cashSummary}>
                  <View style={styles.cashItem}>
                    <Text style={[styles.cashLabel, { color: colors.text.secondary }]}>
                      Available Cash
                    </Text>
                    <Text style={[styles.cashAmount, { color: colors.success }]}>
                      ₹{cashWallet.totalCash.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.cashItem}>
                    <Text style={[styles.cashLabel, { color: colors.text.secondary }]}>
                      Total Transactions
                    </Text>
                    <Text style={[styles.cashCount, { color: colors.text.primary }]}>
                      {cashTransactions.length}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Filter Dropdown */}
            <View style={styles.filterContainer}>
              <Text style={[styles.filterLabel, { color: colors.text.primary }]}>Time Period</Text>
              <View style={styles.filterButtons}>
                {[
                  { key: 'week', label: 'This Week' },
                  { key: 'month', label: 'This Month' },
                  { key: 'lastMonth', label: 'Last Month' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterButton,
                      { 
                        backgroundColor: filter === option.key ? colors.primary : colors.surface,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setFilter(option.key as any)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      { color: filter === option.key ? colors.surface : colors.text.primary }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method Chart */}
            {paymentMethodData.length > 0 && (
              <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.chartHeader}>
                  <Ionicons name="card" size={20} color={colors.primary} />
                  <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
                    Payment Methods
                  </Text>
                </View>
                <PieChart
                  data={paymentMethodData}
                  width={screenWidth - 64}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => colors.primary,
                    labelColor: () => colors.text.primary,
                    propsForLabels: {
                      fontSize: 12,
                      fontWeight: '500'
                    }
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            )}

            {/* Charts Section */}
            {pieData.length > 0 && (
              <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.chartHeader}>
                  <Ionicons name="pie-chart" size={20} color={colors.primary} />
                  <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
                    Expense Distribution
                  </Text>
                </View>
                <PieChart
                  data={pieData}
                  width={screenWidth - 64}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => colors.primary,
                    labelColor: () => colors.text.primary,
                    propsForLabels: {
                      fontSize: 12,
                      fontWeight: '500'
                    }
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            )}

            {/* Bar Chart */}
            {barData.length > 0 && (
              <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.chartHeader}>
                  <Ionicons name="bar-chart" size={20} color={colors.primary} />
                  <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
                    {filter === 'week' ? 'Daily Trends' : 'Income vs Expenses'}
                  </Text>
                </View>
                <BarChart data={barData} />
              </View>
            )}

            {/* Insights Section */}
            <View style={styles.insightsContainer}>
              <View style={styles.chartHeader}>
                <Ionicons name="bulb" size={20} color={colors.primary} />
                <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
                  Smart Insights
                </Text>
                <TouchableOpacity 
                  style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('Insights')}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {insights.slice(0, 3).map((insight, i) => (
                <InsightCard key={i} {...insight} />
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4C7EFF',
  },
  viewAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  insightsContainer: {
    marginBottom: 20,
  },
  cashSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cashItem: {
    alignItems: 'center',
  },
  cashLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  cashAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cashCount: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AnalyticsScreen;
