import { CalendarDays, ChevronDown, Clock3, Droplets, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/shadcn/components/ui/input';
import { useAddLineDialogContext } from '../context';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function LegacyConfigurationPanel() {
  const { config, update, legacyConfig, setLegacyConfig } = useAddLineDialogContext();
  const [isOpen, setIsOpen] = useState(true);

  const selectedDaysSummary = useMemo(() => {
    if (legacyConfig.selectedWeekdays.length === 0) return 'No days selected';
    return legacyConfig.selectedWeekdays.join(', ');
  }, [legacyConfig.selectedWeekdays]);

  const toggleDay = (day: string) => {
    setLegacyConfig((current) => {
      const hasDay = current.selectedWeekdays.includes(day);
      if (hasDay) {
        return {
          ...current,
          selectedWeekdays: current.selectedWeekdays.filter((item) => item !== day),
        };
      }

      return {
        ...current,
        selectedWeekdays: hasDay ? current.selectedWeekdays : [...current.selectedWeekdays, day],
      };
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="legacy-configuration-panel"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Settings2 className="size-4" />
          Old School Configuration
        </h3>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div
          id="legacy-configuration-panel"
          className="space-y-4 rounded-xl border border-dashed border-border/80 bg-background/50 p-4 text-sm text-muted-foreground"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              General days of week
            </label>

            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = legacyConfig.selectedWeekdays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {day.slice(0, 2)}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground">Selected: {selectedDaysSummary}</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock3 className="size-3.5 text-muted-foreground" />
              Duration
            </label>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={180}
                value={legacyConfig.durationMinutes}
                onChange={(event) => {
                  const nextDuration = Math.max(1, Number(event.target.value) || 1);
                  setLegacyConfig((current) => ({
                    ...current,
                    durationMinutes: nextDuration,
                  }));
                }}
                className="h-11 rounded-xl border-border bg-background/80"
              />
              <span className="text-xs text-muted-foreground">minutes</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              Area (optional)
            </label>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={0.1}
                value={legacyConfig.areaSizeM2 ?? ''}
                onChange={(event) => {
                  const rawValue = event.target.value.trim();
                  const nextArea = rawValue === '' ? null : Math.max(0, Number(rawValue) || 0);

                  setLegacyConfig((current) => ({
                    ...current,
                    areaSizeM2: nextArea,
                  }));

                  if (nextArea !== null) {
                    update('areaSizeM2', nextArea);
                  }
                }}
                placeholder="m²"
                className="h-11 rounded-xl border-border bg-background/80"
              />
              <span className="text-xs text-muted-foreground">m²</span>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/80 bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Droplets className="size-3.5 text-muted-foreground" />
              Drip settings
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-xs text-muted-foreground">
                <span>Distance (m)</span>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={config.techniqueConfig.distance}
                  onChange={(event) => {
                    update('techniqueKey', 'drip');
                    update('techniqueConfig', {
                      ...config.techniqueConfig,
                      distance: Number(event.target.value) || 0.1,
                    });
                  }}
                  className="h-10 rounded-xl border-border bg-background/80"
                />
              </label>

              <label className="space-y-1.5 text-xs text-muted-foreground">
                <span>Flow rate (L/h)</span>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={config.techniqueConfig.flowRate}
                  onChange={(event) => {
                    update('techniqueKey', 'drip');
                    update('techniqueConfig', {
                      ...config.techniqueConfig,
                      flowRate: Number(event.target.value) || 0.1,
                    });
                  }}
                  className="h-10 rounded-xl border-border bg-background/80"
                />
              </label>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            This mode keeps the classic weekly schedule and drip math while still calculating the same water usage.
          </p>
        </div>
      ) : null}
    </div>
  );
}
