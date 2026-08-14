import type { Request, Response } from 'express';
import { GardenModel } from '../models/Garden.model.js';
import type { CreateGardenBody } from '../types/gardens.types.js';

// CREATE garden
export async function createGarden(req: Request, res: Response) {
  try {
    const { name, address, addressNumber, latitude, longitude } = req.body as Partial<CreateGardenBody>;
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    const parsedLatitude = latitude == null ? undefined : Number(latitude);
    const parsedLongitude = longitude == null ? undefined : Number(longitude);

    const garden = await GardenModel.create({
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
export async function listGardens(_req: Request, res: Response) {
  try {
    const gardens = await GardenModel.find().sort({ createdAt: -1 });
    return res.json(gardens);
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// READ one garden
export async function getGardenById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const garden = await GardenModel.findById(id);
    if (!garden) return res.status(404).json({ message: 'garden not found' });
    return res.json(garden);
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

// UPDATE garden
export async function updateGarden(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, address, addressNumber, latitude, longitude } = req.body as Partial<CreateGardenBody>;
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    const parsedLatitude = latitude == null ? undefined : Number(latitude);
    const parsedLongitude = longitude == null ? undefined : Number(longitude);

    const updated = await GardenModel.findByIdAndUpdate(
      id,
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
    const { id } = req.params;
    const garden = await GardenModel.findByIdAndDelete(id);
    if (!garden) return res.status(404).json({ message: 'garden not found' });
    return res.json({ message: 'garden deleted' });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}
