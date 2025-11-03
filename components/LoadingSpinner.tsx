
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Analyse de votre meuble...",
  "Calcul des économies de CO2...",
  "Estimation de la valeur pour la communauté...",
  "Préparation de votre rapport d'impact...",
];

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="text-lg text-gray-300 transition-opacity duration-500">{loadingMessages[messageIndex]}</p>
    </div>
  );
};

export default LoadingSpinner;
