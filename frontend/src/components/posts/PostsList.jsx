// src/components/posts/PostsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PostCard from './PostCard';

const PostsList = () => {
  const { currentUser, initialCheckDone } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Wait for authentication to be fully initialized before fetching posts
    if (!initialCheckDone && retryCount < 3) {
      // If auth check isn't done yet, set a small delay and try again
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
    
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/posts');
        // Sort posts by createdAt date in descending order (newest first)
        const sortedPosts = [...response.data].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sortedPosts);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        
        // Add retry logic for network errors
        if (retryCount < 3) {
          const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1200); // Increasing backoff time
          return () => clearTimeout(timer);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [initialCheckDone, retryCount]);

  const canCreatePost = currentUser && 
    (currentUser.role === 'admin' || currentUser.role === 'author');

  if (loading) return <div className="text-center py-8">Loading posts...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Latest Posts</h1>
        {canCreatePost && (
          <Link 
            to="/create-post" 
            className="inline-flex items-center px-5 py-2.5 text-sm md:text-base font-medium rounded-lg shadow-sm text-white bg-white-600 hover:bg-blue-700 transition duration-150 ease-in-out border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Post
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet</p>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default PostsList;