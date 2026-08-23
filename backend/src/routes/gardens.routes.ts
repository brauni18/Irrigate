import { Router } from 'express';
import fs from 'node:fs';
import multer from 'multer';
import path from 'path';
import { createGarden, deleteGarden, getGardenById, listGardens, updateGarden } from '../controllers/gardens.controller.js';
import { validateCreateGarden } from '../validators/gardens.validator.js';

const uploadsDirectory = path.resolve(import.meta.dirname, '../../uploads');

fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const gardensRouter = Router();

gardensRouter.post('/', upload.single('photo'), validateCreateGarden, createGarden);
gardensRouter.get('/', listGardens);
gardensRouter.get('/:id', getGardenById);
gardensRouter.patch('/:id', upload.single('photo'), updateGarden);
gardensRouter.delete('/:id', deleteGarden);
