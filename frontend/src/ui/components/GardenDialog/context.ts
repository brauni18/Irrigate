import { createContext, useContext } from 'react';
import type { GardenDialogErrors, GardenDialogMode, GardenLocationMatch } from '@/types/GardenDialog.types';

export type GardenDialogContextValue = {
  mode: GardenDialogMode;
  isLoading: boolean;
  disableSubmit: boolean;
  name: string;
  address: string;
  addressNumber: string;
  errors: GardenDialogErrors;
  locationLookupLoading: boolean;
  showMapPicker: boolean;
  selectedLocation: GardenLocationMatch | null;
  locationMatches: GardenLocationMatch[];
  locationLookupError: string;
  displayPhoto: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAddressNumberChange: (value: string) => void;
  onToggleMapPicker: () => void;
  onSelectLocation: (match: GardenLocationMatch) => void;
  onMapPick: (match: GardenLocationMatch) => void;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPhotoPicker: () => void;
  onClearPhoto: () => void;
  onCancel: () => void;
};

const GardenDialogContext = createContext<GardenDialogContextValue | null>(null);

export const GardenDialogProvider = GardenDialogContext.Provider;

export function useGardenDialogContext() {
  const context = useContext(GardenDialogContext);

  if (!context) {
    throw new Error('useGardenDialogContext must be used within a GardenDialogProvider');
  }

  return context;
}