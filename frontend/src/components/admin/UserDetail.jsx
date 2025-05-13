import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserDetail = ({ userId, onClose, onUserUpdated }) => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/auth/users/${userId}`);
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        });
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear any existing error messages
    setError(null);
    setErrorPopup({ show: false, message: '' });
    
    try {
      // Prevent updating own role
      if (userId === currentUser?._id) {
        setErrorPopup({
          show: true,
          message: 'For security reasons, you cannot change your own role.'
        });
        return;
      }
      
      // Update role using the existing endpoint
      await api.put(`/auth/update-role/${userId}`, { role: formData.role });
      
      // Notify parent component that the user was updated
      if (onUserUpdated) {
        onUserUpdated();
      }
      
      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
      
      // Handle all API errors with the popup for better UX
      let errorMessage = 'Failed to update user';
      
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = err.response.data?.message || 'You do not have permission to perform this action.';
        } else {
          errorMessage = err.response.data?.message || `Request failed with status code ${err.response.status}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show in popup instead of error alert
      setErrorPopup({
        show: true,
        message: errorMessage
      });
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );

  // Only show the error container for non-API errors
  if (error) return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Render error popup for API errors (including 403s)
  const renderErrorPopup = () => {
    if (!errorPopup.show) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-[60]">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Error</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{errorPopup.message}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setErrorPopup({ show: false, message: '' })}
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      {renderErrorPopup()}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">User Details</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={userId === currentUser?._id}
            >
              <option value="reader">Reader</option>
              <option value="author">Author</option>
              <option value="admin">Admin</option>
            </select>
            {userId === currentUser?._id && (
              <p className="text-red-500 text-xs italic mt-1">
                For security reasons, you cannot change your own role.
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUserUpdated: PropTypes.func
};

export default UserDetail;