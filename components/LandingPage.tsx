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
    <div className="w-full max-w-3xl text-center space-y-8">
      {/* Location Input Section */}
      <div className="space-y-4 p-6 bg-gray-800/50 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-200">Étape 1 : Localisez votre impact (Optionnel)</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleGeolocate} disabled={isLocating} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500">
                <span>{isLocating ? 'Localisation...' : 'Me localiser'}</span>
            </button>
            <span className="text-gray-500">ou</span>
            <form onSubmit={handleManualLocationSubmit} className="flex gap-2">
                <input 
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="Entrez une ville, une adresse..."
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Valider</button>
            </form>
        </div>
        {location && <p className="text-green-400 mt-2">Lieu défini : {location}</p>}
        {locationError && <p className="text-red-400 text-sm mt-2">{locationError}</p>}
      </div>

      {/* File Uploader Section */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-10 sm:p-20 transition-all duration-300 ${isDragging ? 'border-indigo-400 bg-gray-800' : 'border-gray-600 hover:border-gray-500'}`}
      >
        <div className="absolute top-4 left-5 text-xl font-semibold text-gray-200">Étape 2 : Téléversez votre photo</div>
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <div className="flex flex-col items-center justify-center space-y-4 text-gray-400 pt-8">
            <p className="text-2xl">📤</p>
            <p className="text-xl font-semibold">Glissez-déposez une photo de votre meuble ici</p>
            <p className="text-gray-500">ou</p>
            <label htmlFor="file-upload" className="px-6 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
            Cliquez pour téléverser
            </label>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;