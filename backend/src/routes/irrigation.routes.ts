import { Router } from 'express';
import { calculate, getCatalog } from '../controllers/irrigation.controller.js';

export const irrigationRouter = Router();

irrigationRouter.get('/catalog', getCatalog);
irrigationRouter.post('/calculate', calculate);
