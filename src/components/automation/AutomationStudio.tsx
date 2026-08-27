import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Play, CheckCircle2, AlertTriangle, Clock, ShieldCheck, 
  Mail, FileText, ShoppingCart, Boxes, RefreshCw, Layers, Zap, Calendar, History, ArrowRight
} from 'lucide-react';
import { AutomationEngine } from '../../lib/automation/automationEngine';
import { AutomationJob, AutomationExecutionLog, AutomationActionType } from '../../types/automation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function AutomationStudio() {
  const { activeTemplate, businessType } = useAuth();
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [logs, setLogs] = useState<AutomationExecutionLog[]>([]);
  const [executingJobId, setExecutingJobId] = useState<string | null>(null);
  const [lastExecutionToast, setLastExecutionToast] = useState<{ name: string; summary: string } | null>(null);

  const loadAutomationData = useCallback(() => {
    setJobs(AutomationEngine.getJobs());
    setLogs(AutomationEngine.getLogs(20));
  }, []);

  useEffect(() => {
    loadAutomationData();
  }, [loadAutomationData]);

  const handleToggleJob = (jobId: string, currentEnabled: boolean) => {
    AutomationEngine.toggleJob(jobId, !currentEnabled);
    loadAutomationData();
  };

  const handleRunNow = (job: AutomationJob) => {
    setExecutingJobId(job.id);
    setTimeout(() => {
      const result = AutomationEngine.executeJob(job.id);
      loadAutomationData();
      setExecutingJobId(null);
      setLastExecutionToast({
        name: job.name,
        summary: result.summary,
      });
      setTimeout(() => setLastExecutionToast(null), 6000);
    }, 400);
  };

  const getActionIcon = (type: AutomationActionType) => {
    switch (type) {
      case 'DAILY_BACKUP': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'WEEKLY_SALES_EMAIL': return <Mail className="w-5 h-5 text-purple-400" />;
      case 'MONTHLY_GST_REPORT': return <FileText className="w-5 h-5 text-[#C5A059]" />;
      case 'AUTO_PURCHASE_ORDER': return <ShoppingCart className="w-5 h-5 text-sky-400" />;
      case 'AUTO_STOCK_ALERT': return <Boxes className="w-5 h-5 text-rose-400" />;
    }
  };

  const activeJobsCount = jobs.filter(j => j.enabled).length;

  return (
    <div className="space-y-6">
      
      {/* Execution Toast / Alert */}
      {lastExecutionToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-400 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span><strong>{lastExecutionToast.name}:</strong> {lastExecutionToast.summary}</span>
          </div>
          <button onClick={() => setLastExecutionToast(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Active Automations</span>
            <Zap className="w-4 h-4 text-[#C5A059]" />
          </div>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{activeJobsCount} of {jobs.length}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Autonomous workflows running</p>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Daily Backup</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">Protected</p>
          <p className="text-[10px] text-gray-500 mt-1">Next snapshot: Today, 11:59 PM</p>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Tax & GST Engine</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1 font-mono">GSTR-1 Auto</p>
          <p className="text-[10px] text-gray-500 mt-1">1st of next month</p>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Stock Watcher</span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400 mt-1 font-mono">Real-Time</p>
          <p className="text-[10px] text-gray-500 mt-1">Auto PO & low stock scanner</p>
        </div>
      </div>

      {/* Automation Recipes & Workflows List */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
              Configured Automation Rules ({jobs.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Automate scheduled routines, reports, stock triggers, and backups</p>
          </div>
          <button
            onClick={loadAutomationData}
            className="p-2 bg-[#1A1A1C] border border-[#2D2D30] hover:border-[#C5A059] rounded-xl text-gray-400 hover:text-white transition-colors"
            title="Refresh Automations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {jobs.map(job => {
            const isRunning = executingJobId === job.id;
            return (
              <div
                key={job.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                  job.enabled 
                    ? "bg-[#161618] border-[#1F1F21] hover:border-[#C5A059]/40" 
                    : "bg-[#0F0F10] border-[#1A1A1C] opacity-60"
                )}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-[#0A0A0B] border border-[#2D2D30] flex-shrink-0">
                    {getActionIcon(job.actionType)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm tracking-tight">{job.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#1A1A1C] border border-[#2D2D30] text-[10px] text-[#C5A059] font-mono">
                        {job.scheduleDescription}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{job.description}</p>
                    {job.lastRunTime && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono pt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Last Run: {new Date(job.lastRunTime).toLocaleString()}</span>
                        <span className="text-emerald-400 font-bold">● {job.lastRunStatus}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
                  {/* Run Now Button */}
                  <button
                    disabled={isRunning}
                    onClick={() => handleRunNow(job)}
                    className="px-3 py-1.5 bg-[#1A1A1C] border border-[#2D2D30] hover:border-[#C5A059] text-white hover:text-[#C5A059] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Play className={cn("w-3.5 h-3.5", isRunning ? "animate-spin text-[#C5A059]" : "text-[#C5A059]")} />
                    <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                  </button>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleJob(job.id, job.enabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      job.enabled ? "bg-[#C5A059]" : "bg-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        job.enabled ? "translate-x-5 bg-[#0A0A0B]" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Audit Log Table */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <History className="w-5 h-5 text-[#C5A059]" />
            Automation Audit Log & Run History
          </h3>
          <span className="text-xs text-gray-500 font-mono">Last {logs.length} executions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161618] text-gray-400 font-bold uppercase text-[10px] border-b border-[#1F1F21]">
              <tr>
                <th className="p-3">Job Name</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Status</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Summary Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[#161618] transition-colors">
                  <td className="p-3 font-bold text-white">{log.jobName}</td>
                  <td className="p-3 text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-400">{log.durationMs}ms</td>
                  <td className="p-3 text-gray-300 font-medium">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
