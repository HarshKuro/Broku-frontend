import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import AddIncomeScreen from './screens/AddIncomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import AddCategoryScreen from './screens/AddCategoryScreen';
import SummaryScreen from './screens/SummaryScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import InsightsScreen from './screens/InsightsScreen';
import CashWalletScreen from './screens/CashWalletScreen';
import AddCashScreen from './screens/AddCashScreen';
import SpendCashScreen from './screens/SpendCashScreen';
import AIInsightsScreen from './screens/AIInsightsScreen';
import AIDebugScreen from './screens/AIDebugScreen';
import SimpleNetworkTest from './screens/SimpleNetworkTest';
import TestAIScreen from './screens/TestAIScreen';
import ImportScreen from './screens/ImportScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (!route || !route.name) {
            console.warn('Tab route is undefined:', route);
            iconName = 'help';
          }          else if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Analytics') iconName = 'analytics';
          else if (route.name === 'Summary') iconName = 'stats-chart';
          else if (route.name === 'History') iconName = 'time';
          else if (route.name === 'CashWallet') iconName = 'wallet';
          else if (route.name === 'AI') iconName = 'sparkles';
          else {
            console.warn('Unknown tab route:', route.name);
            iconName = 'help';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4C7EFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="CashWallet" component={CashWalletScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="AI" component={AIInsightsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
        <Stack.Screen name="Insights" component={InsightsScreen} />
        <Stack.Screen name="AIInsights" component={AIInsightsScreen} />
        <Stack.Screen name="AIDebug" component={AIDebugScreen} />
        <Stack.Screen name="SimpleNetworkTest" component={SimpleNetworkTest} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
        <Stack.Screen name="Import" component={ImportScreen} />
        <Stack.Screen 
          name="AddCash" 
          component={AddCashScreen}
          options={{ 
            headerShown: true, 
            title: 'Add Cash',
            headerStyle: { backgroundColor: '#4C7EFF' },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen 
          name="SpendCash" 
          component={SpendCashScreen}
          options={{ 
            headerShown: true, 
            title: 'Spend Cash',
            headerStyle: { backgroundColor: '#4C7EFF' },
            headerTintColor: 'white'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
