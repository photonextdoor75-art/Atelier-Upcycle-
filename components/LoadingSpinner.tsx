import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="w-24 h-24 border-8 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xl text-slate-700">Analyse de votre meuble...</p>
    </div>
  );
};

export default LoadingSpinner;
