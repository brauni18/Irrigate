import { DRIP_TECHNIQUE_CATALOG, LOCATIONS_CATALOG, PLANTS_CATALOG } from './catalog.js';

export type DripTechniqueConfig = {
  distance: number;
  flowRate: number;
};

export type IrrigationLineConfig = {
  plantKey: string;
  maintenanceLevel: number;
  locationKey: string;
  intervalDays: number;
  areaSizeM2: number;
  treeCount?: number;
  techniqueKey: 'drip';
  techniqueConfig: DripTechniqueConfig;
};

export const DEFAULT_IRRIGATION_LINE_CONFIG: IrrigationLineConfig = {
  plantKey: 'bush',
  maintenanceLevel: 0,
  locationKey: 'center',
  intervalDays: 2,
  areaSizeM2: 10,
  techniqueKey: 'drip',
  techniqueConfig: {
    distance: 0.5,
    flowRate: 2.3,
  },
};

export type IrrigationLineConfigPatch = Partial<Omit<IrrigationLineConfig, 'techniqueConfig'>> & {
  techniqueConfig?: Partial<DripTechniqueConfig>;
};

export function mergeIrrigationConfig(
  current: IrrigationLineConfig,
  patch?: IrrigationLineConfigPatch,
): IrrigationLineConfig {
  if (!patch) return current;

  return {
    ...current,
    ...patch,
    techniqueConfig: {
      ...current.techniqueConfig,
      ...patch.techniqueConfig,
    },
  };
}

function getTreeAreaPerUnitM2(plantKey: string) {
  const plant = PLANTS_CATALOG[plantKey];
  return plant?.measurementMode === 'count' ? plant.areaPerUnitM2 ?? 4 : undefined;
}

function getNormalizedTreeCount(config: IrrigationLineConfig) {
  if (Number.isFinite(config.treeCount) && (config.treeCount ?? 0) > 0) {
    return Math.max(1, Math.round(config.treeCount ?? 0));
  }

  const areaPerUnitM2 = getTreeAreaPerUnitM2(config.plantKey);
  if (!areaPerUnitM2 || !Number.isFinite(config.areaSizeM2) || config.areaSizeM2 <= 0) {
    return undefined;
  }

  return Math.max(1, Math.round(config.areaSizeM2 / areaPerUnitM2));
}

export function normalizeIrrigationConfig(config: IrrigationLineConfig): IrrigationLineConfig {
  const plant = PLANTS_CATALOG[config.plantKey];
  if (plant?.measurementMode !== 'count') {
    return config;
  }

  const areaPerUnitM2 = plant.areaPerUnitM2 ?? 4;
  const treeCount = getNormalizedTreeCount(config);

  if (!treeCount) {
    return config;
  }

  return {
    ...config,
    treeCount,
    areaSizeM2: treeCount * areaPerUnitM2,
    intervalDays: Number.isFinite(config.intervalDays) && config.intervalDays > 0
      ? config.intervalDays
      : plant.recommendedIntervalDays ?? config.intervalDays,
  };
}

export function getEffectiveIrrigationAreaM2(config: IrrigationLineConfig) {
  return normalizeIrrigationConfig(config).areaSizeM2;
}

export function validateIrrigationConfig(config: IrrigationLineConfig): string[] {
  const errors: string[] = [];

  const normalized = normalizeIrrigationConfig(config);
  const plant = PLANTS_CATALOG[normalized.plantKey];

  if (!plant) {
    errors.push('Invalid plantKey');
  }

  if (!LOCATIONS_CATALOG[normalized.locationKey]) {
    errors.push('Invalid locationKey');
  }

  if (!Number.isFinite(normalized.maintenanceLevel) || normalized.maintenanceLevel < 0 || normalized.maintenanceLevel > 100) {
    errors.push('maintenanceLevel must be a number between 0 and 100');
  }

  if (!Number.isFinite(normalized.intervalDays) || normalized.intervalDays <= 0) {
    errors.push('intervalDays must be a number greater than 0');
  }

  if (!Number.isFinite(normalized.areaSizeM2) || normalized.areaSizeM2 <= 0) {
    errors.push('areaSizeM2 must be a number greater than 0');
  }

  if (plant?.measurementMode === 'count') {
    if (!Number.isFinite(normalized.treeCount) || (normalized.treeCount ?? 0) <= 0) {
      errors.push('treeCount must be a number greater than 0');
    }
  }

  if (normalized.techniqueKey !== DRIP_TECHNIQUE_CATALOG.key) {
    errors.push('Invalid techniqueKey');
    return errors;
  }

  if (!DRIP_TECHNIQUE_CATALOG.distanceOptions.includes(normalized.techniqueConfig.distance)) {
    errors.push('Invalid drip distance option');
  }

  if (!DRIP_TECHNIQUE_CATALOG.flowOptions.includes(normalized.techniqueConfig.flowRate)) {
    errors.push('Invalid drip flow option');
  }

  return errors;
}
