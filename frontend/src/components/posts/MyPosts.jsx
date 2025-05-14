import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PostCard from './PostCard';

const MyPosts = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        // Get all posts and filter them by the current user's ID
        const response = await api.get('/posts');
        const userPosts = response.data.filter(
          post => post.author?._id === currentUser?._id
        );
        setPosts(userPosts);
      } catch (err) {
        setError('Failed to load your posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMyPosts();
    }
  }, [currentUser]);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'author')) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading your posts...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Posts</h1>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any posts yet.</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyPosts; 