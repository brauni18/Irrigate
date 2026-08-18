import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Plus,
  Settings2,
  Wind,
} from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { useGSAP } from '@gsap/react';
import { useGetGardenQuery } from '@/store/apis/gardens.api';
import {
  useCreateLineMutation,
  useDeleteLineMutation,
  useListLinesQuery,
  useUpdateLineMutation,
} from '@/store/apis/irrigationLines.api';
import {
  DEFAULT_SCHEDULE_RULES,
  SCHEDULE_FUTURE_DAYS,
  SCHEDULE_HISTORY_DAYS,
  buildScheduleWindow,
  type ScheduleRules,
} from '@/consts/GardenPage.consts';
import { WeatherWidget } from './GardenPage/WeatherWidget';
import { AnalyticsSection } from './GardenPage/AnalyticsSection';
import { IrrigationLineCard } from './GardenPage/IrrigationLineCard';
import { AddLineDialog } from './GardenPage/AddLineDialog';
import { ScheduleRulesDialog } from './GardenPage/ScheduleRulesDialog';
import type { IrrigationLineConfig } from '@/types/irrigationLine.type';
import { animateSectionReveal } from '@/utils/gsapAnimations';

const FALLBACK_DIALOG_CONFIG: IrrigationLineConfig = {
  plantKey: 'trees',
  maintenanceLevel: 50,
  locationKey: 'north',
  intervalDays: 7,
  areaSizeM2: 4,
  treeCount: 1,
  techniqueKey: 'drip',
  techniqueConfig: {
    distance: 0.5,
    flowRate: 2.3,
  },
};

function getLinePlantCount(line: { config?: IrrigationLineConfig; calculation?: { dripPresCount: number } }) {
  if (line.config?.plantKey === 'trees') {
    if (Number.isFinite(line.config.treeCount) && (line.config.treeCount ?? 0) > 0) {
      return Math.max(1, Math.round(line.config.treeCount ?? 0));
    }

    const areaPerTreeM2 = 4;
    if (Number.isFinite(line.config.areaSizeM2) && (line.config.areaSizeM2 ?? 0) > 0) {
      return Math.max(1, Math.round((line.config.areaSizeM2 ?? 0) / areaPerTreeM2));
    }

    return 1;
  }

  const fallbackDripCount =
    line.calculation?.dripPresCount ??
    ((line.config?.areaSizeM2 ?? 0) / ((line.config?.techniqueConfig.distance ?? 1) ** 2));

  return Math.max(1, Math.round(fallbackDripCount));
}

