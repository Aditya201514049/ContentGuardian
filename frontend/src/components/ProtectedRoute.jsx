import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenService } from '../services/api';
import { useEffect, useState } from 'react';

// Protects routes that require authentication
// Redirects to login if user is not authenticated
const ProtectedRoute = () => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  
  // Effect to forcefully check authentication on route changes
  useEffect(() => {
    const checkAuth = async () => {
      // If no token or authenticated user, prepare to redirect
      if (!hasToken && !isAuthenticated && !currentUser) {
        console.log(`Protected route (${location.pathname}) accessed without auth, redirecting to login`);
        setRedirecting(true);
      }
    };
    
    checkAuth();
  }, [hasToken, isAuthenticated, currentUser, location.pathname]);
  
  // Show loading spinner while checking authentication
  if (loading || redirecting) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check authentication status strictly - need at least one of these to be true
  if (!isAuthenticated && !hasToken && !currentUser) {
    // Keep track of where the user was trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 