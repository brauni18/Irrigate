import type { ReactNode } from 'react';

const labelClass = 'flex items-center gap-1.5 text-sm font-medium';

type FieldLabelProps = {
  icon: ReactNode;
  children: ReactNode;
};

export function FieldLabel({ icon, children }: FieldLabelProps) {
  return (
    <span className={labelClass}>
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </span>
  );
}