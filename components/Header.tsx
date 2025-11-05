import React from 'react';

const Header: React.FC = () => {
  // Ce composant affiche le logo comme titre principal, avec le sous-titre en dessous.
  // Il s'attend à trouver le logo au chemin `/assets/logo.png`.
  // Vous devez créer une structure de dossiers `public/assets/` à la racine de votre projet
  // et y placer votre fichier `logo.png`. Une hauteur de 128px (h-32) est recommandée.
  return (
    <header className="w-full max-w-7xl my-8 flex justify-center text-center">
       <div className="flex flex-col items-center justify-center gap-2">
        <img src="/assets/logo.png" alt="Logo Upcycle" className="h-32 w-32" />
        <p className="text-slate-600">L'outil qui chiffre la seconde vie de nos objets.</p>
      </div>
    </header>
  );
};

export default Header;
