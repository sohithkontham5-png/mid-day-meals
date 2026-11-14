import React, { useState, useEffect } from 'react';
import { DailySchoolSummary, User, School, AcademicYear } from '../types';
import { StorageService } from '../lib/storage';
import { getTodayDateStr, formatDateIndian, isSunday } from '../lib/calculations';
import { exportDailySummaryToExcel } from '../lib/excelExport';
import { exportDailySummaryToPDF } from '../lib/pdfExport';
import { 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Lock, 
  Unlock, 
  Edit3
} from 'lucide-react';

interface DailySummaryViewProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  initialDate?: string;
  onNavigateToEntry: (sectionId: string, date: string) => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  currentUser,
  school,
  academicYear,
  initialDate,
  onNavigateToEntry,
}) => {
  const todayStr = getTodayDateStr();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [summary, setSummary] = useState<DailySchoolSummary>(() =>
    StorageService.getDailySummary(selectedDate)
  );

  useEffect(() => {
    setSummary(StorageService.getDailySummary(selectedDate));
  }, [selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleLockAllForDate = (lock: boolean) => {
    if (currentUser.role !== 'headmaster') return;
    const entries = StorageService.getEntriesForDate(selectedDate);
    entries.forEach((e) => {
      StorageService.toggleEntryLock(e.id, lock, currentUser);
    });
    setSummary(StorageService.getDailySummary(selectedDate));
  };

  return (
    <div className="space-y-6 pb-16 print:p-0">
      {/* Controls Bar (Hidden during printing) */}
      <div className="print:hidden bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              Daily Master Register
            </span>
            {summary.is_sunday && (
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                Sunday
              </span>
            )}
            {summary.is_holiday && (
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded">
                Holiday: {summary.holiday_reason}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
            Daily Attendance & Meal Breakdown
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {formatDateIndian(selectedDate)} • Entered Sections: {summary.entered_sections_count} of {summary.total_sections_count}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />

          <button
            onClick={() => exportDailySummaryToExcel(summary, school, academicYear)}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download formatted Excel file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportDailySummaryToPDF(summary, school, academicYear)}
            className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download PDF document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Print-friendly view"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {currentUser.role === 'headmaster' && summary.entered_sections_count > 0 && (
            <div className="flex items-center space-x-1 border-l border-zinc-200 pl-2 ml-1">
              <button
                onClick={() => handleLockAllForDate(true)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
                title="Lock all entries for this date"
              >
                <Lock className="w-3 h-3" />
                <span>Lock All</span>
              </button>
              <button
                onClick={() => handleLockAllForDate(false)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
                title="Unlock all entries for this date"
              >
                <Unlock className="w-3 h-3" />
                <span>Unlock All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Printable / Display Daily Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Print Header */}
        <div className="hidden print:block text-center p-4 border-b border-zinc-300">
          <h1 className="text-xl font-bold uppercase">{school.name}</h1>
          <h2 className="text-sm font-semibold uppercase mt-0.5">
            MID-DAY MEAL (MDM) DAILY REGISTER | DATE: {formatDateIndian(selectedDate)}
          </h2>
          <div className="text-xs text-zinc-600 mt-0.5 font-mono">
            Academic Year: {academicYear.name} • School Code: {school.code || '-'} • District: {school.district}, {school.state}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              {/* Top Header Row */}
              <tr className="bg-zinc-100 text-zinc-800 font-bold text-[11px] uppercase border-b border-zinc-200">
                <th rowSpan={2} className="py-2.5 px-3 text-left border-r border-zinc-200 min-w-[130px]">
                  Class & Section
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-50">
                  SC
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-100/60">
                  ST
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-50">
                  BC
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-100/60">
                  OC
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-200/70 text-zinc-950 font-extrabold">
                  TOTALS
                </th>
                <th rowSpan={2} className="py-2.5 px-2 text-left min-w-[120px] print:hidden">
                  Remarks / Action
                </th>
              </tr>
              {/* Sub-Header Row */}
              <tr className="bg-zinc-50 text-zinc-600 font-mono text-[10px] uppercase border-b border-zinc-200">
                <th className="py-1.5 px-1.5 border-r border-zinc-200">B</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200">G</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                <th className="py-1.5 px-1.5 border-r border-zinc-200">B</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200">G</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                <th className="py-1.5 px-1.5 border-r border-zinc-200">B</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200">G</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                <th className="py-1.5 px-1.5 border-r border-zinc-200">B</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200">G</th>
                <th className="py-1.5 px-1.5 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                <th className="py-1.5 px-2 border-r border-zinc-200 font-bold text-zinc-900">Boys</th>
                <th className="py-1.5 px-2 border-r border-zinc-200 font-bold text-zinc-900">Girls</th>
                <th className="py-1.5 px-2.5 bg-zinc-900 text-white font-extrabold">TOTAL</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 text-zinc-700 font-mono">
              {/* GROUP 1: CLASSES 6, 7, 8 */}
              <tr className="bg-zinc-50 text-zinc-900 font-bold font-sans text-left">
                <td colSpan={17} className="py-1.5 px-3 uppercase tracking-wider text-[11px] border-b border-zinc-200">
                  Group 1: Upper Primary (Classes 6, 7, 8)
                </td>
              </tr>

              {summary.classes
                .filter((c) => c.group_code === 'G1')
                .map((cls) => {
                  const a = cls.section_a;
                  const b = cls.section_b;
                  return (
                    <React.Fragment key={cls.class_number}>
                      {/* Section A */}
                      <tr className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2 px-3 text-left font-sans font-medium text-zinc-900 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section A</span>
                          {!a && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-zinc-100">{a?.sc_boys ?? '-'}</td>
                        <td>{a?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.sc_total ?? '-'}</td>

                        <td>{a?.st_boys ?? '-'}</td>
                        <td>{a?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.st_total ?? '-'}</td>

                        <td>{a?.bc_boys ?? '-'}</td>
                        <td>{a?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.bc_total ?? '-'}</td>

                        <td>{a?.oc_boys ?? '-'}</td>
                        <td>{a?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{a?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{a?.totals.girls_total ?? '-'}</td>
                        <td className="font-bold text-zinc-950 bg-zinc-100/70">{a?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-zinc-500 font-sans truncate max-w-[120px] print:hidden">
                          {a ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{a.remarks || 'Done'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                              className="text-zinc-900 underline font-semibold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Section B */}
                      <tr className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2 px-3 text-left font-sans font-medium text-zinc-900 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section B</span>
                          {!b && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-zinc-100">{b?.sc_boys ?? '-'}</td>
                        <td>{b?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.sc_total ?? '-'}</td>

                        <td>{b?.st_boys ?? '-'}</td>
                        <td>{b?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.st_total ?? '-'}</td>

                        <td>{b?.bc_boys ?? '-'}</td>
                        <td>{b?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.bc_total ?? '-'}</td>

                        <td>{b?.oc_boys ?? '-'}</td>
                        <td>{b?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{b?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{b?.totals.girls_total ?? '-'}</td>
                        <td className="font-bold text-zinc-950 bg-zinc-100/70">{b?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-zinc-500 font-sans truncate max-w-[120px] print:hidden">
                          {b ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{b.remarks || 'Done'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                              className="text-zinc-900 underline font-semibold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Class Combined Total */}
                      <tr className="bg-zinc-100/70 font-bold text-zinc-950 border-b border-zinc-200">
                        <td className="py-1.5 px-3 text-left font-sans uppercase text-[10.5px] text-zinc-600">
                          Class {cls.class_number} Total (A + B)
                        </td>
                        <td className="border-l border-zinc-200">{(a?.sc_boys ?? 0) + (b?.sc_boys ?? 0)}</td>
                        <td>{(a?.sc_girls ?? 0) + (b?.sc_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.sc_total}</td>

                        <td>{(a?.st_boys ?? 0) + (b?.st_boys ?? 0)}</td>
                        <td>{(a?.st_girls ?? 0) + (b?.st_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.st_total}</td>

                        <td>{(a?.bc_boys ?? 0) + (b?.bc_boys ?? 0)}</td>
                        <td>{(a?.bc_girls ?? 0) + (b?.bc_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.bc_total}</td>

                        <td>{(a?.oc_boys ?? 0) + (b?.oc_boys ?? 0)}</td>
                        <td>{(a?.oc_girls ?? 0) + (b?.oc_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.oc_total}</td>

                        <td className="bg-zinc-200/60">{cls.combined_totals.boys_total}</td>
                        <td className="bg-zinc-200/60">{cls.combined_totals.girls_total}</td>
                        <td className="bg-zinc-200 text-zinc-950 font-extrabold">{cls.combined_totals.grand_total}</td>
                        <td className="print:hidden"></td>
                      </tr>
                    </React.Fragment>
                  );
                })}

              {/* Group 1 Subtotal */}
              <tr className="bg-zinc-200 text-zinc-950 font-bold border-t-2 border-zinc-300">
                <td className="py-2 px-3 text-left font-sans uppercase text-xs">
                  GROUP 1 TOTAL (Classes 6-8)
                </td>
                <td className="border-l border-zinc-300">-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group1_totals.sc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group1_totals.st_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group1_totals.bc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group1_totals.oc_total}</td>

                <td className="font-extrabold">{summary.group1_totals.boys_total}</td>
                <td className="font-extrabold">{summary.group1_totals.girls_total}</td>
                <td className="bg-zinc-900 text-white font-extrabold">{summary.group1_totals.grand_total}</td>
                <td className="text-left px-2 text-[10px] text-zinc-600 font-sans print:hidden">Upper Primary</td>
              </tr>

              {/* GROUP 2: CLASSES 9, 10 */}
              <tr className="bg-zinc-50 text-zinc-900 font-bold font-sans text-left">
                <td colSpan={17} className="py-1.5 px-3 uppercase tracking-wider text-[11px] border-b border-zinc-200">
                  Group 2: High School (Classes 9, 10)
                </td>
              </tr>

              {summary.classes
                .filter((c) => c.group_code === 'G2')
                .map((cls) => {
                  const a = cls.section_a;
                  const b = cls.section_b;
                  return (
                    <React.Fragment key={cls.class_number}>
                      {/* Section A */}
                      <tr className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2 px-3 text-left font-sans font-medium text-zinc-900 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section A</span>
                          {!a && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-zinc-100">{a?.sc_boys ?? '-'}</td>
                        <td>{a?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.sc_total ?? '-'}</td>

                        <td>{a?.st_boys ?? '-'}</td>
                        <td>{a?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.st_total ?? '-'}</td>

                        <td>{a?.bc_boys ?? '-'}</td>
                        <td>{a?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.bc_total ?? '-'}</td>

                        <td>{a?.oc_boys ?? '-'}</td>
                        <td>{a?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{a?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{a?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{a?.totals.girls_total ?? '-'}</td>
                        <td className="font-bold text-zinc-950 bg-zinc-100/70">{a?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-zinc-500 font-sans truncate max-w-[120px] print:hidden">
                          {a ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{a.remarks || 'Done'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                              className="text-zinc-900 underline font-semibold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Section B */}
                      <tr className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2 px-3 text-left font-sans font-medium text-zinc-900 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section B</span>
                          {!b && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-zinc-100">{b?.sc_boys ?? '-'}</td>
                        <td>{b?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.sc_total ?? '-'}</td>

                        <td>{b?.st_boys ?? '-'}</td>
                        <td>{b?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.st_total ?? '-'}</td>

                        <td>{b?.bc_boys ?? '-'}</td>
                        <td>{b?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.bc_total ?? '-'}</td>

                        <td>{b?.oc_boys ?? '-'}</td>
                        <td>{b?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-zinc-50 text-zinc-950 border-r border-zinc-100">{b?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{b?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-zinc-900 border-r border-zinc-100">{b?.totals.girls_total ?? '-'}</td>
                        <td className="font-bold text-zinc-950 bg-zinc-100/70">{b?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-zinc-500 font-sans truncate max-w-[120px] print:hidden">
                          {b ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{b.remarks || 'Done'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                              className="text-zinc-900 underline font-semibold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Class Combined Total */}
                      <tr className="bg-zinc-100/70 font-bold text-zinc-950 border-b border-zinc-200">
                        <td className="py-1.5 px-3 text-left font-sans uppercase text-[10.5px] text-zinc-600">
                          Class {cls.class_number} Total (A + B)
                        </td>
                        <td className="border-l border-zinc-200">{(a?.sc_boys ?? 0) + (b?.sc_boys ?? 0)}</td>
                        <td>{(a?.sc_girls ?? 0) + (b?.sc_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.sc_total}</td>

                        <td>{(a?.st_boys ?? 0) + (b?.st_boys ?? 0)}</td>
                        <td>{(a?.st_girls ?? 0) + (b?.st_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.st_total}</td>

                        <td>{(a?.bc_boys ?? 0) + (b?.bc_boys ?? 0)}</td>
                        <td>{(a?.bc_girls ?? 0) + (b?.bc_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.bc_total}</td>

                        <td>{(a?.oc_boys ?? 0) + (b?.oc_boys ?? 0)}</td>
                        <td>{(a?.oc_girls ?? 0) + (b?.oc_girls ?? 0)}</td>
                        <td className="bg-zinc-200/50 border-r border-zinc-200">{cls.combined_totals.oc_total}</td>

                        <td className="bg-zinc-200/60">{cls.combined_totals.boys_total}</td>
                        <td className="bg-zinc-200/60">{cls.combined_totals.girls_total}</td>
                        <td className="bg-zinc-200 text-zinc-950 font-extrabold">{cls.combined_totals.grand_total}</td>
                        <td className="print:hidden"></td>
                      </tr>
                    </React.Fragment>
                  );
                })}

              {/* Group 2 Subtotal */}
              <tr className="bg-zinc-200 text-zinc-950 font-bold border-t-2 border-zinc-300">
                <td className="py-2 px-3 text-left font-sans uppercase text-xs">
                  GROUP 2 TOTAL (Classes 9-10)
                </td>
                <td className="border-l border-zinc-300">-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group2_totals.sc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group2_totals.st_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group2_totals.bc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-300/60">{summary.group2_totals.oc_total}</td>

                <td className="font-extrabold">{summary.group2_totals.boys_total}</td>
                <td className="font-extrabold">{summary.group2_totals.girls_total}</td>
                <td className="bg-zinc-900 text-white font-extrabold">{summary.group2_totals.grand_total}</td>
                <td className="text-left px-2 text-[10px] text-zinc-600 font-sans print:hidden">High School</td>
              </tr>

              {/* SCHOOL GRAND TOTAL ROW */}
              <tr className="bg-black text-white font-bold border-t-2 border-black text-sm">
                <td className="py-3 px-3 text-left font-sans uppercase tracking-wider">
                  SCHOOL GRAND TOTAL
                </td>
                <td className="border-l border-zinc-800">-</td>
                <td>-</td>
                <td className="bg-zinc-900">{summary.school_grand_totals.sc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-900">{summary.school_grand_totals.st_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-900">{summary.school_grand_totals.bc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-zinc-900">{summary.school_grand_totals.oc_total}</td>

                <td className="font-extrabold">{summary.school_grand_totals.boys_total}</td>
                <td className="font-extrabold">{summary.school_grand_totals.girls_total}</td>
                <td className="bg-zinc-800 text-white font-black text-base">{summary.school_grand_totals.grand_total}</td>
                <td className="text-[11px] text-zinc-400 font-sans font-medium text-left px-2 print:hidden">
                  {summary.entered_sections_count}/10 Done
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Printable Signatures */}
        <div className="hidden print:flex items-center justify-between p-8 pt-16 text-xs font-bold text-zinc-950 font-sans">
          <div>Signature of MDM Incharge / Cook</div>
          <div>Signature of Headmaster / Principal</div>
        </div>
      </div>
    </div>
  );
};
