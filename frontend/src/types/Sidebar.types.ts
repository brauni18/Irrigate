import type { LucideIcon } from 'lucide-react';

export type SidebarItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
};

export type SidebarProps = {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  items?: SidebarItem[];
  className?: string;
};
