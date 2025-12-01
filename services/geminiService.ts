import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from "../types";

// Helper to convert Blob/File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateVariation = async (
  sourceImageBase64: string,
  prompt: string,
  config: GenerationConfig,
  mimeType: string = 'image/png'
): Promise<string> => {
  // Always create a new instance to ensure we pick up the latest selected key from process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: sourceImageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          imageSize: config.imageSize, // Using high quality since it is 3-pro
        },
      },
    });

    // Extract image from response
    // The response structure typically contains candidates -> content -> parts
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    // Find the inlineData part
    const imagePart = parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};