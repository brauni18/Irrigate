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

export function calculateIrrigation(config: IrrigationLineConfig): IrrigationCalculation {
  const normalized = normalizeIrrigationConfig(config);
  const plant = PLANTS_CATALOG[normalized.plantKey];
  const location = LOCATIONS_CATALOG[normalized.locationKey];
  const plantCoeff = computePlantCoefficient(plant.minCoeff, plant.maxCoeff, normalized.maintenanceLevel);
  const locationCoeff = location.coeff;
  const areaSizeM2 = getEffectiveIrrigationAreaM2(normalized);

  const waterPortion = plantCoeff * locationCoeff * normalized.intervalDays * (areaSizeM2 / 1000);
  const dripPresCount = areaSizeM2 / normalized.techniqueConfig.distance ** 2;
  const drippersFlow = (dripPresCount * normalized.techniqueConfig.flowRate) / 1000;
  const timeInHours = waterPortion / drippersFlow;

  const hours = Math.floor(timeInHours);
  const minutes = Math.floor((timeInHours - hours) * 60);
  const seconds = Math.floor(((timeInHours - hours) * 60 - minutes) * 60);

  return {
    waterPortion,
    dripPresCount,
    drippersFlow,
    timeInHours,
    duration: { hours, minutes, seconds },
    coefficients: {
      plantCoeff,
      locationCoeff,
    },
  };
}
