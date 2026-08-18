import { MapPin } from 'lucide-react';
import { Select } from '@/shadcn/components/ui/select';
import { FieldLabel } from '../FieldLabel';
import { useAddLineDialogContext } from '../context';

export function LocationSection() {
  const { config, locationOptions, update } = useAddLineDialogContext();

  return (
    <div className="space-y-1.5">
      <label htmlFor="location">
        <FieldLabel icon={<MapPin className="size-3.5" />}>Location</FieldLabel>
      </label>
      <Select
        id="location"
        value={config.locationKey}
        onChange={(e) => update('locationKey', e.target.value)}
        className="h-11 rounded-xl border-border bg-background/80"
      >
        {locationOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}