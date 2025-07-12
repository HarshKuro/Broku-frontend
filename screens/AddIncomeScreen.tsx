import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../constants/ThemeProvider';
import { expenseApi } from '../api/expenseApi';

const AddIncomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const [state, setState] = useState({
    amount: '',
    source: '',
    date: new Date(),
    note: '',
    recurring: false,
    showDatePicker: false,
    paymentMethod: 'cash' as 'cash' | 'card' | 'digital' | 'other',
  });

  const onChange = (field: string, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const incomeSources = [
    'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Refund', 
    'Rental', 'Commission', 'Bonus', 'Other'
  ];

  const onSave = async () => {
    if (!state.amount || !state.source) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const incomeData = {
        amount: parseFloat(state.amount),
        category: state.source,
        date: state.date,
        note: state.note || '',
        type: 'income' as const,
        paymentMethod: state.paymentMethod,
      };

      await expenseApi.create(incomeData);
      Alert.alert('Success', 'Income added successfully!', [
        { text: 'OK', onPress: () => {
          setState({
            amount: '',
            source: '',
            date: new Date(),
            note: '',
            recurring: false,
            showDatePicker: false,
            paymentMethod: 'cash',
          });
        }}
      ]);
    } catch (error) {
      console.error('Error saving income:', error);
      Alert.alert('Error', 'Failed to save income. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="trending-up" size={32} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            💰 Add New Income
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Track your earnings and income sources
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Amount *</Text>
          <View style={[styles.amountInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.text.primary }]}>₹</Text>
            <TextInput
              placeholder="0"
              keyboardType="numeric"
              value={state.amount}
              onChangeText={v => onChange('amount', v)}
              style={[styles.amountInput, { color: colors.text.primary }]}
              placeholderTextColor={colors.text.disabled}
            />
          </View>
        </View>

        {/* Source Selection */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Income Source *</Text>
          <View style={styles.sourceGrid}>
            {incomeSources.map((source) => (
              <TouchableOpacity
                key={source}
                style={[
                  styles.sourceButton,
                  { 
                    backgroundColor: state.source === source ? colors.primary : colors.surface,
                    borderColor: state.source === source ? colors.primary : colors.border
                  }
                ]}
                onPress={() => onChange('source', source)}
              >
                <Text style={[
                  styles.sourceButtonText,
                  { color: state.source === source ? colors.surface : colors.text.primary }
                ]}>
                  {source}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Date *</Text>
          <TouchableOpacity 
            style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onChange('showDatePicker', true)}
          >
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text.primary }]}>
              {state.date.toLocaleDateString('en-IN', { 
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            {(['cash', 'card', 'digital', 'other'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentMethodButton,
                  {
                    backgroundColor: state.paymentMethod === method ? colors.primary : colors.surface,
                    borderColor: state.paymentMethod === method ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => onChange('paymentMethod', method)}
              >
                <Text
                  style={[
                    styles.paymentMethodText,
                    {
                      color: state.paymentMethod === method ? colors.surface : colors.text.primary,
                    }
                  ]}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Note (Optional)</Text>
          <TextInput
            placeholder="Add a note about this income..."
            value={state.note}
            onChangeText={v => onChange('note', v)}
            multiline
            numberOfLines={3}
            style={[
              styles.noteInput, 
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text.primary 
              }
            ]}
            placeholderTextColor={colors.text.disabled}
          />
        </View>

        {/* Recurring Toggle */}
        <View style={[styles.recurringContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.recurringInfo}>
            <Ionicons name="repeat" size={20} color={colors.primary} />
            <View style={styles.recurringText}>
              <Text style={[styles.recurringLabel, { color: colors.text.primary }]}>
                Recurring Income
              </Text>
              <Text style={[styles.recurringDescription, { color: colors.text.secondary }]}>
                Mark if this income repeats monthly
              </Text>
            </View>
          </View>
          <Switch 
            value={state.recurring} 
            onValueChange={v => onChange('recurring', v)}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={state.recurring ? colors.primary : colors.text.disabled}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={onSave}
          style={[styles.saveButton, { backgroundColor: colors.success }]}
        >
          <Ionicons name="checkmark" size={20} color={colors.surface} />
          <Text style={[styles.saveButtonText, { color: colors.surface }]}>
            Save Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {state.showDatePicker && (
        <DateTimePicker
          value={state.date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            onChange('showDatePicker', false);
            if (selectedDate) onChange('date', selectedDate);
          }}
        />
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  sourceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  recurringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recurringText: {
    marginLeft: 12,
    flex: 1,
  },
  recurringLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  recurringDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AddIncomeScreen;
