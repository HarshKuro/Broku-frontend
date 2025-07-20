import axios from 'axios';
import { config } from '../config/env';

const BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AIInsight {
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  message: string;
  priority: number;
  actionable?: boolean;
  action?: string;
}

export interface SpendingPattern {
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  amount: number;
  recommendation?: string;
}

export interface BudgetRecommendation {
  category: string;
  currentSpending: number;
  recommendedBudget: number;
  reason: string;
  savingsPotential: number;
}

export interface AIOverview {
  overview: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    transactionCount: number;
  };
  insights: AIInsight[];
  patterns: SpendingPattern[];
  budgetRecommendations: BudgetRecommendation[];
  aiScore: number;
  lastUpdated: string;
}

export const aiApi = {
  // Smart expense categorization
  categorizeExpense: async (description: string, amount: number) => {
    try {
      const response = await api.post('/ai/categorize', { description, amount });
      return response.data;
    } catch (error) {
      console.error('AI categorization error:', error);
      throw error;
    }
  },

  // Get AI financial insights
  getInsights: async (timeframe: 'week' | 'month' = 'month') => {
    try {
      const response = await api.get(`/ai/insights?timeframe=${timeframe}`);
      return response.data; // Returns {success: true, data: {...}}
    } catch (error) {
      console.error('AI insights error:', error);
      throw error;
    }
  },

  // Get spending patterns
  getSpendingPatterns: async () => {
    try {
      const response = await api.get('/ai/patterns');
      return response.data; // Returns {success: true, data: {...}}
    } catch (error) {
      console.error('AI patterns error:', error);
      throw error;
    }
  },

  // Get budget recommendations
  getBudgetRecommendations: async (income?: number) => {
    try {
      const url = income ? `/ai/budget-recommendations?income=${income}` : '/ai/budget-recommendations';
      const response = await api.get(url);
      return response.data; // Returns {success: true, data: {...}}
    } catch (error) {
      console.error('AI budget recommendations error:', error);
      throw error;
    }
  },

  // AI Chat Assistant
  chatQuery: async (query: string) => {
    try {
      const response = await api.post('/ai/chat', { query });
      return response.data; // Returns {success: true, data: {...}}
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  // Get AI overview dashboard
  getOverview: async (): Promise<AIOverview> => {
    try {
      const response = await api.get('/ai/overview');
      return response.data.data; // Assuming the API returns { success: true, data: AIOverview }
    } catch (error) {
      console.error('AI overview error:', error);
      throw error;
    }
  }
};
