import { User, Settings } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '@/shadcn/lib/utils';
import { DEFAULT_SIDEBAR_ITEMS } from '@/consts/Sidebar.consts';
import { ROUTES } from '@/router/routes.consts';
import type { SidebarProps } from '@/types/Sidebar.types';

export function Sidebar({
  collapsed = false,
  items = DEFAULT_SIDEBAR_ITEMS,
  className
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full flex-col border-r transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
      data-collapsed={collapsed}
      aria-label="Main navigation"
    >
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {items.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <Icon className="size-5 shrink-0" />
            <span className={cn('truncate', collapsed && 'sr-only')}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-sidebar-border space-y-1 border-t p-2">
        <NavLink
          to={ROUTES.settings}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
            )
          }
        >
          <Settings className="size-5 shrink-0" />
          <span className={cn('truncate', collapsed && 'sr-only')}>Settings</span>
        </NavLink>

        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0'
          )}
          aria-label="Account"
        >
          <div className="bg-sidebar-accent text-sidebar-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
            <User className="size-4" />
          </div>
          <span className={cn('truncate', collapsed && 'sr-only')}>Account</span>
        </button>
      </div>
    </aside>
  );
}
