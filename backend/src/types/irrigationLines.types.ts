import type { IrrigationLineConfig, IrrigationLineConfigPatch } from '../domain/irrigation/config.js';

export type CreateIrrigationLineBody = {
  name: string;
  config?: IrrigationLineConfig;
};

export type UpdateIrrigationLineBody = {
  name?: string;
  isActive?: boolean;
  config?: IrrigationLineConfigPatch;
};

export type CalculateIrrigationBody = {
  config: IrrigationLineConfig;
};
