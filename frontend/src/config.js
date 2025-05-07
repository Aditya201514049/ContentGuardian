// Configuration settings for the application
const config = {
  // API URL based on environment
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com/api' 
    : 'http://localhost:5000/api',
    
  // Other configuration settings
  APP_NAME: 'ContentGuardian',
  TOKEN_KEY: 'auth_token',
};

export default config; 