import React, { useState } from 'react';
import { ApiKeyWrapper } from './components/ApiKeyWrapper';
import { ImageUploader } from './components/ImageUploader';
import { Gallery } from './components/Gallery';
import { Button } from './components/Button';
import { VariationGroup, GeneratedImage } from './types';
import { fileToBase64, generateVariation } from './services/geminiService';
import { Dices, Info, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PromptItem {
  id: string;
  text: string;
  status: 'idle' | 'processing' | 'success' | 'error';
}

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  
  const [prompts, setPrompts] = useState<PromptItem[]>([
    { id: '1', text: '', status: 'idle' }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSourceImage(file);
    const url = URL.createObjectURL(file);
    setSourceImagePreview(url);
    setGlobalError(null);
  };

  const handleClearImage = () => {
    setSourceImage(null);
    setSourceImagePreview(null);
    setGlobalError(null);
  };

  const addPrompt = () => {
    setPrompts(prev => [
      ...prev, 
      { id: Date.now().toString(), text: '', status: 'idle' }
    ]);
  };

  const updatePromptText = (id: string, newText: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, text: newText, status: 'idle' } : p
    ));
  };

  const removePrompt = (id: string) => {
    if (prompts.length <= 1) {
      updatePromptText(id, '');
      return;
    }
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const updatePromptStatus = (id: string, status: PromptItem['status']) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;
    
    const validPrompts = prompts.filter(p => p.text.trim() !== '');
    if (validPrompts.length === 0) {
      setGlobalError("Please describe at least one character variation.");
      return;
    }

    setIsGenerating(true);
    setGlobalError(null);

    try {
      const base64 = await fileToBase64(sourceImage);
      
      for (const promptItem of validPrompts) {
        updatePromptStatus(promptItem.id, 'processing');

        const groupId = Date.now().toString() + Math.random().toString();
        const newGroup: VariationGroup = {
            id: groupId,
            prompt: promptItem.text,
            timestamp: Date.now(),
            images: [],
            status: 'generating'
        };

        setVariationGroups(prev => [newGroup, ...prev]);

        try {
          const fullPrompt = `Using the same exact visual style, ${promptItem.text}`;

          const generationPromises = [1, 2, 3].map(() => 
             generateVariation(
                base64, 
                fullPrompt, 
                { aspectRatio: '1:1', imageSize: '1K' }, 
                sourceImage.type
              )
          );

          const results = await Promise.all(generationPromises);

          const generatedImages: GeneratedImage[] = results.map(url => ({
             id: Math.random().toString(36).substring(7),
             url: url
          }));

          setVariationGroups(prev => prev.map(g => 
            g.id === groupId 
            ? { ...g, images: generatedImages, status: 'completed' } 
            : g
          ));

          updatePromptStatus(promptItem.id, 'success');
        } catch (err: any) {
          console.error("Error generating batch:", err);
          
          setVariationGroups(prev => prev.map(g => 
            g.id === groupId 
            ? { ...g, status: 'error' } 
            : g
          ));
          
          updatePromptStatus(promptItem.id, 'error');
        }
      }

    } catch (err: any) {
      console.error(err);
      setGlobalError("Failed to process image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ApiKeyWrapper>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-ttrpg-100 selection:text-ttrpg-900">
        
        {/* Navbar */}
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ttrpg-600 rounded-lg shadow-md shadow-ttrpg-200">
                    <Dices className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  TTRPG Char Generator
                </h1>
              </div>
              
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Input Controls */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Step 1: Upload */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">1</span>
                        Source Character
                    </h2>
                </div>
                <ImageUploader 
                  onImageSelect={handleImageSelect} 
                  selectedImage={sourceImagePreview} 
                  onClear={handleClearImage}
                />
              </section>

              {/* Step 2: Prompts */}
              <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">2</span>
                        Variations & Adjustments
                    </h2>
                    {prompts.length > 0 && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{prompts.length} sets</span>
                    )}
                </div>

                <div className="space-y-3">
                  {prompts.map((p, index) => (
                    <div key={p.id} className="relative group">
                      <div className="flex gap-3">
                        <div className="hidden sm:flex flex-col items-center justify-start pt-4 w-6">
                           <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 relative">
                          <textarea
                            value={p.text}
                            onChange={(e) => updatePromptText(p.id, e.target.value)}
                            placeholder="Describe the adjustment... e.g. 'Wearing ornate plate armor', 'Cyberpunk version', 'Holding a glowing staff'"
                            className={`w-full bg-white border-2 rounded-xl p-4 pr-10 focus:ring-4 focus:ring-ttrpg-100 focus:border-ttrpg-500 outline-none transition-all resize-none h-24 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-sm
                              ${p.status === 'processing' ? 'border-ttrpg-300 bg-ttrpg-50' : 'border-slate-200 hover:border-slate-300'}
                              ${p.status === 'success' ? 'border-green-300 bg-green-50' : ''}
                              ${p.status === 'error' ? 'border-red-300 bg-red-50' : ''}
                            `}
                            disabled={p.status === 'processing'}
                          />
                          
                          {/* Status Indicators inside textarea */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {p.status === 'idle' && prompts.length > 1 && (
                              <button 
                                onClick={() => removePrompt(p.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="Remove variation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {p.status === 'processing' && (
                              <Loader2 className="w-5 h-5 text-ttrpg-500 animate-spin" />
                            )}
                            {p.status === 'success' && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {p.status === 'error' && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={addPrompt}
                  variant="outline"
                  className="w-full border-dashed text-slate-500 border-slate-300 hover:border-ttrpg-400 hover:text-ttrpg-600 hover:bg-ttrpg-50 py-3"
                  disabled={isGenerating}
                >
                  <Plus className="w-4 h-4" /> Add Another Variation
                </Button>

                {globalError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex gap-3 items-start">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {globalError}
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    onClick={handleGenerate}
                    disabled={!sourceImage || isGenerating || prompts.every(p => !p.text.trim())}
                    isLoading={isGenerating}
                    className="w-full py-4 text-lg shadow-lg shadow-ttrpg-200 bg-ttrpg-600 hover:bg-ttrpg-700 border-0"
                  >
                    {isGenerating ? 'Generating Variations...' : 'Generate All'}
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    3 variations will be generated for each prompt description.
                  </p>
                </div>
              </section>
            </div>

            {/* Right Column: Output Gallery */}
            <div className="lg:col-span-8">
               <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-800">Generated Variations</h2>
                    <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                      {variationGroups.length > 0 ? `${variationGroups.length} sets` : 'No results'}
                    </span>
               </div>
               
               <div className="bg-white rounded-2xl min-h-[600px] p-2 border border-slate-200 shadow-sm">
                 <Gallery groups={variationGroups} />
               </div>
            </div>

          </div>
        </main>
      </div>
    </ApiKeyWrapper>
  );
};

export default App;