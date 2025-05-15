import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tokenService } from '../../services/api';
import ThemeToggle from '../common/ThemeToggle';
import ThemeIndicator from '../common/ThemeIndicator';

const Layout = ({ children }) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const hasToken = tokenService.isLoggedIn();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      setMobileMenuOpen(false);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Determine if user should be considered authenticated
  const userIsAuthenticated = isAuthenticated || hasToken;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Content Guardian</Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Home</Link>
              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'author') && (
                <>
                  <Link to="/create-post" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Create Post</Link>
                  <Link to="/my-posts" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">My Posts</Link>
                </>
              )}
            </nav>

            {/* Theme Toggle and Mobile Menu Button */}
            <div className="flex items-center">
              {/* Theme Toggle */}
              <div className="mr-4">
                <ThemeToggle />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Burger Icon */}
                  {!mobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    /* Close/X Icon */
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Desktop user menu */}
            <div className="hidden md:flex items-center space-x-4">
              {userIsAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {currentUser?.name || 'User'}
                  </Link>
                  {currentUser?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="#"
                    onClick={handleLogout}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    Logout
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 z-20" onClick={toggleMobileMenu}></div>
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl z-30 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Menu</h2>
                  <button
                    type="button"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={toggleMobileMenu}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="flex flex-col space-y-4">
                  {userIsAuthenticated && (
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800 dark:text-white">
                            {currentUser?.name || 'User'}
                          </div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {currentUser?.role || 'User'}
                          </div>
                        </div>
                      </div>

                      {/* Theme toggle in mobile menu */}
                      <div className="flex items-center mt-4">
                        <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">Theme:</span>
                        <ThemeToggle />
                      </div>
                    </div>
                  )}

                  <Link to="/" className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    Home
                  </Link>

                  {currentUser && (currentUser.role === 'admin' || currentUser.role === 'author') && (
                    <>
                      <Link to="/create-post" className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        Create Post
                      </Link>
                      <Link to="/my-posts" className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        My Posts
                      </Link>
                    </>
                  )}

                  {currentUser?.role === 'admin' && (
                    <Link to="/admin" className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      Dashboard
                    </Link>
                  )}

                  {userIsAuthenticated ? (
                    <>
                      <Link to="/profile" className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-base font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        Sign In
                      </Link>
                      <Link to="/register" className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        Register
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="pt-16 dark:text-white">{children}</main>
      <footer className="bg-gray-800 dark:bg-gray-900 text-white">
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
      <ThemeIndicator />
    </div>
  );
};

export default Layout;