import { NetworkStateManager } from './networkState';
import { OfflineStorageService } from './offlineStorage';
import { SyncService } from './syncService';
import { expenseApi as originalExpenseApi, categoryApi as originalCategoryApi } from '../api/expenseApi';
import { Expense, Category, ExpenseFormData, MonthlySummary, AnalyticsData, InsightsData } from '../types/types';

// Enhanced expense API with offline support
export const offlineExpenseApi = {
  // Get all expenses (try server first, fall back to local storage)
  getAll: async (params?: { month?: number; year?: number; category?: string }): Promise<Expense[]> => {
    try {
      if (NetworkStateManager.isOnline()) {
        const expenses = await originalExpenseApi.getAll(params);
        // Cache the data locally
        await OfflineStorageService.saveExpenses(expenses);
        return expenses;
      } else {
        console.log('Offline: Loading expenses from local storage');
        const expenses = await OfflineStorageService.getExpenses();
        
        // Apply filters locally if provided
        if (params) {
          return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const matchesMonth = !params.month || expenseDate.getMonth() + 1 === params.month;
            const matchesYear = !params.year || expenseDate.getFullYear() === params.year;
            const matchesCategory = !params.category || expense.category === params.category;
            
            return matchesMonth && matchesYear && matchesCategory;
          });
        }
        
        return expenses;
      }
    } catch (error) {
      console.log('Failed to fetch from server, falling back to local storage');
      return await OfflineStorageService.getExpenses();
    }
  },

  // Get expense by ID
  getById: async (id: string): Promise<Expense | null> => {
    try {
      if (NetworkStateManager.isOnline()) {
        return await originalExpenseApi.getById(id);
      } else {
        const expenses = await OfflineStorageService.getExpenses();
        return expenses.find(e => e._id === id) || null;
      }
    } catch (error) {
      const expenses = await OfflineStorageService.getExpenses();
      return expenses.find(e => e._id === id) || null;
    }
  },

  // Create new expense
  create: async (expenseData: Omit<ExpenseFormData, 'amount'> & { amount: number }): Promise<Expense> => {
    if (NetworkStateManager.isOnline()) {
      try {
        const expense = await originalExpenseApi.create(expenseData);
        await OfflineStorageService.addExpense(expense);
        return expense;
      } catch (error) {
        // If server request fails, store locally and sync later
        return await this.createOffline(expenseData);
      }
    } else {
      return await this.createOffline(expenseData);
    }
  },

  // Create expense offline
  createOffline: async (expenseData: Omit<ExpenseFormData, 'amount'> & { amount: number }): Promise<Expense> => {
    const localId = OfflineStorageService.generateLocalId();
    const now = new Date().toISOString();
    
    const expense: Expense = {
      _id: localId,
      category: expenseData.category,
      amount: expenseData.amount,
      date: expenseData.date.toISOString(),
      note: expenseData.note,
      type: expenseData.type || 'expense',
      createdAt: now,
      updatedAt: now,
    };

    await OfflineStorageService.addExpense(expense);
    
    // Add to pending sync operations
    await OfflineStorageService.addPendingSyncOperation({
      id: OfflineStorageService.generateLocalId(),
      type: 'CREATE',
      entity: 'expense',
      data: expenseData,
      localId: localId,
    });

    console.log('Expense created offline, will sync when online');
    return expense;
  },

  // Update expense
  update: async (id: string, expenseData: Partial<Omit<ExpenseFormData, 'amount'> & { amount: number }>): Promise<Expense> => {
    if (NetworkStateManager.isOnline()) {
      try {
        const expense = await originalExpenseApi.update(id, expenseData);
        await OfflineStorageService.updateExpense(id, expense);
        return expense;
      } catch (error) {
        // If server request fails, store update locally and sync later
        return await this.updateOffline(id, expenseData);
      }
    } else {
      return await this.updateOffline(id, expenseData);
    }
  },

  // Update expense offline
  updateOffline: async (id: string, expenseData: Partial<Omit<ExpenseFormData, 'amount'> & { amount: number }>): Promise<Expense> => {
    const expenses = await OfflineStorageService.getExpenses();
    const existingExpense = expenses.find(e => e._id === id);
    
    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    const updatedExpense: Expense = {
      ...existingExpense,
      ...expenseData,
      date: expenseData.date ? expenseData.date.toISOString() : existingExpense.date,
      updatedAt: new Date().toISOString(),
    };

    await OfflineStorageService.updateExpense(id, updatedExpense);
    
    // Add to pending sync operations (only if it's not a local-only item)
    if (!id.startsWith('local_')) {
      await OfflineStorageService.addPendingSyncOperation({
        id: OfflineStorageService.generateLocalId(),
        type: 'UPDATE',
        entity: 'expense',
        data: updatedExpense,
      });
    }

    console.log('Expense updated offline, will sync when online');
    return updatedExpense;
  },

  // Delete expense
  delete: async (id: string): Promise<void> => {
    await OfflineStorageService.deleteExpense(id);
    
    if (NetworkStateManager.isOnline()) {
      try {
        await originalExpenseApi.delete(id);
      } catch (error) {
        // If server request fails, add to pending sync operations
        if (!id.startsWith('local_')) {
          await OfflineStorageService.addPendingSyncOperation({
            id: OfflineStorageService.generateLocalId(),
            type: 'DELETE',
            entity: 'expense',
            data: { _id: id },
          });
        }
      }
    } else {
      // Add to pending sync operations (only if it's not a local-only item)
      if (!id.startsWith('local_')) {
        await OfflineStorageService.addPendingSyncOperation({
          id: OfflineStorageService.generateLocalId(),
          type: 'DELETE',
          entity: 'expense',
          data: { _id: id },
        });
      }
    }

    console.log('Expense deleted, will sync deletion when online');
  },

  // Get monthly summary (calculated locally when offline)
  getMonthlySummary: async (month: number, year: number): Promise<MonthlySummary> => {
    if (NetworkStateManager.isOnline()) {
      try {
        return await originalExpenseApi.getMonthlySummary(month, year);
      } catch (error) {
        // Fall back to local calculation
        return await this.calculateMonthlySummaryOffline(month, year);
      }
    } else {
      return await this.calculateMonthlySummaryOffline(month, year);
    }
  },

  // Calculate monthly summary offline
  calculateMonthlySummaryOffline: async (month: number, year: number): Promise<MonthlySummary> => {
    const expenses = await OfflineStorageService.getExpenses();
    
    // Filter expenses for the given month and year
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    });

    // Group by category
    const categoryWise = monthlyExpenses.reduce((acc, expense) => {
      const existingCategory = acc.find(c => c._id === expense.category);
      if (existingCategory) {
        existingCategory.totalAmount += expense.amount;
        existingCategory.count += 1;
      } else {
        acc.push({
          _id: expense.category,
          totalAmount: expense.amount,
          count: 1,
        });
      }
      return acc;
    }, [] as { _id: string; totalAmount: number; count: number }[]);

    // Calculate total
    const total = {
      total: monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      count: monthlyExpenses.length,
    };

    // Create period info
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0).toISOString();

    return {
      categoryWise,
      total,
      period: {
        month,
        year,
        startDate,
        endDate,
      },
    };
  },

  // Get analytics (simplified offline version)
  getAnalytics: async (period: 'week' | 'month' | 'lastMonth' = 'month'): Promise<AnalyticsData> => {
    if (NetworkStateManager.isOnline()) {
      try {
        return await originalExpenseApi.getAnalytics(period);
      } catch (error) {
        // Return a basic analytics structure
        return {
          totalExpenses: 0,
          totalCategories: 0,
          averagePerDay: 0,
          topCategories: [],
          dailySpending: [],
        };
      }
    } else {
      // Return a basic analytics structure
      return {
        totalExpenses: 0,
        totalCategories: 0,
        averagePerDay: 0,
        topCategories: [],
        dailySpending: [],
      };
    }
  },

  // Get insights (simplified offline version)
  getInsights: async (): Promise<InsightsData> => {
    if (NetworkStateManager.isOnline()) {
      try {
        return await originalExpenseApi.getInsights();
      } catch (error) {
        // Return basic insights structure
        return {
          monthlyTrend: 'stable',
          topSpendingCategory: '',
          budgetStatus: 'unknown',
          savings: 0,
        };
      }
    } else {
      // Return basic insights structure
      return {
        monthlyTrend: 'stable',
        topSpendingCategory: '',
        budgetStatus: 'unknown',
        savings: 0,
      };
    }
  },
};

