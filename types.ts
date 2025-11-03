
export enum AppState {
  LANDING,
  LOADING,
  RESULTS,
  ERROR,
}

export interface FurnitureInfo {
  co2_new: number;
  weight_kg: number;
  disposal_cost_per_kg: number;
  new_price: number;
}

export interface ImpactData {
  co2Saved: number;
  communityCostAvoided: number;
  valueCreated: number;
}

export interface AnalysisResult {
  furnitureType: string;
  furnitureMaterial: string;
  impact: ImpactData;
  location?: string;
}