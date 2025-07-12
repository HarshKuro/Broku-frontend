import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { RootStackParamList, CashWallet } from '../types/types';
import { cashWalletApi } from '../api/cashWalletApi';
import ModernCard from './ModernCard';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface CashWalletCardProps {
  onRefresh?: () => void;
}

const CashWalletCard: React.FC<CashWalletCardProps> = ({ onRefresh }) => {
  const navigation = useNavigation<NavigationProp>();
  const [wallet, setWallet] = useState<CashWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await cashWalletApi.getCashWallet();
      if (response.success && response.data) {
        setWallet(response.data);
      }
    } catch (error) {
      console.error('Error fetching cash wallet:', error);
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

  const handleWalletPress = () => {
    navigation.navigate('CashWallet');
  };

  const handleAddCash = () => {
    navigation.navigate('AddCash');
  };

  const handleSpendCash = () => {
    navigation.navigate('SpendCash');
  };

  if (loading) {
    return (
      <ModernCard style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </ModernCard>
    );
  }

  return (
    <ModernCard style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={handleWalletPress}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="account-balance-wallet" size={24} color={theme.colors.primary} />
            <Text style={styles.title}>Cash Wallet</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.secondary} />
        </View>

        {/* Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceAmount}>
            {formatCurrency(wallet?.totalCash || 0)}
          </Text>
          <Text style={styles.balanceLabel}>Available Cash</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
            onPress={handleAddCash}
          >
            <MaterialIcons name="add" size={16} color="white" />
            <Text style={styles.actionButtonText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
            onPress={handleSpendCash}
          >
            <MaterialIcons name="shopping-cart" size={16} color="white" />
            <Text style={styles.actionButtonText}>Spend</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CashWalletCard;
