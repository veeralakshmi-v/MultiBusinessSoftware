import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  CheckCircle2, AlertCircle, MapPin, UserX, Plus, ShieldCheck
} from 'lucide-react';

export interface PunchSession {
  id: string;
  punchIn: string;
  punchInSelfie?: string | null;
  punchInLocation?: string | null;
  punchOut?: string | null;
  punchOutSelfie?: string | null;
  punchOutLocation?: string | null;
  type?: 'NORMAL' | 'BREAK' | 'PERMISSION' | string;
  notes?: string;
}

export interface RawAttendanceRecord {
  id: string;
  date: string;
  punchIn: string;
  punchInSelfie: string;
  punchInLocation: string;
  punchOut: string | null;
  punchOutSelfie: string | null;
  punchOutLocation: string | null;
  sessions?: PunchSession[];
}

export interface LeaveRecord {
  id: string;
  date: string;
  appliedOn: string;
  type: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employeeId?: string;
  employeeName?: string;
}

interface StaffOption {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface AttendanceCalendarProps {
  userId: string;
  userName: string;
  userRole?: string;
  attendanceRecords: RawAttendanceRecord[];
  leaveRecords: LeaveRecord[];
  onAddLeave?: (newLeave: LeaveRecord) => void;
}

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
  return Math.max(0, (outMin - inMin) / 60);
}

function calcRecordWorkedHours(att: RawAttendanceRecord): number {
  if (att.sessions && att.sessions.length > 0) {
    let totalMins = 0;
    for (const s of att.sessions) {
      if (s.punchIn && s.punchOut) {
        const inMin = parseTimeToMinutes(s.punchIn);
        const outMin = parseTimeToMinutes(s.punchOut);
        const diff = outMin - inMin;
        if (diff > 0) totalMins += diff;
      }
    }
    return Math.round((totalMins / 60) * 10) / 10;
  }
  return calcWorkedHours(att.punchIn, att.punchOut);
}

