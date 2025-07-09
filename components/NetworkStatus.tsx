import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NetworkStateManager, NetworkState } from '../services/networkState';
import { SyncService } from '../services/syncService';
import { useTheme } from '../constants/ThemeProvider';

interface NetworkStatusProps {
  showDebugInfo?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ showDebugInfo = false }) => {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    // Initialize network state
    const initNetwork = async () => {
      await NetworkStateManager.initialize();
      setNetworkState(NetworkStateManager.getCurrentState());
    };
    initNetwork();

    // Listen for network changes
    const unsubscribeNetwork = NetworkStateManager.addListener((state) => {
      setNetworkState(state);
      console.log('📡 Network state changed:', state);
    });

    // Listen for sync status changes
    const unsubscribeSync = SyncService.addListener((status) => {
      setSyncStatus(status.status);
      if (status.status === 'completed') {
        setLastSync(new Date());
      }
      console.log('🔄 Sync status:', status);
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, []);

  const getStatusColor = () => {
    if (!networkState) return colors.text.secondary;
    return networkState.isConnected ? colors.success : colors.error;
  };

  const getStatusText = () => {
    if (!networkState) return 'Checking...';
    return networkState.isConnected ? 'Online' : 'Offline';
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '🔄 Syncing...';
      case 'completed':
        return '✅ Synced';
      case 'error':
        return '❌ Sync Error';
      default:
        return '⏸️ Idle';
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <Text style={styles.syncText}>
          {getSyncStatusText()}
        </Text>
      </View>
      
      {showDebugInfo && networkState && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Network Type: {networkState.type}</Text>
          <Text style={styles.debugText}>
            Internet: {networkState.isInternetReachable ? 'Yes' : 'No'}
          </Text>
          {lastSync && (
            <Text style={styles.debugText}>
              Last Sync: {lastSync.toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  syncText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 'auto',
  },
  debugInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  debugText: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
  },
});

export default NetworkStatus;
