import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenService } from '../services/api';

// Protects routes that require authentication
// Redirects to login if user is not authenticated
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check both for isAuthenticated and token presence
  // This helps prevent flashes of protected content
  if (!isAuthenticated && !hasToken) {
    console.log('Protected route: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 