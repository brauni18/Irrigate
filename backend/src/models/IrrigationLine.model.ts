import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import type { IrrigationCalculation } from '../domain/irrigation/calculate.js';
import type { IrrigationLineConfig } from '../domain/irrigation/config.js';

type IrrigationLine = {
  gardenId: Types.ObjectId;
  name: string;
  isActive: boolean;
  isPaused: boolean;
  config: IrrigationLineConfig;
  calculation: IrrigationCalculation;
};

export type IrrigationLineType = HydratedDocument<IrrigationLine>;

const IrrigationLineSchema = new Schema<IrrigationLine>(
  {
    gardenId: { type: Schema.Types.ObjectId, ref: 'Garden', required: true, index: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
    config: {
      plantKey: { type: String, required: true },
      maintenanceLevel: { type: Number, required: true },
      locationKey: { type: String, required: true },
      intervalDays: { type: Number, required: true },
      areaSizeM2: { type: Number, required: true },
      treeCount: { type: Number },
      sprinklerCount: { type: Number },
      sprinklerConfigs: [
        {
          distance: { type: Number, required: true },
          flowRate: { type: Number, required: true },
          sprinklerCount: { type: Number, required: true },
        },
      ],
      techniqueKey: { type: String, required: true },
      calculationMode: { type: String, enum: ['modern', 'legacy'] },
      legacy: {
        selectedWeekdays: [{ type: String }],
        durationMinutes: { type: Number },
        areaSizeM2: { type: Number },
      },
      techniqueConfig: {
        distance: { type: Number, required: true },
        flowRate: { type: Number, required: true },
      },
    },
    calculation: {
      waterPortion: { type: Number, required: true },
      dripPresCount: { type: Number, required: true },
      drippersFlow: { type: Number, required: true },
      timeInHours: { type: Number, required: true },
      duration: {
        hours: { type: Number, required: true },
        minutes: { type: Number, required: true },
        seconds: { type: Number, required: true },
      },
      coefficients: {
        plantCoeff: { type: Number, required: true },
        locationCoeff: { type: Number, required: true },
      },
    },
  },
  { timestamps: true },
);

export const IrrigationLineModel = model<IrrigationLine>('IrrigationLine', IrrigationLineSchema);
