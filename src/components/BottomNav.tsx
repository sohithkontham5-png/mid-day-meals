import React from 'react';
import { 
  BarChart3, 
  Utensils, 
  Calendar, 
  FileText, 
  Shield, 
  UserCheck 
} from 'lucide-react';
import { User } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenStaffModal: () => void;
  isInsidePhoneFrame?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenStaffModal,
  isInsidePhoneFrame = false,
}) => {
  const isHeadmaster = currentUser.role === 'headmaster';

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: BarChart3 },
    { id: 'daily-summary', label: 'Daily', icon: Calendar },
    { id: 'entry', label: 'Record', icon: Utensils, isCenterAction: true },
    { id: 'monthly-summary', label: 'Monthly', icon: FileText },
    isHeadmaster
      ? { id: 'admin', label: 'Admin', icon: Shield }
      : { id: 'staff', label: 'Staff', icon: UserCheck, onClick: onOpenStaffModal },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className={`${
        isInsidePhoneFrame
          ? 'sticky bottom-0 left-0 right-0 w-full pb-2 pt-1.5'
          : 'fixed bottom-0 left-0 right-0 pb-safe pt-1.5'
      } z-40 bg-white/95 backdrop-blur-lg border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] px-2 select-none`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isCenterAction) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col items-center justify-center -mt-5 active:scale-90 transition-transform focus:outline-none px-1"
                aria-label={item.label}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-black text-white ring-4 ring-zinc-300 scale-105 shadow-xl'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-black shadow-md'
                }`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-mono mt-1 transition-colors ${
                  isActive ? 'text-black font-extrabold' : 'text-zinc-600 font-semibold'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1.5 rounded-2xl transition-all duration-150 active:scale-95 focus:outline-none ${
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'text-white scale-105' : 'text-zinc-400'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                isActive ? 'text-white font-bold' : 'text-zinc-500 font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
