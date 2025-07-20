import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { importApi, TransactionData } from '../api/importApi';
import { theme } from '../constants/theme';

const ImportScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<TransactionData[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile(file.name);
        uploadPdf(file.uri, file.name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Error picking document:', error);
    }
  };

  const uploadPdf = async (fileUri: string, fileName: string) => {
    setLoading(true);
    try {
      const response = await importApi.uploadPdf(fileUri, fileName);
      
      if (response.success && response.data) {
        setParsedTransactions(response.data);
        Alert.alert(
          'Success',
          `Found ${response.data.length} transactions in your PDF. Review them below and tap Save to import.`
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to parse PDF');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload PDF');
    } finally {
      setLoading(false);
    }
  };

  const saveTransactions = async () => {
    if (parsedTransactions.length === 0) {
      Alert.alert('Error', 'No transactions to save');
      return;
    }

    Alert.alert(
      'Confirm Import',
      `Are you sure you want to import ${parsedTransactions.length} transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: performSave }
      ]
    );
  };

  const performSave = async () => {
    setSaving(true);
    try {
      const response = await importApi.saveTransactions(parsedTransactions);
      
      if (response.success && response.data) {
        Alert.alert(
          'Import Complete',
          `Successfully imported ${response.data.saved} transactions.${
            response.data.errors > 0 ? `\n${response.data.errors} transactions had errors.` : ''
          }`,
          [
            {
              text: 'OK',
              onPress: () => {
                setParsedTransactions([]);
                setSelectedFile(null);
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to save transactions');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save transactions');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? theme.colors.success : theme.colors.error;
  };

  const renderTransaction = ({ item, index }: { item: TransactionData; index: number }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={[styles.typeIndicator, { backgroundColor: getTransactionColor(item.type) }]}>
          <Ionicons
            name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
            size={16}
            color="white"
          />
        </View>
        <Text style={styles.transactionAmount}>
          {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.transactionDescription}>{item.description}</Text>
      {item.category && (
        <Text style={styles.transactionCategory}>Category: {item.category}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Transactions</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.instructionTitle}>How to Import</Text>
          <Text style={styles.instructionText}>
            1. Select a PDF bank statement from your device{'\n'}
            2. We'll automatically detect transactions{'\n'}
            3. Review the detected transactions{'\n'}
            4. Save to add them to your expense tracker
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={pickDocument}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.uploadButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="cloud-upload" size={24} color="white" />
            )}
            <Text style={styles.uploadButtonText}>
              {loading ? 'Processing PDF...' : 'Select PDF Statement'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {selectedFile && (
          <View style={styles.selectedFileCard}>
            <Ionicons name="document" size={20} color={theme.colors.primary} />
            <Text style={styles.selectedFileName}>{selectedFile}</Text>
          </View>
        )}

        {parsedTransactions.length > 0 && (
          <View style={styles.transactionsSection}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>
                Found {parsedTransactions.length} Transactions
              </Text>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={saveTransactions}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.saveButtonText}>Save All</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <FlatList
              data={parsedTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              style={styles.transactionsList}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginTop: 10,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
  },
  uploadButton: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedFileName: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginLeft: 10,
    flex: 1,
  },
  transactionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  transactionsList: {
    maxHeight: 400,
  },
  transactionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  typeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  transactionDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginLeft: 34,
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 34,
    fontStyle: 'italic',
  },
});

export default ImportScreen;
