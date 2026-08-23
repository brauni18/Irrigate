import { Settings2 } from 'lucide-react';
import { IntervalAreaSection } from './IntervalAreaSection';
import { LocationSection } from './LocationSection';
import { MaintenanceLevelSection } from './MaintenanceLevelSection';
import { PlantTypeSection } from './PlantTypeSection';
import { TechniqueSettingsSection } from './TechniqueSettingsSection';
export function ConfigurationSection() {
  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-muted/25 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Settings2 className="size-4" />
        Configuration
      </h3>
      <PlantTypeSection />
      <MaintenanceLevelSection />
      <LocationSection />
      <IntervalAreaSection />
      <TechniqueSettingsSection />
    </div>
  );
}