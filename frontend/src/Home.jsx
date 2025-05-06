import React from 'react';
import Layout from './components/layout/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <section className="py-16">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Protect Your Content</span>
                <span className="block text-blue-600">With Content Guardian</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                The ultimate solution for content moderation and analysis.
              </p>
              <div className="mt-10 flex justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-150 ease-in-out shadow-md">
                  Try For Free
                </button>
                <button className="ml-4 text-blue-600 hover:text-blue-800 font-medium py-3 px-6 border border-blue-500 rounded-md transition duration-150 ease-in-out">
                  Learn More
                </button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-white rounded-lg shadow-sm mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Protection</h3>
                <p className="text-gray-600">
                  Protect your content with our advanced AI-powered moderation system.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                <p className="text-gray-600">
                  Monitor and analyze your content performance in real-time.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customizable Settings</h3>
                <p className="text-gray-600">
                  Tailor the protection to your specific content needs and requirements.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 mt-16">
            <div className="bg-blue-600 rounded-lg shadow-xl py-10 px-6 sm:px-12 lg:py-16 lg:px-20 text-center">
              <h2 className="text-3xl font-extrabold text-white">
                Ready to protect your content?
              </h2>
              <p className="mt-4 text-lg leading-6 text-blue-100">
                Start your free trial today. No credit card required.
              </p>
              <div className="mt-8">
                <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-md text-lg shadow-md transition duration-150 ease-in-out">
                  Get Started Now
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