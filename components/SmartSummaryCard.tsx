import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeProvider';

interface SmartSummaryCardProps {
  income: number;
  expense: number;
}

const SmartSummaryCard: React.FC<SmartSummaryCardProps> = ({ income, expense }) => {
  const { colors } = useTheme();
  const balance = income - expense;
  const balanceColor = balance > 0 ? '#22C55E' : balance < 0 ? '#EF4444' : colors.text.primary;
  
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>  
      <View style={styles.header}>
        <Ionicons name="analytics" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>This Month</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.item}>
            <View style={[styles.iconContainer, { backgroundColor: '#22C55E20' }]}>
              <Ionicons name="trending-up" size={20} color="#22C55E" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Income</Text>
              <Text style={[styles.amount, { color: '#22C55E' }]}>+₹{income.toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={styles.item}>
            <View style={[styles.iconContainer, { backgroundColor: '#EF444420' }]}>
              <Ionicons name="trending-down" size={20} color="#EF4444" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Spent</Text>
              <Text style={[styles.amount, { color: '#EF4444' }]}>-₹{expense.toLocaleString()}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.balanceContainer, { borderTopColor: colors.border }]}>
          <View style={styles.balanceRow}>
            <View style={[styles.iconContainer, { backgroundColor: balanceColor + '20' }]}>
              <Ionicons 
                name={balance > 0 ? "wallet" : balance < 0 ? "alert-circle" : "remove"} 
                size={20} 
                color={balanceColor} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Net Balance</Text>
              <Text style={[styles.balanceAmount, { color: balanceColor }]}>
                {balance > 0 ? '+' : ''}₹{balance.toLocaleString()}
              </Text>
            </View>
          </View>
          
          {balance > 0 && (
            <Text style={[styles.balanceNote, { color: '#22C55E' }]}>
              Great! You saved money this month 🎉
            </Text>
          )}
          {balance < 0 && (
            <Text style={[styles.balanceNote, { color: '#EF4444' }]}>
              You overspent this month ⚠️
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  balanceNote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default SmartSummaryCard;
