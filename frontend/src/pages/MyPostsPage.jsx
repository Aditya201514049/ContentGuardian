import React from 'react';
import Layout from '../components/layout/Layout';
import MyPosts from '../components/posts/MyPosts';

const MyPostsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen home-bg-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MyPosts />
        </div>
      </div>
    </Layout>
  );
};

export default MyPostsPage; 