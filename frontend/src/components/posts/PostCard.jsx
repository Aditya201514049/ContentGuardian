// src/components/posts/PostCard.jsx
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post }) => {
  const { currentUser } = useAuth();
  const isAuthor = currentUser?._id === post.author._id;
  const canEdit = isAuthor;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">
        <Link to={`/posts/${post._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
          {post.title}
        </Link>
      </h2>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
        </div>
        
        {canEdit && (
          <div className="space-x-2">
            <Link 
              to={`/edit-post/${post._id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Edit
            </Link>
          </div>
        )}
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {post.content.length > 200 
          ? `${post.content.substring(0, 200)}...` 
          : post.content}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {post.comments?.length || 0} comments
        </div>
        <Link 
          to={`/posts/${post._id}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Read more
        </Link>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    }),
    createdAt: PropTypes.string.isRequired,
    comments: PropTypes.array
  }).isRequired
};

export default PostCard;