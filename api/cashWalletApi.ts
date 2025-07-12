import { ApiResponse, CashWallet, CashTransaction } from '../types/types';
import { config } from '../config/env';

const API_BASE_URL = `${config.API_BASE_URL}/cash-wallet`;

export const cashWalletApi = {
  // Get or create cash wallet
  getCashWallet: async (): Promise<ApiResponse<CashWallet>> => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cash wallet:', error);
      throw error;
    }
  },

  // Add cash to wallet (rolled up money)
  addCashToWallet: async (amount: number, description?: string): Promise<ApiResponse<CashWallet>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description: description || 'Cash added to wallet'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding cash to wallet:', error);
      throw error;
    }
  },

  // Spend cash from wallet
  spendCashFromWallet: async (
    amount: number, 
    description: string, 
    relatedExpenseId?: string
  ): Promise<ApiResponse<CashWallet>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/spend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          relatedExpenseId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error spending cash from wallet:', error);
      throw error;
    }
  },

  // Withdraw cash from wallet
  withdrawCashFromWallet: async (amount: number, description?: string): Promise<ApiResponse<CashWallet>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description: description || 'Cash withdrawn from wallet'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error withdrawing cash from wallet:', error);
      throw error;
    }
  },

  // Get cash transactions
  getCashTransactions: async (
    limit: number = 50, 
    offset: number = 0, 
    type?: 'add' | 'spend' | 'withdraw'
  ): Promise<ApiResponse<{
    transactions: CashTransaction[];
    totalTransactions: number;
    currentBalance: number;
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }>> => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (type) {
        params.append('type', type);
      }

      const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cash transactions:', error);
      throw error;
    }
  },

  // Update cash balance (for corrections)
  updateCashBalance: async (amount: number, reason?: string): Promise<ApiResponse<{
    wallet: CashWallet;
    previousBalance: number;
    newBalance: number;
    difference: number;
  }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cash balance:', error);
      throw error;
    }
  },

  // Delete a cash transaction
  deleteTransaction: async (transactionId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting cash transaction:', error);
      throw error;
    }
  },
};
