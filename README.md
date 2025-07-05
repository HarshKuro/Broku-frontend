# 📱 Broku Frontend - Modern Expense Tracker

A beautiful, modern React Native mobile application with glass-morphism design, built using Expo and TypeScript.

![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)
![Expo](https://img.shields.io/badge/Expo-53.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green)

## ✨ Features

### 🎨 **Modern UI/UX**
- ✅ **Glass-morphism Design** - Beautiful translucent cards with blur effects
- ✅ **Smooth Animations** - Fluid transitions and micro-interactions
- ✅ **Dark/Light Theme** - Automatic theme switching
- ✅ **Mobile-First** - Designed specifically for mobile devices
- ✅ **Status Bar Optimization** - Perfect status bar handling with SafeAreaView

### 📱 **Core Functionality**
- ✅ **Smart Expense Management** - Add, edit, delete expenses with ease
- ✅ **Search-Based Category Selection** - No dropdowns, just search and select
- ✅ **Interactive Charts** - Pie charts, bar charts, trend analysis
- ✅ **Advanced Filtering** - Search expenses by amount, category, date
- ✅ **Real-time Sync** - Instant data synchronization with backend

### 🚀 **Technical Excellence**
- ✅ **TypeScript** - Complete type safety throughout the app
- ✅ **Environment Configuration** - Development/production environment switching
- ✅ **Error Handling** - Comprehensive error management with retry logic
- ✅ **Network Resilience** - Auto-retry for hibernating backends
- ✅ **Instant Updates** - Over-the-air updates via Expo Updates

## 🏗️ Architecture

```
Modern React Native App
├── 🎨 Glass-morphism UI Design
├── ⚡ Instant Hot Reload
├── 📊 Interactive Charts
├── 🔍 Search-Based UX
├── 🌙 Theme Support
├── 📱 Cross-Platform (iOS/Android)
├── 🔄 Real-time Data Sync
└── 🚀 Production Ready
```

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.79.5 | Mobile framework |
| **Expo SDK** | 53.0.17 | Development platform |
| **TypeScript** | 5.8.3 | Type safety |
| **React Navigation** | 6.x | Navigation system |
| **React Native Paper** | 5.12.3 | UI components |
| **Expo Vector Icons** | 14.1.0 | Icon library |
| **React Native Chart Kit** | 6.12.0 | Data visualization |
| **Axios** | 1.7.9 | HTTP client |
| **React Native Reanimated** | 3.18.0 | Animations |
| **Expo Linear Gradient** | 14.1.5 | Gradient effects |

## 📦 Installation

### **Prerequisites**
```bash
# Required software
- Node.js 18+
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

# Install global dependencies
npm install -g @expo/cli eas-cli
```

### **Setup**
```bash
# 1. Clone repository
git clone https://github.com/HarshKuro/Broku-frontend.git
cd expense-tracker-app/client

# 2. Install dependencies
npm install

# 3. Start development server
npx expo start

# 4. Run on device
# Scan QR code with Expo Go app
# Or press 'a' for Android, 'i' for iOS simulator
```

## ⚙️ Configuration

### **Environment Setup**
```typescript
// config/env.ts
interface AppConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

const developmentConfig: AppConfig = {
  API_BASE_URL: 'http://localhost:3000/api', // Local backend
  ENVIRONMENT: 'development',
};

const productionConfig: AppConfig = {
  API_BASE_URL: 'https://your-backend.com/api', // Production backend
  ENVIRONMENT: 'production',
};

export const config: AppConfig = __DEV__ ? developmentConfig : productionConfig;
```

### **App Configuration (app.json)**
```json
{
  "expo": {
    "name": "Broku",
    "slug": "expense-tracker-app",
    "version": "1.0.1",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "package": "com.expensetracker.app",
      "permissions": ["INTERNET", "ACCESS_NETWORK_STATE"]
    },
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]"
    }
  }
}
```

## 📁 Project Structure

```
client/
├── 📱 App Entry Points
│   ├── App.tsx                     # Main app component
│   ├── index.ts                    # App entry point
│   └── navigation.tsx              # Navigation setup
├── 🎨 Assets
│   ├── assets/
│   │   ├── icon.png               # App icon
│   │   ├── adaptive-icon.png      # Android adaptive icon
│   │   ├── splash-icon.png        # Splash screen
│   │   └── favicon.png            # Web favicon
├── 📄 Screens
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Dashboard with overview
│   │   ├── AddExpenseScreen.tsx   # Add/edit expenses
│   │   ├── HistoryScreen.tsx      # Expense history & search
│   │   ├── SummaryScreen.tsx      # Analytics & charts
│   │   ├── AnalyticsScreen.tsx    # Advanced analytics
│   │   ├── AddCategoryScreen.tsx  # Category management
│   │   └── AddIncomeScreen.tsx    # Income tracking
├── 🧩 Components
│   ├── components/
│   │   ├── 🎨 UI Components
│   │   │   ├── ActionButton.tsx         # Floating action button
│   │   │   ├── AnimatedButton.tsx       # Animated button component
│   │   │   ├── GlassCard.tsx           # Glass-morphism card
│   │   │   ├── ModernCard.tsx          # Modern styled card
│   │   │   └── Loading.tsx             # Loading component
│   │   ├── 📊 Data Components
│   │   │   ├── ExpenseCard.tsx         # Expense display card
│   │   │   ├── StatsCard.tsx           # Statistics card
│   │   │   ├── SmartSummaryCard.tsx    # AI insights card
│   │   │   └── InsightCard.tsx         # Insight display
│   │   ├── 📈 Chart Components
│   │   │   ├── GraphComponent.tsx      # Chart wrapper
│   │   │   └── RealPieChart.tsx        # Pie chart component
│   │   ├── 🔍 Input Components
│   │   │   ├── CategorySelector.tsx           # Dropdown selector
│   │   │   ├── CategorySelectorSearch.tsx     # Search-based selector
│   │   │   └── IncomeExpenseInput.tsx         # Input component
│   │   └── 🎯 Example Components
│   │       └── ExampleThemedComponent.tsx     # Theme example
├── 🔌 API Layer
│   ├── api/
│   │   └── expenseApi.ts          # HTTP client with retry logic
├── ⚙️ Configuration
│   ├── config/
│   │   └── env.ts                 # Environment configuration
├── 🎨 Design System
│   ├── constants/
│   │   ├── theme.ts               # Design tokens
│   │   └── ThemeProvider.tsx      # Theme context
├── 🎯 Types
│   ├── types/
│   │   └── types.ts               # TypeScript definitions
├── 🛠️ Utilities
│   ├── utils/
│   │   └── currency.ts            # Currency formatting
├── ⚙️ Configuration Files
│   ├── app.json                   # Expo configuration
│   ├── eas.json                   # EAS Build configuration
│   ├── babel.config.js            # Babel configuration
│   ├── metro.config.js            # Metro bundler configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── package.json               # Dependencies
└── 📚 Documentation
    └── README.md                  # This file
```

## 🎨 Design System

### **Theme Configuration**
```typescript
// constants/theme.ts
export const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#e2e8f0'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    }
  }
};
```

### **Glass-morphism Components**
```typescript
// components/GlassCard.tsx
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'light' | 'dark';
  blurAmount?: number;
}

// Creates beautiful translucent cards with blur effects
```

## 🔌 API Integration

### **HTTP Client Configuration**
```typescript
// api/expenseApi.ts
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 60000, // 60 seconds for hibernating backends
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic retry logic for network failures
const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
  // Handles hibernating backends and network issues
};
```

### **API Services**
```typescript
// Expense Management
export const expenseApi = {
  getAll: (params?) => Promise<Expense[]>,
  getById: (id) => Promise<Expense>,
  create: (data) => Promise<Expense>,
  update: (id, data) => Promise<Expense>,
  delete: (id) => Promise<void>,
  getMonthlySummary: (month, year) => Promise<MonthlySummary>,
  getAnalytics: (period) => Promise<AnalyticsData>
};

// Category Management
export const categoryApi = {
  getAll: () => Promise<Category[]>,
  create: (name) => Promise<Category>,
  delete: (id) => Promise<void>
};
```

## 📱 Screen Components

### **Home Screen**
- 📊 **Dashboard Overview** - Quick stats and recent expenses
- 🎯 **Smart Insights** - AI-powered spending analysis
- ⚡ **Quick Actions** - Add expense, view history buttons

### **Add Expense Screen**
- 🔍 **Search-Based Category Selection** - Type to find categories
- 💰 **Amount Input** - Numeric keypad with currency formatting
- 📅 **Date Picker** - Easy date selection
- 📝 **Notes** - Optional expense description

### **History Screen**
- 📋 **Expense List** - Beautiful cards with swipe actions
- 🔍 **Search & Filter** - Find expenses quickly
- 📊 **Summary Stats** - Monthly totals and insights
- 🗂️ **Category Filtering** - Filter by expense categories

### **Summary Screen**
- 📈 **Interactive Charts** - Pie charts, bar charts, trends
- 📊 **Analytics Dashboard** - Spending patterns and insights
- 📅 **Time Period Selection** - Weekly, monthly, yearly views
- 🎯 **Category Breakdown** - See where money goes

### **Add Category Screen**
- ➕ **Create Categories** - Add new expense categories
- 📝 **Category Management** - Edit and delete existing categories
- 🔍 **Search Categories** - Find categories quickly
- ✅ **Validation** - Prevent duplicate categories

## 🎯 Key Features Implementation

### **Search-Based Category Selection**
```typescript
// components/CategorySelectorSearch.tsx
const CategorySelectorSearch = ({ onSelect, selectedCategory }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Real-time search filtering
  // No more dropdowns - just type and select
};
```

### **Glass-morphism Design**
```typescript
// components/GlassCard.tsx
const GlassCard = ({ children, blurType = 'light' }) => (
  <View style={styles.container}>
    <BlurView blurType={blurType} style={styles.blur} />
    <View style={styles.content}>{children}</View>
  </View>
);
```

### **Network Resilience**
```typescript
// api/expenseApi.ts
// Automatic retry for hibernating backends
// Extended timeouts for slow connections
// Error handling with user-friendly messages
```

## 🚀 Development

### **Development Server**
```bash
# Start Expo development server
npx expo start

# Development options
npx expo start --clear         # Clear cache
npx expo start --dev-client    # Use development build
npx expo start --tunnel        # Use tunnel for remote testing
```

### **Testing on Device**
```bash
# Install Expo Go app on your device
# Scan QR code to load your app

# For Android emulator
npx expo start --android

# For iOS simulator (macOS only)
npx expo start --ios
```

### **Development Build (Recommended)**
```bash
# Build development APK (one-time, ~15 minutes)
eas build --platform android --profile development

# Then use instant updates (30 seconds)
npx expo start --dev-client
# Scan QR code with development APK
```

## 📦 Building & Deployment

### **APK Build**
```bash
# Production APK build
eas build --platform android --profile apk

# Check build status
eas build:list

# Download APK when complete
```

### **Instant Updates**
```bash
# Push update to existing APK (2-3 minutes)
eas update --branch production --message "Fix network issues"

# Development updates
eas update --branch development --message "New feature testing"
```

### **Build Profiles (eas.json)**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    },
    "apk": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    }
  }
}
```

## 🎨 UI Components Guide

### **Glass Card Usage**
```typescript
import GlassCard from '../components/GlassCard';

