import React from 'react';
import { 
  Menu, 
  ArrowLeft, 
  UserCheck 
} from 'lucide-react';
import { User, School, AcademicYear } from '../types';

interface MobileTopBarProps {
  currentUser: User;
  school: School;
  academicYear: AcademicYear;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenStaffModal: () => void;
  onOpenDrawer: () => void;
  isOnline: boolean;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentUser,
  school,
  activeTab,
  setActiveTab,
  onOpenStaffModal,
  onOpenDrawer,
  isOnline,
}) => {
  const isHeadmaster = currentUser.role === 'headmaster';
  const showBackButton = activeTab !== 'dashboard';

  const tabTitles: Record<string, string> = {
    'dashboard': 'MDM Register',
    'entry': 'Meal Entry',
    'daily-summary': 'Daily Summary',
    'monthly-summary': 'Monthly Summary',
    'admin': 'School Admin',
    'audit': 'Audit Trail',
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left side: Back button or Logo + Title */}
      <div className="flex items-center space-x-2.5 overflow-hidden">
        {showBackButton ? (
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center text-zinc-900 shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm shrink-0">
            M
          </div>
        )}

        <div className="overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-zinc-950 text-sm tracking-tight leading-none truncate">
              {tabTitles[activeTab] || 'MDM Register'}
            </span>
            <span 
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} 
              title={isOnline ? 'Online' : 'Offline'} 
            />
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px] leading-tight mt-0.5">
            {school.name}
          </div>
        </div>
      </div>

      {/* Right side: Staff Switcher Pill + Menu Drawer */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Staff Switcher Chip */}
        <button
          onClick={onOpenStaffModal}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg border border-zinc-200 bg-zinc-50 active:scale-95 transition-all text-xs font-mono"
          title="Switch Staff / PIN Login"
        >
          <span className="w-4 h-4 rounded bg-black text-white flex items-center justify-center font-bold text-[9px]">
            {isHeadmaster ? 'HM' : currentUser.assigned_section_name ? currentUser.assigned_section_name.replace('Class ', '') : 'TR'}
          </span>
          <span className="font-semibold text-zinc-800 text-[11px] truncate max-w-[65px]">
            {currentUser.name.split(' ')[0]}
          </span>
        </button>

        {/* Drawer Menu Button */}
        <button
          onClick={onOpenDrawer}
          className="p-1.5 rounded-lg text-zinc-600 hover:text-black hover:bg-zinc-100 active:scale-95 transition-all"
          aria-label="Open App Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

