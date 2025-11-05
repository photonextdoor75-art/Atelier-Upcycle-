import React, { useState, useCallback } from 'react';

interface LandingPageProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  location: string | null;
  setLocation: (location: string) => void;
  setCoordinates: (coords: { lat: number; lon: number }) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onImageUpload, isLoading, location, setLocation, setCoordinates }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith('image/')) {
        onImageUpload(e.dataTransfer.files[0]);
      } else {
        alert("Veuillez déposer un fichier image.");
      }
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
        setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
        return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });
        setLocation(`Votre position actuelle (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
        setIsLocating(false);
      },
      (error) => {
        setLocationError(`Impossible d'obtenir la position : ${error.message}`);
        setIsLocating(false);
      }
    );
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLocation.trim()) {
      setLocation(manualLocation.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl text-center space-y-8 p-8 bg-white/40 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20">
      
      {/* Location Input Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">Étape 1 : Localisez votre impact (Optionnel)</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleGeolocate} disabled={isLocating} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors disabled:bg-slate-400">
                <span>{isLocating ? 'Localisation...' : 'Me localiser'}</span>
            </button>
            <span className="text-slate-500">ou</span>
            <form onSubmit={handleManualLocationSubmit} className="flex gap-2">
                <input 
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="Entrez une ville, une adresse..."
                    className="bg-white/60 border border-slate-300 rounded-full px-4 py-2 text-slate-800 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <button type="submit" className="px-5 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">Valider</button>
            </form>
        </div>
        {location && <p className="text-green-700 mt-2 font-medium">Lieu défini : {location}</p>}
        {locationError && <p className="text-red-600 text-sm mt-2">{locationError}</p>}
      </div>

      {/* Divider */}
      <div className="w-1/2 mx-auto h-px bg-slate-300/70"></div>

      {/* File Uploader Section */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl p-10 sm:p-12 transition-all duration-300 ${isDragging ? 'bg-orange-500/10' : 'bg-transparent'}`}
      >
        <h2 className="text-xl font-semibold text-slate-700">Étape 2 : Téléversez votre photo</h2>
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <div className="flex flex-col items-center justify-center space-y-4 text-slate-500 pt-8">
            <p className="text-4xl">📤</p>
            <p className="text-lg font-medium">Glissez-déposez une photo de votre meuble ici</p>
            <p>ou</p>
            <label htmlFor="file-upload" className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-full cursor-pointer hover:bg-orange-50 transition-colors shadow-md">
              Cliquez pour téléverser
            </label>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;