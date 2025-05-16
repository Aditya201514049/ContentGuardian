// User data service for storing and retrieving user information

const USER_KEY = 'current_user';

const userService = {
  // Store user data in localStorage for persistence across tab closures
  setUser: (userData) => {
    if (!userData) {
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY); // Clear from both storages
      return;
    }
    
    try {
      const userStr = JSON.stringify(userData);
      localStorage.setItem(USER_KEY, userStr);
      sessionStorage.setItem(USER_KEY, userStr); // Also keep in session for compatibility
      console.log('User data stored in localStorage', userData);
    } catch (e) {
      console.error('Error storing user data:', e);
    }
  },
  
  // Get user data from localStorage with sessionStorage fallback
  getUser: () => {
    try {
      const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      if (!userStr) return null;
      
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error retrieving user data:', e);
      return null;
    }
  },
  
  // Remove user data from both storages
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    console.log('User data removed from all storages');
  },
  
  // Check if user is stored in localStorage or sessionStorage
  hasUser: () => {
    return !!(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY));
  },
  
  // Update specific user properties
  updateUser: (updates) => {
    try {
      const userData = userService.getUser();
      if (!userData) return;
      
      const updatedUser = { ...userData, ...updates };
      userService.setUser(updatedUser);
      console.log('User data updated', updatedUser);
      return updatedUser;
    } catch (e) {
      console.error('Error updating user data:', e);
    }
  }
};

export default userService;