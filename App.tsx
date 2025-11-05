// FIX: Removed API key check and related UI components to comply with coding guidelines, which state to assume the API key is always present.
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, AnalysisResult } from './types';
import LandingPage from './components/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsPage from './components/ResultsPage';
import Header from './components/Header';
import { analyzeFurnitureImage } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [uploadTimestamp, setUploadTimestamp] = useState<number | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedFile(file);
    setUploadTimestamp(Date.now()); // Capture timestamp on upload
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
      setAnalysisResult({ ...result, uploadTimestamp }); // Add timestamp to result
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Analysis failed:", error);
      const message = error instanceof Error ? error.message : "Désolé, l'analyse a échoué. Veuillez réessayer.";
      setErrorMessage(message);
      setAppState(AppState.ERROR);
    }
  }, [imageDataUrl, uploadTimestamp]);

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
    setUploadTimestamp(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return <LoadingSpinner />;
      case AppState.RESULTS:
        if (analysisResult && imageDataUrl) {
          return (
            <ResultsPage
              result={analysisResult}
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