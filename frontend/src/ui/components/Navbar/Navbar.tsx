import { Droplets, Menu, Bell, Plus, Bot, Search } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';
import {
  DEFAULT_NAVBAR_TITLE,
  DEFAULT_SHOW_MENU_BUTTON
} from '@/consts/Navbar.consts';
import { ROUTES } from '@/router/routes.consts';
import type { NavbarProps } from '@/types/Navbar.types';

export function Navbar({
  title = DEFAULT_NAVBAR_TITLE,
  onMenuClick,
  className,
  showMenuButton = DEFAULT_SHOW_MENU_BUTTON
}: NavbarProps) {
  return (
    <header
      className={cn(
        'bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 flex h-14 w-full items-center gap-3 border-b px-3 backdrop-blur sm:px-4',
        className
      )}
    >
      {showMenuButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu className="size-5" />
        </Button>
      )}

      <Link
        to={ROUTES.home}
        className="text-foreground flex min-w-0 items-center gap-2 font-semibold tracking-tight"
      >
        <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Droplets className="size-4" />
        </span>
        <span className="truncate">{title}</span>
      </Link>

      <div className="mx-auto flex max-w-sm items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" aria-label="New">
          <Plus className="size-5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="AI Assistant">
          <Bot className="size-5" />
        </Button>
      </div>
    </header>
  );
}
