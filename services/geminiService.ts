// FIX: Refactored to initialize GoogleGenAI client once at the module level and removed the explicit API key check, adhering to coding guidelines.
import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, ImpactData } from '../types';
import { furnitureData } from './data';

/**
 * Per coding guidelines, the API key is assumed to be available in process.env.API_KEY.
 * The client is initialized once and reused.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


function calculateImpact(furnitureIdentifier: string, condition: string): ImpactData {
  const key = furnitureIdentifier.toLowerCase();
  // Fallback to a default if the exact combination is not found
  const data = furnitureData[key] || furnitureData['wooden chair']; 

  const co2New = data.co2_new;
  // A small constant CO2 cost for upcycling (e.g., transport, paint)
  const co2Upcycle = 5; 
  const co2Saved = co2New - co2Upcycle;

  const communityCostAvoided = data.weight_kg * data.disposal_cost_per_kg;
  
  // Upcycling costs now depend on the furniture's condition
  const conditionMultipliers: { [key: string]: number } = {
    'good': 0.15, // 15% of new price for items in good condition
    'average': 0.30, // 30% for average condition
    'poor': 0.60, // 60% for poor condition
  };
  const multiplier = conditionMultipliers[condition] || 0.30;
  const upcyclingCosts = data.new_price * multiplier;
  const valueCreated = data.new_price - upcyclingCosts;

  return { 
    co2Saved: Math.max(0, co2Saved), 
    communityCostAvoided: Math.max(0, communityCostAvoided), 
    valueCreated: valueCreated // Can now be negative
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
  
  let promptText = `Analyze this image of a piece of furniture. Identify its type, assess its condition, and determine its environment.
      
      Valid furniture identifiers: ${furnitureIdentifiers.join(', ')}
      Valid conditions: good, average, poor
      Valid environments: indoor, outdoor
      
      - "indoor": The furniture is inside a building like a house or apartment.
      - "outdoor": The furniture is outside, on a street, sidewalk, or appears abandoned.
      
      Respond ONLY with a JSON object matching the specified schema. 
      If you cannot determine a value, use a reasonable default ("unknown" for type, "average" for condition, "indoor" for environment).`;


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
                  condition: { type: Type.STRING, enum: ['good', 'average', 'poor'], description: "The physical condition of the furniture." },
                  environment: { type: Type.STRING, enum: ['indoor', 'outdoor'], description: "Whether the furniture is indoors or outdoors." },
              },
              required: ['furnitureType', 'condition', 'environment']
          },
      },
  });

  const jsonResponseText = response.text.trim();
  const result = JSON.parse(jsonResponseText);
  
  const { furnitureType, condition, environment } = result;

  if (furnitureType === 'unknown') {
    throw new Error("Désolé, l'IA n'a pas pu identifier le meuble. Essayez avec une autre photo.");
  }

  const impact = calculateImpact(furnitureType, condition);

  return {
    furnitureType,
    impact,
    location: location ?? undefined,
    condition,
    environment,
  };
}