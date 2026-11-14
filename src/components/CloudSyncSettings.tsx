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
  AlertCircle, 
  Copy, 
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
  const [copiedSql, setCopiedSql] = useState(false);
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

  const handleCopySql = () => {
    // Provide instructions or schema
    const sqlNotice = `-- Run this in your Supabase SQL Editor:
-- The full schema is located at /supabase/schema.sql in the project root.`;
    navigator.clipboard.writeText(sqlNotice);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
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
    if (confirm('Are you sure you want to reset all data back to the clean demo data?')) {
      StorageService.resetToFactoryDemo();
      alert('Data reset to factory demo state.');
      if (onDataReset) onDataReset();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Database & Cloud Sync Settings</h3>
              <p className="text-xs text-slate-400">100% Free PostgreSQL & Offline Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {feedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          )}

          {/* 100% Free PostgreSQL Architecture Explanation */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Free Hosting & Database Architecture</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              This app is engineered to be <strong>completely free of cost</strong>. It works offline out-of-the-box using the browser's high-speed local storage. To sync across multiple teachers' phones and laptops simultaneously, you can connect a <strong>Free Supabase PostgreSQL Project</strong> (500MB free database, zero charges forever).
            </p>
          </div>

          {/* Supabase Free Cloud PostgreSQL Credentials */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <Server className="w-4 h-4 text-slate-600" />
                <span>Supabase PostgreSQL Cloud Connection (Optional)</span>
              </h4>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>supabase.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-500">
              Paste your free Supabase project URL and anon public key below:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Project URL (e.g. https://your-project.supabase.co)
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={config.url}
                  onChange={(e) => setConfig((p) => ({ ...p, url: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Anon / Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.anonKey}
                  onChange={(e) => setConfig((p) => ({ ...p, anonKey: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus.testing}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {testStatus.testing ? 'Testing connection...' : 'Test Connection'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
                >
                  Save Credentials
                </button>
              </div>

              {testStatus.result && (
                <div
                  className={`text-xs p-2.5 rounded-xl border font-semibold ${
                    testStatus.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  {testStatus.result}
                </div>
              )}
            </div>
          </div>

          {/* Database Schema Setup */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">PostgreSQL Schema & Views</h4>
            <p className="text-xs text-slate-500">
              The project includes the complete SQL schema at <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">supabase/schema.sql</code> with all 10 tables, views (`v_entry_totals`, `v_class_daily`, `v_group_daily`, `v_school_daily`), and audit triggers.
            </p>
          </div>

          {/* Offline Backup & Restore */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Data Backup & Recovery</h4>
            <p className="text-xs text-slate-500">
              Export an encrypted full backup JSON of all school classes, staff, enrolments, holidays, and meal entries to your computer or phone.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportBackup}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetDemo}
                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors ml-auto"
                title="Reset back to factory demo state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

