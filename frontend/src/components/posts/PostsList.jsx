// src/components/posts/PostsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PostCard from './PostCard';

const PostsList = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/posts');
        setPosts(response.data);
      } catch (err) {
        setError('Failed to load posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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