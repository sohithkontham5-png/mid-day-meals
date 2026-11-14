import React, { useState } from 'react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  SupabaseConfig 
} from '../lib/supabase';
import { StorageService } from '../lib/storage';
import { 
  X, 
  Database, 
  CheckCircle2, 
  Download, 
  Upload, 
  RotateCcw, 
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';

interface CloudSyncSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset?: () => void;
}

export const CloudSyncSettings: React.FC<CloudSyncSettingsProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [testStatus, setTestStatus] = useState<{ testing: boolean; result?: string; success?: boolean }>({
    testing: false,
  });
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveSupabaseConfig(config);
    setFeedback('Cloud connection settings saved.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleTestConnection = async () => {
    if (!config.url || !config.anonKey) {
      setTestStatus({ testing: false, success: false, result: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setTestStatus({ testing: true });
    const res = await testSupabaseConnection(config.url, config.anonKey);
    setTestStatus({ testing: false, success: res.success, result: res.message });
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

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = StorageService.importBackup(json);
        if (ok) {
          alert('Backup restored successfully! The app will reload.');
          window.location.reload();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Are you sure you want to reset all data back to clean initial state?')) {
      StorageService.resetToFactoryDemo();
      alert('Data reset to initial state.');
      if (onDataReset) onDataReset();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-zinc-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-950 text-sm">Database & Sync Settings</h3>
              <p className="text-[11px] text-zinc-500 font-mono">100% Free PostgreSQL & Offline Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {feedback && (
            <div className="p-2.5 bg-zinc-100 border border-zinc-300 text-zinc-900 rounded-lg font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Architecture Explanation */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-800 space-y-1.5">
            <div className="flex items-center space-x-2 font-semibold text-zinc-950">
              <ShieldCheck className="w-4 h-4 text-zinc-700" />
              <span>Free Hosting & Database</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
              The app operates 100% offline out-of-the-box using the browser's high-speed local storage. To sync across multiple teachers' phones simultaneously, connect a <strong>Free Supabase PostgreSQL Project</strong> (500MB free database, zero charges forever).
            </p>
          </div>

          {/* Supabase Free Cloud PostgreSQL Credentials */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-900 text-xs flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-zinc-500" />
                <span>Supabase PostgreSQL Cloud (Optional)</span>
              </h4>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-600 hover:text-black hover:underline flex items-center space-x-1 font-medium font-mono"
              >
                <span>supabase.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={config.url}
                  onChange={(e) => setConfig((p) => ({ ...p, url: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-mono focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1">
                  Anon / Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.anonKey}
                  onChange={(e) => setConfig((p) => ({ ...p, anonKey: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-mono focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus.testing}
                  className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {testStatus.testing ? 'Testing...' : 'Test Connection'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  Save Credentials
                </button>
              </div>

              {testStatus.result && (
                <div
                  className={`text-[11px] p-2 rounded-lg border font-mono ${
                    testStatus.success
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      : 'bg-zinc-100 border-zinc-400 text-zinc-900'
                  }`}
                >
                  {testStatus.result}
                </div>
              )}
            </div>
          </div>

          {/* Offline Backup & Restore */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5">
            <h4 className="font-semibold text-zinc-900 text-xs">Data Backup & Recovery</h4>
            <p className="text-[11px] text-zinc-500">
              Download a complete JSON backup of all registered school classes, teachers, and meal logs.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleExportBackup}
                className="bg-black hover:bg-zinc-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <label className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetDemo}
                className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-colors ml-auto"
                title="Reset to clean initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
