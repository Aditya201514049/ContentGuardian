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
  // req.user is assumed to be set by auth middleware after verifying the token
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,       // include role in the profile response
    });
  } else {
    res.status(404).json({ message: 'User not found' });
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
