import { createContext, useContext } from 'react';
import type { CatalogPlants, SelectOption } from '@/types/AddLineDialog.types';
import type { IrrigationCalculation, IrrigationLineConfig, SprinklerConfig } from '@/types/irrigationLine.type';

export type ConfigurationMode = 'modern' | 'legacy';

export type LegacyConfigurationState = {
  selectedWeekdays: string[];
  durationMinutes: number;
  areaSizeM2: number | null;
};

export type AddLineDialogContextValue = {
  isEditMode: boolean;
  isLoading: boolean;
  name: string;
  nameError: string;
  onNameChange: (value: string) => void;
  config: IrrigationLineConfig;
  setConfig: (value: IrrigationLineConfig | ((prev: IrrigationLineConfig) => IrrigationLineConfig)) => void;
  update: <K extends keyof IrrigationLineConfig>(key: K, value: IrrigationLineConfig[K]) => void;
  plantOptions: SelectOption[];
  locationOptions: SelectOption[];
  distanceOptions: SelectOption[];
  flowOptions: SelectOption[];
  catalogPlants?: CatalogPlants;
  usesTreeCount: boolean;
  areaPerTreeM2: number;
  suggestedIntervalDays: number;
  resolvedTreeCount: number | null;
  activeTechniqueKey: 'drip' | 'sprinkler';
  techniqueMenuOpen: boolean;
  setTechniqueMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  resolvedSprinklerConfigs: SprinklerConfig[];
  calculation: IrrigationCalculation | null;
  calculationError: string | null;
  isCalculating: boolean;
  preparedConfig: IrrigationLineConfig;
  formattedDuration: { padded: string; compact: string } | null;
  configurationMode: ConfigurationMode;
  setConfigurationMode: (value: ConfigurationMode | ((prev: ConfigurationMode) => ConfigurationMode)) => void;
  legacyConfig: LegacyConfigurationState;
  setLegacyConfig: (value: LegacyConfigurationState | ((prev: LegacyConfigurationState) => LegacyConfigurationState)) => void;
  onCancel: () => void;
};

const AddLineDialogContext = createContext<AddLineDialogContextValue | null>(null);

export const AddLineDialogProvider = AddLineDialogContext.Provider;

export function useAddLineDialogContext() {
  const context = useContext(AddLineDialogContext);

  if (!context) {
    throw new Error('useAddLineDialogContext must be used within AddLineDialogProvider');
  }

  return context;
}