import { NetworkStateManager } from './networkState';
import { OfflineStorageService, PendingSyncOperation } from './offlineStorage';
import { expenseApi, categoryApi } from '../api/expenseApi';
import { Expense, Category } from '../types/types';

export class SyncService {
  private static isSyncing = false;
  private static syncListeners: ((status: SyncStatus) => void)[] = [];

  static async startSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!NetworkStateManager.isOnline()) {
      console.log('Cannot sync: No internet connection');
      return { success: false, message: 'No internet connection' };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing', progress: 0 });

    try {
      console.log('Starting sync process...');
      
      // Step 1: Sync pending operations (upload local changes)
      await this.syncPendingOperations();
      this.notifyListeners({ status: 'syncing', progress: 30 });

      // Step 2: Download latest data from server
      await this.downloadLatestData();
      this.notifyListeners({ status: 'syncing', progress: 70 });

      // Step 3: Clean up and update sync metadata
      await OfflineStorageService.clearPendingSyncOperations();
      await OfflineStorageService.setLastSyncTimestamp(Date.now());
      this.notifyListeners({ status: 'syncing', progress: 100 });

      console.log('Sync completed successfully');
      this.notifyListeners({ status: 'completed', progress: 100 });
      
      return { success: true, message: 'Sync completed successfully' };
    } catch (error) {
      console.error('Sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      this.notifyListeners({ status: 'error', progress: 0, error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      this.isSyncing = false;
    }
  }

  private static async syncPendingOperations(): Promise<void> {
    const pendingOps = await OfflineStorageService.getPendingSyncOperations();
    console.log(`Syncing ${pendingOps.length} pending operations`);

    // Sort operations by timestamp to ensure correct order
    pendingOps.sort((a, b) => a.timestamp - b.timestamp);

    for (const op of pendingOps) {
      try {
        await this.executePendingOperation(op);
        await OfflineStorageService.removePendingSyncOperation(op.id);
      } catch (error) {
        console.error(`Failed to sync operation ${op.id}:`, error);
        // Continue with other operations instead of failing the entire sync
      }
    }
  }

  private static async executePendingOperation(op: PendingSyncOperation): Promise<void> {
    console.log(`Executing pending operation: ${op.type} ${op.entity} ${op.id}`);

    switch (op.entity) {
      case 'expense':
        await this.syncExpenseOperation(op);
        break;
      case 'category':
        await this.syncCategoryOperation(op);
        break;
      default:
        throw new Error(`Unknown entity type: ${op.entity}`);
    }
  }

  private static async syncExpenseOperation(op: PendingSyncOperation): Promise<void> {
    switch (op.type) {
      case 'CREATE':
        const createdExpense = await expenseApi.create(op.data);
        // Update local storage with server ID if it was a local-only item
        if (op.localId) {
          await OfflineStorageService.deleteExpense(op.localId);
          await OfflineStorageService.addExpense(createdExpense);
        }
        break;
      case 'UPDATE':
        await expenseApi.update(op.data._id, op.data);
        break;
      case 'DELETE':
        await expenseApi.delete(op.data._id);
        break;
    }
  }

  private static async syncCategoryOperation(op: PendingSyncOperation): Promise<void> {
    switch (op.type) {
      case 'CREATE':
        const createdCategory = await categoryApi.create(op.data.name);
        // Update local storage with server ID if it was a local-only item
        if (op.localId) {
          await OfflineStorageService.deleteCategory(op.localId);
          await OfflineStorageService.addCategory(createdCategory);
        }
        break;
      case 'DELETE':
        await categoryApi.delete(op.data._id);
        break;
    }
  }

  private static async downloadLatestData(): Promise<void> {
    console.log('Downloading latest data from server...');

    try {
      // Download expenses
      const expenses = await expenseApi.getAll();
      await OfflineStorageService.saveExpenses(expenses);

      // Download categories
      const categories = await categoryApi.getAll();
      await OfflineStorageService.saveCategories(categories);

      console.log(`Downloaded ${expenses.length} expenses and ${categories.length} categories`);
    } catch (error) {
      console.error('Failed to download latest data:', error);
      throw error;
    }
  }

  // Auto-sync when network becomes available
  static async autoSync(): Promise<void> {
    if (!NetworkStateManager.isOnline()) {
      return;
    }

    const pendingOps = await OfflineStorageService.getPendingSyncOperations();
    const lastSync = await OfflineStorageService.getLastSyncTimestamp();
    const now = Date.now();
    const timeSinceLastSync = now - lastSync;
    const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

    // Auto-sync if there are pending operations or it's been too long since last sync
    if (pendingOps.length > 0 || timeSinceLastSync > AUTO_SYNC_INTERVAL) {
      console.log('Starting auto-sync...');
      await this.startSync();
    }
  }

  // Sync status listeners
  static addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  static addListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  static removeAllListeners(): void {
    this.syncListeners = [];
  }

  private static notifyListeners(status: SyncStatus): void {
    this.syncListeners.forEach(listener => listener(status));
  }

  static isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  static async getPendingOperationsCount(): Promise<number> {
    const operations = await OfflineStorageService.getPendingSyncOperations();
    return operations.length;
  }

  static async getLastSyncTime(): Promise<Date | null> {
    const timestamp = await OfflineStorageService.getLastSyncTimestamp();
    return timestamp > 0 ? new Date(timestamp) : null;
  }
}

export interface SyncResult {
  success: boolean;
  message: string;
}

export interface SyncStatus {
  status: 'syncing' | 'completed' | 'error' | 'idle';
  progress: number;
  error?: string;
}
