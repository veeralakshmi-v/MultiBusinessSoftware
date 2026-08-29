import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  CheckCircle2, AlertCircle, MapPin, UserX, Plus, ShieldCheck
} from 'lucide-react';

export interface RawAttendanceRecord {
  id: string;
  date: string;
  punchIn: string;
  punchInSelfie: string;
  punchInLocation: string;
  punchOut: string | null;
  punchOutSelfie: string | null;
  punchOutLocation: string | null;
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
    <div className="bg-theme-surface border border-theme-secondary/20 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3 max-w-full overflow-hidden">
      
      {/* Admin / Manager Concern Leave Modal */}
      {showConcernModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-theme-surface border border-theme-secondary/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-theme-secondary/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl btn-theme-secondary flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-theme-primary">Mark Concern Leave</h3>
                  <p className="text-[10px] text-theme-accent font-medium">Admin & Manager Direct Leave Entry</p>
                </div>
              </div>
              <button
                onClick={() => setShowConcernModal(false)}
                className="text-xs text-theme-accent hover:text-theme-primary font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConcernLeave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-theme-accent mb-1">Select Staff Member *</label>
                <select
                  value={targetStaffId}
                  onChange={(e) => setTargetStaffId(e.target.value)}
                  required
                  className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl px-3 py-2 text-xs text-theme-primary outline-none focus:border-theme-secondary"
                >
                  <option value="">-- Select Employee --</option>
                  {staffOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-theme-accent mb-1">Leave Date *</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl px-3 py-2 text-xs text-theme-primary outline-none [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-theme-accent mb-1">Leave Type *</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl px-3 py-2 text-xs text-theme-primary outline-none focus:border-theme-secondary"
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
                <label className="block text-[11px] font-semibold text-theme-accent mb-1">Reason / Concern Note *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Marked concern leave per manager approval"
                  value={targetReason}
                  onChange={(e) => setTargetReason(e.target.value)}
                  className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none focus:border-theme-secondary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConcernModal(false)}
                  className="flex-1 py-2 bg-theme-card border border-theme-secondary/20 text-theme-primary font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 btn-theme-secondary font-bold text-xs rounded-xl shadow-md"
                >
                  Save Concern Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-theme-secondary/15 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg btn-theme-secondary flex items-center justify-center font-bold">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-theme-primary leading-none">
              {monthNames[month]} {year}
            </h2>
            <p className="text-[10px] text-theme-accent mt-0.5 font-medium">{userName}'s Calendar</p>
          </div>
        </div>

        {/* Legend + Admin Action + Navigation */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold mr-2 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1 text-cyan-500">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> Half Day (Cyan)
            </span>
            <span className="flex items-center gap-1 text-orange-500">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Applied (Orange)
            </span>
            <span className="flex items-center gap-1 text-purple-500">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Upcoming (Purple)
            </span>
            <span className="flex items-center gap-1 text-yellow-500">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Taken (Yellow)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Rejected (Gray)
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Absent (Red)
            </span>
          </div>

          {/* Admin / Manager Concern Leave Button */}
          {isAdminOrManager && (
            <button
              onClick={() => {
                setTargetDate(new Date().toISOString().split('T')[0]);
                setShowConcernModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 btn-theme-secondary text-[10px] font-bold rounded-lg shadow transition-all hover:scale-105"
              title="Mark Concern / Manual Leave (Admin & Manager Access)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mark Concern Leave</span>
            </button>
          )}

          <button
            onClick={todayMonth}
            className="px-2 py-1 bg-theme-card hover:bg-theme-secondary/15 border border-theme-secondary/20 text-theme-primary text-[10px] font-bold rounded-lg transition-all"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1 bg-theme-card hover:bg-theme-secondary/15 border border-theme-secondary/20 text-theme-primary rounded-lg transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 bg-theme-card hover:bg-theme-secondary/15 border border-theme-secondary/20 text-theme-primary rounded-lg transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend Mobile */}
      <div className="flex flex-wrap lg:hidden items-center justify-between gap-1.5 text-[9px] font-bold bg-theme-card p-1.5 px-2.5 rounded-lg border border-theme-secondary/15">
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
          <div key={d} className="py-0.5 text-[9px] sm:text-[10px] font-bold text-theme-accent uppercase tracking-wider">
            {d}
          </div>
        ))}

        {/* Empty leading cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8 sm:h-10 rounded-lg bg-theme-card/30" />
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
            if (att.punchOut) {
              const worked = calcWorkedHours(att.punchIn, att.punchOut);
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

          let cellStyle = "bg-theme-card border-theme-secondary/20 text-theme-primary hover:bg-theme-secondary/15";
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
                dayStatus !== 'NONE' ? 'hover:scale-105' : 'hover:border-theme-secondary/40'
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
        <div className="p-3 bg-theme-card border border-theme-secondary/30 rounded-xl animate-in fade-in space-y-2">
          <div className="flex items-center justify-between border-b border-theme-secondary/20 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-theme-accent" />
              <span className="text-xs font-bold text-theme-primary">
                Details for {selectedDayDetail}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAdminOrManager && (
                <button
                  onClick={() => openConcernModalForDate(selectedDayDetail)}
                  className="px-2 py-0.5 btn-theme-secondary text-[10px] font-bold rounded shadow"
                >
                  + Mark Concern Leave
                </button>
              )}
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="text-[10px] text-theme-accent hover:text-theme-primary font-bold"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {selectedRecord && (
              <div className="space-y-1 p-2 bg-theme-surface rounded-lg border border-theme-secondary/15">
                {selectedRecord.punchOut && calcWorkedHours(selectedRecord.punchIn, selectedRecord.punchOut) < 1 ? (
                  <p className="font-bold text-red-500 flex items-center gap-1">
                    <UserX className="w-3 h-3" /> Absent (Worked &lt; 1 hr)
                  </p>
                ) : selectedRecord.punchOut && calcWorkedHours(selectedRecord.punchIn, selectedRecord.punchOut) < 4 ? (
                  <p className="font-bold text-cyan-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Half Day (Worked 1-4 hrs)
                  </p>
                ) : (
                  <p className="font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Present / Attendance
                  </p>
                )}
                <p className="text-theme-primary">Punch IN: <span className="font-mono text-emerald-500 font-bold">{selectedRecord.punchIn}</span></p>
                {selectedRecord.punchOut && (
                  <p className="text-theme-primary">Punch OUT: <span className="font-mono text-red-500 font-bold">{selectedRecord.punchOut}</span></p>
                )}
                {selectedRecord.punchInLocation && (
                  <p className="text-[9px] text-theme-accent font-mono flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {selectedRecord.punchInLocation}
                  </p>
                )}
              </div>
            )}

            {selectedLeave && (
              <div className="space-y-1 p-2 bg-theme-surface rounded-lg border border-theme-secondary/15">
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
                <p className="text-theme-primary">Type: <span className="font-bold">{selectedLeave.type}</span></p>
                <p className="text-theme-primary">Status: <span className="font-bold capitalize">{selectedLeave.status.toLowerCase()}</span></p>
                <p className="text-theme-accent italic">"{selectedLeave.reason}"</p>
              </div>
            )}

            {!selectedRecord && !selectedLeave && (
              <p className="text-theme-accent italic col-span-2">No attendance or leave recorded for this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
