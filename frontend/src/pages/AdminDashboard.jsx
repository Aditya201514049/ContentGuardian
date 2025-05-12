import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import StatCard from '../components/admin/StatCard';
import UserTable from '../components/admin/UserTable';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin dashboard data...');
        
        const [usersResponse, statsResponse] = await Promise.all([
          api.get('/api/auth/users'),
          api.get('/api/auth/stats')
        ]);

        console.log('Users data:', usersResponse.data);
        console.log('Stats data:', statsResponse.data);
        
        setUsers(usersResponse.data);
        setStats(statsResponse.data);
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
      await api.put(`/api/auth/update-role/${userId}`, { role: newRole });
      // Refresh the users list
      const response = await api.get('/api/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Deleting user:', userId);
        await api.delete(`/api/auth/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.message || 'Failed to delete user');
      }
    }
  };

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

          {/* Users Management Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <UserTable users={users} onRoleUpdate={handleRoleUpdate} onDelete={handleDeleteUser} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;