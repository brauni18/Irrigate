import type { Types } from 'mongoose';
import type { IrrigationLineConfig } from './config.js';
import type { IrrigationCalculation } from './calculate.js';

export type ScheduleRules = {
  blockedWeekdays: number[];
  preferredStartMinute: number;
  preferredEndMinute: number;
  lineSpacingMinutes: number;
};

export type ScheduleWindowEntry = {
  id: string;
  lineId: string;
  dateKey: string;
  time: string;
  day: string;
  lineName: string;
  duration: number;
  liters: number;
};

type ScheduleLine = {
  _id: Types.ObjectId | string;
  name: string;
  isPaused?: boolean;
  createdAt: Date | string;
  config?: IrrigationLineConfig;
  calculation?: IrrigationCalculation;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SCHEDULE_START_HOUR = 6;

export const DEFAULT_SCHEDULE_RULES: ScheduleRules = {
  blockedWeekdays: [],
  preferredStartMinute: DEFAULT_SCHEDULE_START_HOUR * 60,
  preferredEndMinute: (DEFAULT_SCHEDULE_START_HOUR + 3) * 60,
  lineSpacingMinutes: 10,
};

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

function clampIntervalDays(value?: number) {
  if (!value || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

export function normalizeScheduleRules(rules?: Partial<ScheduleRules>): ScheduleRules {
  const safeRules = rules ?? DEFAULT_SCHEDULE_RULES;
  const preferredStartMinute = Math.min(
    23 * 60 + 59,
    Math.max(0, Math.floor(safeRules.preferredStartMinute ?? DEFAULT_SCHEDULE_RULES.preferredStartMinute)),
  );
  const preferredEndMinute = Math.min(
    24 * 60,
    Math.max(preferredStartMinute + 1, Math.floor(safeRules.preferredEndMinute ?? DEFAULT_SCHEDULE_RULES.preferredEndMinute)),
  );
  const lineSpacingMinutes = Math.min(
    180,
    Math.max(-120, Math.floor(safeRules.lineSpacingMinutes ?? DEFAULT_SCHEDULE_RULES.lineSpacingMinutes)),
  );

  return {
    blockedWeekdays: Array.from(new Set(safeRules.blockedWeekdays ?? [])).filter((day) => day >= 0 && day <= 6),
    preferredStartMinute,
    preferredEndMinute,
    lineSpacingMinutes,
  };
}

export function buildScheduleWindow(
  lines: ScheduleLine[],
  referenceDate = new Date(),
  historyDays = 1,
  futureDays = 7,
  rules: ScheduleRules = DEFAULT_SCHEDULE_RULES,
): ScheduleWindowEntry[] {
  const normalizedRules = normalizeScheduleRules(rules);
  const windowStart = startOfDay(referenceDate);
  windowStart.setDate(windowStart.getDate() - Math.max(0, historyDays));
  const totalDays = Math.max(0, historyDays) + Math.max(0, futureDays) + 1;

  const scheduleEligibleLines = lines.filter((line) => !line.isPaused && line.config && line.calculation);
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
        id: `${String(line._id)}-${dateKey}-${startMinute}`,
        lineId: String(line._id),
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
