import type { ApiGarden } from '@/types/garden.type';

export type GardenDialogMode = 'create' | 'edit';

export type GardenDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: GardenDialogMode;
  garden?: ApiGarden | null;
  onCreated?: () => void;
  onSaved?: () => void;
};

export type GardenDialogErrors = {
  name?: string;
  address?: string;
};

export type GardenLocationMatch = {
  label: string;
  latitude: number;
  longitude: number;
  country?: string;
};

export type GardenGeocodeResult = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
};
