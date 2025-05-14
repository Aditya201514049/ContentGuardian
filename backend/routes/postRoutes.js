const express = require('express');
const { createPost, getPosts, getPostById, updatePost, deletePost, addComment, deleteComment } = require('@controllers/postController');
const verifyToken = require('@middleware/authMiddleware');
const authorizeRoles = require('@middleware/roleMiddleware');

const router = express.Router();

// Blog routes
router.post('/', verifyToken, authorizeRoles('admin', 'author'), createPost); // Admin and Author can create posts
router.get('/', getPosts); // Everyone can view posts
router.get('/:id', getPostById); // Everyone can view a single post
router.put('/:id', verifyToken, authorizeRoles('admin', 'author'), updatePost); // Admin and Author can update posts
router.delete('/:id', verifyToken, authorizeRoles('admin', 'author'), deletePost); // Admin and Author can delete posts

// Comment routes
router.post('/:id/comments', verifyToken, authorizeRoles('admin', 'author', 'reader'), addComment); // All roles can add comments
router.delete('/:postId/comments/:commentId', verifyToken, authorizeRoles('admin', 'author', 'reader'), deleteComment); // Permission logic handled in controller

module.exports = router;