export interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
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

export type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
  History: undefined;
  AddCategory: undefined;
  Summary: undefined;
};
