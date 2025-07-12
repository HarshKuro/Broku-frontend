import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { useTheme } from '../constants/ThemeProvider';

const screenWidth = Dimensions.get('window').width;

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
        Category Distribution
      </Text>
      {data.length > 0 ? (
        <View style={styles.pieList}>
          {data.map((item, index) => (
            <View key={index} style={styles.pieItem}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={[styles.pieLabel, { color: colors.text.primary }]}>
                {item.label}
              </Text>
              <Text style={[styles.pieValue, { color: colors.text.secondary }]}>
                ₹{item.value.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          No data available
        </Text>
      )}
    </View>
  );
};

interface BarChartProps {
  data: { label: string; income: number; expense: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const { colors } = useTheme();

  // Debug logging
  console.log('BarChart received data:', data);

  // Enhanced data validation
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('BarChart: No data or empty array');
    return (
      <View style={[styles.modernChartContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.modernChartHeader}>
          <Text style={[styles.modernChartTitle, { color: colors.text.primary }]}>
            Financial Overview
          </Text>
          <Text style={[styles.modernChartSubtitle, { color: colors.text.secondary }]}>
            Income vs Expenses Trends
          </Text>
        </View>
        <View style={styles.emptyChartState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.emptyIcon, { color: colors.primary }]}>📊</Text>
          </View>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            No financial data available
          </Text>
          <Text style={[styles.emptySubText, { color: colors.text.disabled }]}>
            Add some transactions to see your trends
          </Text>
        </View>
      </View>
    );
  }

  // Filter and validate data items
  const validData = data.filter(item => 
    item && 
    typeof item === 'object' && 
    typeof item.label === 'string' &&
    typeof item.income === 'number' &&
    typeof item.expense === 'number' &&
    !isNaN(item.income) &&
    !isNaN(item.expense)
  );

  if (validData.length === 0) {
    return (
      <View style={[styles.modernChartContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.modernChartHeader}>
          <Text style={[styles.modernChartTitle, { color: colors.text.primary }]}>
            Financial Overview
          </Text>
          <Text style={[styles.modernChartSubtitle, { color: colors.text.secondary }]}>
            Income vs Expenses Trends
          </Text>
        </View>
        <View style={styles.emptyChartState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.emptyIcon, { color: colors.primary }]}>📊</Text>
          </View>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            Invalid data format
          </Text>
          <Text style={[styles.emptySubText, { color: colors.text.disabled }]}>
            Please check your transaction data
          </Text>
        </View>
      </View>
    );
  }

  // Prepare data for react-native-chart-kit with enhanced formatting
  const limitedData = validData.slice(0, 7); // Show more data points
  const maxValue = Math.max(
    ...limitedData.flatMap(item => [item.income || 0, item.expense || 0])
  );

  // Ensure we have valid datasets
  const incomeData = limitedData.map(item => Math.max(0, item.income || 0));
  const expenseData = limitedData.map(item => Math.max(0, item.expense || 0));
  const labels = limitedData.map(item => {
    // Format labels better
    if (item.label && item.label.includes('/')) {
      const [day, month] = item.label.split('/');
      return `${day}/${month}`;
    }
    return item.label && item.label.length > 3 ? item.label.slice(0, 3) : (item.label || 'N/A');
  });

  // Validate that we have data to display
  if (incomeData.length === 0 || expenseData.length === 0 || labels.length === 0) {
    return (
      <View style={[styles.modernChartContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.modernChartHeader}>
          <Text style={[styles.modernChartTitle, { color: colors.text.primary }]}>
            Financial Overview
          </Text>
          <Text style={[styles.modernChartSubtitle, { color: colors.text.secondary }]}>
            Income vs Expenses Trends
          </Text>
        </View>
        <View style={styles.emptyChartState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.emptyIcon, { color: colors.primary }]}>📊</Text>
          </View>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            No valid data to display
          </Text>
          <Text style={[styles.emptySubText, { color: colors.text.disabled }]}>
            Add some transactions to see your trends
          </Text>
        </View>
      </View>
    );
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: incomeData,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Modern green
      },
      {
        data: expenseData,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Modern red
      }
    ]
  };

  // Debug the final chart data structure
  console.log('Chart data structure:', {
    labelsLength: chartData.labels?.length,
    datasetsLength: chartData.datasets?.length,
    incomeDataLength: incomeData?.length,
    expenseDataLength: expenseData?.length,
    labels: chartData.labels,
    incomeData: incomeData,
    expenseData: expenseData
  });

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colors.surface,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: colors.surface,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.text.primary,
    labelColor: (opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: 20,
    },
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  // Calculate summary stats
  const totalIncome = limitedData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = limitedData.reduce((sum, item) => sum + item.expense, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100) : 0;

  return (
    <View style={[styles.modernChartContainer, { backgroundColor: colors.surface }]}>
      {/* Modern Header */}
      <View style={styles.modernChartHeader}>
        <Text style={[styles.modernChartTitle, { color: colors.text.primary }]}>
          Financial Overview
        </Text>
        <Text style={[styles.modernChartSubtitle, { color: colors.text.secondary }]}>
          Track your income vs expenses trends
        </Text>
      </View>

      {/* Quick Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Text style={styles.statEmoji}>💰</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Income</Text>
          <Text style={[styles.statValue, { color: '#22C55E' }]}>
            ₹{totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.statEmoji}>💸</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Expenses</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            ₹{totalExpense.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <View style={[styles.statIcon, { backgroundColor: savings >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.statEmoji}>{savings >= 0 ? '📈' : '📉'}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Savings</Text>
          <Text style={[styles.statValue, { color: savings >= 0 ? '#22C55E' : '#EF4444' }]}>
            ₹{Math.abs(savings).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Savings Rate Indicator */}
      <View style={[styles.savingsIndicator, { backgroundColor: colors.background }]}>
        <View style={styles.savingsHeader}>
          <Text style={[styles.savingsLabel, { color: colors.text.primary }]}>
            Savings Rate
          </Text>
          <Text style={[styles.savingsPercentage, { 
            color: savingsRate >= 20 ? '#22C55E' : savingsRate >= 10 ? '#F59E0B' : '#EF4444' 
          }]}>
            {savingsRate.toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.savingsBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.savingsFill, 
              { 
                width: `${Math.min(Math.max(savingsRate, 0), 100)}%`,
                backgroundColor: savingsRate >= 20 ? '#22C55E' : savingsRate >= 10 ? '#F59E0B' : '#EF4444'
              }
            ]} 
          />
        </View>
        <Text style={[styles.savingsHint, { color: colors.text.disabled }]}>
          {savingsRate >= 20 ? 'Excellent saving habits! 🎉' : 
           savingsRate >= 10 ? 'Good progress, aim for 20%' : 
           'Try to save at least 10% of income'}
        </Text>
      </View>

      {/* Enhanced Bar Chart */}
      <View style={styles.chartWrapper}>
        {(() => {
          try {
            return (
              <RNBarChart
                data={chartData}
                width={screenWidth - 64}
                height={240}
                yAxisLabel="₹"
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.modernChart}
                fromZero={true}
              />
            );
          } catch (error) {
            console.error('RNBarChart render error:', error);
            return (
              <View style={styles.emptyChartState}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.emptyIcon, { color: colors.primary }]}>⚠️</Text>
                </View>
                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                  Chart rendering error
                </Text>
                <Text style={[styles.emptySubText, { color: colors.text.disabled }]}>
                  Please try refreshing the screen
                </Text>
              </View>
            );
          }
        })()}
      </View>

      {/* Chart Legend */}
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={[styles.legendText, { color: colors.text.primary }]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: colors.text.primary }]}>Expenses</Text>
        </View>
      </View>
    </View>
  );
};

interface LineChartProps {
  data: { label: string; value: number }[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
        Monthly Trend
      </Text>
      {data.length > 0 ? (
        <View style={styles.lineList}>
          {data.map((item, index) => (
            <View key={index} style={styles.lineItem}>
              <Text style={[styles.lineLabel, { color: colors.text.primary }]}>
                {item.label}
              </Text>
              <Text style={[styles.lineValue, { color: colors.primary }]}>
                ₹{item.value.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          No trend data available
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernChartContainer: {
    padding: 20,
    borderRadius: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modernChartHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modernChartTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  modernChartSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  modernChart: {
    marginVertical: 8,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 40,
    fontStyle: 'italic',
  },
  emptyChartState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  savingsIndicator: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savingsLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingsPercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  savingsBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  savingsFill: {
    height: '100%',
    borderRadius: 4,
  },
  savingsHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pieList: {
    gap: 12,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  pieLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  pieValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  lineList: {
    gap: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  lineLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  lineValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
