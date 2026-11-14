import React, { useState, useEffect } from 'react';
import { StorageService } from './lib/storage';
import { User, School, AcademicYear } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DailyEntryForm } from './components/DailyEntryForm';
import { DailySummaryView } from './components/DailySummaryView';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { AdminPanel } from './components/AdminPanel';
import { AuditLogView } from './components/AuditLogView';
import { LoginPinModal } from './components/LoginPinModal';
import { CloudSyncSettings } from './components/CloudSyncSettings';
import { getTodayDateStr } from './lib/calculations';

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header & Navigation */}
      <Navbar
        currentUser={currentUser}
        school={school}
        academicYear={academicYear}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5">
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
              // Can refresh trackers
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
