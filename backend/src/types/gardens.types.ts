export type GardenScheduleRules = {
  blockedWeekdays: number[];
  preferredStartMinute: number;
  preferredEndMinute: number;
  lineSpacingMinutes: number;
};

export type CreateGardenBody = {
  name: string;
  address: string;
  addressNumber?: string;
  isMainTapOn?: boolean;
  scheduleRules?: GardenScheduleRules;
  latitude?: number;
  longitude?: number;
  photoKey?: string;
};
