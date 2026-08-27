import React, { useState, useEffect } from 'react';
import { 
  Coffee, Utensils, Clock, CheckCircle2, AlertCircle, 
  Play, Square, Plus, RefreshCw, X, ShieldCheck, 
  TrendingUp, Calendar, Zap, Hourglass
} from 'lucide-react';
import { BreakRecord, BreakType, DailyWorkBreakSummary } from '../../types/break';
import { BreakEngine } from '../../lib/breaks/breakEngine';
import { EmployeeEngine } from '../../lib/employees/employeeEngine';
import { cn } from '../../lib/utils';

export default function BreakManagementStudio() {
  const [selectedEmpId, setSelectedEmpId] = useState('emp-001');
  const [employees, setEmployees] = useState(EmployeeEngine.getEmployees({ pageSize: 50 }).employees);
  
  const [history, setHistory] = useState<BreakRecord[]>(BreakEngine.getBreakHistory());
  const [activeBreak, setActiveBreak] = useState<BreakRecord | undefined>(BreakEngine.getActiveBreak(selectedEmpId));
  const [summary, setSummary] = useState<DailyWorkBreakSummary>(BreakEngine.calculateDailyWorkingHours(selectedEmpId, 8.5));

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('Short Ergonomic Rest Break');
  const [customReason, setCustomReason] = useState('Eye rest and hydration break');

  const [feedback, setFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    message: string;
  } | null>(null);

  const refreshState = () => {
    setHistory(BreakEngine.getBreakHistory());
    setActiveBreak(BreakEngine.getActiveBreak(selectedEmpId));
    setSummary(BreakEngine.calculateDailyWorkingHours(selectedEmpId, 8.5));
  };

  useEffect(() => {
    refreshState();
  }, [selectedEmpId]);

  // Handle Start Break
  const handleStartBreak = (type: BreakType, title?: string, reason?: string) => {
    setFeedback(null);
    const emp = employees.find(e => e.id === selectedEmpId) || {
      name: 'Kowsalya Sundaram',
      department: 'Billing & Cash Desk',
    };

    const res = BreakEngine.startBreak({
      employeeId: selectedEmpId,
      employeeName: emp.name,
      department: emp.department,
      breakType: type,
      customTitle: title,
      customReason: reason,
    });

    if (!res.success) {
      setFeedback({ type: 'ERROR', message: res.error || 'Failed to start break' });
      return;
    }

    setFeedback({
      type: 'SUCCESS',
      message: `Started ${res.record?.breakTitle} at ${res.record?.breakStart}. Working hours clock paused.`,
    });

    setIsCustomModalOpen(false);
    refreshState();
  };

  // Handle End Break
  const handleEndBreak = () => {
    setFeedback(null);
    const res = BreakEngine.endBreak(selectedEmpId);
    if (!res.success) {
      setFeedback({ type: 'ERROR', message: res.error || 'Failed to end break' });
      return;
    }

    setFeedback({
      type: 'SUCCESS',
      message: `Ended ${res.record?.breakTitle} (${res.record?.durationFormatted}). Net working hours updated!`,
    });

    refreshState();
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#C5A059]" />
            Break Management & Working Hours Engine
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Support Break Start • Break End • Lunch Break • Tea Break • Custom Break • Net Working Hours Calculation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">Staff:</label>
          <select
            value={selectedEmpId}
            onChange={e => setSelectedEmpId(e.target.value)}
            className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#C5A059]"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 KPI Cards: Net Working Hours, Total Break, Active Status, Breaks Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* 1. Net Working Hours */}
        <div className="p-5 bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Net Working Hours
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Productive</span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
            {summary.netWorkingHoursFormatted}
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">
            {summary.netWorkingHours} hrs / 8.50h Gross
          </span>
        </div>

        {/* 2. Total Break Duration */}
        <div className="p-5 bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              Total Breaks
            </span>
            <span className="text-[10px] font-mono text-amber-400">{summary.breaksCount} Taken</span>
          </div>
          <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">
            {summary.totalBreakMinutes} mins
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">
            {summary.totalBreakHours} hrs deducted
          </span>
        </div>

        {/* 3. Active Break Status */}
        <div className="p-5 bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-2 shadow-md sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-[#C5A059]" />
              Active Break Status
            </span>
            {activeBreak ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                ON BREAK
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                WORKING ACTIVE
              </span>
            )}
          </div>

          <div className="text-sm font-bold text-white truncate">
            {activeBreak ? `${activeBreak.breakTitle} (Started ${activeBreak.breakStart})` : 'No Active Break • Currently On Duty'}
          </div>

          <span className="text-[10px] text-gray-400 font-mono block">
            {activeBreak ? 'Staff is currently on break. Working hours timer is paused.' : 'Shift in progress. Available to initiate breaks below.'}
          </span>
        </div>

      </div>

      {/* Dynamic Feedback Banner */}
      {feedback && (
        <div className={cn(
          "p-4 rounded-2xl border flex items-start gap-3 shadow-lg animate-in fade-in duration-200 text-xs",
          feedback.type === 'SUCCESS' 
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
            : "bg-rose-500/15 border-rose-500/40 text-rose-300"
        )}>
          {feedback.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-mono text-xs text-gray-200 mt-0.5">{feedback.message}</span>
        </div>
      )}

      {/* Break Action Controls Bar */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <h4 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#C5A059]" />
            Break Action Controls
          </span>
          <span className="text-xs font-mono text-gray-400 font-normal">
            Select an action to trigger Break Start or Break End
          </span>
        </h4>

        {activeBreak ? (
          /* When on active break: Big End Break button */
          <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                Currently On: {activeBreak.breakTitle}
              </span>
              <p className="text-xs text-gray-300">
                Break started at <strong>{activeBreak.breakStart}</strong>. Click below to conclude your break and resume working hours calculation.
              </p>
            </div>

            <button
              onClick={handleEndBreak}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-[#C5A059] hover:from-amber-600 hover:to-[#b08d4a] text-[#0A0A0B] font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 mx-auto transition-all transform hover:scale-105 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              End Break & Resume Work
            </button>
          </div>
        ) : (
          /* When working: 3 Break Start buttons (Lunch, Tea, Custom) */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. LUNCH BREAK */}
            <button
              onClick={() => handleStartBreak('LUNCH')}
              className="p-5 bg-[#0A0A0B] border border-[#1F1F21] hover:border-amber-500/50 rounded-2xl text-left space-y-3 transition-all hover:bg-[#161618] group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm font-bold text-white block group-hover:text-amber-400 transition-colors">
                  Lunch Break
                </strong>
                <span className="text-xs text-gray-400 font-mono">30 - 45 mins allowed</span>
              </div>
              <div className="text-[11px] font-mono text-[#C5A059] flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                Start Lunch Break
              </div>
            </button>

            {/* 2. TEA BREAK */}
            <button
              onClick={() => handleStartBreak('TEA')}
              className="p-5 bg-[#0A0A0B] border border-[#1F1F21] hover:border-[#C5A059]/50 rounded-2xl text-left space-y-3 transition-all hover:bg-[#161618] group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm font-bold text-white block group-hover:text-[#C5A059] transition-colors">
                  Tea Break
                </strong>
                <span className="text-xs text-gray-400 font-mono">15 mins refreshment</span>
              </div>
              <div className="text-[11px] font-mono text-[#C5A059] flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                Start Tea Break
              </div>
            </button>

            {/* 3. CUSTOM BREAK */}
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="p-5 bg-[#0A0A0B] border border-[#1F1F21] hover:border-purple-500/50 rounded-2xl text-left space-y-3 transition-all hover:bg-[#161618] group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Hourglass className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm font-bold text-white block group-hover:text-purple-400 transition-colors">
                  Custom Break
                </strong>
                <span className="text-xs text-gray-400 font-mono">Prayer / Rest / Emergency</span>
              </div>
              <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                Configure & Start
              </div>
            </button>

          </div>
        )}

        {/* Working Hours Math Breakdown Card */}
        <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl space-y-2 text-xs font-mono">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">
            Automated Working Hours Calculation Formula:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-[#131315] border border-[#2D2D30] text-gray-300">
              Gross Shift: <strong>{summary.grossWorkHours}h</strong>
            </span>
            <span className="text-gray-500 font-bold">-</span>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Total Breaks: <strong>{summary.totalBreakHours}h ({summary.totalBreakMinutes}m)</strong>
            </span>
            <span className="text-gray-500 font-bold">=</span>
            <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              Net Productive Working Hours: {summary.netWorkingHoursFormatted} ({summary.netWorkingHours}h)
            </span>
          </div>
        </div>

      </div>

      {/* Break History Audit Table */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          Today's Break Logs & Duration Audit
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Break Type</th>
                <th className="py-3 px-4">Title / Reason</th>
                <th className="py-3 px-4">Break Start</th>
                <th className="py-3 px-4">Break End</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {history.map(b => (
                <tr key={b.id} className="hover:bg-[#161618] transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {b.employeeName}
                    <span className="text-[10px] text-gray-500 font-mono block font-normal">{b.department}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      b.breakType === 'LUNCH' ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                      b.breakType === 'TEA' ? "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30" :
                      "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    )}>
                      {b.breakType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    <strong className="text-white block">{b.breakTitle}</strong>
                    {b.customReason && <span className="text-[10px] text-gray-500">{b.customReason}</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-400">{b.breakStart}</td>
                  <td className="py-3 px-4 text-gray-300">{b.breakEnd || 'In Progress...'}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{b.durationFormatted}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      b.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse"
                    )}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOM BREAK MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Hourglass className="w-5 h-5 text-purple-400" />
                Configure Custom Break
              </h3>
              <button onClick={() => setIsCustomModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Custom Break Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Rest Break, Prayer Break"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Eye rest, medication, hydration..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0B] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStartBreak('CUSTOM', customTitle, customReason)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20"
                >
                  Start Custom Break
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
