import { Router } from 'express';
import { requestGardenPhotoUploadUrl } from '../controllers/uploads.controller.js';

export const uploadsRouter = Router();

uploadsRouter.post('/gardens/photo-url', requestGardenPhotoUploadUrl);