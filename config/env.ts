// Environment configuration for different build types

interface AppConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

const isDevelopment = __DEV__;

const developmentConfig: AppConfig = {
  API_BASE_URL: 'http://192.168.1.32:5000/api', // Local development - use computer's IP
  ENVIRONMENT: 'development',
};

const productionConfig: AppConfig = {
  API_BASE_URL: 'https://broku-backend.onrender.com/api', // Your Render backend URL
  ENVIRONMENT: 'production',
};

export const config: AppConfig = isDevelopment ? developmentConfig : productionConfig;

export default config;
