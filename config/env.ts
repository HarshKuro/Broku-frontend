// Environment configuration for different build types

interface AppConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

const isDevelopment = __DEV__;

// Get the appropriate base URL based on the platform
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    // Running in web browser
    return 'http://localhost:5000/api';
  } else {
    // Running on device - use the computer's IP
    return 'http://192.168.1.32:5000/api';
  }
};

const developmentConfig: AppConfig = {
  API_BASE_URL: getApiBaseUrl(),
  ENVIRONMENT: 'development',
};

const productionConfig: AppConfig = {
  API_BASE_URL: 'https://expense-tracker-backend.onrender.com/api', // Your Render backend URL
  ENVIRONMENT: 'production',
};

export const config: AppConfig = isDevelopment ? developmentConfig : productionConfig;

export default config;
