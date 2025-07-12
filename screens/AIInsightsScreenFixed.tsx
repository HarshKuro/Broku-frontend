import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Pressable,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import { aiApi, AIInsight, SpendingPattern, BudgetRecommendation, AIOverview } from '../api/aiApi';

const AIInsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiOverview, setAiOverview] = useState<AIOverview | null>(null);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'patterns' | 'budget' | 'chat'>('insights');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setLoading(true);
      const overview = await aiApi.getOverview();
      setAiOverview(overview);
    } catch (error) {
      console.error('Error loading AI data:', error);
      Alert.alert('Error', 'Failed to load AI insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAIData();
    setRefreshing(false);
  };

  const handleChatQuery = async () => {
    if (!chatQuery.trim()) return;

    try {
      setChatLoading(true);
      const response = await aiApi.chatQuery(chatQuery);
      setChatResponse(response.response || 'Sorry, I couldn\'t process your request.');
      setChatQuery('');
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to process your query. Please try again.');
    } finally {
      setChatLoading(false);
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'trending-up';
      case 'decreasing': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return '#ff6b6b';
      case 'decreasing': return '#51cf66';
      case 'stable': return '#868e96';
      default: return '#868e96';
    }
  };

  const renderTabButton = (tab: string, icon: string, title: string) => (
    <Pressable
      style={[
        styles.tabButton,
        selectedTab === tab && styles.activeTabButton
      ]}
      onPress={() => setSelectedTab(tab as any)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={selectedTab === tab ? theme.colors.primary : theme.colors.text.secondary}
      />
      <Text style={[
        styles.tabText,
        selectedTab === tab && styles.activeTabText
      ]}>
        {title}
      </Text>
    </Pressable>
  );

  const renderInsights = () => (
    <View style={styles.contentContainer}>
      {aiOverview?.insights.map((insight, index) => (
        <GlassCard key={index} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons
              name={getInsightIcon(insight.type) as any}
              size={24}
              color={getInsightColor(insight.type)}
            />
            <Text style={styles.insightTitle}>{insight.title}</Text>
          </View>
          <Text style={styles.insightMessage}>{insight.message}</Text>
          {insight.actionable && insight.action && (
            <Pressable style={[styles.actionButton, { borderColor: getInsightColor(insight.type) }]}>
              <Text style={[styles.actionText, { color: getInsightColor(insight.type) }]}>
                {insight.action}
              </Text>
            </Pressable>
          )}
        </GlassCard>
      ))}
    </View>
  );

  const renderPatterns = () => (
    <View style={styles.contentContainer}>
      {aiOverview?.patterns.map((pattern, index) => (
        <GlassCard key={index} style={styles.patternCard}>
          <View style={styles.patternHeader}>
            <Text style={styles.patternCategory}>{pattern.category}</Text>
            <View style={styles.trendContainer}>
              <Ionicons
                name={getTrendIcon(pattern.trend) as any}
                size={20}
                color={getTrendColor(pattern.trend)}
              />
              <Text style={[styles.trendText, { color: getTrendColor(pattern.trend) }]}>
                {pattern.percentage > 0 ? '+' : ''}{pattern.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
          <Text style={styles.patternAmount}>₹{pattern.amount.toLocaleString()}</Text>
          {pattern.recommendation && (
            <Text style={styles.patternRecommendation}>{pattern.recommendation}</Text>
          )}
        </GlassCard>
      ))}
    </View>
  );

  const renderBudget = () => (
    <View style={styles.contentContainer}>
      {aiOverview?.budgetRecommendations.map((budget, index) => (
        <GlassCard key={index} style={styles.budgetCard}>
          <Text style={styles.budgetCategory}>{budget.category}</Text>
          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Current</Text>
              <Text style={styles.currentSpending}>₹{budget.currentSpending.toLocaleString()}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.text.secondary} />
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Recommended</Text>
              <Text style={styles.recommendedBudget}>₹{budget.recommendedBudget.toLocaleString()}</Text>
            </View>
          </View>
          <Text style={styles.budgetReason}>{budget.reason}</Text>
          {budget.savingsPotential > 0 && (
            <View style={styles.savingsPotential}>
              <Ionicons name="leaf" size={16} color="#51cf66" />
              <Text style={styles.savingsText}>
                Potential savings: ₹{budget.savingsPotential.toLocaleString()}
              </Text>
            </View>
          )}
        </GlassCard>
      ))}
    </View>
  );

  const renderChat = () => (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.chatContent}>
        {chatResponse ? (
          <GlassCard style={styles.chatResponseCard}>
            <View style={styles.chatResponseHeader}>
              <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primary} />
              <Text style={styles.chatResponseTitle}>AI Financial Assistant</Text>
            </View>
            <Text style={styles.chatResponseText}>{chatResponse}</Text>
          </GlassCard>
        ) : (
          <View style={styles.chatPlaceholder}>
            <Ionicons name="chatbubbles" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.chatPlaceholderText}>
              Ask me anything about your finances!
            </Text>
            <Text style={styles.chatExamples}>
              Try: "How can I save more money?" or "Analyze my spending patterns"
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Ask your AI financial assistant..."
          placeholderTextColor={theme.colors.text.secondary}
          value={chatQuery}
          onChangeText={setChatQuery}
          multiline
          maxLength={200}
        />
        <Pressable
          style={[styles.chatSendButton, !chatQuery.trim() && styles.chatSendButtonDisabled]}
          onPress={handleChatQuery}
          disabled={!chatQuery.trim() || chatLoading}
        >
          {chatLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading AI insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Financial Assistant</Text>
        {aiOverview && (
          <View style={styles.aiScore}>
            <Ionicons name="analytics" size={16} color={theme.colors.primary} />
            <Text style={styles.aiScoreText}>Score: {aiOverview.aiScore}/100</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.tabContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {renderTabButton('insights', 'bulb', 'Insights')}
        {renderTabButton('patterns', 'trending-up', 'Patterns')}
        {renderTabButton('budget', 'wallet', 'Budget')}
        {renderTabButton('chat', 'chatbubbles', 'Chat')}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'insights' && renderInsights()}
        {selectedTab === 'patterns' && renderPatterns()}
        {selectedTab === 'budget' && renderBudget()}
        {selectedTab === 'chat' && renderChat()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  aiScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiScoreText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  tabContainer: {
    flexGrow: 0,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  insightCard: {
    marginBottom: 16,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  insightMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  patternCard: {
    marginBottom: 16,
    padding: 16,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  patternAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  patternRecommendation: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  budgetCard: {
    marginBottom: 16,
    padding: 16,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  currentSpending: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  recommendedBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#51cf66',
  },
  budgetReason: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  savingsPotential: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  savingsText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#51cf66',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chatPlaceholderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  chatExamples: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  chatResponseCard: {
    padding: 16,
    marginBottom: 20,
  },
  chatResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatResponseTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  chatResponseText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
    maxHeight: 100,
    marginRight: 12,
  },
  chatSendButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendButtonDisabled: {
    backgroundColor: theme.colors.text.secondary,
  },
});

export default AIInsightsScreen;
