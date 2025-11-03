import { FurnitureInfo } from '../types';

export const furnitureData: { [key: string]: FurnitureInfo } = {
  'wooden chair': {
    co2_new: 25,
    weight_kg: 5,
    disposal_cost_per_kg: 1,
    new_price: 90,
  },
  'wooden table': {
    co2_new: 80,
    weight_kg: 30,
    disposal_cost_per_kg: 1,
    new_price: 215,
  },
  'wooden cabinet': {
    co2_new: 150,
    weight_kg: 60,
    disposal_cost_per_kg: 1,
    new_price: 315,
  },
  'wooden bookshelf': {
    co2_new: 120,
    weight_kg: 45,
    disposal_cost_per_kg: 1,
    new_price: 190,
  },
  'metal chair': {
    co2_new: 40,
    weight_kg: 8,
    disposal_cost_per_kg: 0.8,
    new_price: 115,
  },
  'metal cabinet': {
    co2_new: 200,
    weight_kg: 70,
    disposal_cost_per_kg: 0.8,
    new_price: 365,
  },
  'plastic chair': {
    co2_new: 15,
    weight_kg: 3,
    disposal_cost_per_kg: 1.2,
    new_price: 55,
  },
};

// Conversion factor: 1 kg CO2 is roughly equivalent to 5 km driven in an average car.
export const CO2_KM_DRIVEN_FACTOR = 5;

// Average cost of materials for upcycling
export const UPCYCLING_COSTS = 30; // in Euros