import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-7xl mb-8 text-center">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
        L'Évaluateur de Potentiel Upcycle
      </h1>
      <p className="mt-2 text-lg text-slate-600">L'outil qui chiffre la seconde vie de nos objets.</p>
    </header>
  );
};

export default Header;