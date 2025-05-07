import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Login, Register } from './pages';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute, AuthCheck } from './routes';
import { tokenService } from './services/api';

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