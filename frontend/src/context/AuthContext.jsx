import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have a token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Store the token in localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await response.json();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
      // If we can't fetch the profile, clear the token
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        // Try to parse error response as JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        } catch (parseError) {
          // If parsing fails, use the status text
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      // Handle network errors
      const errorMessage = err.message === 'Failed to fetch' 
        ? 'Unable to connect to the server. Please check if the backend is running.'
        : err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        // Try to parse error response as JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        } catch (parseError) {
          // If parsing fails, use the status text
          throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      // Handle network errors
      const errorMessage = err.message === 'Failed to fetch' 
        ? 'Unable to connect to the server. Please check if the backend is running.'
        : err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateUserRole = async (userId, role) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/auth/update-role/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      const data = await response.json();
      // If we're updating our own user, update the local state
      if (user && user._id === userId) {
        setUser({ ...user, role: role });
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      updateUserRole,
      isAdmin: user?.role === 'admin',
      isAuthor: user?.role === 'author' || user?.role === 'admin',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 