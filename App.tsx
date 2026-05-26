// Fix: Augment the global Window interface to include SpeechRecognition APIs for TypeScript type checking.
// Since this file is a module, `declare global` is needed to modify the global scope.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChefHatIcon, SunIcon, MoonIcon, SparklesIcon, BookIcon, MicIcon } from './components/icons';
import { DIETARY_OPTIONS, LANGUAGES } from './constants';
import { generateRecipe } from './services/geminiService';
import { Recipe } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import RecipeCard from './components/RecipeCard';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([]);
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access was denied. Please allow it in your browser settings.");
      }
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript) {
        setIngredients(prev => (prev.trim() ? prev.trim() + ', ' : '') + transcript.trim());
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDietaryChange = (option: string) => {
    setDietaryOptions(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const toggleRecording = () => {
    if (!micSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleGenerateRecipe = useCallback(async () => {
    if (!ingredients.trim()) {
      setError("Please enter some ingredients.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setRecipe(null);
    try {
      const result = await generateRecipe(ingredients, dietaryOptions, language);
      setRecipe(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, dietaryOptions, language]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error && !recipe) {
      return <p className="text-center text-red-500">{error}</p>;
    }
    if (recipe) {
      return <RecipeCard recipe={recipe} />;
    }
    return (
      <div className="text-center border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-12">
        <BookIcon className="w-16 h-16 mx-auto text-light-subtle-text dark:text-dark-subtle-text mb-4" />
        <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">Your recipe awaits!</h2>
        <p className="text-light-subtle-text dark:text-dark-subtle-text">Fill out the form above to discover your next delicious meal.</p>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4">
            <ChefHatIcon className="w-12 h-12 text-primary-default" />
            <h1 className="text-5xl font-extrabold">Pantry Chef</h1>
          </div>
          <p className="text-lg text-light-subtle-text dark:text-dark-subtle-text mt-2">
            Tell us what you have, and we'll whip up a recipe for you!
          </p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-6 right-6 p-2 rounded-full bg-light-card dark:bg-dark-card hover:bg-light-border dark:hover:bg-dark-border transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-slate-700" />}
          </button>
        </header>

        <main>
          <div className="max-w-3xl mx-auto bg-light-card dark:bg-dark-card shadow-lg rounded-2xl p-8 border border-light-border dark:border-dark-border">
            <div className="space-y-6">
              <div>
                <label htmlFor="ingredients" className="block text-lg font-semibold mb-2">Available Ingredients</label>
                <div className="relative">
                  <textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="e.g., chicken breast, broccoli, olive oil, garlic"
                    className="w-full h-28 p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={!micSupported}
                    className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-default dark:focus:ring-offset-dark-card ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-light-bg dark:bg-dark-bg text-light-subtle-text dark:text-dark-subtle-text hover:bg-light-border dark:hover:bg-dark-border'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={isRecording ? 'Stop recording ingredients' : 'Record ingredients with voice'}
                  >
                    <MicIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold mb-2">Dietary Options</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIETARY_OPTIONS.map(option => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={option.id}
                          checked={dietaryOptions.includes(option.label)}
                          onChange={() => handleDietaryChange(option.label)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-default focus:ring-primary-default"
                        />
                        <label htmlFor={option.id} className="ml-2 text-sm ">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="language" className="block text-lg font-semibold mb-2">Output Language</label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateRecipe}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary-default hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>{isLoading ? 'Generating...' : 'Surprise Me!'}</span>
              </button>
            </div>
          </div>

          <div className="mt-12">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;