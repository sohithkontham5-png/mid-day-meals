import React, { useState, useEffect } from 'react';
import { DailySchoolSummary, User, School, AcademicYear } from '../types';
import { StorageService } from '../lib/storage';
import { getTodayDateStr, formatDateIndian } from '../lib/calculations';
import { exportDailySummaryToExcel } from '../lib/excelExport';
import { exportDailySummaryToPDF } from '../lib/pdfExport';
import { 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Lock, 
  Unlock, 
  Edit3, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Table as TableIcon,
  Users,
  Utensils,
  Sun,
  AlertCircle
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
  const [viewMode, setViewMode] = useState<'cards' | 'register'>('cards');
  const [summary, setSummary] = useState<DailySchoolSummary>(() =>
    StorageService.getDailySummary(selectedDate)
  );

  useEffect(() => {
    setSummary(StorageService.getDailySummary(selectedDate));
  }, [selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    if (selectedDate >= todayStr) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleLockAllForDate = (lock: boolean) => {
    if (currentUser.role !== 'headmaster') return;
    const entries = StorageService.getEntriesForDate(selectedDate);
    entries.forEach((e) => {
      StorageService.toggleEntryLock(e.id, lock, currentUser);
    });
    setSummary(StorageService.getDailySummary(selectedDate));
  };

  // Calculations for executive cards
  const grandTotal = summary.school_grand_totals.grand_total;
  const boysTotal = summary.school_grand_totals.boys_total;
  const girlsTotal = summary.school_grand_totals.girls_total;
  const boysPercent = grandTotal > 0 ? Math.round((boysTotal / grandTotal) * 100) : 0;
  const girlsPercent = grandTotal > 0 ? 100 - boysPercent : 0;

  const scTotal = summary.school_grand_totals.sc_total;
  const stTotal = summary.school_grand_totals.st_total;
  const bcTotal = summary.school_grand_totals.bc_total;
  const ocTotal = summary.school_grand_totals.oc_total;

  const g1Total = summary.group1_totals.grand_total;
  const g2Total = summary.group2_totals.grand_total;
  const g1Percent = grandTotal > 0 ? Math.round((g1Total / grandTotal) * 100) : 0;
  const g2Percent = grandTotal > 0 ? 100 - g1Percent : 0;

  return (
    <div className="space-y-6 pb-20 print:p-0">
      {/* Controls Bar (Hidden during printing) */}
      <div className="print:hidden bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              Daily Summary
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
            {summary.entered_sections_count === 10 ? (
              <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>All 10 Sections Recorded</span>
              </span>
            ) : summary.entered_sections_count > 0 ? (
              <span className="text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{summary.entered_sections_count} / 10 Sections Done</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                Pending Entry
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
            {formatDateIndian(selectedDate)}
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {school.name} • AY {academicYear.name}
          </p>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Navigation */}
          <div className="flex items-center space-x-1 bg-white border border-zinc-200 p-0.5 rounded-lg shadow-sm">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-xs font-mono bg-transparent border-none text-zinc-900 focus:outline-none cursor-pointer"
            />
            <button
              onClick={handleNextDay}
              disabled={selectedDate >= todayStr}
              className={`p-1.5 rounded transition-colors ${
                selectedDate >= todayStr
                  ? 'text-zinc-300 cursor-not-allowed'
                  : 'hover:bg-zinc-100 text-zinc-600'
              }`}
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('register')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'register'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Exports */}
          <button
            onClick={() => exportDailySummaryToExcel(summary, school, academicYear)}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={() => exportDailySummaryToPDF(summary, school, academicYear)}
            className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Lock / Unlock (Headmaster only) */}
          {currentUser.role === 'headmaster' && summary.entered_sections_count > 0 && (
            <div className="flex items-center space-x-1 border-l border-zinc-200 pl-2">
              <button
                onClick={() => handleLockAllForDate(true)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-medium px-2 py-1.5 rounded-lg flex items-center space-x-1"
                title="Lock all entries for this date"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden md:inline">Lock All</span>
              </button>
              <button
                onClick={() => handleLockAllForDate(false)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-medium px-2 py-1.5 rounded-lg flex items-center space-x-1"
                title="Unlock all entries for this date"
              >
                <Unlock className="w-3 h-3" />
                <span className="hidden md:inline">Unlock All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Holiday / Sunday Notice Banner */}
      {(summary.is_sunday || summary.is_holiday) && (
        <div className="print:hidden bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0">
            {summary.is_sunday ? <Sun className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-semibold text-sm text-zinc-900">
              {summary.is_sunday ? 'Sunday — Weekly School Holiday' : `School Holiday: ${summary.holiday_reason}`}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              No mid-day meal session is scheduled for this day. Entries are not marked as pending.
            </div>
          </div>
        </div>
      )}

      {/* Executive Key Metric Cards (Clean, Modern, Visual) */}
      <div className="print:hidden grid grid-cols-1 gap-3">
        {/* Card 1: Grand Total Meals */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Today's Meals</span>
              <Utensils className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-zinc-950 mt-2">
              {grandTotal}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Coverage</span>
            <span className="font-semibold text-zinc-900">{summary.entered_sections_count} / 10 Sections</span>
          </div>
        </div>

        {/* Card 2: Gender Ratio Split */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Gender Breakdown</span>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <div className="text-xl font-bold font-mono text-zinc-900">
                {boysTotal} <span className="text-xs font-normal text-zinc-500 font-sans">Boys ({boysPercent}%)</span>
              </div>
              <span className="text-zinc-300">/</span>
              <div className="text-xl font-bold font-mono text-zinc-900">
                {girlsTotal} <span className="text-xs font-normal text-zinc-500 font-sans">Girls ({girlsPercent}%)</span>
              </div>
            </div>
          </div>
          {/* Visual Ratio Bar */}
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex">
              <div 
                style={{ width: `${boysPercent}%` }} 
                className="bg-black h-full transition-all" 
                title={`Boys: ${boysTotal} (${boysPercent}%)`} 
              />
              <div 
                style={{ width: `${girlsPercent}%` }} 
                className="bg-zinc-400 h-full transition-all" 
                title={`Girls: ${girlsTotal} (${girlsPercent}%)`} 
              />
            </div>
          </div>
        </div>

        {/* Card 3: Group Distribution */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Group Split</span>
              <span className="text-[10px] font-mono text-zinc-400">G1: 6-8 • G2: 9-10</span>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <div className="text-xl font-bold font-mono text-zinc-900">
                {g1Total} <span className="text-xs font-normal text-zinc-500 font-sans">G1 ({g1Percent}%)</span>
              </div>
              <span className="text-zinc-300">/</span>
              <div className="text-xl font-bold font-mono text-zinc-900">
                {g2Total} <span className="text-xs font-normal text-zinc-500 font-sans">G2 ({g2Percent}%)</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex">
              <div 
                style={{ width: `${g1Percent}%` }} 
                className="bg-zinc-800 h-full transition-all" 
                title={`Group 1: ${g1Total}`} 
              />
              <div 
                style={{ width: `${g2Percent}%` }} 
                className="bg-zinc-300 h-full transition-all" 
                title={`Group 2: ${g2Total}`} 
              />
            </div>
          </div>
        </div>

        {/* Card 4: Caste Breakdown Chips */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Social Category</span>
              <span className="text-[10px] font-mono text-zinc-400">SC / ST / BC / OC</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">SC</div>
                <div className="text-sm font-bold font-mono text-zinc-900">{scTotal}</div>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">ST</div>
                <div className="text-sm font-bold font-mono text-zinc-900">{stTotal}</div>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">BC</div>
                <div className="text-sm font-bold font-mono text-zinc-900">{bcTotal}</div>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">OC</div>
                <div className="text-sm font-bold font-mono text-zinc-900">{ocTotal}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Caste Total</span>
            <span className="font-semibold text-zinc-900">{scTotal + stTotal + bcTotal + ocTotal}</span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: EXECUTIVE CARDS (Default, clean modern UI) */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {/* GROUP 1: CLASSES 6, 7, 8 */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="bg-zinc-50 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black" />
                <h3 className="font-bold text-sm text-zinc-950 uppercase tracking-wide">
                  Group 1: Upper Primary (Classes 6, 7, 8)
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-zinc-500">Boys: <strong className="text-zinc-900">{summary.group1_totals.boys_total}</strong></span>
                <span className="text-zinc-500">Girls: <strong className="text-zinc-900">{summary.group1_totals.girls_total}</strong></span>
                <span className="bg-black text-white px-2 py-0.5 rounded font-bold">
                  {summary.group1_totals.grand_total} Meals
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {summary.classes
                .filter((c) => c.group_code === 'G1')
                .map((cls) => {
                  const a = cls.section_a;
                  const b = cls.section_b;
                  const combined = cls.combined_totals;

                  return (
                    <div 
                      key={cls.class_number} 
                      className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/40 hover:bg-zinc-50 transition-colors"
                    >
                      {/* Class Header */}
                      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
                            {cls.class_number}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-zinc-900">Class {cls.class_number}</span>
                            <span className="text-xs text-zinc-400 font-mono ml-2">Section A & B</span>
                          </div>
                        </div>

                        {/* Combined Class Total Badge */}
                        <div className="flex items-center space-x-3 text-xs font-mono">
                          <span className="text-zinc-500 hidden sm:inline">Class Total:</span>
                          <span className="font-bold text-sm bg-white border border-zinc-200 px-2.5 py-0.5 rounded-lg text-zinc-950 shadow-xs">
                            {combined.grand_total} Meals
                          </span>
                        </div>
                      </div>

                      {/* Sections Grid: Section A & Section B */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Section A */}
                        <div className={`p-3.5 rounded-lg border transition-all ${
                          a 
                            ? 'bg-white border-zinc-200 shadow-xs' 
                            : 'bg-zinc-50/80 border-dashed border-zinc-300'
                        }`}>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-zinc-900">Section A</span>
                              {a ? (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Recorded
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                                  Pending
                                </span>
                              )}
                            </div>

                            {a ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-500 hover:text-black flex items-center space-x-1 text-xs font-medium"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-black hover:underline flex items-center space-x-1 text-xs font-semibold"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Record</span>
                              </button>
                            )}
                          </div>

                          {a ? (
                            <div className="space-y-2">
                              <div className="flex items-baseline justify-between">
                                <div className="text-lg font-bold font-mono text-zinc-950">
                                  {a.totals.grand_total} <span className="text-xs font-normal text-zinc-500 font-sans">meals</span>
                                </div>
                                <div className="text-xs font-mono text-zinc-500">
                                  Boys: <strong className="text-zinc-900">{a.totals.boys_total}</strong> • Girls: <strong className="text-zinc-900">{a.totals.girls_total}</strong>
                                </div>
                              </div>
                              {/* Caste chips */}
                              <div className="flex items-center space-x-1.5 text-[11px] font-mono pt-1 text-zinc-600">
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">SC: {a.totals.sc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">ST: {a.totals.st_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">BC: {a.totals.bc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">OC: {a.totals.oc_total}</span>
                              </div>
                              {a.remarks && (
                                <div className="text-[11px] text-zinc-500 italic mt-1 truncate">
                                  Note: {a.remarks}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-zinc-400 py-2 text-center font-mono">
                              No meal count recorded for Section A today
                            </div>
                          )}
                        </div>

                        {/* Section B */}
                        <div className={`p-3.5 rounded-lg border transition-all ${
                          b 
                            ? 'bg-white border-zinc-200 shadow-xs' 
                            : 'bg-zinc-50/80 border-dashed border-zinc-300'
                        }`}>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-zinc-900">Section B</span>
                              {b ? (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Recorded
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                                  Pending
                                </span>
                              )}
                            </div>

                            {b ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-500 hover:text-black flex items-center space-x-1 text-xs font-medium"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-black hover:underline flex items-center space-x-1 text-xs font-semibold"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Record</span>
                              </button>
                            )}
                          </div>

                          {b ? (
                            <div className="space-y-2">
                              <div className="flex items-baseline justify-between">
                                <div className="text-lg font-bold font-mono text-zinc-950">
                                  {b.totals.grand_total} <span className="text-xs font-normal text-zinc-500 font-sans">meals</span>
                                </div>
                                <div className="text-xs font-mono text-zinc-500">
                                  Boys: <strong className="text-zinc-900">{b.totals.boys_total}</strong> • Girls: <strong className="text-zinc-900">{b.totals.girls_total}</strong>
                                </div>
                              </div>
                              {/* Caste chips */}
                              <div className="flex items-center space-x-1.5 text-[11px] font-mono pt-1 text-zinc-600">
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">SC: {b.totals.sc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">ST: {b.totals.st_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">BC: {b.totals.bc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">OC: {b.totals.oc_total}</span>
                              </div>
                              {b.remarks && (
                                <div className="text-[11px] text-zinc-500 italic mt-1 truncate">
                                  Note: {b.remarks}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-zinc-400 py-2 text-center font-mono">
                              No meal count recorded for Section B today
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* GROUP 2: CLASSES 9, 10 */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="bg-zinc-50 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black" />
                <h3 className="font-bold text-sm text-zinc-950 uppercase tracking-wide">
                  Group 2: High School (Classes 9, 10)
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-zinc-500">Boys: <strong className="text-zinc-900">{summary.group2_totals.boys_total}</strong></span>
                <span className="text-zinc-500">Girls: <strong className="text-zinc-900">{summary.group2_totals.girls_total}</strong></span>
                <span className="bg-black text-white px-2 py-0.5 rounded font-bold">
                  {summary.group2_totals.grand_total} Meals
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {summary.classes
                .filter((c) => c.group_code === 'G2')
                .map((cls) => {
                  const a = cls.section_a;
                  const b = cls.section_b;
                  const combined = cls.combined_totals;

                  return (
                    <div 
                      key={cls.class_number} 
                      className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/40 hover:bg-zinc-50 transition-colors"
                    >
                      {/* Class Header */}
                      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
                            {cls.class_number}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-zinc-900">Class {cls.class_number}</span>
                            <span className="text-xs text-zinc-400 font-mono ml-2">Section A & B</span>
                          </div>
                        </div>

                        {/* Combined Class Total Badge */}
                        <div className="flex items-center space-x-3 text-xs font-mono">
                          <span className="text-zinc-500 hidden sm:inline">Class Total:</span>
                          <span className="font-bold text-sm bg-white border border-zinc-200 px-2.5 py-0.5 rounded-lg text-zinc-950 shadow-xs">
                            {combined.grand_total} Meals
                          </span>
                        </div>
                      </div>

                      {/* Sections Grid: Section A & Section B */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Section A */}
                        <div className={`p-3.5 rounded-lg border transition-all ${
                          a 
                            ? 'bg-white border-zinc-200 shadow-xs' 
                            : 'bg-zinc-50/80 border-dashed border-zinc-300'
                        }`}>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-zinc-900">Section A</span>
                              {a ? (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Recorded
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                                  Pending
                                </span>
                              )}
                            </div>

                            {a ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-500 hover:text-black flex items-center space-x-1 text-xs font-medium"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-black hover:underline flex items-center space-x-1 text-xs font-semibold"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Record</span>
                              </button>
                            )}
                          </div>

                          {a ? (
                            <div className="space-y-2">
                              <div className="flex items-baseline justify-between">
                                <div className="text-lg font-bold font-mono text-zinc-950">
                                  {a.totals.grand_total} <span className="text-xs font-normal text-zinc-500 font-sans">meals</span>
                                </div>
                                <div className="text-xs font-mono text-zinc-500">
                                  Boys: <strong className="text-zinc-900">{a.totals.boys_total}</strong> • Girls: <strong className="text-zinc-900">{a.totals.girls_total}</strong>
                                </div>
                              </div>
                              {/* Caste chips */}
                              <div className="flex items-center space-x-1.5 text-[11px] font-mono pt-1 text-zinc-600">
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">SC: {a.totals.sc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">ST: {a.totals.st_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">BC: {a.totals.bc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">OC: {a.totals.oc_total}</span>
                              </div>
                              {a.remarks && (
                                <div className="text-[11px] text-zinc-500 italic mt-1 truncate">
                                  Note: {a.remarks}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-zinc-400 py-2 text-center font-mono">
                              No meal count recorded for Section A today
                            </div>
                          )}
                        </div>

                        {/* Section B */}
                        <div className={`p-3.5 rounded-lg border transition-all ${
                          b 
                            ? 'bg-white border-zinc-200 shadow-xs' 
                            : 'bg-zinc-50/80 border-dashed border-zinc-300'
                        }`}>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-zinc-900">Section B</span>
                              {b ? (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Recorded
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                                  Pending
                                </span>
                              )}
                            </div>

                            {b ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-500 hover:text-black flex items-center space-x-1 text-xs font-medium"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-black hover:underline flex items-center space-x-1 text-xs font-semibold"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Record</span>
                              </button>
                            )}
                          </div>

                          {b ? (
                            <div className="space-y-2">
                              <div className="flex items-baseline justify-between">
                                <div className="text-lg font-bold font-mono text-zinc-950">
                                  {b.totals.grand_total} <span className="text-xs font-normal text-zinc-500 font-sans">meals</span>
                                </div>
                                <div className="text-xs font-mono text-zinc-500">
                                  Boys: <strong className="text-zinc-900">{b.totals.boys_total}</strong> • Girls: <strong className="text-zinc-900">{b.totals.girls_total}</strong>
                                </div>
                              </div>
                              {/* Caste chips */}
                              <div className="flex items-center space-x-1.5 text-[11px] font-mono pt-1 text-zinc-600">
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">SC: {b.totals.sc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">ST: {b.totals.st_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">BC: {b.totals.bc_total}</span>
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">OC: {b.totals.oc_total}</span>
                              </div>
                              {b.remarks && (
                                <div className="text-[11px] text-zinc-500 italic mt-1 truncate">
                                  Note: {b.remarks}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-zinc-400 py-2 text-center font-mono">
                              No meal count recorded for Section B today
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FORMAL OFFICIAL REGISTER TABLE (For inspection & printing) */}
      {(viewMode === 'register' || true) && (
        <div className={`bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none ${viewMode !== 'register' ? 'hidden print:block' : ''}`}>
          {/* Print Formal Header */}
          <div className="text-center p-5 border-b border-zinc-200 bg-zinc-50/50">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-950">
              {school.name}
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-700 mt-1">
              MID-DAY MEAL (MDM) DAILY ATTENDANCE & CONSUMPTION REGISTER
            </h2>
            <div className="text-xs text-zinc-500 mt-1 font-mono">
              Date: <strong className="text-zinc-900">{formatDateIndian(selectedDate)}</strong> • Academic Year: {academicYear.name} • School Code: {school.code || '-'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                {/* Top Header Row */}
                <tr className="bg-zinc-100 text-zinc-800 font-bold text-[11px] uppercase border-b border-zinc-200">
                  <th rowSpan={2} className="py-2.5 px-3 text-left border-r border-zinc-200 min-w-[140px]">
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
                  <th rowSpan={2} className="py-2.5 px-2 text-left min-w-[110px] print:hidden">
                    Action
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
                  <th className="py-1.5 px-2.5 bg-black text-white font-extrabold">TOTAL</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 text-zinc-700 font-mono">
                {/* GROUP 1: CLASSES 6, 7, 8 */}
                <tr className="bg-zinc-100/90 text-zinc-900 font-bold font-sans text-left">
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

                          <td className="text-left px-2 text-[11px] text-zinc-500 font-sans print:hidden">
                            {a ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5 flex items-center space-x-1"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-900 underline font-semibold text-xs"
                              >
                                Record &rarr;
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

                          <td className="text-left px-2 text-[11px] text-zinc-500 font-sans print:hidden">
                            {b ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5 flex items-center space-x-1"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-900 underline font-semibold text-xs"
                              >
                                Record &rarr;
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Class Combined Total */}
                        <tr className="bg-zinc-100/70 font-bold text-zinc-950 border-b border-zinc-200">
                          <td className="py-1.5 px-3 text-left font-sans uppercase text-[10.5px] text-zinc-600">
                            Class {cls.class_number} Combined (A + B)
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
                  <td className="bg-black text-white font-extrabold">{summary.group1_totals.grand_total}</td>
                  <td className="text-left px-2 text-[10px] text-zinc-600 font-sans print:hidden">Upper Primary</td>
                </tr>

                {/* GROUP 2: CLASSES 9, 10 */}
                <tr className="bg-zinc-100/90 text-zinc-900 font-bold font-sans text-left">
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

                          <td className="text-left px-2 text-[11px] text-zinc-500 font-sans print:hidden">
                            {a ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5 flex items-center space-x-1"
                                title="Edit Section A"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}A`, selectedDate)}
                                className="text-zinc-900 underline font-semibold text-xs"
                              >
                                Record &rarr;
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

                          <td className="text-left px-2 text-[11px] text-zinc-500 font-sans print:hidden">
                            {b ? (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-600 hover:text-black p-0.5 flex items-center space-x-1"
                                title="Edit Section B"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigateToEntry(`sec-${cls.class_number}B`, selectedDate)}
                                className="text-zinc-900 underline font-semibold text-xs"
                              >
                                Record &rarr;
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Class Combined Total */}
                        <tr className="bg-zinc-100/70 font-bold text-zinc-950 border-b border-zinc-200">
                          <td className="py-1.5 px-3 text-left font-sans uppercase text-[10.5px] text-zinc-600">
                            Class {cls.class_number} Combined (A + B)
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
                  <td className="bg-black text-white font-extrabold">{summary.group2_totals.grand_total}</td>
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

          {/* Printable Formal Signatures */}
          <div className="hidden print:flex items-center justify-between p-8 pt-16 text-xs font-bold text-zinc-950 font-sans">
            <div>Signature of MDM Incharge / Cook</div>
            <div>Signature of Headmaster / Principal</div>
          </div>
        </div>
      )}
    </div>
  );
};
