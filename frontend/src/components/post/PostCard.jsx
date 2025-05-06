import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const { _id, title, content, author, createdAt, comments } = post;
  
  // Format the date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  // Truncate content for preview
  const truncatedContent = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <Link to={`/posts/${_id}`}>
          <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
            {title}
          </h2>
        </Link>
        
        <p className="text-gray-600 mb-4">{truncatedContent}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <span className="mr-1">By</span>
            <span className="font-medium">{author.name}</span>
            <span className="ml-1">
              ({author.role})
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>{formattedDate}</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {comments.length}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link 
            to={`/posts/${_id}`} 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 