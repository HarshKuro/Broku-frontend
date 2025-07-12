import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ExpenseFormData } from '../types/types';
import { offlineExpenseApi as expenseApi } from '../services/offlineApi';
import CategorySelector from '../components/CategorySelectorSearch';
import SmartCategorization from '../components/SmartCategorization';
import { useTheme, useThemedStyles } from '../constants/ThemeProvider';

type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;

interface Props {
  navigation: AddExpenseScreenNavigationProp;
}

const AddExpenseScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const themedStyles = useThemedStyles();
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: '',
    amount: '',
    date: new Date(),
    note: '',
    paymentMethod: 'other',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
        type: 'expense',
        paymentMethod: formData.paymentMethod,
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

  const handleDateChange = (selectedDate: Date) => {
    setFormData(prev => ({ ...prev, date: selectedDate }));
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const selectedDate = formData.date;

    const days = [];
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Add day labels
    const dayLabelRow = dayLabels.map((day, index) => (
      <View key={`label-${index}`} style={styles.dayLabel}>
        <Text style={[styles.dayLabelText, { color: colors.text.secondary }]}>{day}</Text>
      </View>
    ));

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate.toDateString() === cellDate.toDateString();
      const isToday = today.toDateString() === cellDate.toDateString();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && [styles.selectedDay, { backgroundColor: colors.primary }],
            isToday && !isSelected && [styles.todayDay, { borderColor: colors.primary }]
          ]}
          onPress={() => handleDateChange(cellDate)}
        >
          <Text
            style={[
              styles.dayText,
              { color: colors.text.primary },
              isSelected && { color: '#FFFFFF' },
              isToday && !isSelected && { color: colors.primary }
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendar}>
        <View style={styles.dayLabelsRow}>
          {dayLabelRow}
        </View>
        <View style={styles.daysGrid}>
          {days}
        </View>
      </View>
    );
  };

  // Create styles inside component to access theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
    },
    inputSection: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 20,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 12,
    },
    amountInput: {
      fontSize: 16,
      fontWeight: '400',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'transparent',
    },
    dateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    monthText: {
      fontSize: 16,
      fontWeight: '600',
    },
    calendar: {
      marginTop: 10,
    },
    dayLabelsRow: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    dayLabel: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    dayLabelText: {
      fontSize: 14,
      fontWeight: '500',
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: `${100/7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    selectedDay: {
      borderRadius: 20,
    },
    todayDay: {
      borderRadius: 20,
      borderWidth: 1,
    },
    dayText: {
      fontSize: 16,
      fontWeight: '400',
    },
    noteInput: {
      fontSize: 16,
      fontWeight: '400',
      textAlignVertical: 'top',
      minHeight: 80,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
    },
    saveButton: {
      marginHorizontal: 16,
      marginBottom: 32,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    errorText: {
      fontSize: 12,
      marginTop: 8,
    },
    paymentMethodContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 8,
    },
    paymentMethodButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      minWidth: 80,
      alignItems: 'center',
    },
    paymentMethodText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" translucent={false} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text.primary }]}>Add New Expense</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Amount Input */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Amount (₹)</Text>
          <TextInput
            value={formData.amount}
            onChangeText={handleAmountChange}
            placeholder="0"
            keyboardType="numeric"
            style={[styles.amountInput, { color: colors.text.primary, backgroundColor: colors.surface }]}
            placeholderTextColor={colors.text.disabled}
          />
          {errors.amount ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.amount}</Text>
          ) : null}
        </View>

        {/* Payment Method Selection */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            {[
              { key: 'cash', label: '💵 Cash', icon: 'wallet' },
              { key: 'card', label: '💳 Card', icon: 'card' },
              { key: 'digital', label: '📱 Digital', icon: 'phone-portrait' },
              { key: 'other', label: '🏦 Other', icon: 'business' }
            ].map((method) => (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.paymentMethodButton,
                  {
                    backgroundColor: formData.paymentMethod === method.key 
                      ? colors.primary 
                      : colors.surfaceVariant,
                    borderColor: formData.paymentMethod === method.key 
                      ? colors.primary 
                      : colors.border
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, paymentMethod: method.key as any }))}
              >
                <Text style={[
                  styles.paymentMethodText,
                  { 
                    color: formData.paymentMethod === method.key 
                      ? colors.surface 
                      : colors.text.primary 
                  }
                ]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Selection */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Category</Text>
          <CategorySelector
            selectedCategory={formData.category}
            onCategorySelect={handleCategorySelect}
            onAddCategory={() => navigation.navigate('AddCategory')}
          />
          {errors.category ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.category}</Text>
          ) : null}
        </View>

        {/* Date Selection */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
          <View style={styles.dateHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: colors.text.primary }]}>
              {formatMonthYear(currentMonth)}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          {renderCalendar()}
        </View>

        {/* Note Input */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Note (optional)</Text>
          <TextInput
            value={formData.note}
            onChangeText={(text) => setFormData(prev => ({ ...prev, note: text }))}
            placeholder="Add a note..."
            multiline
            numberOfLines={4}
            style={[styles.noteInput, { 
              color: colors.text.primary, 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            placeholderTextColor={colors.text.disabled}
          />
        </View>

        {/* AI Smart Categorization */}
        {formData.note.trim() && formData.amount && parseFloat(formData.amount) > 0 && (
          <SmartCategorization
            description={formData.note}
            amount={parseFloat(formData.amount)}
            onCategorySelected={(categoryId, categoryName) => {
              setFormData(prev => ({ ...prev, category: categoryId }));
            }}
            currentCategory={formData.category}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Expense'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddExpenseScreen;
