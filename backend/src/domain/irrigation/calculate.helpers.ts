import { LOCATIONS_CATALOG, PLANTS_CATALOG } from './catalog.js';
import type { IrrigationLineConfig } from './config.js';

export function computePlantCoefficient(minCoeff: number, maxCoeff: number, maintenanceLevel: number) {
  return minCoeff + (maxCoeff - minCoeff) * (maintenanceLevel / 100);
}

export function formatDuration(timeInHours: number) {
  const hours = Math.floor(timeInHours);
  const minutes = Math.floor((timeInHours - hours) * 60);
  const seconds = Math.floor(((timeInHours - hours) * 60 - minutes) * 60);

  return { hours, minutes, seconds };
}

export function resolveCoefficients(config: IrrigationLineConfig) {
  const plant = PLANTS_CATALOG[config.plantKey];
  const location = LOCATIONS_CATALOG[config.locationKey];
  const plantCoeff = computePlantCoefficient(plant.minCoeff, plant.maxCoeff, config.maintenanceLevel);
  const locationCoeff = location.coeff;

  return {
    plantCoeff,
    locationCoeff,
  };
}
