import React, { useState, useEffect } from 'react';
import { StorageService } from './lib/storage';
import { User, School, AcademicYear } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DailyEntryForm } from './components/DailyEntryForm';
import { DailySummaryView } from './components/DailySummaryView';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { AdminPanel } from './components/AdminPanel';
import { AuditLogView } from './components/AuditLogView';
import { LoginPinModal } from './components/LoginPinModal';
import { CloudSyncSettings } from './components/CloudSyncSettings';
import { getTodayDateStr, formatDateIndian } from './lib/calculations';
import { Clock } from 'lucide-react';

// Initialize local storage seed data on module load
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

  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Network Status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update entrySectionId if teacher changes
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

  const pageTitles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'entry': 'Daily Attendance & Meal Entry',
    'daily-summary': 'Daily Summary Register',
    'monthly-summary': 'Monthly Register',
    'admin': 'School Administration',
    'audit': 'Audit Trail',
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fafafa] text-zinc-950 font-sans">
      {/* Vercel Left Sidebar (Desktop) + Mobile Slide-over Drawer */}
      <Sidebar
        currentUser={currentUser}
        school={school}
        academicYear={academicYear}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Minimal Top Bar with Breadcrumbs & Clock */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 border-b border-zinc-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono">
            <span>MDM</span>
            <span>/</span>
            <span className="text-zinc-950 font-semibold font-sans">
              {pageTitles[activeTab] || activeTab}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="font-mono text-zinc-500 flex items-center space-x-1.5 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Today: {formatDateIndian(getTodayDateStr())}</span>
            </div>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
                // Refresh data if needed
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
        </main>
      </div>

      {/* Staff Login / Switcher PIN Modal */}
      <LoginPinModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* Database & Cloud Sync Settings Modal */}
      <CloudSyncSettings
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataReset={() => {
          setCurrentUser(StorageService.getCurrentUser());
          setSchool(StorageService.getSchool());
          setAcademicYear(StorageService.getAcademicYear());
        }}
      />
    </div>
  );
}

export default App;
