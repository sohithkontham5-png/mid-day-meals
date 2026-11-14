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
  Calendar, 
  ChevronLeft, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
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
      <div className="print:hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Daily Master Register
            </span>
            {summary.is_sunday && (
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                Sunday
              </span>
            )}
            {summary.is_holiday && (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                Holiday: {summary.holiday_reason}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
            Daily Attendance & Meal Count Register
          </h2>
          <p className="text-xs text-slate-500">
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
            className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <button
            onClick={() => exportDailySummaryToExcel(summary, school, academicYear)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download formatted Excel file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportDailySummaryToPDF(summary, school, academicYear)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download PDF document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            title="Print-friendly view"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Register</span>
          </button>

          {currentUser.role === 'headmaster' && summary.entered_sections_count > 0 && (
            <div className="flex items-center space-x-1 border-l pl-2 ml-1">
              <button
                onClick={() => handleLockAllForDate(true)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
                title="Lock all entries for this date"
              >
                <Lock className="w-3 h-3" />
                <span>Lock All</span>
              </button>
              <button
                onClick={() => handleLockAllForDate(false)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
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
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Print Header */}
        <div className="hidden print:block text-center p-4 border-b border-slate-300">
          <h1 className="text-xl font-bold uppercase">{school.name}</h1>
          <h2 className="text-sm font-semibold uppercase mt-0.5">
            MID-DAY MEAL (MDM) DAILY REGISTER | DATE: {formatDateIndian(selectedDate)}
          </h2>
          <div className="text-xs text-slate-600 mt-0.5">
            Academic Year: {academicYear.name} • School Code: {school.code || '-'} • District: {school.district}, {school.state}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              {/* Top Header Row */}
              <tr className="bg-slate-800 text-white font-extrabold text-[11px] uppercase">
                <th rowSpan={2} className="py-2.5 px-3 text-left border-r border-slate-700 min-w-[130px]">
                  Class & Section
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-900/60">
                  SC
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-800/80">
                  ST
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-900/60">
                  BC
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-800/80">
                  OC
                </th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-emerald-800">
                  GENDER TOTALS
                </th>
                <th rowSpan={2} className="py-2.5 px-2 text-left min-w-[120px] print:hidden">
                  Remarks / Action
                </th>
              </tr>
              {/* Sub-Header Row */}
              <tr className="bg-slate-700 text-slate-200 font-bold text-[10px] uppercase border-b border-slate-600">
                <th className="py-1.5 px-1.5 border-r border-slate-600">B</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600">G</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600 bg-slate-800/90 text-white">Tot</th>

                <th className="py-1.5 px-1.5 border-r border-slate-600">B</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600">G</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600 bg-slate-800/90 text-white">Tot</th>

                <th className="py-1.5 px-1.5 border-r border-slate-600">B</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600">G</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600 bg-slate-800/90 text-white">Tot</th>

                <th className="py-1.5 px-1.5 border-r border-slate-600">B</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600">G</th>
                <th className="py-1.5 px-1.5 border-r border-slate-600 bg-slate-800/90 text-white">Tot</th>

                <th className="py-1.5 px-2 border-r border-slate-600 bg-emerald-900/80 text-white font-extrabold">Boys</th>
                <th className="py-1.5 px-2 border-r border-slate-600 bg-emerald-900/80 text-white font-extrabold">Girls</th>
                <th className="py-1.5 px-2.5 bg-emerald-600 text-white font-black">TOTAL</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              {/* GROUP 1: CLASSES 6, 7, 8 */}
              <tr className="bg-sky-50/80 text-sky-950 font-black text-left">
                <td colSpan={17} className="py-1.5 px-3 uppercase tracking-wider text-[11px]">
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
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-left font-semibold text-slate-800 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section A</span>
                          {!a && (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-slate-100">{a?.sc_boys ?? '-'}</td>
                        <td>{a?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.sc_total ?? '-'}</td>

                        <td>{a?.st_boys ?? '-'}</td>
                        <td>{a?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.st_total ?? '-'}</td>

                        <td>{a?.bc_boys ?? '-'}</td>
                        <td>{a?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.bc_total ?? '-'}</td>

                        <td>{a?.oc_boys ?? '-'}</td>
                        <td>{a?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-slate-800 bg-emerald-50/40">{a?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-slate-800 bg-emerald-50/40">{a?.totals.girls_total ?? '-'}</td>
                        <td className="font-black text-emerald-800 bg-emerald-50/80">{a?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-slate-500 truncate max-w-[120px] print:hidden">
                          {a ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{a.remarks || 'Recorded'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-emerald-700 hover:text-emerald-800 p-0.5"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                              className="text-amber-700 hover:underline font-bold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Section B */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-left font-semibold text-slate-800 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section B</span>
                          {!b && (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-slate-100">{b?.sc_boys ?? '-'}</td>
                        <td>{b?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.sc_total ?? '-'}</td>

                        <td>{b?.st_boys ?? '-'}</td>
                        <td>{b?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.st_total ?? '-'}</td>

                        <td>{b?.bc_boys ?? '-'}</td>
                        <td>{b?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.bc_total ?? '-'}</td>

                        <td>{b?.oc_boys ?? '-'}</td>
                        <td>{b?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-slate-800 bg-emerald-50/40">{b?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-slate-800 bg-emerald-50/40">{b?.totals.girls_total ?? '-'}</td>
                        <td className="font-black text-emerald-800 bg-emerald-50/80">{b?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-slate-500 truncate max-w-[120px] print:hidden">
                          {b ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{b.remarks || 'Recorded'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-emerald-700 hover:text-emerald-800 p-0.5"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                              className="text-amber-700 hover:underline font-bold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Class Combined Total (Feature #2) */}
                      <tr className="bg-slate-100/70 font-extrabold text-slate-900 border-b border-slate-200">
                        <td className="py-1.5 px-3 text-left uppercase text-[10.5px] text-slate-600">
                          Class {cls.class_number} Total (A + B)
                        </td>
                        <td className="border-l border-slate-200">{(a?.sc_boys ?? 0) + (b?.sc_boys ?? 0)}</td>
                        <td>{(a?.sc_girls ?? 0) + (b?.sc_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.sc_total}</td>

                        <td>{(a?.st_boys ?? 0) + (b?.st_boys ?? 0)}</td>
                        <td>{(a?.st_girls ?? 0) + (b?.st_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.st_total}</td>

                        <td>{(a?.bc_boys ?? 0) + (b?.bc_boys ?? 0)}</td>
                        <td>{(a?.bc_girls ?? 0) + (b?.bc_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.bc_total}</td>

                        <td>{(a?.oc_boys ?? 0) + (b?.oc_boys ?? 0)}</td>
                        <td>{(a?.oc_girls ?? 0) + (b?.oc_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.oc_total}</td>

                        <td className="bg-emerald-100/70 text-emerald-950 font-black">{cls.combined_totals.boys_total}</td>
                        <td className="bg-emerald-100/70 text-emerald-950 font-black">{cls.combined_totals.girls_total}</td>
                        <td className="bg-emerald-200/80 text-emerald-950 font-black">{cls.combined_totals.grand_total}</td>
                        <td className="print:hidden"></td>
                      </tr>
                    </React.Fragment>
                  );
                })}

              {/* Group 1 Subtotal (Classes 6-8) */}
              <tr className="bg-sky-100 font-black text-sky-950 border-t-2 border-sky-300">
                <td className="py-2.5 px-3 text-left uppercase text-xs">
                  GROUP 1 TOTAL (Classes 6-8)
                </td>
                <td className="border-l border-sky-200">-</td>
                <td>-</td>
                <td className="bg-sky-200/70 text-sky-950">{summary.group1_totals.sc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-sky-200/70 text-sky-950">{summary.group1_totals.st_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-sky-200/70 text-sky-950">{summary.group1_totals.bc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-sky-200/70 text-sky-950">{summary.group1_totals.oc_total}</td>

                <td className="bg-emerald-200/80 text-emerald-950 text-sm font-black">{summary.group1_totals.boys_total}</td>
                <td className="bg-emerald-200/80 text-emerald-950 text-sm font-black">{summary.group1_totals.girls_total}</td>
                <td className="bg-emerald-300 text-emerald-950 text-sm font-black">{summary.group1_totals.grand_total}</td>
                <td className="text-left px-2 text-[10px] text-sky-800 print:hidden">Upper Primary</td>
              </tr>

              {/* GROUP 2: CLASSES 9, 10 */}
              <tr className="bg-purple-50/80 text-purple-950 font-black text-left">
                <td colSpan={17} className="py-1.5 px-3 uppercase tracking-wider text-[11px]">
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
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-left font-semibold text-slate-800 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section A</span>
                          {!a && (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-slate-100">{a?.sc_boys ?? '-'}</td>
                        <td>{a?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.sc_total ?? '-'}</td>

                        <td>{a?.st_boys ?? '-'}</td>
                        <td>{a?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.st_total ?? '-'}</td>

                        <td>{a?.bc_boys ?? '-'}</td>
                        <td>{a?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.bc_total ?? '-'}</td>

                        <td>{a?.oc_boys ?? '-'}</td>
                        <td>{a?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{a?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-slate-800 bg-emerald-50/40">{a?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-slate-800 bg-emerald-50/40">{a?.totals.girls_total ?? '-'}</td>
                        <td className="font-black text-emerald-800 bg-emerald-50/80">{a?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-slate-500 truncate max-w-[120px] print:hidden">
                          {a ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{a.remarks || 'Recorded'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-emerald-700 hover:text-emerald-800 p-0.5"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                              className="text-amber-700 hover:underline font-bold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Section B */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-left font-semibold text-slate-800 flex items-center justify-between">
                          <span>Class {cls.class_number} - Section B</span>
                          {!b && (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 rounded print:hidden">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="border-l border-slate-100">{b?.sc_boys ?? '-'}</td>
                        <td>{b?.sc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.sc_total ?? '-'}</td>

                        <td>{b?.st_boys ?? '-'}</td>
                        <td>{b?.st_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.st_total ?? '-'}</td>

                        <td>{b?.bc_boys ?? '-'}</td>
                        <td>{b?.bc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.bc_total ?? '-'}</td>

                        <td>{b?.oc_boys ?? '-'}</td>
                        <td>{b?.oc_girls ?? '-'}</td>
                        <td className="font-bold bg-slate-50 text-slate-900 border-r border-slate-100">{b?.totals.oc_total ?? '-'}</td>

                        <td className="font-bold text-slate-800 bg-emerald-50/40">{b?.totals.boys_total ?? '-'}</td>
                        <td className="font-bold text-slate-800 bg-emerald-50/40">{b?.totals.girls_total ?? '-'}</td>
                        <td className="font-black text-emerald-800 bg-emerald-50/80">{b?.totals.grand_total ?? '-'}</td>

                        <td className="text-left px-2 text-[11px] text-slate-500 truncate max-w-[120px] print:hidden">
                          {b ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{b.remarks || 'Recorded'}</span>
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-emerald-700 hover:text-emerald-800 p-0.5"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                              className="text-amber-700 hover:underline font-bold"
                            >
                              Enter &rarr;
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Class Combined Total */}
                      <tr className="bg-slate-100/70 font-extrabold text-slate-900 border-b border-slate-200">
                        <td className="py-1.5 px-3 text-left uppercase text-[10.5px] text-slate-600">
                          Class {cls.class_number} Total (A + B)
                        </td>
                        <td className="border-l border-slate-200">{(a?.sc_boys ?? 0) + (b?.sc_boys ?? 0)}</td>
                        <td>{(a?.sc_girls ?? 0) + (b?.sc_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.sc_total}</td>

                        <td>{(a?.st_boys ?? 0) + (b?.st_boys ?? 0)}</td>
                        <td>{(a?.st_girls ?? 0) + (b?.st_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.st_total}</td>

                        <td>{(a?.bc_boys ?? 0) + (b?.bc_boys ?? 0)}</td>
                        <td>{(a?.bc_girls ?? 0) + (b?.bc_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.bc_total}</td>

                        <td>{(a?.oc_boys ?? 0) + (b?.oc_boys ?? 0)}</td>
                        <td>{(a?.oc_girls ?? 0) + (b?.oc_girls ?? 0)}</td>
                        <td className="bg-slate-200/60 font-black border-r border-slate-200">{cls.combined_totals.oc_total}</td>

                        <td className="bg-emerald-100/70 text-emerald-950 font-black">{cls.combined_totals.boys_total}</td>
                        <td className="bg-emerald-100/70 text-emerald-950 font-black">{cls.combined_totals.girls_total}</td>
                        <td className="bg-emerald-200/80 text-emerald-950 font-black">{cls.combined_totals.grand_total}</td>
                        <td className="print:hidden"></td>
                      </tr>
                    </React.Fragment>
                  );
                })}

              {/* Group 2 Subtotal (Classes 9-10) */}
              <tr className="bg-purple-100 font-black text-purple-950 border-t-2 border-purple-300">
                <td className="py-2.5 px-3 text-left uppercase text-xs">
                  GROUP 2 TOTAL (Classes 9-10)
                </td>
                <td className="border-l border-purple-200">-</td>
                <td>-</td>
                <td className="bg-purple-200/70 text-purple-950">{summary.group2_totals.sc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-purple-200/70 text-purple-950">{summary.group2_totals.st_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-purple-200/70 text-purple-950">{summary.group2_totals.bc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-purple-200/70 text-purple-950">{summary.group2_totals.oc_total}</td>

                <td className="bg-emerald-200/80 text-emerald-950 text-sm font-black">{summary.group2_totals.boys_total}</td>
                <td className="bg-emerald-200/80 text-emerald-950 text-sm font-black">{summary.group2_totals.girls_total}</td>
                <td className="bg-emerald-300 text-emerald-950 text-sm font-black">{summary.group2_totals.grand_total}</td>
                <td className="text-left px-2 text-[10px] text-purple-800 print:hidden">High School</td>
              </tr>

              {/* SCHOOL GRAND TOTAL ROW (All classes 6-10) */}
              <tr className="bg-emerald-600 text-white font-black border-t-4 border-emerald-700 text-sm">
                <td className="py-3 px-3 text-left uppercase tracking-wider">
                  SCHOOL GRAND TOTAL
                </td>
                <td className="border-l border-emerald-500">-</td>
                <td>-</td>
                <td className="bg-emerald-700">{summary.school_grand_totals.sc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-emerald-700">{summary.school_grand_totals.st_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-emerald-700">{summary.school_grand_totals.bc_total}</td>

                <td>-</td>
                <td>-</td>
                <td className="bg-emerald-700">{summary.school_grand_totals.oc_total}</td>

                <td className="bg-emerald-800 text-base">{summary.school_grand_totals.boys_total}</td>
                <td className="bg-emerald-800 text-base">{summary.school_grand_totals.girls_total}</td>
                <td className="bg-amber-400 text-slate-900 text-lg font-black">{summary.school_grand_totals.grand_total}</td>
                <td className="text-[11px] text-emerald-100 font-semibold text-left px-2 print:hidden">
                  {summary.entered_sections_count}/10 Sections
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Printable Footer Signatures */}
        <div className="hidden print:flex items-center justify-between p-8 pt-16 text-xs font-bold text-slate-800">
          <div>Signature of MDM Incharge / Cook</div>
          <div>Signature of Headmaster / Principal</div>
        </div>
      </div>
    </div>
  );
};

