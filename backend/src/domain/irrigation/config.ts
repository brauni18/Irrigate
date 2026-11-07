import {
  DRIP_TECHNIQUE_CATALOG,
  LOCATIONS_CATALOG,
  PLANTS_CATALOG,
  SPRINKLER_TECHNIQUE_CATALOG,
} from './catalog.js';

export type TechniqueConfig = {
  distance: number;
  flowRate: number;
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
  maintenanceLevel: number;
  locationKey: string;
  intervalDays: number;
  areaSizeM2: number;
  treeCount?: number;
  sprinklerCount?: number;
  sprinklerConfigs?: SprinklerConfig[];
  techniqueKey: 'drip' | 'sprinkler';
  calculationMode?: 'modern' | 'legacy';
  legacy?: LegacyIrrigationConfig;
  techniqueConfig: TechniqueConfig;
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
  techniqueConfig?: Partial<TechniqueConfig>;
};

const SPRINKLER_FLOW_RATE_LPH_PER_LPM = 60;

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

export function translateIncomingSprinklerFlowUnits(config: IrrigationLineConfig): IrrigationLineConfig {
  if (config.techniqueKey !== 'sprinkler') {
    return config;
  }

  return {
    ...config,
    techniqueConfig: {
      ...config.techniqueConfig,
      flowRate: Number.isFinite(config.techniqueConfig.flowRate)
        ? config.techniqueConfig.flowRate * SPRINKLER_FLOW_RATE_LPH_PER_LPM
        : config.techniqueConfig.flowRate,
    },
    sprinklerConfigs: config.sprinklerConfigs?.map((sprinkler) => ({
      ...sprinkler,
      flowRate: Number.isFinite(sprinkler.flowRate)
        ? sprinkler.flowRate * SPRINKLER_FLOW_RATE_LPH_PER_LPM
        : sprinkler.flowRate,
    })),
  };
}

