import React, { useEffect, useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyWrapperProps {
  children: React.ReactNode;
}

export const ApiKeyWrapper: React.FC<ApiKeyWrapperProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  const checkKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } else {
        if (process.env.API_KEY) {
            setHasKey(true);
        }
    }
    setChecking(false);
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (error) {
        console.error("Failed to open key selector", error);
      }
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-pulse">Checking permissions...</div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
          <div className="w-16 h-16 bg-ttrpg-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-ttrpg-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h1>
          <p className="text-slate-600 mb-8">
            To use the high-quality <strong>Gemini 3 Pro</strong> image model for your TTRPG characters, you need to select a paid API key from a Google Cloud Project.
          </p>
          
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-ttrpg-600 hover:bg-ttrpg-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Select API Key
          </button>

          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 text-xs text-slate-500 hover:text-ttrpg-600 flex items-center justify-center gap-1 transition-colors"
          >
            Learn about billing <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};