<GlassCard blurType="light" blurAmount={10}>
  <Text>Beautiful glass-morphism card</Text>
</GlassCard>
```

### **Modern Card Usage**
```typescript
import ModernCard from '../components/ModernCard';

<ModernCard elevation={2} borderRadius={16}>
  <Text>Clean, modern card design</Text>
</ModernCard>
```

### **Animated Button**
```typescript
import AnimatedButton from '../components/AnimatedButton';

<AnimatedButton
  onPress={handlePress}
  style={styles.button}
  animationType="scale"
>
  <Text>Animated Button</Text>
</AnimatedButton>
```

## 🎯 TypeScript Types

### **Core Data Types**
```typescript
// types/types.ts
export interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface AnalyticsData {
  dailyExpenses: DailyExpense[];
  categoryTotals: CategoryTotal[];
  monthlyTrend: MonthlyTrend[];
  topCategories: TopCategory[];
}
```

### **Navigation Types**
```typescript
export type RootStackParamList = {
  Home: undefined;
  AddExpense: { expense?: Expense };
  History: undefined;
  Summary: undefined;
  AddCategory: undefined;
  AddIncome: undefined;
  Analytics: undefined;
};
```

## 🔧 Troubleshooting

### **Common Issues**

#### **🌐 Network Connection**
```bash
# Issue: "Failed to fetch data"
# Solutions:
1. Check backend URL in config/env.ts
2. Ensure backend is running and accessible
3. Wait 60 seconds for hibernating backends
4. Check device internet connection
```

#### **📱 Metro Bundler**
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro cache completely
rm -rf node_modules/.cache
npx expo start
```

