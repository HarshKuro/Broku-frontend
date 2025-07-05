import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense } from '../types/types';
import { formatCurrency } from '../utils/currency';
import { theme } from '../constants/theme';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete }) => {
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
      'Delete Expense',
      'Are you sure you want to delete this expense?',
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

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']}
        style={styles.gradientBackground}
      >
        <View style={styles.card}>
          <View style={styles.leftSection}>
            <View style={styles.categoryContainer}>
              <View style={styles.categoryIndicator} />
              <Text style={styles.category}>{expense.category}</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
            {expense.note ? (
              <Text style={styles.note} numberOfLines={2}>{expense.note}</Text>
            ) : null}
          </View>
          
          <View style={styles.rightSection}>
            <Text style={styles.date}>{formatDate(expense.date)}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  gradientBackground: {
    borderRadius: theme.borderRadius.lg,
  },
  card: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  leftSection: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  category: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  amount: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.text.disabled,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.text.disabled,
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  deleteIcon: {
    fontSize: 16,
  },
});

export default ExpenseCard;
