// Environment configuration for different build types

interface AppConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

const isDevelopment = __DEV__;

const developmentConfig: AppConfig = {
  API_BASE_URL: 'http://localhost:3000/api', // Local development
  ENVIRONMENT: 'development',
};

const productionConfig: AppConfig = {
  API_BASE_URL: 'https://expense-tracker-backend.onrender.com/api', // Your Render backend URL
  ENVIRONMENT: 'production',
};

export const config: AppConfig = isDevelopment ? developmentConfig : productionConfig;

export default config;
