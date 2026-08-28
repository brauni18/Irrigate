import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { UserModel } from '../models/User.model.js';
import { signAuthToken } from '../utils/auth.js';
import { isValidEmailFormat, validatePasswordStrength } from '../utils/authValidation.js';
import { sendVerificationEmail } from '../utils/email.js';
import type {
  AuthenticatedUser,
  LoginBody,
  ResendVerificationBody,
  SignupBody,
  VerifyEmailBody,
} from '../types/auth.types.js';

const EMAIL_VERIFICATION_WINDOW_MS = 1000 * 60 * 60 * 24;
const ALLOWED_PROFESSIONS = new Set([
  'gardener',
  'landscape-architect',
  'architect',
  'contractor',
  'other',
]);
const ALLOWED_BUSINESS_MODELS = new Set(['planning', 'construction', 'maintenance', 'other']);
const ALLOWED_SECTORS = new Set(['private', 'public', 'agriculture', 'other']);

function normalizeMultiSelect(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function buildVerificationToken() {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_WINDOW_MS);

  return { token, tokenHash, expiresAt };
}

async function issueVerificationForUser(user: {
  email: string;
  name: string;
  emailVerificationTokenHash?: string;
  emailVerificationTokenExpiresAt?: Date;
  save: () => Promise<unknown>;
}) {
  const verification = buildVerificationToken();
  user.emailVerificationTokenHash = verification.tokenHash;
  user.emailVerificationTokenExpiresAt = verification.expiresAt;
  await user.save();

  try {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      email: user.email,
      token: verification.token,
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email', error);
    return false;
  }
}

