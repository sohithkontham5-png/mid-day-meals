import React, { useState } from 'react';
import { User, School, AcademicYear } from '../types';
import { StorageService } from '../lib/storage';
import { formatDateIndian } from '../lib/calculations';
import { exportMonthlySummaryToExcel } from '../lib/excelExport';
import { exportMonthlySummaryToPDF } from '../lib/pdfExport';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MonthlySummaryViewProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  currentUser,
  school,
  academicYear,
}) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [filterType, setFilterType] = useState<'all' | 'G1' | 'G2' | string>('all');

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

  return (
    <div className="space-y-6 pb-16 print:p-0">
      {/* Control Bar (Hidden on Print) */}
      <div className="print:hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
            Official Monthly Register
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
            {monthNames[selectedMonth - 1]} {selectedYear} MDM Summary
          </h2>
          <p className="text-xs text-slate-500">
            {school.name} • Academic Year {academicYear.name}
          </p>
        </div>

        {/* Filter and Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector navigation */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 min-w-[90px] text-center">
              {monthNames[selectedMonth - 1].substring(0, 3)} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scope Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Classes (School Grand Total)</option>
              <option value="G1">Group 1 (Classes 6, 7, 8)</option>
              <option value="G2">Group 2 (Classes 9, 10)</option>
              <optgroup label="Specific Section">
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.display_name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Export Actions */}
          <button
            onClick={() => exportMonthlySummaryToExcel(selectedYear, selectedMonth, school)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download formatted Excel sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportMonthlySummaryToPDF(selectedYear, selectedMonth, school)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download formatted PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            title="Print Monthly Register"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Monthly Metric Cards (Hidden in print) */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-500 uppercase">Working Days</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{summary.working_days}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Excludes Sundays & Holidays</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-500 uppercase">Days Meals Served</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{summary.days_with_meals}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">With recorded meals</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Meals Served</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{summary.total_meals}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Month grand sum</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-500 uppercase">Daily Average Meals</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{summary.average_meals_per_day}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Per served day</div>
        </div>
      </div>

      {/* Main Monthly Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Print Header */}
        <div className="hidden print:block text-center p-4 border-b border-slate-300">
          <h1 className="text-xl font-bold uppercase">{school.name}</h1>
          <h2 className="text-sm font-semibold uppercase mt-0.5">
            MONTHLY MID-DAY MEAL (MDM) REGISTER - {monthNames[selectedMonth - 1].toUpperCase()} {selectedYear}
          </h2>
          <div className="text-xs text-slate-600 mt-0.5">
            School Code: {school.code || '-'} • Working Days: {summary.working_days} • Days Served: {summary.days_with_meals} • Total Meals: {summary.total_meals} • Daily Average: {summary.average_meals_per_day}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              {/* Header row 1 */}
              <tr className="bg-slate-800 text-white font-extrabold text-[11px] uppercase">
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-700 w-20">Date</th>
                <th rowSpan={2} className="py-2.5 px-1 border-r border-slate-700 w-12">Day</th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-900/60">SC</th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-800/80">ST</th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-900/60">BC</th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-slate-800/80">OC</th>
                <th colSpan={3} className="py-1 px-1 border-r border-slate-700 bg-emerald-800">TOTALS</th>
                <th rowSpan={2} className="py-2.5 px-2 text-left min-w-[120px]">Remarks / Status</th>
              </tr>
              {/* Header row 2 */}
              <tr className="bg-slate-700 text-slate-200 font-bold text-[10px] uppercase border-b border-slate-600">
                <th className="py-1 px-1 border-r border-slate-600">B</th>
                <th className="py-1 px-1 border-r border-slate-600">G</th>
                <th className="py-1 px-1 border-r border-slate-600 bg-slate-800 text-white">Tot</th>

                <th className="py-1 px-1 border-r border-slate-600">B</th>
                <th className="py-1 px-1 border-r border-slate-600">G</th>
                <th className="py-1 px-1 border-r border-slate-600 bg-slate-800 text-white">Tot</th>

                <th className="py-1 px-1 border-r border-slate-600">B</th>
                <th className="py-1 px-1 border-r border-slate-600">G</th>
                <th className="py-1 px-1 border-r border-slate-600 bg-slate-800 text-white">Tot</th>

                <th className="py-1 px-1 border-r border-slate-600">B</th>
                <th className="py-1 px-1 border-r border-slate-600">G</th>
                <th className="py-1 px-1 border-r border-slate-600 bg-slate-800 text-white">Tot</th>

                <th className="py-1 px-1.5 border-r border-slate-600 bg-emerald-900 text-white font-extrabold">Boys</th>
                <th className="py-1 px-1.5 border-r border-slate-600 bg-emerald-900 text-white font-extrabold">Girls</th>
                <th className="py-1 px-2 bg-emerald-600 text-white font-black">TOTAL</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              {summary.rows.map((row) => {
                const isSundayRow = row.is_sunday;
                const isHolidayRow = row.is_holiday;
                const isOffDay = isSundayRow || isHolidayRow;

                return (
                  <tr
                    key={row.date}
                    className={`transition-colors ${
                      isSundayRow
                        ? 'bg-rose-50/70 text-rose-900'
                        : isHolidayRow
                        ? 'bg-amber-50/70 text-amber-900'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-1.5 px-2 font-mono font-bold text-slate-800 border-r border-slate-100">
                      {row.date.split('-')[2]}
                    </td>
                    <td className="py-1.5 px-1 font-semibold text-[11px] border-r border-slate-100">
                      {row.day_name}
                    </td>

                    {/* SC */}
                    <td className="border-r border-slate-100">{row.is_entered ? row.sc_boys : '-'}</td>
                    <td className="border-r border-slate-100">{row.is_entered ? row.sc_girls : '-'}</td>
                    <td className="font-bold bg-slate-50/80 border-r border-slate-100">{row.is_entered ? row.sc_total : '-'}</td>

                    {/* ST */}
                    <td className="border-r border-slate-100">{row.is_entered ? row.st_boys : '-'}</td>
                    <td className="border-r border-slate-100">{row.is_entered ? row.st_girls : '-'}</td>
                    <td className="font-bold bg-slate-50/80 border-r border-slate-100">{row.is_entered ? row.st_total : '-'}</td>

                    {/* BC */}
                    <td className="border-r border-slate-100">{row.is_entered ? row.bc_boys : '-'}</td>
                    <td className="border-r border-slate-100">{row.is_entered ? row.bc_girls : '-'}</td>
                    <td className="font-bold bg-slate-50/80 border-r border-slate-100">{row.is_entered ? row.bc_total : '-'}</td>

                    {/* OC */}
                    <td className="border-r border-slate-100">{row.is_entered ? row.oc_boys : '-'}</td>
                    <td className="border-r border-slate-100">{row.is_entered ? row.oc_girls : '-'}</td>
                    <td className="font-bold bg-slate-50/80 border-r border-slate-100">{row.is_entered ? row.oc_total : '-'}</td>

                    {/* Totals */}
                    <td className="font-bold bg-emerald-50/40 border-r border-slate-100">{row.is_entered ? row.boys_total : '-'}</td>
                    <td className="font-bold bg-emerald-50/40 border-r border-slate-100">{row.is_entered ? row.girls_total : '-'}</td>
                    <td className="font-black text-emerald-800 bg-emerald-50/80 border-r border-slate-100">{row.is_entered ? row.grand_total : '-'}</td>

                    {/* Status Column */}
                    <td className="text-left px-2 text-[11px] truncate">
                      {isSundayRow ? (
                        <span className="font-bold text-rose-600">Sunday</span>
                      ) : isHolidayRow ? (
                        <span className="font-bold text-amber-700">Holiday: {row.holiday_reason}</span>
                      ) : row.is_entered ? (
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Meals Served</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not entered</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* MONTH TOTALS ROW */}
              <tr className="bg-emerald-700 text-white font-black text-xs border-t-2 border-emerald-800">
                <td colSpan={2} className="py-2.5 px-2 text-center uppercase tracking-wider">
                  TOTAL ({summary.days_with_meals} Days)
                </td>

                <td className="border-l border-emerald-600">-</td>
                <td>-</td>
                <td className="bg-emerald-800">{summary.totals.sc_total}</td>

                <td className="border-l border-emerald-600">-</td>
                <td>-</td>
                <td className="bg-emerald-800">{summary.totals.st_total}</td>

                <td className="border-l border-emerald-600">-</td>
                <td>-</td>
                <td className="bg-emerald-800">{summary.totals.bc_total}</td>

                <td className="border-l border-emerald-600">-</td>
                <td>-</td>
                <td className="bg-emerald-800">{summary.totals.oc_total}</td>

                <td className="bg-emerald-900 text-sm">{summary.totals.boys_total}</td>
                <td className="bg-emerald-900 text-sm">{summary.totals.girls_total}</td>
                <td className="bg-amber-400 text-slate-900 text-base font-black">{summary.totals.grand_total}</td>

                <td className="text-left px-2 text-emerald-100 font-bold">
                  Avg: {summary.average_meals_per_day} meals/day
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

