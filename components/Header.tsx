
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-7xl mb-8 text-center">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-400 to-indigo-500">
        The Upcycle Impact Visualizer
      </h1>
      <p className="mt-2 text-lg text-gray-400">Voyez la valeur cachée de ce que vous possédez déjà.</p>
    </header>
  );
};

export default Header;
