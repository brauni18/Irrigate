export type ApiGardenScheduleRules = {
  blockedWeekdays: number[];
  preferredStartMinute: number;
  preferredEndMinute: number;
  lineSpacingMinutes: number;
};

export type ApiGardenScheduleEntry = {
  id: string;
  lineId: string;
  dateKey: string;
  time: string;
  day: string;
  lineName: string;
  duration: number;
  liters: number;
};

export type ApiGardenScheduleResponse = {
  rules: ApiGardenScheduleRules;
  entries: ApiGardenScheduleEntry[];
};

export type ApiGarden = {
  _id: string;
  name: string;
  address: string;
  addressNumber?: string;
  isMainTapOn?: boolean;
  scheduleRules?: ApiGardenScheduleRules;
  latitude?: number;
  longitude?: number;
  photo?: string;
  createdAt: string;
  updatedAt: string;
};

export type GardenMutationBody = {
  name?: string;
  address?: string;
  addressNumber?: string;
  isMainTapOn?: boolean;
  scheduleRules?: ApiGardenScheduleRules;
  latitude?: number;
  longitude?: number;
  photoKey?: string;
};

export type GetGardenSchedulePayload = {
  id: string;
  historyDays?: number;
  futureDays?: number;
};

export type UpdateGardenPayload = {
  id: string;
  body: GardenMutationBody;
};

export type RequestGardenPhotoUploadUrlPayload = {
  fileName: string;
  contentType: string;
  fileSize: number;
};

export type GardenPhotoUploadUrlResponse = {
  photoKey: string;
  uploadUrl: string;
  expiresAt: string;
  maxFileSizeBytes: number;
};

export type DeleteGardenResponse = {
  message: string;
};
