import { NetworkStateManager } from './networkState';
import { SyncService, SyncStatus } from './syncService';
import { OfflineStorageService } from './offlineStorage';
import { useEffect, useState } from 'react';

export class OfflineManager {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing offline manager...');

    try {
      // Initialize network state monitoring
      await NetworkStateManager.initialize();

      // Set up auto-sync when network becomes available
      NetworkStateManager.addListener((networkState) => {
        if (networkState.isConnected && networkState.isInternetReachable) {
          console.log('Network connection restored, starting auto-sync...');
          SyncService.autoSync().catch(error => {
            console.error('Auto-sync failed:', error);
          });
        }
      });

      this.isInitialized = true;
      console.log('Offline manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline manager:', error);
      throw error;
    }
  }

  static async forceSync(): Promise<void> {
    try {
      const result = await SyncService.startSync();
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }

  static async clearAllOfflineData(): Promise<void> {
    try {
      await OfflineStorageService.clearAllData();
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  }

  static async getOfflineStatus(): Promise<OfflineStatus> {
    const pendingCount = await SyncService.getPendingOperationsCount();
    const lastSync = await SyncService.getLastSyncTime();
    const isOnline = NetworkStateManager.isOnline();
    const isSyncing = SyncService.isSyncInProgress();

    return {
      isOnline,
      isSyncing,
      pendingOperationsCount: pendingCount,
      lastSyncTime: lastSync,
      hasOfflineData: pendingCount > 0 || !isOnline,
    };
  }
}

export interface OfflineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperationsCount: number;
  lastSyncTime: Date | null;
  hasOfflineData: boolean;
}

// React hooks for offline functionality
export const useOfflineStatus = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: false,
    isSyncing: false,
    pendingOperationsCount: 0,
    lastSyncTime: null,
    hasOfflineData: false,
  });

  const updateStatus = async () => {
    const newStatus = await OfflineManager.getOfflineStatus();
    setStatus(newStatus);
  };

  useEffect(() => {
    // Initial status
    updateStatus();

    // Listen for network changes
    const unsubscribeNetwork = NetworkStateManager.addListener(() => {
      updateStatus();
    });

    // Listen for sync status changes
    const unsubscribeSync = SyncService.addSyncListener(() => {
      updateStatus();
    });

    // Update status periodically
    const interval = setInterval(updateStatus, 30000); // Every 30 seconds

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
      clearInterval(interval);
    };
  }, []);

  return status;
};

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    progress: 0,
  });

  useEffect(() => {
    const unsubscribe = SyncService.addSyncListener(setSyncStatus);
    return unsubscribe;
  }, []);

  return syncStatus;
};

// Utility functions for components
export const syncUtilities = {
  async forceSyncWithFeedback(): Promise<{ success: boolean; message: string }> {
    try {
      await OfflineManager.forceSync();
      return { success: true, message: 'Sync completed successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      return { success: false, message: errorMessage };
    }
  },

  async clearOfflineDataWithConfirmation(): Promise<{ success: boolean; message: string }> {
    try {
      await OfflineManager.clearAllOfflineData();
      return { success: true, message: 'Offline data cleared successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear offline data';
      return { success: false, message: errorMessage };
    }
  },

  formatLastSyncTime(lastSyncTime: Date | null): string {
    if (!lastSyncTime) {
      return 'Never synced';
    }

    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  },
};
