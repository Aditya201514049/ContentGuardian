import React from 'react';

function Home2() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Tailwind CSS is Working! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates that Tailwind CSS is properly configured and working in your project.
        </p>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center p-4 bg-green-100 rounded-lg">
            <div className="mr-4 bg-green-500 text-white p-2 rounded-full">
              ✓
            </div>
            <span className="font-medium text-green-800">Gradient backgrounds</span>
          </div>
          <div className="flex items-center p-4 bg-blue-100 rounded-lg">
            <div className="mr-4 bg-blue-500 text-white p-2 rounded-full">
              ✓
            </div>
            <span className="font-medium text-blue-800">Responsive design</span>
          </div>
          <div className="flex items-center p-4 bg-purple-100 rounded-lg">
            <div className="mr-4 bg-purple-500 text-white p-2 rounded-full">
              ✓
            </div>
            <span className="font-medium text-purple-800">Modern components</span>
          </div>
        </div>
        <button className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-600 hover:to-purple-700">
          Awesome Button
        </button>
      </div>
    </div>
  );
}

export default Home2; 