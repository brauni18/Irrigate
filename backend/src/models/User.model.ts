import { Schema, model, type HydratedDocument } from 'mongoose';

type User = {
  name: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  profession: string;
  professionOther?: string;
  businessModels: string[];
  businessModelOther?: string;
  sectors: string[];
  sectorOther?: string;
  betaConsent: boolean;
  appGoals?: string;
  emailVerificationTokenHash?: string;
  emailVerificationTokenExpiresAt?: Date;
};

export type UserType = HydratedDocument<User>;

const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, required: true, default: false },
    profession: { type: String, required: true, trim: true },
    professionOther: { type: String, trim: true },
    businessModels: { type: [String], required: true, default: [] },
    businessModelOther: { type: String, trim: true },
    sectors: { type: [String], required: true, default: [] },
    sectorOther: { type: String, trim: true },
    betaConsent: { type: Boolean, required: true },
    appGoals: { type: String, trim: true },
    emailVerificationTokenHash: { type: String },
    emailVerificationTokenExpiresAt: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

export const UserModel = model<User>('User', UserSchema);