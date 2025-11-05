import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { AnalysisResult } from '../types';
import { ArrowPathIcon, DownloadIcon, ShareIcon } from './Icons';

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
  'wood': 'bois',
  'metal': 'métal',
  'particle board': 'panneau de particules',
  'plastic': 'plastique',
  'fabric': 'tissu',
};

const translate = (term: string): string => translations[term.toLowerCase()] || term;

const StatItem: React.FC<{ value: string; label: string; colorClass: string; }> = ({ value, label, colorClass }) => (
    <div className="flex flex-col items-center justify-center w-1/3 px-1 space-y-1 h-full">
        <p className={`text-xl md:text-2xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-xs text-gray-400 leading-tight">{label}</p>
    </div>
);


const ResultsPage: React.FC<ResultsPageProps> = ({ result, originalImageSrc, onReset }) => {
  const { impact, furnitureType } = result;
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = useCallback(() => {
    if (resultCardRef.current === null) {
      return;
    }
    toPng(resultCardRef.current, { cacheBust: true, backgroundColor: '#1F2937', pixelRatio: 2 })
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
        const dataUrl = await toPng(resultCardRef.current, { cacheBust: true, backgroundColor: '#1F2937', pixelRatio: 2 });
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

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* The downloadable card with 4:5 aspect ratio */}
      <div className="w-full max-w-md">
        <div ref={resultCardRef} className="w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden aspect-[4/5] flex flex-col">
          {/* Image Part */}
          <div className="relative w-full flex-grow bg-gray-700">
             <img src={imageToDisplay} alt="Furniture" className="w-full h-full object-cover" />
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12">
                <div className="border-4 border-yellow-400 text-yellow-400 font-black uppercase px-4 py-1 text-4xl md:px-6 md:py-2 md:text-5xl tracking-widest" style={{fontFamily: "'Arial Black', Gadget, sans-serif"}}>
                    VALORISÉ
                </div>
             </div>
             {/* Watermark Title */}
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h2 className="text-lg md:text-xl font-bold leading-tight text-center text-white text-shadow-lg">
                    Votre <span className="text-green-400">{translatedFurnitureDescription}</span> a un potentiel incroyable
                    {result.location && <span className="text-base font-medium text-gray-300 block mt-1">à {result.location}</span>} !
                </h2>
             </div>
          </div>

          {/* InfoGraphic Part */}
          <div className="h-2/5 flex-shrink-0 flex flex-col justify-center items-center p-4 text-white space-y-3">
            {/* Stats */}
            <div className="flex justify-around items-center text-center w-full flex-grow">
              <StatItem value={`${Math.round(impact.co2Saved)} kg`} label="CO2 Économisé" colorClass="text-green-400" />
              <StatItem value={`${impact.communityCostAvoided.toFixed(0)} €`} label="Coût Évité" colorClass="text-yellow-400" />
              <StatItem value={`${impact.valueCreated.toFixed(0)} €`} label="Valeur Créée" colorClass="text-blue-400" />
            </div>
            
            {/* Divider */}
            <div className="w-3/4 h-px bg-gray-600"></div>

            {/* Attribution */}
            <p className="text-xs text-gray-500">Généré par The Upcycle Impact Visualizer</p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-6">
        <button
          onClick={handleDownload}
          className="w-full flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <DownloadIcon />
          <span>Télécharger l'image</span>
        </button>
        {navigator.share && (
            <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-500"
            >
                <ShareIcon />
                <span>{isSharing ? 'Partage...' : 'Partager'}</span>
            </button>
        )}
      </div>
       <div className="w-full max-w-md">
        <button
          onClick={onReset}
          className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowPathIcon />
          <span>Analyser un autre meuble</span>
        </button>
       </div>
    </div>
  );
};

export default ResultsPage;