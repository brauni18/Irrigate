import { Home, LayoutDashboard } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import type { SidebarItem } from '@/types/Sidebar.types';

export const DEFAULT_SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Home', to: ROUTES.home, icon: Home, end: true },
  { label: 'Dashboard', to: ROUTES.gardens, icon: LayoutDashboard },
];
