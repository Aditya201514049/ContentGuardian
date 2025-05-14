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
          {/* Hero Section */}
          <section className="py-16 mt-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Protect Your Content</span>
                <span className="block text-blue-600">With Content Guardian</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                The ultimate solution for content moderation and analysis.
              </p>
              <div className="mt-10 flex justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-blue font-bold py-3 px-6 rounded-md transition duration-150 ease-in-out shadow-md">
                  Try For Free
                </button>
                <button className="ml-4 text-blue-600 hover:text-blue-800 font-medium py-3 px-6 border border-blue-500 rounded-md transition duration-150 ease-in-out">
                  Learn More
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 