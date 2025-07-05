import axios from 'axios';
import { Expense, Category, ApiResponse, MonthlySummary, ExpenseFormData, AnalyticsData, InsightsData } from '../types/types';
import { config } from '../config/env';

// Configure base URL using environment configuration
const BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout for Render hibernation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API response error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Network error - backend might be hibernating or unreachable');
    }
    
    if (error.response?.status === 503) {
      console.error('Service unavailable - backend is hibernating, please wait...');
    }
    
    return Promise.reject(error);
  }
);

// Utility function to wake up hibernating backend
const wakeUpBackend = async (): Promise<boolean> => {
  try {
    console.log('Waking up backend...');
    await api.get('/health', { timeout: 60000 });
    console.log('Backend is awake!');
    return true;
  } catch (error) {
    console.error('Failed to wake up backend:', error);
    return false;
  }
};

// Retry wrapper for API calls
const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      
      // If it's a network error or 503, try to wake up backend
      if ((error.code === 'NETWORK_ERROR' || error.response?.status === 503) && i < retries) {
        console.log('Backend appears to be hibernating, attempting to wake up...');
        await wakeUpBackend();
        // Wait a bit more for the backend to fully start
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Max retries exceeded');
};

// Expense API functions
export const expenseApi = {
  // Get all expenses with optional filtering
  getAll: async (params?: { month?: number; year?: number; category?: string }): Promise<Expense[]> => {
    return withRetry(async () => {
      const response = await api.get<ApiResponse<Expense[]>>('/expenses', { params });
      return response.data.data || [];
    });
  },

  // Get expense by ID
  getById: async (id: string): Promise<Expense | null> => {
    try {
      const response = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching expense by ID:', error);
      throw error;
    }
  },

  // Create new expense
  create: async (expenseData: Omit<ExpenseFormData, 'amount'> & { amount: number }): Promise<Expense> => {
    try {
      const response = await api.post<ApiResponse<Expense>>('/expenses', expenseData);
      return response.data.data!;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  // Update expense
  update: async (id: string, expenseData: Partial<Omit<ExpenseFormData, 'amount'> & { amount: number }>): Promise<Expense> => {
    try {
      const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, expenseData);
      return response.data.data!;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  // Delete expense
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/expenses/${id}`);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Get monthly summary
  getMonthlySummary: async (month: number, year: number): Promise<MonthlySummary> => {
    try {
      const response = await api.get<ApiResponse<MonthlySummary>>('/expenses/summary', {
        params: { month, year }
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async (period: 'week' | 'month' | 'lastMonth' = 'month'): Promise<AnalyticsData> => {
    try {
      const response = await api.get<ApiResponse<AnalyticsData>>('/expenses/analytics', {
        params: { period }
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get insights data
  getInsights: async (): Promise<InsightsData> => {
    try {
      const response = await api.get<ApiResponse<InsightsData>>('/expenses/insights');
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  },
};

// Category API functions
export const categoryApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    return withRetry(async () => {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data.data || [];
    });
  },

  // Create new category
  create: async (name: string): Promise<Category> => {
    return withRetry(async () => {
      const response = await api.post<ApiResponse<Category>>('/categories', { name });
      return response.data.data!;
    });
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    return withRetry(async () => {
      await api.delete(`/categories/${id}`);
    });
  }
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.success;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
