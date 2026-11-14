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
  Filter, 
  CheckCircle2, 
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
      <div className="print:hidden bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
            Official Monthly Register
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
            {monthNames[selectedMonth - 1]} {selectedYear} MDM Summary
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {school.name} • Academic Year {academicYear.name}
          </p>
        </div>

        {/* Filter and Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector navigation */}
          <div className="flex items-center space-x-1 bg-white border border-zinc-200 p-0.5 rounded-lg shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-semibold text-zinc-900 px-2 min-w-[80px] text-center">
              {monthNames[selectedMonth - 1].substring(0, 3)} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scope Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
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
            className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download formatted Excel sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportMonthlySummaryToPDF(selectedYear, selectedMonth, school)}
            className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Download formatted PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            title="Print Monthly Register"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Monthly Metric Cards (Hidden in print) */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm text-center">
          <div className="text-xs font-semibold uppercase text-zinc-500">Working Days</div>
          <div className="text-2xl font-black font-mono text-zinc-950 mt-1">{summary.working_days}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Excl. Sundays & Holidays</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm text-center">
          <div className="text-xs font-semibold uppercase text-zinc-500">Days Meals Served</div>
          <div className="text-2xl font-black font-mono text-zinc-950 mt-1">{summary.days_with_meals}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Recorded Days</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm text-center">
          <div className="text-xs font-semibold uppercase text-zinc-500">Total Meals Served</div>
          <div className="text-2xl font-black font-mono text-zinc-950 mt-1">{summary.total_meals}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Month Grand Sum</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm text-center">
          <div className="text-xs font-semibold uppercase text-zinc-500">Daily Average Meals</div>
          <div className="text-2xl font-black font-mono text-zinc-950 mt-1">{summary.average_meals_per_day}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Per Served Day</div>
        </div>
      </div>

      {/* Main Monthly Register Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Print Header */}
        <div className="hidden print:block text-center p-4 border-b border-zinc-300">
          <h1 className="text-xl font-bold uppercase">{school.name}</h1>
          <h2 className="text-sm font-semibold uppercase mt-0.5">
            MONTHLY MID-DAY MEAL (MDM) REGISTER - {monthNames[selectedMonth - 1].toUpperCase()} {selectedYear}
          </h2>
          <div className="text-xs text-zinc-600 mt-0.5 font-mono">
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
                <th className="py-1 px-2 bg-zinc-900 text-white font-extrabold">TOTAL</th>
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

        {/* Printable Footer Signatures */}
        <div className="hidden print:flex items-center justify-between p-8 pt-16 text-xs font-bold text-zinc-950 font-sans">
          <div>Signature of MDM Incharge / Cook</div>
          <div>Signature of Headmaster / Principal</div>
        </div>
      </div>
    </div>
  );
};
