import { PLANT_TYPE_OPTIONS } from '@/consts/AddLineDialog.consts';
import type { IrrigationLineConfig, SprinklerConfig } from '@/types/irrigationLine.type';
import type { CatalogPlants, PlantLikeOption } from '@/types/AddLineDialog.types';

const SPRINKLER_FLOW_RATE_LPH_PER_LPM = 60;

export function formatDuration(hours: number, minutes: number, seconds: number) {
  const padded = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const compactParts: string[] = [];

  if (hours > 0) compactParts.push(`${hours} hr`);
  if (minutes > 0) compactParts.push(`${minutes} min`);
  if (seconds > 0 || compactParts.length === 0) compactParts.push(`${seconds} sec`);

  return { padded, compact: compactParts.join(' ') };
}

export function findPlantOption(plantKey: string, catalogPlants?: CatalogPlants): PlantLikeOption | undefined {
  const catalogPlant = catalogPlants?.find((plant) => plant.key === plantKey);
  if (catalogPlant) return catalogPlant;

  const fallbackPlant = PLANT_TYPE_OPTIONS.find((option) => option.value === plantKey);
  if (!fallbackPlant) return undefined;

  return {
    key: fallbackPlant.value,
    measurementMode: fallbackPlant.measurementMode as 'area' | 'count',
    areaPerUnitM2: fallbackPlant.areaPerUnitM2,
    recommendedIntervalDays: fallbackPlant.recommendedIntervalDays,
  };
}

export function getResolvedTreeCount(config: IrrigationLineConfig, areaPerUnitM2: number) {
  if (Number.isFinite(config.treeCount) && (config.treeCount ?? 0) > 0) {
    return Math.max(1, Math.round(config.treeCount ?? 0));
  }

  if (Number.isFinite(config.areaSizeM2) && config.areaSizeM2 > 0) {
    return Math.max(1, Math.round(config.areaSizeM2 / areaPerUnitM2));
  }

  return 1;
}

export function toSprinklerConfigs(config: IrrigationLineConfig, defaultSprinklerConfig: SprinklerConfig): SprinklerConfig[] {
  if (config.sprinklerConfigs && config.sprinklerConfigs.length > 0) {
    return config.sprinklerConfigs.map((sprinkler) => ({
      distance: sprinkler.distance,
      flowRate: sprinkler.flowRate,
      sprinklerCount: Math.max(1, Math.round(sprinkler.sprinklerCount)),
    }));
  }

  const singleConfigCount = Number.isFinite(config.sprinklerCount) && (config.sprinklerCount ?? 0) > 0
    ? Math.max(1, Math.round(config.sprinklerCount ?? 0))
    : defaultSprinklerConfig.sprinklerCount;

  return [
    {
      distance: Number.isFinite(config.techniqueConfig.distance) ? config.techniqueConfig.distance : defaultSprinklerConfig.distance,
      flowRate: Number.isFinite(config.techniqueConfig.flowRate) ? config.techniqueConfig.flowRate : defaultSprinklerConfig.flowRate,
      sprinklerCount: singleConfigCount,
    },
  ];
}

export function toEditableSprinklerConfig(config: IrrigationLineConfig): IrrigationLineConfig {
  if (config.techniqueKey !== 'sprinkler') {
    return config;
  }

  return {
    ...config,
    techniqueConfig: {
      ...config.techniqueConfig,
      flowRate: Number.isFinite(config.techniqueConfig.flowRate)
        ? config.techniqueConfig.flowRate / SPRINKLER_FLOW_RATE_LPH_PER_LPM
        : config.techniqueConfig.flowRate,
    },
    sprinklerConfigs: config.sprinklerConfigs?.map((sprinkler) => ({
      ...sprinkler,
      flowRate: Number.isFinite(sprinkler.flowRate)
        ? sprinkler.flowRate / SPRINKLER_FLOW_RATE_LPH_PER_LPM
        : sprinkler.flowRate,
    })),
  };
}

export function aggregateSprinklerConfigs(
  sprinklerConfigs: SprinklerConfig[],
  fallbackDistance: number,
) {
  const totalSprinklerCount = sprinklerConfigs.reduce((sum, sprinkler) => sum + sprinkler.sprinklerCount, 0);
  const totalFlowRate = sprinklerConfigs.reduce((sum, sprinkler) => sum + sprinkler.flowRate * sprinkler.sprinklerCount, 0);
  const weightedDistance = sprinklerConfigs.reduce((sum, sprinkler) => sum + sprinkler.distance * sprinkler.sprinklerCount, 0);

  return {
    totalSprinklerCount,
    totalFlowRate,
    averageDistance: totalSprinklerCount > 0 ? weightedDistance / totalSprinklerCount : fallbackDistance,
  };
}