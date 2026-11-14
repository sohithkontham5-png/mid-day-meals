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
  School as SchoolIcon 
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
  const [activeTab, setActiveTab] = useState<'staff' | 'enrolment' | 'holidays' | 'school'>('staff');

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

    setUsers(updated);
    StorageService.saveUsers(updated);
    setEditingUserId(null);
    showFeedback('Staff details updated.');
  };

  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      showFeedback('Please enter teacher name.');
      return;
    }
    const sec = sections.find((s) => s.id === newStaffSection);
    const added = StorageService.addStaffUser(
      {
        name: newStaffName.trim(),
        role: newStaffRole,
        phone_or_email: newStaffPhone.trim() || `staff-${Date.now()}`,
        school_id: school.id,
        pin: newStaffPin.trim() || '1234',
        assigned_section_id: newStaffSection || undefined,
        assigned_section_name: sec ? sec.display_name : undefined,
      },
      currentUser
    );

    setUsers(StorageService.getUsers());
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffPin('1234');
    setNewStaffSection('');
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

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
            Administration
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
            School Configuration & Settings
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Manage teachers, PINs, enrolment benchmarks, holidays, and school profile
          </p>
        </div>

        {statusMsg && (
          <div className="bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-200 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'staff', label: 'Staff & PINs', icon: Users },
          { id: 'enrolment', label: 'Enrolment Benchmark', icon: GraduationCap },
          { id: 'holidays', label: 'Holidays Calendar', icon: Calendar },
          { id: 'school', label: 'School Profile', icon: SchoolIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm shrink-0 transition-all ${
                isAct
                  ? 'bg-black text-white font-semibold shadow-sm'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Staff & PINs */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-zinc-950 text-base">Teacher & Staff Accounts</h3>
              <p className="text-xs text-zinc-500 font-mono">
                Staff authenticate via 4-digit PIN. Add and assign your real teachers and sections below.
              </p>
            </div>

            <button
              onClick={() => setShowAddStaffForm(!showAddStaffForm)}
              className="bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddStaffForm ? 'Close Form' : '+ Add Teacher / Staff'}</span>
            </button>
          </div>

          {/* Add New Staff Form */}
          {showAddStaffForm && (
            <form onSubmit={handleAddNewStaff} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3 animate-in fade-in">
              <div className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">
                New Staff Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Teacher Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smt. Lakshmi"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Role *</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="headmaster">Headmaster / Admin</option>
                    <option value="viewer">Viewer / Inspector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Assigned Section</label>
                  <select
                    value={newStaffSection}
                    onChange={(e) => setNewStaffSection(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
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
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Phone / Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 9848011111"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-mono focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">4-Digit PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1234"
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-mono font-bold text-center focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddStaffForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-zinc-50 text-zinc-600 font-semibold uppercase border-b border-zinc-200">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Assigned Section</th>
                  <th className="py-2.5 px-3">Phone / ID</th>
                  <th className="py-2.5 px-3">Login PIN</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => {
                  const isEditing = editingUserId === u.id;
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editUserName}
                            onChange={(e) => setEditUserName(e.target.value)}
                            className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs w-full"
                          />
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[9px] font-mono bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded border border-zinc-200">
                                You
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
                          {u.role}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-medium text-zinc-800">
                        {isEditing ? (
                          <select
                            value={editUserSection}
                            onChange={(e) => setEditUserSection(e.target.value)}
                            className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs"
                          >
                            <option value="">None / Floating</option>
                            {sections.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.display_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          u.assigned_section_name || 'All Sections (HM)'
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-zinc-500 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editUserPhone}
                            onChange={(e) => setEditUserPhone(e.target.value)}
                            className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-mono w-28"
                          />
                        ) : (
                          u.phone_or_email
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            maxLength={4}
                            value={editUserPin}
                            onChange={(e) => setEditUserPin(e.target.value)}
                            className="px-2 py-1 bg-white border border-black rounded text-xs font-mono font-bold w-16 text-center"
                          />
                        ) : (
                          <span className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded font-bold text-zinc-800">
                            {u.pin}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveUser(u.id)}
                            className="bg-black hover:bg-zinc-800 text-white font-semibold px-2.5 py-1 rounded text-xs"
                          >
                            Save
                          </button>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleStartEditUser(u)}
                              className="text-zinc-600 hover:text-black font-semibold px-2 py-1 rounded hover:bg-zinc-100"
                            >
                              Edit
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteStaff(u)}
                                className="text-zinc-400 hover:text-black p-1 rounded hover:bg-zinc-100"
                                title="Delete staff"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Enrolment Benchmarks */}
      {activeTab === 'enrolment' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div>
            <h3 className="font-bold text-zinc-950 text-base">Section Enrolment Benchmarks</h3>
            <p className="text-xs text-zinc-500 font-mono">
              The app warns if daily meals taken exceed these enrolled counts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-zinc-50 text-zinc-600 font-semibold font-sans uppercase border-b border-zinc-200">
                  <th className="py-2.5 px-3 text-left">Section</th>
                  <th className="py-2.5 px-2">SC (B+G)</th>
                  <th className="py-2.5 px-2">ST (B+G)</th>
                  <th className="py-2.5 px-2">BC (B+G)</th>
                  <th className="py-2.5 px-2">OC (B+G)</th>
                  <th className="py-2.5 px-2">Boys</th>
                  <th className="py-2.5 px-2">Girls</th>
                  <th className="py-2.5 px-2 font-bold text-zinc-950 bg-zinc-100">Total Enrolled</th>
                  <th className="py-2.5 px-2 text-right font-sans">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sections.map((sec) => {
                  const enr = enrolments.find((e) => e.section_id === sec.id);
                  const isEditing = editingEnrSectionId === sec.id;

                  return (
                    <tr key={sec.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-left font-sans font-semibold text-zinc-900">
                        {sec.display_name}
                      </td>

                      {isEditing ? (
                        <>
                          <td className="p-1">
                            <div className="flex items-center space-x-1 justify-center">
                              <input
                                type="number"
                                min={0}
                                placeholder="B"
                                value={enrForm.sc_boys}
                                onChange={(e) => setEnrForm((p) => ({ ...p, sc_boys: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                              <input
                                type="number"
                                min={0}
                                placeholder="G"
                                value={enrForm.sc_girls}
                                onChange={(e) => setEnrForm((p) => ({ ...p, sc_girls: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                            </div>
                          </td>
                          <td className="p-1">
                            <div className="flex items-center space-x-1 justify-center">
                              <input
                                type="number"
                                min={0}
                                placeholder="B"
                                value={enrForm.st_boys}
                                onChange={(e) => setEnrForm((p) => ({ ...p, st_boys: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                              <input
                                type="number"
                                min={0}
                                placeholder="G"
                                value={enrForm.st_girls}
                                onChange={(e) => setEnrForm((p) => ({ ...p, st_girls: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                            </div>
                          </td>
                          <td className="p-1">
                            <div className="flex items-center space-x-1 justify-center">
                              <input
                                type="number"
                                min={0}
                                placeholder="B"
                                value={enrForm.bc_boys}
                                onChange={(e) => setEnrForm((p) => ({ ...p, bc_boys: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                              <input
                                type="number"
                                min={0}
                                placeholder="G"
                                value={enrForm.bc_girls}
                                onChange={(e) => setEnrForm((p) => ({ ...p, bc_girls: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                            </div>
                          </td>
                          <td className="p-1">
                            <div className="flex items-center space-x-1 justify-center">
                              <input
                                type="number"
                                min={0}
                                placeholder="B"
                                value={enrForm.oc_boys}
                                onChange={(e) => setEnrForm((p) => ({ ...p, oc_boys: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                              <input
                                type="number"
                                min={0}
                                placeholder="G"
                                value={enrForm.oc_girls}
                                onChange={(e) => setEnrForm((p) => ({ ...p, oc_girls: Number(e.target.value) }))}
                                className="w-10 text-center border rounded p-0.5 text-xs font-mono"
                              />
                            </div>
                          </td>
                          <td className="font-semibold text-zinc-900">
                            {enrForm.sc_boys + enrForm.st_boys + enrForm.bc_boys + enrForm.oc_boys}
                          </td>
                          <td className="font-semibold text-zinc-900">
                            {enrForm.sc_girls + enrForm.st_girls + enrForm.bc_girls + enrForm.oc_girls}
                          </td>
                          <td className="font-bold text-zinc-950 bg-zinc-100">
                            {enrForm.sc_boys + enrForm.sc_girls + enrForm.st_boys + enrForm.st_girls + enrForm.bc_boys + enrForm.bc_girls + enrForm.oc_boys + enrForm.oc_girls}
                          </td>
                          <td className="text-right py-2 px-2 font-sans">
                            <button
                              onClick={() => handleSaveEnrolment(sec.id)}
                              className="bg-black hover:bg-zinc-800 text-white font-semibold px-2.5 py-1 rounded text-xs"
                            >
                              Save
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{enr ? `${enr.totals.sc_total} (${enr.sc_boys}+${enr.sc_girls})` : '-'}</td>
                          <td>{enr ? `${enr.totals.st_total} (${enr.st_boys}+${enr.st_girls})` : '-'}</td>
                          <td>{enr ? `${enr.totals.bc_total} (${enr.bc_boys}+${enr.bc_girls})` : '-'}</td>
                          <td>{enr ? `${enr.totals.oc_total} (${enr.oc_boys}+${enr.oc_girls})` : '-'}</td>
                          <td className="font-semibold text-zinc-900">{enr?.totals.boys_total ?? '-'}</td>
                          <td className="font-semibold text-zinc-900">{enr?.totals.girls_total ?? '-'}</td>
                          <td className="font-bold text-zinc-950 bg-zinc-100">{enr?.totals.grand_total ?? '-'}</td>
                          <td className="text-right py-2 px-2 font-sans">
                            <button
                              onClick={() => handleStartEditEnrolment(sec.id)}
                              className="text-zinc-600 hover:text-black font-semibold px-2 py-1 rounded hover:bg-zinc-100"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Holidays Calendar */}
      {activeTab === 'holidays' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 sm:p-6 space-y-6">
          <div>
            <h3 className="font-bold text-zinc-950 text-base">Holidays & Non-Working Days</h3>
            <p className="text-xs text-zinc-500 font-mono">
              Sundays are detected automatically. Add government or local school holidays here.
            </p>
          </div>

          {/* Add Holiday Form */}
          <form onSubmit={handleAddHoliday} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Holiday Date</label>
              <input
                type="date"
                required
                value={newHolDate}
                onChange={(e) => setNewHolDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">Reason / Festival Name</label>
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

          {/* Holiday List */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              Marked Holidays ({holidays.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-mono font-bold text-xs">
                      {h.date.split('-')[2]}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 text-xs">{h.reason}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{formatDateIndian(h.date)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="p-1 text-zinc-400 hover:text-black rounded transition-colors"
                    title="Delete holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: School Profile */}
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
              <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">School Full Name</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-semibold focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">School U-DISE Code</label>
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-mono focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Academic Year</label>
                <input
                  type="text"
                  disabled
                  value={academicYear.name}
                  className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm font-mono text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">School Address</label>
              <input
                type="text"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">District</label>
                <input
                  type="text"
                  value={schoolDistrict}
                  onChange={(e) => setSchoolDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">State</label>
                <input
                  type="text"
                  value={schoolState}
                  onChange={(e) => setSchoolState(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
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
