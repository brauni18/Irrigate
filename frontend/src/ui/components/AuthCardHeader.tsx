import { Droplets } from 'lucide-react';

type AuthCardHeaderProps = {
  title: string;
  iconClassName: string;
  labelClassName: string;
  titleClassName: string;
};

export function AuthCardHeader({ title, iconClassName, labelClassName, titleClassName }: AuthCardHeaderProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className={`flex size-10 items-center justify-center rounded-2xl ${iconClassName}`}>
        <Droplets className="size-5" />
      </span>
      <div>
        <p className={`text-sm ${labelClassName}`}>Irrigate</p>
        <h2 className={`text-2xl font-semibold tracking-tight ${titleClassName}`}>{title}</h2>
      </div>
    </div>
  );
}