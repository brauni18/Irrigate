import type { GardenDialogMode } from '@/types/GardenDialog.types';

export const GARDEN_DIALOG_TITLE_BY_MODE: Record<GardenDialogMode, string> = {
  create: 'New Garden',
  edit: 'Edit Garden',
};

export const GARDEN_DIALOG_SUBMIT_LABEL_BY_MODE: Record<GardenDialogMode, string> = {
  create: 'Create',
  edit: 'Save Changes',
};

export const GARDEN_DIALOG_REQUIRED_NAME_MESSAGE = 'Garden name is required';
export const GARDEN_DIALOG_REQUIRED_ADDRESS_MESSAGE = 'Address is required';
