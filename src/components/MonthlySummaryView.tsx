import React, { useState } from 'react';
import { User, School, AcademicYear, MonthlyRowSummary } from '../types';
import { StorageService } from '../lib/storage';
import { formatDateIndian, getTodayDateStr } from '../lib/calculations';
import { exportMonthlySummaryToExcel } from '../lib/excelExport';
import { exportMonthlySummaryToPDF } from '../lib/pdfExport';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Filter, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  LayoutGrid,
  List,
  Table as TableIcon,
  Users,
  Utensils,
  Sun,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

interface MonthlySummaryViewProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  onNavigateToDailySummary?: (date: string) => void;
  onNavigateToEntry?: (sectionId: string, date: string) => void;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  currentUser,
  school,
  academicYear,
  onNavigateToDailySummary,
  onNavigateToEntry,
}) => {
  const now = new Date();
  const todayStr = getTodayDateStr();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [filterType, setFilterType] = useState<'all' | 'G1' | 'G2' | string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'ledger'>('cards');

  const sections = StorageService.getSections();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentSectionId = filterType.startsWith('sec-') ? filterType : undefined;
  const currentGroup = filterType === 'G1' || filterType === 'G2' ? filterType : undefined;

  const summary = StorageService.getMonthlySummary(
    selectedYear,
    selectedMonth,
    currentSectionId,
    currentGroup
  );

  const handlePrint = () => {
    window.print();
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Monthly stats
  const totalMeals = summary.total_meals;
  const boysTotal = summary.totals.boys_total;
  const girlsTotal = summary.totals.girls_total;
  const boysPercent = totalMeals > 0 ? Math.round((boysTotal / totalMeals) * 100) : 0;
  const girlsPercent = totalMeals > 0 ? 100 - boysPercent : 0;

  const scTotal = summary.totals.sc_total;
  const stTotal = summary.totals.st_total;
  const bcTotal = summary.totals.bc_total;
  const ocTotal = summary.totals.oc_total;

  const completionPercent = summary.working_days > 0 
    ? Math.round((summary.days_with_meals / summary.working_days) * 100) 
    : 0;

  return (
    <div className="space-y-6 pb-20 print:p-0">
      {/* Control Card (Hidden on Print) */}
      <div className="print:hidden bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-3">
        {/* Title Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md">
              Monthly Register
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {summary.working_days} Days • {summary.days_with_meals} Recorded
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </h2>
          <p className="text-xs text-zinc-400 font-mono truncate">
            {school.name} • AY {academicYear.name}
          </p>
        </div>

        {/* Month Selector Navigation & Scope Filter Row */}
        <div className="flex items-center space-x-2">
          {/* Month selector navigation */}
          <div className="flex items-center space-x-1 bg-zinc-50 border border-zinc-200 p-0.5 rounded-xl shrink-0">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-zinc-600 transition-colors active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-zinc-900 px-2 min-w-[75px] text-center">
              {monthNames[selectedMonth - 1].substring(0, 3)} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-zinc-600 transition-colors active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scope Filter */}
          <div className="flex-1 min-w-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer truncate"
            >
              <option value="all">All Classes (Grand Total)</option>
              <option value="G1">Group 1 (Classes 6-8)</option>
              <option value="G2">Group 2 (Classes 9-10)</option>
              <optgroup label="Specific Section">
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.display_name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* View Mode Switcher (Full Width 3 Equal Tabs) */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
            title="Calendar Cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
            title="Daily List Feed"
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('ledger')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'ledger'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
            title="Official Ledger Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Ledger</span>
          </button>
        </div>

        {/* Export Actions Row */}
        <div className="flex items-center space-x-2 pt-0.5">
          <button
            onClick={() => exportMonthlySummaryToExcel(selectedYear, selectedMonth, school)}
            className="flex-1 bg-black hover:bg-zinc-800 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            title="Download Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => exportMonthlySummaryToPDF(selectedYear, selectedMonth, school)}
            className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-semibold py-2 px-3 rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            title="Download PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-semibold py-2 px-3 rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shrink-0"
            title="Print Monthly Register"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Monthly Key Metric Cards (Executive Visuals) */}
      <div className="print:hidden grid grid-cols-1 gap-3">
        {/* Card 1: Total Meals Served */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Meals</span>
              <Utensils className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-zinc-950 mt-2">
              {totalMeals.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Daily Average</span>
            <span className="font-semibold text-zinc-900">{summary.average_meals_per_day} meals / day</span>
          </div>
        </div>

        {/* Card 2: Working Days & Coverage */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Month Coverage</span>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-950 mt-2 flex items-baseline space-x-2">
              <span>{summary.days_with_meals}</span>
              <span className="text-sm font-normal text-zinc-400">/ {summary.working_days} working days</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div 
                style={{ width: `${completionPercent}%` }} 
                className="bg-black h-full transition-all" 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-1">
              <span>{completionPercent}% recorded</span>
              <span>{summary.working_days - summary.days_with_meals} pending</span>
            </div>
          </div>
        </div>

        {/* Card 3: Gender Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Gender Ratio</span>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <div className="text-lg font-bold font-mono text-zinc-900">
                {boysTotal.toLocaleString()} <span className="text-xs font-normal text-zinc-500 font-sans">B ({boysPercent}%)</span>
              </div>
              <span className="text-zinc-300">/</span>
              <div className="text-lg font-bold font-mono text-zinc-900">
                {girlsTotal.toLocaleString()} <span className="text-xs font-normal text-zinc-500 font-sans">G ({girlsPercent}%)</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex">
              <div 
                style={{ width: `${boysPercent}%` }} 
                className="bg-black h-full transition-all" 
                title={`Boys: ${boysTotal}`} 
              />
              <div 
                style={{ width: `${girlsPercent}%` }} 
                className="bg-zinc-400 h-full transition-all" 
                title={`Girls: ${girlsTotal}`} 
              />
            </div>
          </div>
        </div>

        {/* Card 4: Caste Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Caste Totals</span>
              <span className="text-[10px] font-mono text-zinc-400">Monthly</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">SC</div>
                <div className="text-xs font-bold font-mono text-zinc-900 truncate">{scTotal}</div>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">ST</div>
                <div className="text-xs font-bold font-mono text-zinc-900 truncate">{stTotal}</div>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">BC</div>
                <div className="text-xs font-bold font-mono text-zinc-900 truncate">{bcTotal}</div>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-center">
                <div className="text-[10px] text-zinc-500 font-mono">OC</div>
                <div className="text-xs font-bold font-mono text-zinc-900 truncate">{ocTotal}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Caste Sum</span>
            <span className="font-semibold text-zinc-900">{scTotal + stTotal + bcTotal + ocTotal}</span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: CALENDAR DAY CARDS (Default, intuitive visual grid) */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
            <span>Day-by-Day Meal Summary for {monthNames[selectedMonth - 1]} {selectedYear}</span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Recorded</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>Pending</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                <span>Sunday / Holiday</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {summary.rows.map((row) => {
              const isPastOrToday = row.date <= todayStr;
              const isSundayRow = row.is_sunday;
              const isHolidayRow = row.is_holiday;
              const isRecorded = row.is_entered && row.grand_total > 0;
              const isPending = !isSundayRow && !isHolidayRow && !isRecorded && isPastOrToday;

              return (
                <div
                  key={row.date}
                  className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    isSundayRow
                      ? 'bg-zinc-50/70 border-zinc-200/80 text-zinc-400'
                      : isHolidayRow
                      ? 'bg-zinc-50/90 border-zinc-200 text-zinc-600'
                      : isRecorded
                      ? 'bg-white border-zinc-200 hover:border-black/50 shadow-xs'
                      : isPending
                      ? 'bg-amber-50/30 border-amber-200/80'
                      : 'bg-zinc-50/50 border-zinc-200 text-zinc-400'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                      <div className="flex items-center space-x-2">
                        <span className={`text-base font-bold font-mono ${
                          isSundayRow || isHolidayRow ? 'text-zinc-500' : 'text-zinc-950'
                        }`}>
                          {row.date.split('-')[2]} {monthNames[selectedMonth - 1].substring(0, 3)}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {row.day_name}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {isSundayRow ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                          Sunday
                        </span>
                      ) : isHolidayRow ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300 font-semibold truncate max-w-[110px]" title={row.holiday_reason}>
                          {row.holiday_reason || 'Holiday'}
                        </span>
                      ) : isRecorded ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      ) : isPending ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                          Pending
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-300">Future</span>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="py-3">
                      {isRecorded ? (
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black font-mono text-zinc-950">
                              {row.grand_total}
                              <span className="text-xs font-normal text-zinc-500 font-sans ml-1">meals</span>
                            </div>
                            <div className="text-xs font-mono text-zinc-500">
                              {row.boys_total} B • {row.girls_total} G
                            </div>
                          </div>

                          {/* Caste chip line */}
                          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono pt-1 text-center">
                            <span className="bg-zinc-100 text-zinc-700 py-0.5 rounded border border-zinc-200">SC {row.sc_total}</span>
                            <span className="bg-zinc-100 text-zinc-700 py-0.5 rounded border border-zinc-200">ST {row.st_total}</span>
                            <span className="bg-zinc-100 text-zinc-700 py-0.5 rounded border border-zinc-200">BC {row.bc_total}</span>
                            <span className="bg-zinc-100 text-zinc-700 py-0.5 rounded border border-zinc-200">OC {row.oc_total}</span>
                          </div>
                        </div>
                      ) : isSundayRow ? (
                        <div className="text-xs text-zinc-400 py-2 flex items-center space-x-1.5">
                          <Sun className="w-4 h-4 text-zinc-300 shrink-0" />
                          <span>Weekly holiday — school closed</span>
                        </div>
                      ) : isHolidayRow ? (
                        <div className="text-xs text-zinc-500 py-2 flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="truncate">{row.holiday_reason || 'Declared School Holiday'}</span>
                        </div>
                      ) : isPending ? (
                        <div className="text-xs text-amber-700 py-2 font-mono flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Working day without meal entry</span>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-300 py-2 font-mono">
                          Upcoming school day
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    {isRecorded ? (
                      <button
                        onClick={() => onNavigateToDailySummary && onNavigateToDailySummary(row.date)}
                        className="text-zinc-600 hover:text-black font-medium flex items-center space-x-1 w-full justify-between py-1 transition-colors"
                      >
                        <span>View Daily Breakdown</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : isPending ? (
                      <button
                        onClick={() => onNavigateToEntry && onNavigateToEntry(sections[0].id, row.date)}
                        className="text-black font-semibold flex items-center space-x-1 w-full justify-between py-1 hover:underline transition-colors"
                      >
                        <span>+ Record Meals Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">No actions</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DAILY LIST FEED (Chronological, compact) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden divide-y divide-zinc-200">
          <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-200 flex items-center justify-between text-xs font-mono font-semibold text-zinc-600 uppercase tracking-wider">
            <span>Date & Status</span>
            <div className="flex items-center space-x-8">
              <span className="hidden sm:inline">Caste Split</span>
              <span className="hidden md:inline">Gender</span>
              <span>Total Meals</span>
              <span className="w-20 text-right">Action</span>
            </div>
          </div>

          {summary.rows.map((row) => {
            const isSundayRow = row.is_sunday;
            const isHolidayRow = row.is_holiday;
            const isRecorded = row.is_entered && row.grand_total > 0;
            const isPastOrToday = row.date <= todayStr;
            const isPending = !isSundayRow && !isHolidayRow && !isRecorded && isPastOrToday;

            return (
              <div 
                key={row.date} 
                className={`p-4 flex items-center justify-between transition-colors ${
                  isSundayRow 
                    ? 'bg-zinc-50/50 text-zinc-400' 
                    : isHolidayRow 
                    ? 'bg-zinc-50 text-zinc-700' 
                    : 'hover:bg-zinc-50/80'
                }`}
              >
                {/* Left: Date & Status */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center shrink-0">
                    <span className="font-bold text-xs font-mono text-zinc-900 leading-none">
                      {row.date.split('-')[2]}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase leading-none mt-0.5">
                      {row.day_name}
                    </span>
                  </div>

                  <div>
                    <div className="font-semibold text-xs text-zinc-950">
                      {formatDateIndian(row.date)}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      {isSundayRow ? (
                        <span>Sunday Holiday</span>
                      ) : isHolidayRow ? (
                        <span className="text-zinc-800 font-medium">Holiday: {row.holiday_reason}</span>
                      ) : isRecorded ? (
                        <span className="text-emerald-700 font-medium">Meals Served</span>
                      ) : isPending ? (
                        <span className="text-amber-700 font-medium">Pending Entry</span>
                      ) : (
                        <span>Upcoming</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center space-x-6 sm:space-x-8">
                  {/* Caste Chips (Tablet+) */}
                  <div className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-zinc-600">
                    <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">SC {row.sc_total}</span>
                    <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">ST {row.st_total}</span>
                    <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">BC {row.bc_total}</span>
                    <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">OC {row.oc_total}</span>
                  </div>

                  {/* Gender (Desktop) */}
                  <div className="hidden md:block text-xs font-mono text-zinc-600 min-w-[90px] text-right">
                    {isRecorded ? `${row.boys_total} B • ${row.girls_total} G` : '-'}
                  </div>

                  {/* Total Meals */}
                  <div className="text-right min-w-[70px]">
                    <div className="text-base font-extrabold font-mono text-zinc-950">
                      {isRecorded ? row.grand_total : '-'}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="w-20 text-right">
                    {isRecorded ? (
                      <button
                        onClick={() => onNavigateToDailySummary && onNavigateToDailySummary(row.date)}
                        className="text-xs text-zinc-600 hover:text-black font-semibold hover:underline"
                      >
                        Details &rarr;
                      </button>
                    ) : isPending ? (
                      <button
                        onClick={() => onNavigateToEntry && onNavigateToEntry(sections[0].id, row.date)}
                        className="text-xs text-black font-semibold underline"
                      >
                        Record
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: OFFICIAL MONTHLY LEDGER MATRIX (For printing and formal inspections) */}
      {(viewMode === 'ledger' || true) && (
        <div className={`bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none ${viewMode !== 'ledger' ? 'hidden print:block' : ''}`}>
          {/* Print Formal Header */}
          <div className="text-center p-5 border-b border-zinc-200 bg-zinc-50/50">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-950">{school.name}</h1>
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-700 mt-1">
              MONTHLY MID-DAY MEAL (MDM) REGISTER - {monthNames[selectedMonth - 1].toUpperCase()} {selectedYear}
            </h2>
            <div className="text-xs text-zinc-500 mt-1 font-mono">
              School Code: {school.code || '-'} • Working Days: {summary.working_days} • Days Served: {summary.days_with_meals} • Total Meals: {summary.total_meals} • Daily Average: {summary.average_meals_per_day}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                {/* Header row 1 */}
                <tr className="bg-zinc-100 text-zinc-800 font-bold text-[11px] uppercase border-b border-zinc-200">
                  <th rowSpan={2} className="py-2.5 px-2 border-r border-zinc-200 w-16">Date</th>
                  <th rowSpan={2} className="py-2.5 px-1 border-r border-zinc-200 w-12">Day</th>
                  <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-50">SC</th>
                  <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-100/60">ST</th>
                  <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-50">BC</th>
                  <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-100/60">OC</th>
                  <th colSpan={3} className="py-1 px-1 border-r border-zinc-200 bg-zinc-200/70 text-zinc-950 font-extrabold">TOTALS</th>
                  <th rowSpan={2} className="py-2.5 px-2 text-left min-w-[120px]">Remarks / Status</th>
                </tr>
                {/* Header row 2 */}
                <tr className="bg-zinc-50 text-zinc-600 font-mono text-[10px] uppercase border-b border-zinc-200">
                  <th className="py-1 px-1 border-r border-zinc-200">B</th>
                  <th className="py-1 px-1 border-r border-zinc-200">G</th>
                  <th className="py-1 px-1 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                  <th className="py-1 px-1 border-r border-zinc-200">B</th>
                  <th className="py-1 px-1 border-r border-zinc-200">G</th>
                  <th className="py-1 px-1 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                  <th className="py-1 px-1 border-r border-zinc-200">B</th>
                  <th className="py-1 px-1 border-r border-zinc-200">G</th>
                  <th className="py-1 px-1 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                  <th className="py-1 px-1 border-r border-zinc-200">B</th>
                  <th className="py-1 px-1 border-r border-zinc-200">G</th>
                  <th className="py-1 px-1 border-r border-zinc-200 font-bold text-zinc-900 bg-zinc-100">Tot</th>

                  <th className="py-1 px-1.5 border-r border-zinc-200 font-bold text-zinc-900">Boys</th>
                  <th className="py-1 px-1.5 border-r border-zinc-200 font-bold text-zinc-900">Girls</th>
                  <th className="py-1 px-2 bg-black text-white font-extrabold">TOTAL</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 text-zinc-700 font-mono">
                {summary.rows.map((row) => {
                  const isSundayRow = row.is_sunday;
                  const isHolidayRow = row.is_holiday;

                  return (
                    <tr
                      key={row.date}
                      className={`transition-colors ${
                        isSundayRow
                          ? 'bg-zinc-100/50 text-zinc-500'
                          : isHolidayRow
                          ? 'bg-zinc-100/70 text-zinc-800'
                          : 'hover:bg-zinc-50/60'
                      }`}
                    >
                      <td className="py-1.5 px-2 font-bold text-zinc-950 border-r border-zinc-100">
                        {row.date.split('-')[2]}
                      </td>
                      <td className="py-1.5 px-1 text-[11px] border-r border-zinc-100">
                        {row.day_name}
                      </td>

                      {/* SC */}
                      <td className="border-r border-zinc-100">{row.is_entered ? row.sc_boys : '-'}</td>
                      <td className="border-r border-zinc-100">{row.is_entered ? row.sc_girls : '-'}</td>
                      <td className="font-bold bg-zinc-50 border-r border-zinc-100 text-zinc-950">{row.is_entered ? row.sc_total : '-'}</td>

                      {/* ST */}
                      <td className="border-r border-zinc-100">{row.is_entered ? row.st_boys : '-'}</td>
                      <td className="border-r border-zinc-100">{row.is_entered ? row.st_girls : '-'}</td>
                      <td className="font-bold bg-zinc-50 border-r border-zinc-100 text-zinc-950">{row.is_entered ? row.st_total : '-'}</td>

                      {/* BC */}
                      <td className="border-r border-zinc-100">{row.is_entered ? row.bc_boys : '-'}</td>
                      <td className="border-r border-zinc-100">{row.is_entered ? row.bc_girls : '-'}</td>
                      <td className="font-bold bg-zinc-50 border-r border-zinc-100 text-zinc-950">{row.is_entered ? row.bc_total : '-'}</td>

                      {/* OC */}
                      <td className="border-r border-zinc-100">{row.is_entered ? row.oc_boys : '-'}</td>
                      <td className="border-r border-zinc-100">{row.is_entered ? row.oc_girls : '-'}</td>
                      <td className="font-bold bg-zinc-50 border-r border-zinc-100 text-zinc-950">{row.is_entered ? row.oc_total : '-'}</td>

                      {/* Totals */}
                      <td className="font-bold border-r border-zinc-100 text-zinc-900">{row.is_entered ? row.boys_total : '-'}</td>
                      <td className="font-bold border-r border-zinc-100 text-zinc-900">{row.is_entered ? row.girls_total : '-'}</td>
                      <td className="font-bold bg-zinc-100/70 border-r border-zinc-100 text-zinc-950">{row.is_entered ? row.grand_total : '-'}</td>

                      {/* Status Column */}
                      <td className="text-left px-2 text-[11px] font-sans truncate">
                        {isSundayRow ? (
                          <span className="text-zinc-500 font-mono text-[10px]">Sunday</span>
                        ) : isHolidayRow ? (
                          <span className="font-medium text-zinc-900">Holiday: {row.holiday_reason}</span>
                        ) : row.is_entered ? (
                          <span className="text-zinc-800 font-medium flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-black shrink-0" />
                            <span>Meals Served</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">Not entered</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* MONTH TOTALS ROW */}
                <tr className="bg-black text-white font-bold text-xs border-t-2 border-black">
                  <td colSpan={2} className="py-2.5 px-2 text-center uppercase tracking-wider font-sans">
                    TOTAL ({summary.days_with_meals} Days)
                  </td>

                  <td className="border-l border-zinc-800">-</td>
                  <td>-</td>
                  <td className="bg-zinc-900">{summary.totals.sc_total}</td>

                  <td className="border-l border-zinc-800">-</td>
                  <td>-</td>
                  <td className="bg-zinc-900">{summary.totals.st_total}</td>

                  <td className="border-l border-zinc-800">-</td>
                  <td>-</td>
                  <td className="bg-zinc-900">{summary.totals.bc_total}</td>

                  <td className="border-l border-zinc-800">-</td>
                  <td>-</td>
                  <td className="bg-zinc-900">{summary.totals.oc_total}</td>

                  <td className="font-bold text-zinc-200">{summary.totals.boys_total}</td>
                  <td className="font-bold text-zinc-200">{summary.totals.girls_total}</td>
                  <td className="bg-zinc-800 text-white text-sm font-black">{summary.totals.grand_total}</td>

                  <td className="text-left px-2 text-zinc-300 font-sans font-medium text-[11px]">
                    Avg: {summary.average_meals_per_day} meals/day
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
