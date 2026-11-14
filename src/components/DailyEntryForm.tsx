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

  // Selected date, class & section
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  
  const initialSec = sections.find((s) => s.id === (initialSectionId || currentUser.assigned_section_id)) || sections[0];
  const [selectedClass, setSelectedClass] = useState<number>(initialSec.class_number);
  const [selectedSectionName, setSelectedSectionName] = useState<'A' | 'B'>(initialSec.name);

  // Navigation mode: true = editing form for selected section, false = selecting from classes directory
  const [isEditingForm, setIsEditingForm] = useState<boolean>(() => {
    return Boolean(initialSectionId || currentUser.assigned_section_id);
  });

  // Synchronize when initialSectionId changes from outside
  useEffect(() => {
    if (initialSectionId) {
      const sec = sections.find((s) => s.id === initialSectionId);
      if (sec) {
        setSelectedClass(sec.class_number);
        setSelectedSectionName(sec.name);
        setIsEditingForm(true);
      }
    }
  }, [initialSectionId]);

  // Active section item
  const currentSection = sections.find(
    (s) => s.class_number === selectedClass && s.name === selectedSectionName
  ) || sections[0];
  const selectedSectionId = currentSection.id;

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

  const [existingEntry, setExistingEntry] = useState<MdmEntry | null>(null);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);

  // Feedback messages
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isTeacher = currentUser.role === 'teacher';
  const isHeadmaster = currentUser.role === 'headmaster';

  // Check 1-Day Edit Lock
  const isPastOneDay = isEntryPastOneDayLock(selectedDate, todayStr);
  const isExplicitlyLocked = existingEntry?.locked ?? false;
  const isReadonlyForTeacher = isTeacher && (isPastOneDay || isExplicitlyLocked);

  // Holiday and Sunday checks
  const holidayCheck = StorageService.isHoliday(selectedDate);
  const sundayCheck = isSunday(selectedDate);

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

  const handleKeyDown = (field: keyof typeof counts, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = fieldOrder.indexOf(field);
      if (idx < fieldOrder.length - 1) {
        const nextField = fieldOrder[idx + 1];
        inputRefs.current[nextField]?.focus();
        inputRefs.current[nextField]?.select();
      } else {
        inputRefs.current[field]?.blur();
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
        remarks: '',
      },
      currentUser
    );

    if (result.success) {
      setExistingEntry(result.entry || null);
      setSuccessMsg(`Saved ${currentSection.display_name} for ${formatDateIndian(selectedDate)}.`);
      if (onSaved) onSaved();

      if (moveToNext) {
        if (selectedSectionName === 'A') {
          setSelectedSectionName('B');
        } else {
          const nextClass = selectedClass < 10 ? selectedClass + 1 : 6;
          setSelectedClass(nextClass);
          setSelectedSectionName('A');
        }
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

  // Completed count for selected date
  const completedSectionsCount = sections.reduce((acc, sec) => {
    const entry = StorageService.getEntry(selectedDate, sec.id);
    return acc + (entry ? 1 : 0);
  }, 0);

  // VIEW 1: DIRECTORY OF ALL CLASSES (When selecting which class to record)
  if (!isEditingForm) {
    return (
      <div className="space-y-4 pb-20">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToDashboard}
            className="text-xs font-medium text-zinc-600 hover:text-black bg-white border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-xs transition-all active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
            <Utensils className="w-3.5 h-3.5 text-zinc-400" />
            <span>Meal Attendance</span>
          </div>
        </div>

        {/* Date & Completion Header Card */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Attendance Date
            </span>
            <span className="text-[10px] font-mono text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md font-bold">
              {completedSectionsCount} / 10 Recorded
            </span>
          </div>

          {/* Date Selector */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono font-semibold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-950 focus:bg-white focus:border-black focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                selectedDate === todayStr
                  ? 'bg-black text-white border-black font-semibold shadow-xs'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              Today
            </button>
          </div>

          {/* Ratio Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                style={{ width: `${Math.round((completedSectionsCount / 10) * 100)}%` }}
                className="bg-black h-full transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>{Math.round((completedSectionsCount / 10) * 100)}% Recorded</span>
              <span>{10 - completedSectionsCount} Sections Pending</span>
            </div>
          </div>
        </div>

        {/* 5 Classes Directory (Click on section to record) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
            <span>Classes (6 to 10)</span>
            <span className="text-[11px] text-zinc-400">Tap a section to enter meals</span>
          </div>

          {[6, 7, 8, 9, 10].map((classNum) => {
            const secA = sections.find((s) => s.class_number === classNum && s.name === 'A');
            const secB = sections.find((s) => s.class_number === classNum && s.name === 'B');
            const entryA = secA ? StorageService.getEntry(selectedDate, secA.id) : null;
            const entryB = secB ? StorageService.getEntry(selectedDate, secB.id) : null;
            const enrA = secA ? StorageService.getEnrolmentForSection(secA.id) : null;
            const enrB = secB ? StorageService.getEnrolmentForSection(secB.id) : null;
            const classTotalMeals = (entryA?.totals.grand_total ?? 0) + (entryB?.totals.grand_total ?? 0);

            return (
              <div
                key={classNum}
                className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs space-y-3"
              >
                {/* Class Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {classNum}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-950">
                        Class {classNum}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {classNum <= 8 ? 'Upper Primary' : 'High School'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg text-zinc-900">
                      {classTotalMeals} Meals
                    </span>
                  </div>
                </div>

                {/* Sections A & B Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Section A */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass(classNum);
                      setSelectedSectionName('A');
                      setIsEditingForm(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between active:scale-95 ${
                      entryA
                        ? 'bg-zinc-50/80 border-zinc-200 hover:border-black'
                        : 'bg-white border-zinc-300 hover:border-black shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-zinc-200 text-zinc-900 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        A
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-zinc-950 truncate">Sec A</div>
                        <div className="text-[10px] font-mono text-zinc-400 truncate">
                          {enrA?.totals.grand_total ?? 0} Enr
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-mono">
                      {entryA ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px]">
                          {entryA.totals.grand_total}m
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-semibold bg-zinc-100 px-1.5 py-0.2 rounded text-[10px]">
                          + Record
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400 font-sans">Enter →</span>
                    </div>
                  </button>

                  {/* Section B */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass(classNum);
                      setSelectedSectionName('B');
                      setIsEditingForm(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between active:scale-95 ${
                      entryB
                        ? 'bg-zinc-50/80 border-zinc-200 hover:border-black'
                        : 'bg-white border-zinc-300 hover:border-black shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-zinc-200 text-zinc-900 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        B
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-zinc-950 truncate">Sec B</div>
                        <div className="text-[10px] font-mono text-zinc-400 truncate">
                          {enrB?.totals.grand_total ?? 0} Enr
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-mono">
                      {entryB ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px]">
                          {entryB.totals.grand_total}m
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-semibold bg-zinc-100 px-1.5 py-0.2 rounded text-[10px]">
                          + Record
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400 font-sans">Enter →</span>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // VIEW 2: MEAL ATTENDANCE ENTRY FORM (Clean, focused form for current section)
  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsEditingForm(false)}
          className="text-xs font-medium text-zinc-600 hover:text-black bg-white border border-zinc-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-xs transition-all active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Classes</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
          <span className="text-[11px] font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md">
            {formatDateIndian(selectedDate)}
          </span>
          {isHeadmaster && existingEntry && (
            <button
              onClick={handleToggleLock}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
              title={existingEntry.locked ? 'Unlock entry' : 'Lock entry'}
            >
              {existingEntry.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{existingEntry.locked ? 'Unlock' : 'Lock'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Class & Section Header Card (With Instant Section A / B Switcher) */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
              {selectedClass}{selectedSectionName}
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-base text-zinc-950 tracking-tight truncate">
                {currentSection.display_name}
              </h2>
              <span className="text-[10px] font-mono text-zinc-400 block truncate">
                {enrolment ? `${enrolment.totals.grand_total} Enrolled (${enrolment.totals.boys_total}B • ${enrolment.totals.girls_total}G)` : 'Enrolment Benchmark'}
              </span>
            </div>
          </div>

          {/* Quick Section A / B Toggle Pills */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 shrink-0">
            {(['A', 'B'] as const).map((secName) => {
              const isSecActive = selectedSectionName === secName;
              return (
                <button
                  key={secName}
                  type="button"
                  onClick={() => setSelectedSectionName(secName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    isSecActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  Sec {secName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Selector Row inside Card */}
        <div className="flex items-center space-x-2 pt-2 border-t border-zinc-100">
          <input
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs font-mono font-semibold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-black focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              selectedDate === todayStr
                ? 'bg-black text-white border-black font-semibold shadow-xs'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Today
          </button>
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

      {/* LIVE SECTION SUMMARY DOCK (Clean, High-End Mobile Card) */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-xs space-y-3">
        {/* Header Row: Label */}
        <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] font-mono font-semibold uppercase tracking-wider">
          <Utensils className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span>Live Meal Attendance</span>
        </div>

        {/* Main Number & Gender Split */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold font-mono text-zinc-950 tracking-tight">
              {grandTotal}
            </span>
            <span className="text-xs text-zinc-500 font-sans">
              meals entered
            </span>
          </div>
          <div className="text-xs font-mono text-zinc-500 text-right">
            <div>Boys: <strong className="text-zinc-900">{liveTotals.boys_total}</strong> <span className="text-[10px] text-zinc-400">({boysPercent}%)</span></div>
            <div>Girls: <strong className="text-zinc-900">{liveTotals.girls_total}</strong> <span className="text-[10px] text-zinc-400">({girlsPercent}%)</span></div>
          </div>
        </div>

        {/* Visual Ratio Progress Bar */}
        <div className="space-y-1 pt-0.5">
          <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex">
            <div 
              style={{ width: `${boysPercent}%` }} 
              className="bg-black h-full transition-all" 
              title={`Boys: ${liveTotals.boys_total} (${boysPercent}%)`} 
            />
            <div 
              style={{ width: `${girlsPercent}%` }} 
              className="bg-zinc-400 h-full transition-all" 
              title={`Girls: ${liveTotals.girls_total} (${girlsPercent}%)`} 
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Boys ({boysPercent}%)</span>
            <span>Girls ({girlsPercent}%)</span>
          </div>
        </div>

        {/* 4 Clean Caste Breakdown Boxes (SC, ST, BC, OC) */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono pt-1">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-1">
            <span className="text-zinc-400 block text-[10px] font-bold">SC</span>
            <span className="font-extrabold text-zinc-900 text-sm mt-0.5 block">{liveTotals.sc_total}</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-1">
            <span className="text-zinc-400 block text-[10px] font-bold">ST</span>
            <span className="font-extrabold text-zinc-900 text-sm mt-0.5 block">{liveTotals.st_total}</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-1">
            <span className="text-zinc-400 block text-[10px] font-bold">BC</span>
            <span className="font-extrabold text-zinc-900 text-sm mt-0.5 block">{liveTotals.bc_total}</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-1">
            <span className="text-zinc-400 block text-[10px] font-bold">OC</span>
            <span className="font-extrabold text-zinc-900 text-sm mt-0.5 block">{liveTotals.oc_total}</span>
          </div>
        </div>
      </div>

      {/* 4 CATEGORY INPUT CARDS (NO EXCEL TABLE!) */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
        <span className="font-semibold text-zinc-700">Enter Category Meal Counts</span>
        <span className="text-[10px] text-zinc-400">⌨️ Enter moves to next field</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {categories.map((cat) => {
          return (
            <div
              key={cat.key}
              className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 p-4 shadow-xs transition-all space-y-3"
            >
              {/* Category Card Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                  <div>
                    <div className="flex items-baseline space-x-1.5">
                      <h4 className="font-bold text-sm text-zinc-950 tracking-tight font-mono">
                        {cat.name}
                      </h4>
                      <span className="text-xs text-zinc-500 font-medium">
                        ({cat.fullName})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Category Total Badge */}
                <div className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border bg-zinc-100 text-zinc-900 border-zinc-200 shrink-0">
                  {cat.total} Meals
                </div>
              </div>

              {/* 2 Touch-Friendly Number Inputs (Boys & Girls) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Boys Input Block */}
                <div 
                  onClick={() => inputRefs.current[cat.boysKey]?.focus()}
                  className="bg-zinc-50/90 rounded-xl p-2.5 border border-zinc-200/80 focus-within:border-black focus-within:ring-1 focus-within:ring-black focus-within:bg-white transition-all cursor-text"
                >
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 font-mono">
                    <span>Boys</span>
                  </div>
                  <div className="flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.boysKey, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-black hover:border-zinc-400 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95 shadow-2xs"
                      title="Decrease by 1"
                    >
                      <Minus className="w-3 h-3" />
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
                      className="w-full min-w-0 text-center font-mono font-black text-lg text-zinc-950 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.boysKey, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-black hover:border-zinc-400 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95 shadow-2xs"
                      title="Increase by 1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Girls Input Block */}
                <div 
                  onClick={() => inputRefs.current[cat.girlsKey]?.focus()}
                  className="bg-zinc-50/90 rounded-xl p-2.5 border border-zinc-200/80 focus-within:border-black focus-within:ring-1 focus-within:ring-black focus-within:bg-white transition-all cursor-text"
                >
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 font-mono">
                    <span>Girls</span>
                  </div>
                  <div className="flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.girlsKey, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-black hover:border-zinc-400 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95 shadow-2xs"
                      title="Decrease by 1"
                    >
                      <Minus className="w-3 h-3" />
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
                      className="w-full min-w-0 text-center font-mono font-black text-lg text-zinc-950 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isReadonlyForTeacher}
                      onClick={() => handleStep(cat.girlsKey, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-black hover:border-zinc-400 flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 active:scale-95 shadow-2xs"
                      title="Increase by 1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTION BAR (Mobile Floating Dock) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
        <div className="text-xs font-mono text-zinc-500 text-center">
          {existingEntry ? (
            <span>Recorded: {formatDateIndian(existingEntry.entry_date)} by <strong>{existingEntry.created_by_name}</strong></span>
          ) : (
            <span>Ready to save entry for <strong>{currentSection.display_name}</strong></span>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            disabled={isReadonlyForTeacher}
            onClick={() => handleSave(false)}
            className="w-full bg-black hover:bg-zinc-800 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Save Section {selectedSectionName} Meals</span>
          </button>

          <button
            type="button"
            disabled={isReadonlyForTeacher}
            onClick={() => handleSave(true)}
            className="w-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 py-2.5 px-4 rounded-xl font-bold text-xs shadow-2xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Save and advance to next section"
          >
            <span>
              {selectedSectionName === 'A' 
                ? 'Save & Next: Section B' 
                : `Save & Next: Class ${selectedClass < 10 ? selectedClass + 1 : 6}`}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
