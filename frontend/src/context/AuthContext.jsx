import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, tokenService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on initial load and when token changes
  const verifyAuth = async () => {
    try {
      setLoading(true);
      
      if (!tokenService.getToken()) {
        console.log('No token found during verification');
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      
      console.log('Verifying token...');
      // First try to verify with the backend
      try {
        const { valid, user } = await authService.verifyToken();
        if (valid && user) {
          console.log('Token verified successfully, user:', user);
          setCurrentUser(user);
        } else {
          console.log('Token is not valid');
          tokenService.removeToken();
          setCurrentUser(null);
        }
      } catch (err) {
        // Fallback to /me endpoint if verify endpoint doesn't exist
        try {
          console.log('Falling back to /me endpoint');
          const response = await authService.getCurrentUser();
          console.log('User verification successful:', response.data);
          setCurrentUser(response.data);
        } catch (err) {
          console.error('Error verifying token with /me:', err);
          tokenService.removeToken();
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      tokenService.removeToken();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verify on initial load
  useEffect(() => {
    verifyAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', credentials);
      const response = await authService.login(credentials);
      console.log('Login response:', response.data);
      
      // Set user data - handle different API response formats
      const userData = response.data.user || response.data;
      setCurrentUser(userData);
      
      console.log('Login successful, navigating to home');
      navigate('/');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting registration with:', userData);
      const response = await authService.register(userData);
      console.log('Registration response:', response.data);
      
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out');
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  // Clear error when location changes
  useEffect(() => {
    setError(null);
  }, [location.pathname]);

  // Force verification when route changes
  useEffect(() => {
    if (tokenService.getToken() && !currentUser) {
      console.log('Token exists but no user, verifying again on route change');
      verifyAuth();
    }
  }, [location.pathname]);

  // Debug current authentication state
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated: !!currentUser, 
      user: currentUser,
      loading,
      tokenExists: !!tokenService.getToken()
    });
  }, [currentUser, loading]);

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 