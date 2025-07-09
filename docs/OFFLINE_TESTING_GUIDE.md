# 🧪 Offline Functionality Testing Guide

## 🎯 **Overview**
This guide helps you test the offline functionality of your expense tracker app to ensure it works properly in production.

## 📱 **Testing Methods**

### 1. **Device Network Testing**

#### **Method A: Airplane Mode Test**
1. Open the app on your device
2. Add some expenses while online
3. Turn ON **Airplane Mode**
4. Try to add new expenses (should work offline)
5. View existing expenses (should load from cache)
6. Turn OFF **Airplane Mode**
7. Check if new expenses sync to server

#### **Method B: Wi-Fi Disconnect Test**
1. Connect to Wi-Fi and use the app
2. Go to Wi-Fi settings and disconnect
3. Return to app and test functionality
4. Reconnect Wi-Fi and verify sync

#### **Method C: Mobile Data Test**
1. Use app on mobile data
2. Turn off mobile data
3. Test offline functionality
4. Turn on mobile data and verify sync

### 2. **Development Testing**

#### **Method A: Server Shutdown Test**
1. Stop the backend server (`Ctrl+C` in terminal)
2. Use the app (should fall back to offline mode)
3. Add expenses and categories
4. Restart server
5. Check if data syncs

#### **Method B: Network Simulation**
1. Use Chrome DevTools Network tab
2. Set to "Offline" mode
3. Test web version of app
4. Set back to "Online" and verify sync

### 3. **Production Environment Testing**

#### **Method A: Deployed Backend Test**
1. Deploy backend to cloud service
2. Use production API URL
3. Test offline functionality
4. Verify data persistence

#### **Method B: Edge Case Testing**
1. Poor network conditions
2. Intermittent connectivity
3. Network timeouts
4. Server errors

## 🔧 **Testing Tools**

### 1. **Debug Console Logs**
Look for these log messages in your app:
```
LOG  Initializing offline manager...
LOG  Offline manager initialized successfully
LOG  Offline: Loading expenses from local storage
LOG  Syncing pending operations...
LOG  Sync completed successfully
```

### 2. **Network Status Indicator**
Add a network status indicator to your app (see implementation below).

### 3. **Offline Badge**
Show an "Offline" badge when network is unavailable.

## 📊 **What to Test**

### ✅ **Core Offline Features**
- [ ] View existing expenses when offline
- [ ] Add new expenses when offline
- [ ] Edit existing expenses when offline
- [ ] Delete expenses when offline
- [ ] Add new categories when offline
- [ ] Search and filter expenses when offline

### ✅ **Sync Features**
- [ ] Data syncs when network returns
- [ ] No duplicate entries after sync
- [ ] Conflict resolution works properly
- [ ] Sync queue processes correctly

### ✅ **Edge Cases**
- [ ] App works after restart while offline
- [ ] Large amounts of offline data
- [ ] Partial sync failures
- [ ] Network interruptions during sync

## 🚀 **Production Deployment Testing**

### 1. **Build Production APK**
```bash
# Build production APK
eas build --platform android --profile production

# Install and test on device
# Test offline functionality thoroughly
```

### 2. **Test with Production Backend**
```bash
# Update production config
API_BASE_URL: 'https://your-production-api.com/api'

# Test offline functionality
# Verify data syncs to production database
```

### 3. **Real-World Testing**
- Test in areas with poor connectivity
- Test with different network types (3G, 4G, Wi-Fi)
- Test with multiple devices
- Test data consistency across devices

## 🎨 **Testing Components**

You can add these components to help with testing:

### Network Status Component
```typescript
const NetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  
  useEffect(() => {
    const unsubscribe = NetworkStateManager.addListener(setNetworkState);
    return unsubscribe;
  }, []);

  return (
    <View style={styles.networkStatus}>
      <Text style={[styles.statusText, { 
        color: networkState?.isConnected ? 'green' : 'red' 
      }]}>
        {networkState?.isConnected ? '🟢 Online' : '🔴 Offline'}
      </Text>
    </View>
  );
};
```

### Sync Status Component
```typescript
const SyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<string>('idle');
  
  useEffect(() => {
    const unsubscribe = SyncService.addListener((status) => {
      setSyncStatus(status.status);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.syncStatus}>
      <Text>Sync: {syncStatus}</Text>
    </View>
  );
};
```

## 📈 **Success Criteria**

### ✅ **Offline Mode**
- App functions without network connection
- Data persists between app restarts
- UI clearly indicates offline state

### ✅ **Online Mode**
- Data syncs automatically when network returns
- No data loss during sync
- Smooth transition between offline/online

### ✅ **Production Ready**
- Works with deployed backend
- Handles production network conditions
- Scales with real user data

## 🔍 **Debugging Tips**

### 1. **Check AsyncStorage**
```typescript
// View stored data
const debugStorage = async () => {
  const expenses = await AsyncStorage.getItem('@expenses');
  const categories = await AsyncStorage.getItem('@categories');
  const syncQueue = await AsyncStorage.getItem('@syncQueue');
  
  console.log('Stored expenses:', expenses);
  console.log('Stored categories:', categories);
  console.log('Sync queue:', syncQueue);
};
```

### 2. **Monitor Network State**
```typescript
// Add to your main component
useEffect(() => {
  const unsubscribe = NetworkStateManager.addListener((state) => {
    console.log('Network state changed:', state);
  });
  return unsubscribe;
}, []);
```

### 3. **Test Sync Process**
```typescript
// Manually trigger sync
const testSync = async () => {
  const result = await SyncService.syncAll();
  console.log('Sync result:', result);
};
```

## 🎯 **Final Checklist**

Before production deployment:

- [ ] All offline features work without network
- [ ] Data syncs correctly when network returns
- [ ] No data loss in any scenario
- [ ] App handles network interruptions gracefully
- [ ] Performance is good with offline data
- [ ] User experience is smooth offline/online
- [ ] Error handling works properly
- [ ] App works after updates/restarts

## 🚀 **Production Deployment Steps**

1. **Test thoroughly in development**
2. **Build production APK with offline support**
3. **Deploy backend to production**
4. **Test with production backend**
5. **Verify offline functionality in production**
6. **Monitor real-world usage**

Your app is designed to work offline-first, so it should handle production environments well!
