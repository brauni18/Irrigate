import { useEffect, useRef, useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { cn } from '@/shadcn/lib/utils';
import { DEFAULT_SIDEBAR_ITEMS } from '@/consts/Sidebar.consts';
import { ROUTES } from '@/router/routes.consts';
import type { SidebarProps } from '@/types/Sidebar.types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useLogoutMutation } from '@/store/apis/users.api';
import { clearSession } from '@/store/slices/user.slice';

export function Sidebar({
  collapsed = false,
  items = DEFAULT_SIDEBAR_ITEMS,
  className
}: SidebarProps) {
  const navigate = useNavigate();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.user.profile);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current) return;
      if (accountMenuRef.current.contains(event.target as Node)) return;
      setAccountMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLogout() {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Always clear local session even if logout API fails.
    }

    setAccountMenuOpen(false);
    dispatch(clearSession());
    navigate(ROUTES.login, { replace: true });
  }

  function handleGoToSettings() {
    setAccountMenuOpen(false);
    navigate(ROUTES.settings);
  }

  const initials = profile?.name
    ? profile.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'U';

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

      <div className="border-sidebar-border border-t p-2" ref={accountMenuRef}>
        <button
          type="button"
          className={cn(
            'w-full rounded-md text-left transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            accountMenuOpen && 'bg-sidebar-accent/70'
          )}
          aria-label="Account menu"
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((prev) => !prev)}
        >
          <div
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              collapsed && 'justify-center px-0'
            )}
          >
            <div className="bg-sidebar-accent text-sidebar-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
              {collapsed ? <User className="size-4" /> : <span className="text-xs font-semibold">{initials}</span>}
            </div>
            <div className={cn('min-w-0', collapsed && 'sr-only')}>
              <p className="truncate text-sm font-medium">{profile?.name ?? 'Account'}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{profile?.email ?? ''}</p>
            </div>
          </div>
        </button>

        {accountMenuOpen ? (
          <div
            className={cn(
              'bg-popover text-popover-foreground border-border mt-2 rounded-md border p-1 shadow-md',
              collapsed ? 'w-44' : 'w-full'
            )}
          >
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm"
              onClick={handleGoToSettings}
            >
              <Settings className="size-4" />
              Settings
            </button>
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
