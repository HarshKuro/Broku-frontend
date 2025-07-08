// Example: How to integrate offline API in existing screens

// Replace this import:
// import { expenseApi } from '../api/expenseApi';

// With this import:
import { offlineExpenseApi as expenseApi } from '../services/offlineApi';
import { OfflineIndicator } from '../components/OfflineStatus';
import { useOfflineStatus } from '../services/offlineManager';

// In your component:
const YourScreen: React.FC = () => {
  const offlineStatus = useOfflineStatus();

  // Your existing code remains the same, but now:
  // 1. It automatically works offline
  // 2. Data is cached locally
  // 3. Changes sync when back online

  return (
    <View>
      {/* Add offline indicator to header */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Your Screen Title</Text>
        <OfflineIndicator />
      </View>

      {/* Show offline status message if needed */}
      {!offlineStatus.isOnline && (
        <View style={{
          backgroundColor: '#FFD93D',
          padding: 8,
          alignItems: 'center'
        }}>
          <Text>Working offline - changes will sync when online</Text>
        </View>
      )}

      {/* Your existing UI components */}
    </View>
  );
};

/*
INTEGRATION STEPS:

1. Replace API imports:
   - Replace: import { expenseApi, categoryApi } from '../api/expenseApi';
   - With: import { offlineExpenseApi as expenseApi, offlineCategoryApi as categoryApi } from '../services/offlineApi';

2. Add offline status indicators:
   - Import OfflineIndicator component
   - Import useOfflineStatus hook
   - Add indicators to your UI

3. Initialize offline manager in App.tsx (already done above)

4. Install dependencies:
   npm install @react-native-async-storage/async-storage @react-native-community/netinfo

5. Optional: Add OfflineStatusCard to settings/debug screen

That's it! Your existing code will now work offline automatically.

KEY BENEFITS:
- No changes needed to existing API calls
- Automatic local caching
- Automatic sync when back online
- Real-time network status monitoring
- Queue management for offline operations
- Conflict resolution during sync

The offline APIs are drop-in replacements that:
- Try server first when online
- Fall back to local storage when offline
- Cache data automatically
- Queue changes for sync
- Handle temporary local IDs for new items
*/
