import type { NextFunction, Request, Response } from 'express';
import type { CreateGardenBody } from '../types/gardens.types.js';

export function validateCreateGarden(req: Request, res: Response, next: NextFunction) {
  if (!req.body) return res.status(400).json({ message: 'body is required' });
  const { name, address } = req.body as Partial<CreateGardenBody>;

  if (!name || !address) {
    return res.status(400).json({ message: 'name and address are required' });
  }

  return next();
}
