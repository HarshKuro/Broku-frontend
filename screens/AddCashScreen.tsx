import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../types/types';
import { cashWalletApi } from '../api/cashWalletApi';
import ModernCard from '../components/ModernCard';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AddCash'>;

const AddCashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCash = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);

      const response = await cashWalletApi.addCashToWallet(
        parseFloat(amount),
        description || 'Cash added to wallet'
      );

      if (response.success) {
        Alert.alert(
          'Success',
          `Successfully added ${formatCurrency(parseFloat(amount))} to your cash wallet!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to add cash');
      }
    } catch (error) {
      console.error('Error adding cash:', error);
      Alert.alert('Error', 'Failed to add cash. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <ModernCard style={styles.headerCard}>
          <View style={styles.headerContent}>
            <MaterialIcons name="account-balance-wallet" size={32} color={theme.colors.success} />
            <Text style={styles.headerTitle}>Add Cash to Wallet</Text>
            <Text style={styles.headerSubtitle}>
              Add your rolled up money or cash on hand to start tracking
            </Text>
          </View>
        </ModernCard>

        {/* Quick Amount Buttons */}
        <ModernCard style={styles.quickAmountsCard}>
          <Text style={styles.sectionTitle}>Quick Amounts</Text>
          <View style={styles.quickAmountsGrid}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() && styles.quickAmountButtonActive
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amount === quickAmount.toString() && styles.quickAmountTextActive
                  ]}
                >
                  ₹{quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ModernCard>

        {/* Amount Input */}
        <ModernCard style={styles.inputCard}>
          <Text style={styles.inputLabel}>Amount *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          {amount && parseFloat(amount) > 0 && (
            <Text style={styles.amountPreview}>
              Adding: {formatCurrency(parseFloat(amount))}
            </Text>
          )}
        </ModernCard>

        {/* Description Input */}
        <ModernCard style={styles.inputCard}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Rolled up bills from pocket, Cash from drawer..."
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            numberOfLines={3}
          />
        </ModernCard>

        {/* Common Descriptions */}
        <ModernCard style={styles.suggestionsCard}>
          <Text style={styles.sectionTitle}>Common Descriptions</Text>
          <View style={styles.suggestionsList}>
            {[
              'Rolled up bills from pocket',
              'Cash from wallet',
              'Money from drawer',
              'Change from purchases',
              'Cash gift received',
              'ATM withdrawal'
            ].map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => setDescription(suggestion)}
              >
                <MaterialIcons name="lightbulb-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ModernCard>

        {/* Add Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            (!amount || parseFloat(amount) <= 0 || loading) && styles.addButtonDisabled
          ]}
          onPress={handleAddCash}
          disabled={!amount || parseFloat(amount) <= 0 || loading}
        >
          <MaterialIcons
            name={loading ? "hourglass-empty" : "add"}
            size={24}
            color="white"
          />
          <Text style={styles.addButtonText}>
            {loading ? 'Adding Cash...' : 'Add Cash to Wallet'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    padding: 24,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  quickAmountsCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface + '40',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  quickAmountTextActive: {
    color: 'white',
  },
  inputCard: {
    padding: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    paddingVertical: 16,
  },
  amountPreview: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '500',
  },
  descriptionInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  suggestionsCard: {
    padding: 20,
    marginBottom: 24,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface + '40',
    borderRadius: 8,
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    flex: 1,
  },
  addButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: theme.colors.text.secondary,
    opacity: 0.6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddCashScreen;
