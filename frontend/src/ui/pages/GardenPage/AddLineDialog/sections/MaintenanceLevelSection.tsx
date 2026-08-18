import { Settings2 } from 'lucide-react';
import { FieldLabel } from '../FieldLabel';
import { useAddLineDialogContext } from '../context';

export function MaintenanceLevelSection() {
  const { config, update } = useAddLineDialogContext();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel icon={<Settings2 className="size-3.5" />}>Maintenance Level</FieldLabel>
        <span className="text-sm font-medium tabular-nums">{config.maintenanceLevel}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={config.maintenanceLevel}
        onChange={(e) => update('maintenanceLevel', Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}