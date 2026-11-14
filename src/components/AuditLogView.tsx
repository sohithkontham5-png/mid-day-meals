import React, { useState } from 'react';
import { AuditLog, User } from '../types';
import { StorageService } from '../lib/storage';
import { Search, Filter, ChevronDown, ChevronUp, Clock } from 'lucide-react';

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
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
            Security & Audit
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
            System Audit Trail
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Immutable log of all creates, updates, locks, and deletes with timestamps and values
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
          <span>Logged Events: <strong className="text-zinc-950">{logs.length}</strong></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by teacher name, action, or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black w-full sm:w-auto"
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

      {/* Logs List */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs font-mono">
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
                <div key={log.id} className="p-3.5 hover:bg-zinc-50/60 transition-colors">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {log.action}
                      </span>

                      <div>
                        <div className="text-xs font-semibold text-zinc-900 flex items-center space-x-2">
                          <span>{log.user_name}</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-zinc-500 font-mono text-[11px]">{log.entity}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{formattedDate} at {formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-zinc-400">
                      <span className="text-[11px] font-mono hidden sm:inline">ID: {log.entity_id.substring(0, 14)}...</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-700" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">
                          Previous State (Old)
                        </div>
                        <pre className="text-[11px] text-zinc-600 overflow-x-auto whitespace-pre-wrap max-h-48">
                          {log.old_json ? JSON.stringify(log.old_json, null, 2) : 'None (New Record)'}
                        </pre>
                      </div>

                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                        <div className="text-[10px] font-semibold text-zinc-800 uppercase mb-1">
                          Updated State (New)
                        </div>
                        <pre className="text-[11px] text-zinc-950 overflow-x-auto whitespace-pre-wrap max-h-48">
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
