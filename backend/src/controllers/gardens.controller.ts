import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { GardenModel } from '../models/Garden.model.js';
import type { CreateGardenBody } from '../types/gardens.types.js';

function authUserId(req: Request, res: Response): string | null {
  if (!req.authUser?.id) {
    res.status(401).json({ message: 'unauthorized' });
    return null;
  }

  return req.authUser.id;
}

// CREATE garden
export async function createGarden(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { name, address, addressNumber, latitude, longitude } = req.body as Partial<CreateGardenBody>;
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    const parsedLatitude = latitude == null ? undefined : Number(latitude);
    const parsedLongitude = longitude == null ? undefined : Number(longitude);

    const garden = await GardenModel.create({
      ownerId: new Types.ObjectId(userId),
      name,
      address,
      addressNumber,
      latitude: Number.isFinite(parsedLatitude) ? parsedLatitude : undefined,
      longitude: Number.isFinite(parsedLongitude) ? parsedLongitude : undefined,
      photo,
    });
    return res.status(201).json(garden);
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// READ all gardens
export async function listGardens(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const gardens = await GardenModel.find({ ownerId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    return res.json(gardens);
  } catch {
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
    return res.json(garden);
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// UPDATE garden
export async function updateGarden(req: Request, res: Response) {
  try {
    const userId = authUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const { name, address, addressNumber, latitude, longitude } = req.body as Partial<CreateGardenBody>;
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    const parsedLatitude = latitude == null ? undefined : Number(latitude);
    const parsedLongitude = longitude == null ? undefined : Number(longitude);

    const updated = await GardenModel.findOneAndUpdate(
      { _id: id, ownerId: new Types.ObjectId(userId) },
      {
        $set: {
          ...(name && { name }),
          ...(address && { address }),
          ...(addressNumber !== undefined && { addressNumber }),
          ...(Number.isFinite(parsedLatitude) && { latitude: parsedLatitude }),
          ...(Number.isFinite(parsedLongitude) && { longitude: parsedLongitude }),
          ...(photo && { photo }),
        },
      },
      { new: true },
    );

    if (!updated) return res.status(404).json({ message: 'garden not found' });
    return res.json(updated);
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
    return res.json({ message: 'garden deleted' });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}
