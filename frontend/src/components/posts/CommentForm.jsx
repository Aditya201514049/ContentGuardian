// src/components/posts/CommentForm.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/posts/${postId}/comments`, { comment });
      
      // Reset form
      setComment('');
      
      // Notify parent component
      if (onCommentAdded) {
        // Find the newly added comment in the response
        const newComment = response.data.comments[response.data.comments.length - 1];
        onCommentAdded(newComment);
      }
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          rows="3"
          placeholder="Add a comment..."
          disabled={loading}
        ></textarea>
      </div>
      
      <button
        type="submit"
        disabled={loading || !comment.trim()}
        className={`px-4 py-2 text-white rounded ${
          loading || !comment.trim() 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

CommentForm.propTypes = {
  postId: PropTypes.string.isRequired,
  onCommentAdded: PropTypes.func
};

export default CommentForm;