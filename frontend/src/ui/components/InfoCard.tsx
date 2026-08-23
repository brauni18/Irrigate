import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';
import {
  DEFAULT_INFO_CARD_ACTION_LABEL,
  DEFAULT_INFO_CARD_TO,
  NO_NAVIGATION_TARGET
} from '../../consts/InfoCardConsts';
import type { InfoCardProps } from '../../types/InfoCardTypes';

const DEFAULT_IMAGE = '/defualt image.png';

function formatUpdatedAt(updatedAt: string) {
  return new Date(updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function InfoCard({
  title,
  subtitle,
  imageUrl,
  imageAlt = '',
  children,
  className,
  to = DEFAULT_INFO_CARD_TO,
  icon: Icon,
  badge,
  actionLabel = DEFAULT_INFO_CARD_ACTION_LABEL,
  updatedAt,
  onEdit,
  onDelete,
}: InfoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasActions = Boolean(onEdit || onDelete);

  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [menuOpen]);

  const content = (
    <>
      <div className="bg-sidebar-accent aspect-16/10 w-full overflow-hidden rounded-t-2xl">
        <img
          src={imageUrl ?? DEFAULT_IMAGE}
          alt={imageAlt}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
      </div>

      <CardHeader className="space-y-2 px-8 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle ? <p className="text-sidebar-foreground/70 mt-1 text-sm">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {badge ? (
              <span className="bg-sidebar-accent text-sidebar-accent-foreground rounded-full px-2.5 py-1 text-[11px] font-medium">
                {badge}
              </span>
            ) : null}
            {hasActions ? (
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-mr-2 h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {menuOpen ? (
                  <div
                    role="menu"
                    className="bg-popover text-popover-foreground absolute right-0 z-20 mt-1 min-w-32 rounded-md border border-border p-1 shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {onEdit ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                        onClick={() => {
                          onEdit();
                          setMenuOpen(false);
                        }}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </button>
                    ) : null}

                    {onDelete ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                        onClick={() => {
                          onDelete();
                          setMenuOpen(false);
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>

      {children ? <CardContent className="pt-0 px-8">{children}</CardContent> : null}

      <CardContent className="mt-auto flex items-center justify-between border-t border-sidebar-border/70 pt-4 px-8 pb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground/80">
          {updatedAt ? <Clock className="size-4" /> : Icon ? <Icon className="size-4" /> : null}
          <span>{updatedAt ? `Updated ${formatUpdatedAt(updatedAt)}` : actionLabel}</span>
        </div>
        <ArrowRight className="size-4 text-sidebar-foreground/70 transition-transform duration-200 group-hover:translate-x-1" />
      </CardContent>
    </>
  );

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-2xl border-sidebar-border bg-sidebar/50 text-sidebar-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sidebar-ring hover:bg-sidebar-accent/70 hover:shadow-md',
        className
      )}
    >
      {to && to !== NO_NAVIGATION_TARGET ? (
        <Link to={to} className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          {content}
        </Link>
      ) : (
        <div className="flex h-full flex-col">{content}</div>
      )}
    </Card>
  );
}
