import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';

interface PieData {
  key: string;
  value: number;
  svg: { fill: string };
  label: string;
}

interface Props {
  data: { label: string; value: number; color: string }[];
}

const RealPieChart: React.FC<Props> = ({ data }) => {
  const pieData: PieData[] = data.map((item, idx) => ({
    key: item.label,
    value: item.value,
    svg: { fill: item.color },
    label: item.label,
  }));

  return (
    <View style={styles.container}>
      <PieChart
        style={{ height: 180 }}
        data={pieData}
        valueAccessor={({ item }) => item.value}
        outerRadius={"95%"}
        innerRadius={"60%"}
      />
      {/* Optionally add labels using react-native-svg */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
});

export default RealPieChart;
