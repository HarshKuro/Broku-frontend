import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types/types';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../constants/ThemeProvider';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete }) => {
  const { colors } = useTheme();
  const isIncome = expense.type === 'income';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      `Delete ${isIncome ? 'Income' : 'Expense'}`,
      `Are you sure you want to delete this ${isIncome ? 'income' : 'expense'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(expense._id),
        },
      ],
      { cancelable: false }
    );
  };

  // Modern, subtle color scheme
  const amountColor = isIncome ? '#10B981' : '#EF4444'; // More refined green/red
  const iconBackgroundColor = isIncome ? '#ECFDF5' : '#FEF2F2'; // Very light backgrounds
  const iconColor = isIncome ? '#059669' : '#DC2626'; // Darker icons
  const iconName = isIncome ? 'arrow-up' : 'arrow-down';

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.leftSection}>
        {/* Icon with subtle background */}
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        
        <View style={styles.contentSection}>
          <View style={styles.topRow}>
            <Text style={[styles.category, { color: colors.text.primary }]}>{expense.category}</Text>
            <View style={[styles.typeChip, { backgroundColor: iconBackgroundColor }]}>
              <Text style={[styles.typeText, { color: iconColor }]}>
                {isIncome ? 'Income' : 'Expense'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
          </Text>
          
          {expense.note ? (
            <Text style={[styles.note, { color: colors.text.secondary }]} numberOfLines={1}>
              {expense.note}
            </Text>
          ) : null}
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.date, { color: colors.text.disabled }]}>{formatDate(expense.date)}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={colors.text.disabled} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentSection: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default ExpenseCard;
