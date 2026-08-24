import { Router } from 'express';
import { createGarden, deleteGarden, getGardenById, listGardens, updateGarden } from '../controllers/gardens.controller.js';
import { validateCreateGarden } from '../validators/gardens.validator.js';

export const gardensRouter = Router();

gardensRouter.post('/', validateCreateGarden, createGarden);
gardensRouter.get('/', listGardens);
gardensRouter.get('/:id', getGardenById);
gardensRouter.patch('/:id', updateGarden);
gardensRouter.delete('/:id', deleteGarden);
