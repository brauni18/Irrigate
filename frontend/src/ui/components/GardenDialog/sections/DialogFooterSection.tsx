import { Loader2 } from 'lucide-react';
import { GARDEN_DIALOG_SUBMIT_LABEL_BY_MODE } from '@/consts/GardenDialog.consts';
import { Button } from '@/shadcn/components/ui/button';
import { useGardenDialogContext } from '../context';

export function DialogFooterSection() {
  const { mode, isLoading, disableSubmit, errors, onCancel } = useGardenDialogContext();

  return (
    <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-6 py-4">
      {errors.submit ? <p className="mr-auto text-sm text-destructive">{errors.submit}</p> : null}
      <Button
        type="button"
        variant="ghost"
        className="h-8 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="h-8 min-w-24 rounded-full bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
        disabled={disableSubmit}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          GARDEN_DIALOG_SUBMIT_LABEL_BY_MODE[mode]
        )}
      </Button>
    </div>
  );
}