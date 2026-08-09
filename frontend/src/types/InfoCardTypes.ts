import type { LucideIcon } from 'lucide-react';

export type InfoCardProps = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  className?: string;
  to?: string;
  icon?: LucideIcon;
  badge?: string;
  actionLabel?: string;
};
