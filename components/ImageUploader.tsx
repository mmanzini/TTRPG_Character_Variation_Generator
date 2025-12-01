import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onClear: () => void;
  selectedImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onClear, selectedImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full h-80 rounded-xl overflow-hidden bg-slate-50 border-2 border-slate-200 shadow-lg">
        <div 
           className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iI2UzZThlZiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] absolute inset-0 opacity-50"
        />
        <img 
          src={selectedImage} 
          alt="Source" 
          className="w-full h-full object-contain relative z-10"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <button 
                onClick={onClear}
                className="bg-white text-slate-900 p-3 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-lg transform hover:scale-110"
                title="Remove image"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm z-20">
            Original Sketch
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-80 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 gap-4 cursor-pointer
        ${isDragging 
          ? 'border-ttrpg-500 bg-ttrpg-50' 
          : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
        }`}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
      />
      
      <div className={`p-4 rounded-full ${isDragging ? 'bg-ttrpg-100' : 'bg-slate-100'}`}>
        <Upload className={`w-8 h-8 ${isDragging ? 'text-ttrpg-600' : 'text-slate-400'}`} />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-800">Upload Character Sketch</h3>
        <p className="text-sm text-slate-500 mt-1">
          Drag & drop or click to browse
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Supports PNG, JPG, WEBP
        </p>
      </div>
    </div>
  );
};