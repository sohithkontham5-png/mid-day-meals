import React, { useState } from 'react';
import { AuditLog, User } from '../types';
import { StorageService } from '../lib/storage';
import { History, Search, Filter, Shield, ChevronDown, ChevronUp, Clock, CheckCircle2 } from 'lucide-react';

interface AuditLogViewProps {
  currentUser: User;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditLog[]>(StorageService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesQuery && matchesAction;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
            Security & Compliance
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
            System Audit Trail & Log
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of all creates, updates, locks, and deletes with timestamps and values
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Logged Events: <strong className="text-slate-800">{logs.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by teacher name, action, or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="LOCK">LOCK</option>
            <option value="UNLOCK">UNLOCK</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
              No audit logs found matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateObj = new Date(log.timestamp);
              const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-100 text-blue-800'
                            : log.action === 'LOCK'
                            ? 'bg-rose-100 text-rose-800'
                            : log.action === 'UNLOCK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.action}
                      </span>

                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center space-x-2">
                          <span>{log.user_name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-mono text-xs">{log.entity}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate} at {formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-400">
                      <span className="text-[11px] font-mono hidden sm:inline">ID: {log.entity_id.substring(0, 14)}...</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Previous State (Old)
                        </div>
                        <pre className="text-[11px] text-slate-600 overflow-x-auto whitespace-pre-wrap max-h-48">
                          {log.old_json ? JSON.stringify(log.old_json, null, 2) : 'None (New Record)'}
                        </pre>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1">
                          Updated State (New)
                        </div>
                        <pre className="text-[11px] text-emerald-900 overflow-x-auto whitespace-pre-wrap max-h-48">
                          {log.new_json ? JSON.stringify(log.new_json, null, 2) : 'None (Deleted)'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
