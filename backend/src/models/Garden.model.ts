import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

type Garden = {
  ownerId: Types.ObjectId;
  name: string;
  address: string;
  addressNumber?: string;
  isMainTapOn: boolean;
  scheduleRules: {
    blockedWeekdays: number[];
    preferredStartMinute: number;
    preferredEndMinute: number;
    lineSpacingMinutes: number;
  };
  scheduleEntries: Array<{
    id: string;
    lineId: string;
    dateKey: string;
    time: string;
    day: string;
    lineName: string;
    duration: number;
    liters: number;
  }>;
  latitude?: number;
  longitude?: number;
  photo?: string;
};

export type GardenType = HydratedDocument<Garden>;

const GardenSchema = new Schema<Garden>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    addressNumber: { type: String, trim: true },
    isMainTapOn: { type: Boolean, default: true },
    scheduleRules: {
      blockedWeekdays: { type: [Number], default: [] },
      preferredStartMinute: { type: Number, default: 6 * 60 },
      preferredEndMinute: { type: Number, default: 9 * 60 },
      lineSpacingMinutes: { type: Number, default: 10 },
    },
    scheduleEntries: {
      type: [
        {
          id: { type: String, required: true },
          lineId: { type: String, required: true },
          dateKey: { type: String, required: true },
          time: { type: String, required: true },
          day: { type: String, required: true },
          lineName: { type: String, required: true },
          duration: { type: Number, required: true },
          liters: { type: Number, required: true },
        },
      ],
      default: [],
    },
    latitude: { type: Number },
    longitude: { type: Number },
    photo: { type: String },
  },
  { timestamps: true },
);

export const GardenModel = model<Garden>('Garden', GardenSchema);
