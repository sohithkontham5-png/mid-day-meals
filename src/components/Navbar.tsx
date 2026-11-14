import React from 'react';
import { 
  Utensils, 
  Calendar, 
  BarChart3, 
  FileText, 
  Shield, 
  History, 
  Settings, 
  UserCheck, 
  LogOut, 
  Wifi, 
  WifiOff, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { User, School, AcademicYear } from '../types';
import { formatDateIndian, getTodayDateStr } from '../lib/calculations';

interface NavbarProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenStaffModal: () => void;
  onOpenSettingsModal: () => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  school,
  academicYear,
  activeTab,
  setActiveTab,
  onOpenStaffModal,
  onOpenSettingsModal,
  isOnline,
}) => {
  const isHeadmaster = currentUser.role === 'headmaster';
  const todayStr = getTodayDateStr();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'entry', label: 'Daily Entry', icon: Utensils },
    { id: 'daily-summary', label: 'Daily Summary', icon: Calendar },
    { id: 'monthly-summary', label: 'Monthly Register', icon: FileText },
  ];

  if (isHeadmaster) {
    navItems.push(
      { id: 'admin', label: 'School Admin', icon: Shield },
      { id: 'audit', label: 'Audit Trail', icon: History }
    );
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Top Bar: School & User Status */}
      <div className="bg-emerald-800 text-white px-3 py-1.5 text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-emerald-700/80 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
              Govt. MDM / PM-POSHAN
            </span>
            <span className="truncate hidden sm:inline">{school.name}</span>
            <span className="text-emerald-300 hidden md:inline">• AY {academicYear.name}</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Online / Offline badge */}
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
              isOnline ? 'bg-emerald-700 text-emerald-100' : 'bg-amber-600 text-white'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>

            {/* Current Staff Badge & Switcher */}
            <button
              onClick={onOpenStaffModal}
              className="flex items-center space-x-1.5 bg-emerald-900/90 hover:bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-600/50 transition-colors"
              title="Click to switch staff or login"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-semibold text-white max-w-[120px] sm:max-w-[180px] truncate">
                {currentUser.name}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                currentUser.role === 'headmaster' 
                  ? 'bg-amber-400 text-amber-950' 
                  : currentUser.role === 'teacher' 
                  ? 'bg-blue-300 text-blue-950' 
                  : 'bg-slate-300 text-slate-900'
              }`}>
                {currentUser.role === 'headmaster' ? 'HM' : currentUser.assigned_section_name || 'Staff'}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettingsModal}
              className="p-1 hover:bg-emerald-700 rounded transition-colors text-emerald-200 hover:text-white"
              title="Database & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shadow-emerald-200">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-base leading-tight">MDM Register</div>
              <div className="text-[11px] text-slate-500 font-medium">Classes 6 to 10 (Sec A & B)</div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Date Indicator & Quick Action */}
          <div className="flex items-center space-x-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-end space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Today: {formatDateIndian(todayStr)}</span>
              </div>
              <div className="text-[11px] text-slate-500">Academic Year 2026-27</div>
            </div>

            <button
              onClick={() => setActiveTab('entry')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm shadow-emerald-200 flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Record Meal</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto py-1.5 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
