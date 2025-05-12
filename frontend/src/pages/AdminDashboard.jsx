import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import StatCard from '../components/admin/StatCard';
import UserTable from '../components/admin/UserTable';
import UserDetail from '../components/admin/UserDetail';
import PostTable from '../components/admin/PostTable';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin dashboard data...');
        
        // Fixed API routes to work with the baseURL which already includes /api
        // So endpoints should be just /auth/users not /api/auth/users
        const [usersResponse, statsResponse] = await Promise.all([
          api.get('/auth/users'),
          api.get('/auth/stats')
        ]);
        
        // Mock data for posts until we implement the endpoint
        const postsResponse = {
          data: [
            {
              _id: '1',
              title: 'Getting Started with Content Moderation',
              author: { name: 'John Doe', _id: '101' },
              createdAt: new Date().toISOString(),
              isApproved: true
            },
            {
              _id: '2',
              title: 'Best Practices for Content Security',
              author: { name: 'Jane Smith', _id: '102' },
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              isApproved: false
            },
            {
              _id: '3',
              title: 'AI in Content Filtering: A Deep Dive',
              author: { name: 'Alex Johnson', _id: '103' },
              createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              isApproved: false
            }
          ]
        };

        console.log('Users data:', usersResponse.data);
        console.log('Stats data:', statsResponse.data);
        console.log('Posts data:', postsResponse.data);
        
        setUsers(usersResponse.data);
        setStats(statsResponse.data);
        setPosts(postsResponse.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message || 'Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      console.log('Updating role:', { userId, newRole });
      await api.put(`/auth/update-role/${userId}`, { role: newRole });
      // Refresh the users list
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleUserDetailOpen = (userId) => {
    setSelectedUserId(userId);
    setUserDetailOpen(true);
  };

  const handleUserDetailClose = () => {
    setUserDetailOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdated = async () => {
    try {
      const response = await api.get('/api/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error refreshing users:', err);
    }
  };

  // Mock functions for post operations until backend is ready
  const handleApprovePost = async (postId) => {
    try {
      // Simulating API call
      console.log(`Approving post: ${postId}`);
      
      // Update local state to reflect approval
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, isApproved: true };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error approving post:', err);
      setError(err.message || 'Failed to approve post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Simulating API call
        console.log(`Deleting post: ${postId}`);
        
        // Remove from local state
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        console.error('Error deleting post:', err);
        setError(err.message || 'Failed to delete post');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Deleting user:', userId);
        await api.delete(`/auth/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Users" value={stats?.totalUsers || 0} />
            <StatCard title="Authors" value={stats?.usersByRole?.find(r => r._id === 'author')?.count || 0} />
            <StatCard title="Readers" value={stats?.usersByRole?.find(r => r._id === 'reader')?.count || 0} />
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Content Management
              </button>
            </nav>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'users' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <div className="relative max-w-xs w-full">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                      className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <UserTable 
                  users={filteredUsers} 
                  onRoleUpdate={handleRoleUpdate} 
                  onDelete={handleDeleteUser} 
                  onView={handleUserDetailOpen}
                />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Content Management</h2>
                <PostTable 
                  posts={posts} 
                  onDelete={handleDeletePost} 
                  onApprove={handleApprovePost} 
                />
              </>
            )}
          </div>

          {/* User Detail Modal */}
          {userDetailOpen && (
            <UserDetail 
              userId={selectedUserId}
              onClose={handleUserDetailClose}
              onUserUpdated={handleUserUpdated}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;