import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Loader2, LocateFixed, MapPinned, X } from 'lucide-react';
import { VITE_API_URL } from '@/consts/consts';
import {
  GARDEN_DIALOG_REQUIRED_ADDRESS_MESSAGE,
  GARDEN_DIALOG_REQUIRED_NAME_MESSAGE,
  GARDEN_DIALOG_SUBMIT_LABEL_BY_MODE,
  GARDEN_DIALOG_TITLE_BY_MODE,
} from '@/consts/GardenDialog.consts';
import { Button } from '@/shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { useCreateGardenMutation, useUpdateGardenMutation } from '@/store/apis/gardens.api';
import type { GardenDialogErrors, GardenDialogProps } from '@/types/GardenDialog.types';
import { MapPicker } from './MapPicker';

export function GardenDialog({
  open,
  onOpenChange,
  mode = 'create',
  garden = null,
  onCreated,
  onSaved,
}: GardenDialogProps) {
  const [createGarden, createState] = useCreateGardenMutation();
  const [updateGarden, updateState] = useUpdateGardenMutation();
  const isEditMode = mode === 'edit';
  const isLoading = isEditMode ? updateState.isLoading : createState.isLoading;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<GardenDialogErrors>({});
  const [locationMatches, setLocationMatches] = useState<Array<{ label: string; latitude: number; longitude: number; country?: string }>>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ label: string; latitude: number; longitude: number; country?: string } | null>(null);
  const [locationLookupLoading, setLocationLookupLoading] = useState(false);
  const [locationLookupError, setLocationLookupError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingPhoto = useMemo(() => {
    if (!isEditMode || !garden?.photo) return null;
    if (garden.photo.startsWith('http')) return garden.photo;

    const origin = new URL(VITE_API_URL).origin;
    return `${origin}${garden.photo.startsWith('/') ? garden.photo : `/${garden.photo}`}`;
  }, [isEditMode, garden?.photo]);

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

    setLocationMatches([]);
    setSelectedLocation(null);
    setLocationLookupLoading(false);
    setLocationLookupError('');
    setShowMapPicker(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
  }, [open, isEditMode, garden]);

  useEffect(() => {
    const baseQuery = [address, addressNumber].filter(Boolean).join(' ').trim();
    const candidateQueries = Array.from(
      new Set(
        [
          baseQuery,
          address.trim(),
          address.trim().replace(/\d+/g, '').trim(),
          address.trim().replace(/\s+\d+.*$/, '').trim(),
          address.trim().split(/\s+/).filter((part) => !/^\d+$/.test(part)).join(' '),
        ].filter((value) => value.length >= 3),
      ),
    );

    if (!open || candidateQueries.length === 0) {
      setLocationMatches([]);
      setLocationLookupError('');
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLocationLookupLoading(true);
        setLocationLookupError('');

        let results: Array<{ name: string; country?: string; latitude: number; longitude: number }> = [];

        for (const query of candidateQueries) {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
          );

          if (!response.ok) continue;

          const payload = (await response.json()) as {
            results?: Array<{ name: string; country?: string; latitude: number; longitude: number }>;
          };

          if (payload.results && payload.results.length > 0) {
            results = payload.results;
            break;
          }
        }

        setLocationMatches(
          results.map((result) => ({
            label: `${result.name}${result.country ? `, ${result.country}` : ''}`,
            latitude: result.latitude,
            longitude: result.longitude,
            country: result.country,
          })),
        );

        if (results.length === 0) {
          setLocationLookupError('We could not find a precise match. Please type the street name or city more clearly.');
        }
      } catch {
        setLocationMatches([]);
        setLocationLookupError('We could not find a precise match. Please check the address or use a more specific street name.');
      } finally {
        setLocationLookupLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [address, addressNumber, open]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhotoSelection() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      clearPhotoSelection();
      setErrors({});
    }
    onOpenChange(nextOpen);
  }

  function selectLocation(match: { label: string; latitude: number; longitude: number; country?: string }) {
    setAddress(match.label);
    setSelectedLocation(match);
    setLocationMatches([]);
    setLocationLookupError('');
    setShowMapPicker(false);
    setErrors((prev) => ({ ...prev, address: undefined }));
  }

  function handleMapPick(match: { label: string; latitude: number; longitude: number; country?: string }) {
    setSelectedLocation(match);
    setLocationMatches([]);
    setLocationLookupError('');
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

    const formData = new FormData();
    const selectedMatch = selectedLocation ?? null;

    formData.append('name', name.trim());
    formData.append('address', address.trim());

    if (selectedMatch) {
      formData.append('latitude', String(selectedMatch.latitude));
      formData.append('longitude', String(selectedMatch.longitude));
    }

    if (isEditMode) {
      formData.append('addressNumber', addressNumber.trim());
    } else if (addressNumber.trim()) {
      formData.append('addressNumber', addressNumber.trim());
    }

    if (photoFile) formData.append('photo', photoFile);

    try {
      if (isEditMode) {
        await updateGarden({ id: garden!._id, formData }).unwrap();
      } else {
        await createGarden(formData).unwrap();
      }

      handleClose(false);
      onCreated?.();
      onSaved?.();
    } catch {
      // error handled by RTK Query
    }
  }

  const displayPhoto = photoPreview ?? existingPhoto;

  const inputCls =
    'h-9 w-full rounded-md border border-input bg-muted/20 px-3 text-sm placeholder:text-muted-foreground transition-colors hover:border-ring/50 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* Header */}
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {GARDEN_DIALOG_TITLE_BY_MODE[mode]}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-4 px-6 py-5">
            {/* Garden Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="garden-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Garden Name <span className="text-destructive normal-case">*</span>
              </label>
              <input
                id="garden-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="My Rooftop Garden"
                className={inputCls}
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>

            {/* Address + Address Number inline at 5:1 */}
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-5 flex flex-col gap-1.5">
                <label htmlFor="garden-address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Address <span className="text-destructive normal-case">*</span>
                </label>
                <div className="relative space-y-2">
                  <input
                    id="garden-address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setSelectedLocation(null);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    placeholder="123 Main Street"
                    className={inputCls}
                  />

                  {locationLookupLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                    </div>
                  )}

                  {showMapPicker && (
                    <MapPicker value={selectedLocation} currentAddress={address} onChange={handleMapPick} />
                  )}

                  {locationMatches.length > 0 && (
                    <div className="absolute left-0 right-0 z-20 mt-2 rounded-md border border-border bg-popover p-1 shadow-lg">
                      <div className="flex items-center gap-2 px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <LocateFixed className="size-3" />
                        Closest matches
                      </div>
                      {locationMatches.map((match) => (
                        <button
                          key={`${match.label}-${match.latitude}-${match.longitude}`}
                          type="button"
                          onClick={() => selectLocation(match)}
                          className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left hover:bg-muted/80"
                        >
                          <span className="text-sm font-medium">{match.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {locationLookupError && <p className="text-destructive text-xs">{locationLookupError}</p>}
                {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
              </div>

              <div className="col-span-1 flex flex-col gap-1.5">
                <label htmlFor="garden-address-number" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  No.
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="garden-address-number"
                    type="text"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    placeholder="4B"
                    className={`${inputCls} flex-1`}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setShowMapPicker((prev) => !prev)}
                    aria-label="Toggle map picker"
                    className="shrink-0"
                  >
                    <MapPinned className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Photo */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Photo</span>
              <input
                ref={fileInputRef}
                id="garden-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {displayPhoto ? (
                <div className="group relative h-32 w-full overflow-hidden rounded-lg border border-border/60">
                  <img src={displayPhoto} alt="Garden preview" className="h-full w-full object-cover" />
                  {/* overlay actions */}
                  <div className="absolute inset-0 flex items-end justify-between bg-linear-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30"
                    >
                      <ImagePlus className="size-3" />
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={clearPhotoSelection}
                      className="rounded-md bg-white/20 p-1 text-white backdrop-blur-sm hover:bg-destructive/80"
                      aria-label="Remove selected photo"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground transition-colors hover:border-ring/50 hover:bg-muted/40"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted/60">
                    <ImagePlus className="size-5" />
                  </div>
                  <span className="text-xs">Click to upload a photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-8 min-w-24 rounded-full px-4 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || (isEditMode && !garden)}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                GARDEN_DIALOG_SUBMIT_LABEL_BY_MODE[mode]
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
