import React, { useState, useEffect, useRef } from 'react';
import { 
  SectionItem, 
  User, 
  MdmCounts, 
  Enrolment, 
  MdmEntry 
} from '../types';
import { StorageService } from '../lib/storage';
import { 
  computeTotals, 
  getTodayDateStr, 
  isSunday, 
  isFutureDate, 
  isEntryPastOneDayLock,
  formatDateIndian 
} from '../lib/calculations';
import { 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Info,
  Users,
  Utensils,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';

interface DailyEntryFormProps {
  currentUser: User;
  initialSectionId?: string;
  initialDate?: string;
  onSaved?: () => void;
  onBackToDashboard: () => void;
}

export const DailyEntryForm: React.FC<DailyEntryFormProps> = ({
  currentUser,
  initialSectionId,
  initialDate,
  onSaved,
  onBackToDashboard,
}) => {
  const sections = StorageService.getSections();
  const todayStr = getTodayDateStr();

  // Selected date & section
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSectionId || currentUser.assigned_section_id || sections[0].id
  );

  // Form values (string for input state)
  const [counts, setCounts] = useState<{
    sc_boys: string;
    sc_girls: string;
    st_boys: string;
    st_girls: string;
    bc_boys: string;
    bc_girls: string;
    oc_boys: string;
    oc_girls: string;
  }>({
    sc_boys: '',
    sc_girls: '',
    st_boys: '',
    st_girls: '',
    bc_boys: '',
    bc_girls: '',
    oc_boys: '',
    oc_girls: '',
  });

  const [remarks, setRemarks] = useState<string>('');
  const [existingEntry, setExistingEntry] = useState<MdmEntry | null>(null);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);

  // Feedback messages
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];
  const isTeacher = currentUser.role === 'teacher';
  const isHeadmaster = currentUser.role === 'headmaster';

  // Check 1-Day Edit Lock
  const isPastOneDay = isEntryPastOneDayLock(selectedDate, todayStr);
  const isExplicitlyLocked = existingEntry?.locked ?? false;
  const isReadonlyForTeacher = isTeacher && (isPastOneDay || isExplicitlyLocked);

  // Holiday and Sunday checks
  const holidayCheck = StorageService.isHoliday(selectedDate);
  const sundayCheck = isSunday(selectedDate);

  // Quick menu suggestions
  const quickMenuTags = [
    'Egg Curry & Rice',
    'Sambar & Rice',
    'Dal Tadka & Rice',
    'Veg Pulao & Raita',
    'Special Festival Meal'
  ];

  // Load existing entry and enrolment whenever date or section changes
  useEffect(() => {
    setSuccessMsg('');
    setErrorMsg('');

    const entry = StorageService.getEntry(selectedDate, selectedSectionId);
    setExistingEntry(entry || null);

    const enr = StorageService.getEnrolmentForSection(selectedSectionId);
    setEnrolment(enr || null);

    if (entry) {
      setCounts({
        sc_boys: entry.sc_boys !== null ? String(entry.sc_boys) : '',
        sc_girls: entry.sc_girls !== null ? String(entry.sc_girls) : '',
        st_boys: entry.st_boys !== null ? String(entry.st_boys) : '',
        st_girls: entry.st_girls !== null ? String(entry.st_girls) : '',
        bc_boys: entry.bc_boys !== null ? String(entry.bc_boys) : '',
        bc_girls: entry.bc_girls !== null ? String(entry.bc_girls) : '',
        oc_boys: entry.oc_boys !== null ? String(entry.oc_boys) : '',
        oc_girls: entry.oc_girls !== null ? String(entry.oc_girls) : '',
      });
      setRemarks(entry.remarks || '');
    } else {
      setCounts({
        sc_boys: '',
        sc_girls: '',
        st_boys: '',
        st_girls: '',
        bc_boys: '',
        bc_girls: '',
        oc_boys: '',
        oc_girls: '',
      });
      setRemarks('');
    }
  }, [selectedDate, selectedSectionId]);

  const parseVal = (val: string): number | null => {
    if (val.trim() === '') return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : Math.max(0, num);
  };

  const parsedCounts: MdmCounts = {
    sc_boys: parseVal(counts.sc_boys),
    sc_girls: parseVal(counts.sc_girls),
    st_boys: parseVal(counts.st_boys),
    st_girls: parseVal(counts.st_girls),
    bc_boys: parseVal(counts.bc_boys),
    bc_girls: parseVal(counts.bc_girls),
    oc_boys: parseVal(counts.oc_boys),
    oc_girls: parseVal(counts.oc_girls),
  };

  const liveTotals = computeTotals(parsedCounts);

  const handleInputChange = (field: keyof typeof counts, rawValue: string) => {
    const sanitized = rawValue.replace(/[^0-9]/g, '');
    setCounts((prev) => ({ ...prev, [field]: sanitized }));
    setErrorMsg('');
  };

  const fieldOrder: (keyof typeof counts)[] = [
    'sc_boys', 'sc_girls',
    'st_boys', 'st_girls',
    'bc_boys', 'bc_girls',
    'oc_boys', 'oc_girls'
  ];

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const remarksRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (field: keyof typeof counts, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = fieldOrder.indexOf(field);
      if (idx < fieldOrder.length - 1) {
        const nextField = fieldOrder[idx + 1];
        inputRefs.current[nextField]?.focus();
        inputRefs.current[nextField]?.select();
      } else {
        remarksRef.current?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep(field, 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep(field, -1);
    }
  };

  const handleStep = (field: keyof typeof counts, delta: number) => {
    if (isReadonlyForTeacher) return;
    const current = parseVal(counts[field]) || 0;
    const nextVal = Math.max(0, current + delta);
    setCounts((prev) => ({ ...prev, [field]: String(nextVal) }));
  };

  const handleSave = (moveToNext: boolean = false) => {
    if (isFutureDate(selectedDate, todayStr)) {
      setErrorMsg('Cannot record meals for future dates.');
      return;
    }

    if (isReadonlyForTeacher) {
      setErrorMsg('This entry is locked. Only Headmaster can edit entries older than 1 day.');
      return;
    }

    const result = StorageService.saveEntry(
      {
        section_id: selectedSectionId,
        entry_date: selectedDate,
        sc_boys: parsedCounts.sc_boys,
        sc_girls: parsedCounts.sc_girls,
        st_boys: parsedCounts.st_boys,
        st_girls: parsedCounts.st_girls,
        bc_boys: parsedCounts.bc_boys,
        bc_girls: parsedCounts.bc_girls,
        oc_boys: parsedCounts.oc_boys,
        oc_girls: parsedCounts.oc_girls,
        remarks,
      },
      currentUser
    );

    if (result.success) {
      setExistingEntry(result.entry || null);
      setSuccessMsg(`Saved ${currentSection.display_name} for ${formatDateIndian(selectedDate)}.`);
      if (onSaved) onSaved();

      if (moveToNext) {
        const currentIndex = sections.findIndex((s) => s.id === selectedSectionId);
        const nextIndex = (currentIndex + 1) % sections.length;
        setSelectedSectionId(sections[nextIndex].id);
      }
    } else {
      setErrorMsg(result.message || 'Failed to save entry.');
    }
  };

  const handleToggleLock = () => {
    if (!existingEntry || !isHeadmaster) return;
    const newLockState = !existingEntry.locked;
    const ok = StorageService.toggleEntryLock(existingEntry.id, newLockState, currentUser);
    if (ok) {
      setExistingEntry((prev) => (prev ? { ...prev, locked: newLockState } : null));
      setSuccessMsg(`Entry ${newLockState ? 'locked' : 'unlocked'}.`);
    }
  };

  // 4 Categories config for card rendering
  const categories = [
    {
      key: 'sc',
      name: 'SC',
      fullName: 'Scheduled Caste',
      boysKey: 'sc_boys' as keyof typeof counts,
      girlsKey: 'sc_girls' as keyof typeof counts,
      boysVal: counts.sc_boys,
      girlsVal: counts.sc_girls,
      total: liveTotals.sc_total,
      enrolledBoys: enrolment?.sc_boys ?? null,
      enrolledGirls: enrolment?.sc_girls ?? null,
      enrolledTotal: enrolment?.totals.sc_total ?? null,
    },
    {
      key: 'st',
      name: 'ST',
      fullName: 'Scheduled Tribe',
      boysKey: 'st_boys' as keyof typeof counts,
      girlsKey: 'st_girls' as keyof typeof counts,
      boysVal: counts.st_boys,
      girlsVal: counts.st_girls,
      total: liveTotals.st_total,
      enrolledBoys: enrolment?.st_boys ?? null,
      enrolledGirls: enrolment?.st_girls ?? null,
      enrolledTotal: enrolment?.totals.st_total ?? null,
    },
    {
      key: 'bc',
      name: 'BC',
      fullName: 'Backward Class',
      boysKey: 'bc_boys' as keyof typeof counts,
      girlsKey: 'bc_girls' as keyof typeof counts,
      boysVal: counts.bc_boys,
      girlsVal: counts.bc_girls,
      total: liveTotals.bc_total,
      enrolledBoys: enrolment?.bc_boys ?? null,
      enrolledGirls: enrolment?.bc_girls ?? null,
      enrolledTotal: enrolment?.totals.bc_total ?? null,
    },
    {
      key: 'oc',
      name: 'OC',
      fullName: 'Other Castes / General',
      boysKey: 'oc_boys' as keyof typeof counts,
      girlsKey: 'oc_girls' as keyof typeof counts,
      boysVal: counts.oc_boys,
      girlsVal: counts.oc_girls,
      total: liveTotals.oc_total,
      enrolledBoys: enrolment?.oc_boys ?? null,
      enrolledGirls: enrolment?.oc_girls ?? null,
      enrolledTotal: enrolment?.totals.oc_total ?? null,
    },
  ];

  // Visual percentages
  const grandTotal = liveTotals.grand_total;
  const boysPercent = grandTotal > 0 ? Math.round((liveTotals.boys_total / grandTotal) * 100) : 0;
  const girlsPercent = grandTotal > 0 ? 100 - boysPercent : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header and Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-medium text-zinc-600 hover:text-black bg-white border border-zinc-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
          <Utensils className="w-3.5 h-3.5 text-zinc-400" />
          <span>Daily Meal Record</span>
        </div>
      </div>

      {/* SECTION & DATE SELECTOR (Modern Vercel Card) */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-5">
        {/* Date Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Date of Attendance
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-sm font-mono font-semibold bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 focus:border-black focus:ring-1 focus:ring-black focus:outline-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  selectedDate === todayStr
                    ? 'bg-black text-white border-black font-semibold'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                Today
              </button>
            </div>
          </div>

          {/* Date alerts */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {sundayCheck && (
              <span className="text-zinc-600 font-mono text-xs font-semibold bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                Sunday (Closed)
              </span>
            )}
            {holidayCheck.is_holiday && (
              <span className="text-zinc-900 font-mono text-xs font-semibold bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-300">
                Holiday: {holidayCheck.reason}
              </span>
            )}
            {isReadonlyForTeacher && (
              <span className="text-amber-800 font-mono text-xs font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </span>
            )}
            {isHeadmaster && existingEntry && (
              <button
                onClick={handleToggleLock}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-medium transition-colors"
              >
                {existingEntry.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{existingEntry.locked ? 'Unlock' : 'Lock Entry'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Picker Pills Grid (Classes 6-10 with Section A and B) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Select Class & Section
            </label>
            <span className="text-xs font-mono text-zinc-500">
              Currently: <strong className="text-zinc-950 font-bold">{currentSection.display_name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[6, 7, 8, 9, 10].map((classNum) => {
              const secA = sections.find((s) => s.class_number === classNum && s.name === 'A');
              const secB = sections.find((s) => s.class_number === classNum && s.name === 'B');

              const isASelected = secA?.id === selectedSectionId;
              const isBSelected = secB?.id === selectedSectionId;

              // Check if entry exists for this date
              const entryA = secA ? StorageService.getEntry(selectedDate, secA.id) : null;
              const entryB = secB ? StorageService.getEntry(selectedDate, secB.id) : null;

              return (
                <div 
                  key={classNum} 
                  className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-2 flex flex-col justify-between"
                >
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase mb-1.5 px-1">
                    Class {classNum}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Section A Button */}
                    {secA && (
                      <button
                        type="button"
                        onClick={() => setSelectedSectionId(secA.id)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                          isASelected
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400'
                        }`}
                        title={`Class ${classNum} - Section A`}
                      >
                        <span>A</span>
                        {entryA && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isASelected ? 'bg-white' : 'bg-emerald-500'}`} />
                        )}
                      </button>
                    )}

                    {/* Section B Button */}
                    {secB && (
                      <button
                        type="button"
                        onClick={() => setSelectedSectionId(secB.id)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                          isBSelected
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400'
                        }`}
                        title={`Class ${classNum} - Section B`}
                      >
                        <span>B</span>
                        {entryB && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isBSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 flex items-center space-x-2 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-zinc-900 border border-black text-white rounded-xl p-3.5 flex items-center space-x-2 text-xs font-medium">
          <ShieldAlert className="w-4 h-4 text-white shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* LIVE SECTION SUMMARY DOCK (Executive, high contrast) */}
      <div className="bg-zinc-950 text-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                {currentSection.display_name} • Live Meal Count
              </span>
              {enrolment && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Enrolled: {enrolment.totals.grand_total}
                </span>
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-white tracking-tight">
              {grandTotal} <span className="text-sm font-normal font-sans text-zinc-400">meals entered</span>
            </div>
          </div>

          {/* Gender Split */}
          <div className="flex items-center space-x-4 text-sm font-mono sm:text-right">
            <div>
              <div className="text-zinc-400 text-xs font-sans">Boys</div>
              <div className="text-xl font-bold text-white">{liveTotals.boys_total}</div>
            </div>
            <div className="text-zinc-600">/</div>
            <div>
              <div className="text-zinc-400 text-xs font-sans">Girls</div>
              <div className="text-xl font-bold text-white">{liveTotals.girls_total}</div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar & Category Badges */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden flex">
            <div 
              style={{ width: `${boysPercent}%` }} 
              className="bg-white h-full transition-all" 
              title={`Boys: ${liveTotals.boys_total} (${boysPercent}%)`} 
            />
            <div 
              style={{ width: `${girlsPercent}%` }} 
              className="bg-zinc-500 h-full transition-all" 
              title={`Girls: ${liveTotals.girls_total} (${girlsPercent}%)`} 
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 pt-1">
            <div className="flex items-center space-x-2">
              <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-200">
                SC: <strong className="text-white">{liveTotals.sc_total}</strong>
              </span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-200">
                ST: <strong className="text-white">{liveTotals.st_total}</strong>
              </span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-200">
                BC: <strong className="text-white">{liveTotals.bc_total}</strong>
              </span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-200">
                OC: <strong className="text-white">{liveTotals.oc_total}</strong>
              </span>
            </div>

            {enrolment && grandTotal > enrolment.totals.grand_total && (
              <span className="text-amber-400 font-sans text-xs flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Exceeds enrolment ({enrolment.totals.grand_total})</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4 CATEGORY INPUT CARDS (NO EXCEL TABLE!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-zinc-500 px-1 gap-1">
        <span className="font-semibold text-zinc-700">Enter Category Meal Counts</span>
        <span className="text-[11px] text-zinc-400">⌨️ Tip: Type numbers directly • Press Enter or Tab to jump to the next field</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const isOverCapacity = cat.enrolledTotal !== null && cat.total > cat.enrolledTotal;

          return (
            <div
              key={cat.key}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all space-y-4 ${
                isOverCapacity 
                  ? 'border-amber-300 ring-1 ring-amber-300/50' 
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {/* Category Card Header */}
              <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-black" />
                    <h4 className="font-bold text-base text-zinc-950 tracking-tight">
                      {cat.name}
                    </h4>
                    <span className="text-xs text-zinc-400 font-medium">
                      ({cat.fullName})
                    </span>
                  </div>
                  {cat.enrolledTotal !== null && (
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      Enrolled: {cat.enrolledTotal} ({cat.enrolledBoys} B • {cat.enrolledGirls} G)
                    </div>
                  )}
                </div>

                {/* Live Category Total Badge */}
                <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  isOverCapacity
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-200'
                }`}>
                  {cat.total} Meals
                </div>
              </div>

              {/* 2 Touch-Friendly Number Inputs (Boys & Girls) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Boys Input Block */}
                <div 
                  onClick={() => inputRefs.current[cat.boysKey]?.focus()}
                  className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 focus-within:border-black focus-within:ring-1 focus-within:ring-black focus-within:bg-white transition-all cursor-text"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                    <span>Boys</span>
                    {cat.enrolledBoys !== null && (
                      <span className="text-[10px] text-zinc-400 lowercase">max ~{cat.enrolledBoys}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.boysKey, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95"
                      title="Decrease by 1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={(el) => { inputRefs.current[cat.boysKey] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={cat.boysVal}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => handleKeyDown(cat.boysKey, e)}
                      onChange={(e) => handleInputChange(cat.boysKey, e.target.value)}
                      className="w-full text-center font-mono font-black text-xl text-zinc-950 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.boysKey, 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95"
                      title="Increase by 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Girls Input Block */}
                <div 
                  onClick={() => inputRefs.current[cat.girlsKey]?.focus()}
                  className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 focus-within:border-black focus-within:ring-1 focus-within:ring-black focus-within:bg-white transition-all cursor-text"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">
                    <span>Girls</span>
                    {cat.enrolledGirls !== null && (
                      <span className="text-[10px] text-zinc-400 lowercase">max ~{cat.enrolledGirls}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.girlsKey, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95"
                      title="Decrease by 1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={(el) => { inputRefs.current[cat.girlsKey] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={cat.girlsVal}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => handleKeyDown(cat.girlsKey, e)}
                      onChange={(e) => handleInputChange(cat.girlsKey, e.target.value)}
                      className="w-full text-center font-mono font-black text-xl text-zinc-950 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.girlsKey, 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95"
                      title="Increase by 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Over Capacity Warning */}
              {isOverCapacity && (
                <div className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Count ({cat.total}) exceeds enrolled strength ({cat.enrolledTotal})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* REMARKS & QUICK MENU SUGGESTIONS CARD */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Remarks / Menu Served
        </label>

        {/* Quick Menu Selection Chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickMenuTags.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={isReadonlyForTeacher}
              onClick={() => setRemarks(tag)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                remarks === tag
                  ? 'bg-black text-white border-black font-semibold'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <input
          ref={remarksRef}
          type="text"
          disabled={isReadonlyForTeacher}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Custom notes, e.g. Special sweet distributed, Rice with sambar..."
          className="w-full px-3.5 py-2.5 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
        />
      </div>

      {/* ACTION BAR (Vercel Style Floating Dock) */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-mono text-zinc-500 text-center sm:text-left">
          {existingEntry ? (
            <span>Recorded: {formatDateIndian(existingEntry.entry_date)} by <strong>{existingEntry.created_by_name}</strong></span>
          ) : (
            <span>Ready to save entry for <strong>{currentSection.display_name}</strong></span>
          )}
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            type="button"
            disabled={isReadonlyForTeacher}
            onClick={() => handleSave(false)}
            className="flex-1 sm:flex-initial bg-black hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-sm flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Entry</span>
          </button>

          <button
            type="button"
            disabled={isReadonlyForTeacher}
            onClick={() => handleSave(true)}
            className="flex-1 sm:flex-initial bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-900 px-5 py-2.5 rounded-lg font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Save and advance to next section"
          >
            <span>Save & Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
