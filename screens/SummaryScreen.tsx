import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Button, Divider } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MonthlySummary } from '../types/types';
import { expenseApi } from '../api/expenseApi';

type SummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Summary'>;

interface Props {
  navigation: SummaryScreenNavigationProp;
}

const SummaryScreen: React.FC<Props> = ({ navigation }) => {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
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

  // Prepare data for charts
  const pieChartData = summary?.categoryWise.map((item, index) => ({
    name: item._id,
    amount: item.totalAmount,
    color: getColorForIndex(index),
    legendFontColor: '#333',
    legendFontSize: 12,
  })) || [];

  const barChartData = {
    labels: summary?.categoryWise.slice(0, 6).map(item => 
      item._id.length > 8 ? item._id.substring(0, 8) + '...' : item._id
    ) || [],
    datasets: [
      {
        data: summary?.categoryWise.slice(0, 6).map(item => item.totalAmount) || [],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6200ee',
    },
  };

  function getColorForIndex(index: number): string {
    const colors = [
      '#6200ee', '#e74c3c', '#f39c12', '#27ae60', '#3498db',
      '#9b59b6', '#e67e22', '#1abc9c', '#34495e', '#f1c40f'
    ];
    return colors[index % colors.length];
  }

  if (loading && !summary) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Month Navigation */}
      <Card style={styles.navigationCard} mode="outlined">
        <Card.Content>
          <View style={styles.monthNavigation}>
            <Button
              mode="outlined"
              onPress={() => navigateMonth('prev')}
            >
              ← Previous
            </Button>
            <Text style={styles.monthTitle}>
              {getMonthName(selectedMonth, selectedYear)}
            </Text>
            <Button
              mode="outlined"
              onPress={() => navigateMonth('next')}
            >
              Next →
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Summary Overview */}
      <Card style={styles.overviewCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>Monthly Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Spent</Text>
              <Text style={styles.overviewValue}>
                {formatCurrency(summary?.total?.total || 0)}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Transactions</Text>
              <Text style={styles.overviewValue}>
                {summary?.total?.count || 0}
              </Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Average per Transaction</Text>
            <Text style={styles.overviewValue}>
              {formatCurrency(
                summary?.total?.count 
                  ? (summary.total.total / summary.total.count)
                  : 0
              )}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Charts */}
      {summary && summary.categoryWise.length > 0 ? (
        <>
          {/* Pie Chart */}
          <Card style={styles.chartCard} mode="outlined">
            <Card.Content>
              <Text style={styles.cardTitle}>Spending by Category</Text>
              <PieChart
                data={pieChartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </Card.Content>
          </Card>

          {/* Bar Chart */}
          {summary.categoryWise.length > 1 && (
            <Card style={styles.chartCard} mode="outlined">
              <Card.Content>
                <Text style={styles.cardTitle}>Top Categories</Text>
                <BarChart
                  data={barChartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  showValuesOnTopOfBars
                  fromZero
                />
              </Card.Content>
            </Card>
          )}

          {/* Category Breakdown */}
          <Card style={styles.breakdownCard} mode="outlined">
            <Card.Content>
              <Text style={styles.cardTitle}>Category Breakdown</Text>
              {summary.categoryWise.map((item, index) => (
                <View key={item._id} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryColor,
                        { backgroundColor: getColorForIndex(index) }
                      ]}
                    />
                    <Text style={styles.categoryName}>{item._id}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(item.totalAmount)}
                    </Text>
                    <Text style={styles.categoryCount}>
                      {item.count} transaction{item.count !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      {((item.totalAmount / summary.total.total) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </>
      ) : (
        <Card style={styles.emptyCard} mode="outlined">
          <Card.Content>
            <Text style={styles.emptyText}>No expenses for this month</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your expenses to see insights here
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AddExpense')}
              style={styles.emptyButton}
            >
              Add Expense
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationCard: {
    margin: 16,
    backgroundColor: '#fff',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  divider: {
    marginVertical: 16,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  breakdownCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 40,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    alignSelf: 'center',
  },
});

export default SummaryScreen;
