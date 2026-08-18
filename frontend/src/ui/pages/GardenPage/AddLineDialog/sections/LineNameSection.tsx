import { Input } from '@/shadcn/components/ui/input';
import { ADD_LINE_PLACEHOLDER } from '@/consts/AddLineDialog.consts';
import { useAddLineDialogContext } from '../context';

export function LineNameSection() {
  const { name, nameError, onNameChange } = useAddLineDialogContext();

  return (
    <div className="space-y-2">
      <label htmlFor="line-name" className="text-sm font-medium text-foreground">
        Line name
      </label>
      <Input
        id="line-name"
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={ADD_LINE_PLACEHOLDER}
        className="h-11 rounded-xl border-border bg-background/80 text-sm shadow-sm focus-visible:ring-primary/20"
        autoFocus
      />
      {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
    </div>
  );
}