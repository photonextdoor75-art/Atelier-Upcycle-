import React from 'react';

const Header: React.FC = () => {
  // Ce composant affiche le logo à côté du titre.
  // Il s'attend à trouver le logo au chemin `/assets/logo.png`.
  // Vous devez créer une structure de dossiers `public/assets/` à la racine de votre projet
  // et y placer votre fichier `logo.png`. Une hauteur de 128px (h-32) est recommandée.
  return (
    <header className="w-full max-w-7xl my-8 flex justify-center text-center sm:text-left">
       <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <img src="/assets/logo.png" alt="Logo Upcycle" className="h-32 w-32" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">L'Évaluateur de Potentiel</h1>
          <p className="text-slate-600 mt-1">L'outil qui chiffre la seconde vie de nos objets.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
