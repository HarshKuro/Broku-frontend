import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Category } from '../types/types';

// Storage keys
const STORAGE_KEYS = {
  EXPENSES: 'offline_expenses',
  CATEGORIES: 'offline_categories',
  PENDING_SYNC: 'pending_sync_operations',
  LAST_SYNC: 'last_sync_timestamp',
  SYNC_VERSION: 'sync_version',
};

export interface PendingSyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'expense' | 'category';
  data: any;
  timestamp: number;
  localId?: string; // For newly created items that don't have server IDs yet
}

export class OfflineStorageService {
  // Expenses
  static async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to storage:', error);
      throw error;
    }
  }

  static async getExpenses(): Promise<Expense[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting expenses from storage:', error);
      return [];
    }
  }

  static async addExpense(expense: Expense): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const existingIndex = expenses.findIndex(e => e._id === expense._id);
      
      if (existingIndex >= 0) {
        expenses[existingIndex] = expense;
      } else {
        expenses.push(expense);
      }
      
      await this.saveExpenses(expenses);
    } catch (error) {
      console.error('Error adding expense to storage:', error);
      throw error;
    }
  }

  static async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const index = expenses.findIndex(e => e._id === id);
      
      if (index >= 0) {
        expenses[index] = { ...expenses[index], ...updates };
        await this.saveExpenses(expenses);
      }
    } catch (error) {
      console.error('Error updating expense in storage:', error);
      throw error;
    }
  }

  static async deleteExpense(id: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const filtered = expenses.filter(e => e._id !== id);
      await this.saveExpenses(filtered);
    } catch (error) {
      console.error('Error deleting expense from storage:', error);
      throw error;
    }
  }

  // Categories
  static async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to storage:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting categories from storage:', error);
      return [];
    }
  }

  static async addCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getCategories();
      const existingIndex = categories.findIndex(c => c._id === category._id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = category;
      } else {
        categories.push(category);
      }
      
      await this.saveCategories(categories);
    } catch (error) {
      console.error('Error adding category to storage:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filtered = categories.filter(c => c._id !== id);
      await this.saveCategories(filtered);
    } catch (error) {
      console.error('Error deleting category from storage:', error);
      throw error;
    }
  }

  // Pending sync operations
  static async addPendingSyncOperation(operation: Omit<PendingSyncOperation, 'timestamp'>): Promise<void> {
    try {
      const operations = await this.getPendingSyncOperations();
      const newOperation: PendingSyncOperation = {
        ...operation,
        timestamp: Date.now(),
      };
      
      operations.push(newOperation);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(operations));
    } catch (error) {
      console.error('Error adding pending sync operation:', error);
      throw error;
    }
  }

  static async getPendingSyncOperations(): Promise<PendingSyncOperation[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting pending sync operations:', error);
      return [];
    }
  }

  static async removePendingSyncOperation(operationId: string): Promise<void> {
    try {
      const operations = await this.getPendingSyncOperations();
      const filtered = operations.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing pending sync operation:', error);
      throw error;
    }
  }

  static async clearPendingSyncOperations(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing pending sync operations:', error);
      throw error;
    }
  }

  // Sync metadata
  static async setLastSyncTimestamp(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Error setting last sync timestamp:', error);
      throw error;
    }
  }

  static async getLastSyncTimestamp(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return 0;
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.EXPENSES,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.PENDING_SYNC,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.SYNC_VERSION,
      ]);
    } catch (error) {
      console.error('Error clearing all offline data:', error);
      throw error;
    }
  }

  static generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
