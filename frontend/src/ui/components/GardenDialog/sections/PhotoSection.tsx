import { ImagePlus, X } from 'lucide-react';
import { useGardenDialogContext } from '../context';

export function PhotoSection() {
  const {
    displayPhoto,
    fileInputRef,
    onPhotoChange,
    onOpenPhotoPicker,
    onClearPhoto,
  } = useGardenDialogContext();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Photo</span>
      <input
        ref={fileInputRef}
        id="garden-photo"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPhotoChange}
      />
      {displayPhoto ? (
        <div className="group relative h-32 w-full overflow-hidden rounded-lg border border-border/60">
          <img src={displayPhoto} alt="Garden preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-between bg-linear-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={onOpenPhotoPicker}
              className="flex items-center gap-1.5 rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30"
            >
              <ImagePlus className="size-3" />
              Change
            </button>
            <button
              type="button"
              onClick={onClearPhoto}
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
          onClick={onOpenPhotoPicker}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground transition-colors hover:border-ring/50 hover:bg-muted/40"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-muted/60">
            <ImagePlus className="size-5" />
          </div>
          <span className="text-xs">Click to upload a photo</span>
        </button>
      )}
    </div>
  );
}