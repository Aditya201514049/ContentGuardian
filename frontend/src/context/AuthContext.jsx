import { createContext, useState, useEffect, useContext } from 'react';
import { authService, tokenService } from '../services/api';
import userService from '../services/user';
import { useNavigate, useLocation } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

// Auth state keys in sessionStorage
const AUTH_STATE_KEY = 'auth_state';

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => userService.getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Update user state and persist it
  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    userService.setUser(user);
    
    // Also store auth state in sessionStorage to persist across page refreshes
    sessionStorage.setItem(AUTH_STATE_KEY, !!user ? 'authenticated' : 'unauthenticated');
  };

  // Check if user is logged in on initial load and when token changes
  const verifyAuth = async () => {
    try {
      setLoading(true);
      
      // First, check if we already have the user in session
      const sessionUser = userService.getUser();
      if (sessionUser) {
        console.log('User found in session storage', sessionUser);
        updateCurrentUser(sessionUser);
        setLoading(false);
        return;
      }
      
      if (!tokenService.isLoggedIn()) {
        console.log('No valid token found during verification');
        updateCurrentUser(null);
        setLoading(false);
        return;
      }
      
      console.log('Verifying token with backend...');
      
      // Try to verify with the backend
      try {
        const { valid, user } = await authService.verifyToken();
        if (valid && user) {
          console.log('Token verified successfully, user:', user);
          updateCurrentUser(user);
        } else {
          console.log('Token is not valid');
          tokenService.removeToken();
          userService.clearUser();
          updateCurrentUser(null);
        }
      } catch (err) {
        // Fallback to /me endpoint if verify endpoint doesn't exist
        try {
          console.log('Falling back to /me endpoint');
          const response = await authService.getCurrentUser();
          console.log('User verification successful:', response.data);
          updateCurrentUser(response.data);
        } catch (err) {
          console.error('Error verifying token with /me:', err);
          tokenService.removeToken();
          userService.clearUser();
          updateCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      tokenService.removeToken();
      userService.clearUser();
      updateCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verify on initial load
  useEffect(() => {
    verifyAuth();
    
    // Set up event listener for auth state changes across tabs
    const handleStorageChange = (e) => {
      if (e.key === AUTH_STATE_KEY && e.newValue !== e.oldValue) {
        console.log('Auth state changed in another tab, reloading...');
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
      updateCurrentUser(userData);
      
      // Refresh token timestamp to extend session
      tokenService.refreshToken();
      
      // Get the redirect path from location state or default to home
      const from = location.state?.from || '/';
      console.log(`Login successful, navigating to ${from}`);
      navigate(from, { replace: true });
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
    tokenService.removeToken();
    userService.clearUser();
    updateCurrentUser(null);
    navigate('/login');
  };

  // Clear error when location changes
  useEffect(() => {
    setError(null);
  }, [location.pathname]);

  // Refresh token data periodically to keep session alive
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        console.log('Refreshing token timestamp');
        tokenService.refreshToken();
      }, 15 * 60 * 1000); // every 15 minutes
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Debug current authentication state
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated: !!currentUser, 
      user: currentUser,
      userRole: currentUser?.role,
      loading,
      tokenExists: tokenService.isLoggedIn()
    });
  }, [currentUser, loading]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && location.pathname === '/admin/dashboard') {
      console.log('Admin user navigated to admin dashboard');
    }
  }, [currentUser, location.pathname]);

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    verifyAuth // Expose verify function to force refresh when needed
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