#### **🔄 Hot Reload Issues**
```bash
# Restart development server
npx expo start

# Reload app on device
Shake device → "Reload"
# Or press R in terminal
```

#### **📦 Dependency Issues**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for version conflicts
npm list
```

### **Performance Issues**

#### **🐌 Slow Performance**
```bash
# Enable Hermes JavaScript engine
# Already enabled in app.json for better performance

# Optimize bundle size
npx expo export --public-url https://your-cdn.com

# Use development build for faster development
eas build --platform android --profile development
```

#### **📊 Chart Performance**
```typescript
// Use optimized chart rendering
import { PieChart } from 'react-native-chart-kit';

// Limit data points for better performance
const chartData = expenseData.slice(0, 10);
```

## 🎯 Performance Optimization

### **Bundle Size Optimization**
```bash
# Analyze bundle size
npx expo export --dump-assetmap

# Tree shake unused imports
# Import only what you need
import { specific } from 'library';
```

### **Image Optimization**
```bash
# Optimize images for mobile
# Use appropriate sizes for different screen densities
assets/
├── icon.png           # 1024x1024
├── adaptive-icon.png  # 1024x1024
└── splash-icon.png    # 1024x1024
```

### **Memory Management**
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component implementation
});

// Clean up listeners in useEffect
useEffect(() => {
  const listener = addListener();
  return () => removeListener(listener);
}, []);
```

