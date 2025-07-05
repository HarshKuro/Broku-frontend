import axios from 'axios';
import { Expense, Category, ApiResponse, MonthlySummary, ExpenseFormData } from '../types/types';

// Configure base URL - Update this with your actual backend URL
const BASE_URL = 'http://192.168.0.206:5000/api'; // Updated with your local IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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
    return Promise.reject(error);
  }
);

// Expense API functions
export const expenseApi = {
  // Get all expenses with optional filtering
  getAll: async (params?: { month?: number; year?: number; category?: string }): Promise<Expense[]> => {
    try {
      const response = await api.get<ApiResponse<Expense[]>>('/expenses', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
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
  }
};

// Category API functions
export const categoryApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create new category
  create: async (name: string): Promise<Category> => {
    try {
      const response = await api.post<ApiResponse<Category>>('/categories', { name });
      return response.data.data!;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
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
