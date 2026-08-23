import { VITE_API_URL } from '@/consts/consts';
import type { ApiGarden } from '@/types/garden.type';

export function resolveExistingPhoto(isEditMode: boolean, photo?: ApiGarden['photo']) {
  if (!isEditMode || !photo) return null;
  if (photo.startsWith('http')) return photo;

  const origin = new URL(VITE_API_URL).origin;
  return `${origin}${photo.startsWith('/') ? photo : `/${photo}`}`;
}

export function buildCandidateQueries(address: string, addressNumber: string): string[] {
  const baseQuery = [address, addressNumber].filter(Boolean).join(' ').trim();

  return Array.from(
    new Set(
      [
        baseQuery,
        address.trim(),
        address.trim().replace(/\d+/g, '').trim(),
        address.trim().replace(/\s+\d+.*$/, '').trim(),
        address.trim().split(/\s+/).filter((part) => !/^\d+$/.test(part)).join(' '),
      ].filter((value) => value.length >= 3),
    ),
  );
}