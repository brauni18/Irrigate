import { useEffect, useMemo, useRef, useState } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import {
  ADD_LINE_DIALOG_TITLE,
  ADD_LINE_REQUIRED_NAME_MESSAGE,
  DEFAULT_ADD_LINE_CONFIG,
  DEFAULT_SPRINKLER_CONFIG,
  DRIP_DISTANCE_OPTIONS,
  DRIP_FLOW_OPTIONS,
  LOCATION_OPTIONS,
  PLANT_TYPE_OPTIONS,
  SPRINKLER_DISTANCE_OPTIONS,
  SPRINKLER_FLOW_OPTIONS,
} from '@/consts/AddLineDialog.consts';
import {
  useCalculateIrrigationMutation,
  useGetIrrigationCatalogQuery,
} from '@/store/apis/irrigationLines.api';
import type { AddLineDialogProps } from '@/types/GardenPage.types';
import type { IrrigationCalculation, IrrigationLineConfig } from '@/types/irrigationLine.type';
import { AddLineDialogProvider } from './context';
import { aggregateSprinklerConfigs, findPlantOption, formatDuration, getResolvedTreeCount, toEditableSprinklerConfig, toSprinklerConfigs } from './utils';
import { CalculationPreviewSection } from './sections/CalculationPreviewSection';
import { ConfigurationSection } from './sections/ConfigurationSection';
import { DialogActionsSection } from './sections/DialogActionsSection';

type CalculateErrorPayload = {
  message?: string;
  errors?: string[];
};

function getCalculationErrorMessage(error: unknown) {
  const fallback = 'Unable to calculate with current values';
  if (!error || typeof error !== 'object' || !('status' in error)) return fallback;

  const apiError = error as FetchBaseQueryError;
  if (!('data' in apiError)) return fallback;

  const payload = apiError.data as CalculateErrorPayload | undefined;
  if (!payload) return fallback;

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors.join(', ');
  }

  if (payload.message) {
    return payload.message;
  }

  return fallback;
}

