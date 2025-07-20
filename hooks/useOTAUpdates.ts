import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

export interface UpdateInfo {
  isAvailable: boolean;
  isDownloading: boolean;
  isChecking: boolean;
  progress?: number;
}

export const useOTAUpdates = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isAvailable: false,
    isDownloading: false,
    isChecking: false,
  });

  const checkForUpdates = async () => {
    try {
      if (!__DEV__ && Updates.isEnabled) {
        setUpdateInfo(prev => ({ ...prev, isChecking: true }));
        
        const update = await Updates.checkForUpdateAsync();
        
        if (update.isAvailable) {
          setUpdateInfo(prev => ({ 
            ...prev, 
            isAvailable: true, 
            isChecking: false 
          }));
          
          // Show update available dialog
          Alert.alert(
            '🚀 Update Available',
            'A new version of the app is available. Would you like to download it now?',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Update Now', onPress: downloadAndInstallUpdate },
            ]
          );
        } else {
          setUpdateInfo(prev => ({ ...prev, isChecking: false }));
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateInfo(prev => ({ ...prev, isChecking: false }));
    }
  };

  const downloadAndInstallUpdate = async () => {
    try {
      setUpdateInfo(prev => ({ 
        ...prev, 
        isDownloading: true, 
        isAvailable: false 
      }));

      // Download the update
      const downloadResult = await Updates.fetchUpdateAsync();
      
      if (downloadResult.isNew) {
        // Show restart dialog
        Alert.alert(
          '✅ Update Downloaded',
          'The update has been downloaded. The app will restart to apply the changes.',
          [
            { 
              text: 'Restart Now', 
              onPress: () => Updates.reloadAsync() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateInfo(prev => ({ ...prev, isDownloading: false }));
      
      Alert.alert(
        '❌ Update Failed',
        'Failed to download the update. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const manualCheckForUpdates = () => {
    if (__DEV__) {
      Alert.alert(
        'Development Mode',
        'OTA updates are not available in development mode.'
      );
      return;
    }
    
    checkForUpdates();
  };

  useEffect(() => {
    // Check for updates when app starts (only in production)
    if (!__DEV__) {
      // Delay initial check to avoid interfering with app startup
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  return {
    updateInfo,
    checkForUpdates: manualCheckForUpdates,
    downloadAndInstallUpdate,
  };
};

// Optional: Export update status component
export const UpdateStatusIndicator = () => {
  const { updateInfo } = useOTAUpdates();
  
  if (__DEV__) return null;
  
  if (updateInfo.isChecking) {
    return {
      text: 'Checking for updates...',
      color: '#FFA500'
    };
  }
  
  if (updateInfo.isDownloading) {
    return {
      text: 'Downloading update...',
      color: '#4CAF50'
    };
  }
  
  if (updateInfo.isAvailable) {
    return {
      text: 'Update available',
      color: '#2196F3'
    };
  }
  
  return null;
};
