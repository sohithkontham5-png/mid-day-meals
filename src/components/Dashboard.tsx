import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Utensils, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  Calendar, 
  Download, 
  Share2, 
  Info, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { User, School, AcademicYear } from '../types';
import { StorageService } from '../lib/storage';
import { formatDateIndian, getTodayDateStr, isSunday } from '../lib/calculations';
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              {isToday ? "Today's Status" : 'Historical Date'}
            </span>
            {tracker.is_sunday && (
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                Sunday (Non-Working)
              </span>
            )}
            {tracker.is_holiday && (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                Holiday: {tracker.holiday_reason}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
            MDM Monitoring Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {school.name} • {formatDateIndian(selectedDate)}
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            max={getTodayDateStr()}
            value={selectedDate}
            onChange={(e) => refreshData(e.target.value)}
            className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          {!isToday && (
            <button
              onClick={() => refreshData(getTodayDateStr())}
              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-2 rounded-xl transition-colors"
            >
              Back to Today
            </button>
          )}
        </div>
      </div>

      {/* Teacher Action Alert Banner (if logged in as teacher and assigned section pending) */}
      {currentUser.role === 'teacher' && assignedSectionStatus && (
        <div
          className={`rounded-2xl p-4 border flex items-center justify-between transition-all ${
            assignedSectionStatus.is_entered
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                assignedSectionStatus.is_entered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white animate-pulse'
              }`}
            >
              {assignedSectionStatus.is_entered ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                Your Assigned Section: {assignedSectionStatus.display_name}
              </div>
              <div className="text-xs opacity-80">
                {assignedSectionStatus.is_entered
                  ? `Recorded: ${assignedSectionStatus.grand_total} meals served today.`
                  : 'Attendance not yet recorded for today. Please submit the counts.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToEntry(assignedSectionStatus.section_id, selectedDate)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 shrink-0 shadow-sm transition-all ${
              assignedSectionStatus.is_entered
                ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'
            }`}
          >
            <span>{assignedSectionStatus.is_entered ? 'View / Edit' : 'Enter Count Now'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Grand Total */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-emerald-100 text-xs font-semibold uppercase tracking-wider">
            <span>Today's Total Meals</span>
            <Utensils className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">
            {dailySummary.school_grand_totals.grand_total}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-100 border-t border-emerald-500/50 pt-2.5">
            <div>Boys: <span className="font-bold text-white">{dailySummary.school_grand_totals.boys_total}</span></div>
            <div>Girls: <span className="font-bold text-white">{dailySummary.school_grand_totals.girls_total}</span></div>
            <div>Sections: <span className="font-bold text-white">{tracker.entered_count}/10</span></div>
          </div>
        </div>

        {/* Card 2: Group 1 (Upper Primary 6-8) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Group 1 (Classes 6-8)</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Upper Primary</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2">
            {dailySummary.group1_totals.grand_total}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <div>Boys: <span className="font-semibold text-slate-800">{dailySummary.group1_totals.boys_total}</span></div>
            <div>Girls: <span className="font-semibold text-slate-800">{dailySummary.group1_totals.girls_total}</span></div>
            <div>SC/ST: <span className="font-semibold text-slate-800">{dailySummary.group1_totals.sc_total + dailySummary.group1_totals.st_total}</span></div>
          </div>
        </div>

        {/* Card 3: Group 2 (High School 9-10) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Group 2 (Classes 9-10)</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">High School</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2">
            {dailySummary.group2_totals.grand_total}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <div>Boys: <span className="font-semibold text-slate-800">{dailySummary.group2_totals.boys_total}</span></div>
            <div>Girls: <span className="font-semibold text-slate-800">{dailySummary.group2_totals.girls_total}</span></div>
            <div>BC/OC: <span className="font-semibold text-slate-800">{dailySummary.group2_totals.bc_total + dailySummary.group2_totals.oc_total}</span></div>
          </div>
        </div>

        {/* Card 4: Month-to-Date Averages */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>This Month So Far</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2">
            {monthlySummary.average_meals_per_day} <span className="text-xs font-semibold text-slate-400">avg/day</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <div>Days Served: <span className="font-bold text-slate-800">{monthlySummary.days_with_meals}</span></div>
            <div>Total: <span className="font-bold text-emerald-700">{monthlySummary.total_meals}</span></div>
          </div>
        </div>
      </div>

      {/* CORE FEATURE 6: Completion Tracker Dashboard */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-lg">
                Daily Section Completion Tracker
              </h3>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                tracker.pending_count === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {tracker.entered_count} of {tracker.total_sections} Submitted ({tracker.percentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any pending section to immediately record its meal attendance
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateToDailySummary(selectedDate)}
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Daily Detailed View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => exportDailySummaryToExcel(dailySummary, school, academicYear)}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
              title="Download Excel of this day"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              tracker.pending_count === 0 ? 'bg-emerald-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${tracker.percentage}%` }}
          />
        </div>

        {/* 10 Sections Visual Interactive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {tracker.sections.map((sec) => {
            const isEntered = sec.is_entered;
            const isUserAssigned = sec.section_id === currentUser.assigned_section_id;

            return (
              <div
                key={sec.section_id}
                onClick={() => onNavigateToEntry(sec.section_id, selectedDate)}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] flex flex-col justify-between ${
                  isEntered
                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/80'
                } ${isUserAssigned ? 'ring-2 ring-emerald-500/50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-sm">
                    {sec.display_name}
                  </span>
                  {isEntered ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  {isEntered ? (
                    <div>
                      <div className="text-xl font-black text-emerald-800">
                        {sec.grand_total} <span className="text-[10px] font-semibold text-emerald-600">meals</span>
                      </div>
                      <div className="text-[11px] text-emerald-700/80 truncate mt-0.5">
                        By: {sec.entry?.created_by_name?.split(' ')?.[0] || 'Teacher'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-amber-700">
                        Pending
                      </div>
                      <div className="text-[11px] text-amber-800/70 mt-0.5 group-hover:text-amber-900 font-medium">
                        Click to enter &rarr;
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caste & Gender Breakdown Preview for Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Caste Summary Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">
              Today's Caste-wise Total Breakdown
            </h4>
            <span className="text-xs text-slate-400">All Classes Combined</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-xs font-semibold text-slate-500">SC</div>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {dailySummary.school_grand_totals.sc_total}
              </div>
              <div className="text-[10px] text-slate-400">
                B:{dailySummary.school_grand_totals.sc_total > 0 ? dailySummary.classes.reduce((s, c) => s + (c.section_a?.sc_boys || 0) + (c.section_b?.sc_boys || 0), 0) : 0} G:{dailySummary.school_grand_totals.sc_total > 0 ? dailySummary.classes.reduce((s, c) => s + (c.section_a?.sc_girls || 0) + (c.section_b?.sc_girls || 0), 0) : 0}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-xs font-semibold text-slate-500">ST</div>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {dailySummary.school_grand_totals.st_total}
              </div>
              <div className="text-[10px] text-slate-400">
                B:{dailySummary.classes.reduce((s, c) => s + (c.section_a?.st_boys || 0) + (c.section_b?.st_boys || 0), 0)} G:{dailySummary.classes.reduce((s, c) => s + (c.section_a?.st_girls || 0) + (c.section_b?.st_girls || 0), 0)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-xs font-semibold text-slate-500">BC</div>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {dailySummary.school_grand_totals.bc_total}
              </div>
              <div className="text-[10px] text-slate-400">
                B:{dailySummary.classes.reduce((s, c) => s + (c.section_a?.bc_boys || 0) + (c.section_b?.bc_boys || 0), 0)} G:{dailySummary.classes.reduce((s, c) => s + (c.section_a?.bc_girls || 0) + (c.section_b?.bc_girls || 0), 0)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-xs font-semibold text-slate-500">OC</div>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {dailySummary.school_grand_totals.oc_total}
              </div>
              <div className="text-[10px] text-slate-400">
                B:{dailySummary.classes.reduce((s, c) => s + (c.section_a?.oc_boys || 0) + (c.section_b?.oc_boys || 0), 0)} G:{dailySummary.classes.reduce((s, c) => s + (c.section_a?.oc_girls || 0) + (c.section_b?.oc_girls || 0), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Report Access Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Official Reports & Registers</span>
            </div>
            <h4 className="font-extrabold text-white text-lg mt-1">
              Ready-made MDM Registers
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Export government-compliant A4 landscape registers in Excel, PDF, or direct 1-click printer format.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => onNavigateToDailySummary(selectedDate)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold p-2.5 rounded-xl border border-white/10 text-center transition-colors flex items-center justify-center space-x-1"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daily Sheet</span>
            </button>
            <button
              onClick={onNavigateToMonthlySummary}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold p-2.5 rounded-xl shadow-sm text-center transition-colors flex items-center justify-center space-x-1"
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

