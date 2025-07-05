import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../constants/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface InsightCardProps {
  icon: string;
  message: string;
  color?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ icon, message, color }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>  
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={color || colors.primary} 
        />
      </View>
      <Text 
        style={[styles.message, { color: colors.text.primary }]} 
        numberOfLines={2}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    marginVertical: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e8ebf3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    flex: 1,
    color: '#0e121b',
  },
});

export default InsightCard;
