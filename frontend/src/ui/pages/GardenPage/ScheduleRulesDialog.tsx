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

function clampMinute(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(59, Math.max(0, Math.floor(value)));
}

function splitMinuteOfDay(value: number) {
  const normalized = Math.max(0, Math.floor(value));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return { hours, minutes };
}

function toMinuteOfDay(hours: number, minutes: number) {
  return hours * 60 + minutes;
}

function normalizeRules(rules: ScheduleRules): ScheduleRules {
  const fallbackStart = DEFAULT_SCHEDULE_RULES.preferredStartMinute;
  const fallbackEnd = DEFAULT_SCHEDULE_RULES.preferredEndMinute;
  const preferredStartMinute = Math.min(23 * 60 + 59, Math.max(0, Math.floor(rules.preferredStartMinute ?? fallbackStart)));
  const preferredEndMinute = Math.min(24 * 60, Math.max(preferredStartMinute + 1, Math.floor(rules.preferredEndMinute ?? fallbackEnd)));
  const lineSpacingMinutes = Math.min(180, Math.max(-120, Math.floor(rules.lineSpacingMinutes || 0)));

  return {
    blockedWeekdays: Array.from(new Set(rules.blockedWeekdays)).sort((a, b) => a - b),
    preferredStartMinute,
    preferredEndMinute,
    lineSpacingMinutes,
  };
}

export function ScheduleRulesDialog({ open, onOpenChange, value, onApply }: ScheduleRulesDialogProps) {
  const [draft, setDraft] = useState<ScheduleRules>(value);
  const startTime = splitMinuteOfDay(draft.preferredStartMinute);
  const endTime = splitMinuteOfDay(draft.preferredEndMinute);

  function updateStartHours(rawHours: number) {
    const hours = clampHour(rawHours, startTime.hours);
    const minutes = clampMinute(startTime.minutes, 0);
    setDraft((current) => ({
      ...current,
      preferredStartMinute: toMinuteOfDay(hours, minutes),
    }));
  }

  function updateStartMinutes(rawMinutes: number) {
    const hours = clampHour(startTime.hours, 0);
    const minutes = clampMinute(rawMinutes, startTime.minutes);
    setDraft((current) => ({
      ...current,
      preferredStartMinute: toMinuteOfDay(hours, minutes),
    }));
  }

  function updateEndHours(rawHours: number) {
    const hours = Math.min(24, Math.max(0, Math.floor(rawHours)));
    const minutes = hours === 24 ? 0 : clampMinute(endTime.minutes, 0);
    setDraft((current) => ({
      ...current,
      preferredEndMinute: toMinuteOfDay(hours, minutes),
    }));
  }

  function updateEndMinutes(rawMinutes: number) {
    if (endTime.hours >= 24) {
      setDraft((current) => ({
        ...current,
        preferredEndMinute: toMinuteOfDay(24, 0),
      }));
      return;
    }

    const hours = clampHour(endTime.hours, 0);
    const minutes = clampMinute(rawMinutes, endTime.minutes);
    setDraft((current) => ({
      ...current,
      preferredEndMinute: toMinuteOfDay(hours, minutes),
    }));
  }

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
        <div className="border-b border-border/70 bg-linear-to-r from-primary/6 via-transparent to-accent/10 px-6 py-5">
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
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Input
                    id="schedule-start-hour"
                    type="number"
                    min={0}
                    max={23}
                    value={String(startTime.hours).padStart(2, '0')}
                    onChange={(event) => updateStartHours(Number(event.target.value))}
                  />
                  <span className="text-muted-foreground text-sm">:</span>
                  <Input
                    id="schedule-start-minute"
                    type="number"
                    min={0}
                    max={59}
                    value={String(startTime.minutes).padStart(2, '0')}
                    onChange={(event) => updateStartMinutes(Number(event.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="schedule-end-hour" className="text-sm font-medium text-foreground">
                  Latest start window
                </label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Input
                    id="schedule-end-hour"
                    type="number"
                    min={0}
                    max={24}
                    value={String(endTime.hours).padStart(2, '0')}
                    onChange={(event) => updateEndHours(Number(event.target.value))}
                  />
                  <span className="text-muted-foreground text-sm">:</span>
                  <Input
                    id="schedule-end-minute"
                    type="number"
                    min={0}
                    max={59}
                    value={String(endTime.minutes).padStart(2, '0')}
                    disabled={endTime.hours >= 24}
                    onChange={(event) => updateEndMinutes(Number(event.target.value))}
                  />
                </div>
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
              Example: 06:30 to 09:45 keeps scheduled runs between those times.
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