// Enhanced category API with offline support
export const offlineCategoryApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      if (NetworkStateManager.isOnline()) {
        const categories = await originalCategoryApi.getAll();
        await OfflineStorageService.saveCategories(categories);
        return categories;
      } else {
        console.log('Offline: Loading categories from local storage');
        return await OfflineStorageService.getCategories();
      }
    } catch (error) {
      console.log('Failed to fetch categories from server, falling back to local storage');
      return await OfflineStorageService.getCategories();
    }
  },

  // Create category
  create: async (name: string): Promise<Category> => {
    if (NetworkStateManager.isOnline()) {
      try {
        const category = await originalCategoryApi.create(name);
        await OfflineStorageService.addCategory(category);
        return category;
      } catch (error) {
        return await this.createOffline(name);
      }
    } else {
      return await this.createOffline(name);
    }
  },

  // Create category offline
  createOffline: async (name: string): Promise<Category> => {
    const localId = OfflineStorageService.generateLocalId();
    const now = new Date().toISOString();
    
    const category: Category = {
      _id: localId,
      name,
      createdAt: now,
      updatedAt: now,
    };

    await OfflineStorageService.addCategory(category);
    
    // Add to pending sync operations
    await OfflineStorageService.addPendingSyncOperation({
      id: OfflineStorageService.generateLocalId(),
      type: 'CREATE',
      entity: 'category',
      data: { name },
      localId: localId,
    });

    console.log('Category created offline, will sync when online');
    return category;
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await OfflineStorageService.deleteCategory(id);
    
    if (NetworkStateManager.isOnline()) {
      try {
        await originalCategoryApi.delete(id);
      } catch (error) {
        // If server request fails, add to pending sync operations
        if (!id.startsWith('local_')) {
          await OfflineStorageService.addPendingSyncOperation({
            id: OfflineStorageService.generateLocalId(),
            type: 'DELETE',
            entity: 'category',
            data: { _id: id },
          });
        }
      }
    } else {
      // Add to pending sync operations (only if it's not a local-only item)
      if (!id.startsWith('local_')) {
        await OfflineStorageService.addPendingSyncOperation({
          id: OfflineStorageService.generateLocalId(),
          type: 'DELETE',
          entity: 'category',
          data: { _id: id },
        });
      }
    }

    console.log('Category deleted, will sync deletion when online');
  },
};
