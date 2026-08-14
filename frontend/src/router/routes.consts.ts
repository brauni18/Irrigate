export const ROUTES = {
  home: '/',
  gardens: '/gardens',
  garden: '/gardens/:id',
  calculator: '/calculator',
  settings: '/settings',
  fallback: '*'
} as const;

export function gardenPath(id: string) {
  return `/gardens/${id}`;
}
