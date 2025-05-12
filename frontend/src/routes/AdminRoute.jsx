import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenService } from '../services/api';
import { useEffect, useState } from 'react';

/**
 * Protects routes that require admin role
 * Redirects to home if user is not authenticated or not an admin
 */
const AdminRoute = () => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  const location = useLocation();
  
  // Debug output to help diagnose issues
  console.log('AdminRoute - Auth state:', { 
    isAuthenticated, 
    hasToken, 
    currentUser, 
    userRole: currentUser?.role,
    path: location.pathname
  });
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Checking permissions...</p>
      </div>
    );
  }
  
  // Check admin role - redirect to home if not admin
  if (!isAuthenticated || !currentUser) {
    console.log('AdminRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  if (currentUser.role !== 'admin') {
    console.log('AdminRoute - Not admin role, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  console.log('AdminRoute - Admin access granted');
  return <Outlet />;
};

export default AdminRoute;
