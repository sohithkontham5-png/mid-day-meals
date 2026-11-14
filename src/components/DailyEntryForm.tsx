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
  Clock, 
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Info
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

  const warnings: string[] = [];
  if (enrolment) {
    if (liveTotals.sc_total > enrolment.totals.sc_total) {
      warnings.push(`SC meals (${liveTotals.sc_total}) exceed enrolled SC (${enrolment.totals.sc_total})`);
    }
    if (liveTotals.st_total > enrolment.totals.st_total) {
      warnings.push(`ST meals (${liveTotals.st_total}) exceed enrolled ST (${enrolment.totals.st_total})`);
    }
    if (liveTotals.bc_total > enrolment.totals.bc_total) {
      warnings.push(`BC meals (${liveTotals.bc_total}) exceed enrolled BC (${enrolment.totals.bc_total})`);
    }
    if (liveTotals.oc_total > enrolment.totals.oc_total) {
      warnings.push(`OC meals (${liveTotals.oc_total}) exceed enrolled OC (${enrolment.totals.oc_total})`);
    }
    if (liveTotals.grand_total > enrolment.totals.grand_total) {
      warnings.push(`Grand total meals (${liveTotals.grand_total}) exceed total enrolled (${enrolment.totals.grand_total})`);
    }
  }

  const handleInputChange = (field: keyof typeof counts, rawValue: string) => {
    const sanitized = rawValue.replace(/[^0-9]/g, '');
    setCounts((prev) => ({ ...prev, [field]: sanitized }));
    setErrorMsg('');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header and Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-medium text-zinc-600 hover:text-black bg-white border border-zinc-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <span className="text-xs font-mono text-zinc-400">Fast Entry Mode</span>
      </div>

      {/* Main Entry Card */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Top Controls: Section & Date */}
        <div className="bg-zinc-50/60 p-4 sm:p-5 border-b border-zinc-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Section Pills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Class & Section
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sections.map((sec) => {
                  const isSelected = sec.id === selectedSectionId;
                  const isAssigned = sec.id === currentUser.assigned_section_id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                        isSelected
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span>{sec.display_name.replace('Class ', '')}</span>
                      {isAssigned && (
                        <span className={`ml-1 text-[9px] uppercase px-1 rounded ${
                          isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          Mine
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isTeacher && currentUser.assigned_section_id && currentUser.assigned_section_id !== selectedSectionId && (
                <div className="mt-2 text-[11px] text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                  <span>Entering for colleague as substitute. Activity is logged.</span>
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Date of Attendance
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  max={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg font-medium text-zinc-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border shrink-0 transition-colors ${
                    selectedDate === todayStr
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  Today
                </button>
              </div>

              <div className="mt-2 text-xs flex items-center space-x-2">
                {sundayCheck && (
                  <span className="text-zinc-700 font-mono text-[11px] font-semibold bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Sunday (School Closed)
                  </span>
                )}
                {holidayCheck.is_holiday && (
                  <span className="text-zinc-900 font-mono text-[11px] font-semibold bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                    Holiday: {holidayCheck.reason}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lock Notice Banner */}
        {isReadonlyForTeacher && (
          <div className="bg-zinc-100 border-b border-zinc-200 p-3.5 flex items-center space-x-2.5 text-zinc-800 text-xs">
            <Lock className="w-4 h-4 text-zinc-600 shrink-0" />
            <div>
              <span className="font-semibold">Entry Locked for Teachers: </span>
              <span className="text-zinc-600">
                {isExplicitlyLocked
                  ? 'Locked by Headmaster.'
                  : 'Entries older than 1 day are locked. Contact Headmaster to edit.'}
              </span>
            </div>
          </div>
        )}

        {/* Headmaster Lock/Unlock Controls */}
        {isHeadmaster && existingEntry && (
          <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-zinc-500">
              <span>Status: <strong className={existingEntry.locked ? 'text-black' : 'text-zinc-800'}>
                {existingEntry.locked ? 'Locked' : 'Unlocked'}
              </strong></span>
            </div>
            <button
              onClick={handleToggleLock}
              className="flex items-center space-x-1 px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 font-sans font-medium text-xs transition-colors"
            >
              {existingEntry.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{existingEntry.locked ? 'Unlock for Staff' : 'Lock Entry'}</span>
            </button>
          </div>
        )}

        {/* Enrolment Warnings */}
        {warnings.length > 0 && (
          <div className="bg-zinc-50 border-b border-zinc-200 p-3 sm:px-5">
            <div className="flex items-start space-x-2 text-zinc-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Threshold Alert:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-zinc-600 font-mono text-[11px]">
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
          <div className="bg-zinc-100 border-b border-zinc-200 p-3 sm:px-5 flex items-center space-x-2 text-zinc-900 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-zinc-900 border-b border-black p-3 sm:px-5 flex items-center space-x-2 text-white text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 8 Numbers Entry Grid */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                {currentSection.display_name} Meal Counts
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Enter counts (whole numbers ≥ 0). Totals calculate automatically.
              </p>
            </div>

            {enrolment && (
              <div className="text-right text-xs bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 font-mono">
                <span className="text-zinc-500">Enrolled: </span>
                <strong className="text-zinc-950 font-bold">{enrolment.totals.grand_total}</strong>
                <span className="text-zinc-400"> (B:{enrolment.totals.boys_total} / G:{enrolment.totals.girls_total})</span>
              </div>
            )}
          </div>

          {/* Form Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-zinc-600 text-xs font-semibold uppercase border-b border-zinc-200">
                  <th className="py-2.5 px-3 sm:px-4">Category</th>
                  <th className="py-2.5 px-2 sm:px-4 text-center">Boys Count</th>
                  <th className="py-2.5 px-2 sm:px-4 text-center">Girls Count</th>
                  <th className="py-2.5 px-3 sm:px-4 text-center bg-zinc-100/70">Caste Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm">
                
                {/* 1. SC Row */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-semibold text-zinc-900">
                    <div>SC (Scheduled Caste)</div>
                    {enrolment && (
                      <div className="text-[10px] text-zinc-400 font-mono">
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold font-mono text-base text-zinc-950 bg-zinc-50">
                    {liveTotals.sc_total}
                  </td>
                </tr>

                {/* 2. ST Row */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-semibold text-zinc-900">
                    <div>ST (Scheduled Tribe)</div>
                    {enrolment && (
                      <div className="text-[10px] text-zinc-400 font-mono">
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold font-mono text-base text-zinc-950 bg-zinc-50">
                    {liveTotals.st_total}
                  </td>
                </tr>

                {/* 3. BC Row */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-semibold text-zinc-900">
                    <div>BC (Backward Class)</div>
                    {enrolment && (
                      <div className="text-[10px] text-zinc-400 font-mono">
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold font-mono text-base text-zinc-950 bg-zinc-50">
                    {liveTotals.bc_total}
                  </td>
                </tr>

                {/* 4. OC Row */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-semibold text-zinc-900">
                    <div>OC (Other Castes / General)</div>
                    {enrolment && (
                      <div className="text-[10px] text-zinc-400 font-mono">
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
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
                      className="w-16 sm:w-24 h-10 text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold font-mono text-base text-zinc-950 bg-zinc-50">
                    {liveTotals.oc_total}
                  </td>
                </tr>

                {/* Computed Totals Row (High Contrast Vercel Black/White) */}
                <tr className="bg-zinc-950 text-white font-mono">
                  <td className="py-3 px-3 sm:px-4 uppercase tracking-wider text-xs font-sans font-bold">
                    Computed Totals
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-lg font-bold">
                    {liveTotals.boys_total} <span className="text-[10px] block font-sans text-zinc-400">Boys</span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-lg font-bold">
                    {liveTotals.girls_total} <span className="text-[10px] block font-sans text-zinc-400">Girls</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-center bg-zinc-900 font-extrabold text-xl">
                    {liveTotals.grand_total} <span className="text-[10px] block font-sans text-zinc-400 font-semibold">SECTION TOTAL</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Remarks / Menu Items (Optional)
            </label>
            <input
              type="text"
              disabled={isReadonlyForTeacher}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Sambar, Egg Curry served..."
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-mono text-zinc-400">
              {existingEntry ? (
                <span>Recorded: {formatDateIndian(existingEntry.entry_date)} by {existingEntry.created_by_name}</span>
              ) : (
                <span>New entry for {currentSection.display_name}</span>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isReadonlyForTeacher}
                onClick={() => handleSave(false)}
                className="flex-1 sm:flex-initial bg-black hover:bg-zinc-800 text-white px-5 py-2 rounded-lg font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Entry</span>
              </button>

              <button
                type="button"
                disabled={isReadonlyForTeacher}
                onClick={() => handleSave(true)}
                className="flex-1 sm:flex-initial bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-900 px-4 py-2 rounded-lg font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Save and advance to next section"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
