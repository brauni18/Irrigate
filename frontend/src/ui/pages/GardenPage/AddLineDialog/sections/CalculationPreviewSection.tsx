import { Loader2 } from 'lucide-react';
import { useAddLineDialogContext } from '../context';

export function CalculationPreviewSection() {
  const {
    calculation,
    calculationError,
    isCalculating,
    usesTreeCount,
    resolvedTreeCount,
    preparedConfig,
    formattedDuration,
    activeTechniqueKey,
    config,
    configurationMode,
    legacyConfig,
  } = useAddLineDialogContext();

  const isLegacyMode = configurationMode === 'legacy';
  const legacyDurationHours = calculation?.timeInHours ?? legacyConfig.durationMinutes / 60;
  const legacyPerPlantLiters = config.techniqueConfig.flowRate * legacyDurationHours;
  const hasLegacyArea = Number.isFinite(legacyConfig.areaSizeM2) && (legacyConfig.areaSizeM2 ?? 0) > 0;
  const safeDistance = Math.max(0.1, config.techniqueConfig.distance || 0.1);
  const legacyDripperCount = calculation?.dripPresCount ?? (hasLegacyArea
    ? Math.max(1, Math.round((legacyConfig.areaSizeM2 ?? 0) / (safeDistance * safeDistance)))
    : 1);
  const legacyTotalWaterLiters = calculation ? calculation.waterPortion * 1000 : legacyPerPlantLiters * legacyDripperCount;

  return (
    <div className="rounded-2xl border border-primary/10 bg-linear-to-br from-primary/5 via-background to-emerald-500/5 p-4 text-sm shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Calculation Preview</span>
        {!isLegacyMode && isCalculating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      </div>

      {isLegacyMode && calculation ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:text-sm">
            <p>
              <span className="font-medium text-foreground">Water Portion / Plant:</span>{' '}
              <span className="tabular-nums">{legacyPerPlantLiters.toFixed(1)} liters</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Flow Rate:</span>{' '}
              <span className="tabular-nums">{config.techniqueConfig.flowRate.toFixed(1)} liters per hour</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Dripper Count:</span>{' '}
              <span className="tabular-nums">{legacyDripperCount.toFixed(0)}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Line Length:</span>{' '}
              <span className="tabular-nums">{(legacyDripperCount * safeDistance).toFixed(1)} meters</span>
            </p>
            {hasLegacyArea ? (
              <p>
                <span className="font-medium text-foreground">Area:</span>{' '}
                <span className="tabular-nums">{(legacyConfig.areaSizeM2 ?? 0).toFixed(1)} m²</span>
              </p>
            ) : (
              <p>
                <span className="font-medium text-foreground">Area:</span>{' '}
                <span className="tabular-nums">Not set</span>
              </p>
            )}
            <p>
              <span className="font-medium text-foreground">Total Water Portion:</span>{' '}
              <span className="tabular-nums">{legacyTotalWaterLiters.toFixed(1)} liters</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Line Flow:</span>{' '}
              <span className="tabular-nums">{(calculation.drippersFlow * 1000).toFixed(1)} liters per hour</span>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/70 px-3 py-2 shadow-inner">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Duration</p>
            <p className="text-base font-semibold tabular-nums sm:text-lg">
              {`${String(calculation.duration.hours).padStart(2, '0')}:${String(calculation.duration.minutes).padStart(2, '0')}:${String(calculation.duration.seconds).padStart(2, '0')}`}
              <span className="ml-2 text-xs font-normal text-muted-foreground sm:text-sm">
                ({calculation.duration.hours > 0 ? `${calculation.duration.hours} hr ` : ''}{calculation.duration.minutes} min {calculation.duration.seconds} sec)
              </span>
            </p>
          </div>
        </div>
      ) : isLegacyMode ? (
        <p className="text-xs text-muted-foreground sm:text-sm">
          {calculationError ?? 'Fill in values to preview the irrigation calculation'}
        </p>
      ) : calculation ? (
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
              <span className="font-medium text-foreground">
                {activeTechniqueKey === 'sprinkler' ? 'Sprinkler Count:' : 'Dripper / Plants Count:'}
              </span>{' '}
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
  );
}