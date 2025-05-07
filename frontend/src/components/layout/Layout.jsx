import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tokenService } from '../../services/api';

const Layout = ({ children }) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  const navigate = useNavigate();

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasToken) {
      console.log('Layout detected unauthenticated access, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, hasToken, navigate]);

  // Handle logout with confirmation
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  // Determine if user should be considered authenticated
  const userIsAuthenticated = isAuthenticated || hasToken;

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">Content Guardian</Link>
            </div>
            <nav className="hidden md:flex space-x-10">
              <Link to="/" className="text-gray-500 hover:text-gray-900">Home</Link>
              <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
              <a href="#about" className="text-gray-500 hover:text-gray-900">About</a>
            </nav>
            <div className="flex items-center space-x-4">
              {userIsAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {currentUser?.name || 'User'}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-lg font-semibold">Content Guardian</h2>
              <p className="mt-2 text-sm text-gray-300">
                The ultimate solution for content moderation and analysis.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Product
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#features" className="text-sm text-gray-300 hover:text-white">Features</a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-sm text-gray-300 hover:text-white">Pricing</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#about" className="text-sm text-gray-300 hover:text-white">About</a>
                  </li>
                  <li>
                    <a href="#contact" className="text-sm text-gray-300 hover:text-white">Contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex justify-between">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Content Guardian. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 