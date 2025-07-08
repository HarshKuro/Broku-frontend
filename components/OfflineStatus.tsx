import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, ProgressBar, Chip } from 'react-native-paper';
import { useOfflineStatus, useSyncStatus, syncUtilities } from '../services/offlineManager';

export const OfflineStatusCard: React.FC = () => {
  const offlineStatus = useOfflineStatus();
  const syncStatus = useSyncStatus();

  const handleForceSync = async () => {
    const result = await syncUtilities.forceSyncWithFeedback();
    
    if (result.success) {
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleClearOfflineData = () => {
    Alert.alert(
      'Clear Offline Data',
      'This will remove all locally stored data and pending changes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const result = await syncUtilities.clearOfflineDataWithConfirmation();
            Alert.alert(
              result.success ? 'Success' : 'Error',
              result.message
            );
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (offlineStatus.isSyncing) return '#FFA500'; // Orange
    if (!offlineStatus.isOnline) return '#FF6B6B'; // Red
    if (offlineStatus.pendingOperationsCount > 0) return '#FFD93D'; // Yellow
    return '#6BCF7F'; // Green
  };

  const getStatusText = () => {
    if (offlineStatus.isSyncing) return 'Syncing...';
    if (!offlineStatus.isOnline) return 'Offline';
    if (offlineStatus.pendingOperationsCount > 0) return 'Pending sync';
    return 'Online & synced';
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          
          <Chip
            mode="outlined"
            style={[styles.chip, { borderColor: getStatusColor() }]}
            textStyle={{ color: getStatusColor() }}
          >
            {offlineStatus.isOnline ? 'Online' : 'Offline'}
          </Chip>
        </View>

        {offlineStatus.isSyncing && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={syncStatus.progress / 100}
              color={getStatusColor()}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(syncStatus.progress)}% complete
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          {offlineStatus.pendingOperationsCount > 0 && (
            <Text style={styles.infoText}>
              {offlineStatus.pendingOperationsCount} pending change{offlineStatus.pendingOperationsCount > 1 ? 's' : ''}
            </Text>
          )}
          
          <Text style={styles.infoText}>
            Last sync: {syncUtilities.formatLastSyncTime(offlineStatus.lastSyncTime)}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleForceSync}
            disabled={offlineStatus.isSyncing || !offlineStatus.isOnline}
            style={styles.button}
          >
            Force Sync
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleClearOfflineData}
            disabled={offlineStatus.isSyncing}
            style={[styles.button, styles.dangerButton]}
            textColor="#FF6B6B"
          >
            Clear Data
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chip: {
    height: 28,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    marginVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  dangerButton: {
    borderColor: '#FF6B6B',
  },
});

// Simple offline indicator for header/navigation
export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingOperationsCount } = useOfflineStatus();

  if (isOnline && pendingOperationsCount === 0) {
    return null; // Don't show anything when online and synced
  }

  return (
    <View style={indicatorStyles.container}>
      <View style={[
        indicatorStyles.dot,
        { backgroundColor: isOnline ? '#FFD93D' : '#FF6B6B' }
      ]} />
      <Text style={indicatorStyles.text}>
        {isOnline ? `${pendingOperationsCount} pending` : 'Offline'}
      </Text>
    </View>
  );
};

const indicatorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});
