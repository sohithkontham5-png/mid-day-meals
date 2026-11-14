import React, { useState, useEffect } from 'react';
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
  ArrowRight, 
  Clock, 
  Calendar, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
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

  // Form values (null means not entered yet)
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

  // Convert input string to integer or null
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

  // Live computed totals
  const liveTotals = computeTotals(parsedCounts);

  // Enrolment comparison warnings
  const warnings: string[] = [];
  if (enrolment) {
    if (liveTotals.sc_total > enrolment.totals.sc_total) {
      warnings.push(`SC meal count (${liveTotals.sc_total}) exceeds enrolled SC students (${enrolment.totals.sc_total})`);
    }
    if (liveTotals.st_total > enrolment.totals.st_total) {
      warnings.push(`ST meal count (${liveTotals.st_total}) exceeds enrolled ST students (${enrolment.totals.st_total})`);
    }
    if (liveTotals.bc_total > enrolment.totals.bc_total) {
      warnings.push(`BC meal count (${liveTotals.bc_total}) exceeds enrolled BC students (${enrolment.totals.bc_total})`);
    }
    if (liveTotals.oc_total > enrolment.totals.oc_total) {
      warnings.push(`OC meal count (${liveTotals.oc_total}) exceeds enrolled OC students (${enrolment.totals.oc_total})`);
    }
    if (liveTotals.grand_total > enrolment.totals.grand_total) {
      warnings.push(`Grand total meals (${liveTotals.grand_total}) exceeds total enrolled students (${enrolment.totals.grand_total})`);
    }
  }

  const handleInputChange = (field: keyof typeof counts, rawValue: string) => {
    // Only accept numbers or empty string
    const sanitized = rawValue.replace(/[^0-9]/g, '');
    setCounts((prev) => ({ ...prev, [field]: sanitized }));
    setErrorMsg('');
  };

  const handleSave = (moveToNext: boolean = false) => {
    if (isFutureDate(selectedDate, todayStr)) {
      setErrorMsg('Cannot enter meals for future dates.');
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
      setSuccessMsg(`Successfully saved ${currentSection.display_name} for ${formatDateIndian(selectedDate)}!`);
      if (onSaved) onSaved();

      if (moveToNext) {
        // Move to the next section in the list
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
      setSuccessMsg(`Entry ${newLockState ? 'locked' : 'unlocked'} successfully.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header and Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500">Fast Entry Mode</span>
        </div>
      </div>

      {/* Main Entry Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Top Controls: Date & Section Picker */}
        <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Class & Section Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Class & Section
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sections.map((sec) => {
                  const isSelected = sec.id === selectedSectionId;
                  const isAssigned = sec.id === currentUser.assigned_section_id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <span>{sec.display_name.replace('Class ', '')}</span>
                      {isAssigned && (
                        <span className={`ml-1 text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                          isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Mine
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Substitute / Proxy Notice if entering another section */}
              {isTeacher && currentUser.assigned_section_id && currentUser.assigned_section_id !== selectedSectionId && (
                <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Entering for colleague as substitute. Your login will be recorded in the audit trail.</span>
                </div>
              )}
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Date of Attendance
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  max={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border shrink-0 transition-colors ${
                    selectedDate === todayStr
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Today
                </button>
              </div>

              {/* Day Notice */}
              <div className="mt-2 text-xs flex items-center space-x-2">
                {sundayCheck && (
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Sunday (School Closed)
                  </span>
                )}
                {holidayCheck.is_holiday && (
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Holiday: {holidayCheck.reason}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lock Notice Banner (1-Day Lock rule) */}
        {isReadonlyForTeacher && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-amber-900">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-sm">Entry Locked for Teachers</div>
                <div className="text-xs text-amber-800">
                  {isExplicitlyLocked
                    ? 'This entry has been locked by the Headmaster.'
                    : 'Entries older than 1 day are automatically locked. Please request Headmaster to modify.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Headmaster Lock/Unlock Controls */}
        {isHeadmaster && existingEntry && (
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <span>Status: <strong className={existingEntry.locked ? 'text-rose-600' : 'text-emerald-600'}>
                {existingEntry.locked ? 'Locked' : 'Unlocked'}
              </strong></span>
              <span>•</span>
              <span>Last updated: {existingEntry.updated_by_name || 'Admin'}</span>
            </div>
            <button
              onClick={handleToggleLock}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                existingEntry.locked
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
            >
              {existingEntry.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{existingEntry.locked ? 'Unlock for Staff' : 'Lock Entry'}</span>
            </button>
          </div>
        )}

        {/* Enrolment Warning Banner */}
        {warnings.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 sm:px-5">
            <div className="flex items-start space-x-2 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Enrolment Threshold Warning:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-amber-800">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success and Error Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 sm:px-5 flex items-center space-x-2 text-emerald-900 text-xs sm:text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 sm:px-5 flex items-center space-x-2 text-rose-900 text-xs sm:text-sm font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CORE FEATURE 1: 8 Numbers Entry Grid */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                {currentSection.display_name} Meal Counts
              </h3>
              <p className="text-xs text-slate-500">
                Enter whole numbers (0 or more). Totals calculate in real-time.
              </p>
            </div>

            {enrolment && (
              <div className="text-right text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-500">Enrolled Strength: </span>
                <strong className="text-slate-800 font-extrabold">{enrolment.totals.grand_total}</strong>
                <span className="text-slate-400"> (B:{enrolment.totals.boys_total} / G:{enrolment.totals.girls_total})</span>
              </div>
            )}
          </div>

          {/* Form Grid */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-xs font-extrabold uppercase border-b border-slate-200">
                  <th className="py-3 px-3 sm:px-4">Category</th>
                  <th className="py-3 px-2 sm:px-4 text-center">Boys Count</th>
                  <th className="py-3 px-2 sm:px-4 text-center">Girls Count</th>
                  <th className="py-3 px-3 sm:px-4 text-center bg-slate-200/60">Caste Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                
                {/* 1. SC Row */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>SC (Scheduled Caste)</span>
                    </div>
                    {enrolment && (
                      <div className="text-[10px] text-slate-400 pl-4.5">
                        Enrolled: {enrolment.totals.sc_total} (B:{enrolment.sc_boys} G:{enrolment.sc_girls})
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.sc_boys}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('sc_boys', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.sc_girls}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('sc_girls', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-black text-base text-slate-800 bg-slate-50/60">
                    {liveTotals.sc_total}
                  </td>
                </tr>

                {/* 2. ST Row */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>ST (Scheduled Tribe)</span>
                    </div>
                    {enrolment && (
                      <div className="text-[10px] text-slate-400 pl-4.5">
                        Enrolled: {enrolment.totals.st_total} (B:{enrolment.st_boys} G:{enrolment.st_girls})
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.st_boys}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('st_boys', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.st_girls}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('st_girls', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-black text-base text-slate-800 bg-slate-50/60">
                    {liveTotals.st_total}
                  </td>
                </tr>

                {/* 3. BC Row */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>BC (Backward Class)</span>
                    </div>
                    {enrolment && (
                      <div className="text-[10px] text-slate-400 pl-4.5">
                        Enrolled: {enrolment.totals.bc_total} (B:{enrolment.bc_boys} G:{enrolment.bc_girls})
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.bc_boys}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('bc_boys', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.bc_girls}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('bc_girls', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-black text-base text-slate-800 bg-slate-50/60">
                    {liveTotals.bc_total}
                  </td>
                </tr>

                {/* 4. OC Row */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>OC (Other Castes / General)</span>
                    </div>
                    {enrolment && (
                      <div className="text-[10px] text-slate-400 pl-4.5">
                        Enrolled: {enrolment.totals.oc_total} (B:{enrolment.oc_boys} G:{enrolment.oc_girls})
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.oc_boys}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('oc_boys', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-2 sm:px-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      disabled={isReadonlyForTeacher}
                      value={counts.oc_girls}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleInputChange('oc_girls', e.target.value)}
                      className="w-16 sm:w-24 h-11 text-center font-bold text-base sm:text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-black text-base text-slate-800 bg-slate-50/60">
                    {liveTotals.oc_total}
                  </td>
                </tr>

                {/* Computed Totals Row */}
                <tr className="bg-emerald-50/90 border-t-2 border-emerald-300 font-extrabold text-emerald-950">
                  <td className="py-3 px-3 sm:px-4 uppercase tracking-wider text-xs">
                    Live Computed Totals
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-lg font-black text-emerald-900">
                    {liveTotals.boys_total} <span className="text-[10px] block font-semibold text-emerald-700">Boys</span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-lg font-black text-emerald-900">
                    {liveTotals.girls_total} <span className="text-[10px] block font-semibold text-emerald-700">Girls</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-center bg-emerald-600 text-white font-black text-xl rounded-br-xl shadow-inner">
                    {liveTotals.grand_total} <span className="text-[10px] block font-bold text-emerald-100">GRAND TOTAL</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Remarks / Menu Items Served (Optional)
            </label>
            <input
              type="text"
              disabled={isReadonlyForTeacher}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Sambar, Egg Curry, Banana served..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {existingEntry ? (
                <span>Recorded on {new Date(existingEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {existingEntry.created_by_name}</span>
              ) : (
                <span>New entry for {currentSection.display_name}</span>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isReadonlyForTeacher}
                onClick={() => handleSave(false)}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-sm shadow-emerald-200 flex items-center justify-center space-x-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </button>

              <button
                type="button"
                disabled={isReadonlyForTeacher}
                onClick={() => handleSave(true)}
                className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Save this section and automatically load the next section"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
