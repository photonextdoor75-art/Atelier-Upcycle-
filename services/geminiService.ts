// FIX: Refactored to initialize GoogleGenAI client once at the module level and removed the explicit API key check, adhering to coding guidelines.
import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, ImpactData } from '../types';
import { furnitureData } from './data';

/**
 * Per coding guidelines, the API key is assumed to be available in process.env.API_KEY.
 * The client is initialized once and reused.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


function calculateImpact(furnitureIdentifier: string): ImpactData {
  const key = furnitureIdentifier.toLowerCase();
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
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Data,
    },
  };
  
  const furnitureIdentifiers = Object.keys(furnitureData);
  
  let promptText = `Analyze this image of a piece of furniture. Identify the furniture from the provided list.
      
      Valid furniture identifiers: ${furnitureIdentifiers.join(', ')}
      
      Respond ONLY with a JSON object matching the specified schema. If you cannot determine the type, use "unknown".`;


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
                  furnitureType: { type: Type.STRING, enum: [...furnitureIdentifiers, "unknown"], description: "The identifier of the furniture, including material and type (e.g., 'wooden chair')." },
              },
              required: ['furnitureType']
          },
      },
  });

  const jsonResponseText = response.text.trim();
  const result = JSON.parse(jsonResponseText);
  
  const { furnitureType } = result;

  if (furnitureType === 'unknown') {
    throw new Error("Désolé, l'IA n'a pas pu identifier le meuble. Essayez avec une autre photo.");
  }

  const impact = calculateImpact(furnitureType);

  return {
    furnitureType,
    impact,
    location: location ?? undefined,
  };
}