import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Users, 
  TrendingUp, 
  Calendar, 
  ChevronRight,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { User, School, AcademicYear } from '../types';
import { StorageService } from '../lib/storage';
import { formatDateIndian, getTodayDateStr } from '../lib/calculations';
import { exportDailySummaryToExcel } from '../lib/excelExport';

interface DashboardProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  onNavigateToEntry: (sectionId?: string, date?: string) => void;
  onNavigateToDailySummary: (date: string) => void;
  onNavigateToMonthlySummary: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  school,
  academicYear,
  onNavigateToEntry,
  onNavigateToDailySummary,
  onNavigateToMonthlySummary,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [tracker, setTracker] = useState(StorageService.getCompletionTracker(selectedDate));
  const [dailySummary, setDailySummary] = useState(StorageService.getDailySummary(selectedDate));
  const [monthlySummary, setMonthlySummary] = useState(() => {
    const now = new Date();
    return StorageService.getMonthlySummary(now.getFullYear(), now.getMonth() + 1);
  });

  const refreshData = (date: string) => {
    setSelectedDate(date);
    setTracker(StorageService.getCompletionTracker(date));
    setDailySummary(StorageService.getDailySummary(date));
    const [y, m] = date.split('-').map(Number);
    setMonthlySummary(StorageService.getMonthlySummary(y, m));
  };

  useEffect(() => {
    refreshData(selectedDate);
  }, [selectedDate]);

  const isToday = selectedDate === getTodayDateStr();

  // Find user's assigned section status if teacher
  const assignedSectionStatus = tracker.sections.find(
    (s) => s.section_id === currentUser.assigned_section_id
  );

  const grandTotal = dailySummary.school_grand_totals.grand_total;
  const boysTotal = dailySummary.school_grand_totals.boys_total;
  const girlsTotal = dailySummary.school_grand_totals.girls_total;
  const boysPercent = grandTotal > 0 ? Math.round((boysTotal / grandTotal) * 100) : 0;
  const girlsPercent = grandTotal > 0 ? 100 - boysPercent : 0;

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Date Header & Quick Selector Card */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md">
              {isToday ? "Today's Status" : 'Selected Date'}
            </span>
            {tracker.is_sunday && (
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md">
                Sunday
              </span>
            )}
            {tracker.is_holiday && (
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded-md">
                Holiday
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono text-zinc-500 font-medium">
            {formatDateIndian(selectedDate)}
          </div>
        </div>

        {/* Date Input with Today Shortcut */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            max={getTodayDateStr()}
            value={selectedDate}
            onChange={(e) => refreshData(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
          />
          {!isToday && (
            <button
              onClick={() => refreshData(getTodayDateStr())}
              className="text-xs bg-black text-white hover:bg-zinc-800 font-semibold px-3 py-2 rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Teacher Action Alert Banner (if logged in as teacher and assigned section pending) */}
      {currentUser.role === 'teacher' && assignedSectionStatus && (
        <div
          className={`rounded-2xl p-3.5 border transition-all ${
            assignedSectionStatus.is_entered
              ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
              : 'bg-white border-zinc-900 text-zinc-950 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                  assignedSectionStatus.is_entered
                    ? 'bg-zinc-200 text-zinc-900'
                    : 'bg-black text-white'
                }`}
              >
                {assignedSectionStatus.is_entered ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs truncate">
                  My Section: {assignedSectionStatus.display_name}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">
                  {assignedSectionStatus.is_entered
                    ? `Recorded: ${assignedSectionStatus.grand_total} meals today.`
                    : 'Pending meal submission for today.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToEntry(assignedSectionStatus.section_id, selectedDate)}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all ${
                assignedSectionStatus.is_entered
                  ? 'bg-white border border-zinc-300 text-zinc-800'
                  : 'bg-black text-white'
              }`}
            >
              {assignedSectionStatus.is_entered ? 'Edit' : 'Record'}
            </button>
          </div>
        </div>
      )}

      {/* HERO METRIC CARD: Today's Total Meals (Full Width, Generous Padding) */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold uppercase tracking-wider font-mono">
          <div className="flex items-center space-x-1.5">
            <Utensils className="w-4 h-4 text-zinc-600" />
            <span>Today's Total Meals</span>
          </div>
          <span className="font-mono text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
            {tracker.entered_count}/10 Sections
          </span>
        </div>

        {/* Big Bold Meal Number */}
        <div className="flex items-baseline justify-between">
          <div className="text-4xl font-extrabold font-mono text-zinc-950 tracking-tight">
            {grandTotal}
          </div>
          <div className="text-xs font-mono text-zinc-500 text-right">
            <div>Boys: <strong className="text-zinc-900">{boysTotal}</strong></div>
            <div>Girls: <strong className="text-zinc-900">{girlsTotal}</strong></div>
          </div>
        </div>

        {/* Ratio Progress Bar */}
        <div className="space-y-1 pt-1">
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
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Boys ({boysPercent}%)</span>
            <span>Girls ({girlsPercent}%)</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SUB-METRICS GRID (Upper Primary vs High School) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Group 1: Classes 6-8 */}
        <div className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 shadow-xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              <span>Group 1</span>
              <span className="bg-zinc-100 px-1 py-0.2 rounded text-[9px] text-zinc-700">6-8 UP</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1">
              {dailySummary.group1_totals.grand_total}
            </div>
          </div>
          <div className="border-t border-zinc-100 pt-1.5 text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>B: <strong className="text-zinc-900">{dailySummary.group1_totals.boys_total}</strong></span>
            <span>G: <strong className="text-zinc-900">{dailySummary.group1_totals.girls_total}</strong></span>
          </div>
        </div>

        {/* Group 2: Classes 9-10 */}
        <div className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 shadow-xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              <span>Group 2</span>
              <span className="bg-zinc-100 px-1 py-0.2 rounded text-[9px] text-zinc-700">9-10 HS</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1">
              {dailySummary.group2_totals.grand_total}
            </div>
          </div>
          <div className="border-t border-zinc-100 pt-1.5 text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>B: <strong className="text-zinc-900">{dailySummary.group2_totals.boys_total}</strong></span>
            <span>G: <strong className="text-zinc-900">{dailySummary.group2_totals.girls_total}</strong></span>
          </div>
        </div>
      </div>

      {/* MONTH SUMMARY CARD (Full Width, Compact & Clear) */}
      <div className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-zinc-400">This Month So Far</div>
            <div className="text-base font-extrabold font-mono text-zinc-950">
              {monthlySummary.total_meals} <span className="text-[11px] font-normal text-zinc-500 font-sans">meals served</span>
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] font-mono text-zinc-500 shrink-0">
          <div>Avg: <strong className="text-zinc-900">{monthlySummary.average_meals_per_day}</strong>/day</div>
          <div className="text-[10px] text-zinc-400">{monthlySummary.days_with_meals} days counted</div>
        </div>
      </div>

      {/* COMPLETION TRACKER: Class Cards (1 Class Card per Row, No Squishing!) */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-3.5">
        {/* Header with Title and Action Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-950 text-sm">
              Section Completion Status
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 shrink-0">
              {tracker.entered_count}/10 Done ({tracker.percentage}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div 
              style={{ width: `${tracker.percentage}%` }}
              className="bg-black h-full rounded-full transition-all duration-300"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => onNavigateToDailySummary(selectedDate)}
              className="flex-1 bg-zinc-50 hover:bg-zinc-100 active:scale-95 text-zinc-800 border border-zinc-200 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-1 transition-all"
            >
              <span>Daily Detailed View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => exportDailySummaryToExcel(dailySummary, school, academicYear)}
              className="bg-white hover:bg-zinc-50 active:scale-95 text-zinc-800 border border-zinc-200 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-1 transition-all shrink-0"
              title="Download Excel Register"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* 5 Class Cards (Stacked 1-by-1 vertically so Section A & B have full room!) */}
        <div className="space-y-2.5 pt-1">
          {[6, 7, 8, 9, 10].map((classNum) => {
            const secA = tracker.sections.find((s) => s.class_number === classNum && s.section_name === 'A');
            const secB = tracker.sections.find((s) => s.class_number === classNum && s.section_name === 'B');
            const classTotalMeals = (secA?.grand_total ?? 0) + (secB?.grand_total ?? 0);
            const bothDone = secA?.is_entered && secB?.is_entered;
            const oneDone = (secA?.is_entered || secB?.is_entered) && !bothDone;

            return (
              <div
                key={classNum}
                className="bg-zinc-50/60 rounded-xl border border-zinc-200 p-3 space-y-2.5"
              >
                {/* Class Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      {classNum}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-zinc-950">Class {classNum}</span>
                      <span className="text-[10px] font-mono text-zinc-400 ml-1.5">
                        {classNum <= 8 ? 'Upper Primary' : 'High School'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="font-mono text-xs font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-0.5 rounded-md shadow-2xs">
                      {classTotalMeals} Meals
                    </span>
                    <span 
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        bothDone ? 'bg-emerald-500' : oneDone ? 'bg-amber-500' : 'bg-zinc-300'
                      }`}
                      title={bothDone ? 'Both sections recorded' : oneDone ? '1 of 2 recorded' : 'Pending'}
                    />
                  </div>
                </div>

                {/* Section A & Section B Cards (Side by side with plenty of room!) */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Section A */}
                  {secA && (
                    <button
                      type="button"
                      onClick={() => onNavigateToEntry(secA.section_id, selectedDate)}
                      className={`p-2.5 rounded-lg border text-left transition-all active:scale-95 flex flex-col justify-between ${
                        secA.is_entered
                          ? 'bg-white border-zinc-200 hover:border-black shadow-2xs'
                          : 'bg-white border-dashed border-zinc-300 hover:border-black'
                      } ${secA.section_id === currentUser.assigned_section_id ? 'ring-2 ring-black' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-zinc-900">Sec A</span>
                        {secA.is_entered ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        )}
                      </div>
                      <div className="mt-1.5">
                        {secA.is_entered ? (
                          <div className="text-sm font-extrabold font-mono text-zinc-950">
                            {secA.grand_total} <span className="text-[10px] font-normal text-zinc-400 font-sans">meals</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-zinc-600 hover:text-black">
                            + Enter &rarr;
                          </div>
                        )}
                      </div>
                    </button>
                  )}

                  {/* Section B */}
                  {secB && (
                    <button
                      type="button"
                      onClick={() => onNavigateToEntry(secB.section_id, selectedDate)}
                      className={`p-2.5 rounded-lg border text-left transition-all active:scale-95 flex flex-col justify-between ${
                        secB.is_entered
                          ? 'bg-white border-zinc-200 hover:border-black shadow-2xs'
                          : 'bg-white border-dashed border-zinc-300 hover:border-black'
                      } ${secB.section_id === currentUser.assigned_section_id ? 'ring-2 ring-black' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-zinc-900">Sec B</span>
                        {secB.is_entered ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        )}
                      </div>
                      <div className="mt-1.5">
                        {secB.is_entered ? (
                          <div className="text-sm font-extrabold font-mono text-zinc-950">
                            {secB.grand_total} <span className="text-[10px] font-normal text-zinc-400 font-sans">meals</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-zinc-600 hover:text-black">
                            + Enter &rarr;
                          </div>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CASTE BREAKDOWN (4 Compact Cards with Safe Margins) */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-zinc-900 text-xs">
            Caste Breakdown (Today)
          </h4>
          <span className="text-[10px] text-zinc-400 font-mono">All Classes</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { label: 'SC', total: dailySummary.school_grand_totals.sc_total },
            { label: 'ST', total: dailySummary.school_grand_totals.st_total },
            { label: 'BC', total: dailySummary.school_grand_totals.bc_total },
            { label: 'OC', total: dailySummary.school_grand_totals.oc_total },
          ].map((caste) => (
            <div key={caste.label} className="bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
              <div className="text-[10px] font-mono font-bold text-zinc-400">{caste.label}</div>
              <div className="text-base font-extrabold font-mono text-zinc-950 mt-0.5">
                {caste.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK JUMP NAVIGATION BUTTONS */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onNavigateToDailySummary(selectedDate)}
          className="bg-white hover:bg-zinc-50 active:scale-95 text-zinc-900 text-xs font-semibold p-3 rounded-2xl border border-zinc-200/90 shadow-xs text-center transition-all flex items-center justify-center space-x-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Register</span>
        </button>
        <button
          onClick={onNavigateToMonthlySummary}
          className="bg-black hover:bg-zinc-800 active:scale-95 text-white text-xs font-semibold p-3 rounded-2xl shadow-xs text-center transition-all flex items-center justify-center space-x-1.5"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Monthly Register</span>
        </button>
      </div>
    </div>
  );
};
