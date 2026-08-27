import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Clock, Coffee, ShieldCheck, 
  MapPin, AlertTriangle, Home, Info, X, User
} from 'lucide-react';
import { 
  CalendarAttendanceStatus, 
  CalendarDayEntry, 
  MonthlyCalendarSummary 
} from '../../types/attendanceCalendar';
import { AttendanceCalendarEngine } from '../../lib/attendance/attendanceCalendarEngine';
import { EmployeeEngine } from '../../lib/employees/employeeEngine';
import { cn } from '../../lib/utils';

export default function AttendanceCalendarStudio() {
  const [selectedEmpId, setSelectedEmpId] = useState('emp-001');
  const [year, setYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(7); // August = 7

  const [employees, setEmployees] = useState(EmployeeEngine.getEmployees({ pageSize: 50 }).employees);
  const [calendarData, setCalendarData] = useState<MonthlyCalendarSummary>(
    AttendanceCalendarEngine.getMonthlyAttendanceCalendar(selectedEmpId, year, monthIndex)
  );

  const [selectedDay, setSelectedDay] = useState<CalendarDayEntry | null>(null);

  const updateCalendar = (empId: string, y: number, m: number) => {
    const data = AttendanceCalendarEngine.getMonthlyAttendanceCalendar(empId, y, m);
    setCalendarData(data);
  };

  const handlePrevMonth = () => {
    let newM = monthIndex - 1;
    let newY = year;
    if (newM < 0) {
      newM = 11;
      newY -= 1;
    }
    setMonthIndex(newM);
    setYear(newY);
    updateCalendar(selectedEmpId, newY, newM);
  };

  const handleNextMonth = () => {
    let newM = monthIndex + 1;
    let newY = year;
    if (newM > 11) {
      newM = 0;
      newY += 1;
    }
    setMonthIndex(newM);
    setYear(newY);
    updateCalendar(selectedEmpId, newY, newM);
  };

  const handleSelectStaff = (empId: string) => {
    setSelectedEmpId(empId);
    updateCalendar(empId, year, monthIndex);
  };

  // Determine starting weekday blank spaces
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 = Sun
  const blankDays = Array.from({ length: firstDayOfWeek });

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      
      {/* Top Banner & Month Navigation */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#C5A059]" />
            Monthly Attendance Calendar Studio
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Interactive visual calendar tracking 7 explicit color-coded attendance statuses and monthly statistics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Staff Selector */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <select
              value={selectedEmpId}
              onChange={e => handleSelectStaff(e.target.value)}
              className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center bg-[#0A0A0B] border border-[#2D2D30] rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1F1F21] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-xs text-white min-w-[120px] text-center">
              {calendarData.month}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1F1F21] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7 COLOR CODES LEGEND BAR */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-4 shadow-md space-y-2">
        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">
          7 Official Attendance Color Codes:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
          
          {/* 1. Present */}
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <div>
              <strong className="text-emerald-400 block text-[11px]">1. Present</strong>
              <span className="text-gray-400 text-[10px]">On-Time Shift</span>
            </div>
          </div>

          {/* 2. Absent */}
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
            <div>
              <strong className="text-rose-400 block text-[11px]">2. Absent</strong>
              <span className="text-gray-400 text-[10px]">Unplanned</span>
            </div>
          </div>

          {/* 3. Leave */}
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
            <div>
              <strong className="text-purple-400 block text-[11px]">3. Leave</strong>
              <span className="text-gray-400 text-[10px]">Approved (CL/SL)</span>
            </div>
          </div>

          {/* 4. Holiday */}
          <div className="p-2 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#C5A059] flex-shrink-0" />
            <div>
              <strong className="text-[#C5A059] block text-[11px]">4. Holiday</strong>
              <span className="text-gray-400 text-[10px]">Public / Gazetted</span>
            </div>
          </div>

          {/* 5. Weekend */}
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-500 flex-shrink-0" />
            <div>
              <strong className="text-slate-400 block text-[11px]">5. Weekend</strong>
              <span className="text-gray-400 text-[10px]">Weekly Off</span>
            </div>
          </div>

          {/* 6. Half Day */}
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0" />
            <div>
              <strong className="text-sky-400 block text-[11px]">6. Half Day</strong>
              <span className="text-gray-400 text-[10px]">0.5 Shift (4h)</span>
            </div>
          </div>

          {/* 7. Late */}
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
            <div>
              <strong className="text-amber-400 block text-[11px]">7. Late</strong>
              <span className="text-gray-400 text-[10px]">Grace Exceeded</span>
            </div>
          </div>

        </div>
      </div>

      {/* Monthly Statistics Summary Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Present</span>
          <strong className="text-emerald-400 text-lg font-mono">{calendarData.presentCount}</strong>
        </div>

        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Absent</span>
          <strong className="text-rose-400 text-lg font-mono">{calendarData.absentCount}</strong>
        </div>

        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Leaves</span>
          <strong className="text-purple-400 text-lg font-mono">{calendarData.leaveCount}</strong>
        </div>

        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Holidays</span>
          <strong className="text-[#C5A059] text-lg font-mono">{calendarData.holidayCount}</strong>
        </div>

        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Weekends</span>
          <strong className="text-slate-400 text-lg font-mono">{calendarData.weekendCount}</strong>
        </div>

        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Half Days</span>
          <strong className="text-sky-400 text-lg font-mono">{calendarData.halfDayCount}</strong>
        </div>

        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Late Marks</span>
          <strong className="text-amber-400 text-lg font-mono">{calendarData.lateCount}</strong>
        </div>

        <div className="p-3 bg-[#131315] border border-[#1F1F21] rounded-xl text-center">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Rate %</span>
          <strong className="text-emerald-400 text-lg font-mono">{calendarData.attendancePercentage}%</strong>
        </div>
      </div>

      {/* 7-COLUMN MONTHLY CALENDAR GRID */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-3xl p-5 shadow-2xl space-y-3">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-gray-400 border-b border-[#1F1F21] pb-2 uppercase">
          <span className="text-rose-400">Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-slate-400">Sat</span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-2">
          
          {/* Blank padding days */}
          {blankDays.map((_, idx) => (
            <div key={`blank-${idx}`} className="h-24 bg-[#0A0A0B]/30 rounded-2xl border border-dashed border-[#1F1F21]/40" />
          ))}

          {/* Active Days (1 to 31) */}
          {calendarData.days.map(day => (
            <div
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "h-24 p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:scale-[1.03] hover:shadow-lg relative overflow-hidden",
                day.color.bg,
                day.color.border,
                day.isToday && "ring-2 ring-[#C5A059] shadow-md shadow-[#C5A059]/20"
              )}
            >
              {/* Header: Day number & Today pill */}
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-mono font-bold", day.isToday ? "text-[#C5A059]" : "text-white")}>
                  {day.dayNumber}
                </span>
                {day.isToday && (
                  <span className="px-1.5 py-0.2 rounded bg-[#C5A059] text-[#0A0A0B] font-mono text-[9px] font-black uppercase">
                    TODAY
                  </span>
                )}
                {!day.isToday && (
                  <span className={cn("w-2 h-2 rounded-full", day.color.dot)} />
                )}
              </div>

              {/* Status Badge */}
              <div className="space-y-1">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold truncate block",
                  day.color.badge
                )}>
                  {day.statusLabel}
                </span>

                {day.workedHoursFormatted && day.workedHours! > 0 && (
                  <span className="text-[9px] text-gray-400 font-mono block truncate">
                    ⏱️ {day.workedHoursFormatted}
                  </span>
                )}
              </div>
            </div>
          ))}

        </div>

      </div>

      {/* DAY DETAIL DRILLDOWN MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 font-mono text-xs">
            
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h3 className="font-bold text-white text-sm font-sans">{calendarData.employeeName}</h3>
                  <span className="text-gray-400 text-[11px]">{selectedDay.date} ({selectedDay.dayOfWeek})</span>
                </div>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pill */}
            <div className={cn(
              "p-3 rounded-2xl border flex items-center justify-between",
              selectedDay.color.bg,
              selectedDay.color.border
            )}>
              <span className="flex items-center gap-2">
                <span className={cn("w-3 h-3 rounded-full", selectedDay.color.dot)} />
                <strong className={cn("text-xs font-bold", selectedDay.color.text)}>
                  Status: {selectedDay.status}
                </strong>
              </span>
              <span className="text-[10px] text-gray-300">{selectedDay.statusLabel}</span>
            </div>

            {/* Timestamps & Hours */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-0.5">
                <span className="text-gray-500 text-[10px] uppercase block">Punch In</span>
                <strong className="text-white text-xs">{selectedDay.punchIn || '—'}</strong>
              </div>

              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-0.5">
                <span className="text-gray-500 text-[10px] uppercase block">Punch Out</span>
                <strong className="text-white text-xs">{selectedDay.punchOut || '—'}</strong>
              </div>

              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-0.5">
                <span className="text-gray-500 text-[10px] uppercase block">Worked Hours</span>
                <strong className="text-emerald-400 text-xs">{selectedDay.workedHoursFormatted || '0h 00m'}</strong>
              </div>

              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-0.5">
                <span className="text-gray-500 text-[10px] uppercase block">Shift Goal</span>
                <strong className="text-gray-300 text-xs">8.00 Hours</strong>
              </div>
            </div>

            {/* Holiday / Leave details */}
            {selectedDay.holidayName && (
              <div className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-xl text-xs text-[#E5C07B]">
                <strong>Holiday:</strong> {selectedDay.holidayName}
              </div>
            )}

            {selectedDay.leaveType && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-300">
                <strong>Leave:</strong> {selectedDay.leaveType}
              </div>
            )}

            {selectedDay.notes && (
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl text-[11px] text-gray-400">
                <strong>Audit Notes:</strong> {selectedDay.notes}
              </div>
            )}

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-2.5 bg-[#0A0A0B] hover:bg-[#161618] border border-[#2D2D30] text-gray-300 font-bold rounded-xl"
            >
              Close Details
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
