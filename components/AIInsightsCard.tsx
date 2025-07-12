import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import GlassCard from './GlassCard';
import { aiApi, AIInsight } from '../api/aiApi';

interface AIInsightsCardProps {
  onViewAll?: () => void;
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ onViewAll }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [aiScore, setAiScore] = useState(0);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const [insightsResponse, overviewResponse] = await Promise.all([
        aiApi.getInsights().catch(() => ({ success: false, data: null })),
        aiApi.getOverview().catch(() => ({ aiScore: 0 }))
      ]);

      if (insightsResponse.success && insightsResponse.data?.insights) {
        // Show only top 2 insights
        setInsights(insightsResponse.data.insights.slice(0, 2));
      } else {
        // Set default insights if API fails
        setInsights([
          {
            type: 'info',
            title: 'Welcome to AI Insights!',
            message: 'Add some expenses to get personalized financial advice.',
            priority: 1
          }
        ]);
      }

      if (overviewResponse.aiScore) {
        setAiScore(overviewResponse.aiScore);
      } else {
        setAiScore(75); // Default score
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      // Set fallback data
      setInsights([
        {
          type: 'info',
          title: 'AI Features Available',
          message: 'Start adding expenses to unlock AI-powered insights!',
          priority: 1
        }
      ]);
      setAiScore(50);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'success': return 'checkmark-circle';
      case 'info': return 'information-circle';
      case 'tip': return 'bulb';
      default: return 'information-circle';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return '#ff6b6b';
      case 'success': return '#51cf66';
      case 'info': return '#339af0';
      case 'tip': return '#ffd43b';
      default: return '#339af0';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#51cf66'; // Great
    if (score >= 60) return '#ffd43b'; // Good
    if (score >= 40) return '#ff9f43'; // Fair
    return '#ff6b6b'; // Poor
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  if (loading) {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading AI insights...</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
          <Text style={styles.title}>AI Financial Insights</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: getScoreColor(aiScore) }]}>
            {getScoreText(aiScore)}
          </Text>
          <Text style={[styles.scoreNumber, { color: getScoreColor(aiScore) }]}>
            {aiScore}/100
          </Text>
        </View>
      </View>

      {insights.length > 0 ? (
        <View style={styles.insightsContainer}>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Ionicons
                name={getInsightIcon(insight.type) as any}
                size={16}
                color={getInsightColor(insight.type)}
              />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightMessage} numberOfLines={2}>
                  {insight.message}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noInsightsContainer}>
          <Ionicons name="analytics" size={32} color={theme.colors.text.secondary} />
          <Text style={styles.noInsightsText}>Add more expenses to get AI insights!</Text>
        </View>
      )}

      <Pressable style={styles.viewAllButton} onPress={onViewAll}>
        <Text style={styles.viewAllText}>View All AI Insights</Text>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
      </Pressable>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  noInsightsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  noInsightsText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
  },
  viewAllText: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});

export default AIInsightsCard;
