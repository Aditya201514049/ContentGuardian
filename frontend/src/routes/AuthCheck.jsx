import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokenService } from '../services/api';

// AuthCheck component to force redirect based on token presence
const AuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // If there's a token and trying to access auth pages, redirect to home
    if (tokenService.isLoggedIn() && 
        (location.pathname === '/login' || location.pathname === '/register')) {
      console.log('Token detected, redirecting from auth page to home');
      navigate('/', { replace: true });
    }
    
    // If there's no token and trying to access protected pages, redirect to login
    if (!tokenService.isLoggedIn() && 
        location.pathname !== '/login' && 
        location.pathname !== '/register') {
      console.log('No token detected, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  return null;
};

export default AuthCheck; 