import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../constants/ThemeProvider';

interface Props {
  type: 'income' | 'expense';
  amount: string;
  sourceOrCategory: string;
  date: Date;
  note?: string;
  recurring?: boolean;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  showRecurring?: boolean;
}

const IncomeExpenseInput: React.FC<Props> = ({
  type,
  amount,
  sourceOrCategory,
  date,
  note,
  recurring,
  onChange,
  onSave,
  showRecurring
}) => {
  const { colors } = useTheme();
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary, marginBottom: 16 }}>
        {type === 'income' ? 'Add New Income' : 'Add New Expense'}
      </Text>
      <TextInput
        placeholder="Amount (₹)"
        keyboardType="numeric"
        value={amount}
        onChangeText={v => onChange('amount', v)}
        style={{ backgroundColor: colors.surface, color: colors.text.primary, borderRadius: 8, padding: 12, marginBottom: 12 }}
        placeholderTextColor={colors.text.secondary}
      />
      <TextInput
        placeholder={type === 'income' ? 'Source (Salary, Freelance, etc.)' : 'Category'}
        value={sourceOrCategory}
        onChangeText={v => onChange('sourceOrCategory', v)}
        style={{ backgroundColor: colors.surface, color: colors.text.primary, borderRadius: 8, padding: 12, marginBottom: 12 }}
        placeholderTextColor={colors.text.secondary}
      />
      <TouchableOpacity onPress={() => onChange('showDatePicker', true)} style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.primary }}>Date: {date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {/* DateTimePicker can be conditionally rendered outside */}
      <TextInput
        placeholder="Note (optional)"
        value={note}
        onChangeText={v => onChange('note', v)}
        style={{ backgroundColor: colors.surface, color: colors.text.primary, borderRadius: 8, padding: 12, marginBottom: 12 }}
        placeholderTextColor={colors.text.secondary}
      />
      {showRecurring && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.text.primary, marginRight: 8 }}>Recurring</Text>
          <Switch value={!!recurring} onValueChange={v => onChange('recurring', v)} />
        </View>
      )}
      <TouchableOpacity
        onPress={onSave}
        style={{ backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save {type === 'income' ? 'Income' : 'Expense'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IncomeExpenseInput;
