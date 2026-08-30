import type { ApiIrrigationLine, IrrigationLineConfig } from '@/types/irrigationLine.type';
import type { ScheduleRules } from '@/consts/GardenPage.consts';

export type WeatherData = {
  temperature: number;
  windspeed: number;
  humidity: number;
  weatherCode: number;
  description: string;
};

export type WeatherWidgetProps = {
  address: string;
  addressNumber?: string;
  latitude?: number;
  longitude?: number;
};

export type IrrigationLineCardProps = {
  line: ApiIrrigationLine;
  mainTapOn: boolean;
  isPaused: boolean;
  isScheduledNow: boolean;
  isRunningNow: boolean;
  isForcedOff: boolean;
  onToggle: (shouldRun: boolean) => void;
  onTogglePause: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
};

export type AddLineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string, config: IrrigationLineConfig) => Promise<void>;
  isLoading: boolean;
  /** When set, the dialog runs in edit mode with these pre-filled values */
  initialName?: string;
  initialConfig?: Partial<IrrigationLineConfig>;
};

export type ScheduleRulesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ScheduleRules;
  onApply: (rules: ScheduleRules) => void;
};
