const express = require('express');
const { registerUser, loginUser, updateUserRole, getUserProfile } = require('@controllers/authController');
const verifyToken = require('@middleware/authMiddleware');
const authorizeRoles = require('@middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getUserProfile);

// Test protected route
router.get('/admin-only', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.send('Hello Admin');
});

// Route to update user role (Admin only)
router.put('/update-role/:id', verifyToken, authorizeRoles('admin'), updateUserRole);

module.exports = router;
