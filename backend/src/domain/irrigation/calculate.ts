import { LOCATIONS_CATALOG, PLANTS_CATALOG } from './catalog.js';
import { getEffectiveIrrigationAreaM2, normalizeIrrigationConfig, type IrrigationLineConfig } from './config.js';

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

function computePlantCoefficient(minCoeff: number, maxCoeff: number, maintenanceLevel: number) {
  return minCoeff + (maxCoeff - minCoeff) * (maintenanceLevel / 100);
}

function formatDuration(timeInHours: number) {
  const hours = Math.floor(timeInHours);
  const minutes = Math.floor((timeInHours - hours) * 60);
  const seconds = Math.floor(((timeInHours - hours) * 60 - minutes) * 60);

  return { hours, minutes, seconds };
}

function calculateBaseValues(
  config: IrrigationLineConfig,
  plantCoeff: number,
  locationCoeff: number,
  areaSizeM2: number,
) {
  const waterPortion = plantCoeff * locationCoeff * config.intervalDays * (areaSizeM2 / 1000);

  return {
    waterPortion,
    coefficients: {
      plantCoeff,
      locationCoeff,
    },
  };
}

function calculateDripIrrigation(
  config: IrrigationLineConfig,
  plantCoeff: number,
  locationCoeff: number,
  areaSizeM2: number,
) {
  const emitterCount = areaSizeM2 / config.techniqueConfig.distance ** 2;
  const drippersFlow = (emitterCount * config.techniqueConfig.flowRate) / 1000;
  const { waterPortion } = calculateBaseValues(config, plantCoeff, locationCoeff, areaSizeM2);

  return {
    waterPortion,
    dripPresCount: emitterCount,
    drippersFlow,
    timeInHours: waterPortion / drippersFlow,
  };
}

function calculateSprinklerIrrigation(
  config: IrrigationLineConfig,
  plantCoeff: number,
  locationCoeff: number,
  areaSizeM2: number,
) {
  const sprinklerFlowRateLph = config.sprinklerConfigs
    ? config.sprinklerConfigs.reduce(
        (sum, sprinkler) => sum + sprinkler.sprinklerCount * sprinkler.flowRate,
        0,
      )
    : undefined;

  const emitterCount = Math.max(1, config.sprinklerCount ?? 1);
  const drippersFlow = sprinklerFlowRateLph !== undefined
    ? sprinklerFlowRateLph / 1000
    : (emitterCount * config.techniqueConfig.flowRate) / 1000;
  const { waterPortion } = calculateBaseValues(config, plantCoeff, locationCoeff, areaSizeM2);

  return {
    waterPortion,
    dripPresCount: emitterCount,
    drippersFlow,
    timeInHours: waterPortion / drippersFlow,
  };
}

export function calculateIrrigation(config: IrrigationLineConfig): IrrigationCalculation {
  const normalized = normalizeIrrigationConfig(config);
  const plant = PLANTS_CATALOG[normalized.plantKey];
  const location = LOCATIONS_CATALOG[normalized.locationKey];
  const plantCoeff = computePlantCoefficient(plant.minCoeff, plant.maxCoeff, normalized.maintenanceLevel);
  const locationCoeff = location.coeff;
  const areaSizeM2 = getEffectiveIrrigationAreaM2(normalized);

  const calculation = normalized.techniqueKey === 'sprinkler'
    ? calculateSprinklerIrrigation(normalized, plantCoeff, locationCoeff, areaSizeM2)
    : calculateDripIrrigation(normalized, plantCoeff, locationCoeff, areaSizeM2);

  return {
    ...calculation,
    duration: formatDuration(calculation.timeInHours),
    coefficients: {
      plantCoeff,
      locationCoeff,
    },
  };
}
