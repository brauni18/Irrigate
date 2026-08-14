export type PlantCatalogItem = {
  key: string;
  name: string;
  emoji: string;
  minCoeff: number;
  maxCoeff: number;
  description: string;
  measurementMode: 'area' | 'count';
  areaPerUnitM2?: number;
  recommendedIntervalDays?: number;
};

export type LocationCatalogItem = {
  key: string;
  name: string;
  coeff: number;
};

export type DripTechniqueCatalog = {
  key: 'drip';
  name: string;
  distanceOptions: number[];
  flowOptions: number[];
};

export const PLANTS_CATALOG: Record<string, PlantCatalogItem> = {
  trees: {
    key: 'trees',
    name: 'Trees',
    emoji: '\uD83C\uDF33',
    minCoeff: 0.3,
    maxCoeff: 0.4,
    description: 'Deep-rooted, drought tolerant once established',
    measurementMode: 'count',
    areaPerUnitM2: 4,
    recommendedIntervalDays: 7,
  },
  roses: {
    key: 'roses',
    name: 'Roses',
    emoji: '\uD83C\uDF39',
    minCoeff: 0.5,
    maxCoeff: 0.65,
    description: 'Require consistent moisture and nutrients',
    measurementMode: 'area',
  },
  grass: {
    key: 'grass',
    name: 'Grass',
    emoji: '\uD83C\uDF31',
    minCoeff: 0.3,
    maxCoeff: 0.6,
    description: 'Water needs vary greatly by maintenance level',
    measurementMode: 'area',
  },
  bush: {
    key: 'bush',
    name: 'Bush',
    emoji: '\uD83C\uDF3F',
    minCoeff: 0.25,
    maxCoeff: 0.45,
    description: 'Moderate water needs, adaptable',
    measurementMode: 'area',
  },
  'small-bush': {
    key: 'small-bush',
    name: 'Small Bush',
    emoji: '\uD83E\uDEB4',
    minCoeff: 0.5,
    maxCoeff: 0.6,
    description: 'Higher water needs due to smaller root system',
    measurementMode: 'area',
  },
  'water-wise': {
    key: 'water-wise',
    name: 'Water-wise Plants',
    emoji: '\uD83C\uDF35',
    minCoeff: 0.01,
    maxCoeff: 0.2,
    description: 'Drought-adapted, minimal water requirements',
    measurementMode: 'area',
  },
};

export const LOCATIONS_CATALOG: Record<string, LocationCatalogItem> = {
  north: { key: 'north', name: 'North', coeff: 6.47 },
  golan_heights: { key: 'golan_heights', name: 'Golan Heights & Ahola', coeff: 7.5 },
  emek_bit_shean: { key: 'emek_bit_shean', name: 'Emek Bit Shean', coeff: 7.96 },
  center: { key: 'center', name: 'Center', coeff: 6.55 },
  south: { key: 'south', name: 'South', coeff: 6.91 },
  negev: { key: 'negev', name: 'Negev', coeff: 8.29 },
  eilat_dead_sea: { key: 'eilat_dead_sea', name: 'Eilat & Dead Sea', coeff: 11.1 },
};

export const DRIP_TECHNIQUE_CATALOG: DripTechniqueCatalog = {
  key: 'drip',
  name: 'Drip Irrigation',
  distanceOptions: [0.3, 0.5, 1.0],
  flowOptions: [1.6, 2.3, 3.5],
};

export function getIrrigationCatalog() {
  return {
    plants: Object.values(PLANTS_CATALOG),
    locations: Object.values(LOCATIONS_CATALOG),
    techniques: [DRIP_TECHNIQUE_CATALOG],
  };
}
