import type { IrrigationLineConfig } from './config.js';
import {
  type CalculationStrategy,
  type IrrigationCalculation,
  type IrrigationCalculationMode,
  type IrrigationCalculationRequest,
} from './calculate.types.js';
import { calculateModernIrrigation } from './calculators/modernCalculator.js';
import { calculateLegacyIrrigation } from './calculators/legacyCalculator.js';

const calculators: Record<IrrigationCalculationMode, CalculationStrategy> = {
  modern: (config) => calculateModernIrrigation(config),
  legacy: (config, options) => calculateLegacyIrrigation(config, options?.legacy),
};

export type {
  IrrigationCalculation,
  IrrigationCalculationMode,
  IrrigationCalculationRequest,
  LegacyCalculationInput,
} from './calculate.types.js';

export function calculateIrrigation(
  config: IrrigationLineConfig,
  options?: IrrigationCalculationRequest,
): IrrigationCalculation {
  const mode = options?.mode ?? 'modern';
  const strategy = calculators[mode] ?? calculators.modern;
  return strategy(config, options);
}
