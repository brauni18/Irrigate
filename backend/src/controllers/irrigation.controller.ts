import type { Request, Response } from 'express';
import { getIrrigationCatalog } from '../domain/irrigation/catalog.js';
import { calculateIrrigation } from '../domain/irrigation/calculate.js';
import { translateIncomingSprinklerFlowUnits, validateIrrigationConfig } from '../domain/irrigation/config.js';
import type { CalculateIrrigationBody } from '../types/irrigationLines.types.js';

function validateLegacyCalculationBody(body: Partial<CalculateIrrigationBody>) {
  const errors: string[] = [];

  if (!body.legacy || !Number.isFinite(body.legacy.durationMinutes) || (body.legacy.durationMinutes ?? 0) <= 0) {
    errors.push('legacy.durationMinutes must be a number greater than 0');
  }

  if (
    body.legacy
    && body.legacy.areaSizeM2 !== undefined
    && body.legacy.areaSizeM2 !== null
    && (!Number.isFinite(body.legacy.areaSizeM2) || (body.legacy.areaSizeM2 ?? 0) <= 0)
  ) {
    errors.push('legacy.areaSizeM2 must be a number greater than 0 when provided');
  }

  if (!body.config) {
    errors.push('config is required');
    return errors;
  }

  if (body.config.techniqueKey !== 'drip') {
    errors.push('legacy mode supports drip technique only');
  }

  if (!Number.isFinite(body.config.techniqueConfig.flowRate) || body.config.techniqueConfig.flowRate <= 0) {
    errors.push('techniqueConfig.flowRate must be a number greater than 0');
  }

  if (!Number.isFinite(body.config.techniqueConfig.distance) || body.config.techniqueConfig.distance <= 0) {
    errors.push('techniqueConfig.distance must be a number greater than 0');
  }

  const fallbackArea = body.legacy?.areaSizeM2 ?? body.config.areaSizeM2 ?? 1;
  const strictValidationConfig = {
    ...body.config,
    intervalDays: Number.isFinite(body.config.intervalDays) && body.config.intervalDays > 0 ? body.config.intervalDays : 1,
    areaSizeM2: Number.isFinite(fallbackArea) && fallbackArea > 0 ? fallbackArea : 1,
  };

  const strictErrors = validateIrrigationConfig(strictValidationConfig).filter(
    (message) => message !== 'Invalid drip distance option' && message !== 'Invalid drip flow option',
  );

  return [...errors, ...strictErrors];
}

export function getCatalog(_req: Request, res: Response) {
  return res.json(getIrrigationCatalog());
}

export function calculate(req: Request, res: Response) {
  const body = req.body as Partial<CalculateIrrigationBody>;
  if (!body.config) {
    return res.status(400).json({ message: 'config is required' });
  }

  const translatedConfig = translateIncomingSprinklerFlowUnits(body.config);
  const mode = body.mode ?? 'modern';
  const errors = mode === 'legacy'
    ? validateLegacyCalculationBody({
      ...body,
      config: translatedConfig,
    })
    : validateIrrigationConfig(translatedConfig);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'invalid irrigation config', errors });
  }

  const calculation = calculateIrrigation(translatedConfig, {
    mode,
    legacy: body.legacy,
  });

  return res.json({ calculation });
}
