import { getEffectiveIrrigationAreaM2, normalizeIrrigationConfig, type IrrigationLineConfig } from '../config.js';
import type { IrrigationCalculation } from '../calculate.types.js';
import { formatDuration, resolveCoefficients } from '../calculate.helpers.js';

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

export function calculateModernIrrigation(config: IrrigationLineConfig): IrrigationCalculation {
  const normalized = normalizeIrrigationConfig(config);
  const { plantCoeff, locationCoeff } = resolveCoefficients(normalized);
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
