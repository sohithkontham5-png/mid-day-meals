import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Users, 
  TrendingUp, 
  Calendar, 
  Download, 
  ChevronRight,
  Sparkles
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

  return (
    <div className="space-y-6 pb-12">
      {/* Date Header & Quick Selector */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {isToday ? "Today's Overview" : 'Selected Date'}
            </span>
            {tracker.is_sunday && (
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                Sunday (Non-Working)
              </span>
            )}
            {tracker.is_holiday && (
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded">
                Holiday: {tracker.holiday_reason}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
            Mid-Day Meal Register
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {school.name} • {formatDateIndian(selectedDate)}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            max={getTodayDateStr()}
            value={selectedDate}
            onChange={(e) => refreshData(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />
          {!isToday && (
            <button
              onClick={() => refreshData(getTodayDateStr())}
              className="text-xs bg-zinc-100 text-zinc-800 hover:bg-zinc-200 font-medium px-2.5 py-1.5 rounded-lg border border-zinc-200 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Teacher Action Alert Banner (if logged in as teacher and assigned section pending) */}
      {currentUser.role === 'teacher' && assignedSectionStatus && (
        <div
          className={`rounded-xl p-4 border flex items-center justify-between transition-all ${
            assignedSectionStatus.is_entered
              ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
              : 'bg-white border-zinc-900 text-zinc-950 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                assignedSectionStatus.is_entered
                  ? 'bg-zinc-100 text-zinc-900 border border-zinc-300'
                  : 'bg-black text-white'
              }`}
            >
              {assignedSectionStatus.is_entered ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-semibold text-sm">
                Assigned Section: {assignedSectionStatus.display_name}
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">
                {assignedSectionStatus.is_entered
                  ? `Recorded: ${assignedSectionStatus.grand_total} meals served today.`
                  : 'Attendance not yet recorded for today. Please submit the counts.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToEntry(assignedSectionStatus.section_id, selectedDate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0 transition-all ${
              assignedSectionStatus.is_entered
                ? 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50'
                : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            <span>{assignedSectionStatus.is_entered ? 'View / Edit' : 'Enter Count Now'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Vercel Metric Grid (Clean Monochrome Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Grand Total */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm relative">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>Today's Total Meals</span>
            <Utensils className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-950 mt-2 tracking-tight">
            {dailySummary.school_grand_totals.grand_total}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-zinc-100 pt-2.5">
            <div>Boys: <span className="font-bold text-zinc-900">{dailySummary.school_grand_totals.boys_total}</span></div>
            <div>Girls: <span className="font-bold text-zinc-900">{dailySummary.school_grand_totals.girls_total}</span></div>
            <div>Done: <span className="font-bold text-zinc-900">{tracker.entered_count}/10</span></div>
          </div>
        </div>

        {/* Card 2: Group 1 (Upper Primary 6-8) */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>Group 1 (Classes 6-8)</span>
            <span className="text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200">
              Upper Primary
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-zinc-950 mt-2">
            {dailySummary.group1_totals.grand_total}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-zinc-100 pt-2.5">
            <div>Boys: <span className="font-semibold text-zinc-900">{dailySummary.group1_totals.boys_total}</span></div>
            <div>Girls: <span className="font-semibold text-zinc-900">{dailySummary.group1_totals.girls_total}</span></div>
            <div>SC/ST: <span className="font-semibold text-zinc-900">{dailySummary.group1_totals.sc_total + dailySummary.group1_totals.st_total}</span></div>
          </div>
        </div>

        {/* Card 3: Group 2 (High School 9-10) */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>Group 2 (Classes 9-10)</span>
            <span className="text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200">
              High School
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-zinc-950 mt-2">
            {dailySummary.group2_totals.grand_total}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-zinc-100 pt-2.5">
            <div>Boys: <span className="font-semibold text-zinc-900">{dailySummary.group2_totals.boys_total}</span></div>
            <div>Girls: <span className="font-semibold text-zinc-900">{dailySummary.group2_totals.girls_total}</span></div>
            <div>BC/OC: <span className="font-semibold text-zinc-900">{dailySummary.group2_totals.bc_total + dailySummary.group2_totals.oc_total}</span></div>
          </div>
        </div>

        {/* Card 4: Month-to-Date Averages */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>This Month So Far</span>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-zinc-950 mt-2">
            {monthlySummary.average_meals_per_day} <span className="text-xs font-normal text-zinc-400 font-sans">avg/day</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-zinc-100 pt-2.5">
            <div>Days Served: <span className="font-semibold text-zinc-900">{monthlySummary.days_with_meals}</span></div>
            <div>Total: <span className="font-semibold text-zinc-900">{monthlySummary.total_meals}</span></div>
          </div>
        </div>
      </div>

      {/* CORE FEATURE 6: Completion Tracker Dashboard */}
      <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-zinc-950 text-base">
                Daily Section Completion Status
              </h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                {tracker.entered_count} of {tracker.total_sections} Submitted ({tracker.percentage}%)
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Click on any section to open its meal attendance form
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateToDailySummary(selectedDate)}
              className="text-xs font-medium text-zinc-700 hover:text-black bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Daily Detailed View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => exportDailySummaryToExcel(dailySummary, school, academicYear)}
              className="text-xs font-medium text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-300 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
              title="Download Excel of this day"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Vercel-style Progress Bar */}
        <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${tracker.percentage}%` }}
          />
        </div>

        {/* Class-wise Sections Grid (Classes 6 to 10) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {[6, 7, 8, 9, 10].map((classNum) => {
            const secA = tracker.sections.find((s) => s.class_number === classNum && s.section_name === 'A');
            const secB = tracker.sections.find((s) => s.class_number === classNum && s.section_name === 'B');
            const classTotalMeals = (secA?.grand_total ?? 0) + (secB?.grand_total ?? 0);
            const bothDone = secA?.is_entered && secB?.is_entered;
            const oneDone = (secA?.is_entered || secB?.is_entered) && !bothDone;

            return (
              <div
                key={classNum}
                className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs hover:border-zinc-300 transition-all space-y-3 flex flex-col justify-between"
              >
                {/* Class Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
                      {classNum}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-zinc-950">Class {classNum}</span>
                      <span className="text-[10px] font-mono text-zinc-400 ml-1.5">
                        {classNum <= 8 ? 'Upper Primary' : 'High School'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-zinc-950 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md">
                      {classTotalMeals} Meals
                    </span>
                    {bothDone ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Both sections recorded" />
                    ) : oneDone ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="1 of 2 recorded" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-300" title="Pending entry" />
                    )}
                  </div>
                </div>

                {/* Section A & Section B Interactive Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Section A */}
                  {secA && (
                    <button
                      type="button"
                      onClick={() => onNavigateToEntry(secA.section_id, selectedDate)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        secA.is_entered
                          ? 'bg-zinc-50/70 border-zinc-200 hover:bg-zinc-100 hover:border-black'
                          : 'bg-white border-dashed border-zinc-300 hover:border-black hover:bg-zinc-50'
                      } ${secA.section_id === currentUser.assigned_section_id ? 'ring-1 ring-black' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-zinc-900">Sec A</span>
                        {secA.is_entered ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </div>
                      <div className="mt-2">
                        {secA.is_entered ? (
                          <div className="text-base font-extrabold font-mono text-zinc-950">
                            {secA.grand_total} <span className="text-[10px] font-sans font-normal text-zinc-400">meals</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-medium text-zinc-500 hover:text-black">
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
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        secB.is_entered
                          ? 'bg-zinc-50/70 border-zinc-200 hover:bg-zinc-100 hover:border-black'
                          : 'bg-white border-dashed border-zinc-300 hover:border-black hover:bg-zinc-50'
                      } ${secB.section_id === currentUser.assigned_section_id ? 'ring-1 ring-black' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-zinc-900">Sec B</span>
                        {secB.is_entered ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </div>
                      <div className="mt-2">
                        {secB.is_entered ? (
                          <div className="text-base font-extrabold font-mono text-zinc-950">
                            {secB.grand_total} <span className="text-[10px] font-sans font-normal text-zinc-400">meals</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-medium text-zinc-500 hover:text-black">
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

      {/* Caste & Gender Breakdown Preview for Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Caste Summary Cards */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-zinc-900 text-sm">
              Today's Caste-wise Breakdown
            </h4>
            <span className="text-xs text-zinc-400 font-mono">All Classes Combined</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'SC', total: dailySummary.school_grand_totals.sc_total },
              { label: 'ST', total: dailySummary.school_grand_totals.st_total },
              { label: 'BC', total: dailySummary.school_grand_totals.bc_total },
              { label: 'OC', total: dailySummary.school_grand_totals.oc_total },
            ].map((caste) => (
              <div key={caste.label} className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-center">
                <div className="text-xs font-mono font-semibold text-zinc-500">{caste.label}</div>
                <div className="text-xl font-bold font-mono text-zinc-950 mt-1">
                  {caste.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Report Access Card */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-zinc-600 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Reports</span>
            </div>
            <h4 className="font-bold text-zinc-950 text-base mt-1">
              Ready-made MDM Registers
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Export government-compliant registers in Excel (.xlsx), PDF, or direct 1-click A4 print.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => onNavigateToDailySummary(selectedDate)}
              className="bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold p-2.5 rounded-lg border border-zinc-300 text-center transition-colors flex items-center justify-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Sheet</span>
            </button>
            <button
              onClick={onNavigateToMonthlySummary}
              className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold p-2.5 rounded-lg shadow-sm text-center transition-colors flex items-center justify-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Monthly Register</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
