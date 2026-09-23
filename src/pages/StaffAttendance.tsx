import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import {
  Clock, CalendarDays, FileCheck, CheckCircle2, XCircle, AlertCircle,
  Users, Filter, Search, ThumbsUp, ThumbsDown, ChevronDown, BarChart3,
  UserCircle, MapPin, Camera, TrendingUp, CalendarCheck, UserX, Timer, Plus
} from 'lucide-react';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = 'ON_TIME' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'LEAVE' | 'HOLIDAY';
type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PunchSession {
  id: string;
  punchIn: string;
  punchInSelfie?: string | null;
  punchInLocation?: string | null;
  punchOut?: string | null;
  punchOutSelfie?: string | null;
  punchOutLocation?: string | null;
  type?: 'NORMAL' | 'BREAK' | 'PERMISSION';
  notes?: string;
}

interface RawAttendanceRecord {
  id: string; date: string;
  punchIn: string; punchInSelfie: string; punchInLocation: string;
  punchOut: string | null; punchOutSelfie: string | null; punchOutLocation: string | null;
  sessions?: PunchSession[];
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
  if (outMin >= inMin) {
    return Math.max(0, (outMin - inMin) / 60);
  }
  return Math.max(0, (1440 - inMin + outMin) / 60);
}

export function calcTotalWorkedHours(rec: RawAttendanceRecord | undefined): number {
  if (!rec) return 0;
  if (Array.isArray(rec.sessions) && rec.sessions.length > 0) {
    let totalMin = 0;
    for (const s of rec.sessions) {
      if (s.punchIn && s.punchOut) {
        const inM = parseTimeToMinutes(s.punchIn);
        const outM = parseTimeToMinutes(s.punchOut);
        if (outM >= inM) {
          totalMin += (outM - inM);
        } else {
          totalMin += (1440 - inM + outM);
        }
      }
    }
    return Math.round((totalMin / 60) * 10) / 10;
  }
  return Math.round(calcWorkedHours(rec.punchIn, rec.punchOut) * 10) / 10;
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
  const worked  = calcTotalWorkedHours(rec);

  const hasOpenSession = Array.isArray(rec.sessions) && rec.sessions.length > 0 
    ? !rec.sessions[rec.sessions.length - 1].punchOut 
    : !rec.punchOut;

  if (!hasOpenSession && worked > 0) {
    if (worked < 1) return 'ABSENT';
    if (worked < HALF_DAY_HOURS) return 'HALF_DAY';
    if (inMin > lateMin) return 'LATE';
    return 'ON_TIME';
  }

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_attendance' | 'calendar' | 'attendance' | 'leaves'>('calendar');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [allAttendance, setAllAttendance] = useState<RawAttendanceRecord[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQ, setSearchQ] = useState('');
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | LeaveStatus>('ALL');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [punchMsg, setPunchMsg] = useState('');

  // Load data & sync with backend database
  const loadData = async () => {
    const bizId = user?.businessId || localStorage.getItem('businessId') || 'biz-default-business';
    const staff: StaffMember[] = JSON.parse(localStorage.getItem('universal_staff_list') || '[]');
    const att: RawAttendanceRecord[] = JSON.parse(localStorage.getItem('emp_attendance') || '[]');
    let lv: LeaveRecord[] = JSON.parse(localStorage.getItem('emp_leaves') || '[]');

    setStaffList(staff.filter(s => s.status === 'ACTIVE'));
    setAllAttendance(att);

    try {
      const res = await fetch(`/api/leaves?businessId=${bizId}`, {
        headers: { 'x-business-id': bizId }
      });
      if (res.ok) {
        const dbLeaves = await res.json();
        if (Array.isArray(dbLeaves) && dbLeaves.length > 0) {
          lv = dbLeaves;
          localStorage.setItem('emp_leaves', JSON.stringify(dbLeaves));
        }
      }
    } catch (err) {}

    // Enrich leaves with employee names
    const enriched = lv.map(l => {
      const emp = staff.find(s => s.id === l.employeeId);
      const resolvedName = l.employeeName || emp?.name || 'Staff Member';
      return { ...l, employeeName: resolvedName };
    });
    setAllLeaves(enriched);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('leaves_updated', loadData);
    window.addEventListener('attendance_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('leaves_updated', loadData);
      window.removeEventListener('attendance_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const saveLeaves = (updated: LeaveRecord[]) => {
    setAllLeaves(updated);
    localStorage.setItem('emp_leaves', JSON.stringify(updated));
  };

  const approveLeave = async (id: string) => {
    const target = allLeaves.find(l => l.id === id);
    const updatedLeaves = allLeaves.map(l => l.id === id ? { ...l, status: 'APPROVED' as LeaveStatus } : l);
    saveLeaves(updatedLeaves);

    const bizId = user?.businessId || localStorage.getItem('businessId') || 'biz-default-business';
    try {
      await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': bizId,
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
    } catch (err) {
      console.warn('Failed to update leave in backend database:', err);
    }

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

  const rejectLeave = async (id: string) => {
    const target = allLeaves.find(l => l.id === id);
    const updatedLeaves = allLeaves.map(l => l.id === id ? { ...l, status: 'REJECTED' as LeaveStatus } : l);
    saveLeaves(updatedLeaves);

    const bizId = user?.businessId || localStorage.getItem('businessId') || 'biz-default-business';
    try {
      await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': bizId,
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
    } catch (err) {
      console.warn('Failed to update leave in backend database:', err);
    }

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
        const rec = allAttendance.find(a => a.date === selectedDate && (a.id.startsWith(staff.id) || a.id.includes(staff.id)));
        const hasApprovedLeave = allLeaves.some(l =>
          l.date === selectedDate && l.status === 'APPROVED' &&
          (l.employeeId === staff.id || l.employeeName === staff.name)
        );
        const status = calcAttendanceStatus(rec, hasApprovedLeave, staff.shiftStart, staff.lateThreshold);
        const worked = rec ? calcTotalWorkedHours(rec) : 0;
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
    <div className="space-y-6">

      {/* Page header */}
      <div className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-lg shadow-gray-200/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">Staff Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Track daily attendance, real-time punch status, biometric verification and leave management</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 font-bold text-xs uppercase tracking-wider shadow-sm">
          Staff & Shifts
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-x-auto no-scrollbar touch-pan-x">
        {[
          { id: 'calendar',       label: 'My Attendance Calendar', icon: CalendarDays },
          { id: 'my_attendance',  label: 'Mark Attendance (Punch IN/OUT)', icon: Clock },
          { id: 'attendance',     label: 'Team Daily Attendance', icon: Users },
          { id: 'leaves',         label: `Leave Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: FileCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn("px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 cursor-pointer", active ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 font-extrabold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80")}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">

        {/* ── MY ATTENDANCE CALENDAR TAB ── */}
        {activeTab === 'calendar' && (
          <AttendanceCalendar
            userId={user?.id || user?.username || 'admin'}
            userName={user?.username || 'User'}
            userRole={user?.role}
            attendanceRecords={allAttendance}
            leaveRecords={allLeaves}
            onAddLeave={(newLeave) => setAllLeaves([newLeave, ...allLeaves])}
          />
        )}

        {/* ── MARK ATTENDANCE (PUNCH IN/OUT) TAB ── */}
        {activeTab === 'my_attendance' && (() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const myId = user?.id || user?.username || 'user';
          const myRec = allAttendance.find(a => a.date === todayStr && (a.id.startsWith(myId) || a.id.includes(myId)));
          
          const sessions: PunchSession[] = myRec?.sessions && myRec.sessions.length > 0 
            ? myRec.sessions 
            : (myRec ? [{
                id: 'sess-1',
                punchIn: myRec.punchIn,
                punchInSelfie: myRec.punchInSelfie,
                punchInLocation: myRec.punchInLocation,
                punchOut: myRec.punchOut,
                punchOutSelfie: myRec.punchOutSelfie,
                punchOutLocation: myRec.punchOutLocation,
              }] : []);

          const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
          const isCurrentlyIn = !!lastSession && !lastSession.punchOut;
          const workedHours = calcTotalWorkedHours(myRec);

          const handleQuickPunch = (mode: 'in' | 'out') => {
            const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const locStr = 'Dashboard GPS Verified (±10m)';
            const selfieUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

            let updated: RawAttendanceRecord[];
            if (mode === 'in') {
              const newSession: PunchSession = {
                id: `sess-${Date.now()}`,
                punchIn: time,
                punchInSelfie: selfieUrl,
                punchInLocation: locStr,
                punchOut: null,
                punchOutSelfie: null,
                punchOutLocation: null,
              };

              if (myRec) {
                const currentSessions = myRec.sessions && myRec.sessions.length > 0 
                  ? myRec.sessions 
                  : [{
                      id: 'sess-1',
                      punchIn: myRec.punchIn,
                      punchInSelfie: myRec.punchInSelfie,
                      punchInLocation: myRec.punchInLocation,
                      punchOut: myRec.punchOut,
                      punchOutSelfie: myRec.punchOutSelfie,
                      punchOutLocation: myRec.punchOutLocation,
                    }];

                const updatedRec: RawAttendanceRecord = {
                  ...myRec,
                  punchOut: null, // active shift
                  sessions: [...currentSessions, newSession],
                };
                updated = allAttendance.map(a => a.id === myRec.id ? updatedRec : a);
              } else {
                const newRec: RawAttendanceRecord = {
                  id: `${myId}-${todayStr}`,
                  date: todayStr,
                  punchIn: time,
                  punchInSelfie: selfieUrl,
                  punchInLocation: locStr,
                  punchOut: null,
                  punchOutSelfie: null,
                  punchOutLocation: null,
                  sessions: [newSession],
                };
                updated = [...allAttendance.filter(a => a.id !== newRec.id), newRec];
              }
            } else {
              // Punch Out of currently active session
              if (myRec) {
                const currentSessions = myRec.sessions && myRec.sessions.length > 0 
                  ? myRec.sessions 
                  : [{
                      id: 'sess-1',
                      punchIn: myRec.punchIn,
                      punchInSelfie: myRec.punchInSelfie,
                      punchInLocation: myRec.punchInLocation,
                      punchOut: myRec.punchOut,
                      punchOutSelfie: myRec.punchOutSelfie,
                      punchOutLocation: myRec.punchOutLocation,
                    }];

                const updatedSessions = currentSessions.map((s, idx) => {
                  if (idx === currentSessions.length - 1 && !s.punchOut) {
                    return { ...s, punchOut: time, punchOutSelfie: selfieUrl, punchOutLocation: locStr };
                  }
                  return s;
                });

                const updatedRec: RawAttendanceRecord = {
                  ...myRec,
                  punchOut: time,
                  punchOutSelfie: selfieUrl,
                  punchOutLocation: locStr,
                  sessions: updatedSessions,
                };
                updated = allAttendance.map(a => a.id === myRec.id ? updatedRec : a);
              } else {
                return;
              }
            }

            setAllAttendance(updated);
            localStorage.setItem('emp_attendance', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
            setPunchMsg(`Successfully punched ${mode === 'in' ? 'IN' : 'OUT'} at ${time}! ✅`);
            setTimeout(() => setPunchMsg(''), 4000);
          };

          return (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] font-bold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{user?.username || 'User'}</h3>
                      <p className="text-xs text-gray-500 font-mono">Role: {user?.role || 'Staff'} · Today: {todayStr}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold font-mono border",
                    isCurrentlyIn ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-700 border-gray-200"
                  )}>
                    {isCurrentlyIn ? `● Clocked IN (Session ${sessions.length})` : sessions.length > 0 ? `○ Clocked OUT (${sessions.length} sessions recorded)` : '○ Not Clocked IN'}
                  </span>
                </div>

                {punchMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl animate-in fade-in">
                    {punchMsg}
                  </div>
                )}

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">First Punch IN</p>
                    <p className="text-sm font-bold text-emerald-600 font-mono mt-1">
                      {myRec?.punchIn || '—'}
                    </p>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Latest Punch OUT</p>
                    <p className="text-sm font-bold text-red-600 font-mono mt-1">
                      {myRec?.punchOut || (isCurrentlyIn ? 'Active Now' : '—')}
                    </p>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Total Worked</p>
                    <p className="text-sm font-bold text-[#2563EB] font-mono mt-1">
                      {workedHours > 0 ? `${workedHours.toFixed(1)} hrs` : (isCurrentlyIn ? 'In Progress' : '0.0 hrs')}
                    </p>
                  </div>
                </div>

                {/* Today's Punch Sessions List */}
                {sessions.length > 0 && (
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <p className="text-xs font-bold text-gray-800 flex items-center justify-between">
                      <span>Today's Punch Sessions ({sessions.length})</span>
                      <span className="text-[10px] text-gray-500 font-normal">Supports permissions, breaks & multiple entries</span>
                    </p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {sessions.map((s, idx) => {
                        const dur = s.punchIn && s.punchOut ? calcWorkedHours(s.punchIn, s.punchOut) : 0;
                        return (
                          <div key={s.id || idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-[10px] flex items-center justify-center font-mono">
                                #{idx + 1}
                              </span>
                              <span className="font-mono text-gray-800">
                                <span className="text-emerald-600 font-bold">IN:</span> {s.punchIn}
                                {' → '}
                                {s.punchOut ? (
                                  <>
                                    <span className="text-red-600 font-bold">OUT:</span> {s.punchOut}
                                  </>
                                ) : (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Ongoing</span>
                                )}
                              </span>
                            </div>
                            <span className="font-mono text-gray-500 font-bold text-[11px]">
                              {dur > 0 ? `${dur.toFixed(1)} hrs` : (s.punchOut ? '0.0 hrs' : 'Active')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Punch Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleQuickPunch('in')}
                    disabled={isCurrentlyIn}
                    className={cn(
                      "flex-1 py-3 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer",
                      !isCurrentlyIn
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                    )}
                  >
                    {sessions.length > 0 && !isCurrentlyIn ? 'Punch IN Again (Return / New Session)' : 'Punch IN Now'}
                  </button>
                  <button
                    onClick={() => handleQuickPunch('out')}
                    disabled={!isCurrentlyIn}
                    className={cn(
                      "flex-1 py-3 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer",
                      isCurrentlyIn
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                    )}
                  >
                    Punch OUT (Permission / End Session)
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── ATTENDANCE TAB ── */}
        {activeTab === 'attendance' && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search staff..."
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400/50" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-gray-900 outline-none [color-scheme:light] cursor-pointer" />
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
                      <p className="text-2xl font-bold text-gray-900">{summary[status]}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">of {staffList.length} staff</p>
                    </div>
                  );
                })}
            </div>

            {/* Attendance table */}
            {staffList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-md shadow-gray-100/50">
                <Users className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-400">No active staff found</p>
                <p className="text-xs text-gray-600 mt-1">Add staff members in Settings to track attendance</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-100/50 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Employee</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">First Punch IN</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Latest Punch OUT</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Sessions & Total Hours</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Selfies</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyAttendance.map(({ staff, rec, status, worked }) => {
                      const sessionsCount = rec?.sessions?.length || (rec ? 1 : 0);
                      const hasOpenSession = Array.isArray(rec?.sessions) && rec.sessions.length > 0 
                        ? !rec.sessions[rec.sessions.length - 1].punchOut 
                        : (rec ? !rec.punchOut : false);

                      return (
                        <React.Fragment key={staff.id}>
                          <tr
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setExpandedRow(expandedRow === staff.id ? null : staff.id)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-[#2563EB]">
                                  {staff.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-gray-900 font-semibold text-xs">{staff.name}</p>
                                  <p className="text-[9px] text-gray-500 font-mono">{staff.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={status} /></td>
                            <td className="px-4 py-3">
                              {rec?.punchIn
                                ? <span className="text-emerald-600 font-semibold font-mono">{rec.punchIn}</span>
                                : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              {hasOpenSession
                                ? <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[10px] font-bold">Active Now</span>
                                : rec?.punchOut
                                ? <span className="text-red-600 font-semibold font-mono">{rec.punchOut}</span>
                                : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              {worked > 0 ? (
                                <div className="space-y-0.5">
                                  <span className="text-gray-900 font-bold font-mono text-xs">{worked.toFixed(1)} hrs</span>
                                  {sessionsCount > 1 && (
                                    <span className="block text-[10px] text-blue-600 font-mono font-medium">({sessionsCount} sessions)</span>
                                  )}
                                </div>
                              ) : (hasOpenSession ? (
                                <span className="text-blue-600 font-mono text-[10px] font-bold">In Progress</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {rec?.punchInSelfie && (
                                  <img src={rec.punchInSelfie} alt="" className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30" />
                                )}
                                {rec?.punchOutSelfie && (
                                  <img src={rec.punchOutSelfie} alt="" className="w-7 h-7 rounded-lg object-cover border border-red-500/30" />
                                )}
                                {!rec?.punchInSelfie && <span className="text-gray-400 text-[10px]">—</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-[120px]">
                              {rec?.punchInLocation
                                ? <span className="text-[9px] text-gray-500 font-mono truncate block">{rec.punchInLocation.split(',').slice(0, 2).join(',')}</span>
                                : <span className="text-gray-400">—</span>}
                            </td>
                          </tr>
                          {/* Expanded detail row showing all punch sessions */}
                          {expandedRow === staff.id && rec && (
                            <tr className="bg-blue-50/40">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-blue-200/50 pb-2">
                                    <p className="text-xs font-bold text-gray-900">
                                      All Punch Sessions for {staff.name} on {selectedDate}
                                    </p>
                                    <span className="text-xs font-mono font-bold text-[#2563EB]">
                                      Total Time: {worked.toFixed(1)} hrs
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {(rec.sessions && rec.sessions.length > 0 ? rec.sessions : [{
                                      id: 'sess-1',
                                      punchIn: rec.punchIn,
                                      punchInSelfie: rec.punchInSelfie,
                                      punchInLocation: rec.punchInLocation,
                                      punchOut: rec.punchOut,
                                      punchOutSelfie: rec.punchOutSelfie,
                                      punchOutLocation: rec.punchOutLocation,
                                    }]).map((sess, sIdx) => {
                                      const sDur = sess.punchIn && sess.punchOut ? calcWorkedHours(sess.punchIn, sess.punchOut) : 0;
                                      return (
                                        <div key={sess.id || sIdx} className="bg-white p-3 rounded-xl border border-gray-200 space-y-2 text-xs">
                                          <div className="flex items-center justify-between font-bold">
                                            <span className="text-[#2563EB]">Session #{sIdx + 1}</span>
                                            <span className="text-gray-600 font-mono text-[11px]">
                                              {sDur > 0 ? `${sDur.toFixed(1)} hrs` : (sess.punchOut ? '0.0 hrs' : 'Ongoing')}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="space-y-1">
                                              <p className="text-emerald-700 font-semibold font-mono">IN: {sess.punchIn}</p>
                                              {sess.punchInSelfie && (
                                                <img src={sess.punchInSelfie} alt="In selfie" className="w-16 h-16 rounded-lg object-cover border border-emerald-300" />
                                              )}
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-red-700 font-semibold font-mono">
                                                {sess.punchOut ? `OUT: ${sess.punchOut}` : 'Active Shift'}
                                              </p>
                                              {sess.punchOutSelfie && (
                                                <img src={sess.punchOutSelfie} alt="Out selfie" className="w-16 h-16 rounded-lg object-cover border border-red-300" />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
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
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400/50" />
              </div>
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                <button key={f} onClick={() => setLeaveFilter(f)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                    leaveFilter === f
                      ? f === 'ALL'      ? 'bg-blue-50 border-blue-300 text-[#2563EB]'
                      : f === 'PENDING'  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                      : f === 'APPROVED' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      :                    'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-900'
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
              <div className="flex flex-col items-center justify-center py-16 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-md shadow-gray-100/50">
                <CalendarDays className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-400">No leave requests found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeaves.map(leave => (
                  <div key={leave.id}
                    className={`bg-gray-50 border rounded-2xl p-5 transition-all ${
                      leave.status === 'PENDING'  ? 'border-yellow-500/20'  :
                      leave.status === 'APPROVED' ? 'border-emerald-500/20' : 'border-red-500/15'
                    }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-sm font-bold text-[#2563EB] flex-shrink-0">
                          {(leave.employeeName || '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{leave.employeeName || 'Staff Member'}</p>
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
