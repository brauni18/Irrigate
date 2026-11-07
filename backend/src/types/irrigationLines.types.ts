import type { IrrigationLineConfig, IrrigationLineConfigPatch } from '../domain/irrigation/config.js';
import type { IrrigationCalculationMode, LegacyCalculationInput } from '../domain/irrigation/calculate.js';

export type CreateIrrigationLineBody = {
  name: string;
  config?: IrrigationLineConfig;
};

export type UpdateIrrigationLineBody = {
  name?: string;
  isActive?: boolean;
  isPaused?: boolean;
  config?: IrrigationLineConfigPatch;
};

export type CalculateIrrigationBody = {
  config: IrrigationLineConfig;
  mode?: IrrigationCalculationMode;
  legacy?: LegacyCalculationInput;
};
