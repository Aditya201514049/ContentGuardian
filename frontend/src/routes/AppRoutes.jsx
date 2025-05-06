import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Pages
import Home from '../Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import PostList from '../pages/posts/PostList';

// Route guards
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  return isAdmin ? children : <Navigate to="/" />;
};

const AuthorRoute = ({ children }) => {
  const { isAuthor, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  return isAuthor ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/posts" element={<PostList />} />
      
      {/* Protected Routes - pending implementation */}
      {/* <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />
      <Route path="/posts/new" element={<AuthorRoute><CreatePost /></AuthorRoute>} />
      <Route path="/posts/:id" element={<PostDetail />} />
      <Route path="/posts/:id/edit" element={<AuthorRoute><EditPost /></AuthorRoute>} />
      <Route path="/dashboard/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/dashboard/author" element={<AuthorRoute><AuthorDashboard /></AuthorRoute>} /> */}
      
      {/* 404 Catch All */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes; 