function toAuthenticatedUser(user: { id: string; name: string; email: string }): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function signup(req: Request, res: Response) {
  const requestId = randomBytes(6).toString('hex');

  try {
    console.log(`[signup:${requestId}] start`);
    const {
      name,
      email,
      password,
      profession,
      professionOther,
      businessModels,
      businessModelOther,
      sectors,
      sectorOther,
      betaConsent,
    } = req.body as Partial<SignupBody>;

    if (!name?.trim()) return res.status(400).json({ message: 'name is required' });
    if (!email?.trim()) return res.status(400).json({ message: 'email is required' });
    if (!isValidEmailFormat(email)) return res.status(400).json({ message: 'invalid email format' });

    if (!password) {
      return res.status(400).json({ message: 'password is required' });
    }

    const normalizedProfession = profession?.trim().toLowerCase();
    if (!normalizedProfession || !ALLOWED_PROFESSIONS.has(normalizedProfession)) {
      return res.status(400).json({ message: 'profession is required' });
    }

    const normalizedProfessionOther = professionOther?.trim();
    if (normalizedProfession === 'other' && !normalizedProfessionOther) {
      return res.status(400).json({ message: 'professionOther is required when profession is other' });
    }

    const normalizedBusinessModels = normalizeMultiSelect(businessModels);
    if (!normalizedBusinessModels.length) {
      return res.status(400).json({ message: 'at least one business model is required' });
    }

    if (!normalizedBusinessModels.every((item) => ALLOWED_BUSINESS_MODELS.has(item))) {
      return res.status(400).json({ message: 'invalid business model value' });
    }

    const normalizedBusinessModelOther = businessModelOther?.trim();
    if (normalizedBusinessModels.includes('other') && !normalizedBusinessModelOther) {
      return res.status(400).json({ message: 'businessModelOther is required when businessModels include other' });
    }

    const normalizedSectors = normalizeMultiSelect(sectors);
    if (!normalizedSectors.length) {
      return res.status(400).json({ message: 'at least one sector is required' });
    }

    if (!normalizedSectors.every((item) => ALLOWED_SECTORS.has(item))) {
      return res.status(400).json({ message: 'invalid sector value' });
    }

    const normalizedSectorOther = sectorOther?.trim();
    if (normalizedSectors.includes('other') && !normalizedSectorOther) {
      return res.status(400).json({ message: 'sectorOther is required when sectors include other' });
    }

    if (betaConsent !== true) {
      return res.status(400).json({ message: 'betaConsent must be accepted' });
    }

    const passwordPolicyError = validatePasswordStrength(password);
    if (passwordPolicyError) {
      return res.status(400).json({ message: passwordPolicyError });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[signup:${requestId}] checking account for ${normalizedEmail}`);
    const existing = await UserModel.findOne({ email: normalizedEmail });

    if (existing) {
      console.log(`[signup:${requestId}] existing account found, verified=${existing.emailVerified}`);
      if (existing.emailVerified) {
        return res.status(409).json({ message: 'email is already registered' });
      }

      console.log(`[signup:${requestId}] reissuing verification email`);
      const verificationSent = await issueVerificationForUser(existing);

      if (!verificationSent) {
        console.log(`[signup:${requestId}] verification email failed for existing unverified account`);
        return res.status(202).json({
          message: 'Account exists but verification email could not be sent right now. Please try again shortly.',
          requiresEmailVerification: true,
        });
      }

      console.log(`[signup:${requestId}] verification email sent for existing unverified account`);

      return res.status(200).json({
        message: 'Account already exists but is not verified. We sent a new verification email.',
        requiresEmailVerification: true,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    console.log(`[signup:${requestId}] creating new user`);

    const createdUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
      profession: normalizedProfession,
      professionOther: normalizedProfession === 'other' ? normalizedProfessionOther : undefined,
      businessModels: normalizedBusinessModels,
      businessModelOther: normalizedBusinessModels.includes('other') ? normalizedBusinessModelOther : undefined,
      sectors: normalizedSectors,
      sectorOther: normalizedSectors.includes('other') ? normalizedSectorOther : undefined,
      betaConsent: true,
    });

    console.log(`[signup:${requestId}] user created, sending verification email`);

    const verificationSent = await issueVerificationForUser(createdUser);

    if (!verificationSent) {
      console.log(`[signup:${requestId}] verification email failed for new user`);
      return res.status(202).json({
        message: 'Account created, but verification email could not be sent right now. Please try again shortly.',
        requiresEmailVerification: true,
      });
    }

    console.log(`[signup:${requestId}] verification email sent for new user`);

    return res.status(201).json({
      message: 'Account created. Check your email to verify your account before signing in.',
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error(`[signup:${requestId}] Signup failed`, error);
    return res.status(500).json({ message: 'server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as Partial<LoginBody>;

    if (!email?.trim()) return res.status(400).json({ message: 'email is required' });
    if (!isValidEmailFormat(email)) return res.status(400).json({ message: 'invalid email format' });
    if (!password) return res.status(400).json({ message: 'password is required' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before signing in.',
      });
    }

    const authUser = toAuthenticatedUser(user);
    const token = signAuthToken(authUser);

    return res.json({ token, user: authUser });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    if (!req.authUser) return res.status(401).json({ message: 'unauthorized' });

    const user = await UserModel.findById(req.authUser.id).select('_id name email');
    if (!user) return res.status(401).json({ message: 'unauthorized' });

    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, token } = req.body as Partial<VerifyEmailBody>;

    if (!email?.trim() || !token?.trim()) {
      return res.status(400).json({ message: 'email and token are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'invalid or expired verification token' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'Email already verified.' });
    }

    const tokenMatches = user.emailVerificationTokenHash === tokenHash;
    const tokenActive =
      Boolean(user.emailVerificationTokenExpiresAt) &&
      user.emailVerificationTokenExpiresAt!.getTime() > Date.now();

    if (!tokenMatches || !tokenActive) {
      return res.status(400).json({ message: 'invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully. You can now sign in.' });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

export async function resendVerification(req: Request, res: Response) {
  const requestId = randomBytes(6).toString('hex');

  try {
    console.log(`[resend-verification:${requestId}] start`);
    const { email } = req.body as Partial<ResendVerificationBody>;

    if (!email?.trim()) {
      return res.json({
        message: 'If your email exists and is not verified, we sent a new verification link.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[resend-verification:${requestId}] lookup ${normalizedEmail}`);
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (user && !user.emailVerified) {
      console.log(`[resend-verification:${requestId}] reissuing verification email`);
      try {
        await issueVerificationForUser(user);
        console.log(`[resend-verification:${requestId}] verification email sent`);
      } catch {
        // Keep the generic response to avoid account enumeration details.
        console.log(`[resend-verification:${requestId}] verification email failed`);
      }
    }

    return res.json({
      message: 'If your email exists and is not verified, we sent a new verification link.',
    });
  } catch {
    console.error(`[resend-verification:${requestId}] server error`);
    return res.status(500).json({ message: 'server error' });
  }
}

export function logout(_req: Request, res: Response) {
  return res.json({ message: 'logged out' });
}