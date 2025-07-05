import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../constants/ThemeProvider';
import { RootStackParamList } from '../types/types';
import { expenseApi } from '../api/expenseApi';
import { formatCurrency } from '../utils/currency';
import InsightCard from '../components/InsightCard';

const screenWidth = Dimensions.get('window').width;

type InsightsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: InsightsScreenNavigationProp;
}

const InsightsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [insights, setInsights] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const analyticsData = await expenseApi.getAnalytics('month');
      const insightsData = await expenseApi.getInsights();
      
      setMonthlyIncome(analyticsData.summary.income);
      setMonthlyExpense(analyticsData.summary.expense);
      setExpenseData(analyticsData.expensesByCategory);
      
      // Generate insights
      const newInsights = [];
      const savings = analyticsData.summary.balance;
      
      if (savings > 0) {
        newInsights.push({
          icon: 'wallet-outline',
          message: `You saved ₹${savings.toLocaleString()} this month`,
          color: '#22C55E'
        });
      }
      
      const spendingRate = analyticsData.summary.income > 0 ? 
        Math.round((analyticsData.summary.expense / analyticsData.summary.income) * 100) : 0;
        
      if (spendingRate <= 70) {
        newInsights.push({
          icon: 'trending-down',
          message: `You're spending ${100 - spendingRate}% less than your average`,
          color: '#22C55E'
        });
      }
      
      if (analyticsData.expensesByCategory.length > 0) {
        const topCategory = analyticsData.expensesByCategory[0];
        newInsights.push({
          icon: 'restaurant',
          message: `${topCategory._id} category up by ₹${topCategory.totalAmount.toLocaleString()} this month`,
          color: '#4C7EFF'
        });
      }
      
      setInsights(newInsights);
      
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBarHeight = (amount: number, maxAmount: number) => {
    return Math.max((amount / maxAmount) * 80, 20);
  };

  const maxExpense = Math.max(...expenseData.map(item => item.totalAmount));

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f8f9fb' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0e121b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Summary Card with Gradient */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={['rgba(76, 126, 255, 0.8)', 'rgba(76, 126, 255, 0.6)']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryText}>
              This Month: ₹{monthlyIncome.toLocaleString()} earned / ₹{monthlyExpense.toLocaleString()} used
            </Text>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsContainer}>
          {/* Expense Distribution */}
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Expense Distribution</Text>
            <View style={styles.barChart}>
              {expenseData.slice(0, 4).map((item, index) => (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${getBarHeight(item.totalAmount, maxExpense)}%`,
                        backgroundColor: '#e8ebf3',
                        borderTopColor: '#506695',
                      }
                    ]}
                  />
                  <Text style={styles.barLabel}>{item._id}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Income vs Expenses */}
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Income vs Expenses</Text>
            <View style={styles.horizontalChart}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <View key={day} style={styles.horizontalBarContainer}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <View style={styles.horizontalBarTrack}>
                    <View
                      style={[
                        styles.horizontalBar,
                        {
                          width: `${Math.random() * 80 + 20}%`,
                          backgroundColor: '#e8ebf3',
                          borderRightColor: '#506695',
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>Insights</Text>
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              icon={insight.icon}
              message={insight.message}
              color={insight.color}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f8f9fb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0e121b',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 132,
  },
  summaryText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#628ce8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 84,
  },
  viewDetailsText: {
    color: '#f8f9fb',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  chartSection: {
    flex: 1,
    minWidth: 288,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0e121b',
    marginBottom: 8,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingHorizontal: 12,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  bar: {
    width: '60%',
    backgroundColor: '#e8ebf3',
    borderTopWidth: 2,
    borderTopColor: '#506695',
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#506695',
    textAlign: 'center',
  },
  horizontalChart: {
    height: 180,
    paddingVertical: 12,
  },
  horizontalBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    flex: 1,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#506695',
    width: 40,
  },
  horizontalBarTrack: {
    flex: 1,
    height: 20,
    marginLeft: 16,
  },
  horizontalBar: {
    height: '100%',
    backgroundColor: '#e8ebf3',
    borderRightWidth: 2,
    borderRightColor: '#506695',
  },
  insightsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0e121b',
    marginBottom: 8,
    paddingBottom: 8,
    paddingTop: 16,
  },
});

export default InsightsScreen;
