import * as XLSX from 'xlsx';
import { DailySchoolSummary, School, AcademicYear } from '../types';
import { StorageService } from './storage';
import { formatDateIndian } from './calculations';

export function exportDailySummaryToExcel(
  summary: DailySchoolSummary,
  school: School,
  academicYear: AcademicYear
): void {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [school.name.toUpperCase()],
    [`MID-DAY MEAL (MDM) DAILY REGISTER - DATE: ${formatDateIndian(summary.date)}`],
    [`Academic Year: ${academicYear.name} | District: ${school.district || ''} | State: ${school.state || ''}`],
    [],
  ];

  const headers = [
    'Class / Section',
    'SC Boys', 'SC Girls', 'SC Total',
    'ST Boys', 'ST Girls', 'ST Total',
    'BC Boys', 'BC Girls', 'BC Total',
    'OC Boys', 'OC Girls', 'OC Total',
    'Boys Total', 'Girls Total', 'Grand Total',
    'Remarks'
  ];

  const dataRows: any[][] = [];

  // Group 1: Classes 6, 7, 8
  const g1Classes = summary.classes.filter(c => c.group_code === 'G1');
  g1Classes.forEach(c => {
    // Section A
    const a = c.section_a;
    dataRows.push([
      `Class ${c.class_number} - Sec A`,
      a?.sc_boys ?? '-', a?.sc_girls ?? '-', a?.totals.sc_total ?? '-',
      a?.st_boys ?? '-', a?.st_girls ?? '-', a?.totals.st_total ?? '-',
      a?.bc_boys ?? '-', a?.bc_girls ?? '-', a?.totals.bc_total ?? '-',
      a?.oc_boys ?? '-', a?.oc_girls ?? '-', a?.totals.oc_total ?? '-',
      a?.totals.boys_total ?? '-', a?.totals.girls_total ?? '-', a?.totals.grand_total ?? '-',
      a?.remarks || ''
    ]);

    // Section B
    const b = c.section_b;
    dataRows.push([
      `Class ${c.class_number} - Sec B`,
      b?.sc_boys ?? '-', b?.sc_girls ?? '-', b?.totals.sc_total ?? '-',
      b?.st_boys ?? '-', b?.st_girls ?? '-', b?.totals.st_total ?? '-',
      b?.bc_boys ?? '-', b?.bc_girls ?? '-', b?.totals.bc_total ?? '-',
      b?.oc_boys ?? '-', b?.oc_girls ?? '-', b?.totals.oc_total ?? '-',
      b?.totals.boys_total ?? '-', b?.totals.girls_total ?? '-', b?.totals.grand_total ?? '-',
      b?.remarks || ''
    ]);

    // Class Total
    dataRows.push([
      `CLASS ${c.class_number} COMBINED`,
      (a?.sc_boys ?? 0) + (b?.sc_boys ?? 0),
      (a?.sc_girls ?? 0) + (b?.sc_girls ?? 0),
      c.combined_totals.sc_total,
      (a?.st_boys ?? 0) + (b?.st_boys ?? 0),
      (a?.st_girls ?? 0) + (b?.st_girls ?? 0),
      c.combined_totals.st_total,
      (a?.bc_boys ?? 0) + (b?.bc_boys ?? 0),
      (a?.bc_girls ?? 0) + (b?.bc_girls ?? 0),
      c.combined_totals.bc_total,
      (a?.oc_boys ?? 0) + (b?.oc_boys ?? 0),
      (a?.oc_girls ?? 0) + (b?.oc_girls ?? 0),
      c.combined_totals.oc_total,
      c.combined_totals.boys_total,
      c.combined_totals.girls_total,
      c.combined_totals.grand_total,
      ''
    ]);
  });

  // Group 1 Total
  dataRows.push([
    '*** GROUP 1 TOTAL (Classes 6-8) ***',
    '', '', summary.group1_totals.sc_total,
    '', '', summary.group1_totals.st_total,
    '', '', summary.group1_totals.bc_total,
    '', '', summary.group1_totals.oc_total,
    summary.group1_totals.boys_total,
    summary.group1_totals.girls_total,
    summary.group1_totals.grand_total,
    'Group 1 Upper Primary Total'
  ]);

  // Group 2: Classes 9, 10
  const g2Classes = summary.classes.filter(c => c.group_code === 'G2');
  g2Classes.forEach(c => {
    // Section A
    const a = c.section_a;
    dataRows.push([
      `Class ${c.class_number} - Sec A`,
      a?.sc_boys ?? '-', a?.sc_girls ?? '-', a?.totals.sc_total ?? '-',
      a?.st_boys ?? '-', a?.st_girls ?? '-', a?.totals.st_total ?? '-',
      a?.bc_boys ?? '-', a?.bc_girls ?? '-', a?.totals.bc_total ?? '-',
      a?.oc_boys ?? '-', a?.oc_girls ?? '-', a?.totals.oc_total ?? '-',
      a?.totals.boys_total ?? '-', a?.totals.girls_total ?? '-', a?.totals.grand_total ?? '-',
      a?.remarks || ''
    ]);

    // Section B
    const b = c.section_b;
    dataRows.push([
      `Class ${c.class_number} - Sec B`,
      b?.sc_boys ?? '-', b?.sc_girls ?? '-', b?.totals.sc_total ?? '-',
      b?.st_boys ?? '-', b?.st_girls ?? '-', b?.totals.st_total ?? '-',
      b?.bc_boys ?? '-', b?.bc_girls ?? '-', b?.totals.bc_total ?? '-',
      b?.oc_boys ?? '-', b?.oc_girls ?? '-', b?.totals.oc_total ?? '-',
      b?.totals.boys_total ?? '-', b?.totals.girls_total ?? '-', b?.totals.grand_total ?? '-',
      b?.remarks || ''
    ]);

    // Class Total
    dataRows.push([
      `CLASS ${c.class_number} COMBINED`,
      (a?.sc_boys ?? 0) + (b?.sc_boys ?? 0),
      (a?.sc_girls ?? 0) + (b?.sc_girls ?? 0),
      c.combined_totals.sc_total,
      (a?.st_boys ?? 0) + (b?.st_boys ?? 0),
      (a?.st_girls ?? 0) + (b?.st_girls ?? 0),
      c.combined_totals.st_total,
      (a?.bc_boys ?? 0) + (b?.bc_boys ?? 0),
      (a?.bc_girls ?? 0) + (b?.bc_girls ?? 0),
      c.combined_totals.bc_total,
      (a?.oc_boys ?? 0) + (b?.oc_boys ?? 0),
      (a?.oc_girls ?? 0) + (b?.oc_girls ?? 0),
      c.combined_totals.oc_total,
      c.combined_totals.boys_total,
      c.combined_totals.girls_total,
      c.combined_totals.grand_total,
      ''
    ]);
  });

  // Group 2 Total
  dataRows.push([
    '*** GROUP 2 TOTAL (Classes 9-10) ***',
    '', '', summary.group2_totals.sc_total,
    '', '', summary.group2_totals.st_total,
    '', '', summary.group2_totals.bc_total,
    '', '', summary.group2_totals.oc_total,
    summary.group2_totals.boys_total,
    summary.group2_totals.girls_total,
    summary.group2_totals.grand_total,
    'Group 2 High School Total'
  ]);

  // School Grand Total
  dataRows.push([
    '=== SCHOOL GRAND TOTAL (Classes 6-10) ===',
    '', '', summary.school_grand_totals.sc_total,
    '', '', summary.school_grand_totals.st_total,
    '', '', summary.school_grand_totals.bc_total,
    '', '', summary.school_grand_totals.oc_total,
    summary.school_grand_totals.boys_total,
    summary.school_grand_totals.girls_total,
    summary.school_grand_totals.grand_total,
    `Sections entered: ${summary.entered_sections_count}/${summary.total_sections_count}`
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  // Adjust column widths
  ws['!cols'] = [
    { wch: 30 }, // Class
    { wch: 9 }, { wch: 9 }, { wch: 9 },
    { wch: 9 }, { wch: 9 }, { wch: 9 },
    { wch: 9 }, { wch: 9 }, { wch: 9 },
    { wch: 9 }, { wch: 9 }, { wch: 9 },
    { wch: 11 }, { wch: 11 }, { wch: 13 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, `MDM_${summary.date}`);
  XLSX.writeFile(wb, `MDM_Daily_Report_${summary.date}.xlsx`);
}

export function exportMonthlySummaryToExcel(
  year: number,
  month: number,
  school: School
): void {
  const summary = StorageService.getMonthlySummary(year, month);
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

  const wb = XLSX.utils.book_new();

  const titleRows = [
    [school.name.toUpperCase()],
    [`MONTHLY MID-DAY MEAL REGISTER - ${monthName.toUpperCase()} ${year}`],
    [`School Code: ${school.code || '-'} | Working Days: ${summary.working_days} | Days Served: ${summary.days_with_meals} | Total Meals: ${summary.total_meals} | Daily Avg: ${summary.average_meals_per_day}`],
    [],
  ];

  const headers = [
    'Date', 'Day', 'Status',
    'SC Boys', 'SC Girls', 'SC Total',
    'ST Boys', 'ST Girls', 'ST Total',
    'BC Boys', 'BC Girls', 'BC Total',
    'OC Boys', 'OC Girls', 'OC Total',
    'Boys Total', 'Girls Total', 'Grand Total'
  ];

  const dataRows: any[][] = [];

  summary.rows.forEach(r => {
    let status = 'Working Day';
    if (r.is_sunday) status = 'Sunday';
    else if (r.is_holiday) status = `Holiday (${r.holiday_reason || ''})`;
    else if (!r.is_entered) status = 'Not Entered';

    dataRows.push([
      formatDateIndian(r.date),
      r.day_name,
      status,
      r.is_entered ? r.sc_boys : '-',
      r.is_entered ? r.sc_girls : '-',
      r.is_entered ? r.sc_total : '-',
      r.is_entered ? r.st_boys : '-',
      r.is_entered ? r.st_girls : '-',
      r.is_entered ? r.st_total : '-',
      r.is_entered ? r.bc_boys : '-',
      r.is_entered ? r.bc_girls : '-',
      r.is_entered ? r.bc_total : '-',
      r.is_entered ? r.oc_boys : '-',
      r.is_entered ? r.oc_girls : '-',
      r.is_entered ? r.oc_total : '-',
      r.is_entered ? r.boys_total : '-',
      r.is_entered ? r.girls_total : '-',
      r.is_entered ? r.grand_total : '-'
    ]);
  });

  // Summary Row
  dataRows.push([
    'TOTALS',
    `${summary.days_with_meals} days`,
    `Avg: ${summary.average_meals_per_day}/day`,
    '', '', summary.totals.sc_total,
    '', '', summary.totals.st_total,
    '', '', summary.totals.bc_total,
    '', '', summary.totals.oc_total,
    summary.totals.boys_total,
    summary.totals.girls_total,
    summary.totals.grand_total
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  ws['!cols'] = [
    { wch: 12 }, { wch: 6 }, { wch: 22 },
    { wch: 8 }, { wch: 8 }, { wch: 9 },
    { wch: 8 }, { wch: 8 }, { wch: 9 },
    { wch: 8 }, { wch: 8 }, { wch: 9 },
    { wch: 8 }, { wch: 8 }, { wch: 9 },
    { wch: 11 }, { wch: 11 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, `${monthName}_${year}`);
  XLSX.writeFile(wb, `MDM_Monthly_Register_${year}_${String(month).padStart(2, '0')}.xlsx`);
}

export function exportToCSV(dataRows: any[][], filename: string): void {
  const ws = XLSX.utils.aoa_to_sheet(dataRows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
