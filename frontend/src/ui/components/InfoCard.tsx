import { ArrowRight, MoreVertical } from 'lucide-react';
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
  actionLabel = DEFAULT_INFO_CARD_ACTION_LABEL
}: InfoCardProps) {
  const content = (
    <>
      {imageUrl ? (
        <div className="bg-sidebar-accent aspect-[16/10] w-full overflow-hidden rounded-t-2xl">
          <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
        </div>
      ) : null}

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
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground -mr-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Add menu functionality
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {children ? <CardContent className="pt-0 px-8">{children}</CardContent> : null}

      <CardContent className="mt-auto flex items-center justify-between border-t border-sidebar-border/70 pt-4 px-8 pb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground/80">
          {Icon ? <Icon className="size-4" /> : null}
          <span>{actionLabel}</span>
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