export function translateIncomingSprinklerFlowUnitsPatch(
  patch: IrrigationLineConfigPatch,
  currentTechniqueKey?: IrrigationLineConfig['techniqueKey'],
): IrrigationLineConfigPatch {
  const techniqueKey = patch.techniqueKey ?? currentTechniqueKey;
  const techniqueFlowRate = patch.techniqueConfig?.flowRate;
  if (techniqueKey !== 'sprinkler') {
    return patch;
  }

  const techniqueConfig = patch.techniqueConfig
    ? { ...patch.techniqueConfig }
    : patch.techniqueConfig;

  if (techniqueConfig && typeof techniqueFlowRate === 'number' && Number.isFinite(techniqueFlowRate)) {
    techniqueConfig.flowRate = techniqueFlowRate * SPRINKLER_FLOW_RATE_LPH_PER_LPM;
  }

  return {
    ...patch,
    techniqueConfig,
    sprinklerConfigs: patch.sprinklerConfigs?.map((sprinkler) => ({
      ...sprinkler,
      flowRate: Number.isFinite(sprinkler.flowRate)
        ? sprinkler.flowRate * SPRINKLER_FLOW_RATE_LPH_PER_LPM
        : sprinkler.flowRate,
    })),
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

function getNormalizedSprinklerCount(config: IrrigationLineConfig) {
  if (Number.isFinite(config.sprinklerCount) && (config.sprinklerCount ?? 0) > 0) {
    return Math.max(1, Math.round(config.sprinklerCount ?? 0));
  }

  const distance = config.techniqueConfig.distance;
  if (!Number.isFinite(distance) || distance <= 0) {
    return undefined;
  }

  if (!Number.isFinite(config.areaSizeM2) || config.areaSizeM2 <= 0) {
    return undefined;
  }

  return Math.max(1, Math.round(config.areaSizeM2 / distance ** 2));
}

function getNormalizedSprinklerConfigs(config: IrrigationLineConfig) {
  if (!config.sprinklerConfigs || config.sprinklerConfigs.length === 0) {
    return undefined;
  }

  return config.sprinklerConfigs.map((sprinkler) => ({
    distance: sprinkler.distance,
    flowRate: sprinkler.flowRate,
    sprinklerCount: Math.max(1, Math.round(sprinkler.sprinklerCount)),
  }));
}

function aggregateSprinklerConfigs(sprinklerConfigs: SprinklerConfig[]) {
  const totalSprinklerCount = sprinklerConfigs.reduce((sum, sprinkler) => sum + sprinkler.sprinklerCount, 0);
  const totalFlowRate = sprinklerConfigs.reduce(
    (sum, sprinkler) => sum + sprinkler.flowRate * sprinkler.sprinklerCount,
    0,
  );
  const totalWeightedDistance = sprinklerConfigs.reduce(
    (sum, sprinkler) => sum + sprinkler.distance * sprinkler.sprinklerCount,
    0,
  );

  const averageFlowRate = totalSprinklerCount > 0 ? totalFlowRate / totalSprinklerCount : 0;
  const averageDistance = totalSprinklerCount > 0 ? totalWeightedDistance / totalSprinklerCount : 0;

  return {
    totalSprinklerCount,
    averageFlowRate,
    averageDistance,
  };
}

export function normalizeIrrigationConfig(config: IrrigationLineConfig): IrrigationLineConfig {
  if (config.techniqueKey === 'sprinkler') {
    const sprinklerConfigs = getNormalizedSprinklerConfigs(config);

    if (sprinklerConfigs && sprinklerConfigs.length > 0) {
      const aggregate = aggregateSprinklerConfigs(sprinklerConfigs);

      if (aggregate.totalSprinklerCount <= 0) {
        return config;
      }

      return {
        ...config,
        sprinklerConfigs,
        sprinklerCount: aggregate.totalSprinklerCount,
        techniqueConfig: {
          distance: aggregate.averageDistance,
          flowRate: aggregate.averageFlowRate,
        },
      };
    }

    const sprinklerCount = getNormalizedSprinklerCount(config);
    if (!sprinklerCount) {
      return config;
    }

    return {
      ...config,
      sprinklerCount,
    };
  }

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

type IrrigationValidationOptions = {
  relaxTechniqueOptionValidation?: boolean;
};

export function validateIrrigationConfig(
  config: IrrigationLineConfig,
  options?: IrrigationValidationOptions,
): string[] {
  const errors: string[] = [];
  const relaxTechniqueOptionValidation = options?.relaxTechniqueOptionValidation ?? false;

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

  if (normalized.techniqueKey === 'sprinkler') {
    if (!Number.isFinite(normalized.sprinklerCount) || (normalized.sprinklerCount ?? 0) <= 0) {
      errors.push('sprinklerCount must be a number greater than 0');
    }

    if (normalized.sprinklerConfigs && normalized.sprinklerConfigs.length > 0) {
      normalized.sprinklerConfigs.forEach((sprinkler, index) => {
        if (!Number.isFinite(sprinkler.sprinklerCount) || sprinkler.sprinklerCount <= 0) {
          errors.push(`sprinklerConfigs[${index}].sprinklerCount must be a number greater than 0`);
        }

        if (!Number.isFinite(sprinkler.distance) || sprinkler.distance <= 0) {
          errors.push(`sprinklerConfigs[${index}].distance must be a number greater than 0`);
        }

        if (!Number.isFinite(sprinkler.flowRate) || sprinkler.flowRate <= 0) {
          errors.push(`sprinklerConfigs[${index}].flowRate must be a number greater than 0`);
        }
      });
    }
  }

  const activeTechniqueCatalog = normalized.techniqueKey === 'sprinkler'
    ? SPRINKLER_TECHNIQUE_CATALOG
    : DRIP_TECHNIQUE_CATALOG;

  if (normalized.techniqueKey !== activeTechniqueCatalog.key) {
    errors.push('Invalid techniqueKey');
    return errors;
  }

  if (
    normalized.techniqueKey === 'sprinkler'
    && !(normalized.sprinklerConfigs && normalized.sprinklerConfigs.length > 0)
    && (!Number.isFinite(normalized.techniqueConfig.distance) || normalized.techniqueConfig.distance <= 0)
  ) {
    errors.push('sprinkler distance must be a number greater than 0');
  }

  if (
    normalized.techniqueKey !== 'sprinkler'
    && !relaxTechniqueOptionValidation
    && !activeTechniqueCatalog.distanceOptions.includes(normalized.techniqueConfig.distance)
  ) {
    errors.push(`Invalid ${activeTechniqueCatalog.key} distance option`);
  }

  if (
    normalized.techniqueKey === 'sprinkler'
    && !(normalized.sprinklerConfigs && normalized.sprinklerConfigs.length > 0)
    && (!Number.isFinite(normalized.techniqueConfig.flowRate) || normalized.techniqueConfig.flowRate <= 0)
  ) {
    errors.push('sprinkler flowRate must be a number greater than 0');
  }

  if (
    normalized.techniqueKey !== 'sprinkler'
    && !relaxTechniqueOptionValidation
    && !activeTechniqueCatalog.flowOptions.includes(normalized.techniqueConfig.flowRate)
  ) {
    errors.push(`Invalid ${activeTechniqueCatalog.key} flow option`);
  }

  return errors;
}
