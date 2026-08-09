import { Sprout, Droplets } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import { InfoCard } from '@/ui/components/InfoCard';

export function Home() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-muted-foreground mt-1">A simple card layout for gardens and irrigation areas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          title="Garden West"
          subtitle="North district"
          imageUrl="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80"
          imageAlt="Garden landscape"
          to={ROUTES.gardens}
          icon={Sprout}
          badge="Active"
        >
        </InfoCard>

        <InfoCard
          title="Roses Corner"
          subtitle="Central park"
          imageUrl="https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80"
          imageAlt="Rose garden"
          to={ROUTES.calculator}
          icon={Droplets}
          badge="Draft"
        >
        </InfoCard>
      </div>
    </div>
  );
}
