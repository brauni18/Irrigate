import { useEffect, useRef, useState } from 'react';
import { CirclePause, CirclePlay, Droplets, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import type { IrrigationLineCardProps } from '@/types/GardenPage.types';

export function IrrigationLineCard({
  line,
  mainTapOn,
  isPaused,
  isScheduledNow,
  isRunningNow,
  isForcedOff,
  onToggle,
  onTogglePause,
  onEdit,
  onDelete,
  onClick,
}: IrrigationLineCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const statusText = isPaused
    ? 'Paused (excluded from schedule)'
    : !mainTapOn
    ? 'Paused (main tap off)'
    : isRunningNow
      ? line.isActive && isScheduledNow
        ? 'Active (manual + schedule)'
        : line.isActive
          ? 'Active (manual)'
          : 'Active (schedule)'
      : isForcedOff
        ? 'Paused by user'
      : line.isActive
        ? 'Manual on (waiting)'
        : 'Inactive';

  const statusClassName = isPaused
    ? 'text-orange-600'
    : !mainTapOn
    ? 'text-amber-600'
    : isRunningNow
      ? 'text-emerald-500'
      : isForcedOff
        ? 'text-orange-600'
      : line.isActive
        ? 'text-blue-500'
        : 'text-muted-foreground';

  return (
    <Card className="bg-muted/40 rounded-2xl border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <CardContent className="flex items-center gap-3 px-5 py-4">
        {/* icon */}
        <Droplets className="text-muted-foreground h-4 w-4 shrink-0" />

        {/* name + status — clickable */}
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col text-left"
          onClick={onClick}
        >
          <span className="truncate font-medium hover:underline">{line.name}</span>
          <span className={`text-xs font-medium ${statusClassName}`}>{statusText}</span>
        </button>

        {/* toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={isRunningNow}
          aria-label={isPaused ? `${line.name} is paused` : isRunningNow ? `Turn ${line.name} off` : `Turn ${line.name} on`}
          onClick={() => onToggle(!isRunningNow)}
          disabled={isPaused}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${isRunningNow ? 'bg-emerald-500' : 'bg-muted'}`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isRunningNow ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>

        {/* 3-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Line options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((p) => !p)}
            className="text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="bg-popover text-popover-foreground absolute right-0 z-20 mt-1 min-w-32 rounded-md border border-border p-1 shadow-md"
              onClick={() => setMenuOpen(false)}
            >
              <button
                type="button"
                role="menuitem"
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={onTogglePause}
              >
                {isPaused ? <CirclePlay className="h-4 w-4" /> : <CirclePause className="h-4 w-4" />}
                {isPaused ? 'Resume line' : 'Pause line'}
              </button>
              <button
                type="button"
                role="menuitem"
                className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
