import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeProvider';

interface CustomBottomTabProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const CustomBottomTab: React.FC<CustomBottomTabProps> = ({ activeTab, onTabPress }) => {
  const { colors } = useTheme();

  const tabs = [
    { id: 'Home', icon: 'home', label: 'Home' },
    { id: 'Summary', icon: 'stats-chart', label: 'Summary' },
    { id: 'Transactions', icon: 'list', label: 'Transactions' },
    { id: 'Budget', icon: 'wallet', label: 'Budget' },
    { id: 'Profile', icon: 'person', label: 'Profile' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => onTabPress(tab.id)}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.id ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === tab.id ? colors.primary : colors.text.secondary
              }
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default CustomBottomTab;
