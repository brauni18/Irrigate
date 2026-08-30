import { Router } from 'express';
import {
	createGarden,
	deleteGarden,
	getGardenById,
	getGardenSchedule,
	listGardens,
	updateGarden,
} from '../controllers/gardens.controller.js';
import { validateCreateGarden } from '../validators/gardens.validator.js';

export const gardensRouter = Router();

gardensRouter.post('/', validateCreateGarden, createGarden);
gardensRouter.get('/', listGardens);
gardensRouter.get('/:id', getGardenById);
gardensRouter.get('/:id/schedule', getGardenSchedule);
gardensRouter.patch('/:id', updateGarden);
gardensRouter.delete('/:id', deleteGarden);
