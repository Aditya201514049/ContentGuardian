// User data service for storing and retrieving user information

const USER_KEY = 'current_user';

const userService = {
  // Store user data in session storage
  setUser: (userData) => {
    if (!userData) {
      sessionStorage.removeItem(USER_KEY);
      return;
    }
    
    try {
      const userStr = JSON.stringify(userData);
      sessionStorage.setItem(USER_KEY, userStr);
      console.log('User data stored in session', userData);
    } catch (e) {
      console.error('Error storing user data:', e);
    }
  },
  
  // Get user data from session storage
  getUser: () => {
    try {
      const userStr = sessionStorage.getItem(USER_KEY);
      if (!userStr) return null;
      
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error retrieving user data:', e);
      return null;
    }
  },
  
  // Remove user data from session storage
  clearUser: () => {
    sessionStorage.removeItem(USER_KEY);
    console.log('User data removed from session');
  },
  
  // Check if user is stored in session
  hasUser: () => {
    return !!sessionStorage.getItem(USER_KEY);
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