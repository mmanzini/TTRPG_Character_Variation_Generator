export interface GeneratedImage {
  id: string;
  url: string;
}

export interface VariationGroup {
  id: string;
  prompt: string;
  timestamp: number;
  images: GeneratedImage[];
  status: 'generating' | 'completed' | 'error';
}

export interface GenerationConfig {
  aspectRatio: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
  imageSize: '1K' | '2K'; // Gemini 3 Pro supports up to 2K/4K
}
