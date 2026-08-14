import { useEffect, useMemo, useState } from 'react';
import { Loader2, Leaf, Settings2, MapPin, CalendarDays, Maximize2, Ruler, Droplets } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { Input } from '@/shadcn/components/ui/input';
import { Select } from '@/shadcn/components/ui/select';
import {
  ADD_LINE_DIALOG_TITLE,
  ADD_LINE_PLACEHOLDER,
  ADD_LINE_REQUIRED_NAME_MESSAGE,
  PLANT_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  DRIP_DISTANCE_OPTIONS,
  DRIP_FLOW_OPTIONS,
} from '@/consts/AddLineDialog.consts';
import {
  useCalculateIrrigationMutation,
  useGetIrrigationCatalogQuery,
} from '@/store/apis/irrigationLines.api';
import type { IrrigationCalculation, IrrigationLineConfig } from '@/types/irrigationLine.type';
import type { AddLineDialogProps } from '@/types/GardenPage.types';

const DEFAULT_CONFIG: IrrigationLineConfig = {
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

const labelClass = 'flex items-center gap-1.5 text-sm font-medium';

function formatDuration(hours: number, minutes: number, seconds: number) {
  const padded = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const compactParts: string[] = [];

  if (hours > 0) compactParts.push(`${hours} hr`);
  if (minutes > 0) compactParts.push(`${minutes} min`);
  if (seconds > 0 || compactParts.length === 0) compactParts.push(`${seconds} sec`);

  return { padded, compact: compactParts.join(' ') };
}

function findPlantOption(
  plantKey: string,
  catalogPlants?: Array<{ key: string; measurementMode: 'area' | 'count'; areaPerUnitM2?: number; recommendedIntervalDays?: number }>,
) {
  return catalogPlants?.find((plant) => plant.key === plantKey)
    ?? PLANT_TYPE_OPTIONS.find((option) => option.value === plantKey);
}

function getResolvedTreeCount(config: IrrigationLineConfig, areaPerUnitM2: number) {
  if (Number.isFinite(config.treeCount) && (config.treeCount ?? 0) > 0) {
    return Math.max(1, Math.round(config.treeCount ?? 0));
  }

  if (Number.isFinite(config.areaSizeM2) && config.areaSizeM2 > 0) {
    return Math.max(1, Math.round(config.areaSizeM2 / areaPerUnitM2));
  }

  return 1;
}

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className={labelClass}>
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </span>
  );
}