## 🧪 Testing

### **Component Testing**
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test
```

### **E2E Testing**
```bash
# Install Detox for E2E testing
npm install --save-dev detox

# Run E2E tests
detox test
```

### **Manual Testing Checklist**
- [ ] All screens load correctly
- [ ] Navigation works smoothly
- [ ] API calls succeed
- [ ] Error handling works
- [ ] Offline mode functions
- [ ] Performance is acceptable

## 🔮 Future Enhancements

### **Version 2.0 Features**
- [ ] 🌙 **Advanced Theming** - Custom theme creation
- [ ] 📊 **More Chart Types** - Line charts, area charts
- [ ] 🔔 **Push Notifications** - Spending alerts and reminders
- [ ] 📸 **Receipt Scanning** - OCR for automatic expense entry
- [ ] 🤖 **AI Insights** - Machine learning predictions
- [ ] 💫 **Advanced Animations** - More micro-interactions
- [ ] 🎯 **Accessibility** - Full accessibility support
- [ ] 🌍 **Internationalization** - Multi-language support

### **Technical Improvements**
- [ ] 🧪 **Testing Suite** - Unit tests, integration tests
- [ ] 📊 **Performance Monitoring** - Real-time performance tracking
- [ ] 🔐 **Security Enhancements** - Biometric authentication
- [ ] 📦 **Code Splitting** - Lazy loading for better performance

## 🤝 Contributing

### **Development Setup**
```bash
# 1. Fork the repository
git clone https://github.com/yourusername/expense-tracker-app.git
cd expense-tracker-app/client

# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Install dependencies
npm install

# 4. Start development
npx expo start

# 5. Make changes and test
# 6. Submit pull request
```

### **Code Style Guidelines**
- 📝 **TypeScript** - Use strict typing
- 🎨 **Components** - Follow React Native best practices
- 📚 **Documentation** - Add JSDoc comments
- 🧪 **Testing** - Add tests for new features
- 🎯 **Performance** - Optimize for mobile devices

## 📞 Support

### **Getting Help**
- 📚 **Documentation** - Check this README and inline comments
- 🐛 **Bug Reports** - Create GitHub issue with details
- 💡 **Feature Requests** - Discuss in GitHub Discussions
- 📧 **Direct Contact** - [your-email@domain.com]

### **Resources**
- 📖 **Expo Documentation** - [docs.expo.dev](https://docs.expo.dev)
- ⚛️ **React Native Docs** - [reactnative.dev](https://reactnative.dev)
- 📱 **React Navigation** - [reactnavigation.org](https://reactnavigation.org)
- 🎨 **Design Inspiration** - [dribbble.com](https://dribbble.com)

## 📄 License

This project is open source and available under the **MIT License**.

---

## 🎉 Congratulations!

You now have a **beautiful, modern mobile app** with:

- 🎨 **Glass-morphism UI** that rivals premium apps
- ⚡ **Lightning-fast development** with hot reload
- 🚀 **Production-ready architecture**
- 📱 **Cross-platform compatibility**
- 🔄 **Real-time data synchronization**
- 🎯 **Type-safe development** with TypeScript

**Your Broku frontend is ready to provide users with an amazing expense tracking experience!** ✨

---

*Built with ❤️ using React Native, Expo, and modern mobile development practices*
