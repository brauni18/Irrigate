import { Loader2 } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { useAddLineDialogContext } from '../context';

export function DialogActionsSection() {
  const { isLoading, isEditMode, onCancel } = useAddLineDialogContext();

  return (
    <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-1 pt-4">
      <Button
        type="button"
        variant="ghost"
        className="h-8 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="h-8 min-w-24 rounded-full px-4 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isEditMode ? 'Save Changes' : 'Add Line'}
      </Button>
    </div>
  );
}