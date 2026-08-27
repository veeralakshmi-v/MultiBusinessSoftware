import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, CalendarDays, FileCheck, CheckCircle2, XCircle, AlertCircle,
  Users, Filter, Search, ThumbsUp, ThumbsDown, ChevronDown, BarChart3,
  UserCircle, MapPin, Camera, TrendingUp, CalendarCheck, UserX, Timer
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = 'ON_TIME' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'LEAVE' | 'HOLIDAY';
type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface RawAttendanceRecord {
  id: string; date: string;
  punchIn: string; punchInSelfie: string; punchInLocation: string;
  punchOut: string | null; punchOutSelfie: string | null; punchOutLocation: string | null;
}

interface LeaveRecord {
  id: string; date: string; appliedOn: string;
  type: string; reason: string; status: LeaveStatus;
  employeeId?: string; employeeName?: string;
  adminNote?: string;
}

interface StaffMember {
  id: string; name: string; username: string; role: string;
  phone: string; email: string; status: string; pinCode: string;
  shiftStart?: string; lateThreshold?: string;
}

// ─── Attendance Status Calculation ───────────────────────────────────────────

const SHIFT_START_DEFAULT   = '09:00'; // HH:MM 24h
const LATE_THRESHOLD_DEFAULT = '09:30';
const HALF_DAY_HOURS        = 4;
const FULL_DAY_HOURS        = 6;

function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  // Handle "hh:mm am/pm" format
  const lower = t.trim().toLowerCase();
  const isPM = lower.includes('pm');
  const isAM = lower.includes('am');
  const clean = lower.replace(/[apm]/g, '').trim();
  const [h, m] = clean.split(':').map(Number);
  let hours = h;
  if (isPM && hours !== 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + (m || 0);
}

function calcWorkedHours(punchIn: string, punchOut: string | null): number {
  if (!punchOut) return 0;
  const inMin = parseTimeToMinutes(punchIn);
  const outMin = parseTimeToMinutes(punchOut);
  return Math.max(0, (outMin - inMin) / 60);
}

