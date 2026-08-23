import { Schema, model, type HydratedDocument } from 'mongoose';

type User = {
  name: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
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
    emailVerificationTokenHash: { type: String },
    emailVerificationTokenExpiresAt: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

export const UserModel = model<User>('User', UserSchema);