import React, { useState } from 'react';
import { 
  Users, UserCheck, UserX, Clock, Calendar, 
  Home, TrendingUp, Percent, Search, Filter, 
  ShieldCheck, ArrowUpRight, BarChart3, RefreshCw, 
  Smartphone, Monitor, Globe, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { 
  AttendanceDashboardMetrics, 
  AttendanceTrendPoint, 
  TodayPunchFeedItem 
} from '../../types/attendanceDashboard';
import { AttendanceDashboardEngine } from '../../lib/attendance/attendanceDashboardEngine';
import { cn } from '../../lib/utils';

export default function AttendanceDashboardStudio() {
  const [metrics, setMetrics] = useState<AttendanceDashboardMetrics>(
    AttendanceDashboardEngine.getDashboardMetrics()
  );
  const [trendData, setTrendData] = useState<AttendanceTrendPoint[]>(
    AttendanceDashboardEngine.getAttendanceTrendData(7)
  );
  const [punches, setPunches] = useState<TodayPunchFeedItem[]>(
    AttendanceDashboardEngine.getTodayPunchesFeed()
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const refreshData = () => {
    setMetrics(AttendanceDashboardEngine.getDashboardMetrics());
    setTrendData(AttendanceDashboardEngine.getAttendanceTrendData(7));
    setPunches(AttendanceDashboardEngine.getTodayPunchesFeed({
      search,
      status: statusFilter,
      department: deptFilter,
    }));
  };

  const handleFilter = () => {
    setPunches(AttendanceDashboardEngine.getTodayPunchesFeed({
      search,
      status: statusFilter,
      department: deptFilter,
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#C5A059]" />
            Real-Time Attendance Operations Dashboard
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Enterprise analytics • Live Staff Punches • Geofence Monitoring • 7-Day Trend Chart • Productivity Ratios.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="px-4 py-2 bg-[#0A0A0B] border border-[#2D2D30] hover:border-[#C5A059] text-xs font-mono text-gray-300 rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
          Live Refresh
        </button>
      </div>

      {/* 7 DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        
        {/* 1. Present Today */}
        <div className="p-4 bg-[#131315] border border-[#1F1F21] hover:border-emerald-500/40 rounded-2xl space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase">1. Present</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {metrics.presentToday}
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">
            {Math.round((metrics.presentToday / metrics.totalStaffCount) * 100)}% of Staff
          </span>
        </div>

        {/* 2. Absent Today */}
        <div className="p-4 bg-[#131315] border border-[#1F1F21] hover:border-rose-500/40 rounded-2xl space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase">2. Absent</span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400 tracking-tight">
            {metrics.absentToday}
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">Unplanned</span>
        </div>

        {/* 3. Late Today */}
        <div className="p-4 bg-[#131315] border border-[#1F1F21] hover:border-amber-500/40 rounded-2xl space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase">3. Late</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
            {metrics.lateToday}
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">Grace Exceeded</span>
        </div>

        {/* 4. Leave Today */}
        <div className="p-4 bg-[#131315] border border-[#1F1F21] hover:border-purple-500/40 rounded-2xl space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase">4. Leave</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-400 tracking-tight">
            {metrics.leaveToday}
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">Approved Leaves</span>
        </div>

        {/* 5. Work From Home */}
        <div className="p-4 bg-[#131315] border border-[#1F1F21] hover:border-cyan-500/40 rounded-2xl space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase">5. WFH</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Home className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400 tracking-tight">
            {metrics.workFromHome}
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">Remote Verified</span>
        </div>

        {/* 6. Average Hours */}
        <div className="p-4 bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase">6. Avg Hours</span>
            <div className="w-6 h-6 rounded-lg bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {metrics.averageHoursFormatted}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono block">
            {metrics.averageHours}h / 8.0h Target
          </span>
        </div>

        {/* 7. Monthly Attendance % */}
        <div className="p-4 bg-[#131315] border border-[#1F1F21] hover:border-emerald-500/40 rounded-2xl space-y-2 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase">7. Monthly %</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {metrics.monthlyAttendancePercentage}%
          </div>
          <span className="text-[10px] text-gray-400 font-mono block">Organization Rate</span>
        </div>

      </div>

      {/* ATTENDANCE TREND CHART WIDGET */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1F21] pb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C5A059]" />
              7-Day Attendance Trend & Ratio Chart
            </h4>
            <p className="text-xs text-gray-400">
              Daily staff presence, on-time arrivals, late marks, leaves, and work from home metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Late</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> WFH</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Leave</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Absent</span>
          </div>
        </div>

        {/* Visual Bar Chart Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end min-h-[180px]">
          {trendData.map((pt, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {pt.attendancePercentage}%
              </span>

              {/* Stacked Bar Container */}
              <div className="w-full max-w-[40px] bg-[#0A0A0B] border border-[#1F1F21] group-hover:border-[#C5A059]/50 rounded-xl overflow-hidden flex flex-col-reverse h-36 p-1 transition-all">
                {/* Present (Green) */}
                <div 
                  className="bg-emerald-500 rounded-sm w-full transition-all" 
                  style={{ height: `${(pt.present / 30) * 100}%` }}
                  title={`Present: ${pt.present}`}
                />
                {/* Late (Amber) */}
                <div 
                  className="bg-amber-500 rounded-sm w-full transition-all mb-0.5" 
                  style={{ height: `${(pt.late / 30) * 100}%` }}
                  title={`Late: ${pt.late}`}
                />
                {/* WFH (Cyan) */}
                <div 
                  className="bg-cyan-500 rounded-sm w-full transition-all mb-0.5" 
                  style={{ height: `${(pt.wfh / 30) * 100}%` }}
                  title={`WFH: ${pt.wfh}`}
                />
              </div>

              {/* Date Label */}
              <span className="text-[10px] font-mono text-gray-400 text-center truncate max-w-full">
                {pt.dayLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TODAY'S PUNCHES LIVE FEED & TABLE */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        
        {/* Table Header & Search Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1F1F21] pb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              Today's Punches Live Stream
            </h4>
            <p className="text-xs text-gray-400">
              Live audit stream of all staff check-in times, worked hours, geofence validations, and hardware devices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, dept, branch..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyUp={handleFilter}
                className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); }}
              className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-[#C5A059] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="WFH">WFH</option>
              <option value="ON_LEAVE">ON LEAVE</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
        </div>

        {/* Punches Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Punch In</th>
                <th className="py-3 px-4">Punch Out</th>
                <th className="py-3 px-4">Worked Hours</th>
                <th className="py-3 px-4">Geofence</th>
                <th className="py-3 px-4">Device & IP</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {punches.map(p => (
                <tr key={p.id} className="hover:bg-[#161618] transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {p.employeeName}
                    <span className="text-[10px] text-gray-500 font-mono block font-normal">{p.department}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 truncate max-w-[140px]">{p.branchName}</td>
                  <td className="py-3 px-4 text-[#C5A059] font-bold">{p.punchInTime}</td>
                  <td className="py-3 px-4 text-gray-400">{p.punchOutTime || '—'}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{p.workedHoursFormatted}</td>
                  <td className="py-3 px-4">
                    {p.isGeofenceVerified ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-[11px] truncate max-w-[130px]">
                    {p.device}
                    {p.ipAddress && <span className="text-cyan-400 block text-[10px]">{p.ipAddress}</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      p.status === 'PRESENT' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                      p.status === 'LATE' ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                      p.status === 'WFH' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" :
                      p.status === 'ON_LEAVE' ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                      "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    )}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
