import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SmartSummaryCard from '../components/SmartSummaryCard';
import InsightCard from '../components/InsightCard';
import { BarChart } from '../components/GraphComponent';
import { expenseApi } from '../api/expenseApi';
import { useTheme } from '../constants/ThemeProvider';
import { AnalyticsData, InsightsData, RootStackParamList } from '../types/types';

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

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch analytics data from the new API endpoint
      const analyticsData = await expenseApi.getAnalytics(filter);
      const insightsData = await expenseApi.getInsights();
      
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
      
      // Prepare bar chart data from time breakdown
      const timeMap: { [period: string]: { income: number; expense: number } } = {};
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
      
      const bar = Object.entries(timeMap).map(([label, v]) => ({ label, ...v }));
      setBarData(bar);
      
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
      // Fallback to demo data if API fails
      setIncome(filter === 'week' ? 12000 : filter === 'month' ? 50000 : 48000);
      setExpense(filter === 'week' ? 8000 : filter === 'month' ? 32000 : 28000);
      setPieData([]);
      setBarData([]);
      setInsights([
        { 
          icon: 'alert-circle', 
          message: 'Unable to load real data. Please check your connection.', 
          color: '#EF4444' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
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
});

export default AnalyticsScreen;
