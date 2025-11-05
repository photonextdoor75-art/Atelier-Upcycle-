// FIX: Removed self-import of AppState which caused a circular dependency and compilation errors.
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
  impact: ImpactData;
  location?: string;
  condition?: string;
  environment?: 'indoor' | 'outdoor';
  uploadTimestamp?: number;
}