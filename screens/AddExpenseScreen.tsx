import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ExpenseFormData } from '../types/types';
import { expenseApi } from '../api/expenseApi';
import CategorySelector from '../components/CategorySelector';

type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;

interface Props {
  navigation: AddExpenseScreenNavigationProp;
}

const AddExpenseScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: '',
    amount: '',
    date: new Date(),
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const amount = parseFloat(formData.amount);
      
      await expenseApi.create({
        category: formData.category,
        amount,
        date: formData.date,
        note: formData.note,
      });

      Alert.alert(
        'Success',
        'Expense added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert(
        'Error',
        'Failed to add expense. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setFormData(prev => ({ ...prev, amount: numericText }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.title}>Add New Expense</Text>

          {/* Category Selection */}
          <View style={styles.section}>
            <CategorySelector
              selectedCategory={formData.category}
              onCategorySelect={handleCategorySelect}
              onAddCategory={() => navigation.navigate('AddCategory')}
            />
            {errors.category ? (
              <Text style={styles.errorText}>{errors.category}</Text>
            ) : null}
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <TextInput
              label="Amount ($)"
              value={formData.amount}
              onChangeText={handleAmountChange}
              mode="outlined"
              keyboardType="numeric"
              placeholder="0.00"
              error={!!errors.amount}
              style={styles.input}
            />
            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : null}
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <TouchableOpacity onPress={openDatePicker}>
              <TextInput
                label="Date"
                value={formatDate(formData.date)}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" size={20} />}
                style={styles.input}
              />
            </TouchableOpacity>
          </View>

          {/* Note Input */}
          <View style={styles.section}>
            <TextInput
              label="Note (Optional)"
              value={formData.note}
              onChangeText={(text) => setFormData(prev => ({ ...prev, note: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Add a note about this expense..."
              style={styles.input}
            />
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            {loading ? 'Adding Expense...' : 'Add Expense'}
          </Button>

          {/* Cancel Button */}
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </Button>
        </Card.Content>
      </Card>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginBottom: 8,
  },
});

export default AddExpenseScreen;
