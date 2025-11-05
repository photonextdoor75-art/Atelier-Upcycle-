import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { AnalysisResult } from '../types';
import { ArrowPathIcon, DownloadIcon, ShareIcon, MapPinIcon } from './Icons';

interface ResultsPageProps {
  result: AnalysisResult;
  originalImageSrc: string;
  onReset: () => void;
}

// Helper to convert data URL to File object for Web Share API
const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) { return null; }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) { return null; }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

const translations: { [key: string]: string } = {
  'wooden chair': 'chaise en bois',
  'wooden table': 'table en bois',
  'wooden cabinet': 'meuble de rangement en bois',
  'wooden bookshelf': 'bibliothèque en bois',
  'metal chair': 'chaise en métal',
  'metal cabinet': 'meuble de rangement en métal',
  'plastic chair': 'chaise en plastique',
  'particle board table': 'table en panneau de particules',
  'fabric sofa': 'canapé en tissu',
  'good': 'Bon',
  'average': 'Moyen',
  'poor': 'Mauvais',
  'indoor': 'Intérieur',
  'outdoor': 'Extérieur',
};

const translate = (term: string): string => translations[term.toLowerCase()] || term;

const ResultsPage: React.FC<ResultsPageProps> = ({ result, originalImageSrc, onReset }) => {
  const { impact, furnitureType, condition, environment, uploadTimestamp, streetAddress, postalCode, city, coordinates } = result;
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const isIndoors = environment === 'indoor';

  const handleDownload = useCallback(() => {
    if (resultCardRef.current === null) {
      return;
    }
    toPng(resultCardRef.current, { cacheBust: true, backgroundColor: '#FFFFFF', pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'upcycle-impact.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  }, []);

  const handleShare = useCallback(async () => {
    if (!navigator.share) {
        alert("Le partage web n'est pas supporté par votre navigateur.");
        return;
    }
    if (resultCardRef.current === null) return;

    setIsSharing(true);
    try {
        const dataUrl = await toPng(resultCardRef.current, { cacheBust: true, backgroundColor: '#FFFFFF', pixelRatio: 2 });
        const file = dataURLtoFile(dataUrl, 'upcycle-impact.png');
        
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Mon Impact Upcycle',
                text: 'Découvrez la valeur cachée de mes meubles grâce à The Upcycle Impact Visualizer ! #Upcycle #DIY #EcoFriendly',
            });
        } else {
            alert("Le partage de fichiers n'est pas supporté. Essayez de télécharger l'image.");
        }
    } catch (err) {
        // We don't show an error if the user cancels the share dialog
        if (err instanceof Error && err.name !== 'AbortError') {
             console.error('Erreur lors du partage:', err);
             alert("Oops, une erreur est survenue lors du partage.");
        }
    } finally {
        setIsSharing(false);
    }
  }, []);

  const imageToDisplay = originalImageSrc;
  const translatedFurnitureDescription = translate(furnitureType);

  const stampText = isIndoors ? "VALORISÉ" : "PERDU";
  const stampColorClasses = isIndoors ? "border-orange-500 text-orange-500" : "border-red-500 text-red-500";
  
  const formattedTimestamp = uploadTimestamp 
    ? new Date(uploadTimestamp).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(',', ' à')
    : null;

  const addressParts = [];
  if (streetAddress) addressParts.push(streetAddress);
  const cityAndCode = [postalCode, city].filter(Boolean).join(' ');
  if (cityAndCode) addressParts.push(cityAndCode);
  const formattedAddress = addressParts.join(', ');

  const locationDisplay = formattedAddress ? (
    <div className="flex items-center justify-center gap-1.5 text-xs text-white/90 mt-1 drop-shadow-md">
        <MapPinIcon className="w-3 h-3 flex-shrink-0" />
        <span>{formattedAddress}</span>
    </div>
  ) : coordinates ? (
    <div className="flex items-center justify-center gap-1.5 text-xs text-white/90 mt-1 drop-shadow-md">
        <MapPinIcon className="w-3 h-3 flex-shrink-0" />
        <span>{coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}</span>
    </div>
  ) : null;

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* The downloadable card with 4:5 aspect ratio */}
      <div className="w-full max-w-md">
        <div ref={resultCardRef} className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden aspect-[4/5] flex flex-col">
          {/* Image Part */}
          <div className="relative w-full h-3/5 bg-gray-200">
             <img src={imageToDisplay} alt="Furniture" className="w-full h-full object-cover" />
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12">
                <div className={`border-4 ${stampColorClasses} bg-white/80 backdrop-blur-sm font-black uppercase px-4 py-1 text-4xl md:px-6 md:py-2 md:text-5xl tracking-widest`} style={{fontFamily: "'Arial Black', Gadget, sans-serif"}}>
                    {stampText}
                </div>
             </div>
             {/* Watermark Title */}
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-center">
                {isIndoors ? (
                    <h2 className="text-lg md:text-xl font-bold leading-tight text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
                        Votre <span className="text-orange-300">{translatedFurnitureDescription}</span> a un potentiel incroyable !
                    </h2>
                ) : (
                    <h2 className="text-lg md:text-xl font-bold leading-tight text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
                        Ce <span className="text-orange-300">{translatedFurnitureDescription}</span> trouvé dehors a un potentiel incroyable !
                    </h2>
                )}
                {condition && <p className="text-sm text-white/90 mt-1 drop-shadow-md">État: {translate(condition)}</p>}
                {locationDisplay}
                {formattedTimestamp && <p className="text-xs text-white/80 mt-1 drop-shadow-md">Vu le {formattedTimestamp}</p>}
             </div>
          </div>

          {/* InfoGraphic Part */}
          <div className="h-2/5 flex-shrink-0 flex flex-col justify-center items-center p-4 text-slate-800 space-y-3">
            {/* Stats */}
            <div className="flex justify-around items-start text-center w-full flex-grow">
               <div className="flex flex-col items-center justify-start w-1/3 px-1 space-y-1">
                 <p className="text-xl md:text-2xl font-bold text-green-600">{Math.round(impact.co2Saved)} kg</p>
                 <p className="text-xs text-slate-500 leading-tight">quantité de CO2 non émise par rapport à l'achat d'un meuble neuf.</p>
               </div>
               <div className="flex flex-col items-center justify-start w-1/3 px-1 space-y-1">
                 <p className="text-xl md:text-2xl font-bold text-amber-600">{impact.communityCostAvoided.toFixed(0)} €</p>
                 <p className="text-xs text-slate-500 leading-tight">coûts de mise en décharge évités</p>
               </div>
               <div className="flex flex-col items-center justify-start w-1/3 px-1 space-y-1">
                 <p className={`text-xl md:text-2xl font-bold ${impact.valueCreated > 0 ? 'text-orange-500' : 'text-red-500'}`}>{impact.valueCreated.toFixed(0)} €</p>
                 <p className="text-xs text-slate-500 leading-tight">valeur du meuble neuf moins les coûts d'upcycling</p>
               </div>
            </div>
            
            {/* Divider */}
            <div className="w-3/4 h-px bg-slate-200"></div>

            {/* Attribution */}
            <p className="text-xs text-slate-400">Généré par Upcycle</p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="w-full max-w-md p-6 bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
            onClick={handleDownload}
            className="w-full flex-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
            <DownloadIcon />
            <span>Télécharger</span>
            </button>
            {navigator.share && (
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="w-full flex-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
                >
                    <ShareIcon />
                    <span>{isSharing ? 'Partage...' : 'Partager'}</span>
                </button>
            )}
        </div>
        <button
            onClick={onReset}
            className="w-full px-6 py-3 bg-slate-600 text-white font-bold rounded-full hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
            <ArrowPathIcon />
            <span>Analyser un autre meuble</span>
        </button>
       </div>
    </div>
  );
};

export default ResultsPage;