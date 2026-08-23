import { Leaf } from 'lucide-react';
import { DEFAULT_SPRINKLER_CONFIG } from '@/consts/AddLineDialog.consts';
import { Select } from '@/shadcn/components/ui/select';
import { FieldLabel } from '../FieldLabel';
import { useAddLineDialogContext } from '../context';
import { findPlantOption, getResolvedTreeCount, toSprinklerConfigs } from '../utils';

export function PlantTypeSection() {
  const { config, plantOptions, catalogPlants, setConfig } = useAddLineDialogContext();

  return (
    <div className="space-y-1.5">
      <label htmlFor="plant-type">
        <FieldLabel icon={<Leaf className="size-3.5" />}>Plant Type</FieldLabel>
      </label>
      <Select
        id="plant-type"
        value={config.plantKey}
        onChange={(e) => {
          const nextPlantKey = e.target.value;
          const nextPlant = findPlantOption(nextPlantKey, catalogPlants);

          setConfig((prev) => {
            const nextTechniqueKey = nextPlantKey === 'grass' ? 'sprinkler' : 'drip';
            const nextTechniqueConfig = {
              distance: nextTechniqueKey === 'sprinkler' ? 6 : 0.5,
              flowRate: nextTechniqueKey === 'sprinkler' ? 0.5 : 2.3,
            };
            const nextSprinklerConfigs = nextTechniqueKey === 'sprinkler'
              ? toSprinklerConfigs(
                {
                  ...prev,
                  techniqueKey: 'sprinkler',
                  techniqueConfig: nextTechniqueConfig,
                },
                DEFAULT_SPRINKLER_CONFIG,
              )
              : undefined;

            if (nextPlant?.measurementMode !== 'count') {
              return {
                ...prev,
                plantKey: nextPlantKey,
                techniqueKey: nextTechniqueKey,
                techniqueConfig: nextTechniqueConfig,
                sprinklerCount: nextTechniqueKey === 'sprinkler' ? (prev.sprinklerCount ?? 1) : undefined,
                sprinklerConfigs: nextSprinklerConfigs,
                treeCount: undefined,
              };
            }

            const nextAreaPerTreeM2 = nextPlant.areaPerUnitM2 ?? 4;
            const treeCount = getResolvedTreeCount(prev, nextAreaPerTreeM2);

            return {
              ...prev,
              plantKey: nextPlantKey,
              techniqueKey: nextTechniqueKey,
              techniqueConfig: nextTechniqueConfig,
              sprinklerCount: nextTechniqueKey === 'sprinkler' ? (prev.sprinklerCount ?? 1) : undefined,
              sprinklerConfigs: nextSprinklerConfigs,
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
  );
}