import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-12 h-12 border-4 border-primary-default border-t-transparent rounded-full animate-spin"></div>
        <p className="text-light-subtle-text dark:text-dark-subtle-text">Whipping up something delicious...</p>
    </div>
  );
};

export default LoadingSpinner;
