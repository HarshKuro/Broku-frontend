import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { Expense } from '../types/types';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
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
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.leftContent}>
            <Text style={styles.category}>{expense.category}</Text>
            <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.date}>{formatDate(expense.date)}</Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={handleDelete}
              style={styles.deleteButton}
            />
          </View>
        </View>
        {expense.note ? (
          <Text style={styles.note}>{expense.note}</Text>
        ) : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  deleteButton: {
    margin: 0,
  },
});

export default ExpenseCard;
