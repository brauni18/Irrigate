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

export const GARDEN_DIALOG_INPUT_CLASSNAME =
  'h-9 w-full rounded-md border border-input bg-muted/20 px-3 text-sm placeholder:text-muted-foreground transition-colors hover:border-ring/50 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const GARDEN_DIALOG_ADDRESS_LOOKUP_DEBOUNCE_MS = 350;

export const GARDEN_DIALOG_ADDRESS_LOOKUP_EMPTY_MESSAGE =
  'We could not find a precise match. Please type the street name or city more clearly.';

export const GARDEN_DIALOG_ADDRESS_LOOKUP_FAILED_MESSAGE =
  'We could not find a precise match. Please check the address or use a more specific street name.';
