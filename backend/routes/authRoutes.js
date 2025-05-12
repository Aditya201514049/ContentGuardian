const express = require('express');
const { registerUser, loginUser, updateUserRole, getUserProfile } = require('@controllers/authController');
const verifyToken = require('@middleware/authMiddleware');
const authorizeRoles = require('@middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getUserProfile);

//Admin specific actions
router.get('/users', verifyToken, authorizeRoles('admin'), getAllUsers);
router.get('/users/:id', verifyToken, authorizeRoles('admin'), getUserById);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUser);
router.get('/stats', verifyToken, authorizeRoles('admin'), getUserStats);

// Test protected route
router.get('/admin-only', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.send('Hello Admin');
});

// Route to update user role (Admin only)
router.put('/update-role/:id', verifyToken, authorizeRoles('admin'), updateUserRole);

module.exports = router;
