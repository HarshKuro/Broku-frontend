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

  if (!data || data.length === 0) {
    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
          Income vs Expenses
        </Text>
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          No data available
        </Text>
      </View>
    );
  }

  // Prepare data for react-native-chart-kit
  const chartData = {
    labels: data.slice(0, 6).map(item => item.label), // Limit to 6 items for better display
    datasets: [
      {
        data: data.slice(0, 6).map(item => item.income),
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green for income
      },
      {
        data: data.slice(0, 6).map(item => item.expense),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
      }
    ],
    legend: ["Income", "Expenses"]
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.text.primary,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // solid background lines with no dashes
      stroke: colors.border,
      strokeWidth: 1,
    },
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text.primary }]}>
        Income vs Expenses
      </Text>
      <RNBarChart
        data={chartData}
        width={screenWidth - 64}
        height={220}
        yAxisLabel="₹"
        yAxisSuffix=""
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars={true}
        fromZero={true}
        showBarTops={false}
      />
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 40,
    fontStyle: 'italic',
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
