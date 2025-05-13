// userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('@models/User'); 

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user with this email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // *** Role Assignment Logic ***
  // Count existing users to determine if this is the first user
  const userCount = await User.countDocuments();
  let role = 'reader';                // default role for new users
  if (userCount === 0) {
    role = 'admin';                   // first registered user is 'admin'
  }

  // Create new user with the determined role
  const user = await User.create({
    name,
    email,
    password,   // Assume password hashing is handled in the User model pre-save hook
    role        // Set the role field on the user document
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,       // return the assigned role
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Verify user exists and password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate JWT token including the user's role in the payload
    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,       // include role in the response
      token,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private (requires authentication)

const getUserProfile = async (req, res) => {
  try {
    // Changed from req.user._id to req.user.id to match middleware
    const user = await User.findById(req.user.id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Utility function to generate JWT, including user ID and role in payload
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },                     // include role in JWT payload
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Function to update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 1. Find user being updated first
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Double-check current user is still admin
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ 
        message: 'You no longer have admin privileges' 
      });
    }

    // 3. Prevent admin from changing their own role (strict check with multiple comparisons)
    const currentUserId = req.user.id;
    const targetUserId = userToUpdate._id.toString();
    
    if (currentUserId === targetUserId) {
      return res.status(403).json({ 
        message: 'Cannot modify your own role for security reasons' 
      });
    }

    // 4. Validate role
    const validRoles = ['admin', 'author', 'reader'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // 5. If changing an admin to non-admin, check if they're the last admin
    if (userToUpdate.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(403).json({ 
          message: 'Cannot change role: System requires at least one admin' 
        });
      }
    }
    
    // 6. If setting a user to admin, check the total number of admins 
    // (optional: you might want to limit the number of admins)
    if (role === 'admin' && userToUpdate.role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount >= 5) { // Optional: limit to 5 admins max
        return res.status(403).json({
          message: 'Maximum number of admins (5) already reached'
        });
      }
    }

    // 7. Update role if all checks pass
    userToUpdate.role = role;
    await userToUpdate.save();

    res.status(200).json({ 
      message: 'User role updated successfully', 
      user: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role
      }
    });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ 
      message: 'Error updating user role', 
      error: error.message 
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      totalUsers,
      usersByRole
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};

// Function to handle role update
const handleRoleUpdate = async (userId, newRole) => {
  try {
    await api.put(`/auth/update-role/${userId}`, { role: newRole });
    // Refresh the users list
    const response = await api.get('/auth/users');
    setUsers(response.data);
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to update user role';
    setError(errorMessage);
    // Refresh the users list to reset any UI changes
    const response = await api.get('/auth/users');
    setUsers(response.data);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserRole,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserStats,
  handleRoleUpdate
};
