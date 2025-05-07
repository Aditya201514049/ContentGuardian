import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenService } from '../services/api';

// For routes like login/register that should redirect to home if user is already logged in
const PublicRoute = () => {
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
  
  // Redirect to home if already authenticated or has valid token
  if (isAuthenticated || hasToken) {
    console.log('Public route: User is authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default PublicRoute; 