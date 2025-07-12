import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { RootStackParamList, CashWallet, CashTransaction } from '../types/types';
import { cashWalletApi } from '../api/cashWalletApi';
import ModernCard from '../components/ModernCard';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CashWallet'>;

const CashWalletScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [wallet, setWallet] = useState<CashWallet | null>(null);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet data
      const walletResponse = await cashWalletApi.getCashWallet();
      if (walletResponse.success && walletResponse.data) {
        setWallet(walletResponse.data);
      }

      // Fetch recent transactions
      const transactionsResponse = await cashWalletApi.getCashTransactions(10, 0);
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      Alert.alert(
        'Error',
        'Failed to load cash wallet data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add':
        return 'add-circle';
      case 'spend':
        return 'shopping-cart';
      case 'withdraw':
        return 'remove-circle';
      default:
        return 'help';
    }
  };

  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'add':
        return theme.colors.success;
      case 'spend':
      case 'withdraw':
        return theme.colors.error;
      default:
        return theme.colors.text.primary;
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await cashWalletApi.deleteTransaction(transactionId);
              if (response.success) {
                // Refresh the data after successful deletion
                await fetchWalletData();
                Alert.alert('Success', 'Transaction deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete transaction');
              }
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading cash wallet...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Balance Card */}
      <ModernCard style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <MaterialIcons name="account-balance-wallet" size={32} color={theme.colors.primary} />
          <Text style={styles.balanceTitle}>Cash Wallet</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {formatCurrency(wallet?.totalCash || 0)}
        </Text>
        <Text style={styles.balanceSubtitle}>Available Cash</Text>
      </ModernCard>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
          onPress={() => navigation.navigate('AddCash')}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.actionButtonText}>Add Cash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
          onPress={() => navigation.navigate('SpendCash')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="white" />
          <Text style={styles.actionButtonText}>Spend Cash</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <ModernCard style={styles.transactionsCard}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your rolled up money to start tracking your cash
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <View key={transaction._id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <MaterialIcons
                    name={getTransactionIcon(transaction.type) as any}
                    size={24}
                    color={getTransactionColor(transaction.type)}
                  />
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) }
                    ]}
                  >
                    {transaction.type === 'add' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTransaction(transaction._id)}
                  >
                    <MaterialIcons name="delete" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ModernCard>

      {/* Quick Stats */}
      <ModernCard style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={24} color={theme.colors.success} />
            <Text style={styles.statLabel}>Cash Added</Text>
            <Text style={styles.statValue}>
              {formatCurrency(
                transactions
                  .filter(t => t.type === 'add')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="trending-down" size={24} color={theme.colors.error} />
            <Text style={styles.statLabel}>Cash Spent</Text>
            <Text style={styles.statValue}>
              {formatCurrency(
                transactions
                  .filter(t => t.type === 'spend' || t.type === 'withdraw')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </Text>
          </View>
        </View>
      </ModernCard>
    </ScrollView>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  balanceCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
  },
  statsCard: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface + '20',
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CashWalletScreen;
