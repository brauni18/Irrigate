import { Schema, model, type HydratedDocument } from 'mongoose';

type Garden = {
  name: string;
  address: string;
  addressNumber?: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
};

export type GardenType = HydratedDocument<Garden>;

const GardenSchema = new Schema<Garden>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    addressNumber: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    photo: { type: String },
  },
  { timestamps: true },
);

export const GardenModel = model<Garden>('Garden', GardenSchema);
