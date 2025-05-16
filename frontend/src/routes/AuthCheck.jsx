import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// AuthCheck component to force redirect based on authentication state
const AuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, initialCheckDone } = useAuth();
  const redirectedRef = useRef(false);
  
  useEffect(() => {
    // Only proceed with redirects if the initial auth check is done
    // and we haven't already redirected during this component mount
    if (initialCheckDone && !redirectedRef.current) {
      // If authenticated and trying to access auth pages, redirect to home
      if (isAuthenticated && 
          (location.pathname === '/login' || location.pathname === '/register')) {
        console.log('User authenticated, redirecting from auth page to home');
        redirectedRef.current = true;
        navigate('/', { replace: true });
        return;
      }
      
      // If not authenticated and trying to access protected pages, redirect to login
      if (!isAuthenticated && 
          location.pathname !== '/login' && 
          location.pathname !== '/register') {
        console.log('User not authenticated, redirecting to login');
        redirectedRef.current = true;
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      
      // If we reach here, no redirect was needed
      redirectedRef.current = true;
    }
  }, [isAuthenticated, initialCheckDone, location.pathname, navigate]);
  
  return null;
};

export default AuthCheck;