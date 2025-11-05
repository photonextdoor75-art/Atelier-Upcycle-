import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, ImpactData } from '../types';
import { furnitureData } from './data';

/**
 * Creates and returns a GoogleGenAI client instance.
 * Throws an error if the API key is not configured.
 * This function is called on-demand to ensure the environment variable is loaded.
 */
const getAiClient = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("La clé API n'est pas configurée. Veuillez l'ajouter dans les secrets (variables d'environnement) de votre projet et redéployer.");
    }
    return new GoogleGenAI({ apiKey });
};


const furnitureTypes = Object.keys(furnitureData);
const materials = ['wood', 'metal', 'particle board', 'plastic', 'fabric'];

function calculateImpact(type: string, material: string): ImpactData {
  const key = `${material} ${type}`.toLowerCase();
  // Fallback to a default if the exact combination is not found
  const data = furnitureData[key] || furnitureData['wooden chair']; 

  const co2New = data.co2_new;
  // A small constant CO2 cost for upcycling (e.g., transport, paint)
  const co2Upcycle = 5; 
  const co2Saved = co2New - co2Upcycle;

  const communityCostAvoided = data.weight_kg * data.disposal_cost_per_kg;
  
  // A more realistic value created calculation
  const upcyclingCosts = data.new_price * 0.2; // Assume upcycling costs 20% of new price
  const valueCreated = data.new_price - upcyclingCosts;

  return { 
    co2Saved: Math.max(0, co2Saved), 
    communityCostAvoided: Math.max(0, communityCostAvoided), 
    valueCreated: Math.max(0, valueCreated) 
  };
}

export async function analyzeFurnitureImage(base64Data: string, location: string | null): Promise<AnalysisResult> {
  const ai = getAiClient(); // Initialize client just in time

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Data,
    },
  };
  
  let promptText = `Analyze this image of a piece of furniture. Identify the main furniture type and its primary material from the provided lists.
      
      Valid furniture types: ${furnitureTypes.join(', ')}
      Valid materials: ${materials.join(', ')}
      
      Respond ONLY with a JSON object matching the specified schema. If you cannot determine the type or material, use "unknown".`;

  if (location) {
      promptText += `\n\nThe user's location is: ${location}.`;
  }

  const textPart = { text: promptText };

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  furnitureType: { type: Type.STRING, enum: [...furnitureTypes, "unknown"], description: "The type of furniture." },
                  furnitureMaterial: { type: Type.STRING, enum: [...materials, "unknown"], description: "The primary material of the furniture." },
              },
              required: ['furnitureType', 'furnitureMaterial']
          },
      },
  });

  const jsonResponseText = response.text.trim();
  const result = JSON.parse(jsonResponseText);
  
  const { furnitureType, furnitureMaterial } = result;

  if (furnitureType === 'unknown' || furnitureMaterial === 'unknown') {
    throw new Error("Désolé, l'IA n'a pas pu identifier le type ou le matériau du meuble. Essayez avec une autre photo.");
  }

  const impact = calculateImpact(furnitureType, furnitureMaterial);

  return {
    furnitureType,
    furnitureMaterial,
    impact,
    location: location ?? undefined,
  };
}
