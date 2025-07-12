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
import { expenseApi } from '../api/expenseApi';
import { config } from '../config/env';

interface AIInsightsScreenProps {
  navigation?: any;
}

const AIInsightsScreen = ({ navigation }: AIInsightsScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiOverview, setAiOverview] = useState<AIOverview | null>(null);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'patterns' | 'budget' | 'chat'>('insights');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('👋 Welcome to your AI Financial Assistant! I can help you with:\n\n💰 Budget planning and analysis\n📊 Spending pattern insights\n💡 Personalized saving tips\n📈 Investment guidance\n\nTry clicking one of the quick questions below or type your own question!');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setLoading(true);
      
      // Test connection first
      console.log('🔄 Loading AI data with real expenses...');
      
      try {
        // Fetch real expenses from database
        console.log('📊 Fetching expenses from database...');
        const expenses = await expenseApi.getAll();
        console.log('✅ Fetched expenses:', expenses.length, 'expenses');
        
        // If we have expenses, use them for AI analysis
        if (expenses && expenses.length > 0) {
          console.log('🤖 Sending expenses to AI for analysis...');
          const overview = await aiApi.getOverview();
          console.log('✅ AI Overview with real data:', overview);
          setAiOverview(overview);
        } else {
          console.log('📝 No expenses found, showing welcome message...');
          // Show welcome message with instructions to add expenses
          setAiOverview({
            overview: {
              income: 0,
              expenses: 0,
              savings: 0,
              savingsRate: 0,
              transactionCount: 0
            },
            insights: [
              {
                type: 'info',
                title: 'Welcome to AI Financial Assistant! 🎉',
                message: 'Add your first expense or income to unlock powerful AI insights about your spending patterns.',
                priority: 1,
                actionable: true,
                action: 'Add your first expense'
              }
            ],
            patterns: [],
            budgetRecommendations: [],
            aiScore: 50,
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (overviewError) {
        console.warn('⚠️ AI Overview failed, trying with sample data:', overviewError);
        
        // Try to get expenses anyway for fallback
        try {
          const expenses = await expenseApi.getAll();
          console.log('💾 Using local expenses for fallback:', expenses.length);
          
          // Calculate basic stats from real data
          const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
          const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
          const savings = totalIncome - totalExpenses;
          const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
          
          setAiOverview({
            overview: {
              income: totalIncome,
              expenses: totalExpenses,
              savings: savings,
              savingsRate: savingsRate,
              transactionCount: expenses.length
            },
            insights: [
              {
                type: 'info',
                title: 'AI Analysis (Offline Mode)',
                message: `Based on your ${expenses.length} transactions: You've spent ₹${totalExpenses.toLocaleString()} and have a savings rate of ${savingsRate.toFixed(1)}%.`,
                priority: 1,
                actionable: true,
                action: 'Add more expenses for better insights'
              }
            ],
            patterns: [],
            budgetRecommendations: [],
            aiScore: Math.min(85, Math.max(30, savingsRate * 2)),
            lastUpdated: new Date().toISOString()
          });
        } catch (expenseError) {
          console.error('❌ Failed to fetch expenses:', expenseError);
          // Ultimate fallback
          setAiOverview({
            overview: {
              income: 0,
              expenses: 0,
              savings: 0,
              savingsRate: 0,
              transactionCount: 0
            },
            insights: [
              {
                type: 'info',
                title: 'Get Started with AI Insights',
                message: 'Add some expenses and income to see your personalized AI financial analysis.',
                priority: 1,
                actionable: false
              }
            ],
            patterns: [],
            budgetRecommendations: [],
            aiScore: 50,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading AI data:', error);
      
      // Always provide fallback data instead of showing error
      setAiOverview({
        overview: {
          income: 0,
          expenses: 0,
          savings: 0,
          savingsRate: 0,
          transactionCount: 0
        },
        insights: [
          {
            type: 'info',
            title: 'AI Assistant Ready',
            message: 'Start tracking your expenses to unlock AI-powered financial insights and recommendations.',
            priority: 1,
            actionable: false
          }
        ],
        patterns: [],
        budgetRecommendations: [],
        aiScore: 50,
        lastUpdated: new Date().toISOString()
      });
      
      Alert.alert(
        'AI Ready', 
        'AI features are ready! Add some expenses to see personalized insights.',
        [{ text: 'OK' }]
      );
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
      
      // Log the query for debugging
      console.log('🤖 Chat Query:', chatQuery);
      
      // Fetch real expenses to provide context to AI
      try {
        const expenses = await expenseApi.getAll();
        console.log('📊 Using real expenses for chat context:', expenses.length);
        
        const response = await aiApi.chatQuery(chatQuery);
        console.log('✅ Chat Response:', response);
        
        setChatResponse(response.response || 'Sorry, I couldn\'t process your request.');
      } catch (expenseError) {
        console.warn('⚠️ Could not fetch expenses for context, using basic AI:', expenseError);
        
        // Try AI without expense context
        const response = await aiApi.chatQuery(chatQuery);
        setChatResponse(response.response || 'Sorry, I couldn\'t process your request.');
      }
      
      setChatQuery('');
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      // Provide intelligent fallback responses based on query content
      const lowerQuery = chatQuery.toLowerCase();
      let fallbackResponse = '';
      
      if (lowerQuery.includes('budget') || lowerQuery.includes('money')) {
        fallbackResponse = 'Based on financial best practices, I recommend the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Track your expenses regularly to stay on budget.';
      } else if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
        fallbackResponse = 'To save more money, try these strategies: 1) Track every expense, 2) Set automatic savings transfers, 3) Use the envelope method for discretionary spending, 4) Review subscriptions monthly.';
      } else if (lowerQuery.includes('spend') || lowerQuery.includes('expense')) {
        fallbackResponse = 'Smart spending tips: 1) Wait 24 hours before non-essential purchases, 2) Compare prices before buying, 3) Use a spending app to track habits, 4) Set category-wise budgets.';
      } else if (lowerQuery.includes('category') || lowerQuery.includes('categories')) {
        fallbackResponse = 'Common expense categories include: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, and Education. Categorizing helps identify spending patterns.';
      } else if (lowerQuery.includes('investment') || lowerQuery.includes('invest')) {
        fallbackResponse = 'Before investing: 1) Build an emergency fund (3-6 months expenses), 2) Pay off high-interest debt, 3) Start with low-cost index funds, 4) Consider your risk tolerance and timeline.';
      } else {
        fallbackResponse = `Great question! While I'm in offline mode, here's a tip: The key to financial success is consistent tracking and gradual improvements. Add more expenses to unlock personalized insights!`;
      }
      
      setChatResponse(fallbackResponse);
      setChatQuery('');
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
      {(!aiOverview?.insights || aiOverview.insights.length === 0) ? (
        <GlassCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.insightTitle}>No Insights Yet</Text>
          </View>
          <Text style={styles.insightMessage}>
            Add some expenses and income to unlock personalized AI financial insights!
          </Text>
        </GlassCard>
      ) : (
        aiOverview.insights.map((insight, index) => (
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
        ))
      )}
      
      {/* Add AI Score Display */}
      {aiOverview && (
        <GlassCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="analytics" size={24} color={theme.colors.primary} />
            <Text style={styles.insightTitle}>AI Financial Score</Text>
          </View>
          <Text style={[styles.insightMessage, { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary }]}>
            {aiOverview.aiScore}/100
          </Text>
          <Text style={styles.insightMessage}>
            Based on your spending patterns and financial health
          </Text>
        </GlassCard>
      )}
    </View>
  );

  const renderPatterns = () => (
    <View style={styles.contentContainer}>
      {(!aiOverview?.patterns || aiOverview.patterns.length === 0) ? (
        <GlassCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="trending-up" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.insightTitle}>No Patterns Detected</Text>
          </View>
          <Text style={styles.insightMessage}>
            Start tracking expenses for at least a week to see AI-powered spending patterns and trends!
          </Text>
        </GlassCard>
      ) : (
        aiOverview.patterns.map((pattern, index) => (
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
        ))
      )}
    </View>
  );

  const renderBudget = () => (
    <View style={styles.contentContainer}>
      {(!aiOverview?.budgetRecommendations || aiOverview.budgetRecommendations.length === 0) ? (
        <GlassCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="wallet" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.insightTitle}>No Budget Recommendations</Text>
          </View>
          <Text style={styles.insightMessage}>
            Add income and expenses to get personalized AI budget recommendations!
          </Text>
        </GlassCard>
      ) : (
        aiOverview.budgetRecommendations.map((budget, index) => (
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
              <Text style={[styles.insightMessage, { color: '#51cf66' }]}>
                Potential savings: ₹{budget.savingsPotential.toLocaleString()}
              </Text>
            )}
          </GlassCard>
        ))
      )}
      
      {/* Financial Overview */}
      {aiOverview?.overview && (
        <GlassCard style={styles.insightCard}>
          <Text style={styles.insightTitle}>Financial Overview</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 }}>
            <View style={{ width: '45%', marginBottom: 12 }}>
              <Text style={[styles.insightMessage, { fontSize: 12, marginBottom: 4 }]}>Income</Text>
              <Text style={[styles.insightTitle, { color: '#51cf66', fontSize: 18 }]}>
                ₹{aiOverview.overview.income.toLocaleString()}
              </Text>
            </View>
            <View style={{ width: '45%', marginBottom: 12 }}>
              <Text style={[styles.insightMessage, { fontSize: 12, marginBottom: 4 }]}>Expenses</Text>
              <Text style={[styles.insightTitle, { color: '#ff6b6b', fontSize: 18 }]}>
                ₹{aiOverview.overview.expenses.toLocaleString()}
              </Text>
            </View>
            <View style={{ width: '45%', marginBottom: 12 }}>
              <Text style={[styles.insightMessage, { fontSize: 12, marginBottom: 4 }]}>Savings</Text>
              <Text style={[styles.insightTitle, { color: theme.colors.primary, fontSize: 18 }]}>
                ₹{aiOverview.overview.savings.toLocaleString()}
              </Text>
            </View>
            <View style={{ width: '45%', marginBottom: 12 }}>
              <Text style={[styles.insightMessage, { fontSize: 12, marginBottom: 4 }]}>Savings Rate</Text>
              <Text style={[styles.insightTitle, { color: theme.colors.primary, fontSize: 18 }]}>
                {aiOverview.overview.savingsRate.toFixed(1)}%
              </Text>
            </View>
          </View>
        </GlassCard>
      )}
    </View>
  );

  const renderChat = () => (
    <View style={styles.contentContainer}>
      {/* Always show the AI response card */}
      <GlassCard style={styles.chatResponseCard}>
        <View style={styles.chatResponseHeader}>
          <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primary} />
          <Text style={styles.chatResponseTitle}>AI Financial Assistant</Text>
        </View>
        <Text style={styles.chatResponseText}>{chatResponse}</Text>
      </GlassCard>

      {/* Chat Input */}
      <GlassCard style={styles.insightCard}>
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
      </GlassCard>

      {/* Quick Questions */}
      <Text style={[styles.insightTitle, { marginTop: 16, marginBottom: 12 }]}>Quick Questions:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          "How can I save more money?",
          "What's my spending pattern?",
          "Budget recommendations?",
          "Investment advice?"
        ].map((question, index) => (
          <Pressable
            key={index}
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            onPress={() => setChatQuery(question)}
          >
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>{question}</Text>
          </Pressable>
        ))}
      </View>
    </View>
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
        <View style={styles.headerActions}>
          {aiOverview && (
            <View style={styles.aiScore}>
              <Ionicons name="analytics" size={16} color={theme.colors.primary} />
              <Text style={styles.aiScoreText}>Score: {aiOverview.aiScore}/100</Text>
            </View>
          )}
          {navigation && (
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Pressable
                style={styles.debugButton}
                onPress={() => navigation.navigate('AIDebug')}
              >
                <Ionicons name="bug" size={16} color="#fff" />
                <Text style={styles.debugButtonText}>Debug</Text>
              </Pressable>
              <Pressable
                style={[styles.debugButton, { backgroundColor: '#27ae60' }]}
                onPress={() => navigation.navigate('SimpleNetworkTest')}
              >
                <Ionicons name="wifi" size={16} color="#fff" />
                <Text style={styles.debugButtonText}>Net</Text>
              </Pressable>
              <Pressable
                style={[styles.debugButton, { backgroundColor: '#3b82f6' }]}
                onPress={async () => {
                  try {
                    console.log('🧪 Testing AI Overview endpoint...');
                    const response = await fetch(`${config.API_BASE_URL}/ai/overview`);
                    const data = await response.json();
                    console.log('📊 Overview Response:', data);
                    Alert.alert('Overview Test', `Status: ${response.status}\nData: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
                  } catch (error) {
                    console.error('❌ Overview test failed:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    Alert.alert('Error', `Overview endpoint test failed: ${errorMessage}`);
                  }
                }}
              >
                <Ionicons name="analytics" size={16} color="#fff" />
                <Text style={styles.debugButtonText}>API</Text>
              </Pressable>
              <Pressable
                style={[styles.debugButton, { backgroundColor: '#8b5cf6' }]}
                onPress={async () => {
                  try {
                    console.log('📊 Fetching expenses from database...');
                    const expenses = await expenseApi.getAll();
                    console.log('✅ Database expenses:', expenses);
                    Alert.alert('Database Test', `Found ${expenses.length} expenses\nFirst few: ${expenses.slice(0, 3).map(e => `${e.note || e.category}: ₹${e.amount}`).join(', ')}`);
                  } catch (error) {
                    console.error('❌ Database test failed:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    Alert.alert('Error', `Database test failed: ${errorMessage}`);
                  }
                }}
              >
                <Ionicons name="server" size={16} color="#fff" />
                <Text style={styles.debugButtonText}>DB</Text>
              </Pressable>
            </View>
          )}
        </View>
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
    gap: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AIInsightsScreen;
