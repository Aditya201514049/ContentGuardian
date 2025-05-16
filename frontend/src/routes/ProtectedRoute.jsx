import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenService } from '../services/api';
import userService from '../services/user';
import { useEffect, useState } from 'react';

// Protects routes that require authentication
// Redirects to login if user is not authenticated
// More resilient to backend availability issues
const ProtectedRoute = () => {
  const { isAuthenticated, loading, currentUser, verifyAuth } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  const hasUserData = userService.hasUser();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Effect to verify auth state only once on initial load
  useEffect(() => {
    // Only verify on initial load to avoid unnecessary backend calls
    if (!initialLoadComplete) {
      const checkAuth = async () => {
        // If we have a token or user data in storage, trust it first
        if (hasToken || hasUserData) {
          console.log('Protected route: Found stored credentials, considering authenticated');
          setInitialLoadComplete(true);
        } 
        // If absolutely no token or user data, redirect to login
        else if (!hasToken && !hasUserData && !isAuthenticated && !currentUser) {
          console.log(`Protected route (${location.pathname}) accessed without any auth data, redirecting to login`);
          setRedirecting(true);
          setInitialLoadComplete(true);
        }
      };
      
      checkAuth();
    }
  }, [hasToken, hasUserData, isAuthenticated, currentUser, location.pathname, initialLoadComplete]);

  // Show loading spinner only during initial authentication check
  if ((loading && !initialLoadComplete) || redirecting) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // More resilient authentication check
  // Trust stored tokens and user data, especially for remote backends
  if (!isAuthenticated && !hasToken && !hasUserData && !currentUser) {
    // Keep track of where the user was trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;