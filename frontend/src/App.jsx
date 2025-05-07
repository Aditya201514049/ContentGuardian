import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { tokenService } from './services/api';

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

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* This component runs on every route change to enforce authentication */}
        <AuthCheck />
        
        <Routes>
          {/* Protected Routes - Require Authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            {/* Add other protected routes here */}
          </Route>

          {/* Public Routes - Redirect to Home if Authenticated */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Fallback route - redirect to home or login based on auth status */}
          <Route path="*" element={
            <Navigate to={tokenService.isLoggedIn() ? "/" : "/login"} replace />
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;