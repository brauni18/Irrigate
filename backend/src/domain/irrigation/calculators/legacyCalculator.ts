import type { IrrigationLineConfig } from '../config.js';
import type { IrrigationCalculation, LegacyCalculationInput } from '../calculate.types.js';
import { formatDuration, resolveCoefficients } from '../calculate.helpers.js';

function resolveLegacyAreaSize(legacy?: LegacyCalculationInput) {
  if (Number.isFinite(legacy?.areaSizeM2) && (legacy?.areaSizeM2 ?? 0) > 0) {
    return legacy?.areaSizeM2 ?? null;
  }

  return null;
}

function resolveLegacyDurationHours(legacy?: LegacyCalculationInput) {
  const durationMinutes = Math.max(1, Math.round(legacy?.durationMinutes ?? 1));
  return durationMinutes / 60;
}

export function calculateLegacyIrrigation(
  config: IrrigationLineConfig,
  legacy?: LegacyCalculationInput,
): IrrigationCalculation {
  const { plantCoeff, locationCoeff } = resolveCoefficients(config);

  const distance = Math.max(0.1, config.techniqueConfig.distance || 0.1);
  const flowRateLph = Math.max(0.1, config.techniqueConfig.flowRate || 0.1);
  const durationHours = resolveLegacyDurationHours(legacy);
  const areaSizeM2 = resolveLegacyAreaSize(legacy);
  const dripperCount = areaSizeM2
    ? Math.max(1, Math.round(areaSizeM2 / (distance ** 2)))
    : 1;

  const perPlantWaterLiters = flowRateLph * durationHours;
  const totalWaterLiters = perPlantWaterLiters * dripperCount;
  const totalFlowLph = dripperCount * flowRateLph;

  return {
    waterPortion: totalWaterLiters / 1000,
    dripPresCount: dripperCount,
    drippersFlow: totalFlowLph / 1000,
    timeInHours: durationHours,
    duration: formatDuration(durationHours),
    coefficients: {
      plantCoeff,
      locationCoeff,
    },
  };
}