export function AddLineDialog({ open, onOpenChange, onConfirm, isLoading, initialName, initialConfig }: AddLineDialogProps) {
  const isEditMode = initialName !== undefined;

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [config, setConfig] = useState<IrrigationLineConfig>(DEFAULT_CONFIG);
  const [calculation, setCalculation] = useState<IrrigationCalculation | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const { data: catalog } = useGetIrrigationCatalogQuery();
  const [calculateIrrigation, { isLoading: isCalculating }] = useCalculateIrrigationMutation();

  const plantOptions = useMemo(
    () =>
      catalog?.plants.map((plant) => ({
        value: plant.key,
        label: `${plant.emoji} ${plant.name}`,
      })) ?? PLANT_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    [catalog?.plants],
  );

  const locationOptions = useMemo(
    () =>
      catalog?.locations.map((location) => ({
        value: location.key,
        label: location.name,
      })) ?? LOCATION_OPTIONS,
    [catalog?.locations],
  );

  const dripTechnique = catalog?.techniques.find((technique) => technique.key === 'drip');

  const distanceOptions = useMemo(
    () =>
      dripTechnique?.distanceOptions.map((distance) => ({
        value: String(distance),
        label: `${distance.toFixed(1)} m`,
      })) ?? DRIP_DISTANCE_OPTIONS,
    [dripTechnique?.distanceOptions],
  );

  const flowOptions = useMemo(
    () =>
      dripTechnique?.flowOptions.map((flowRate) => ({
        value: String(flowRate),
        label: `${flowRate.toFixed(1)} L/h`,
      })) ?? DRIP_FLOW_OPTIONS,
    [dripTechnique?.flowOptions],
  );

  const selectedPlant = useMemo(
    () => findPlantOption(config.plantKey, catalog?.plants),
    [catalog?.plants, config.plantKey],
  );

  const usesTreeCount = selectedPlant?.measurementMode === 'count';
  const areaPerTreeM2 = selectedPlant?.areaPerUnitM2 ?? 4;
  const suggestedIntervalDays = selectedPlant?.recommendedIntervalDays ?? 7;

  const resolvedTreeCount = useMemo(
    () => (usesTreeCount ? getResolvedTreeCount(config, areaPerTreeM2) : null),
    [areaPerTreeM2, config, usesTreeCount],
  );

  const preparedConfig = useMemo<IrrigationLineConfig>(() => {
    if (!usesTreeCount) {
      return { ...config, treeCount: undefined };
    }

    const treeCount = resolvedTreeCount ?? 1;

    return {
      ...config,
      treeCount,
      areaSizeM2: treeCount * areaPerTreeM2,
    };
  }, [areaPerTreeM2, config, resolvedTreeCount, usesTreeCount]);

  const formattedDuration = useMemo(() => {
    if (!calculation) return null;
    return formatDuration(calculation.duration.hours, calculation.duration.minutes, calculation.duration.seconds);
  }, [calculation]);

  function update<K extends keyof IrrigationLineConfig>(key: K, value: IrrigationLineConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  // Sync pre-filled values when dialog opens in edit mode
  useEffect(() => {
    if (open) {
      setName(initialName ?? '');
      setConfig({ ...DEFAULT_CONFIG, ...initialConfig });
      setNameError('');
    }
  }, [open, initialName, initialConfig]);

  // Ensure defaults always match a valid option set.
  useEffect(() => {
    if (!open) return;

    if (!plantOptions.some((option) => option.value === config.plantKey)) {
      update('plantKey', plantOptions[0]?.value ?? DEFAULT_CONFIG.plantKey);
      return;
    }

    if (!locationOptions.some((option) => option.value === config.locationKey)) {
      update('locationKey', locationOptions[0]?.value ?? DEFAULT_CONFIG.locationKey);
      return;
    }
  }, [open, plantOptions, locationOptions, config.plantKey, config.locationKey]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await calculateIrrigation({ config: preparedConfig }).unwrap();
          setCalculation(response.calculation);
          setCalculationError(null);
        } catch {
          setCalculation(null);
          setCalculationError('Unable to calculate with current values');
        }
      })();
    }, 250);

    return () => clearTimeout(timer);
  }, [open, preparedConfig, calculateIrrigation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(ADD_LINE_REQUIRED_NAME_MESSAGE);
      return;
    }
    setNameError('');
    await onConfirm(name.trim(), preparedConfig);
    setName('');
  }

  function handleOpenChange(isOpen: boolean) {
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border border-border/80 bg-card p-0 shadow-xl sm:max-w-[820px]">
        <div className="border-b border-border/70 bg-gradient-to-r from-primary/6 via-transparent to-accent/10 px-6 py-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {isEditMode ? 'Edit Irrigation Line' : ADD_LINE_DIALOG_TITLE}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 px-6 pb-6 pt-5">
          <div className="space-y-2">
            <label htmlFor="line-name" className="text-sm font-medium text-foreground">
              Line name
            </label>
            <Input
              id="line-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ADD_LINE_PLACEHOLDER}
              className="h-11 rounded-xl border-border bg-background/80 text-sm shadow-sm focus-visible:ring-primary/20"
              autoFocus
            />
            {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-border/80 bg-muted/25 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Settings2 className="size-4" />
              Configuration
            </h3>

            {/* Plant Type */}
            <div className="space-y-1.5">
              <label htmlFor="plant-type">
                <FieldLabel icon={<Leaf className="size-3.5" />}>Plant Type</FieldLabel>
              </label>
              <Select
                id="plant-type"
                value={config.plantKey}
                onChange={(e) => {
                  const nextPlantKey = e.target.value;
                  const nextPlant = findPlantOption(nextPlantKey, catalog?.plants);

                  setConfig((prev) => {
                    if (nextPlant?.measurementMode !== 'count') {
                      return { ...prev, plantKey: nextPlantKey, treeCount: undefined };
                    }

                    const nextAreaPerTreeM2 = nextPlant.areaPerUnitM2 ?? 4;
                    const treeCount = getResolvedTreeCount(prev, nextAreaPerTreeM2);

                    return {
                      ...prev,
                      plantKey: nextPlantKey,
                      treeCount,
                      areaSizeM2: treeCount * nextAreaPerTreeM2,
                    };
                  });
                }}
                className="h-11 rounded-xl border-border bg-background/80"
              >
                {plantOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Maintenance Level */}
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

            {/* Location */}
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

            {/* Interval & Area Size */}
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

            {/* Drip Distance & Drip Flow */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="drip-distance">
                  <FieldLabel icon={<Ruler className="size-3.5" />}>Drip Distance (m)</FieldLabel>
                </label>
                <Select
                  id="drip-distance"
                  value={config.techniqueConfig.distance}
                  onChange={(e) =>
                    update('techniqueConfig', { ...config.techniqueConfig, distance: Number(e.target.value) })
                  }
                  className="h-11 rounded-xl border-border bg-background/80"
                >
                  {distanceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="drip-flow">
                  <FieldLabel icon={<Droplets className="size-3.5" />}>Drip Flow (L/h)</FieldLabel>
                </label>
                <Select
                  id="drip-flow"
                  value={config.techniqueConfig.flowRate}
                  onChange={(e) =>
                    update('techniqueConfig', { ...config.techniqueConfig, flowRate: Number(e.target.value) })
                  }
                  className="h-11 rounded-xl border-border bg-background/80"
                >
                  {flowOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-4 text-sm shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Calculation Preview</span>
                {isCalculating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
              </div>

              {calculation ? (
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:text-sm">
                    {usesTreeCount ? (
                      <p>
                        <span className="font-medium text-foreground">Tree Count:</span>{' '}
                        <span className="tabular-nums">
                          {resolvedTreeCount?.toFixed(0)}
                        </span>
                      </p>
                    ) : null}
                    <p>
                      <span className="font-medium text-foreground">Water Portion:</span>{' '}
                      <span className="tabular-nums">
                        {(calculation.waterPortion * 1000).toFixed(0)} liters
                      </span>{' '}
                      ({calculation.waterPortion.toFixed(2)} cubic meters)
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Dripper / Plants Count:</span>{' '}
                      <span className="tabular-nums">
                        {calculation.dripPresCount.toFixed(0)}
                      </span>
                    </p>
                    {usesTreeCount ? (
                      <p>
                        <span className="font-medium text-foreground">Effective Area:</span>{' '}
                        <span className="tabular-nums">
                          {preparedConfig.areaSizeM2.toFixed(1)} m²
                        </span>
                      </p>
                    ) : null}
                    <p>
                      <span className="font-medium text-foreground">Line Flow:</span>{' '}
                      <span className="tabular-nums">
                        {(calculation.drippersFlow * 1000).toFixed(0)} liters per hour
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Line Length:</span>{' '}
                      <span className="tabular-nums">
                        {(calculation.dripPresCount * config.techniqueConfig.distance).toFixed(1)} meters
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/70 px-3 py-2 shadow-inner">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Duration</p>
                    <p className="text-base font-semibold tabular-nums sm:text-lg">
                      {formattedDuration?.padded}
                      <span className="ml-2 text-xs font-normal text-muted-foreground sm:text-sm">({formattedDuration?.compact})</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {calculationError ?? 'Fill in values to preview the irrigation calculation'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-1 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => handleOpenChange(false)}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}

