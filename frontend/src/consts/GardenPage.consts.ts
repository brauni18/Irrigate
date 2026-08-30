import type { ApiIrrigationLine } from '@/types/irrigationLine.type';

export type ScheduleEntry = {
  id: string;
  lineId: string;
  time: string;
  day: string;
  lineName: string;
  duration: number;
  liters: number;
};

export type WaterUsageEntry = {
  day: string;
  liters: number;
};

export type WeatherIrrigationEntry = {
  day: string;
  rainfall: number;
  temperature: number;
};

export type ScheduleRules = {
  blockedWeekdays: number[];
  preferredStartMinute: number;
  preferredEndMinute: number;
  lineSpacingMinutes: number;
};

export type ScheduleWindowEntry = ScheduleEntry & {
  dateKey: string;
};

export const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
] as const;

export const LINE_PERFORMANCE_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171'] as const;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SCHEDULE_START_HOUR = 6;
const SCHEDULE_SLOT_MINUTES = 30;

export const DEFAULT_SCHEDULE_RULES: ScheduleRules = {
  blockedWeekdays: [],
  preferredStartMinute: DEFAULT_SCHEDULE_START_HOUR * 60,
  preferredEndMinute: (DEFAULT_SCHEDULE_START_HOUR + 3) * 60,
  lineSpacingMinutes: 10,
};

export const SCHEDULE_HISTORY_DAYS = 1;
export const SCHEDULE_FUTURE_DAYS = 7;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateDiffInDays(from: Date, to: Date) {
  const fromDay = startOfDay(from).getTime();
  const toDay = startOfDay(to).getTime();
  return Math.floor((toDay - fromDay) / DAY_IN_MS);
}

