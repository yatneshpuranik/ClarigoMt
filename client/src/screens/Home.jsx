import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExampleComponent from '../components/ExampleComponent';

const Home = () => {
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [apiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

  useEffect(() => {
    axios
      .get(`${apiUrl}/health`)
      .then((res) => {
        setHealthStatus(res.data.message || 'Connected');
      })
      .catch((err) => {
        setHealthStatus('Backend not reached / Offline (Ensure MongoDB & Express server are active)');
      });
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          MERN Stack Starter
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Client & Server setup complete
        </p>

        <div className="mb-6 p-4 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-left">
          <span className="font-semibold text-blue-700 dark:text-blue-300">Backend Health: </span>
          <span className="text-blue-900 dark:text-blue-200">{healthStatus}</span>
        </div>

        <ExampleComponent message="Welcome to your clean MERN stack structure!" />
      </div>
    </div>
  );
};

export default Home;