function calcAttendanceStatus(
  rec: RawAttendanceRecord | undefined,
  hasApprovedLeave: boolean,
  shiftStart = SHIFT_START_DEFAULT,
  lateThreshold = LATE_THRESHOLD_DEFAULT
): AttendanceStatus {
  if (hasApprovedLeave) return 'LEAVE';
  if (!rec) return 'ABSENT';

  const inMin  = parseTimeToMinutes(rec.punchIn);
  const lateMin = parseTimeToMinutes(lateThreshold);
  const worked  = calcWorkedHours(rec.punchIn, rec.punchOut);

  if (rec.punchOut) {
    // If total worked time is less than 1 hour (e.g., immediate punch out or 0 mins), it's ABSENT (Full Day Leave)
    if (worked < 1) return 'ABSENT';
    // If worked between 1 hour and 4 hours, it's HALF_DAY
    if (worked < HALF_DAY_HOURS) return 'HALF_DAY';
    // If worked 4+ hours, check if punched in after late threshold
    if (inMin > lateMin) return 'LATE';
    return 'ON_TIME';
  }

  // Only punched in so far (Active day)
  if (inMin > lateMin) return 'LATE';
  return 'ON_TIME';
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  ON_TIME:  { label: 'On Time',  color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', icon: CheckCircle2 },
  LATE:     { label: 'Late',     color: 'text-yellow-400',  bg: 'bg-yellow-500/15',  border: 'border-yellow-500/25',  icon: Timer        },
  HALF_DAY: { label: 'Half Day', color: 'text-orange-400',  bg: 'bg-orange-500/15',  border: 'border-orange-500/25',  icon: Clock        },
  ABSENT:   { label: 'Absent',   color: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/25',     icon: UserX        },
  LEAVE:    { label: 'Leave',    color: 'text-purple-400',  bg: 'bg-purple-500/15',  border: 'border-purple-500/25',  icon: CalendarDays },
  HOLIDAY:  { label: 'Holiday',  color: 'text-blue-400',    bg: 'bg-blue-500/15',    border: 'border-blue-500/25',    icon: CalendarCheck},
};

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StaffAttendance() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves'>('attendance');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [allAttendance, setAllAttendance] = useState<RawAttendanceRecord[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQ, setSearchQ] = useState('');
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | LeaveStatus>('ALL');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const staff: StaffMember[] = JSON.parse(localStorage.getItem('universal_staff_list') || '[]');
    const att: RawAttendanceRecord[] = JSON.parse(localStorage.getItem('emp_attendance') || '[]');
    const lv: LeaveRecord[] = JSON.parse(localStorage.getItem('emp_leaves') || '[]');
    setStaffList(staff.filter(s => s.status === 'ACTIVE'));
    setAllAttendance(att);
    // Enrich leaves with employee names
    const enriched = lv.map(l => {
      const emp = staff.find(s => s.id === l.employeeId);
      const resolvedName = l.employeeName || emp?.name || 'Staff Member';
      return { ...l, employeeName: resolvedName };
    });
    setAllLeaves(enriched);
  }, []);

  const saveLeaves = (updated: LeaveRecord[]) => {
    setAllLeaves(updated);
    localStorage.setItem('emp_leaves', JSON.stringify(updated));
  };

  const approveLeave = (id: string) => {
    const target = allLeaves.find(l => l.id === id);
    saveLeaves(allLeaves.map(l => l.id === id ? { ...l, status: 'APPROVED' as LeaveStatus } : l));
    if (target) {
      try {
        const { NotificationEngine } = require('../lib/notifications/notificationEngine');
        NotificationEngine.dispatch({
          event: 'LEAVE_STATUS_CHANGED',
          recipient: { name: target.employeeName },
          data: {
            date: target.date,
            type: target.type,
            status: 'APPROVED',
          },
        });
      } catch {}
    }
  };
  const rejectLeave = (id: string) => {
    const target = allLeaves.find(l => l.id === id);
    saveLeaves(allLeaves.map(l => l.id === id ? { ...l, status: 'REJECTED' as LeaveStatus } : l));
    if (target) {
      try {
        const { NotificationEngine } = require('../lib/notifications/notificationEngine');
        NotificationEngine.dispatch({
          event: 'LEAVE_STATUS_CHANGED',
          recipient: { name: target.employeeName },
          data: {
            date: target.date,
            type: target.type,
            status: 'REJECTED',
          },
        });
      } catch {}
    }
  };

  // Per-staff attendance for the selected date
  const dailyAttendance = useMemo(() => {
    return staffList
      .filter(s => s.name.toLowerCase().includes(searchQ.toLowerCase()) || s.username.toLowerCase().includes(searchQ.toLowerCase()))
      .map(staff => {
        const rec = allAttendance.find(a => a.date === selectedDate && a.id.startsWith(staff.id));
        const hasApprovedLeave = allLeaves.some(l =>
          l.date === selectedDate && l.status === 'APPROVED' &&
          (l.employeeId === staff.id || l.employeeName === staff.name)
        );
        const status = calcAttendanceStatus(rec, hasApprovedLeave, staff.shiftStart, staff.lateThreshold);
        const worked = rec ? calcWorkedHours(rec.punchIn, rec.punchOut) : 0;
        return { staff, rec, status, worked };
      });
  }, [staffList, allAttendance, allLeaves, selectedDate, searchQ]);

  // Summary counts
  const summary = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      ON_TIME: 0, LATE: 0, HALF_DAY: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: 0
    };
    dailyAttendance.forEach(r => counts[r.status]++);
    return counts;
  }, [dailyAttendance]);

  const filteredLeaves = useMemo(() => {
    return allLeaves.filter(l =>
      (leaveFilter === 'ALL' || l.status === leaveFilter) &&
      (l.employeeName?.toLowerCase().includes(searchQ.toLowerCase()) || l.type.toLowerCase().includes(searchQ.toLowerCase()))
    );
  }, [allLeaves, leaveFilter, searchQ]);

  const pendingCount = allLeaves.filter(l => l.status === 'PENDING').length;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B] text-white overflow-hidden">

      {/* Page header */}
      <div className="px-6 py-5 border-b border-[#1F1F21] flex-shrink-0">
        <h1 className="text-lg font-bold text-white">Staff Attendance</h1>
        <p className="text-xs text-gray-500 mt-0.5">Track daily attendance, status and manage leave requests</p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex items-center gap-2 flex-shrink-0 border-b border-[#1F1F21]">
        {[
          { id: 'attendance', label: 'Daily Attendance', icon: Clock },
          { id: 'leaves',     label: `Leave Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: CalendarDays },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all ${
                active ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">

        {/* ── ATTENDANCE TAB ── */}
        {activeTab === 'attendance' && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search staff..."
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  className="w-full bg-[#131315] border border-[#1F1F21] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]/50" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#131315] border border-[#1F1F21] rounded-xl">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none [color-scheme:dark] cursor-pointer" />
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][])
                .filter(([k]) => k !== 'HOLIDAY')
                .map(([status, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={status} className={`p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{summary[status]}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">of {staffList.length} staff</p>
                    </div>
                  );
                })}
            </div>

            {/* Attendance table */}
            {staffList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-[#0F0F10] border border-[#1F1F21] rounded-2xl">
                <Users className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-400">No active staff found</p>
                <p className="text-xs text-gray-600 mt-1">Add staff members in Settings to track attendance</p>
              </div>
            ) : (
              <div className="bg-[#0F0F10] border border-[#1F1F21] rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1F1F21] bg-[#131315]">
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Employee</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Punch IN</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Punch OUT</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Hours</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Selfies</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyAttendance.map(({ staff, rec, status, worked }) => (
                      <React.Fragment key={staff.id}>
                        <tr
                          className="border-b border-[#1A1A1C] hover:bg-[#131315] cursor-pointer transition-colors"
                          onClick={() => setExpandedRow(expandedRow === staff.id ? null : staff.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/20 flex items-center justify-center text-[10px] font-bold text-[#C5A059]">
                                {staff.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-xs">{staff.name}</p>
                                <p className="text-[9px] text-gray-500 font-mono">{staff.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={status} /></td>
                          <td className="px-4 py-3">
                            {rec?.punchIn
                              ? <span className="text-emerald-400 font-semibold font-mono">{rec.punchIn}</span>
                              : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {rec?.punchOut
                              ? <span className="text-red-400 font-semibold font-mono">{rec.punchOut}</span>
                              : rec ? <span className="text-yellow-400 font-mono text-[10px]">Active</span>
                              : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {worked > 0
                              ? <span className="text-gray-300 font-mono">{worked.toFixed(1)}h</span>
                              : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {rec?.punchInSelfie && (
                                <img src={rec.punchInSelfie} alt="" className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30" />
                              )}
                              {rec?.punchOutSelfie && (
                                <img src={rec.punchOutSelfie} alt="" className="w-7 h-7 rounded-lg object-cover border border-red-500/30" />
                              )}
                              {!rec?.punchInSelfie && <span className="text-gray-600 text-[10px]">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-[120px]">
                            {rec?.punchInLocation
                              ? <span className="text-[9px] text-gray-500 font-mono truncate block">{rec.punchInLocation.split(',').slice(0, 2).join(',')}</span>
                              : <span className="text-gray-600">—</span>}
                          </td>
                        </tr>
                        {/* Expanded detail row */}
                        {expandedRow === staff.id && rec && (
                          <tr className="bg-[#0D0D0F]">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Punch IN Details</p>
                                  {rec.punchInSelfie && (
                                    <img src={rec.punchInSelfie} alt="Punch IN selfie"
                                      className="w-24 h-24 rounded-xl object-cover border border-emerald-500/30" />
                                  )}
                                  {rec.punchInLocation && (
                                    <div className="flex items-start gap-1.5 text-[10px] text-gray-400">
                                      <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                                      <span className="font-mono">{rec.punchInLocation}</span>
                                    </div>
                                  )}
                                </div>
                                {rec.punchOut && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Punch OUT Details</p>
                                    {rec.punchOutSelfie && (
                                      <img src={rec.punchOutSelfie} alt="Punch OUT selfie"
                                        className="w-24 h-24 rounded-xl object-cover border border-red-500/30" />
                                    )}
                                    {rec.punchOutLocation && (
                                      <div className="flex items-start gap-1.5 text-[10px] text-gray-400">
                                        <MapPin className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                                        <span className="font-mono">{rec.punchOutLocation}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── LEAVE REQUESTS TAB ── */}
        {activeTab === 'leaves' && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search employee or leave type..."
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  className="w-full bg-[#131315] border border-[#1F1F21] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]/50" />
              </div>
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                <button key={f} onClick={() => setLeaveFilter(f)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                    leaveFilter === f
                      ? f === 'ALL'      ? 'bg-[#C5A059]/20 border-[#C5A059]/50 text-[#C5A059]'
                      : f === 'PENDING'  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                      : f === 'APPROVED' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      :                    'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-[#131315] border-[#1F1F21] text-gray-400 hover:text-white'
                  }`}>
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                  {f === 'PENDING' && pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[9px]">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Leave requests */}
            {filteredLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-[#0F0F10] border border-[#1F1F21] rounded-2xl">
                <CalendarDays className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-400">No leave requests found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeaves.map(leave => (
                  <div key={leave.id}
                    className={`bg-[#0F0F10] border rounded-2xl p-5 transition-all ${
                      leave.status === 'PENDING'  ? 'border-yellow-500/20'  :
                      leave.status === 'APPROVED' ? 'border-emerald-500/20' : 'border-red-500/15'
                    }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/20 flex items-center justify-center text-sm font-bold text-[#C5A059] flex-shrink-0">
                          {(leave.employeeName || '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-white">{leave.employeeName || 'Staff Member'}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                              {leave.type}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                              📅 {leave.date}
                            </span>
                            <span className="text-[10px] text-gray-600">
                              Applied: {leave.appliedOn}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">{leave.reason}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Status badge */}
                        {leave.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {leave.status === 'APPROVED' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {leave.status === 'REJECTED' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}

                        {/* Approve / Reject buttons (only for PENDING) */}
                        {leave.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => rejectLeave(leave.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/50 text-red-400 text-[10px] font-bold rounded-xl transition-all">
                              <ThumbsDown className="w-3 h-3" /> Reject
                            </button>
                            <button onClick={() => approveLeave(leave.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 text-[10px] font-bold rounded-xl transition-all">
                              <ThumbsUp className="w-3 h-3" /> Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