function formatDay(date: Date, now: Date) {
  const dayDiff = dateDiffInDays(now, date);

  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatMinuteOfDay(totalMinutes: number) {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function clampScheduleRules(rules: ScheduleRules): ScheduleRules {
  const preferredStartMinute = Math.min(23 * 60 + 59, Math.max(0, Math.floor(rules.preferredStartMinute)));
  const preferredEndMinute = Math.min(24 * 60, Math.max(preferredStartMinute + 1, Math.floor(rules.preferredEndMinute)));
  const lineSpacingMinutes = Math.min(180, Math.max(-120, Math.floor(rules.lineSpacingMinutes)));

  return {
    blockedWeekdays: Array.from(new Set(rules.blockedWeekdays)).filter((day) => day >= 0 && day <= 6),
    preferredStartMinute,
    preferredEndMinute,
    lineSpacingMinutes,
  };
}

function clampIntervalDays(value?: number) {
  if (!value || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function buildBaseTime(now: Date, slotIndex: number) {
  const base = startOfDay(now);
  base.setHours(DEFAULT_SCHEDULE_START_HOUR, 0, 0, 0);
  base.setMinutes(base.getMinutes() + slotIndex * SCHEDULE_SLOT_MINUTES);
  return base;
}

function getNextRunDate(anchorDate: Date, now: Date, intervalDays: number, slotIndex: number) {
  const nextRun = buildBaseTime(now, slotIndex);

  while (nextRun < now || dateDiffInDays(anchorDate, nextRun) % intervalDays !== 0) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun;
}

export function buildUpcomingSchedule(lines: ApiIrrigationLine[], now = new Date(), maxEntries = 8): ScheduleEntry[] {
  const scheduleCandidates: Array<ScheduleEntry & { timestamp: number }> = [];
  const scheduleEligibleLines = lines.filter((line) => line.config && line.calculation);

  scheduleEligibleLines.forEach((line, lineIndex) => {
    const intervalDays = clampIntervalDays(line.config?.intervalDays);
    const anchorDate = new Date(line.createdAt);
    let runDate = getNextRunDate(anchorDate, now, intervalDays, lineIndex);
    const runCount = Math.max(1, Math.ceil(maxEntries / Math.max(scheduleEligibleLines.length, 1)));

    for (let i = 0; i < runCount; i += 1) {
      scheduleCandidates.push({
        id: `${line._id}-${runDate.toISOString()}`,
        lineId: line._id,
        time: formatTime(runDate),
        day: formatDay(runDate, now),
        lineName: line.name,
        duration: Math.max(1, Math.round(line.calculation!.timeInHours * 60)),
        liters: Number((line.calculation!.waterPortion * 1000).toFixed(1)),
        timestamp: runDate.getTime(),
      });

      runDate = new Date(runDate.getTime() + intervalDays * DAY_IN_MS);
    }
  });

  return scheduleCandidates
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, maxEntries)
    .map(({ timestamp: _timestamp, ...entry }) => entry);
}

export function buildScheduleWindow(
  lines: ApiIrrigationLine[],
  referenceDate = new Date(),
  historyDays = SCHEDULE_HISTORY_DAYS,
  futureDays = SCHEDULE_FUTURE_DAYS,
  rules: ScheduleRules = DEFAULT_SCHEDULE_RULES,
): ScheduleWindowEntry[] {
  const normalizedRules = clampScheduleRules(rules);
  const windowStart = startOfDay(referenceDate);
  windowStart.setDate(windowStart.getDate() - Math.max(0, historyDays));
  const totalDays = Math.max(0, historyDays) + Math.max(0, futureDays) + 1;

  const scheduleEligibleLines = lines.filter((line) => line.config && line.calculation);
  const entries: ScheduleWindowEntry[] = [];

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
    const currentDate = new Date(windowStart.getTime() + dayOffset * DAY_IN_MS);

    if (normalizedRules.blockedWeekdays.includes(currentDate.getDay())) continue;

    const runnableLines = scheduleEligibleLines.filter((line) => {
      const intervalDays = clampIntervalDays(line.config?.intervalDays);
      const anchorDate = new Date(line.createdAt);
      return dateDiffInDays(anchorDate, currentDate) % intervalDays === 0;
    });

    if (runnableLines.length === 0) continue;

    let minuteCursor = normalizedRules.preferredStartMinute;
    const latestStartMinute = normalizedRules.preferredEndMinute;
    const dateKey = toDateKey(currentDate);

    runnableLines.forEach((line) => {
      const duration = Math.max(1, Math.round((line.calculation?.timeInHours ?? 0) * 60));
      const startMinute = Math.min(minuteCursor, latestStartMinute);

      entries.push({
        id: `${line._id}-${dateKey}-${startMinute}`,
        lineId: line._id,
        dateKey,
        time: formatMinuteOfDay(startMinute),
        day: formatDay(currentDate, referenceDate),
        lineName: line.name,
        duration,
        liters: Number(((line.calculation?.waterPortion ?? 0) * 1000).toFixed(1)),
      });

      minuteCursor = startMinute + duration + normalizedRules.lineSpacingMinutes;
    });
  }

  return entries.sort((a, b) =>
    a.dateKey === b.dateKey ? a.time.localeCompare(b.time) : a.dateKey.localeCompare(b.dateKey),
  );
}

export const WATER_USAGE_7D: WaterUsageEntry[] = [
  { day: 'Mon', liters: 45 }, { day: 'Tue', liters: 52 },
  { day: 'Wed', liters: 38 }, { day: 'Thu', liters: 61 },
  { day: 'Fri', liters: 48 }, { day: 'Sat', liters: 55 },
  { day: 'Sun', liters: 42 },
];

export const WATER_USAGE_30D: WaterUsageEntry[] = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  liters: Math.floor(Math.random() * 40 + 30),
}));

export const WEATHER_VS_IRRIGATION: WeatherIrrigationEntry[] = [
  { day: 'Mon', rainfall: 0,  temperature: 22 },
  { day: 'Tue', rainfall: 2,  temperature: 24 },
  { day: 'Wed', rainfall: 0,  temperature: 26 },
  { day: 'Thu', rainfall: 15, temperature: 20 },
  { day: 'Fri', rainfall: 7,  temperature: 21 },
  { day: 'Sat', rainfall: 0,  temperature: 23 },
  { day: 'Sun', rainfall: 1,  temperature: 22 },
];
