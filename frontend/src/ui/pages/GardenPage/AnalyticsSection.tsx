import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Leaf, Thermometer } from 'lucide-react';

import { LINE_PERFORMANCE_COLORS } from '@/consts/GardenPage.consts';
import type { ApiIrrigationLine } from '@/types/irrigationLine.type';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';

import { QuickStats } from './QuickStats';
import { WaterUsageChart, type UsagePeriod } from './WaterUsageChart';

type AnalyticsSectionProps = {
  lines: ApiIrrigationLine[];
  usagePeriod: UsagePeriod;
  onUsagePeriodChange: (period: UsagePeriod) => void;
  yearlyWaterUsageLiters: number;
  totalPlants: number;
  totalHoseLengthMeters: number;
  totalGardenAreaM2: number;
};

function getLinePlantCount(line: { config?: ApiIrrigationLine['config']; calculation?: { dripPresCount: number } }) {
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

export function AnalyticsSection({
  lines,
  usagePeriod,
  onUsagePeriodChange,
  yearlyWaterUsageLiters,
  totalPlants,
  totalHoseLengthMeters,
  totalGardenAreaM2,
}: AnalyticsSectionProps) {
  const linePerformanceData = lines
    .filter((line) => line.config)
    .map((line, index) => {
      const plantCount = getLinePlantCount(line);

      return {
        name: line.name,
        value: plantCount,
        color: LINE_PERFORMANCE_COLORS[index % LINE_PERFORMANCE_COLORS.length],
      };
    });

  return (
    <section data-animate="section" className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Thermometer className="h-5 w-5" />
        Analytics
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="h-4 w-4" /> Plants per Line
            </CardTitle>
          </CardHeader>
          <CardContent>
            {linePerformanceData.length === 0 ? (
              <div className="text-muted-foreground flex h-50 items-center justify-center text-sm">
                No lines to display
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={linePerformanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {linePerformanceData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [`${v} plants`, name]}
                      contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                  {linePerformanceData.map((entry) => (
                    <span key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                      {entry.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <WaterUsageChart lines={lines} usagePeriod={usagePeriod} onChange={onUsagePeriodChange} />

        <div className="lg:col-span-2">
          <QuickStats
            yearlyWaterUsageLiters={yearlyWaterUsageLiters}
            totalPlants={totalPlants}
            totalHoseLengthMeters={totalHoseLengthMeters}
            totalGardenAreaM2={totalGardenAreaM2}
          />
        </div>
      </div>
    </section>
  );
}
