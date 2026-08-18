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
              {resolvedSprinklerConfigs.map((sprinklerConfig, index) => (
                <div key={`sprinkler-${index}`} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Sprinkler #{index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        setConfig((prev) => {
                          const currentConfigs = toSprinklerConfigs(prev, DEFAULT_SPRINKLER_CONFIG);
                          if (currentConfigs.length <= 1) return prev;

                          const nextConfigs = currentConfigs.filter((_, rowIndex) => rowIndex !== index);
                          return {
                            ...prev,
                            sprinklerConfigs: nextConfigs,
                          };
                        });
                      }}
                      disabled={resolvedSprinklerConfigs.length <= 1}
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
                      <Select
                        id={`sprinkler-distance-${index}`}
                        value={sprinklerConfig.distance}
                        onChange={(e) => {
                          const distance = Number(e.target.value);
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
                      >
                        {distanceOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor={`sprinkler-flow-${index}`}>
                        <FieldLabel icon={<Droplets className="size-3.5" />}>Flow (L/h)</FieldLabel>
                      </label>
                      <Select
                        id={`sprinkler-flow-${index}`}
                        value={sprinklerConfig.flowRate}
                        onChange={(e) => {
                          const flowRate = Number(e.target.value);
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
                      >
                        {flowOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
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
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    sprinklerConfigs: [...toSprinklerConfigs(prev, DEFAULT_SPRINKLER_CONFIG), { ...DEFAULT_SPRINKLER_CONFIG }],
                  }));
                }}
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