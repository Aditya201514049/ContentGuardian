import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenService } from '../services/api';
import userService from '../services/user';
import { useEffect, useState } from 'react';

// For routes like login/register that should redirect to home if user is already logged in
const PublicRoute = () => {
  const { isAuthenticated, loading, currentUser, verifyAuth } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  const hasUserData = userService.hasUser();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  
  // Effect to force verification of auth status when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!checked) {
        if (hasToken || hasUserData) {
          // Force verification when needed
          await verifyAuth();
        }
        setChecked(true);
      }
    };
    
    checkAuthStatus();
  }, [hasToken, hasUserData, checked, verifyAuth]);
  
  // Show loading spinner while checking authentication
  if (loading || !checked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Determine if user should be considered authenticated
  const userIsAuthenticated = isAuthenticated || currentUser || hasToken || hasUserData;
  
  // Redirect to home if already authenticated
  if (userIsAuthenticated) {
    console.log(`Public route (${location.pathname}): User is authenticated, redirecting to home`);
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default PublicRoute; 