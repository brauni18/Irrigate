import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { GardenModel } from '../models/Garden.model.js';
import { IrrigationLineModel } from '../models/IrrigationLine.model.js';
import type { CreateGardenBody } from '../types/gardens.types.js';
import { deleteStoredObject, resolveStoredPhotoUrl, StorageConfigurationError } from '../utils/r2.js';
import { buildScheduleWindow, DEFAULT_SCHEDULE_RULES, normalizeScheduleRules } from '../domain/irrigation/schedule.js';

function authUserId(req: Request, res: Response): string | null {
  if (!req.authUser?.id) {
    res.status(401).json({ message: 'unauthorized' });
    return null;
  }

  return req.authUser.id;
}

async function serializeGarden(garden: { toObject: () => Record<string, unknown> }) {
  const serialized = garden.toObject() as Record<string, unknown> & { photo?: string };
  return {
    ...serialized,
    photo: await resolveStoredPhotoUrl(serialized.photo),
  };
}

// CREATE garden
export async function createGarden(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { name, address, addressNumber, isMainTapOn, latitude, longitude, photoKey } = req.body as Partial<CreateGardenBody>;
    const normalizedRules = normalizeScheduleRules(req.body?.scheduleRules);
    const parsedLatitude = latitude == null ? undefined : Number(latitude);
    const parsedLongitude = longitude == null ? undefined : Number(longitude);

    const garden = await GardenModel.create({
      ownerId: new Types.ObjectId(userId),
      name,
      address,
      addressNumber,
      isMainTapOn: typeof isMainTapOn === 'boolean' ? isMainTapOn : true,
      scheduleRules: normalizedRules,
      latitude: Number.isFinite(parsedLatitude) ? parsedLatitude : undefined,
      longitude: Number.isFinite(parsedLongitude) ? parsedLongitude : undefined,
      photo: photoKey?.trim() || undefined,
    });

    return res.status(201).json(await serializeGarden(garden));
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return res.status(500).json({ message: 'upload storage is not configured' });
    }

    return res.status(500).json({ message: 'server error' });
  }
}

// READ all gardens
export async function listGardens(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const gardens = await GardenModel.find({ ownerId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    return res.json(await Promise.all(gardens.map((garden) => serializeGarden(garden))));
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return res.status(500).json({ message: 'upload storage is not configured' });
    }

    return res.status(500).json({ message: 'server error' });
  }
}

// READ one garden
export async function getGardenById(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const garden = await GardenModel.findOne({ _id: id, ownerId: new Types.ObjectId(userId) });
    if (!garden) return res.status(404).json({ message: 'garden not found' });
    return res.json(await serializeGarden(garden));
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return res.status(500).json({ message: 'upload storage is not configured' });
    }

    return res.status(500).json({ message: 'server error' });
  }
}

// UPDATE garden
export async function updateGarden(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const { name, address, addressNumber, isMainTapOn, latitude, longitude, photoKey } = req.body as Partial<CreateGardenBody>;
    const normalizedRules = req.body?.scheduleRules ? normalizeScheduleRules(req.body.scheduleRules) : undefined;
    const parsedLatitude = latitude == null ? undefined : Number(latitude);
    const parsedLongitude = longitude == null ? undefined : Number(longitude);
    const existing = await GardenModel.findOne({ _id: id, ownerId: new Types.ObjectId(userId) });

    if (!existing) {
      return res.status(404).json({ message: 'garden not found' });
    }

    const nextPhotoKey = photoKey?.trim() || undefined;

    const updated = await GardenModel.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          ...(name && { name }),
          ...(address && { address }),
          ...(addressNumber !== undefined && { addressNumber }),
          ...(typeof isMainTapOn === 'boolean' && { isMainTapOn }),
          ...(normalizedRules && { scheduleRules: normalizedRules }),
          ...(Number.isFinite(parsedLatitude) && { latitude: parsedLatitude }),
          ...(Number.isFinite(parsedLongitude) && { longitude: parsedLongitude }),
          ...(nextPhotoKey && { photo: nextPhotoKey }),
        },
      },
      { new: true },
    );

    if (!updated) return res.status(404).json({ message: 'garden not found' });

    if (nextPhotoKey && existing.photo && existing.photo !== nextPhotoKey) {
      await deleteStoredObject(existing.photo).catch((storageError: unknown) => {
        console.error('Failed to delete replaced garden photo', storageError);
      });
    }

    return res.json(await serializeGarden(updated));
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return res.status(500).json({ message: 'upload storage is not configured' });
    }

    return res.status(500).json({ message: 'server error' });
  }
}

export async function getGardenSchedule(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const garden = await GardenModel.findOne({ _id: id, ownerId: new Types.ObjectId(userId) }).select('_id scheduleRules');
    if (!garden) return res.status(404).json({ message: 'garden not found' });

    const parsedHistoryDays = Number(req.query.historyDays);
    const parsedFutureDays = Number(req.query.futureDays);
    const historyDays = Number.isFinite(parsedHistoryDays) ? Math.max(0, Math.floor(parsedHistoryDays)) : 1;
    const futureDays = Number.isFinite(parsedFutureDays) ? Math.max(0, Math.floor(parsedFutureDays)) : 7;

    const lines = await IrrigationLineModel.find({ gardenId: garden._id }).sort({ createdAt: 1 }).lean();
    const rules = normalizeScheduleRules(garden.scheduleRules ?? DEFAULT_SCHEDULE_RULES);
    const entries = buildScheduleWindow(lines, new Date(), historyDays, futureDays, rules);

    await GardenModel.findByIdAndUpdate(garden._id, {
      $set: {
        scheduleRules: rules,
        scheduleEntries: entries,
      },
    });

    return res.json({ rules, entries });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// DELETE garden
export async function deleteGarden(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const garden = await GardenModel.findOneAndDelete({ _id: id, ownerId: new Types.ObjectId(userId) });
    if (!garden) return res.status(404).json({ message: 'garden not found' });

    await deleteStoredObject(garden.photo).catch((storageError: unknown) => {
      console.error('Failed to delete garden photo', storageError);
    });

    return res.json({ message: 'garden deleted' });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}
