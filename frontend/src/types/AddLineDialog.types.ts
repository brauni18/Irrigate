import type { PlantCatalogItem } from '@/types/irrigationLine.type';

export type SelectOption = {
  value: string;
  label: string;
};

export type PlantLikeOption = {
  key: string;
  measurementMode: 'area' | 'count';
  areaPerUnitM2?: number;
  recommendedIntervalDays?: number;
};

export type CatalogPlants = PlantCatalogItem[] | undefined;