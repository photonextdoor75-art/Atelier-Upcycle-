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
   'particle board table': {
    co2_new: 60,
    weight_kg: 25,
    disposal_cost_per_kg: 1.5,
    new_price: 150,
  },
  'fabric sofa': {
    co2_new: 250,
    weight_kg: 80,
    disposal_cost_per_kg: 1.2,
    new_price: 600,
  }
};
