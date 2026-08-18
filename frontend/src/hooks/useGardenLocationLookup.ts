import { useEffect, useState } from 'react';
import {
  GARDEN_DIALOG_ADDRESS_LOOKUP_DEBOUNCE_MS,
  GARDEN_DIALOG_ADDRESS_LOOKUP_EMPTY_MESSAGE,
  GARDEN_DIALOG_ADDRESS_LOOKUP_FAILED_MESSAGE,
} from '@/consts/GardenDialog.consts';
import type { GardenGeocodeResult, GardenLocationMatch } from '@/types/GardenDialog.types';
import { buildCandidateQueries } from '@/ui/components/GardenDialog/utils';

type UseGardenLocationLookupArgs = {
  open: boolean;
  address: string;
  addressNumber: string;
};

export function useGardenLocationLookup({ open, address, addressNumber }: UseGardenLocationLookupArgs) {
  const [locationMatches, setLocationMatches] = useState<GardenLocationMatch[]>([]);
  const [locationLookupLoading, setLocationLookupLoading] = useState(false);
  const [locationLookupError, setLocationLookupError] = useState('');

  function clearLookup() {
    setLocationMatches([]);
    setLocationLookupError('');
  }

  useEffect(() => {
    const candidateQueries = buildCandidateQueries(address, addressNumber);

    if (!open || candidateQueries.length === 0) {
      clearLookup();
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLocationLookupLoading(true);
        setLocationLookupError('');

        let results: GardenGeocodeResult[] = [];

        for (const query of candidateQueries) {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
          );

          if (!response.ok) continue;

          const payload = (await response.json()) as {
            results?: GardenGeocodeResult[];
          };

          if (payload.results && payload.results.length > 0) {
            results = payload.results;
            break;
          }
        }

        setLocationMatches(
          results.map((result) => ({
            label: `${result.name}${result.country ? `, ${result.country}` : ''}`,
            latitude: result.latitude,
            longitude: result.longitude,
            country: result.country,
          })),
        );

        if (results.length === 0) {
          setLocationLookupError(GARDEN_DIALOG_ADDRESS_LOOKUP_EMPTY_MESSAGE);
        }
      } catch {
        setLocationMatches([]);
        setLocationLookupError(GARDEN_DIALOG_ADDRESS_LOOKUP_FAILED_MESSAGE);
      } finally {
        setLocationLookupLoading(false);
      }
    }, GARDEN_DIALOG_ADDRESS_LOOKUP_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [address, addressNumber, open]);

  return {
    locationMatches,
    locationLookupLoading,
    locationLookupError,
    clearLookup,
    setLocationLookupError,
  };
}
