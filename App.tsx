import React, { useState, useEffect, useCallback } from 'react';
import { AppState, AnalysisResult } from './types';
import LandingPage from './components/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsPage from './components/ResultsPage';
import Header from './components/Header';
import { analyzeFurnitureImage } from './services/geminiService';

const App: React.FC = () => {
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    // Vérification de la clé API au montage du composant
    if (!process.env.API_KEY) {
      console.error("La variable d'environnement API_KEY n'est pas définie.");
      setApiKeyMissing(true);
    }
  }, []);


  const handleImageUpload = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAppState(AppState.LOADING);
    setErrorMessage(null);
  };

  const runAnalysis = useCallback(async (loc: string | null) => {
    if (!imageDataUrl) return;

    try {
      const base64Data = imageDataUrl.split(',')[1];
      const result = await analyzeFurnitureImage(base64Data, loc);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Analysis failed:", error);
      const message = error instanceof Error ? error.message : "Désolé, l'analyse a échoué. Veuillez réessayer.";
      setErrorMessage(message);
      setAppState(AppState.ERROR);
    }
  }, [imageDataUrl]);

  useEffect(() => {
    if (appState === AppState.LOADING) {
      runAnalysis(location);
    }
  }, [appState, runAnalysis, location]);

  const handleReset = () => {
    setAppState(AppState.LANDING);
    setUploadedFile(null);
    setImageDataUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setLocation(null);
  };

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <Header />
        <main className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center">
            <div className="w-full text-center bg-red-900/20 border border-red-500 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-red-300 mb-4">Erreur de Configuration</h2>
                <p className="text-lg text-gray-300 mb-2">
                    La clé API de Google est manquante.
                </p>
                <p className="text-gray-400 mb-6">
                    Pour que l'application fonctionne, vous devez configurer la variable d'environnement <code className="bg-gray-700 text-yellow-300 px-2 py-1 rounded">API_KEY</code> dans les paramètres de votre projet Vercel, puis redéployer.
                </p>
                <a
                    href="https://vercel.com/docs/projects/environment-variables"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Voir la documentation Vercel
                </a>
            </div>
        </main>
      </div>
    );
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return <LoadingSpinner />;
      case AppState.RESULTS:
        if (analysisResult && imageDataUrl) {
          return (
            <ResultsPage
              result={analysisResult}
              originalFile={uploadedFile!}
              originalImageSrc={imageDataUrl}
              onReset={handleReset}
            />
          );
        }
        // Fallback to error if data is missing
        setErrorMessage("Une erreur inattendue est survenue. Les données de résultat sont manquantes.");
        setAppState(AppState.ERROR);
        return null;
      case AppState.ERROR:
        return (
          <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
            <p className="font-semibold">Une erreur est survenue :</p>
            <p>{errorMessage}</p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Recommencer
            </button>
          </div>
        );
      case AppState.LANDING:
      default:
        return <LandingPage onImageUpload={handleImageUpload} isLoading={false} location={location} setLocation={setLocation} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
