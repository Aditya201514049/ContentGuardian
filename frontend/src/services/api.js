import axios from 'axios';
import config from '../config';

// Create an axios instance with default config
const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token handling functions
const tokenService = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isLoggedIn: () => !!localStorage.getItem('token')
};

// Request interceptor - automatically attach the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug info
      console.log(`Request to ${config.url} with auth token`);
    } else {
      console.log(`Request to ${config.url} without auth token`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common response errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url} successful:`, response.status);
    return response;
  },
  (error) => {
    console.error(`API Error:`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle 401 Unauthorized errors (typically expired tokens)
    if (error.response && error.response.status === 401) {
      tokenService.removeToken();
      console.error('Authentication error: Token expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

// Try different auth endpoint paths based on common patterns
const tryAuthEndpoints = async (path, data, method = 'post') => {
  // Common endpoint variations
  const endpoints = [
    path,                           // e.g. /auth/login
    path.replace('/auth', ''),      // e.g. /login
    path.replace('/auth', '/api'),  // e.g. /api/login
    path.replace('/auth', '/user')  // e.g. /user/login
  ];
  
  let lastError = null;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      if (method === 'post') {
        return await api.post(endpoint, data);
      } else if (method === 'get') {
        return await api.get(endpoint);
      }
    } catch (error) {
      lastError = error;
      console.log(`Endpoint ${endpoint} failed:`, error.response?.status || error.message);
      
      // If we get a 404, try the next endpoint
      // If we get anything else (401, 400, etc.), it means the endpoint exists but there's another issue
      if (error.response && error.response.status !== 404) {
        throw error; // Re-throw if it's not a 404
      }
    }
  }
  
  // If we reach here, all endpoints failed
  throw lastError || new Error('All endpoints failed');
};

// Auth services
export const authService = {
  login: async (credentials) => {
    try {
      // Try different possible login endpoints
      const response = await tryAuthEndpoints('/auth/login', credentials);
      
      const token = response.data.token || response.data.accessToken || response.data.access_token;
      
      if (token) {
        tokenService.setToken(token);
        console.log('Token saved after login');
      } else {
        console.error('No token received in login response. Response:', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      return await tryAuthEndpoints('/auth/register', userData);
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  },
  
  logout: () => {
    tokenService.removeToken();
    console.log('Token removed during logout');
  },
  
  getCurrentUser: async () => {
    try {
      return await tryAuthEndpoints('/auth/me', null, 'get');
    } catch (error) {
      console.error('Get current user error:', error);
      tokenService.removeToken();
      throw error;
    }
  },

  // Check if the token is valid
  verifyToken: async () => {
    try {
      if (!tokenService.getToken()) {
        return { valid: false };
      }
      
      try {
        const response = await tryAuthEndpoints('/auth/verify', null, 'get');
        return { valid: true, user: response.data };
      } catch (error) {
        // Try the /me endpoint as a fallback
        try {
          const meResponse = await tryAuthEndpoints('/auth/me', null, 'get');
          return { valid: true, user: meResponse.data };
        } catch (innerError) {
          tokenService.removeToken();
          return { valid: false, error: innerError };
        }
      }
    } catch (error) {
      tokenService.removeToken();
      return { valid: false, error };
    }
  }
};

// Example of other services you might add
export const contentService = {
  getContent: () => api.get('/content'),
  createContent: (data) => api.post('/content', data),
  updateContent: (id, data) => api.put(`/content/${id}`, data),
  deleteContent: (id) => api.delete(`/content/${id}`)
};

// Export both the API and token service
export { tokenService };
export default api; 