import axios from 'axios';
import { config } from '../config/env';
import * as FileSystem from 'expo-file-system';

export interface TransactionData {
  date: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category?: string;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  data?: TransactionData[];
  error?: string;
}

export interface SaveTransactionsResponse {
  success: boolean;
  message: string;
  data?: {
    saved: number;
    errors: number;
    errorDetails: string[];
  };
  error?: string;
}

class ImportAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${config.API_BASE_URL}/import`;
  }

  async uploadPdf(fileUri: string, fileName: string): Promise<ImportResponse> {
    try {
      console.log('Reading file as base64:', { fileUri, fileName });
      
      // Check file size first
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists && fileInfo.size) {
        const fileSizeMB = fileInfo.size / (1024 * 1024);
        console.log('File size:', fileSizeMB.toFixed(2), 'MB');
        
        if (fileSizeMB > 10) {
          throw new Error('File too large. Please use a PDF smaller than 10MB.');
        }
      }
      
      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('File read successfully, base64 size:', Math.round(base64Data.length / 1024 / 1024 * 100) / 100, 'MB');
      console.log('Uploading to:', `${this.baseURL}/pdf-base64`);

      const response = await axios.post(`${this.baseURL}/pdf-base64`, {
        pdfData: base64Data,
        fileName: fileName,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 60000, // Increase timeout to 60 seconds for large files
      });

      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
        
        // Handle specific error cases
        if (error.response?.status === 413 || error.response?.data?.error?.includes('too large')) {
          throw new Error('File too large. Please use a PDF smaller than 10MB.');
        }
        
        throw new Error(error.response?.data?.message || `Server error: ${error.response?.status}`);
      }
      
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      
      throw new Error('Network error occurred');
    }
  }

  async saveTransactions(transactions: TransactionData[]): Promise<SaveTransactionsResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/save-transactions`, {
        transactions
      });

      return response.data;
    } catch (error) {
      console.error('Error saving transactions:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to save transactions');
      }
      throw new Error('Network error occurred');
    }
  }
}

export const importApi = new ImportAPI();
