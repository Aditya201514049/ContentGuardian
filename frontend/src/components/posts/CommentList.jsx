// src/components/posts/CommentList.jsx
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CommentList = ({ postId, comments, postAuthorId, onCommentDeleted }) => {
  const { currentUser } = useAuth();

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    
    const isAdmin = currentUser.role === 'admin';
    
    // Convert IDs to strings for reliable comparison
    const currentUserIdStr = String(currentUser._id);
    const postAuthorIdStr = postAuthorId ? String(postAuthorId) : '';
    const commentUserIdStr = comment.user && comment.user._id ? String(comment.user._id) : '';
    
    const isPostAuthor = currentUserIdStr === postAuthorIdStr;
    const isCommentAuthor = currentUserIdStr === commentUserIdStr;
    
    // Log the values to help debug
    console.log('Comment delete permissions:', {
      currentUserId: currentUserIdStr,
      postAuthorId: postAuthorIdStr,
      commentUserId: commentUserIdStr,
      isAdmin,
      isPostAuthor,
      isCommentAuthor
    });
    
    return isAdmin || isPostAuthor || isCommentAuthor;
  };

  if (comments.length === 0) {
    return <p className="text-gray-500">No comments yet</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between">
            <div className="font-medium">{comment.user?.name || 'Anonymous'}</div>
            {canDeleteComment(comment) && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500 mb-2">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
          <p>{comment.comment}</p>
        </div>
      ))}
    </div>
  );
};

CommentList.propTypes = {
  postId: PropTypes.string.isRequired,
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      comment: PropTypes.string.isRequired,
      user: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string
      }),
      createdAt: PropTypes.string
    })
  ).isRequired,
  postAuthorId: PropTypes.string,
  onCommentDeleted: PropTypes.func
};

export default CommentList;