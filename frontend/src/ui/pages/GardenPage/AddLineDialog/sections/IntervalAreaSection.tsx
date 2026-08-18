import { CalendarDays, Maximize2 } from 'lucide-react';
import { Input } from '@/shadcn/components/ui/input';
import { FieldLabel } from '../FieldLabel';
import { useAddLineDialogContext } from '../context';

export function IntervalAreaSection() {
  const { config, usesTreeCount, suggestedIntervalDays, areaPerTreeM2, resolvedTreeCount, update } = useAddLineDialogContext();

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <label htmlFor="interval-days" className="flex flex-col gap-0.5">
          <FieldLabel icon={<CalendarDays className="size-3.5" />}>Interval (days)</FieldLabel>
          {usesTreeCount ? (
            <span className="text-[11px] text-muted-foreground">Suggested: {suggestedIntervalDays} days</span>
          ) : null}
        </label>
        <Input
          id="interval-days"
          type="number"
          min={1}
          max={30}
          value={config.intervalDays}
          onChange={(e) => update('intervalDays', Number(e.target.value))}
          className="h-11 rounded-xl border-border bg-background/80"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={usesTreeCount ? 'tree-count' : 'area-size'} className="flex flex-col gap-0.5">
          <FieldLabel icon={<Maximize2 className="size-3.5" />}>
            {usesTreeCount ? 'Tree Count' : 'Area Size (m²)'}
          </FieldLabel>
          {usesTreeCount ? (
            <span className="text-[11px] text-muted-foreground">{areaPerTreeM2} m² per tree from the backend catalog</span>
          ) : null}
        </label>
        <Input
          id={usesTreeCount ? 'tree-count' : 'area-size'}
          type="number"
          min={1}
          value={usesTreeCount ? (config.treeCount ?? resolvedTreeCount ?? 1) : config.areaSizeM2}
          onChange={(e) => {
            const nextValue = Math.max(1, Number(e.target.value));

            if (usesTreeCount) {
              update('treeCount', nextValue);
              update('areaSizeM2', nextValue * areaPerTreeM2);
              return;
            }

            update('areaSizeM2', nextValue);
          }}
          className="h-11 rounded-xl border-border bg-background/80"
        />
      </div>
    </div>
  );
}