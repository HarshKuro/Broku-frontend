import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../constants/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface InsightData {
  icon: string;
  message: string;
  color?: string;
  category?: 'daily' | 'weekly' | 'general';
}

interface InsightCarouselProps {
  insights: InsightData[];
}

const InsightCarousel: React.FC<InsightCarouselProps> = ({ insights }) => {
  const { colors } = useTheme();

  const dailyInsights = insights.filter(i => i.category === 'daily');
  const weeklyInsights = insights.filter(i => i.category === 'weekly');
  const generalInsights = insights.filter(i => !i.category || i.category === 'general');

  const renderInsightCard = (insight: InsightData, index: number) => (
    <View 
      key={index} 
      style={[
        styles.insightCard, 
        { 
          backgroundColor: colors.surface,
          width: screenWidth - 80,
          marginRight: 16,
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: (insight.color || colors.primary) + '20' }]}>
        <Ionicons 
          name={insight.icon as any} 
          size={24} 
          color={insight.color || colors.primary} 
        />
      </View>
      <Text style={[styles.insightMessage, { color: colors.text.primary }]}>
        {insight.message}
      </Text>
    </View>
  );

  const renderSection = (title: string, sectionInsights: InsightData[], emoji: string) => {
    if (sectionInsights.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          {emoji} {title}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {sectionInsights.map(renderInsightCard)}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>
          💡 Smart Insights
        </Text>
      </View>
      
      {renderSection('Daily Highlights', dailyInsights, '📅')}
      {renderSection('Weekly Summary', weeklyInsights, '📊')}
      {renderSection('Financial Tips', generalInsights, '💰')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  carouselContainer: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  insightCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default InsightCarousel;
