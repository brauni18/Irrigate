import { Loader2, LocateFixed, MapPinned } from 'lucide-react';
import { GARDEN_DIALOG_INPUT_CLASSNAME } from '@/consts/GardenDialog.consts';
import { Button } from '@/shadcn/components/ui/button';
import { MapPicker } from '@/ui/components/MapPicker';
import { useGardenDialogContext } from '../context';

export function AddressSection() {
  const {
    address,
    addressNumber,
    errors,
    locationLookupLoading,
    showMapPicker,
    selectedLocation,
    locationMatches,
    locationLookupError,
    onAddressChange,
    onAddressNumberChange,
    onToggleMapPicker,
    onSelectLocation,
    onMapPick,
  } = useGardenDialogContext();

  return (
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
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="123 Main Street"
            className={GARDEN_DIALOG_INPUT_CLASSNAME}
          />

          {locationLookupLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
            </div>
          )}

          {showMapPicker && (
            <MapPicker value={selectedLocation} currentAddress={address} onChange={onMapPick} />
          )}

          {locationMatches.length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-2 rounded-md border border-border bg-popover p-1 shadow-lg">
              <div className="flex items-center gap-2 px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <LocateFixed className="size-3" />
                Closest matches
              </div>
              {locationMatches.map((match) => (
                <button
                  key={`${match.label}-${match.latitude}-${match.longitude}`}
                  type="button"
                  onClick={() => onSelectLocation(match)}
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
            onChange={(e) => onAddressNumberChange(e.target.value)}
            placeholder="4B"
            className={`${GARDEN_DIALOG_INPUT_CLASSNAME} flex-1`}
          />

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onToggleMapPicker}
            aria-label="Toggle map picker"
            className="shrink-0"
          >
            <MapPinned className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}