import React, { useState } from 'react';
import { 
  FileText, Search, Download, Shield, Laptop, 
  MapPin, Clock, ArrowRight, Eye, RefreshCw, X, Filter, CheckCircle2
} from 'lucide-react';
import { AuditEngine } from '../../lib/audit/auditEngine';
import { AuditLogEntry, AuditActionCategory } from '../../types/audit';
import { cn } from '../../lib/utils';

export default function AuditLogViewer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingEntry, setInspectingEntry] = useState<AuditLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const logs = AuditEngine.getLogs({
    category: selectedCategory === 'ALL' ? undefined : (selectedCategory as AuditActionCategory),
    search: searchQuery || undefined,
  });

  const totalEvents = AuditEngine.getLogs().length;
  const financialCount = AuditEngine.getLogs({ category: 'FINANCIAL' }).length + AuditEngine.getLogs({ category: 'BILLING' }).length;
  const inventoryCount = AuditEngine.getLogs({ category: 'INVENTORY' }).length;
  const securityCount = AuditEngine.getLogs({ category: 'SECURITY' }).length;

  const handleExportCSV = () => {
    const csvContent = AuditEngine.exportToCSV({
      category: selectedCategory === 'ALL' ? undefined : (selectedCategory as AuditActionCategory),
      search: searchQuery || undefined,
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & KPI Summary Cards */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C5A059]" />
            Enterprise Audit Trail & Mutation Log
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable tracking for <strong>User, Action, Old Value, New Value, Timestamp, IP, and Device</strong>.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all flex-shrink-0"
        >
          <Download className="w-4 h-4 text-[#C5A059]" />
          Export Audit Trail (CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131315] border border-[#1F1F21] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-gray-400">Total Audit Events</span>
          <p className="text-xl font-bold text-white mt-1 font-mono">{totalEvents}</p>
        </div>
        <div className="bg-[#131315] border border-[#1F1F21] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-emerald-400">Financial & Billing</span>
          <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{financialCount}</p>
        </div>
        <div className="bg-[#131315] border border-[#1F1F21] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-amber-400">Inventory & Stock</span>
          <p className="text-xl font-bold text-amber-400 mt-1 font-mono">{inventoryCount}</p>
        </div>
        <div className="bg-[#131315] border border-[#1F1F21] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-purple-400">Security & RBAC</span>
          <p className="text-xl font-bold text-purple-400 mt-1 font-mono">{securityCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'FINANCIAL', label: '💰 Financial' },
            { id: 'BILLING', label: '🧾 Billing' },
            { id: 'INVENTORY', label: '📦 Inventory' },
            { id: 'SECURITY', label: '🛡️ Security' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                selectedCategory === cat.id
                  ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                  : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search User, Action, IP, Diff..."
            className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F1F21] bg-[#0A0A0B] text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Timestamp & Device</th>
                <th className="py-3 px-4">User & IP Address</th>
                <th className="py-3 px-4">Action & Category</th>
                <th className="py-3 px-4">Old Value ➔ New Value (Diff)</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-mono">
                    No audit log records match your filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  return (
                    <tr key={log.id} className="hover:bg-[#161618] transition-colors">
                      {/* Timestamp & Device */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-white text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                          <Laptop className="w-3 h-3 text-gray-400" />
                          {log.device}
                        </div>
                      </td>

                      {/* User & IP */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">{log.userName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                          <span className="px-1.5 py-0.2 rounded bg-[#0A0A0B] border border-[#2D2D30] text-[#C5A059]">
                            {log.userRole}
                          </span>
                          <span>•</span>
                          <span>IP: {log.ip}</span>
                        </div>
                      </td>

                      {/* Action & Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-white">{log.action}</div>
                        <div className="flex items-center gap-1 text-[10px] mt-0.5">
                          <span className={cn(
                            "px-1.5 py-0.2 rounded font-mono font-bold uppercase",
                            log.category === 'FINANCIAL' || log.category === 'BILLING' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            log.category === 'INVENTORY' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          )}>
                            {log.category}
                          </span>
                          <span className="text-gray-500 font-mono">({log.entityType}: {log.entityId})</span>
                        </div>
                      </td>

                      {/* Old Value ➔ New Value */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-xs text-gray-200 font-semibold truncate" title={log.diffSummary}>
                          {log.diffSummary}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 truncate max-w-[120px]" title={JSON.stringify(log.oldValue)}>
                            OLD: {typeof log.oldValue === 'object' ? JSON.stringify(log.oldValue) : String(log.oldValue)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 truncate max-w-[120px]" title={JSON.stringify(log.newValue)}>
                            NEW: {typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : String(log.newValue)}
                          </span>
                        </div>
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectingEntry(log)}
                          className="px-2.5 py-1 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-[#C5A059] font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectingEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-gray-200">
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h3 className="font-bold text-white text-sm">Audit Record #{inspectingEntry.id}</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Action: {inspectingEntry.action} • {new Date(inspectingEntry.timestamp).toISOString()}</p>
                </div>
              </div>
              <button onClick={() => setInspectingEntry(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-[#0A0A0B] p-3 rounded-xl border border-[#1F1F21]">
              <div>
                <span className="text-[10px] text-gray-500 block">User:</span>
                <span className="font-bold text-white">{inspectingEntry.userName} ({inspectingEntry.userRole})</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">IP Address:</span>
                <span className="font-bold text-[#C5A059]">{inspectingEntry.ip}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Entity:</span>
                <span className="font-bold text-white">{inspectingEntry.entityType} ({inspectingEntry.entityId})</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Category:</span>
                <span className="font-bold text-emerald-400">{inspectingEntry.category}</span>
              </div>
            </div>

            {/* Device Info */}
            <div className="p-2.5 bg-[#0A0A0B] rounded-xl border border-[#1F1F21] text-xs">
              <span className="text-gray-400">Client Device Fingerprint: </span>
              <strong className="text-white font-mono">{inspectingEntry.device}</strong>
            </div>

            {/* Side-by-Side Old vs New JSON Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-red-400 font-mono flex items-center gap-1">
                  <span>[-] PREVIOUS STATE (OLD VALUE)</span>
                </label>
                <pre className="p-3 bg-[#0A0A0B] border border-red-500/30 rounded-xl text-[11px] font-mono text-red-300 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectingEntry.oldValue, null, 2)}
                </pre>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-400 font-mono flex items-center gap-1">
                  <span>[+] MUTATED STATE (NEW VALUE)</span>
                </label>
                <pre className="p-3 bg-[#0A0A0B] border border-emerald-500/30 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectingEntry.newValue, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1F1F21] flex justify-end">
              <button
                onClick={() => setInspectingEntry(null)}
                className="px-4 py-1.5 bg-[#1A1A1C] border border-[#2D2D30] hover:border-gray-500 text-gray-300 font-bold text-xs rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