function normalizeDateStr(dStr: string): string {
  if (!dStr) return '';
  const parts = dStr.split('-');
  if (parts.length !== 3) return dStr;
  const y = parts[0];
  const m = parts[1].padStart(2, '0');
  const d = parts[2].padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AttendanceCalendar({
  userId,
  userName,
  userRole,
  attendanceRecords,
  leaveRecords,
  onAddLeave,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  // Concern Leave Modal State
  const [showConcernModal, setShowConcernModal] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetType, setTargetType] = useState('Concern Leave');
  const [targetReason, setTargetReason] = useState('');
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [localLeaves, setLocalLeaves] = useState<LeaveRecord[]>(leaveRecords);

  useEffect(() => {
    setLocalLeaves(leaveRecords);
  }, [leaveRecords]);

  // Load staff list for Admin/Manager dropdown
  useEffect(() => {
    try {
      const raw = localStorage.getItem('universal_staff_list');
      if (raw) {
        const list = JSON.parse(raw);
        setStaffOptions(list.filter((s: StaffOption) => s.name));
      }
    } catch {}
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDateStr = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const roleUpper = (userRole || '').toUpperCase();
  const isAdminOrManager = roleUpper.includes('ADMIN') || roleUpper.includes('MANAGER');

  const myAttendance = attendanceRecords.filter(a => {
    if (!a) return false;
    const normUser = (userName || '').toLowerCase().trim();
    const normId = (userId || '').toLowerCase().trim();
    const aId = (a.id || '').toLowerCase().trim();
    return aId.startsWith(normId) || aId.includes(normId) || (normUser && aId.includes(normUser));
  });

  const myLeaves = localLeaves.filter(l => {
    if (!l) return false;
    const normUser = (userName || '').toLowerCase().trim();
    const normId = (userId || '').toLowerCase().trim();
    const lName = (l.employeeName || '').toLowerCase().trim();
    const lId = (l.employeeId || '').toLowerCase().trim();

    if (normId && lId && (normId === lId || normId.includes(lId) || lId.includes(normId))) return true;
    if (normUser && lName && (normUser === lName || normUser.includes(lName) || lName.includes(normUser))) return true;
    if (!l.employeeId && !l.employeeName) return true;
    return false;
  });

  const selectedRecord = selectedDayDetail
    ? myAttendance.find(a => normalizeDateStr(a.date) === selectedDayDetail)
    : null;
  const selectedLeave = selectedDayDetail
    ? myLeaves.find(l => normalizeDateStr(l.date) === selectedDayDetail)
    : null;

  const openConcernModalForDate = (dateStr: string) => {
    setTargetDate(dateStr);
    if (!targetStaffId && staffOptions.length > 0) {
      const match = staffOptions.find(s => s.id === userId || s.username.toLowerCase() === userName.toLowerCase());
      setTargetStaffId(match ? match.id : staffOptions[0].id);
    }
    setShowConcernModal(true);
  };

  const handleSaveConcernLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffOptions.find(s => s.id === targetStaffId) || { id: userId, name: userName };
    const newLeave: LeaveRecord = {
      id: `leave-concern-${Date.now()}`,
      employeeId: staff.id,
      employeeName: staff.name,
      date: targetDate,
      appliedOn: new Date().toISOString().split('T')[0],
      type: targetType,
      reason: targetReason.trim() || 'Concern leave marked by Admin/Manager',
      status: 'APPROVED',
    };

    const updated = [newLeave, ...localLeaves];
    setLocalLeaves(updated);
    try {
      localStorage.setItem('emp_leaves', JSON.stringify(updated));
    } catch {}

    if (onAddLeave) onAddLeave(newLeave);

    setShowConcernModal(false);
    setTargetReason('');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3 max-w-full overflow-hidden">
      
      {/* Admin / Manager Concern Leave Modal */}
      {showConcernModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Mark Concern Leave</h3>
                  <p className="text-[10px] text-[#2563EB] font-medium">Admin & Manager Direct Leave Entry</p>
                </div>
              </div>
              <button
                onClick={() => setShowConcernModal(false)}
                className="text-xs text-[#2563EB] hover:text-gray-900 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConcernLeave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#2563EB] mb-1">Select Staff Member *</label>
                <select
                  value={targetStaffId}
                  onChange={(e) => setTargetStaffId(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-gray-100"
                >
                  <option value="">-- Select Employee --</option>
                  {staffOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2563EB] mb-1">Leave Date *</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2563EB] mb-1">Leave Type *</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-gray-100"
                  >
                    <option value="Concern Leave">Concern Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Half Day Leave">Half Day Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Official Duty">Official Duty</option>
                    <option value="Compensatory Off">Compensatory Off</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#2563EB] mb-1">Reason / Concern Note *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Marked concern leave per manager approval"
                  value={targetReason}
                  onChange={(e) => setTargetReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none focus:border-gray-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConcernModal(false)}
                  className="flex-1 py-2 bg-gray-50 border border-gray-100 text-gray-900 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs rounded-xl shadow-md"
                >
                  Save Concern Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-2.5">
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center font-bold flex-shrink-0">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 leading-none truncate">
                {monthNames[month]} {year}
              </h2>
              <p className="text-[10px] text-[#2563EB] mt-0.5 font-medium truncate">{userName}'s Calendar</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:hidden flex-shrink-0">
            <button
              onClick={todayMonth}
              className="px-2 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-100 text-gray-900 text-[10px] font-bold rounded-lg"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-1 bg-gray-50 hover:bg-blue-50 border border-gray-100 text-gray-900 rounded-lg"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 bg-gray-50 hover:bg-blue-50 border border-gray-100 text-gray-900 rounded-lg"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend + Admin Action + Navigation (Desktop / Tablet) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {isAdminOrManager && (
            <button
              onClick={() => {
                setTargetDate(new Date().toISOString().split('T')[0]);
                setShowConcernModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-[10px] font-bold rounded-lg shadow transition-all hover:scale-105"
              title="Mark Concern / Manual Leave (Admin & Manager Access)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mark Concern Leave</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={todayMonth}
              className="px-2 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-100 text-gray-900 text-[10px] font-bold rounded-lg"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-1 bg-gray-50 hover:bg-blue-50 border border-gray-100 text-gray-900 rounded-lg"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 bg-gray-50 hover:bg-blue-50 border border-gray-100 text-gray-900 rounded-lg"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Mobile */}
      <div className="flex flex-wrap lg:hidden items-center justify-between gap-1.5 text-[9px] font-bold bg-gray-50 p-1.5 px-2.5 rounded-lg border border-gray-100">
        <span className="flex items-center gap-1 text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Present</span>
        <span className="flex items-center gap-1 text-cyan-500"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Half Day</span>
        <span className="flex items-center gap-1 text-orange-500"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Applied</span>
        <span className="flex items-center gap-1 text-purple-500"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Upcoming</span>
        <span className="flex items-center gap-1 text-yellow-500"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Taken</span>
        <span className="flex items-center gap-1 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Rejected</span>
        <span className="flex items-center gap-1 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Absent</span>
      </div>

      {/* Compact Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-0.5 text-[9px] sm:text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
            {d}
          </div>
        ))}

        {/* Empty leading cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8 sm:h-10 rounded-lg bg-gray-50/30" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = formatDateStr(dayNum);
          const todayStr = new Date().toISOString().split('T')[0];
          const isToday = dateStr === todayStr;

          const att = myAttendance.find(a => normalizeDateStr(a.date) === dateStr);
          const anyLeave = myLeaves.find(
            l => normalizeDateStr(l.date) === dateStr && (l.status as string).toUpperCase() !== 'REJECTED'
          );
          const pendingLeave = myLeaves.find(
            l => normalizeDateStr(l.date) === dateStr && ((l.status as string).toUpperCase() === 'PENDING' || !l.status)
          );
          const approvedLeave = myLeaves.find(
            l => normalizeDateStr(l.date) === dateStr && (l.status as string).toUpperCase() === 'APPROVED'
          );
          const rejectedLeave = myLeaves.find(
            l => normalizeDateStr(l.date) === dateStr && (l.status as string).toUpperCase() === 'REJECTED'
          );

          let dayStatus: 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'APPLIED_LEAVE' | 'UPCOMING_LEAVE' | 'TAKEN_LEAVE' | 'REJECTED_LEAVE' | 'NONE' = 'NONE';

          if (pendingLeave) {
            // Applied leave pending approval -> APPLIED LEAVE (Orange)
            dayStatus = 'APPLIED_LEAVE';
          } else if (approvedLeave) {
            if (dateStr >= todayStr) {
              // Approved upcoming leave -> UPCOMING LEAVE (Purple)
              dayStatus = 'UPCOMING_LEAVE';
            } else {
              // Approved past leave -> TAKEN LEAVE (Yellow)
              dayStatus = 'TAKEN_LEAVE';
            }
          } else if (rejectedLeave) {
            // Rejected leave request -> REJECTED LEAVE (Slate Gray)
            dayStatus = 'REJECTED_LEAVE';
          } else if (att) {
            const isCurrentlyActive = !att.punchOut || (att.sessions && att.sessions.some(s => !s.punchOut));
            if (!isCurrentlyActive) {
              const worked = calcRecordWorkedHours(att);
              if (worked < 1) {
                dayStatus = 'ABSENT'; // Less than 1 hr -> ABSENT (Red)
              } else if (worked < 4) {
                dayStatus = 'HALF_DAY'; // 1 to 4 hrs -> HALF DAY (Cyan)
              } else {
                dayStatus = 'PRESENT'; // 4+ hrs -> PRESENT (Green)
              }
            } else {
              dayStatus = 'PRESENT';
            }
          }

          let cellStyle = "bg-gray-50 border-gray-100 text-gray-900 hover:bg-blue-50";
          let statusBadge = null;

          if (dayStatus === 'APPLIED_LEAVE') {
            // Applied Leave Pending Approval -> ORANGE
            cellStyle = "bg-orange-500/20 border-orange-500/60 text-orange-600 dark:text-orange-300 font-bold shadow-sm";
            statusBadge = <span className="text-[8px] leading-none font-bold text-orange-500 truncate w-full px-0.5">Applied</span>;
          } else if (dayStatus === 'UPCOMING_LEAVE') {
            // Upcoming Approved Leave -> PURPLE
            cellStyle = "bg-purple-500/20 border-purple-500/60 text-purple-600 dark:text-purple-300 font-bold shadow-sm";
            statusBadge = <span className="text-[8px] leading-none font-bold text-purple-500 truncate w-full px-0.5">Upcoming</span>;
          } else if (dayStatus === 'TAKEN_LEAVE') {
            // Taken Past Approved Leave -> YELLOW
            cellStyle = "bg-yellow-500/20 border-yellow-500/60 text-yellow-600 dark:text-yellow-300 font-bold shadow-sm";
            statusBadge = <span className="text-[8px] leading-none font-bold text-yellow-500 truncate w-full px-0.5 font-bold">Leave</span>;
          } else if (dayStatus === 'HALF_DAY') {
            // Half Day -> CYAN BLUE
            cellStyle = "bg-cyan-500/20 border-cyan-500/60 text-cyan-600 dark:text-cyan-300 font-bold shadow-sm";
            statusBadge = <span className="text-[8px] leading-none font-bold text-cyan-500 truncate w-full px-0.5 font-bold">Half Day</span>;
          } else if (dayStatus === 'REJECTED_LEAVE') {
            // Rejected Leave -> SLATE GRAY
            cellStyle = "bg-slate-500/20 border-slate-500/60 text-slate-600 dark:text-slate-300 font-bold shadow-sm";
            statusBadge = <span className="text-[8px] leading-none font-bold text-slate-400 truncate w-full px-0.5 font-bold">Rejected</span>;
          } else if (dayStatus === 'ABSENT') {
            // Absent -> PURE RED
            cellStyle = "bg-red-500/20 border-red-500/60 text-red-600 dark:text-red-300 font-bold shadow-sm";
            statusBadge = <span className="text-[8px] leading-none font-bold text-red-500 truncate w-full px-0.5 font-bold">Absent</span>;
          } else if (dayStatus === 'PRESENT') {
            // Present -> GREEN
            cellStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-600 dark:text-emerald-300 font-bold shadow-sm";
            statusBadge = <span className="text-[8px] leading-none font-bold text-emerald-500 truncate w-full px-0.5">{att?.punchIn}</span>;
          }

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDayDetail(dateStr === selectedDayDetail ? null : dateStr)}
              className={`h-8 sm:h-10 rounded-lg p-1 border flex flex-col items-center justify-between transition-all select-none cursor-pointer ${
                dayStatus !== 'NONE' ? 'hover:scale-105' : 'hover:border-gray-100'
              } ${cellStyle} ${isToday ? 'ring-2 ring-theme-secondary font-extrabold' : ''}`}
            >
              <div className="w-full flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold font-mono">
                  {dayNum}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
                )}
              </div>

              {statusBadge}
            </div>
          );
        })}
      </div>

      {/* Selected Day Detail Box */}
      {selectedDayDetail && (
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl animate-in fade-in space-y-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-xs font-bold text-gray-900">
                Details for {selectedDayDetail}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAdminOrManager && (
                <button
                  onClick={() => openConcernModalForDate(selectedDayDetail)}
                  className="px-2 py-0.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-[10px] font-bold rounded shadow"
                >
                  + Mark Concern Leave
                </button>
              )}
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="text-[10px] text-[#2563EB] hover:text-gray-900 font-bold"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {selectedRecord && (() => {
              const worked = calcRecordWorkedHours(selectedRecord);
              const isCurrentlyActive = !selectedRecord.punchOut || (selectedRecord.sessions && selectedRecord.sessions.some(s => !s.punchOut));
              const isAbsent = !isCurrentlyActive && worked < 1;
              const isHalfDay = !isCurrentlyActive && worked >= 1 && worked < 4;

              return (
                <div className="space-y-1.5 p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                  {isCurrentlyActive ? (
                    <p className="font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Currently Active Shift / Clocked In
                    </p>
                  ) : isAbsent ? (
                    <p className="font-bold text-red-500 flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" /> Absent (Worked {worked} hrs &lt; 1 hr)
                    </p>
                  ) : isHalfDay ? (
                    <p className="font-bold text-cyan-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Half Day (Worked {worked} hrs)
                    </p>
                  ) : (
                    <p className="font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present / Completed ({worked} hrs worked)
                    </p>
                  )}

                  <div className="text-gray-800 text-xs">
                    <p>Total Worked: <span className="font-bold font-mono text-[#2563EB]">{worked} hrs</span></p>
                    <p className="text-[10px] text-gray-500 font-mono">First IN: {selectedRecord.punchIn} {selectedRecord.punchOut ? `· Last OUT: ${selectedRecord.punchOut}` : ''}</p>
                  </div>

                  {selectedRecord.sessions && selectedRecord.sessions.length > 0 && (
                    <div className="pt-1.5 border-t border-gray-100 space-y-1">
                      <p className="text-[10px] font-bold text-gray-600 uppercase">Sessions ({selectedRecord.sessions.length}):</p>
                      {selectedRecord.sessions.map((sess, sIdx) => (
                        <div key={sess.id || sIdx} className="flex items-center justify-between text-[10px] bg-gray-50 px-2 py-1 rounded">
                          <span className="font-mono">#{sIdx + 1} IN: {sess.punchIn} → OUT: {sess.punchOut || 'Active'}</span>
                          <div className="flex items-center gap-1">
                            {sess.punchInSelfie && <img src={sess.punchInSelfie} alt="in" className="w-4 h-4 rounded object-cover" />}
                            {sess.punchOutSelfie && <img src={sess.punchOutSelfie} alt="out" className="w-4 h-4 rounded object-cover" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedRecord.punchInLocation && (
                    <p className="text-[9px] text-[#2563EB] font-mono flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {selectedRecord.punchInLocation}
                    </p>
                  )}
                </div>
              );
            })()}

            {selectedLeave && (
              <div className="space-y-1 p-2 bg-white rounded-lg border border-gray-100">
                <p className={`font-bold flex items-center gap-1 ${
                  (selectedLeave.status as string).toUpperCase() === 'PENDING' || !selectedLeave.status ? 'text-orange-500' :
                  (selectedLeave.status as string).toUpperCase() === 'REJECTED' ? 'text-slate-400' :
                  normalizeDateStr(selectedLeave.date) >= new Date().toISOString().split('T')[0] ? 'text-purple-500' : 'text-yellow-500'
                }`}>
                  <AlertCircle className="w-3 h-3" />
                  {(selectedLeave.status as string).toUpperCase() === 'PENDING' || !selectedLeave.status ? 'Applied Leave' :
                   (selectedLeave.status as string).toUpperCase() === 'REJECTED' ? 'Rejected Leave Request' :
                   normalizeDateStr(selectedLeave.date) >= new Date().toISOString().split('T')[0] ? 'Upcoming Approved Leave' : 'Taken Leave'}
                </p>
                <p className="text-gray-900">Type: <span className="font-bold">{selectedLeave.type}</span></p>
                <p className="text-gray-900">Status: <span className="font-bold capitalize">{selectedLeave.status.toLowerCase()}</span></p>
                <p className="text-[#2563EB] italic">"{selectedLeave.reason}"</p>
              </div>
            )}

            {!selectedRecord && !selectedLeave && (
              <p className="text-[#2563EB] italic col-span-2">No attendance or leave recorded for this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
