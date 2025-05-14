import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Login, Register, AdminDashboard, Profile } from './pages';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute, AuthCheck, AdminRoute } from './routes';
import { tokenService } from './services/api';
import MyPostsPage from './pages/MyPostsPage';

// Import Post Components
import PostsList from './components/posts/PostsList';
import PostDetail from './components/posts/PostDetail';
import CreatePostForm from './components/posts/CreatePostForm';
import RoleRoute from './components/auth/RoleRoute';

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
            <Route path="/profile" element={<Profile />} />
            <Route path="/posts" element={<PostsList />} />
            <Route path="/posts/:id" element={<PostDetail />} />
          </Route>
          
          {/* Role-based Routes - Require Admin or Author Role */}
          <Route element={<RoleRoute allowedRoles={['admin', 'author']} />}>
            <Route path="/create-post" element={<CreatePostForm />} />
            <Route path="/edit-post/:id" element={<CreatePostForm />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
          </Route>

          {/* Admin Routes - Require Admin Role */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
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