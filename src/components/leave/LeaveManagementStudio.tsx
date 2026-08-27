import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Search, CheckCircle2, 
  XCircle, AlertCircle, Send, ShieldAlert, Check, X, Filter, 
  ChevronLeft, ChevronRight, BarChart3, User, Briefcase, FileText,
  Building2, Home, Heart, Baby, Umbrella, Award, ArrowRight
} from 'lucide-react';
import { 
  LeaveApplication, LeaveType, LeaveStatus, LeaveSummaryMetrics,
  MonthlyLeaveSummaryItem, YearlyLeaveSummaryItem 
} from '../../types/leave';
import { LeaveEngine, LEAVE_TYPE_CONFIG } from '../../lib/leave/leaveEngine';
import { cn } from '../../lib/utils';

export default function LeaveManagementStudio() {
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR' | 'MONTHLY' | 'YEARLY'>('LIST');
  const [userRolePersona, setUserRolePersona] = useState<'EMPLOYEE' | 'MANAGER' | 'HR'>('MANAGER');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<LeaveType | 'ALL'>('ALL');
  
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [metrics, setMetrics] = useState<LeaveSummaryMetrics>(LeaveEngine.getLeaveMetrics());
  const [monthlySummary, setMonthlySummary] = useState<MonthlyLeaveSummaryItem[]>([]);
  const [yearlySummary, setYearlySummary] = useState<YearlyLeaveSummaryItem[]>([]);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [activeLeave, setActiveLeave] = useState<LeaveApplication | null>(null);

  // Form States
  const [applyForm, setApplyForm] = useState({
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    leaveType: 'CASUAL_LEAVE' as LeaveType,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    isHalfDay: false,
    reason: '',
  });

  const [rejectReason, setRejectReason] = useState('');
  const [forwardRecipient, setForwardRecipient] = useState('HR Director / Corporate Board');
  const [overrideStatus, setOverrideStatus] = useState<LeaveStatus>('APPROVED');
  const [overrideRemarks, setOverrideRemarks] = useState('');

  const refreshAll = () => {
    const list = LeaveEngine.getLeaveApplications({
      search,
      status: statusFilter,
      leaveType: typeFilter,
    });
    setApplications(list);
    setMetrics(LeaveEngine.getLeaveMetrics());
    setMonthlySummary(LeaveEngine.getMonthlyLeaveSummary(2026));
    setYearlySummary(LeaveEngine.getYearlyLeaveSummary(2026));
  };

  useEffect(() => {
    refreshAll();
  }, [search, statusFilter, typeFilter]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.reason.trim()) {
      alert('Please enter a valid reason for the leave application.');
      return;
    }

    LeaveEngine.applyLeave(applyForm);
    setIsApplyModalOpen(false);
    setApplyForm({
      ...applyForm,
      reason: '',
    });
    refreshAll();
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      LeaveEngine.cancelLeave(id);
      refreshAll();
    }
  };

  const handleApprove = (id: string) => {
    LeaveEngine.managerApprove(id, 'Anitha Venkatesh (Operations Manager)');
    refreshAll();
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeLeave) {
      LeaveEngine.managerReject(activeLeave.id, 'Anitha Venkatesh', rejectReason || 'Declined due to critical shift staffing.');
      setIsRejectModalOpen(false);
      setRejectReason('');
      refreshAll();
    }
  };

  const handleForwardConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeLeave) {
      LeaveEngine.managerForward(activeLeave.id, 'Anitha Venkatesh', forwardRecipient);
      setIsForwardModalOpen(false);
      refreshAll();
    }
  };

  const handleOverrideConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeLeave) {
      LeaveEngine.hrOverride(activeLeave.id, 'HR Administration Lead', overrideStatus, overrideRemarks || 'Administrative policy exception approval.');
      setIsOverrideModalOpen(false);
      setOverrideRemarks('');
      refreshAll();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Persona Switcher */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#C5A059]" />
            Universal Leave Management System
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            8 Leave Types • Employee Apply/Cancel • Manager Approve/Reject/Forward • HR Override • Calendar, Monthly & Yearly Views.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Persona Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#0A0A0B] border border-[#1F1F21] text-xs">
            <button
              onClick={() => setUserRolePersona('EMPLOYEE')}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all",
                userRolePersona === 'EMPLOYEE' ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400 hover:text-white"
              )}
            >
              Employee
            </button>
            <button
              onClick={() => setUserRolePersona('MANAGER')}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all",
                userRolePersona === 'MANAGER' ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400 hover:text-white"
              )}
            >
              Manager
            </button>
            <button
              onClick={() => setUserRolePersona('HR')}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all",
                userRolePersona === 'HR' ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400 hover:text-white"
              )}
            >
              HR Admin
            </button>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-400 text-xs font-mono uppercase block">Pending Approval</span>
            <strong className="text-2xl font-bold text-amber-400 mt-0.5 block">{metrics.pendingCount} Requests</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-400 text-xs font-mono uppercase block">Approved Leaves</span>
            <strong className="text-2xl font-bold text-emerald-400 mt-0.5 block">{metrics.approvedCount} Approved</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-400 text-xs font-mono uppercase block">Rejected / Cancelled</span>
            <strong className="text-2xl font-bold text-rose-400 mt-0.5 block">
              {metrics.rejectedCount + metrics.cancelledCount} Total
            </strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm font-mono">
          <div>
            <span className="text-gray-400 text-xs uppercase block">Live Leave Balances</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-white">
              <span className="text-[#C5A059]">CL: {metrics.balances.CASUAL_LEAVE?.available}</span>
              <span>•</span>
              <span className="text-blue-400">EL: {metrics.balances.EARNED_LEAVE?.available}</span>
              <span>•</span>
              <span className="text-emerald-400">WFH: {metrics.balances.WORK_FROM_HOME?.available}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Mode Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-[#1F1F21] pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'LIST' as const, label: '📋 Leave Applications & History' },
          { id: 'CALENDAR' as const, label: '📅 Calendar View' },
          { id: 'MONTHLY' as const, label: '📊 Monthly View' },
          { id: 'YEARLY' as const, label: '📈 Yearly View' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
              viewMode === tab.id
                ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: APPLICATIONS LIST & HISTORY */}
      {viewMode === 'LIST' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Employee, Department, or Reason..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="FORWARDED">Forwarded</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
              >
                <option value="ALL">All 8 Leave Types</option>
                <option value="CASUAL_LEAVE">Casual Leave (CL)</option>
                <option value="SICK_LEAVE">Sick Leave (SL)</option>
                <option value="EARNED_LEAVE">Earned Leave (EL)</option>
                <option value="MATERNITY_LEAVE">Maternity Leave (ML)</option>
                <option value="PATERNITY_LEAVE">Paternity Leave (PL)</option>
                <option value="LOSS_OF_PAY">Loss Of Pay (LOP)</option>
                <option value="WORK_FROM_HOME">Work From Home (WFH)</option>
                <option value="CUSTOM">Custom Leave</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase font-mono">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration & Dates</th>
                  <th className="py-3 px-4">Reason & Remarks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions ({userRolePersona})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-white block font-bold">{app.employeeName}</strong>
                      <span className="text-[10px] text-gray-500 font-mono">{app.department}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#2D2D30] text-[#C5A059] font-mono text-[10px] font-bold">
                        {LEAVE_TYPE_CONFIG[app.leaveType]?.label || app.leaveType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-300">
                      <div>{app.startDate} to {app.endDate}</div>
                      <span className="text-[10px] text-[#C5A059] font-bold">
                        {app.totalDays} Day{app.totalDays > 1 ? 's' : ''} {app.isHalfDay ? '(Half-Day)' : ''}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-300 max-w-xs">
                      <p className="line-clamp-1">{app.reason}</p>
                      {app.managerRemarks && (
                        <span className="text-[10px] text-amber-400 block mt-0.5 font-mono">
                          Manager: {app.managerRemarks}
                        </span>
                      )}
                      {app.hrOverrideRemarks && (
                        <span className="text-[10px] text-purple-400 block mt-0.5 font-mono">
                          {app.hrOverrideRemarks}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider",
                        app.status === 'APPROVED' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                        app.status === 'PENDING' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                        app.status === 'FORWARDED' && "bg-purple-500/10 text-purple-400 border border-purple-500/20",
                        app.status === 'REJECTED' && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                        app.status === 'CANCELLED' && "bg-gray-800 text-gray-400 border border-gray-700"
                      )}>
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* EMPLOYEE ACTIONS */}
                        {userRolePersona === 'EMPLOYEE' && (app.status === 'PENDING' || app.status === 'APPROVED') && (
                          <button
                            onClick={() => handleCancel(app.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#0A0A0B] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-[#2D2D30] text-[10px] font-bold transition-colors"
                          >
                            Cancel Leave
                          </button>
                        )}

                        {/* MANAGER ACTIONS */}
                        {userRolePersona === 'MANAGER' && (app.status === 'PENDING' || app.status === 'FORWARDED') && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-colors flex items-center gap-1"
                              title="Approve Leave"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>

                            <button
                              onClick={() => { setActiveLeave(app); setIsRejectModalOpen(true); }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-colors flex items-center gap-1"
                              title="Reject Leave"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>

                            <button
                              onClick={() => { setActiveLeave(app); setIsForwardModalOpen(true); }}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold transition-colors flex items-center gap-1"
                              title="Forward Leave"
                            >
                              <Send className="w-3 h-3" /> Forward
                            </button>
                          </>
                        )}

                        {/* HR OVERRIDE ACTIONS */}
                        {userRolePersona === 'HR' && (
                          <button
                            onClick={() => { setActiveLeave(app); setIsOverrideModalOpen(true); }}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold transition-colors flex items-center gap-1"
                            title="HR Administrative Override"
                          >
                            <ShieldAlert className="w-3 h-3" /> HR Override
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* VIEW 2: CALENDAR VIEW */}
      {viewMode === 'CALENDAR' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
              Staff Leave Roster: August 2026
            </h4>
            <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" /> Casual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Sick</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Earned</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> WFH</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-2 bg-[#0A0A0B] rounded-lg font-mono font-bold text-gray-400">{d}</div>
            ))}
            
            {/* Calendar Days */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const dayStr = `2026-08-${String(day).padStart(2, '0')}`;
              const dayLeaves = applications.filter(a => dayStr >= a.startDate && dayStr <= a.endDate);

              return (
                <div key={day} className="min-h-[85px] p-2 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl text-left flex flex-col justify-between">
                  <span className="font-mono text-xs font-bold text-gray-400">{day}</span>
                  <div className="space-y-1">
                    {dayLeaves.map(dl => (
                      <div 
                        key={dl.id} 
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono truncate"
                        style={{ backgroundColor: `${LEAVE_TYPE_CONFIG[dl.leaveType]?.color}20`, color: LEAVE_TYPE_CONFIG[dl.leaveType]?.color }}
                      >
                        {dl.employeeName.split(' ')[0]} ({dl.leaveType.slice(0, 2)})
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY VIEW */}
      {viewMode === 'MONTHLY' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-[#1F1F21] pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#C5A059]" />
              Monthly Leave Consumption Breakdown (Year 2026)
            </h4>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Total Leaves</th>
                  <th className="py-2.5 px-3">Casual (CL)</th>
                  <th className="py-2.5 px-3">Sick (SL)</th>
                  <th className="py-2.5 px-3">Earned (EL)</th>
                  <th className="py-2.5 px-3">WFH</th>
                  <th className="py-2.5 px-3">Loss of Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {monthlySummary.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{m.month}</td>
                    <td className="py-2.5 px-3 font-bold text-[#C5A059]">{m.totalLeaves} Days</td>
                    <td className="py-2.5 px-3 text-gray-300">{m.casualLeaves}</td>
                    <td className="py-2.5 px-3 text-gray-300">{m.sickLeaves}</td>
                    <td className="py-2.5 px-3 text-gray-300">{m.earnedLeaves}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{m.wfhCount}</td>
                    <td className="py-2.5 px-3 text-rose-400">{m.lossOfPay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: YEARLY VIEW */}
      {viewMode === 'YEARLY' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-[#1F1F21] pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C5A059]" />
              Annual Leave Entitlement vs Utilization Rate (Year 2026)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yearlySummary.map(item => (
              <div key={item.leaveType} className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">{item.label}</strong>
                  <span className="text-xs font-mono text-[#C5A059] font-bold">{item.utilizationRate}% Consumed</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[#1F1F21] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#C5A059] to-[#E5C07B]" 
                    style={{ width: `${item.utilizationRate}%` }} 
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Quota: <strong className="text-white">{item.allocated}</strong></span>
                  <span>Consumed: <strong className="text-amber-400">{item.consumed}</strong></span>
                  <span>Balance: <strong className="text-emerald-400">{item.balance}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: APPLY LEAVE */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#C5A059]" />
                Apply for Leave
              </h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Leave Type (8 Supported Types) *</label>
                <select
                  value={applyForm.leaveType}
                  onChange={e => setApplyForm({ ...applyForm, leaveType: e.target.value as LeaveType })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                >
                  <option value="CASUAL_LEAVE">Casual Leave (CL)</option>
                  <option value="SICK_LEAVE">Sick Leave (SL)</option>
                  <option value="EARNED_LEAVE">Earned Leave (EL)</option>
                  <option value="MATERNITY_LEAVE">Maternity Leave (ML)</option>
                  <option value="PATERNITY_LEAVE">Paternity Leave (PL)</option>
                  <option value="LOSS_OF_PAY">Loss Of Pay (LOP)</option>
                  <option value="WORK_FROM_HOME">Work From Home (WFH)</option>
                  <option value="CUSTOM">Custom Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={e => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={e => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="halfDayCheck"
                  checked={applyForm.isHalfDay}
                  onChange={e => setApplyForm({ ...applyForm, isHalfDay: e.target.checked })}
                  className="rounded bg-[#0A0A0B] border-[#2D2D30] text-[#C5A059] focus:ring-[#C5A059]"
                />
                <label htmlFor="halfDayCheck" className="text-gray-300">
                  Half-Day Leave (0.5 Day)
                </label>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State reason clearly..."
                  value={applyForm.reason}
                  onChange={e => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0B] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold rounded-xl shadow-md shadow-[#C5A059]/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGER REJECT */}
      {isRejectModalOpen && activeLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Reject Leave Application
            </h3>
            <p className="text-xs text-gray-400">
              Rejecting request for <strong>{activeLeave.employeeName}</strong> ({activeLeave.totalDays} Days).
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Rejection Remarks *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Reason for declining..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-rose-400 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0B] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGER FORWARD */}
      {isForwardModalOpen && activeLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              Forward Leave for Concurrence
            </h3>

            <form onSubmit={handleForwardConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Forward To *</label>
                <select
                  value={forwardRecipient}
                  onChange={e => setForwardRecipient(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-purple-400 outline-none"
                >
                  <option value="HR Director / Corporate Board">HR Director / Corporate Board</option>
                  <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
                  <option value="General Manager (Operations)">General Manager (Operations)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsForwardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0B] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  Forward Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HR OVERRIDE */}
      {isOverrideModalOpen && activeLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              HR Administrative Override
            </h3>

            <form onSubmit={handleOverrideConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Override Status *</label>
                <select
                  value={overrideStatus}
                  onChange={e => setOverrideStatus(e.target.value as LeaveStatus)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-purple-400 outline-none"
                >
                  <option value="APPROVED">Force Approve</option>
                  <option value="REJECTED">Force Reject</option>
                  <option value="CANCELLED">Force Cancel</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Administrative Remarks *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="HR justification..."
                  value={overrideRemarks}
                  onChange={e => setOverrideRemarks(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-purple-400 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0B] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
