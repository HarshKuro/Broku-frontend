export interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
  type: 'income' | 'expense';
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  category: string;
  amount: string;
  date: Date;
  note: string;
  type?: 'income' | 'expense';
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface MonthlySummary {
  categoryWise: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
  total: {
    total: number;
    count: number;
  };
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsData {
  summary: {
    income: number;
    expense: number;
    balance: number;
    period: string;
  };
  expensesByCategory: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
  timeBreakdown: {
    _id: {
      date: string;
      type: string;
    };
    totalAmount: number;
    count: number;
  }[];
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
}

export interface InsightsData {
  currentMonth: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
  lastMonth: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
  topCategory?: {
    _id: string;
    totalAmount: number;
    count: number;
  };
  recentHighExpense?: Expense;
}

export interface CashTransaction {
  _id: string;
  type: 'add' | 'spend' | 'withdraw';
  amount: number;
  description: string;
  date: string;
  relatedExpenseId?: string;
}

export interface CashWallet {
  _id: string;
  totalCash: number;
  transactions: CashTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CashWalletFormData {
  amount: string;
  description: string;
  type: 'add' | 'spend' | 'withdraw';
}

export type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
  AddIncome: undefined;
  History: undefined;
  AddCategory: undefined;
  Summary: undefined;
  Analytics: undefined;
  Insights: undefined;
  AIInsights: undefined;
  Main: undefined;
  CashWallet: undefined;
  AddCash: undefined;
  SpendCash: undefined;
  Import: undefined;
};
