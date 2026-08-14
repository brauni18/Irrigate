import { useState } from 'react';
import { Sprout } from 'lucide-react';
import { VITE_API_URL } from '@/consts/consts';
import {
  useDeleteGardenMutation,
  useListGardensQuery,
  type ApiGarden,
} from '@/store/apis/gardens.api';
import { gardenPath } from '@/router/routes.consts';
import { GardenDialog } from '@/ui/components/GardenDialog';
import { InfoCard } from '@/ui/components/InfoCard';

export function Home() {
  const [selectedGarden, setSelectedGarden] = useState<ApiGarden | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: gardens, isLoading, isError } = useListGardensQuery();
  const [deleteGarden] = useDeleteGardenMutation();

  function resolveGardenPhoto(photo?: string) {
    if (!photo) return undefined;
    if (photo.startsWith('http')) return photo;

    const origin = new URL(VITE_API_URL).origin;
    return `${origin}${photo.startsWith('/') ? photo : `/${photo}`}`;
  }

  function handleOpenEdit(garden: ApiGarden) {
    setSelectedGarden(garden);
    setEditDialogOpen(true);
  }

  async function handleDeleteGarden(garden: ApiGarden) {
    const shouldDelete = window.confirm(`Delete "${garden.name}"? This action cannot be undone.`);
    if (!shouldDelete) return;

    try {
      await deleteGarden(garden._id).unwrap();
    } catch {
      window.alert('Failed to delete garden. Please try again.');
    }
  }

  return (
    <div className="space-y-8 p-6">
      <GardenDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        garden={selectedGarden}
        onSaved={() => setSelectedGarden(null)}
      />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-muted-foreground mt-1">Your gardens from the database.</p>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading gardens...</p> : null}

      {isError ? (
        <p className="text-destructive">Failed to load gardens. Please check backend connection.</p>
      ) : null}

      {!isLoading && !isError && gardens?.length === 0 ? (
        <p className="text-muted-foreground">No gardens yet. Click the plus button to create one.</p>
      ) : null}

      {!isLoading && !isError && gardens && gardens.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {gardens.map((garden) => (
            <InfoCard
              key={garden._id}
              title={garden.name}
              subtitle={garden.addressNumber
                ? `${garden.address}, ${garden.addressNumber}`
                : garden.address}
              imageUrl={resolveGardenPhoto(garden.photo)}
              imageAlt={garden.name}
              to={gardenPath(garden._id)}
              icon={Sprout}
              badge="Garden"
              updatedAt={garden.updatedAt}
              onEdit={() => handleOpenEdit(garden)}
              onDelete={() => void handleDeleteGarden(garden)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
