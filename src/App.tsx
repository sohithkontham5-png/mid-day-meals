import React, { useState, useEffect } from 'react';
import { StorageService } from './lib/storage';
import { User, School, AcademicYear } from './types';
import { MobileStatusBar } from './components/MobileStatusBar';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileDrawer } from './components/MobileDrawer';
import { BottomNav } from './components/BottomNav';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';
import { Dashboard } from './components/Dashboard';
import { DailyEntryForm } from './components/DailyEntryForm';
import { DailySummaryView } from './components/DailySummaryView';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { AdminPanel } from './components/AdminPanel';
import { AuditLogView } from './components/AuditLogView';
import { LoginPinModal } from './components/LoginPinModal';
import { getTodayDateStr } from './lib/calculations';
import { Smartphone, Maximize2 } from 'lucide-react';

// Initialize seed data on load
StorageService.initialize();

export function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [school, setSchool] = useState<School>(() => StorageService.getSchool());
  const [academicYear, setAcademicYear] = useState<AcademicYear>(() => StorageService.getAcademicYear());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Pre-fill state for Entry Form
  const [entrySectionId, setEntrySectionId] = useState<string | undefined>(currentUser.assigned_section_id);
  const [entryDate, setEntryDate] = useState<string>(getTodayDateStr());

  // Pre-fill state for Daily Summary
  const [dailySummaryDate, setDailySummaryDate] = useState<string>(getTodayDateStr());

  // Modals & Drawer
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Desktop Simulator Display Mode: 'phone' (realistic iPhone/Android chassis) or 'full' (responsive mobile view)
  const [viewMode, setViewMode] = useState<'phone' | 'full'>('phone');

  // Network Status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Initial sync with Supabase Cloud if configured
    import('./lib/supabaseSync').then(({ SupabaseSyncService }) => {
      if (SupabaseSyncService.isConnected()) {
        SupabaseSyncService.pullEntries().then((count) => {
          if (count > 0) {
            console.log(`Synced ${count} entries from Supabase`);
          }
        });
      }
    });

    const handleOnline = () => {
      setIsOnline(true);
      import('./lib/supabaseSync').then(({ SupabaseSyncService }) => {
        if (SupabaseSyncService.isConnected()) {
          SupabaseSyncService.pullEntries();
        }
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update entrySectionId if assigned teacher changes
  useEffect(() => {
    if (currentUser.assigned_section_id) {
      setEntrySectionId(currentUser.assigned_section_id);
    }
  }, [currentUser]);

  const handleNavigateToEntry = (sectionId?: string, date?: string) => {
    if (sectionId) setEntrySectionId(sectionId);
    if (date) setEntryDate(date);
    setActiveTab('entry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDailySummary = (date: string) => {
    setDailySummaryDate(date);
    setActiveTab('daily-summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToMonthlySummary = () => {
    setActiveTab('monthly-summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.assigned_section_id) {
      setEntrySectionId(user.assigned_section_id);
    }
  };

  // Render Routed Screen Content
  const renderScreenContent = () => (
    <>
      <InstallPwaPrompt />

      {activeTab === 'dashboard' && (
        <Dashboard
          currentUser={currentUser}
          school={school}
          academicYear={academicYear}
          onNavigateToEntry={handleNavigateToEntry}
          onNavigateToDailySummary={handleNavigateToDailySummary}
          onNavigateToMonthlySummary={handleNavigateToMonthlySummary}
        />
      )}

      {activeTab === 'entry' && (
        <DailyEntryForm
          currentUser={currentUser}
          initialSectionId={entrySectionId}
          initialDate={entryDate}
          onSaved={() => {
            // entry saved
          }}
          onBackToDashboard={() => setActiveTab('dashboard')}
        />
      )}

      {activeTab === 'daily-summary' && (
        <DailySummaryView
          currentUser={currentUser}
          school={school}
          academicYear={academicYear}
          initialDate={dailySummaryDate}
          onNavigateToEntry={handleNavigateToEntry}
        />
      )}

      {activeTab === 'monthly-summary' && (
        <MonthlySummaryView
          currentUser={currentUser}
          school={school}
          academicYear={academicYear}
          onNavigateToDailySummary={handleNavigateToDailySummary}
          onNavigateToEntry={handleNavigateToEntry}
        />
      )}

      {activeTab === 'admin' && currentUser.role === 'headmaster' && (
        <AdminPanel
          currentUser={currentUser}
          school={school}
          academicYear={academicYear}
          onUpdateSchool={(s) => setSchool(s)}
        />
      )}

      {activeTab === 'audit' && currentUser.role === 'headmaster' && (
        <AuditLogView currentUser={currentUser} />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-950 font-sans flex flex-col items-center justify-center sm:p-4 selection:bg-zinc-200">
      
      {/* Desktop Helper Bar: Mobile App Mode Switcher (Hidden on mobile phones) */}
      <aside aria-label="Device Simulator Controls" className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-zinc-400 text-xs">
        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-bold">MDM Mobile App</span>
          <span>•</span>
          <span>v1.0</span>
        </div>

        <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
          <button
            onClick={() => setViewMode('phone')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              viewMode === 'phone' ? 'bg-black text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
            title="View inside realistic Smartphone Frame"
          >
            <Smartphone className="w-3 h-3" />
            <span>Phone Frame</span>
          </button>
          <button
            onClick={() => setViewMode('full')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              viewMode === 'full' ? 'bg-black text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
            title="View full mobile width"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Wide Mobile</span>
          </button>
        </div>
      </aside>

      {/* Main Mobile App Container */}
      <div 
        className={`w-full bg-[#fafafa] flex flex-col relative transition-all duration-200 ${
          viewMode === 'phone'
            ? 'sm:max-w-[430px] sm:h-[890px] sm:max-h-[94vh] sm:rounded-[48px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.5)] sm:border-[8px] sm:border-zinc-800 sm:ring-1 sm:ring-zinc-700/60 sm:overflow-hidden'
            : 'sm:max-w-xl sm:min-h-screen sm:shadow-2xl sm:border-x sm:border-zinc-200'
        } min-h-screen sm:min-h-0`}
      >
        {/* Mobile Top Status Bar (Time, Dynamic Island, 5G, Wi-Fi, Battery) */}
        <MobileStatusBar />

        {/* Mobile Top App Bar (Brand, Title, Staff Badge, Drawer Menu) */}
        <MobileTopBar
          currentUser={currentUser}
          school={school}
          academicYear={academicYear}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenStaffModal={() => setIsStaffModalOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          isOnline={isOnline}
        />

        {/* Scrollable Screen Content Body */}
        <main className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 pb-12">
          {renderScreenContent()}
        </main>

        {/* Mobile Bottom Navigation Bar (Always docked at bottom of mobile frame) */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onOpenStaffModal={() => setIsStaffModalOpen(true)}
          isInsidePhoneFrame={viewMode === 'phone'}
        />

        {/* Mobile Slide-Over Drawer */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentUser={currentUser}
          school={school}
          academicYear={academicYear}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenStaffModal={() => setIsStaffModalOpen(true)}
        />
      </div>

      {/* Staff Login / Switcher PIN Modal */}
      <LoginPinModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
