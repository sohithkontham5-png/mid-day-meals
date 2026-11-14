import React from 'react';
import { 
  X, 
  BarChart3, 
  Utensils, 
  Calendar, 
  FileText, 
  Shield, 
  History, 
  Settings, 
  UserCheck, 
  Download, 
  RotateCcw,
  Sparkles,
  School as SchoolIcon,
  ChevronRight
} from 'lucide-react';
import { User, School, AcademicYear } from '../types';
import { StorageService } from '../lib/storage';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenStaffModal: () => void;
  onOpenSettingsModal: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  school,
  academicYear,
  activeTab,
  setActiveTab,
  onOpenStaffModal,
  onOpenSettingsModal,
}) => {
  if (!isOpen) return null;

  const isHeadmaster = currentUser.role === 'headmaster';

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportBackup = () => {
    const backup = StorageService.exportFullBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MDM_School_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
                M
              </div>
              <span className="font-bold text-sm text-zinc-950">MDM Register</span>
            </div>
            <div className="text-xs font-semibold text-zinc-800 line-clamp-1">
              {school.name}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              AY {academicYear.name} • Classes 6-10
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-200/60 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          
          {/* Main App Navigation */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-1 font-semibold">
              App Screens
            </div>

            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Home Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handleNav('entry')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'entry' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Utensils className="w-4 h-4" />
                <span>Daily Meal Entry</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800">
                Record
              </span>
            </button>

            <button
              onClick={() => handleNav('daily-summary')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'daily-summary' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4" />
                <span>Daily Summary</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => handleNav('monthly-summary')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'monthly-summary' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4" />
                <span>Monthly Register</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>

          {/* Administration Section */}
          {isHeadmaster && (
            <div className="space-y-1 pt-2 border-t border-zinc-100">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-1 font-semibold">
                Headmaster Tools
              </div>

              <button
                onClick={() => handleNav('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  activeTab === 'admin' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-4 h-4" />
                  <span>School Administration</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>

              <button
                onClick={() => handleNav('audit')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  activeTab === 'audit' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <History className="w-4 h-4" />
                  <span>Audit Trail & Edits</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>
          )}

          {/* Data & Database Tools */}
          <div className="space-y-1 pt-2 border-t border-zinc-100">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-1 font-semibold">
              Data & Cloud
            </div>

            <button
              onClick={() => {
                onOpenSettingsModal();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Settings className="w-4 h-4 text-zinc-500" />
                <span>Supabase Database & Sync</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                handleExportBackup();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Download className="w-4 h-4 text-zinc-500" />
                <span>Download Offline Backup</span>
              </div>
              <span className="text-[9px] font-mono px-1 bg-zinc-100 rounded text-zinc-600">JSON</span>
            </button>
          </div>
        </div>

        {/* Footer: User profile info & switch button */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                {isHeadmaster ? 'HM' : currentUser.assigned_section_name ? currentUser.assigned_section_name.replace('Class ', '') : 'TR'}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs text-zinc-950 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono truncate capitalize">
                  {currentUser.role} {currentUser.assigned_section_name && `• ${currentUser.assigned_section_name}`}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenStaffModal();
                onClose();
              }}
              className="px-2.5 py-1 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg shrink-0 transition-colors"
            >
              Switch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

