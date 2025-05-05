const express = require('express');
const { createPost, getPosts, updatePost, deletePost, addComment } = require('@controllers/postController');
const verifyToken = require('@middleware/authMiddleware');
const authorizeRoles = require('@middleware/roleMiddleware');

const router = express.Router();

// Blog routes
router.post('/', verifyToken, authorizeRoles('admin', 'author'), createPost); // Admin and Author can create posts
router.get('/', getPosts); // Everyone can view posts
router.put('/:id', verifyToken, authorizeRoles('admin', 'author'), updatePost); // Admin and Author can update posts
router.delete('/:id', verifyToken, authorizeRoles('admin'), deletePost); // Only Admin can delete posts

// Comment routes
router.post('/:id/comments', verifyToken, authorizeRoles('admin', 'author', 'reader'), addComment); // All roles can add comments

module.exports = router;