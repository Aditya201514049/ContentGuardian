import React, { useState } from 'react';
import { testConnection } from '../../services/api';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const testResult = await testConnection();
      setResult(testResult);
      console.log('Test result:', testResult);
    } catch (err) {
      setError(err.message);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <button 
        onClick={handleTestConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h3 className="font-semibold">Result:</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2 overflow-x-auto">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-red-500">
          <h3 className="font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
        <p>Current API URL: {import.meta.env.DEV ? 'Development mode' : 'Production mode'}</p>
      </div>
    </div>
  );
};

export default ApiTest; 