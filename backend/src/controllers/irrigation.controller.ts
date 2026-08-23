import type { Request, Response } from 'express';
import { getIrrigationCatalog } from '../domain/irrigation/catalog.js';
import { calculateIrrigation } from '../domain/irrigation/calculate.js';
import { translateIncomingSprinklerFlowUnits, validateIrrigationConfig } from '../domain/irrigation/config.js';
import type { CalculateIrrigationBody } from '../types/irrigationLines.types.js';

export function getCatalog(_req: Request, res: Response) {
  return res.json(getIrrigationCatalog());
}

export function calculate(req: Request, res: Response) {
  const body = req.body as Partial<CalculateIrrigationBody>;
  if (!body.config) {
    return res.status(400).json({ message: 'config is required' });
  }

  const translatedConfig = translateIncomingSprinklerFlowUnits(body.config);
  const errors = validateIrrigationConfig(translatedConfig);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'invalid irrigation config', errors });
  }

  const calculation = calculateIrrigation(translatedConfig);
  return res.json({ calculation });
}
