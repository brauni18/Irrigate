import type { Request, Response } from 'express';
import type { RequestGardenPhotoUploadUrlBody } from '../types/uploads.types.js';
import {
  createGardenPhotoUploadUrl,
  StorageConfigurationError,
  StorageValidationError,
} from '../utils/r2.js';

function authUserId(req: Request, res: Response): string | null {
  if (!req.authUser?.id) {
    res.status(401).json({ message: 'unauthorized' });
    return null;
  }

  return req.authUser.id;
}

export async function requestGardenPhotoUploadUrl(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { fileName, contentType, fileSize } = req.body as Partial<RequestGardenPhotoUploadUrlBody>;

    if (!fileName?.trim() || !contentType?.trim()) {
      return res.status(400).json({ message: 'fileName and contentType are required' });
    }

    const payload = await createGardenPhotoUploadUrl({
      userId,
      fileName: fileName.trim(),
      contentType: contentType.trim(),
      fileSize,
    });

    return res.status(201).json(payload);
  } catch (error) {
    if (error instanceof StorageValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof StorageConfigurationError) {
      return res.status(500).json({ message: 'upload storage is not configured' });
    }

    return res.status(500).json({ message: 'server error' });
  }
}