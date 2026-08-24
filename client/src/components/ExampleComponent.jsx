import React from 'react';

const ExampleComponent = ({ message }) => {
  return (
    <div className="p-4 my-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Example Component</h3>
      <p className="mt-1 text-gray-600 dark:text-gray-300">{message || 'This is a reusable component inside client/src/components.'}</p>
    </div>
  );
};

export default ExampleComponent;
