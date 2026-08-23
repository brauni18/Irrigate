import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Droplets, Plus, Ruler, Settings2, Trash2 } from 'lucide-react';
import { DEFAULT_SPRINKLER_CONFIG } from '@/consts/AddLineDialog.consts';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Select } from '@/shadcn/components/ui/select';
import { FieldLabel } from '../FieldLabel';
import { useAddLineDialogContext } from '../context';
import { toSprinklerConfigs } from '../utils';

export function TechniqueSettingsSection() {
  const {
    activeTechniqueKey,
    techniqueMenuOpen,
    setTechniqueMenuOpen,
    config,
    distanceOptions,
    flowOptions,
    resolvedSprinklerConfigs,
    setConfig,
    update,
  } = useAddLineDialogContext();
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [newRowIndex, setNewRowIndex] = useState<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (removeTimerRef.current !== null) {
        window.clearTimeout(removeTimerRef.current);
      }
    };
  }, []);

  function handleRemoveSprinkler(index: number) {
    if (resolvedSprinklerConfigs.length <= 1 || removingIndex !== null) return;

    setRemovingIndex(index);
    removeTimerRef.current = window.setTimeout(() => {
      setConfig((prev) => {
        const currentConfigs = toSprinklerConfigs(prev, DEFAULT_SPRINKLER_CONFIG);
        if (currentConfigs.length <= 1) return prev;

        const nextConfigs = currentConfigs.filter((_, rowIndex) => rowIndex !== index);
        return {
          ...prev,
          sprinklerConfigs: nextConfigs,
        };
      });
      setRemovingIndex(null);
      removeTimerRef.current = null;
    }, 220);
  }

  function handleAddSprinkler() {
    setConfig((prev) => {
      const nextConfigs = [...toSprinklerConfigs(prev, DEFAULT_SPRINKLER_CONFIG), { ...DEFAULT_SPRINKLER_CONFIG }];
      setNewRowIndex(nextConfigs.length - 1);
      return {
        ...prev,
        sprinklerConfigs: nextConfigs,
      };
    });
  }

  useEffect(() => {
    if (newRowIndex === null) return;

    const timerId = window.setTimeout(() => {
      setNewRowIndex(null);
    }, 320);

    return () => window.clearTimeout(timerId);
  }, [newRowIndex]);

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-background/70 p-3">
      {activeTechniqueKey === 'sprinkler' ? (
        <>
          <button
            type="button"
            aria-expanded={techniqueMenuOpen}
            aria-controls="technique-settings-panel"
            onClick={() => setTechniqueMenuOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Settings2 className="size-4 text-muted-foreground" />
              Sprinkler Settings
            </span>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${techniqueMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {techniqueMenuOpen ? (
            <div id="technique-settings-panel" className="grid gap-3">
              <AnimatePresence initial={false}>
                {resolvedSprinklerConfigs.map((sprinklerConfig, index) => (
                  <motion.div
                    key={`sprinkler-${index}`}
                    layout
                    initial={index === newRowIndex ? { opacity: 0, y: 16, scale: 0.985 } : false}
                    animate={
                      removingIndex === index
                        ? { opacity: 0, y: -10, scale: 0.98, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }
                        : { opacity: 1, y: 0, scale: 1, height: 'auto', marginBottom: 0, paddingTop: 12, paddingBottom: 12 }
                    }
                    transition={{ duration: removingIndex === index ? 0.2 : 0.24, ease: 'easeOut' }}
                    className="overflow-hidden rounded-xl border border-border/70 bg-muted/20 px-3"
                  >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Sprinkler #{index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveSprinkler(index)}
                      disabled={resolvedSprinklerConfigs.length <= 1 || removingIndex !== null}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor={`sprinkler-distance-${index}`}>
                        <FieldLabel icon={<Ruler className="size-3.5" />}>Radius (m)</FieldLabel>
                      </label>
                       <Input
                         id={`sprinkler-distance-${index}`}
                         type="number"
                         min={0.1}
                         step="0.1"
                         value={sprinklerConfig.distance}
                         onChange={(e) => {
                           const distance = Math.max(0.1, Number(e.target.value));
                          setConfig((prev) => {
                            const currentConfigs = toSprinklerConfigs(prev, DEFAULT_SPRINKLER_CONFIG);
                            const nextConfigs = currentConfigs.map((item, rowIndex) =>
                              rowIndex === index ? { ...item, distance } : item,
                            );

                            return {
                              ...prev,
                              sprinklerConfigs: nextConfigs,
                            };
                          });
                        }}
                        className="h-11 rounded-xl border-border bg-background/80"
                       />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor={`sprinkler-flow-${index}`}>
                        <FieldLabel icon={<Droplets className="size-3.5" />}>Flow (L/min)</FieldLabel>
                      </label>
                       <Input
                         id={`sprinkler-flow-${index}`}
                         type="number"
                         min={0.1}
                         step="0.01"
                         value={sprinklerConfig.flowRate}
                         onChange={(e) => {
                           const flowRate = Math.max(0.1, Number(e.target.value));
                          setConfig((prev) => {
                            const currentConfigs = toSprinklerConfigs(prev, DEFAULT_SPRINKLER_CONFIG);
                            const nextConfigs = currentConfigs.map((item, rowIndex) =>
                              rowIndex === index ? { ...item, flowRate } : item,
                            );

                            return {
                              ...prev,
                              sprinklerConfigs: nextConfigs,
                            };
                          });
                        }}
                        className="h-11 rounded-xl border-border bg-background/80"
                       />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor={`sprinkler-count-${index}`}>
                        <FieldLabel icon={<Droplets className="size-3.5" />}>Count</FieldLabel>
                      </label>
                      <Input
                        id={`sprinkler-count-${index}`}
                        type="number"
                        min={1}
                        value={sprinklerConfig.sprinklerCount}
                        onChange={(e) => {
                          const sprinklerCount = Math.max(1, Number(e.target.value));
                          setConfig((prev) => {
                            const currentConfigs = toSprinklerConfigs(prev, DEFAULT_SPRINKLER_CONFIG);
                            const nextConfigs = currentConfigs.map((item, rowIndex) =>
                              rowIndex === index ? { ...item, sprinklerCount } : item,
                            );

                            return {
                              ...prev,
                              sprinklerConfigs: nextConfigs,
                            };
                          });
                        }}
                        className="h-11 rounded-xl border-border bg-background/80"
                      />
                    </div>
                  </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Button
                type="button"
                variant="outline"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-background px-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-accent/40 hover:shadow-sm"
                onClick={handleAddSprinkler}
                disabled={removingIndex !== null}
              >
                <Plus className="mr-2 size-4" />
                Add another sprinkler
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div id="technique-settings-panel" className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="drip-distance">
                <FieldLabel icon={<Ruler className="size-3.5" />}>
                  Drip Distance (m)
                </FieldLabel>
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
                <FieldLabel icon={<Droplets className="size-3.5" />}>
                  Drip Flow (L/h)
                </FieldLabel>
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
        </div>
      )}
    </div>
  );
}