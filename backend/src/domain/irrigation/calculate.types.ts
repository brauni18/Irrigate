import type { IrrigationLineConfig } from './config.js';

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

export type IrrigationCalculationMode = 'modern' | 'legacy';

export type LegacyCalculationInput = {
  durationMinutes: number;
  areaSizeM2?: number | null;
  selectedWeekdays?: string[];
};

export type IrrigationCalculationRequest = {
  mode?: IrrigationCalculationMode;
  legacy?: LegacyCalculationInput;
};

export type CalculationStrategy = (
  config: IrrigationLineConfig,
  options?: IrrigationCalculationRequest,
) => IrrigationCalculation;
