import React from 'react';
import { Download, Maximize2, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { VariationGroup } from '../types';

interface GalleryProps {
  groups: VariationGroup[];
}

export const Gallery: React.FC<GalleryProps> = ({ groups }) => {
  if (groups.length === 0) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-8">
        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
            <Maximize2 className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-lg font-medium text-slate-700">No variations generated yet</p>
        <p className="text-sm text-slate-500 mt-2 max-w-xs text-center">
          Upload your character sketch and add a prompt to see your TTRPG variations appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {groups.map((group) => (
        <div key={group.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Section Header */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="p-2 bg-ttrpg-50 rounded-lg shrink-0 mt-0.5 border border-ttrpg-100">
                    {group.status === 'generating' ? (
                        <Loader2 className="w-5 h-5 text-ttrpg-600 animate-spin" />
                    ) : group.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                        <Wand2 className="w-5 h-5 text-ttrpg-600" />
                    )}
                </div>
                <div>
                    <h3 className="text-base font-semibold text-slate-800 leading-snug">
                        {group.prompt}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {group.status === 'generating' ? 'Generating 3 variations...' : 
                         group.status === 'error' ? 'Failed to generate' : 
                         new Date(group.timestamp).toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Grid of 3 images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.status === 'generating' ? (
                    // Loading Skeletons
                    [1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse border border-slate-200 flex items-center justify-center">
                            <Wand2 className="w-8 h-8 text-slate-300" />
                        </div>
                    ))
                ) : group.status === 'error' ? (
                    <div className="col-span-3 py-12 text-center text-slate-500 bg-red-50 rounded-xl border border-dashed border-red-200">
                        Failed to generate images for this prompt.
                    </div>
                ) : (
                    // Actual Images
                    group.images.map((img, idx) => (
                        <div 
                            key={img.id} 
                            className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                        <div className="aspect-square w-full bg-slate-50">
                            <img 
                            src={img.url} 
                            alt={`${group.prompt} variation ${idx + 1}`} 
                            className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 backdrop-blur-[1px]">
                            <a 
                                href={img.url} 
                                download={`ttrpg-char-${group.id}-${idx}.png`}
                                className="bg-white hover:bg-slate-50 text-slate-900 py-2.5 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Download className="w-4 h-4" /> Download
                            </a>
                        </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="h-px bg-slate-200 w-full mt-8" />
        </div>
      ))}
    </div>
  );
};