import type { ApiIrrigationLine } from '@/types/irrigationLine.type';

export type ScheduleEntry = {
  id: string;
  time: string;
  day: string;
  dateKey: string;
  lineName: string;
  duration: number;
  liters: number;
};

export type ScheduleRules = {
  blockedWeekdays: number[];
  preferredStartHour: number;
  preferredEndHour: number;
  lineSpacingMinutes: number;
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

export const LINE_PERFORMANCE_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171'] as const;
export const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
] as const;
export const DEFAULT_SCHEDULE_RULES: ScheduleRules = {
  blockedWeekdays: [],
  preferredStartHour: 6,
  preferredEndHour: 9,
  lineSpacingMinutes: 0,
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const SCHEDULE_HISTORY_DAYS = 30;
export const SCHEDULE_FUTURE_DAYS = 30;

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

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampIntervalDays(value?: number) {
  if (!value || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function buildBaseTime(now: Date, rules: ScheduleRules) {
  const base = startOfDay(now);
  base.setHours(rules.preferredStartHour, 0, 0, 0);
  return base;
}

function getFirstRunInRange(anchorDate: Date, rangeStart: Date, intervalDays: number, rules: ScheduleRules) {
  const anchorRun = buildBaseTime(anchorDate, rules);
  const candidate = buildBaseTime(rangeStart, rules);

  if (candidate < anchorRun) {
    return anchorRun;
  }

  const daysSinceAnchor = dateDiffInDays(anchorRun, candidate);
  const remainder = ((daysSinceAnchor % intervalDays) + intervalDays) % intervalDays;

  if (remainder === 0) {
    return candidate;
  }

  candidate.setDate(candidate.getDate() + (intervalDays - remainder));
  return candidate;
}

export function buildScheduleWindow(
  lines: ApiIrrigationLine[],
  now = new Date(),
  historyDays = SCHEDULE_HISTORY_DAYS,
  futureDays = SCHEDULE_FUTURE_DAYS,
  rules: ScheduleRules = DEFAULT_SCHEDULE_RULES,
): ScheduleEntry[] {
  const scheduleCandidates: Array<{
    date: Date;
    dateKey: string;
    day: string;
    duration: number;
    liters: number;
    lineName: string;
    lineId: string;
    lineIndex: number;
  }> = [];
  const scheduleEligibleLines = lines.filter((line) => line.isActive && line.config && line.calculation);
  const blockedWeekdays = new Set(rules.blockedWeekdays);

  if (blockedWeekdays.size >= WEEKDAY_OPTIONS.length) {
    return [];
  }

  const rangeStart = startOfDay(new Date(now.getTime() - historyDays * DAY_IN_MS));
  const rangeEndExclusive = startOfDay(new Date(now.getTime() + (futureDays + 1) * DAY_IN_MS));

  scheduleEligibleLines.forEach((line, lineIndex) => {
    const intervalDays = clampIntervalDays(line.config?.intervalDays);
    const anchorDate = new Date(line.createdAt);
    let runDate = getFirstRunInRange(anchorDate, rangeStart, intervalDays, rules);

    while (runDate < rangeEndExclusive) {
      if (!blockedWeekdays.has(runDate.getDay())) {
        scheduleCandidates.push({
          date: new Date(runDate),
          day: formatDay(runDate, now),
          dateKey: formatDateKey(runDate),
          lineName: line.name,
          duration: Math.max(1, Math.round(line.calculation!.timeInHours * 60)),
          liters: Number((line.calculation!.waterPortion * 1000).toFixed(1)),
          lineId: line._id,
          lineIndex,
        });
      }

      runDate = new Date(runDate.getTime() + intervalDays * DAY_IN_MS);
    }
  });

  return scheduleCandidates
    .sort((a, b) => {
      const dateDifference = a.date.getTime() - b.date.getTime();

      if (dateDifference !== 0) return dateDifference;
      return a.lineIndex - b.lineIndex;
    })
    .map((entry, index, allEntries) => {
      const previousEntry = allEntries[index - 1];
      const dayStart = buildBaseTime(entry.date, rules);
      let scheduledDate = new Date(dayStart);

      if (previousEntry && previousEntry.dateKey === entry.dateKey) {
        const previousScheduledStart = new Date(previousEntry.date);
        const previousScheduledEnd = new Date(previousScheduledStart.getTime() + previousEntry.duration * 60 * 1000);

        scheduledDate = new Date(previousScheduledEnd.getTime() + rules.lineSpacingMinutes * 60 * 1000);

        if (scheduledDate < dayStart) {
          scheduledDate = new Date(dayStart);
        }
      }

      entry.date = scheduledDate;

      return {
        id: `${entry.lineId}-${scheduledDate.toISOString()}`,
        time: formatTime(scheduledDate),
        day: entry.day,
        dateKey: entry.dateKey,
        lineName: entry.lineName,
        duration: entry.duration,
        liters: entry.liters,
      };
    });
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
