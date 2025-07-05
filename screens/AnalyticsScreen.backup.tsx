import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import SmartSummaryCard from '../components/SmartSummaryCard';
import InsightCard from '../components/InsightCard';
import { BarChart } from '../components/GraphComponent';
import { expenseApi } from '../api/expenseApi';
import { useTheme } from '../constants/ThemeProvider';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
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
      const now = new Date();
      let month = now.getMonth();
      let year = now.getFullYear();
      if (filter === 'lastMonth') {
        month = month === 0 ? 11 : month - 1;
        if (month === 11) year -= 1;
      }
      // Fetch all expenses for the period
      const expenses = await expenseApi.getAll({ month, year });
      // Fetch monthly summary for pie chart
      const summary = await expenseApi.getMonthlySummary(month, year);
      // Calculate income and expense (assuming positive = income, negative = expense, or use category)
      let totalIncome = 0, totalExpense = 0;
      expenses.forEach(e => {
        if (e.amount > 0) totalIncome += e.amount;
        else totalExpense += Math.abs(e.amount);
      });
      setIncome(totalIncome);
      setExpense(totalExpense);
      // Pie chart data by category (assign colors for more categories)
      const palette = ['#4C7EFF', '#FFA657', '#EF4444', '#22C55E', '#A78BFA', '#F59E42', '#10B981'];
      const pie = summary.categoryWise.map((cat, idx) => ({
        name: cat._id,
        population: cat.totalAmount,
        color: palette[idx % palette.length],
        legendFontColor: '#222',
        legendFontSize: 14,
      }));
      setPieData(pie);
      // Bar chart: group by day
      const dayMap: { [date: string]: { income: number; expense: number } } = {};
      expenses.forEach(e => {
        const d = new Date(e.date);
        const day = `${d.getDate()}/${d.getMonth() + 1}`;
        if (!dayMap[day]) dayMap[day] = { income: 0, expense: 0 };
        if (e.amount > 0) dayMap[day].income += e.amount;
        else dayMap[day].expense += Math.abs(e.amount);
      });
      const bar = Object.entries(dayMap).map(([label, v]) => ({ label, ...v }));
      setBarData(bar);
      // Example insights (replace with real logic as needed)
      setInsights([
        { icon: 'trending-up', message: `You saved ₹${(totalIncome-totalExpense).toLocaleString()} this month`, color: '#22C55E' },
        { icon: 'trending-down', message: `You’re spending ${totalExpense > 0 ? Math.round((totalExpense/totalIncome)*100) : 0}% of your income`, color: '#EF4444' },
      ]);
    } catch (e) {
      setIncome(0); setExpense(0); setPieData([]); setBarData([]); setInsights([]);
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
              </View>
              {insights.map((insight, i) => (
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
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightsContainer: {
    marginBottom: 20,
  },
});

export default AnalyticsScreen;
