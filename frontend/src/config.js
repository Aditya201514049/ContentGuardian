// Configuration settings for the application
const config = {
  // API URL based on environment - using proxy for development
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://contentguardian-nyfj.onrender.com/api' 
    : '/api', // This will use the proxy in vite.config.js
    
  // Direct backend URL for debugging
  DIRECT_API_URL: 'https://contentguardian-nyfj.onrender.com/api',
    
  // Other configuration settings
  APP_NAME: 'ContentGuardian',
  TOKEN_KEY: 'auth_token',
};

export default config; 