export function AddLineDialog({ open, onOpenChange, onConfirm, isLoading, initialName, initialConfig }: AddLineDialogProps) {
  const isEditMode = initialName !== undefined;

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [techniqueMenuOpen, setTechniqueMenuOpen] = useState(false);
  const [config, setConfig] = useState<IrrigationLineConfig>(DEFAULT_ADD_LINE_CONFIG);
  const [calculation, setCalculation] = useState<IrrigationCalculation | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [configurationMode, setConfigurationMode] = useState<'modern' | 'legacy'>('modern');
  const [legacyConfig, setLegacyConfig] = useState({
    selectedWeekdays: ['Mon', 'Wed', 'Fri'],
    durationMinutes: 20,
    areaSizeM2: null as number | null,
  });

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

  const activeTechniqueKey: 'drip' | 'sprinkler' = config.plantKey === 'grass' ? 'sprinkler' : 'drip';
  const activeTechnique = catalog?.techniques.find((technique) => technique.key === activeTechniqueKey);

  const distanceOptions = useMemo(
    () =>
      activeTechnique?.distanceOptions.map((distance) => ({
        value: String(distance),
        label: `${distance.toFixed(1)} m`,
      })) ?? (activeTechniqueKey === 'sprinkler' ? SPRINKLER_DISTANCE_OPTIONS : DRIP_DISTANCE_OPTIONS),
    [activeTechnique?.distanceOptions, activeTechniqueKey],
  );

  const flowOptions = useMemo(
    () =>
      activeTechnique?.flowOptions.map((flowRate) => ({
        value: String(flowRate),
        label: `${flowRate.toFixed(1)} L/h`,
      })) ?? (activeTechniqueKey === 'sprinkler' ? SPRINKLER_FLOW_OPTIONS : DRIP_FLOW_OPTIONS),
    [activeTechnique?.flowOptions, activeTechniqueKey],
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

  const resolveSprinklerConfigRows = (lineConfig: IrrigationLineConfig) => {
    const rows = toSprinklerConfigs(lineConfig, DEFAULT_SPRINKLER_CONFIG);
    const isStaleDripConfig = lineConfig.techniqueKey !== 'sprinkler' && activeTechniqueKey === 'sprinkler';

    return rows.map((row) => ({
      ...row,
      distance: isStaleDripConfig ? DEFAULT_SPRINKLER_CONFIG.distance : row.distance,
      flowRate: isStaleDripConfig ? DEFAULT_SPRINKLER_CONFIG.flowRate : row.flowRate,
    }));
  };

  const resolvedSprinklerConfigs = useMemo(
    () => (activeTechniqueKey === 'sprinkler' ? resolveSprinklerConfigRows(config) : []),
    [activeTechniqueKey, config],
  );

  const preparedConfig = useMemo<IrrigationLineConfig>(() => {
    if (!usesTreeCount && activeTechniqueKey !== 'sprinkler') {
      return {
        ...config,
        techniqueKey: 'drip',
        treeCount: undefined,
        sprinklerCount: undefined,
        sprinklerConfigs: undefined,
      };
    }

    if (activeTechniqueKey === 'sprinkler') {
      const sprinklerConfigs = resolvedSprinklerConfigs;
      const aggregate = aggregateSprinklerConfigs(sprinklerConfigs, DEFAULT_SPRINKLER_CONFIG.distance);

      return {
        ...config,
        techniqueKey: 'sprinkler',
        treeCount: undefined,
        sprinklerConfigs,
        sprinklerCount: Math.max(1, aggregate.totalSprinklerCount),
        techniqueConfig: {
          distance: aggregate.averageDistance,
          flowRate: aggregate.totalFlowRate / Math.max(1, aggregate.totalSprinklerCount),
        },
      };
    }

    const treeCount = resolvedTreeCount ?? 1;

    return {
      ...config,
      techniqueKey: 'drip',
      treeCount,
      sprinklerCount: undefined,
      sprinklerConfigs: undefined,
      areaSizeM2: treeCount * areaPerTreeM2,
    };
  }, [activeTechniqueKey, areaPerTreeM2, config, resolvedSprinklerConfigs, resolvedTreeCount, usesTreeCount]);

  const formattedDuration = useMemo(() => {
    if (!calculation) return null;
    return formatDuration(calculation.duration.hours, calculation.duration.minutes, calculation.duration.seconds);
  }, [calculation]);

  function update<K extends keyof IrrigationLineConfig>(key: K, value: IrrigationLineConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (!open) return;

    setConfig((prev) => {
      const nextTechniqueKey = prev.plantKey === 'grass' ? 'sprinkler' : 'drip';
      const fallbackDistance = nextTechniqueKey === 'sprinkler' ? 6 : 0.5;
      const fallbackFlowRate = nextTechniqueKey === 'sprinkler' ? 0.5 : 2.3;

      return {
        ...prev,
        techniqueKey: nextTechniqueKey,
        techniqueConfig: {
          distance: prev.techniqueKey === nextTechniqueKey && Number.isFinite(prev.techniqueConfig.distance)
            ? prev.techniqueConfig.distance
            : fallbackDistance,
          flowRate: prev.techniqueKey === nextTechniqueKey && Number.isFinite(prev.techniqueConfig.flowRate)
            ? prev.techniqueConfig.flowRate
            : fallbackFlowRate,
        },
        sprinklerCount: nextTechniqueKey === 'sprinkler' ? (prev.sprinklerCount ?? 1) : undefined,
        sprinklerConfigs: nextTechniqueKey === 'sprinkler' ? resolveSprinklerConfigRows(prev) : undefined,
      };
    });
  }, [open, config.plantKey]);

  useEffect(() => {
    if (open) {
      setName(initialName ?? '');
      setConfig(toEditableSprinklerConfig({ ...DEFAULT_ADD_LINE_CONFIG, ...initialConfig }));
      setNameError('');
      setIsEditingName(false);
      setTechniqueMenuOpen(false);
      setConfigurationMode(initialConfig?.calculationMode ?? 'modern');
      setLegacyConfig({
        selectedWeekdays: initialConfig?.legacy?.selectedWeekdays ?? ['Mon', 'Wed', 'Fri'],
        durationMinutes: initialConfig?.legacy?.durationMinutes ?? 20,
        areaSizeM2: initialConfig?.legacy?.areaSizeM2 ?? null,
      });
    }
  }, [open, initialName, initialConfig]);

  useEffect(() => {
    setConfig((current) => {
      const nextTechniqueKey = configurationMode === 'legacy' ? 'drip' : current.techniqueKey;

      if (
        current.calculationMode === configurationMode
        && current.techniqueKey === nextTechniqueKey
      ) {
        return current;
      }

      return {
        ...current,
        calculationMode: configurationMode,
        techniqueKey: nextTechniqueKey,
        sprinklerCount: configurationMode === 'legacy' ? undefined : current.sprinklerCount,
        sprinklerConfigs: configurationMode === 'legacy' ? undefined : current.sprinklerConfigs,
      };
    });
  }, [configurationMode]);

  useEffect(() => {
    setConfig((current) => {
      const nextArea = legacyConfig.areaSizeM2;
      const shouldUpdateArea = current.calculationMode === 'legacy' && Number.isFinite(nextArea) && (nextArea ?? 0) > 0;

      return {
        ...current,
        legacy: {
          selectedWeekdays: legacyConfig.selectedWeekdays,
          durationMinutes: legacyConfig.durationMinutes,
          areaSizeM2: legacyConfig.areaSizeM2,
        },
        ...(shouldUpdateArea ? { areaSizeM2: nextArea ?? current.areaSizeM2 } : {}),
      };
    });
  }, [legacyConfig]);

  useEffect(() => {
    if (!isEditingName) return;

    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [isEditingName]);

  useEffect(() => {
    if (!open) return;

    if (!plantOptions.some((option) => option.value === config.plantKey)) {
      update('plantKey', plantOptions[0]?.value ?? DEFAULT_ADD_LINE_CONFIG.plantKey);
      return;
    }

    if (!locationOptions.some((option) => option.value === config.locationKey)) {
      update('locationKey', locationOptions[0]?.value ?? DEFAULT_ADD_LINE_CONFIG.locationKey);
      return;
    }
  }, [open, plantOptions, locationOptions, config.plantKey, config.locationKey]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await calculateIrrigation({
            config: preparedConfig,
            mode: configurationMode,
            legacy: configurationMode === 'legacy'
              ? {
                durationMinutes: legacyConfig.durationMinutes,
                areaSizeM2: legacyConfig.areaSizeM2,
                selectedWeekdays: legacyConfig.selectedWeekdays,
              }
              : undefined,
          }).unwrap();
          setCalculation(response.calculation);
          setCalculationError(null);
        } catch (error) {
          setCalculation(null);
          setCalculationError(getCalculationErrorMessage(error));
        }
      })();
    }, 250);

    return () => clearTimeout(timer);
  }, [open, preparedConfig, calculateIrrigation, configurationMode, legacyConfig]);

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

  const dialogTitle = isEditMode ? (name.trim() || initialName?.trim() || 'Irrigation Line') : ADD_LINE_DIALOG_TITLE;

  const contextValue = useMemo(
    () => ({
      isEditMode,
      isLoading,
      name,
      nameError,
      onNameChange: setName,
      config,
      setConfig,
      update,
      plantOptions,
      locationOptions,
      distanceOptions,
      flowOptions,
      catalogPlants: catalog?.plants,
      usesTreeCount,
      areaPerTreeM2,
      suggestedIntervalDays,
      resolvedTreeCount,
      activeTechniqueKey,
      techniqueMenuOpen,
      setTechniqueMenuOpen,
      resolvedSprinklerConfigs,
      calculation,
      calculationError,
      isCalculating,
      preparedConfig,
      formattedDuration,
      configurationMode,
      setConfigurationMode,
      legacyConfig,
      setLegacyConfig,
      onCancel: () => handleOpenChange(false),
    }),
    [
      isEditMode,
      isLoading,
      name,
      nameError,
      config,
      plantOptions,
      locationOptions,
      distanceOptions,
      flowOptions,
      catalog?.plants,
      usesTreeCount,
      areaPerTreeM2,
      suggestedIntervalDays,
      resolvedTreeCount,
      activeTechniqueKey,
      techniqueMenuOpen,
      resolvedSprinklerConfigs,
      calculation,
      calculationError,
      isCalculating,
      preparedConfig,
      formattedDuration,
      configurationMode,
      legacyConfig,
    ],
  );

  return (
    <AddLineDialogProvider value={contextValue}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border border-border/80 bg-card p-0 shadow-xl sm:max-w-205">
          <div className="border-b border-border/70 bg-linear-to-r from-primary/6 via-transparent to-accent/10 px-6 py-5">
            <DialogHeader className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                {isEditMode && isEditingName ? (
                  <input
                    ref={nameInputRef}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setIsEditingName(false);
                      }

                      if (event.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-xl font-semibold tracking-tight text-foreground shadow-sm outline-none ring-0 focus:border-ring"
                    aria-label="Edit line name"
                  />
                ) : (
                  <DialogTitle
                    className="cursor-text text-xl font-semibold tracking-tight"
                    onDoubleClick={isEditMode ? () => setIsEditingName(true) : undefined}
                  >
                    {dialogTitle}
                  </DialogTitle>
                )}
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 px-6 pb-6 pt-5">
            <ConfigurationSection />
            <CalculationPreviewSection />
            <DialogActionsSection />
          </form>
        </DialogContent>
      </Dialog>
    </AddLineDialogProvider>
  );
}