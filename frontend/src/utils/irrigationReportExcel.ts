import * as XLSX from 'xlsx';
import type { ScheduleWindowEntry } from '@/consts/GardenPage.consts';
import type { ApiIrrigationLine } from '@/types/irrigationLine.type';

type ExportIrrigationReportArgs = {
  gardenName: string;
  lines: ApiIrrigationLine[];
  scheduleEntries: ScheduleWindowEntry[];
};

function toDurationText(duration?: { hours: number; minutes: number; seconds: number }) {
  if (!duration) return '';
  return [duration.hours, duration.minutes, duration.seconds]
    .map((value) => String(Math.max(0, Math.floor(value))).padStart(2, '0'))
    .join(':');
}

function sanitizeFileName(name: string) {
  return name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_') || 'garden';
}

export function exportIrrigationReportExcel({
  gardenName,
  lines,
  scheduleEntries,
}: ExportIrrigationReportArgs) {
  const lineRows = lines.map((line, index) => {
    const waterPerRunLiters = Number(((line.calculation?.waterPortion ?? 0) * 1000).toFixed(1));

    return {
      '#': index + 1,
      'Line Name': line.name,
      Active: line.isActive ? 'Yes' : 'No',
      Plant: line.config?.plantKey ?? '',
      Location: line.config?.locationKey ?? '',
      Technique: line.config?.techniqueKey ?? '',
      'Area (m2)': line.config?.areaSizeM2 ?? 0,
      'Interval (days)': line.config?.intervalDays ?? 0,
      'Flow Rate (L/h)': line.config?.techniqueConfig.flowRate ?? 0,
      'Emitter Distance (m)': line.config?.techniqueConfig.distance ?? 0,
      'Water Per Run (L)': waterPerRunLiters,
      'Drippers/Sprinklers Count': line.calculation?.dripPresCount ?? 0,
      'Run Duration (hh:mm:ss)': toDurationText(line.calculation?.duration),
      'Calculated Time (hours)': Number((line.calculation?.timeInHours ?? 0).toFixed(3)),
      'Created At': line.createdAt,
      'Updated At': line.updatedAt,
    };
  });

  const scheduleRows = scheduleEntries.map((entry, index) => ({
    '#': index + 1,
    Date: entry.dateKey,
    Day: entry.day,
    Time: entry.time,
    'Line Name': entry.lineName,
    'Duration (min)': entry.duration,
    'Water (L)': entry.liters,
  }));

  const workbook = XLSX.utils.book_new();
  const lineSheet = XLSX.utils.json_to_sheet(lineRows, {
    header: [
      '#',
      'Line Name',
      'Active',
      'Plant',
      'Location',
      'Technique',
      'Area (m2)',
      'Interval (days)',
      'Flow Rate (L/h)',
      'Emitter Distance (m)',
      'Water Per Run (L)',
      'Drippers/Sprinklers Count',
      'Run Duration (hh:mm:ss)',
      'Calculated Time (hours)',
      'Created At',
      'Updated At',
    ],
  });
  const scheduleSheet = XLSX.utils.json_to_sheet(scheduleRows, {
    header: ['#', 'Date', 'Day', 'Time', 'Line Name', 'Duration (min)', 'Water (L)'],
  });

  lineSheet['!cols'] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 10 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 11 },
    { wch: 14 },
    { wch: 14 },
    { wch: 17 },
    { wch: 16 },
    { wch: 24 },
    { wch: 21 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
  ];

  scheduleSheet['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 12 },
    { wch: 9 },
    { wch: 24 },
    { wch: 16 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, lineSheet, 'Irrigation Results');
  XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule');

  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `${sanitizeFileName(gardenName)}_irrigation_report_${dateStamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
