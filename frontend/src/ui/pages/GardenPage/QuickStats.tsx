import { Droplets, FlaskConical, Thermometer, Wind } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';

type QuickStatsProps = {
  yearlyWaterUsageLiters: number;
  totalPlants: number;
  totalHoseLengthMeters: number;
  totalGardenAreaM2: number;
};

export function QuickStats({
  yearlyWaterUsageLiters,
  totalPlants,
  totalHoseLengthMeters,
  totalGardenAreaM2,
}: QuickStatsProps) {
  const stats = [
    {
      icon: Droplets,
      label: 'Yearly Water Usage',
      value: `${Math.round(yearlyWaterUsageLiters).toLocaleString()}L`,
      color: 'text-blue-400',
    },
    {
      icon: FlaskConical,
      label: 'Number of Plants',
      value: Math.round(totalPlants).toLocaleString(),
      color: 'text-emerald-400',
    },
    {
      icon: Wind,
      label: 'Pipe/Hose Length',
      value: `${totalHoseLengthMeters.toFixed(1)}m`,
      color: 'text-sky-400',
    },
    {
      icon: Thermometer,
      label: 'Garden Area',
      value: `${totalGardenAreaM2.toFixed(1)}m²`,
      color: 'text-orange-400',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">Garden Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-muted/50 flex items-center gap-3 rounded-xl p-4">
              <Icon className={`h-6 w-6 shrink-0 ${color}`} />
              <div>
                <p className="text-lg font-bold leading-tight">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
