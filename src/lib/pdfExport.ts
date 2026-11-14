import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailySchoolSummary, School, AcademicYear } from '../types';
import { StorageService } from './storage';
import { formatDateIndian } from './calculations';

export function exportDailySummaryToPDF(
  summary: DailySchoolSummary,
  school: School,
  academicYear: AcademicYear
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(school.name.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`MID-DAY MEAL (MDM) DAILY REGISTER | DATE: ${formatDateIndian(summary.date)}`, pageWidth / 2, 44, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Academic Year: ${academicYear.name} | School Code: ${school.code || '-'} | District: ${school.district || '-'}, ${school.state || '-'}`, pageWidth / 2, 58, { align: 'center' });

  // Status Banner
  if (summary.is_sunday) {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('[ SUNDAY - NON-WORKING DAY ]', pageWidth / 2, 72, { align: 'center' });
  } else if (summary.is_holiday) {
    doc.setTextColor(217, 119, 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`[ HOLIDAY: ${summary.holiday_reason || 'School Holiday'} ]`, pageWidth / 2, 72, { align: 'center' });
  }

  doc.setTextColor(0, 0, 0);

  const tableHead = [
    [
      { content: 'Class / Sec', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
      { content: 'SC', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'ST', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'BC', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'OC', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'GENDER TOTALS', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'Remarks', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } }
    ],
    [
      'B', 'G', 'Tot',
      'B', 'G', 'Tot',
      'B', 'G', 'Tot',
      'B', 'G', 'Tot',
      'Boys', 'Girls', 'TOTAL'
    ]
  ];

  const tableBody: any[] = [];

  // Group 1
  const g1 = summary.classes.filter(c => c.group_code === 'G1');
  g1.forEach(c => {
    const a = c.section_a;
    const b = c.section_b;
    tableBody.push([
      `Class ${c.class_number} - Sec A`,
      a?.sc_boys ?? '-', a?.sc_girls ?? '-', a?.totals.sc_total ?? '-',
      a?.st_boys ?? '-', a?.st_girls ?? '-', a?.totals.st_total ?? '-',
      a?.bc_boys ?? '-', a?.bc_girls ?? '-', a?.totals.bc_total ?? '-',
      a?.oc_boys ?? '-', a?.oc_girls ?? '-', a?.totals.oc_total ?? '-',
      a?.totals.boys_total ?? '-', a?.totals.girls_total ?? '-', a?.totals.grand_total ?? '-',
      a?.remarks || ''
    ]);
    tableBody.push([
      `Class ${c.class_number} - Sec B`,
      b?.sc_boys ?? '-', b?.sc_girls ?? '-', b?.totals.sc_total ?? '-',
      b?.st_boys ?? '-', b?.st_girls ?? '-', b?.totals.st_total ?? '-',
      b?.bc_boys ?? '-', b?.bc_girls ?? '-', b?.totals.bc_total ?? '-',
      b?.oc_boys ?? '-', b?.oc_girls ?? '-', b?.totals.oc_total ?? '-',
      b?.totals.boys_total ?? '-', b?.totals.girls_total ?? '-', b?.totals.grand_total ?? '-',
      b?.remarks || ''
    ]);
    tableBody.push({
      cells: [
        `Class ${c.class_number} Subtotal`,
        (a?.sc_boys ?? 0) + (b?.sc_boys ?? 0), (a?.sc_girls ?? 0) + (b?.sc_girls ?? 0), c.combined_totals.sc_total,
        (a?.st_boys ?? 0) + (b?.st_boys ?? 0), (a?.st_girls ?? 0) + (b?.st_girls ?? 0), c.combined_totals.st_total,
        (a?.bc_boys ?? 0) + (b?.bc_boys ?? 0), (a?.bc_girls ?? 0) + (b?.bc_girls ?? 0), c.combined_totals.bc_total,
        (a?.oc_boys ?? 0) + (b?.oc_boys ?? 0), (a?.oc_girls ?? 0) + (b?.oc_girls ?? 0), c.combined_totals.oc_total,
        c.combined_totals.boys_total, c.combined_totals.girls_total, c.combined_totals.grand_total,
        ''
      ],
      styles: { fontStyle: 'bold', fillColor: [240, 248, 255] }
    });
  });

  // Group 1 Total row
  tableBody.push({
    cells: [
      'GROUP 1 TOTAL (6-8)',
      '', '', summary.group1_totals.sc_total,
      '', '', summary.group1_totals.st_total,
      '', '', summary.group1_totals.bc_total,
      '', '', summary.group1_totals.oc_total,
      summary.group1_totals.boys_total,
      summary.group1_totals.girls_total,
      summary.group1_totals.grand_total,
      'Upper Primary Total'
    ],
    styles: { fontStyle: 'bold', fillColor: [224, 242, 254], textColor: [12, 74, 110] }
  });

  // Group 2
  const g2 = summary.classes.filter(c => c.group_code === 'G2');
  g2.forEach(c => {
    const a = c.section_a;
    const b = c.section_b;
    tableBody.push([
      `Class ${c.class_number} - Sec A`,
      a?.sc_boys ?? '-', a?.sc_girls ?? '-', a?.totals.sc_total ?? '-',
      a?.st_boys ?? '-', a?.st_girls ?? '-', a?.totals.st_total ?? '-',
      a?.bc_boys ?? '-', a?.bc_girls ?? '-', a?.totals.bc_total ?? '-',
      a?.oc_boys ?? '-', a?.oc_girls ?? '-', a?.totals.oc_total ?? '-',
      a?.totals.boys_total ?? '-', a?.totals.girls_total ?? '-', a?.totals.grand_total ?? '-',
      a?.remarks || ''
    ]);
    tableBody.push([
      `Class ${c.class_number} - Sec B`,
      b?.sc_boys ?? '-', b?.sc_girls ?? '-', b?.totals.sc_total ?? '-',
      b?.st_boys ?? '-', b?.st_girls ?? '-', b?.totals.st_total ?? '-',
      b?.bc_boys ?? '-', b?.bc_girls ?? '-', b?.totals.bc_total ?? '-',
      b?.oc_boys ?? '-', b?.oc_girls ?? '-', b?.totals.oc_total ?? '-',
      b?.totals.boys_total ?? '-', b?.totals.girls_total ?? '-', b?.totals.grand_total ?? '-',
      b?.remarks || ''
    ]);
    tableBody.push({
      cells: [
        `Class ${c.class_number} Subtotal`,
        (a?.sc_boys ?? 0) + (b?.sc_boys ?? 0), (a?.sc_girls ?? 0) + (b?.sc_girls ?? 0), c.combined_totals.sc_total,
        (a?.st_boys ?? 0) + (b?.st_boys ?? 0), (a?.st_girls ?? 0) + (b?.st_girls ?? 0), c.combined_totals.st_total,
        (a?.bc_boys ?? 0) + (b?.bc_boys ?? 0), (a?.bc_girls ?? 0) + (b?.bc_girls ?? 0), c.combined_totals.bc_total,
        (a?.oc_boys ?? 0) + (b?.oc_boys ?? 0), (a?.oc_girls ?? 0) + (b?.oc_girls ?? 0), c.combined_totals.oc_total,
        c.combined_totals.boys_total, c.combined_totals.girls_total, c.combined_totals.grand_total,
        ''
      ],
      styles: { fontStyle: 'bold', fillColor: [240, 248, 255] }
    });
  });

  // Group 2 Total row
  tableBody.push({
    cells: [
      'GROUP 2 TOTAL (9-10)',
      '', '', summary.group2_totals.sc_total,
      '', '', summary.group2_totals.st_total,
      '', '', summary.group2_totals.bc_total,
      '', '', summary.group2_totals.oc_total,
      summary.group2_totals.boys_total,
      summary.group2_totals.girls_total,
      summary.group2_totals.grand_total,
      'High School Total'
    ],
    styles: { fontStyle: 'bold', fillColor: [224, 242, 254], textColor: [12, 74, 110] }
  });

  // Grand Total row
  tableBody.push({
    cells: [
      'GRAND TOTAL (6-10)',
      '', '', summary.school_grand_totals.sc_total,
      '', '', summary.school_grand_totals.st_total,
      '', '', summary.school_grand_totals.bc_total,
      '', '', summary.school_grand_totals.oc_total,
      summary.school_grand_totals.boys_total,
      summary.school_grand_totals.girls_total,
      summary.school_grand_totals.grand_total,
      `Entered: ${summary.entered_sections_count}/${summary.total_sections_count}`
    ],
    styles: { fontStyle: 'bold', fillColor: [220, 252, 231], textColor: [20, 83, 45], fontSize: 9 }
  });

  autoTable(doc, {
    startY: 82,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      halign: 'center',
    },
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 100 },
      16: { halign: 'left', cellWidth: 90 },
    },
  });

  // Signatures at bottom
  const finalY = (doc as any).lastAutoTable.finalY + 35;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature of MDM Incharge / Cook', 60, finalY);
  doc.text('Signature of Headmaster / Principal', pageWidth - 200, finalY);

  doc.save(`MDM_Daily_Register_${summary.date}.pdf`);
}

export function exportMonthlySummaryToPDF(
  year: number,
  month: number,
  school: School
): void {
  const summary = StorageService.getMonthlySummary(year, month);
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(school.name.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`MONTHLY MID-DAY MEAL REGISTER - ${monthName.toUpperCase()} ${year}`, pageWidth / 2, 44, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Working Days: ${summary.working_days} | Days Meals Served: ${summary.days_with_meals} | Total Meals: ${summary.total_meals} | Daily Average: ${summary.average_meals_per_day}`, pageWidth / 2, 58, { align: 'center' });

  const tableHead = [
    [
      { content: 'Date', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
      { content: 'Day', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
      { content: 'SC', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'ST', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'BC', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'OC', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'TOTALS', colSpan: 3, styles: { halign: 'center' as const } },
      { content: 'Day Status', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } }
    ],
    [
      'B', 'G', 'Tot',
      'B', 'G', 'Tot',
      'B', 'G', 'Tot',
      'B', 'G', 'Tot',
      'Boys', 'Girls', 'TOTAL'
    ]
  ];

  const tableBody: any[] = [];

  summary.rows.forEach(r => {
    let status = 'Working Day';
    if (r.is_sunday) status = 'Sunday';
    else if (r.is_holiday) status = `Holiday (${r.holiday_reason || ''})`;
    else if (!r.is_entered) status = 'Not Entered';

    tableBody.push({
      cells: [
        formatDateIndian(r.date),
        r.day_name,
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
        r.is_entered ? r.grand_total : '-',
        status
      ],
      styles: r.is_sunday ? { fillColor: [254, 242, 242], textColor: [185, 28, 28] } :
              r.is_holiday ? { fillColor: [254, 249, 195], textColor: [161, 98, 7] } : {}
    });
  });

  // Totals Row
  tableBody.push({
    cells: [
      'TOTAL',
      `${summary.days_with_meals} days`,
      '', '', summary.totals.sc_total,
      '', '', summary.totals.st_total,
      '', '', summary.totals.bc_total,
      '', '', summary.totals.oc_total,
      summary.totals.boys_total,
      summary.totals.girls_total,
      summary.totals.grand_total,
      `Avg: ${summary.average_meals_per_day}/day`
    ],
    styles: { fontStyle: 'bold', fillColor: [220, 252, 231], textColor: [20, 83, 45] }
  });

  autoTable(doc, {
    startY: 72,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      halign: 'center',
    },
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: 'bold',
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(8.5);
  doc.text('Signature of MDM Incharge', 60, finalY);
  doc.text('Signature of Headmaster', pageWidth - 180, finalY);

  doc.save(`MDM_Monthly_Register_${year}_${monthName}.pdf`);
}

