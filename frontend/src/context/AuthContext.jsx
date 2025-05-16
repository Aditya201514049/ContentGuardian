import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { authService, tokenService } from '../services/api';
import userService from '../services/user';
import { useNavigate, useLocation } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

// Auth state keys in localStorage
const AUTH_STATE_KEY = 'auth_state';

// Provider component
export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage immediately to prevent flicker
  const [currentUser, setCurrentUser] = useState(() => userService.getUser());
  const [loading, setLoading] = useState(false); // Start with loading false to avoid initial flicker
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const verifyingRef = useRef(false); // Track if verification is already in progress

  // Update user state and persist it
  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    userService.setUser(user);
    
    // Store auth state in localStorage to persist across tab closures
    localStorage.setItem(AUTH_STATE_KEY, !!user ? 'authenticated' : 'unauthenticated');
  };

  // Check if user is logged in on initial load and when token changes
  const verifyAuth = async (forceCheck = false) => {
    // Prevent concurrent verifications to avoid race conditions
    if (verifyingRef.current) {
      console.log('Auth verification already in progress, skipping');
      return;
    }
    
    // Set verification in progress
    verifyingRef.current = true;
    
    // Don't set loading true during initial page load to prevent flicker
    // Only set loading if this is a manual verification
    if (forceCheck) {
      setLoading(true);
    }
    
    try {
      // First, check if we already have the user in localStorage
      const storedUser = userService.getUser();
      const hasToken = tokenService.isLoggedIn();
      
      // If we have a stored user, trust it and avoid backend verification on initial load
      if (storedUser && !forceCheck) {
        console.log('User found in storage, using cached data', storedUser);
        setCurrentUser(storedUser); // Safely set user without causing additional storage operations
        setInitialCheckDone(true);
        setLoading(false);
        verifyingRef.current = false;
        return;
      }
      
      // If we have no token at all, clear any stale user data
      if (!hasToken) {
        console.log('No valid token found during verification');
        if (currentUser) { // Only update if needed to avoid re-rendering
          updateCurrentUser(null);
        }
        setInitialCheckDone(true);
        verifyingRef.current = false;
        setLoading(false);
        return;
      }
      
      // Only verify with backend if: 
      // 1. We have a token but no user data, or
      // 2. This is a forced check, or
      // 3. Initial check hasn't been done yet
      if (hasToken && (!storedUser || forceCheck || !initialCheckDone)) {
        console.log('Verifying token with backend...');
        try {
          const { valid, user } = await authService.verifyToken();
          if (valid && user) {
            console.log('Token verified successfully');
            updateCurrentUser(user);
          } else {
            console.log('Token verification failed');
            tokenService.removeToken();
            userService.clearUser();
            updateCurrentUser(null);
          }
        } catch (err) {
          console.error('Token verification error:', err);
          // If this is not a forced check, and we have a stored user, keep using it
          if (!forceCheck && storedUser) {
            console.log('Using stored user despite verification failure');
            // Don't clear existing user data when backend is unreachable
            setCurrentUser(storedUser); // Safely set current user without triggering storage operations
          } else {
            // Only clear auth when we don't have a stored user or this is a manual check
            tokenService.removeToken();
            userService.clearUser();
            updateCurrentUser(null);
          }
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err);
    } finally {
      setInitialCheckDone(true);
      setLoading(false);
      verifyingRef.current = false; // Reset verification flag
    }
  };
  
  // Handle long backend cold starts by implementing a ping function
  const pingBackend = async () => {
    if (!initialCheckDone) {
      try {
        // Simple ping to wake up backend - don't wait for response
        authService.ping().catch(() => {}); // Ignore errors
      } catch (err) {
        // Ignore errors
      }
    }
  };

  // Verify on initial load - with much simpler approach to avoid flickering
  useEffect(() => {
    console.log('Auth provider mounted');
    
    // Early return if we already have user data to avoid unnecessary checks
    const storedUser = userService.getUser();
    const hasToken = tokenService.isLoggedIn();
    
    // Set initial state based on localStorage without backend verification
    if (storedUser && hasToken) {
      setCurrentUser(storedUser);
      setInitialCheckDone(true);
      
      // Ping backend in the background but don't wait for response
      pingBackend();
      
      // Schedule a delayed verification to validate the token in the background
      // This will happen after initial render, preventing flickering
      const delayedVerify = setTimeout(() => {
        verifyAuth(false);
      }, 2000); // Longer delay to ensure UI is stabilized first
      
      // Set up event listener for auth state changes across tabs
      const handleStorageChange = (e) => {
        if (e.key === AUTH_STATE_KEY && e.newValue !== e.oldValue) {
          console.log('Auth state changed in another tab, reloading...');
          window.location.reload();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        clearTimeout(delayedVerify);
        window.removeEventListener('storage', handleStorageChange);
      };
    } else {
      // If no stored user or token, do immediate verification but without loading state
      pingBackend();
      
      // Slight delay to avoid race conditions with component mounting
      const timer = setTimeout(() => {
        verifyAuth(false); // Don't force check on initial load
      }, 100);
      
      // Set up event listener for auth state changes across tabs
      const handleStorageChange = (e) => {
        if (e.key === AUTH_STATE_KEY && e.newValue !== e.oldValue) {
          console.log('Auth state changed in another tab, reloading...');
          window.location.reload();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
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
    initialCheckDone, // Let components know if initial check is complete
    verifyAuth // Expose verify function for manual refresh
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