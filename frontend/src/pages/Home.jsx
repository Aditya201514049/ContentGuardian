import React from 'react';
import Layout from '../components/layout/Layout';
import PostsList from '../components/posts/PostsList';

const Home = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Posts Section */}
          <section className="py-8 mb-16">
            <PostsList />
          </section>
         
        </div>
      </div>
    </Layout>
  );
};

export default Home; 