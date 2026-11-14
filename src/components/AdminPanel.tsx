import React, { useState } from 'react';
import { User, School, AcademicYear, Enrolment, Holiday, SectionItem } from '../types';
import { StorageService } from '../lib/storage';
import { formatDateIndian } from '../lib/calculations';
import { 
  Users, 
  Calendar, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  School as SchoolIcon,
  Edit3,
  X,
  Minus,
  AlertTriangle,
  UserCheck,
  Shield,
  KeyRound,
  Phone,
  LayoutGrid
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  onUpdateSchool: (school: School) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  school,
  academicYear,
  onUpdateSchool,
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'enrolment' | 'holidays' | 'school'>('enrolment');

  // Staff State
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserPin, setEditUserPin] = useState('');
  const [editUserSection, setEditUserSection] = useState('');

  // Add Staff State
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'teacher' | 'headmaster' | 'viewer'>('teacher');
  const [newStaffSection, setNewStaffSection] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('1234');

  // Enrolment State
  const sections = StorageService.getSections();
  const [enrolments, setEnrolments] = useState<Enrolment[]>(StorageService.getEnrolments());
  const [editingEnrSectionId, setEditingEnrSectionId] = useState<string | null>(null);
  const [enrForm, setEnrForm] = useState<{
    sc_boys: number; sc_girls: number;
    st_boys: number; st_girls: number;
    bc_boys: number; bc_girls: number;
    oc_boys: number; oc_girls: number;
  }>({
    sc_boys: 0, sc_girls: 0,
    st_boys: 0, st_girls: 0,
    bc_boys: 0, bc_girls: 0,
    oc_boys: 0, oc_girls: 0,
  });

  // Holiday State
  const [holidays, setHolidays] = useState<Holiday[]>(StorageService.getHolidays());
  const [newHolDate, setNewHolDate] = useState('');
  const [newHolReason, setNewHolReason] = useState('');

  // School Edit State
  const [schoolName, setSchoolName] = useState(school.name);
  const [schoolCode, setSchoolCode] = useState(school.code || '');
  const [schoolAddress, setSchoolAddress] = useState(school.address);
  const [schoolDistrict, setSchoolDistrict] = useState(school.district || '');
  const [schoolState, setSchoolState] = useState(school.state || '');

  // Feedback
  const [statusMsg, setStatusMsg] = useState('');

  const showFeedback = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Staff Handlers
  const handleStartEditUser = (u: User) => {
    setEditingUserId(u.id);
    setEditUserName(u.name);
    setEditUserPhone(u.phone_or_email);
    setEditUserPin(u.pin);
    setEditUserSection(u.assigned_section_id || '');
  };

  const handleSaveUser = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const sec = sections.find((s) => s.id === editUserSection);
        return {
          ...u,
          name: editUserName,
          phone_or_email: editUserPhone,
          pin: editUserPin,
          assigned_section_id: editUserSection || undefined,
          assigned_section_name: sec ? sec.display_name : undefined,
        };
      }
      return u;
    });

    const targetUser = updated.find((u) => u.id === userId);
    if (targetUser) {
      StorageService.saveUsers(updated);
      StorageService.addAuditLog({
        entity: 'users',
        entity_id: targetUser.id,
        action: 'UPDATE',
        old_json: users.find((u) => u.id === userId),
        new_json: targetUser,
        user_id: currentUser.id,
        user_name: currentUser.name,
      });
    }
    setUsers(StorageService.getUsers());
    setEditingUserId(null);
    showFeedback('Staff details updated.');
  };

  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const sec = sections.find((s) => s.id === newStaffSection);
    const added = StorageService.addStaffUser({
      name: newStaffName.trim(),
      phone_or_email: newStaffPhone.trim() || 'Not provided',
      role: newStaffRole,
      pin: newStaffPin || '1234',
      school_id: school.id,
      assigned_section_id: newStaffSection || undefined,
      assigned_section_name: sec ? sec.display_name : undefined,
    }, currentUser);

    setUsers(StorageService.getUsers());
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffSection('');
    setNewStaffPin('1234');
    setShowAddStaffForm(false);
    showFeedback(`Staff "${added.name}" added successfully.`);
  };

  const handleDeleteStaff = (u: User) => {
    if (u.id === currentUser.id) {
      alert('You cannot delete your own active account.');
      return;
    }
    if (confirm(`Are you sure you want to remove staff member "${u.name}"?`)) {
      const ok = StorageService.deleteStaffUser(u.id, currentUser);
      if (ok) {
        setUsers(StorageService.getUsers());
        showFeedback(`Staff "${u.name}" deleted.`);
      } else {
        alert('Cannot delete this account. At least one Headmaster account must remain in the system.');
      }
    }
  };

  // Enrolment Handlers
  const handleStartEditEnrolment = (secId: string) => {
    const current = enrolments.find((e) => e.section_id === secId);
    if (current) {
      setEnrForm({
        sc_boys: current.sc_boys || 0,
        sc_girls: current.sc_girls || 0,
        st_boys: current.st_boys || 0,
        st_girls: current.st_girls || 0,
        bc_boys: current.bc_boys || 0,
        bc_girls: current.bc_girls || 0,
        oc_boys: current.oc_boys || 0,
        oc_girls: current.oc_girls || 0,
      });
    } else {
      setEnrForm({
        sc_boys: 0, sc_girls: 0,
        st_boys: 0, st_girls: 0,
        bc_boys: 0, bc_girls: 0,
        oc_boys: 0, oc_girls: 0,
      });
    }
    setEditingEnrSectionId(secId);
  };

  const handleEnrStep = (field: keyof typeof enrForm, delta: number) => {
    setEnrForm((prev) => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }));
  };

  const handleEnrInputChange = (field: keyof typeof enrForm, rawVal: string) => {
    const sanitized = rawVal.replace(/[^0-9]/g, '');
    const num = sanitized === '' ? 0 : parseInt(sanitized, 10);
    setEnrForm((prev) => ({ ...prev, [field]: num }));
  };

  const handleSaveEnrolment = (secId: string) => {
    const sec = sections.find((s) => s.id === secId);
    if (!sec) return;

    const existing = enrolments.find((e) => e.section_id === secId);
    const newEnr: Enrolment = {
      id: existing ? existing.id : `enr-${secId}`,
      section_id: secId,
      class_number: sec.class_number,
      section_name: sec.name,
      academic_year_id: academicYear.id,
      ...enrForm,
      totals: {
        sc_total: enrForm.sc_boys + enrForm.sc_girls,
        st_total: enrForm.st_boys + enrForm.st_girls,
        bc_total: enrForm.bc_boys + enrForm.bc_girls,
        oc_total: enrForm.oc_boys + enrForm.oc_girls,
        boys_total: enrForm.sc_boys + enrForm.st_boys + enrForm.bc_boys + enrForm.oc_boys,
        girls_total: enrForm.sc_girls + enrForm.st_girls + enrForm.bc_girls + enrForm.oc_girls,
        grand_total: enrForm.sc_boys + enrForm.sc_girls + enrForm.st_boys + enrForm.st_girls + enrForm.bc_boys + enrForm.bc_girls + enrForm.oc_boys + enrForm.oc_girls,
      },
    };

    StorageService.updateEnrolment(newEnr, currentUser);
    setEnrolments(StorageService.getEnrolments());
    setEditingEnrSectionId(null);
    showFeedback(`Enrolment threshold for ${sec.display_name} saved.`);
  };

  // Holiday Handlers
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolDate || !newHolReason) return;

    StorageService.addHoliday({
      school_id: school.id,
      date: newHolDate,
      reason: newHolReason,
    }, currentUser);

    setHolidays(StorageService.getHolidays());
    setNewHolDate('');
    setNewHolReason('');
    showFeedback('Holiday added.');
  };

  const handleDeleteHoliday = (id: string) => {
    if (confirm('Are you sure you want to remove this holiday?')) {
      StorageService.deleteHoliday(id, currentUser);
      setHolidays(StorageService.getHolidays());
      showFeedback('Holiday removed.');
    }
  };

  // School Update Handler
  const handleSaveSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: School = {
      ...school,
      name: schoolName,
      code: schoolCode,
      address: schoolAddress,
      district: schoolDistrict,
      state: schoolState,
    };
    StorageService.updateSchool(updated);
    onUpdateSchool(updated);
    showFeedback('School details updated.');
  };

  // Overall School Enrolment Metrics
  const schoolTotalEnrolled = enrolments.reduce((sum, e) => sum + e.totals.grand_total, 0);
  const schoolBoysEnrolled = enrolments.reduce((sum, e) => sum + e.totals.boys_total, 0);
  const schoolGirlsEnrolled = enrolments.reduce((sum, e) => sum + e.totals.girls_total, 0);
  const schoolScEnrolled = enrolments.reduce((sum, e) => sum + e.totals.sc_total, 0);
  const schoolStEnrolled = enrolments.reduce((sum, e) => sum + e.totals.st_total, 0);
  const schoolBcEnrolled = enrolments.reduce((sum, e) => sum + e.totals.bc_total, 0);
  const schoolOcEnrolled = enrolments.reduce((sum, e) => sum + e.totals.oc_total, 0);
  const schoolBoysPercent = schoolTotalEnrolled > 0 ? Math.round((schoolBoysEnrolled / schoolTotalEnrolled) * 100) : 0;
  const schoolGirlsPercent = schoolTotalEnrolled > 0 ? 100 - schoolBoysPercent : 0;

  // Editing Enrolment Computations
  const editingSection = sections.find((s) => s.id === editingEnrSectionId);
  const editScTotal = enrForm.sc_boys + enrForm.sc_girls;
  const editStTotal = enrForm.st_boys + enrForm.st_girls;
  const editBcTotal = enrForm.bc_boys + enrForm.bc_girls;
  const editOcTotal = enrForm.oc_boys + enrForm.oc_girls;
  const editBoysTotal = enrForm.sc_boys + enrForm.st_boys + enrForm.bc_boys + enrForm.oc_boys;
  const editGirlsTotal = enrForm.sc_girls + enrForm.st_girls + enrForm.bc_girls + enrForm.oc_girls;
  const editGrandTotal = editBoysTotal + editGirlsTotal;

  return (
    <div className="space-y-6 pb-20">
      {/* Title Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
            Administration
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
            School Configuration & Settings
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Manage teachers, PINs, section enrolment benchmarks, holidays, and school profile
          </p>
        </div>

        {statusMsg && (
          <div className="bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-200 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'enrolment', label: 'Section Enrolment', icon: GraduationCap },
          { id: 'staff', label: 'Staff & PINs', icon: Users },
          { id: 'holidays', label: 'Holidays Calendar', icon: Calendar },
          { id: 'school', label: 'School Profile', icon: SchoolIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm shrink-0 transition-all ${
                isAct
                  ? 'bg-black text-white font-semibold shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SECTION ENROLMENT BENCHMARKS (NO EXCEL TABLE!) */}
      {activeTab === 'enrolment' && (
        <div className="space-y-6">
          {/* Executive Enrolment Overview Hero Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Card 1: Total Enrolled */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Enrolled</span>
                  <GraduationCap className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-zinc-950 mt-2">
                  {schoolTotalEnrolled} <span className="text-xs font-normal text-zinc-500 font-sans">Students</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-100 text-xs font-mono text-zinc-500 flex justify-between">
                <span>Coverage</span>
                <span className="font-semibold text-zinc-900">10 Sections (Classes 6-10)</span>
              </div>
            </div>

            {/* Card 2: Gender Split */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono">Enrolled Gender</span>
                  <Users className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex items-baseline space-x-3 mt-2">
                  <div className="text-lg font-bold font-mono text-zinc-900">
                    {schoolBoysEnrolled} <span className="text-xs font-normal text-zinc-500 font-sans">B ({schoolBoysPercent}%)</span>
                  </div>
                  <span className="text-zinc-300">/</span>
                  <div className="text-lg font-bold font-mono text-zinc-900">
                    {schoolGirlsEnrolled} <span className="text-xs font-normal text-zinc-500 font-sans">G ({schoolGirlsPercent}%)</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-100">
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex">
                  <div style={{ width: `${schoolBoysPercent}%` }} className="bg-black h-full" />
                  <div style={{ width: `${schoolGirlsPercent}%` }} className="bg-zinc-400 h-full" />
                </div>
              </div>
            </div>

            {/* Card 3: SC & ST Totals */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono">SC & ST Enrolled</span>
                  <span className="text-[10px] font-mono text-zinc-400">School-wide</span>
                </div>
                <div className="flex items-baseline space-x-3 mt-2">
                  <div className="text-lg font-bold font-mono text-zinc-900">
                    {schoolScEnrolled} <span className="text-xs font-normal text-zinc-500 font-sans">SC</span>
                  </div>
                  <span className="text-zinc-300">/</span>
                  <div className="text-lg font-bold font-mono text-zinc-900">
                    {schoolStEnrolled} <span className="text-xs font-normal text-zinc-500 font-sans">ST</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-100 text-xs font-mono text-zinc-500 flex justify-between">
                <span>Combined</span>
                <span className="font-semibold text-zinc-900">{schoolScEnrolled + schoolStEnrolled} Students</span>
              </div>
            </div>

            {/* Card 4: BC & OC Totals */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono">BC & OC Enrolled</span>
                  <span className="text-[10px] font-mono text-zinc-400">School-wide</span>
                </div>
                <div className="flex items-baseline space-x-3 mt-2">
                  <div className="text-lg font-bold font-mono text-zinc-900">
                    {schoolBcEnrolled} <span className="text-xs font-normal text-zinc-500 font-sans">BC</span>
                  </div>
                  <span className="text-zinc-300">/</span>
                  <div className="text-lg font-bold font-mono text-zinc-900">
                    {schoolOcEnrolled} <span className="text-xs font-normal text-zinc-500 font-sans">OC</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-100 text-xs font-mono text-zinc-500 flex justify-between">
                <span>Combined</span>
                <span className="font-semibold text-zinc-900">{schoolBcEnrolled + schoolOcEnrolled} Students</span>
              </div>
            </div>
          </div>

          {/* ACTIVE SECTION ENROLMENT EDITOR (Card-Based, No Table!) */}
          {editingEnrSectionId && editingSection && (
            <div className="bg-white rounded-xl border-2 border-black p-5 sm:p-6 shadow-md space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
                    {editingSection.class_number}{editingSection.name}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-zinc-950">
                      Configure Enrolment for {editingSection.display_name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-mono">
                      Set maximum student capacity. The app alerts teachers if meals served exceed these values.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingEnrSectionId(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Category Input Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* SC */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">SC (Scheduled Caste)</span>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-950">
                      {editScTotal} Total
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Boys</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={enrForm.sc_boys}
                          onChange={(e) => handleEnrInputChange('sc_boys', e.target.value)}
                          className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Girls</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={enrForm.sc_girls}
                          onChange={(e) => handleEnrInputChange('sc_girls', e.target.value)}
                          className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ST */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">ST (Scheduled Tribe)</span>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-950">
                      {editStTotal} Total
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Boys</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={enrForm.st_boys}
                        onChange={(e) => handleEnrInputChange('st_boys', e.target.value)}
                        className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Girls</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={enrForm.st_girls}
                        onChange={(e) => handleEnrInputChange('st_girls', e.target.value)}
                        className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* BC */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">BC (Backward Class)</span>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-950">
                      {editBcTotal} Total
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Boys</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={enrForm.bc_boys}
                        onChange={(e) => handleEnrInputChange('bc_boys', e.target.value)}
                        className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Girls</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={enrForm.bc_girls}
                        onChange={(e) => handleEnrInputChange('bc_girls', e.target.value)}
                        className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* OC */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">OC (General)</span>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-950">
                      {editOcTotal} Total
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Boys</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={enrForm.oc_boys}
                        onChange={(e) => handleEnrInputChange('oc_boys', e.target.value)}
                        className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Girls</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={enrForm.oc_girls}
                        onChange={(e) => handleEnrInputChange('oc_girls', e.target.value)}
                        className="w-full text-center font-mono font-bold text-base bg-white border border-zinc-200 rounded-lg py-1 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Computed Total Dock & Save */}
              <div className="bg-zinc-950 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-6 text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block font-sans">Total Enrolled</span>
                    <span className="text-2xl font-bold text-white">{editGrandTotal}</span>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <span className="text-zinc-400 block font-sans">Boys</span>
                    <span className="text-lg font-bold text-zinc-200">{editBoysTotal}</span>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <span className="text-zinc-400 block font-sans">Girls</span>
                    <span className="text-lg font-bold text-zinc-200">{editGirlsTotal}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingEnrSectionId(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEnrolment(editingSection.id)}
                    className="bg-white hover:bg-zinc-100 text-black px-5 py-2 rounded-lg font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save {editingSection.display_name} Enrolment</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 10 SECTION ENROLMENT CARDS (Organized by Class 6 to 10) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
              <span>Section Enrolment Directory</span>
              <span className="text-[11px] text-zinc-400">Click "Edit" on any section to configure capacity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((sec) => {
                const enr = enrolments.find((e) => e.section_id === sec.id);
                const isSelectedForEdit = editingEnrSectionId === sec.id;

                return (
                  <div
                    key={sec.id}
                    className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all space-y-3.5 ${
                      isSelectedForEdit 
                        ? 'border-black ring-1 ring-black bg-zinc-50/50' 
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center font-mono font-bold text-xs">
                          {sec.class_number}{sec.name}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-950">
                            {sec.display_name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {sec.class_number <= 8 ? 'Upper Primary (Group 1)' : 'High School (Group 2)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="bg-black text-white text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                          {enr?.totals.grand_total ?? 0} Enrolled
                        </span>
                        <button
                          onClick={() => handleStartEditEnrolment(sec.id)}
                          className="text-xs font-medium text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Gender Bar & Split */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-600 mb-1">
                        <span>Boys: <strong className="text-zinc-900">{enr?.totals.boys_total ?? 0}</strong></span>
                        <span>Girls: <strong className="text-zinc-900">{enr?.totals.girls_total ?? 0}</strong></span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden flex">
                        <div 
                          style={{ width: `${enr?.totals.grand_total ? Math.round((enr.totals.boys_total / enr.totals.grand_total) * 100) : 50}%` }} 
                          className="bg-black h-full" 
                        />
                        <div 
                          style={{ width: `${enr?.totals.grand_total ? 100 - Math.round((enr.totals.boys_total / enr.totals.grand_total) * 100) : 50}%` }} 
                          className="bg-zinc-400 h-full" 
                        />
                      </div>
                    </div>

                    {/* Caste Breakdown Badges */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono pt-1">
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                        <div className="text-[10px] text-zinc-400">SC</div>
                        <div className="font-bold text-zinc-900 mt-0.5">{enr?.totals.sc_total ?? 0}</div>
                        <div className="text-[9px] text-zinc-400">({enr?.sc_boys ?? 0}B • {enr?.sc_girls ?? 0}G)</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                        <div className="text-[10px] text-zinc-400">ST</div>
                        <div className="font-bold text-zinc-900 mt-0.5">{enr?.totals.st_total ?? 0}</div>
                        <div className="text-[9px] text-zinc-400">({enr?.st_boys ?? 0}B • {enr?.st_girls ?? 0}G)</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                        <div className="text-[10px] text-zinc-400">BC</div>
                        <div className="font-bold text-zinc-900 mt-0.5">{enr?.totals.bc_total ?? 0}</div>
                        <div className="text-[9px] text-zinc-400">({enr?.bc_boys ?? 0}B • {enr?.bc_girls ?? 0}G)</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                        <div className="text-[10px] text-zinc-400">OC</div>
                        <div className="font-bold text-zinc-900 mt-0.5">{enr?.totals.oc_total ?? 0}</div>
                        <div className="text-[9px] text-zinc-400">({enr?.oc_boys ?? 0}B • {enr?.oc_girls ?? 0}G)</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & PINS (CARD DIRECTORY - NO EXCEL TABLE!) */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm">
            <div>
              <h3 className="font-bold text-zinc-950 text-base">Teacher & Staff Accounts</h3>
              <p className="text-xs text-zinc-500 font-mono">
                Staff authenticate via 4-digit PIN. Add and assign your real teachers and sections below.
              </p>
            </div>

            <button
              onClick={() => setShowAddStaffForm(!showAddStaffForm)}
              className="bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddStaffForm ? 'Close Form' : '+ Add Teacher / Staff'}</span>
            </button>
          </div>

          {/* Add New Staff Card Form */}
          {showAddStaffForm && (
            <form onSubmit={handleAddNewStaff} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="font-semibold text-zinc-900 text-xs uppercase tracking-wider font-mono">
                New Staff Details
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">Teacher Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smt. Lakshmi"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">Role *</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="headmaster">Headmaster / Admin</option>
                    <option value="viewer">Viewer / Inspector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">Assigned Section</label>
                  <select
                    value={newStaffSection}
                    onChange={(e) => setNewStaffSection(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="">None / Floating</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">Phone / Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 9848011111"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">4-Digit PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1234"
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono font-bold text-center focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffForm(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-5 py-2 rounded-lg shadow-sm"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          )}

          {/* Staff Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {users.map((u) => {
              const isEditing = editingUserId === u.id;
              const isSelf = u.id === currentUser.id;

              return (
                <div
                  key={u.id}
                  className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between space-y-3"
                >
                  {isEditing ? (
                    /* Edit Form In-Card */
                    <div className="space-y-3">
                      <div className="font-semibold text-xs text-zinc-900 uppercase font-mono">
                        Edit Staff Account
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-zinc-400 font-mono block">Name</label>
                          <input
                            type="text"
                            value={editUserName}
                            onChange={(e) => setEditUserName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-black"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-zinc-400 font-mono block">Assigned Section</label>
                            <select
                              value={editUserSection}
                              onChange={(e) => setEditUserSection(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-black"
                            >
                              <option value="">None / Floating</option>
                              {sections.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.display_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-400 font-mono block">Phone</label>
                            <input
                              type="text"
                              value={editUserPhone}
                              onChange={(e) => setEditUserPhone(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 font-mono block">4-Digit PIN</label>
                          <input
                            type="text"
                            maxLength={4}
                            value={editUserPin}
                            onChange={(e) => setEditUserPin(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-24 px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveUser(u.id)}
                          className="bg-black hover:bg-zinc-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Card View */
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-zinc-800">
                            {u.role === 'headmaster' ? 'HM' : u.assigned_section_name ? u.assigned_section_name.replace('Class ', '') : 'TR'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-sm text-zinc-950">{u.name}</span>
                              {isSelf && (
                                <span className="text-[9px] font-mono bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded border border-zinc-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono mt-0.5">
                              <span className="capitalize">{u.role}</span>
                              <span>•</span>
                              <span>{u.assigned_section_name || 'All Sections'}</span>
                            </div>
                          </div>
                        </div>

                        {/* PIN Pill */}
                        <div className="bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-zinc-800 flex items-center space-x-1">
                          <KeyRound className="w-3 h-3 text-zinc-400" />
                          <span>PIN: {u.pin}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-mono">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{u.phone_or_email}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEditUser(u)}
                            className="text-xs font-medium text-zinc-600 hover:text-black px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                          >
                            Edit
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteStaff(u)}
                              className="text-zinc-400 hover:text-red-600 p-1 rounded hover:bg-zinc-100 transition-colors"
                              title="Delete staff account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HOLIDAYS CALENDAR (CLEAN CARDS) */}
      {activeTab === 'holidays' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-zinc-950 text-base">Holidays & Non-Working Days</h3>
              <p className="text-xs text-zinc-500 font-mono">
                Sundays are detected automatically. Add government or local school holidays here.
              </p>
            </div>

            {/* Add Holiday Form */}
            <form onSubmit={handleAddHoliday} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-500 mb-1">Holiday Date</label>
                <input
                  type="date"
                  required
                  value={newHolDate}
                  onChange={(e) => setNewHolDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-500 mb-1">Reason / Festival Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gandhi Jayanti, Dussehra, Local Holiday"
                  value={newHolReason}
                  onChange={(e) => setNewHolReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="w-full sm:w-auto pt-4 sm:pt-0">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Holiday</span>
                </button>
              </div>
            </form>
          </div>

          {/* Holiday Cards Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-xs transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono font-bold text-xs">{h.date.split('-')[2]}</span>
                    <span className="text-[9px] font-mono uppercase text-zinc-500">Day</span>
                  </div>
                  <div>
                    <div className="font-bold text-zinc-950 text-xs">{h.reason}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{formatDateIndian(h.date)}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Delete holiday"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCHOOL PROFILE */}
      {activeTab === 'school' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 sm:p-6 space-y-6">
          <div>
            <h3 className="font-bold text-zinc-950 text-base">School Details & Register Headings</h3>
            <p className="text-xs text-zinc-500 font-mono">
              These details print at the top of all official Excel and PDF registers.
            </p>
          </div>

          <form onSubmit={handleSaveSchoolInfo} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1 font-mono">School Full Name</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1 font-mono">School U-DISE Code</label>
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-mono focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1 font-mono">Academic Year</label>
                <input
                  type="text"
                  disabled
                  value={academicYear.name}
                  className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm font-mono text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1 font-mono">School Address</label>
              <input
                type="text"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1 font-mono">District</label>
                <input
                  type="text"
                  value={schoolDistrict}
                  onChange={(e) => setSchoolDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1 font-mono">State</label>
                <input
                  type="text"
                  value={schoolState}
                  onChange={(e) => setSchoolState(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save School Information</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
