export type IrrigationLineConfig = {
  plantKey: string;
  maintenanceLevel: number; // 0–100
  locationKey: string;
  intervalDays: number;
  areaSizeM2: number;
  treeCount?: number;
  techniqueKey: 'drip';
  techniqueConfig: {
    distance: number;       // meters between drippers (default 0.5)
    flowRate: number;       // L/h per dripper (default 2.3)
  };
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

export type DripTechniqueCatalog = {
  key: 'drip';
  name: string;
  distanceOptions: number[];
  flowOptions: number[];
};

export type IrrigationCatalogResponse = {
  plants: PlantCatalogItem[];
  locations: LocationCatalogItem[];
  techniques: DripTechniqueCatalog[];
};

export type CalculateIrrigationResponse = {
  calculation: IrrigationCalculation;
};

export type ApiIrrigationLine = {
  _id: string;
  gardenId: string;
  name: string;
  isActive: boolean;
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
  config?: IrrigationLineConfig;
};

export type DeleteLinePayload = {
  gardenId: string;
  lineId: string;
};
