import React, { useState } from 'react';
import { 
  BarChart3, 
  Utensils, 
  Calendar, 
  FileText, 
  Shield, 
  History, 
  Settings, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  Clock, 
  Menu, 
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { User, School, AcademicYear } from '../types';
import { formatDateIndian, getTodayDateStr } from '../lib/calculations';

interface SidebarProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenStaffModal: () => void;
  onOpenSettingsModal: () => void;
  isOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  school,
  academicYear,
  activeTab,
  setActiveTab,
  onOpenStaffModal,
  onOpenSettingsModal,
  isOnline,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHeadmaster = currentUser.role === 'headmaster';
  const todayStr = getTodayDateStr();

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'entry', label: 'Daily Entry', icon: Utensils },
    { id: 'daily-summary', label: 'Daily Summary', icon: Calendar },
    { id: 'monthly-summary', label: 'Monthly Register', icon: FileText },
  ];

  const adminNavItems = [
    { id: 'admin', label: 'School Admin', icon: Shield },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Brand & Links */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-4 py-5 border-b border-zinc-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <span className="text-sm font-mono tracking-tighter">M</span>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-zinc-950 text-sm tracking-tight">MDM Register</span>
                <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-100 text-zinc-600 rounded border border-zinc-200">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono truncate" title={school.name}>
                {school.name}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
            <span>AY {academicYear.name}</span>
            <span>Classes 6-10</span>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-3">
          <button
            onClick={() => handleNavClick('entry')}
            className="w-full bg-black hover:bg-zinc-800 text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>+ Record Today's Meal</span>
          </button>
        </div>

        {/* Nav Items Group 1: Core */}
        <div className="px-3 space-y-1">
          <div className="px-2 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Main Menu
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            );
          })}
        </div>

        {/* Nav Items Group 2: Administration (if Headmaster) */}
        {isHeadmaster && (
          <div className="px-3 space-y-1">
            <div className="px-2 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Administration
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Footer User & Settings */}
      <div className="p-3 border-t border-zinc-200 space-y-2 bg-zinc-50/50">
        {/* Connection status */}
        <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-500">
          <div className="flex items-center space-x-1.5">
            {isOnline ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
            <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
          </div>
          <span title="Date">{formatDateIndian(todayStr).substring(0, 5)}</span>
        </div>

        {/* Current User Card */}
        <div className="bg-white border border-zinc-200 rounded-lg p-2.5 shadow-sm flex items-center justify-between">
          <div 
            onClick={onOpenStaffModal} 
            className="flex items-center space-x-2 overflow-hidden cursor-pointer flex-1"
            title="Click to switch staff"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 shrink-0">
              {currentUser.role === 'headmaster' ? 'HM' : currentUser.assigned_section_name ? currentUser.assigned_section_name.replace('Class ', '') : 'TR'}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-xs text-zinc-900 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-mono text-zinc-400 truncate">
                {currentUser.role === 'headmaster' ? 'Headmaster' : currentUser.assigned_section_name || 'Staff'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0 ml-1">
            <button
              onClick={onOpenStaffModal}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-black transition-colors"
              title="Switch Staff / Login"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSettingsModal}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-black transition-colors"
              title="Database Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-lg text-zinc-600 hover:text-black hover:bg-zinc-100"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs">
            M
          </div>
          <span className="font-bold text-zinc-950 text-sm">MDM Register</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenStaffModal}
            className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-800"
          >
            {currentUser.name.split(' ')[0]}
          </button>
          <button
            onClick={() => handleNavClick('entry')}
            className="bg-black text-white px-2.5 py-1 rounded text-xs font-semibold shadow-sm"
          >
            Record
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Slide-Over) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 bg-white h-screen sticky top-0 shrink-0 z-20">
        {navContent}
      </aside>
    </>
  );
};