export function GardenPage() {
  const { id } = useParams<{ id: string }>();
  const [addLineOpen, setAddLineOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<{ id: string; name: string; config: IrrigationLineConfig } | null>(null);
  const [linePendingDelete, setLinePendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [usagePeriod, setUsagePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [closingAllLines, setClosingAllLines] = useState(false);
  const [scheduleRulesOpen, setScheduleRulesOpen] = useState(false);
  const [scheduleRules, setScheduleRules] = useState<ScheduleRules>(DEFAULT_SCHEDULE_RULES);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const scheduleTabsRef = useRef<HTMLDivElement | null>(null);

  const { data: garden, isLoading: gardenLoading, isError: gardenError } = useGetGardenQuery(id!);
  const { data: lines = [], isLoading: linesLoading } = useListLinesQuery(id!);
  const [createLine, createState] = useCreateLineMutation();
  const [updateLine] = useUpdateLineMutation();
  const [deleteLine] = useDeleteLineMutation();

  useGSAP(
    () => {
      if (!contentRef.current) return;
      animateSectionReveal(contentRef.current);
    },
    { dependencies: [id], scope: contentRef, revertOnUpdate: true },
  );

  const totalPlants = lines.reduce((sum, line) => sum + getLinePlantCount(line), 0);
  const totalHoseLengthMeters = lines.reduce((sum, line) => {
    const dripCount = line.calculation?.dripPresCount ?? 0;
    const spacing = line.config?.techniqueConfig.distance ?? 0;
    return sum + dripCount * spacing;
  }, 0);
  const totalGardenAreaM2 = lines.reduce((sum, line) => sum + (line.config?.areaSizeM2 ?? 0), 0);
  const yearlyWaterUsageLiters = lines.reduce((sum, line) => {
    const litersPerRun = (line.calculation?.waterPortion ?? 0) * 1000;
    const intervalDays = Math.max(1, Math.floor(line.config?.intervalDays ?? 1));
    return sum + litersPerRun * (365 / intervalDays);
  }, 0);
  const scheduleReferenceDate = new Date();

  async function handleAddLine(name: string, config: IrrigationLineConfig) {
    await createLine({ gardenId: id!, name, config }).unwrap();
    setAddLineOpen(false);
  }

  async function handleEditLine(name: string, config: IrrigationLineConfig) {
    if (!editingLine) return;
    await updateLine({ gardenId: id!, lineId: editingLine.id, name, config }).unwrap();
    setEditingLine(null);
  }

  function openEditDialog(line: { _id: string; name: string; config?: IrrigationLineConfig }) {
    setEditingLine({
      id: line._id,
      name: line.name,
      config: line.config ?? FALLBACK_DIALOG_CONFIG,
    });
  }

  async function handleToggleLine(lineId: string, isActive: boolean) {
    await updateLine({ gardenId: id!, lineId, isActive }).unwrap();
  }

  async function handleToggleAllLines() {
    if (lines.length === 0) return;

    const shouldEnableAll = lines.every((line) => !line.isActive);
    const linesToUpdate = lines.filter((line) => line.isActive !== shouldEnableAll);

    if (linesToUpdate.length === 0) return;

    setClosingAllLines(true);
    try {
      await Promise.all(
        linesToUpdate.map((line) =>
          updateLine({ gardenId: id!, lineId: line._id, isActive: shouldEnableAll }).unwrap(),
        ),
      );
    } finally {
      setClosingAllLines(false);
    }
  }

  function handleDeleteLine(lineId: string, lineName: string) {
    setLinePendingDelete({ id: lineId, name: lineName });
  }

  async function confirmDeleteLine() {
    if (!linePendingDelete) return;
    await deleteLine({ gardenId: id!, lineId: linePendingDelete.id }).unwrap();
    setLinePendingDelete(null);
  }

  const upcomingSchedule = buildScheduleWindow(
    lines,
    scheduleReferenceDate,
    SCHEDULE_HISTORY_DAYS,
    SCHEDULE_FUTURE_DAYS,
    scheduleRules,
  );

  function formatDayTab(dateKey: string, now: Date) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayDiff = Math.round((targetDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    if (dayDiff === 0) return 'Today';
    if (dayDiff === 1) return 'Tomorrow';

    return targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  }

  const scheduleDays = upcomingSchedule.reduce<Array<{ key: string; label: string; entries: typeof upcomingSchedule }>>(
    (days, entry) => {
      const existingDay = days.find((day) => day.key === entry.dateKey);

      if (existingDay) {
        existingDay.entries.push(entry);
        return days;
      }

      days.push({
        key: entry.dateKey,
        label: formatDayTab(entry.dateKey, scheduleReferenceDate),
        entries: [entry],
      });

      return days;
    },
    [],
  );

  const [selectedScheduleDay, setSelectedScheduleDay] = useState('');

  useEffect(() => {
    if (scheduleDays.length === 0) {
      setSelectedScheduleDay('');
      return;
    }

    if (!scheduleDays.some((day) => day.key === selectedScheduleDay)) {
      const todayKey = [
        scheduleReferenceDate.getFullYear(),
        String(scheduleReferenceDate.getMonth() + 1).padStart(2, '0'),
        String(scheduleReferenceDate.getDate()).padStart(2, '0'),
      ].join('-');
      const defaultDay = scheduleDays.find((day) => day.key >= todayKey) ?? scheduleDays[scheduleDays.length - 1];
      setSelectedScheduleDay(defaultDay.key);
    }
  }, [scheduleDays, selectedScheduleDay]);

  useEffect(() => {
    const activeTab = scheduleTabsRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    activeTab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedScheduleDay]);

  const activeScheduleDay = scheduleDays.find((day) => day.key === selectedScheduleDay) ?? scheduleDays[0];

  if (gardenLoading) {
    return (
      <div className="flex min-h-85 items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted/80" />
            <div className="space-y-2">
              <div className="h-4 w-36 rounded-full bg-muted/80" />
              <div className="h-3 w-52 rounded-full bg-muted/60" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-32 rounded-2xl bg-muted/80" />
            <div className="h-32 rounded-2xl bg-muted/60" />
          </div>
          <div className="h-24 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (gardenError || !garden) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load garden.</p>
        <Link to="/" className="text-primary mt-2 inline-flex items-center gap-1 text-sm hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  function scrollScheduleTabs(direction: 'left' | 'right') {
    scheduleTabsRef.current?.scrollBy({
      left: direction === 'left' ? -180 : 180,
      behavior: 'smooth',
    });
  }

  return (
    <div ref={contentRef} className="space-y-8 px-6 pb-6 pt-1">
      <div data-animate="section" className="-mt-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{garden.name}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {garden.addressNumber ? `${garden.address}, ${garden.addressNumber}` : garden.address}
            </p>
          </div>
        </div>

        {(() => {
          const hasLines = lines.length > 0;
          const allLinesOn = hasLines && lines.every((line) => line.isActive);

          return (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">All lines</span>
              <button
                type="button"
                role="switch"
                aria-checked={allLinesOn}
                aria-label={allLinesOn ? 'Turn all lines off' : 'Turn all lines on'}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${allLinesOn ? 'bg-emerald-500' : 'bg-slate-300'}`}
                onClick={() => void handleToggleAllLines()}
                disabled={closingAllLines || !hasLines}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${allLinesOn ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          );
        })()}
      </div>

      <div data-animate="section" className="overflow-hidden rounded-2xl border border-slate-200/80">
        <WeatherWidget
          address={garden.address}
          addressNumber={garden.addressNumber}
          latitude={garden.latitude}
          longitude={garden.longitude}
        />
      </div>

      {/* 2. irrigation lines */}
      <section data-animate="section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Droplets className="h-5 w-5" />
            Irrigation Controller
          </h2>
          <Button size="sm" variant="outline" onClick={() => setAddLineOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {linesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-2xl border border-border/70 bg-muted/70" />
            ))}
          </div>
        ) : lines.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-linear-to-br from-background to-muted/20">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">No irrigation lines yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first line to start automating watering.
                </p>
              </div>
              <Button size="sm" onClick={() => setAddLineOpen(true)} className="mt-2 gap-2 rounded-full">
                <Plus className="h-4 w-4" /> Add Line
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {lines.map((line) => (
              <IrrigationLineCard
                key={line._id}
                line={line}
                onToggle={(isActive: boolean) => void handleToggleLine(line._id, isActive)}
                onClick={() => openEditDialog(line)}
                onEdit={() => openEditDialog(line)}
                onDelete={() => handleDeleteLine(line._id, line.name)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. upcoming schedule */}
      <section data-animate="section" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FlaskConical className="h-5 w-5" />
            Irrigation Schedule
          </h2>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setScheduleRulesOpen(true)}>
            <Settings2 className="h-4 w-4" />
            Schedule rules
          </Button>
        </div>
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-1">
                Skip: {scheduleRules.blockedWeekdays.length === 0 ? 'None' : scheduleRules.blockedWeekdays.length}
              </span>
              <span className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-1">
                Hours: {String(scheduleRules.preferredStartHour).padStart(2, '0')}:00 to {String(scheduleRules.preferredEndHour).padStart(2, '0')}:00
              </span>
              <span className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-1">
                {scheduleRules.lineSpacingMinutes < 0
                  ? `Overlap: ${Math.abs(scheduleRules.lineSpacingMinutes)} min`
                  : scheduleRules.lineSpacingMinutes > 0
                    ? `Gap: ${scheduleRules.lineSpacingMinutes} min`
                    : 'Back-to-back'}
              </span>
            </div>
            {scheduleDays.length === 0 ? (
              <div className="text-muted-foreground px-2 py-4 text-sm">No schedule matches the active lines and current rules.</div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1">
                  <button
                    type="button"
                    aria-label="Scroll schedule left"
                    onClick={() => scrollScheduleTabs('left')}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div ref={scheduleTabsRef} className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
                    {scheduleDays.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        aria-pressed={activeScheduleDay?.key === day.key}
                        onClick={() => setSelectedScheduleDay(day.key)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${activeScheduleDay?.key === day.key ? 'bg-background text-foreground shadow-sm ring-1 ring-border/80' : 'text-muted-foreground hover:bg-background/65 hover:text-foreground'}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    aria-label="Scroll schedule right"
                    onClick={() => scrollScheduleTabs('right')}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="divide-border divide-y overflow-hidden rounded-xl border border-border/70 bg-background/50">
                  {activeScheduleDay?.entries.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                      <div className="bg-muted flex w-16 shrink-0 flex-col items-center justify-center rounded-xl py-2 text-center">
                        <span className="text-base font-bold">{item.time}</span>
                        <span className="text-muted-foreground text-[10px] uppercase tracking-[0.08em]">{item.day}</span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="bg-primary h-2 w-2 rounded-full" />
                          {item.lineName}
                        </span>
                        <div className="text-muted-foreground flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Wind className="h-3.5 w-3.5" />
                            {item.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3.5 w-3.5" />
                            {item.liters}L
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <AnalyticsSection
        lines={lines}
        usagePeriod={usagePeriod}
        onUsagePeriodChange={setUsagePeriod}
        yearlyWaterUsageLiters={yearlyWaterUsageLiters}
        totalPlants={totalPlants}
        totalHoseLengthMeters={totalHoseLengthMeters}
        totalGardenAreaM2={totalGardenAreaM2}
      />

      <AddLineDialog
        open={addLineOpen}
        onOpenChange={setAddLineOpen}
        onConfirm={handleAddLine}
        isLoading={createState.isLoading}
      />

      <AddLineDialog
        open={editingLine !== null}
        onOpenChange={(open) => { if (!open) setEditingLine(null); }}
        onConfirm={handleEditLine}
        isLoading={createState.isLoading}
        initialName={editingLine?.name}
        initialConfig={editingLine?.config}
      />

      <ScheduleRulesDialog
        open={scheduleRulesOpen}
        onOpenChange={setScheduleRulesOpen}
        value={scheduleRules}
        onApply={setScheduleRules}
      />

      <Dialog open={linePendingDelete !== null} onOpenChange={(open) => { if (!open) setLinePendingDelete(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete irrigation line?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The line{' '}
              <span className="text-foreground font-medium">{linePendingDelete?.name}</span>
              {' '}will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinePendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDeleteLine()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
