import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const MAX_GARDEN_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_UPLOAD_TTL_SECONDS = 5 * 60;
const DEFAULT_ASSET_TTL_SECONDS = 60 * 60;

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

type CreateGardenPhotoUploadUrlInput = {
  userId: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
};

class StorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageConfigurationError';
  }
}

class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

let cachedClient: S3Client | null = null;

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new StorageConfigurationError(`${name} is not set`);
  }

  return value;
}

function getR2Config(): R2Config {
  return {
    accountId: readRequiredEnv('R2_ACCOUNT_ID'),
    accessKeyId: readRequiredEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: readRequiredEnv('R2_SECRET_ACCESS_KEY'),
    bucket: readRequiredEnv('R2_BUCKET_NAME'),
  };
}

export function assertR2Configuration() {
  getR2Config();
}

function getSignedUrlTtlSeconds(rawValue: string | undefined, fallback: number) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function getR2Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getR2Config();
  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}

function inferExtension(fileName: string, contentType: string) {
  const originalExtension = path.extname(fileName).trim().toLowerCase();
  if (originalExtension) {
    return originalExtension;
  }

  switch (contentType.toLowerCase()) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '';
  }
}

function validateGardenPhotoUpload(contentType: string, fileSize?: number) {
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new StorageValidationError('Only image files are allowed');
  }

  if (fileSize != null && (!Number.isFinite(fileSize) || fileSize <= 0)) {
    throw new StorageValidationError('fileSize must be a positive number');
  }

  if (fileSize != null && fileSize > MAX_GARDEN_PHOTO_SIZE_BYTES) {
    throw new StorageValidationError(`Image size must not exceed ${MAX_GARDEN_PHOTO_SIZE_BYTES} bytes`);
  }
}

function getGardenPhotoKey(userId: string, fileName: string, contentType: string) {
  const extension = inferExtension(fileName, contentType);
  return `gardens/${userId}/${randomUUID()}${extension}`;
}

export function isStoredObjectKey(value?: string | null): value is string {
  return Boolean(value && !value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('/'));
}

export async function createGardenPhotoUploadUrl({
  userId,
  fileName,
  contentType,
  fileSize,
}: CreateGardenPhotoUploadUrlInput) {
  validateGardenPhotoUpload(contentType, fileSize);

  const config = getR2Config();
  const client = getR2Client();
  const photoKey = getGardenPhotoKey(userId, fileName, contentType);
  const expiresIn = getSignedUrlTtlSeconds(process.env.R2_UPLOAD_URL_TTL_SECONDS, DEFAULT_UPLOAD_TTL_SECONDS);

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: photoKey,
      ContentType: contentType,
    }),
    { expiresIn },
  );

  return {
    photoKey,
    uploadUrl,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    maxFileSizeBytes: MAX_GARDEN_PHOTO_SIZE_BYTES,
  };
}

export async function createAssetReadUrl(objectKey: string) {
  const config = getR2Config();
  const client = getR2Client();
  const expiresIn = getSignedUrlTtlSeconds(process.env.R2_ASSET_URL_TTL_SECONDS, DEFAULT_ASSET_TTL_SECONDS);

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
    }),
    { expiresIn },
  );
}

export async function resolveStoredPhotoUrl(photo?: string) {
  if (!photo) {
    return undefined;
  }

  if (!isStoredObjectKey(photo)) {
    return photo;
  }

  return createAssetReadUrl(photo);
}

export async function deleteStoredObject(objectKey?: string | null) {
  if (!isStoredObjectKey(objectKey)) {
    return;
  }

  const config = getR2Config();
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
    }),
  );
}

export { MAX_GARDEN_PHOTO_SIZE_BYTES, StorageConfigurationError, StorageValidationError };