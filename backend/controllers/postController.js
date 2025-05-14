const mongoose = require('mongoose');
const Post = require('@models/Post');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.create({
            title,
            content,
            author: req.user.id,
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
};

// Get all posts
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'name role');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

// Get a single post by ID
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Attempting to fetch post with ID: ${id}`);
        
        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`[ERROR] Invalid post ID format: ${id}`);
            return res.status(400).json({ message: 'Invalid post ID format' });
        }
        
        const post = await Post.findById(id)
            .populate('author', 'name role')
            .populate('comments.user', 'name role');
            
        if (!post) {
            console.log(`[ERROR] Post not found with ID: ${id}`);
            return res.status(404).json({ message: 'Post not found' });
        }
        
        console.log(`[SUCCESS] Successfully fetched post: ${post.title}`);
        res.status(200).json(post);
    } catch (error) {
        console.error('[ERROR] Error fetching post by ID:', error);
        res.status(500).json({ 
            message: 'Error fetching post', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Update a post
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Allow only the author or admin to update
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
    }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        // First find the post to check authorization
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Convert ObjectId to string for comparison
        const postAuthorId = post.author.toString();
        const requestUserId = req.user.id.toString();
        
        console.log('Post Author ID:', postAuthorId);
        console.log('Request User ID:', requestUserId);
        console.log('User Role:', req.user.role);

        // Check if user is author or admin
        if (postAuthorId !== requestUserId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied: You are not authorized to delete this post',
                postAuthor: postAuthorId,
                requestUser: requestUserId,
                userRole: req.user.role
            });
        }

        // Use findByIdAndDelete instead of remove()
        const deletedPost = await Post.findByIdAndDelete(id);
        
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post could not be deleted' });
        }

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error in deletePost:', error);
        res.status(500).json({ 
            message: 'An error occurred while deleting the post', 
            error: error.message,
            stack: error.stack
        });
    }
};

// Add a comment to a post
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            user: req.user.id,
            comment,
        });
        await post.save();

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
};

// Delete a comment from a post
const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the comment
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Authorization check:
        // 1. Admin can delete any comment
        // 2. Author of the post can delete any comment on their post
        // 3. Comment owner can delete their own comment
        const isAdmin = req.user.role === 'admin';
        const isPostAuthor = post.author.toString() === req.user.id;
        const isCommentOwner = comment.user.toString() === req.user.id;

        if (!isAdmin && !isPostAuthor && !isCommentOwner) {
            return res.status(403).json({ 
                message: 'Access denied: You are not authorized to delete this comment'
            });
        }

        // Remove the comment
        comment.deleteOne();
        await post.save();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error in deleteComment:', error);
        res.status(500).json({ 
            message: 'An error occurred while deleting the comment', 
            error: error.message 
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
};