import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Droplets } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import type { ApiIrrigationLine } from '@/types/irrigationLine.type';

type UsagePeriod = 'weekly' | 'monthly' | 'yearly';

type WaterUsageChartProps = {
  lines: ApiIrrigationLine[];
  usagePeriod: UsagePeriod;
  onChange: (period: UsagePeriod) => void;
};

export function WaterUsageChart({ lines, usagePeriod, onChange }: WaterUsageChartProps) {
  const usagePeriodDays = usagePeriod === 'weekly' ? 7 : usagePeriod === 'monthly' ? 30 : 365;

  const waterUsageByLineData = lines
    .filter((line) => line.calculation && line.config)
    .map((line) => {
      const litersPerRun = (line.calculation?.waterPortion ?? 0) * 1000;
      const intervalDays = Math.max(1, Math.floor(line.config?.intervalDays ?? 1));
      const estimatedRuns = Math.max(1, Math.ceil(usagePeriodDays / intervalDays));

      return {
        lineName: line.name,
        liters: Number((litersPerRun * estimatedRuns).toFixed(1)),
      };
    });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Droplets className="h-4 w-4" /> Line Water Usage
        </CardTitle>
        <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1 text-xs shadow-sm">
          {([
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
          ] as const).map((period) => (
            <button
              key={period.value}
              type="button"
              aria-pressed={usagePeriod === period.value}
              onClick={() => onChange(period.value)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${usagePeriod === period.value ? 'bg-background text-foreground shadow-sm ring-1 ring-border/80' : 'text-muted-foreground hover:bg-background/65 hover:text-foreground'}`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {waterUsageByLineData.length === 0 ? (
          <div className="text-muted-foreground flex h-50 items-center justify-center text-sm">
            No line usage data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={waterUsageByLineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="lineName"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                interval={0}
                angle={-10}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}L`} />
              <Tooltip
                formatter={(v) => [`${v}L`, 'Water usage']}
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              />
              <Bar dataKey="liters" name="Water usage (L)" fill="#60a5fa" opacity={0.8} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export type { UsagePeriod };
