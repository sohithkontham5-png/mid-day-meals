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
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenStaffModal,
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
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-zinc-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] px-2 pt-1.5 pb-safe"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
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
                className="flex flex-col items-center justify-center -mt-5 active:scale-90 transition-transform focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive
                    ? 'bg-black text-white ring-4 ring-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-mono mt-1 font-bold ${
                  isActive ? 'text-black' : 'text-zinc-600'
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
              className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform focus:outline-none"
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-black' : 'text-zinc-400'
                }`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 transition-colors ${
                isActive ? 'text-black font-bold' : 'text-zinc-500'
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
