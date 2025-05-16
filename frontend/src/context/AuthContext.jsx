import { createContext, useState, useEffect, useContext } from 'react';
import { authService, tokenService } from '../services/api';
import userService from '../services/user';
import { useNavigate, useLocation } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

// Auth state keys in localStorage and sessionStorage
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
    
    // Store auth state in both localStorage and sessionStorage
    // Using localStorage ensures persistence when closing the tab
    localStorage.setItem(AUTH_STATE_KEY, !!user ? 'authenticated' : 'unauthenticated');
    sessionStorage.setItem(AUTH_STATE_KEY, !!user ? 'authenticated' : 'unauthenticated');
  };

  // Check if user is logged in on initial load and when token changes
  const verifyAuth = async () => {
    try {
      setLoading(true);
      const authState = localStorage.getItem(AUTH_STATE_KEY) || sessionStorage.getItem(AUTH_STATE_KEY);
      
      // First, check if we already have the user in local/session storage
      const storedUser = userService.getUser();
      if (storedUser) {
        console.log('User found in storage', storedUser);
        updateCurrentUser(storedUser);
        
        // Even if we have a user, verify with backend in the background
        // but don't block the UI with loading state
        setLoading(false);
        
        // Background verification
        setTimeout(() => {
          verifyTokenWithBackend(storedUser);
        }, 500); // Small delay to prioritize UI rendering
        
        return;
      }
      
      if (!tokenService.isLoggedIn()) {
        console.log('No valid token found during verification');
        updateCurrentUser(null);
        setLoading(false);
        return;
      }
      
      // If we have a token but no user data, try to get user data from backend
      console.log('Token found but no user data, verifying with backend...');
      verifyTokenWithBackend();
    } catch (err) {
      console.error('Auth verification error:', err);
      tokenService.removeToken();
      userService.clearUser();
      updateCurrentUser(null);
      setLoading(false);
    }
  };
  
  // Backend verification with better handling of backend wake-up delay
  // and more resilient to network failures when offline
  const verifyTokenWithBackend = async (fallbackUser = null) => {
    let backendVerified = false;
    const verifyStartTime = Date.now();
    
    // If we have fallback user data and a token, consider authenticated by default
    // This ensures we don't lose auth state when backend is unavailable
    if (fallbackUser && tokenService.isLoggedIn()) {
      console.log('Using stored user data as primary auth source');
      setLoading(false);
      
      // Still try backend verification in the background without affecting UI
      setTimeout(() => {
        performBackgroundVerification(fallbackUser);
      }, 500);
      
      return;
    }
    
    try {
      console.log('Verifying token with backend...');
      
      // Try to verify with the backend with timeout handling
      const verifyPromise = authService.verifyToken();
      
      // Set a timeout to handle the case where backend is waking up (for free tier)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          if (fallbackUser && !backendVerified) {
            // If we have a fallback user and backend is taking too long
            console.log('Backend verification taking too long, keeping stored user data');
            // IMPORTANT: We don't reject here, just return, allowing the stored data to be used
            return;
          }
          reject(new Error('Backend verification timeout after 5 seconds'));
        }, 5000); // 5 seconds timeout (increased from 3s)
      });
      
      // Race the verification against the timeout
      const { valid, user } = await Promise.race([verifyPromise, timeoutPromise]);
      backendVerified = true;
      
      if (valid && user) {
        console.log('Token verified successfully, user:', user);
        updateCurrentUser(user);
      } else if (fallbackUser) {
        // If verification failed but we have fallback user data, keep using it
        console.log('Backend verification returned invalid token but using fallback user data');
        // Don't clear credentials when we have a fallback
      } else {
        console.log('Token is not valid and no fallback user available');
        tokenService.removeToken();
        userService.clearUser();
        updateCurrentUser(null);
      }
    } catch (err) {
      console.log('Error during backend verification, attempting fallbacks...', err.message);
      
      // If we already have fallback user data, use it and don't clear credentials
      if (fallbackUser) {
        console.log('Using fallback user data due to backend error');
        // Keep the stored credentials - don't clear anything!
        setLoading(false);
        return;
      }
      
      // Only try /me endpoint if we don't have fallback data
      if (!fallbackUser) {
        try {
          console.log('Trying /me endpoint');
          const response = await authService.getCurrentUser();
          console.log('User verification successful via /me:', response.data);
          updateCurrentUser(response.data);
        } catch (meErr) {
          console.error('Error verifying with /me:', meErr);
          
          // If we have a token but verification failed, assume network/backend issue
          // and don't clear credentials, only when truly no auth data is found
          if (!tokenService.isLoggedIn() && !userService.hasUser()) {
            console.log('No valid auth data found, clearing credentials');
            tokenService.removeToken();
            userService.clearUser();
            updateCurrentUser(null);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Background verification that never clears auth data on failure
  const performBackgroundVerification = async (fallbackUser) => {
    try {
      console.log('Performing background verification...');
      const { valid, user } = await authService.verifyToken();
      
      if (valid && user) {
        // Only update user data if verification succeeds
        console.log('Background verification successful, updating user data');
        updateCurrentUser(user);
      } else {
        console.log('Background verification failed, keeping existing user data');
        // Do NOT clear user data or token - assume it's a backend issue, not an auth issue
      }
    } catch (err) {
      console.log('Background verification error, keeping existing user data', err.message);
      // Intentionally do nothing on error - keep using existing data
    }
  };

  // Verify on initial load
  useEffect(() => {
    // Immediately set user from stored data to avoid UI flicker
    const storedUser = userService.getUser();
    if (storedUser) {
      console.log('Setting initial user from storage', storedUser);
      setCurrentUser(storedUser);
      // Auth verification will happen in the background
    }
    
    // Start verification process
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
      // Refresh the token immediately to extend the timestamp
      tokenService.refreshToken();
      
      // Set up a refresh interval
      const interval = setInterval(() => {
        console.log('Refreshing token timestamp');
        tokenService.refreshToken();
      }, 30 * 60 * 1000); // every 30 minutes
      
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