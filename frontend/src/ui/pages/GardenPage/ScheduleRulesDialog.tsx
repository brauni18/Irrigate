import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Settings2 } from 'lucide-react';
import { DEFAULT_SCHEDULE_RULES, WEEKDAY_OPTIONS, type ScheduleRules } from '@/consts/GardenPage.consts';
import { Button } from '@/shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Input } from '@/shadcn/components/ui/input';
import type { ScheduleRulesDialogProps } from '@/types/GardenPage.types';

function clampHour(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(23, Math.max(0, Math.floor(value)));
}

function normalizeRules(rules: ScheduleRules): ScheduleRules {
  const preferredStartHour = clampHour(rules.preferredStartHour, DEFAULT_SCHEDULE_RULES.preferredStartHour);
  const preferredEndHour = Math.min(24, Math.max(preferredStartHour + 1, Math.floor(rules.preferredEndHour || DEFAULT_SCHEDULE_RULES.preferredEndHour)));
  const lineSpacingMinutes = Math.min(180, Math.max(-120, Math.floor(rules.lineSpacingMinutes || 0)));

  return {
    blockedWeekdays: Array.from(new Set(rules.blockedWeekdays)).sort((a, b) => a - b),
    preferredStartHour,
    preferredEndHour,
    lineSpacingMinutes,
  };
}

function toHourInput(value: number) {
  return String(value).padStart(2, '0');
}

export function ScheduleRulesDialog({ open, onOpenChange, value, onApply }: ScheduleRulesDialogProps) {
  const [draft, setDraft] = useState<ScheduleRules>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  function toggleWeekday(day: number) {
    setDraft((current) => ({
      ...current,
      blockedWeekdays: current.blockedWeekdays.includes(day)
        ? current.blockedWeekdays.filter((item) => item !== day)
        : [...current.blockedWeekdays, day],
    }));
  }

  function handleApply() {
    onApply(normalizeRules(draft));
    onOpenChange(false);
  }

  function handleReset() {
    setDraft(DEFAULT_SCHEDULE_RULES);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-border/80 bg-card p-0 shadow-xl">
        <div className="border-b border-border/70 bg-gradient-to-r from-primary/6 via-transparent to-accent/10 px-6 py-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Settings2 className="h-5 w-5" />
              Schedule rules
            </DialogTitle>
            <DialogDescription>
              Exclude watering on specific weekdays and keep scheduled runs inside your preferred hours.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          <section className="space-y-3 rounded-2xl border border-border/80 bg-muted/25 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Skip weekdays
            </h3>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map((day) => {
                const isActive = draft.blockedWeekdays.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => toggleWeekday(day.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:border-ring/50'}`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-border/80 bg-muted/25 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              Preferred hours
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="schedule-start-hour" className="text-sm font-medium text-foreground">
                  Earliest start
                </label>
                <Input
                  id="schedule-start-hour"
                  type="number"
                  min={0}
                  max={23}
                  value={toHourInput(draft.preferredStartHour)}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    preferredStartHour: Number(event.target.value),
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="schedule-end-hour" className="text-sm font-medium text-foreground">
                  Latest start window
                </label>
                <Input
                  id="schedule-end-hour"
                  type="number"
                  min={1}
                  max={24}
                  value={String(draft.preferredEndHour)}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    preferredEndHour: Number(event.target.value),
                  }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="schedule-spacing-minutes" className="text-sm font-medium text-foreground">
                Time between lines
              </label>
              <Input
                id="schedule-spacing-minutes"
                type="number"
                min={-120}
                max={180}
                value={String(draft.lineSpacingMinutes)}
                onChange={(event) => setDraft((current) => ({
                  ...current,
                  lineSpacingMinutes: Number(event.target.value),
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Use positive minutes to wait after the previous line finishes. Use negative minutes to allow overlap.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Example: 6 to 9 keeps scheduled runs between 06:00 and 09:00.
            </p>
          </section>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
            onClick={handleReset}
          >
            Reset
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-8 min-w-24 rounded-full px-4 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleApply}
            >
              Apply rules
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}