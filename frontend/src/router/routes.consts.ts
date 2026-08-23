export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  verifyEmail: '/verify-email',
  gardens: '/gardens',
  garden: '/gardens/:id',
  calculator: '/calculator',
  settings: '/settings',
  fallback: '*'
} as const;

export function gardenPath(id: string) {
  return `/gardens/${id}`;
}
