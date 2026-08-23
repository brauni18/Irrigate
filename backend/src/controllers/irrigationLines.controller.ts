import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { calculateIrrigation } from '../domain/irrigation/calculate.js';
import {
  DEFAULT_IRRIGATION_LINE_CONFIG,
  mergeIrrigationConfig,
  normalizeIrrigationConfig,
  translateIncomingSprinklerFlowUnits,
  translateIncomingSprinklerFlowUnitsPatch,
  validateIrrigationConfig,
} from '../domain/irrigation/config.js';
import { IrrigationLineModel } from '../models/IrrigationLine.model.js';
import { GardenModel } from '../models/Garden.model.js';
import type { CreateIrrigationLineBody, UpdateIrrigationLineBody } from '../types/irrigationLines.types.js';

function authUserId(req: Request, res: Response): string | null {
  if (!req.authUser?.id) {
    res.status(401).json({ message: 'unauthorized' });
    return null;
  }

  return req.authUser.id;
}

async function canAccessGarden(gardenId: string, userId: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(gardenId) || !Types.ObjectId.isValid(userId)) return false;

  const ownedGarden = await GardenModel.findOne({
    _id: new Types.ObjectId(gardenId),
    ownerId: new Types.ObjectId(userId),
  })
    .select('_id')
    .lean();

  return Boolean(ownedGarden);
}

// CREATE line for a garden
export async function createLine(req: Request<{ gardenId: string }>, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { gardenId } = req.params;
    const { name, config } = req.body as CreateIrrigationLineBody;

    if (!(await canAccessGarden(gardenId, userId))) {
      return res.status(404).json({ message: 'garden not found' });
    }

    if (!name?.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }

    const lineConfig = normalizeIrrigationConfig(
      translateIncomingSprinklerFlowUnits(config ?? DEFAULT_IRRIGATION_LINE_CONFIG),
    );
    const configErrors = validateIrrigationConfig(lineConfig);

    if (configErrors.length > 0) {
      return res.status(400).json({ message: 'invalid irrigation config', errors: configErrors });
    }

    const line = await IrrigationLineModel.create({
      gardenId: new Types.ObjectId(gardenId),
      name: name.trim(),
      config: lineConfig,
      calculation: calculateIrrigation(lineConfig),
    });
    return res.status(201).json(line);
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// READ all lines for a garden
export async function listLines(req: Request<{ gardenId: string }>, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { gardenId } = req.params;

    if (!(await canAccessGarden(gardenId, userId))) {
      return res.status(404).json({ message: 'garden not found' });
    }

    const lines = await IrrigationLineModel.find({ gardenId: new Types.ObjectId(gardenId) }).sort({ createdAt: 1 });
    return res.json(lines);
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// UPDATE a line (name or isActive)
export async function updateLine(req: Request<{ lineId: string }>, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { lineId } = req.params;
    const { name, isActive, config } = req.body as UpdateIrrigationLineBody;

    const current = await IrrigationLineModel.findById(lineId);
    if (!current) return res.status(404).json({ message: 'line not found' });

    if (!(await canAccessGarden(current.gardenId.toString(), userId))) {
      return res.status(404).json({ message: 'line not found' });
    }

    const mergedConfig = normalizeIrrigationConfig(
      mergeIrrigationConfig(
        current.config ?? DEFAULT_IRRIGATION_LINE_CONFIG,
        config
          ? translateIncomingSprinklerFlowUnitsPatch(config, current.config?.techniqueKey)
          : config,
      ),
    );
    const configErrors = validateIrrigationConfig(mergedConfig);

    if (configErrors.length > 0) {
      return res.status(400).json({ message: 'invalid irrigation config', errors: configErrors });
    }

    const updated = await IrrigationLineModel.findByIdAndUpdate(
      lineId,
      {
        $set: {
          ...(name !== undefined && { name: name.trim() }),
          ...(isActive !== undefined && { isActive }),
          config: mergedConfig,
          calculation: calculateIrrigation(mergedConfig),
        },
      },
      { new: true },
    );

    if (!updated) return res.status(404).json({ message: 'line not found' });
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// DELETE a line
export async function deleteLine(req: Request<{ lineId: string }>, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { lineId } = req.params;

    const line = await IrrigationLineModel.findById(lineId);
    if (!line) return res.status(404).json({ message: 'line not found' });

    if (!(await canAccessGarden(line.gardenId.toString(), userId))) {
      return res.status(404).json({ message: 'line not found' });
    }

    await IrrigationLineModel.findByIdAndDelete(lineId);
    return res.json({ message: 'line deleted' });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}
