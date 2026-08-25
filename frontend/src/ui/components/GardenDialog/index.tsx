import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GARDEN_DIALOG_REQUIRED_ADDRESS_MESSAGE,
  GARDEN_DIALOG_REQUIRED_NAME_MESSAGE,
  GARDEN_DIALOG_TITLE_BY_MODE,
} from '@/consts/GardenDialog.consts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import {
  useCreateGardenMutation,
  useRequestGardenPhotoUploadUrlMutation,
  useUpdateGardenMutation,
} from '@/store/apis/gardens.api';
import type { GardenMutationBody } from '@/types/garden.type';
import type {
  GardenDialogErrors,
  GardenDialogProps,
  GardenLocationMatch,
} from '@/types/GardenDialog.types';
import { useGardenLocationLookup } from '@/hooks';
import { GardenDialogProvider } from './context';
import { AddressSection } from './sections/AddressSection';
import { DialogFooterSection } from './sections/DialogFooterSection';
import { GardenNameSection } from './sections/GardenNameSection';
import { PhotoSection } from './sections/PhotoSection';
import { resolveExistingPhoto } from './utils';

export function GardenDialog({
  open,
  onOpenChange,
  mode = 'create',
  garden = null,
  onCreated,
  onSaved,
}: GardenDialogProps) {
  const [requestGardenPhotoUploadUrl, uploadUrlState] = useRequestGardenPhotoUploadUrlMutation();
  const [createGarden, createState] = useCreateGardenMutation();
  const [updateGarden, updateState] = useUpdateGardenMutation();
  const isEditMode = mode === 'edit';
  const isLoading = uploadUrlState.isLoading || (isEditMode ? updateState.isLoading : createState.isLoading);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<GardenDialogErrors>({});
  const [selectedLocation, setSelectedLocation] = useState<GardenLocationMatch | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const {
    locationMatches,
    locationLookupLoading,
    locationLookupError,
    clearLookup,
    setLocationLookupError,
  } = useGardenLocationLookup({
    open,
    address,
    addressNumber,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingPhoto = useMemo(
    () => resolveExistingPhoto(isEditMode, garden?.photo),
    [isEditMode, garden?.photo],
  );

  useEffect(() => {
    if (!open) return;

    if (isEditMode && garden) {
      setName(garden.name);
      setAddress(garden.address);
      setAddressNumber(garden.addressNumber ?? '');
    } else {
      setName('');
      setAddress('');
      setAddressNumber('');
    }

    clearLookup();
    setSelectedLocation(null);
    setShowMapPicker(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
  }, [open, isEditMode, garden]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: undefined }));
    }
  }

  function clearPhotoSelection() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadPhoto(file: File) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    const signedUpload = await requestGardenPhotoUploadUrl({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }).unwrap();

    const uploadResponse = await fetch(signedUpload.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload photo to storage');
    }

    return signedUpload.photoKey;
  }

  function getErrorMessage(error: unknown) {
    if (typeof error === 'object' && error !== null) {
      const typedError = error as { data?: { message?: unknown }; message?: unknown };

      if (typeof typedError.data?.message === 'string' && typedError.data.message.trim()) {
        return typedError.data.message;
      }

      if (typeof typedError.message === 'string' && typedError.message.trim()) {
        return typedError.message;
      }
    }

    return 'Failed to save garden. Please try again.';
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      clearPhotoSelection();
      setErrors({});
    }
    onOpenChange(nextOpen);
  }

  function selectLocation(match: GardenLocationMatch) {
    setAddress(match.label);
    setSelectedLocation(match);
    clearLookup();
    setShowMapPicker(false);
    setErrors((prev) => ({ ...prev, address: undefined }));
  }

  function handleMapPick(match: GardenLocationMatch) {
    setSelectedLocation(match);
    clearLookup();
    if (!address.trim()) {
      setAddress(match.label);
    }
    setShowMapPicker(true);
    setErrors((prev) => ({ ...prev, address: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditMode && !garden) return;

    const newErrors: GardenDialogErrors = {};
    if (!name.trim()) newErrors.name = GARDEN_DIALOG_REQUIRED_NAME_MESSAGE;
    if (!address.trim()) newErrors.address = GARDEN_DIALOG_REQUIRED_ADDRESS_MESSAGE;
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const selectedMatch = selectedLocation ?? null;
    const body: GardenMutationBody = {
      name: name.trim(),
      address: address.trim(),
    };

    setErrors({});

    if (selectedMatch) {
      body.latitude = selectedMatch.latitude;
      body.longitude = selectedMatch.longitude;
    }

    if (isEditMode) {
      body.addressNumber = addressNumber.trim();
    } else if (addressNumber.trim()) {
      body.addressNumber = addressNumber.trim();
    }

    try {
      if (photoFile) {
        body.photoKey = await uploadPhoto(photoFile);
      }

      if (isEditMode) {
        await updateGarden({ id: garden!._id, body }).unwrap();
      } else {
        await createGarden(body).unwrap();
      }

      handleClose(false);
      onCreated?.();
      onSaved?.();
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: getErrorMessage(error) }));
    }
  }

  const displayPhoto = photoPreview ?? existingPhoto;

  const contextValue = useMemo(
    () => ({
      mode,
      isLoading,
      disableSubmit: isLoading || (isEditMode && !garden),
      name,
      address,
      addressNumber,
      errors,
      locationLookupLoading,
      showMapPicker,
      selectedLocation,
      locationMatches,
      locationLookupError,
      displayPhoto,
      fileInputRef,
      onNameChange: (value: string) => {
        setName(value);
        if (errors.name || errors.submit) {
          setErrors((prev) => ({ ...prev, name: undefined, submit: undefined }));
        }
      },
      onAddressChange: (value: string) => {
        setAddress(value);
        setSelectedLocation(null);
        setLocationLookupError('');
        if (errors.address || errors.submit) {
          setErrors((prev) => ({ ...prev, address: undefined, submit: undefined }));
        }
      },
      onAddressNumberChange: setAddressNumber,
      onToggleMapPicker: () => setShowMapPicker((prev) => !prev),
      onSelectLocation: selectLocation,
      onMapPick: handleMapPick,
      onPhotoChange: handlePhotoChange,
      onOpenPhotoPicker: () => fileInputRef.current?.click(),
      onClearPhoto: clearPhotoSelection,
      onCancel: () => handleClose(false),
    }),
    [
      mode,
      isLoading,
      isEditMode,
      garden,
      name,
      address,
      addressNumber,
      errors,
      locationLookupLoading,
      showMapPicker,
      selectedLocation,
      locationMatches,
      locationLookupError,
      displayPhoto,
    ],
  );

  return (
    <GardenDialogProvider value={contextValue}>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border/60 px-6 py-4">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {GARDEN_DIALOG_TITLE_BY_MODE[mode]}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col">
            <div className="flex flex-col gap-4 px-6 py-5">
              <GardenNameSection />
              <AddressSection />
              <PhotoSection />
            </div>

            <DialogFooterSection />
          </form>
        </DialogContent>
      </Dialog>
    </GardenDialogProvider>
  );
}