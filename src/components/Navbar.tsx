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
  Wifi, 
  WifiOff, 
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
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-30">
      {/* Top Thin Notification & Status Bar */}
      <div className="bg-zinc-50 border-b border-zinc-100 text-zinc-600 px-3 sm:px-4 py-1 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-semibold text-zinc-900 truncate">
              {school.name}
            </span>
            <span className="text-zinc-400 hidden sm:inline">/</span>
            <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">
              AY {academicYear.name}
            </span>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Online / Offline status badge */}
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              isOnline 
                ? 'bg-zinc-100 border-zinc-200 text-zinc-800' 
                : 'bg-zinc-900 border-zinc-900 text-white'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3 text-zinc-600" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Current Staff Badge / Switcher */}
            <button
              onClick={onOpenStaffModal}
              className="flex items-center space-x-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md text-zinc-900 font-medium transition-colors text-xs"
              title="Click to switch staff or login"
            >
              <UserCheck className="w-3 h-3 text-zinc-500" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate font-medium">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200 uppercase">
                {currentUser.role === 'headmaster' ? 'HM' : currentUser.assigned_section_name?.replace('Class ', '') || 'Staff'}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettingsModal}
              className="p-1 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Settings & Cloud Database"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-sm">
              <span className="text-xs font-mono tracking-tighter">M</span>
            </div>
            <div>
              <div className="font-bold text-zinc-950 text-sm tracking-tight leading-none flex items-center space-x-1.5">
                <span>MDM Register</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded border border-zinc-200">
                  Classes 6-10
                </span>
              </div>
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Date Indicator & Primary Action CTA */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block text-xs">
              <div className="font-mono text-zinc-500 flex items-center justify-end space-x-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span>{formatDateIndian(todayStr)}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('entry')}
              className="bg-black hover:bg-zinc-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Record Meal</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto py-1.5 border-t border-zinc-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                  isActive
                    ? 'bg-black text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
