export type IrrigationTechniqueCatalog = {
  key: 'drip' | 'sprinkler';
  name: string;
  distanceOptions: number[];
  flowOptions: number[];
};

export type SprinklerConfig = {
  distance: number;
  flowRate: number;
  sprinklerCount: number;
};

export type LegacyIrrigationConfig = {
  selectedWeekdays: string[];
  durationMinutes: number;
  areaSizeM2?: number | null;
};

export type IrrigationLineConfig = {
  plantKey: string;
  maintenanceLevel: number; // 0–100
  locationKey: string;
  intervalDays: number;
  areaSizeM2: number;
  treeCount?: number;
  sprinklerCount?: number;
  sprinklerConfigs?: SprinklerConfig[];
  techniqueKey: 'drip' | 'sprinkler';
  techniqueConfig: {
    distance: number;       // meters between drippers/sprinkler spacing (default 0.5/4)
    flowRate: number;       // L/h per emitter/head (default 2.3/30)
  };
  calculationMode?: 'modern' | 'legacy';
  legacy?: LegacyIrrigationConfig;
};

export type IrrigationCalculation = {
  waterPortion: number;
  dripPresCount: number;
  drippersFlow: number;
  timeInHours: number;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  coefficients: {
    plantCoeff: number;
    locationCoeff: number;
  };
};

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

export type IrrigationCatalogResponse = {
  plants: PlantCatalogItem[];
  locations: LocationCatalogItem[];
  techniques: IrrigationTechniqueCatalog[];
};

export type CalculateIrrigationResponse = {
  calculation: IrrigationCalculation;
};

export type IrrigationCalculationMode = 'modern' | 'legacy';

export type LegacyCalculationRequest = {
  durationMinutes: number;
  areaSizeM2?: number | null;
  selectedWeekdays?: string[];
};

export type CalculateIrrigationRequest = {
  config: IrrigationLineConfig;
  mode?: IrrigationCalculationMode;
  legacy?: LegacyCalculationRequest;
};

export type ApiIrrigationLine = {
  _id: string;
  gardenId: string;
  name: string;
  isActive: boolean;
  isPaused?: boolean;
  config?: IrrigationLineConfig;
  calculation?: IrrigationCalculation;
  createdAt: string;
  updatedAt: string;
};

export type CreateLinePayload = {
  gardenId: string;
  name: string;
  config: IrrigationLineConfig;
};

export type UpdateLinePayload = {
  gardenId: string;
  lineId: string;
  name?: string;
  isActive?: boolean;
  isPaused?: boolean;
  config?: IrrigationLineConfig;
};

export type DeleteLinePayload = {
  gardenId: string;
  lineId: string;
};
