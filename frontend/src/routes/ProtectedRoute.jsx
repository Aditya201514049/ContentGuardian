import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenService } from '../services/api';
import userService from '../services/user';
import { useEffect, useState } from 'react';

// Protects routes that require authentication
// Redirects to login if user is not authenticated
// Prevents flickering between authenticated and non-authenticated states
const ProtectedRoute = () => {
  const { isAuthenticated, loading, currentUser, initialCheckDone } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  const hasUserData = userService.hasUser();
  const location = useLocation();
  
  // Trust either the context auth state or local storage data
  const userIsAuthenticated = isAuthenticated || hasToken || hasUserData || !!currentUser;

  // Log the authentication state for debugging
  useEffect(() => {
    console.log('ProtectedRoute auth state:', {
      isAuthenticated,
      hasToken,
      hasUserData,
      currentUser: !!currentUser,
      initialCheckDone,
      userIsAuthenticated
    });
  }, [isAuthenticated, hasToken, hasUserData, currentUser, initialCheckDone, userIsAuthenticated]);

  // Only show loading spinner during initial load and only if no auth data exists yet
  // This prevents flickering for authenticated users
  if (loading && !initialCheckDone && !userIsAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Only redirect if we've completed the initial check and user is definitely not authenticated
  if (initialCheckDone && !userIsAuthenticated) {
    console.log(`Protected route (${location.pathname}): No auth data, redirecting to login`);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;