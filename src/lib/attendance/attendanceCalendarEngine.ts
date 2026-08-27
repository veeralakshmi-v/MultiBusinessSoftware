import { 
  CalendarAttendanceStatus, 
  CalendarColorToken, 
  CalendarDayEntry, 
  MonthlyCalendarSummary 
} from '../../types/attendanceCalendar';
import { EmployeeEngine } from '../employees/employeeEngine';

export const CALENDAR_COLOR_MAP: Record<CalendarAttendanceStatus, CalendarColorToken> = {
  PRESENT: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  ABSENT: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  LEAVE: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  HOLIDAY: {
    bg: 'bg-[#C5A059]/10',
    text: 'text-[#C5A059]',
    border: 'border-[#C5A059]/30',
    dot: 'bg-[#C5A059]',
    badge: 'bg-[#C5A059]/20 text-[#E5C07B] border-[#C5A059]/40',
  },
  WEEKEND: {
    bg: 'bg-slate-800/40',
    text: 'text-slate-400',
    border: 'border-slate-700/40',
    dot: 'bg-slate-500',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  HALF_DAY: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  LATE: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
};

export class AttendanceCalendarEngine {
  /**
   * Returns Color Tokens for a given attendance status
   */
  static getColorToken(status: CalendarAttendanceStatus): CalendarColorToken {
    return CALENDAR_COLOR_MAP[status] || CALENDAR_COLOR_MAP.PRESENT;
  }

  /**
   * Generates full Monthly Attendance Calendar data with all 7 Color-Coded statuses
   */
  static getMonthlyAttendanceCalendar(
    employeeId: string = 'emp-001',
    year: number = 2026,
    monthIndex: number = 7 // 7 = August (0-indexed)
  ): MonthlyCalendarSummary {
    const employees = EmployeeEngine.getEmployees({ pageSize: 50 }).employees;
    const employee = employees.find(e => e.id === employeeId) || employees[0] || {
      id: 'emp-001',
      name: 'Kowsalya Sundaram',
      department: 'Billing & Cash Desk',
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthLabel = `${monthNames[monthIndex]} ${year}`;

    // Days in Month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 = Sun, 1 = Mon...
    const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days: CalendarDayEntry[] = [];

    // Counts
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;
    let weekendCount = 0;
    let halfDayCount = 0;
    let lateCount = 0;
    let totalWorkedHours = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthIndex, d);
      const dayOfWeekIdx = dateObj.getDay();
      const dayOfWeek = daysOfWeekLabels[dayOfWeekIdx];
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = d === 26 && monthIndex === 7 && year === 2026;

      let status: CalendarAttendanceStatus = 'PRESENT';
      let statusLabel = 'Present';
      let punchIn = '08:05:00 AM';
      let punchOut = '05:05:00 PM';
      let workedHours = 8.5;
      let workedHoursFormatted = '8h 30m';
      let holidayName: string | undefined = undefined;
      let leaveType: string | undefined = undefined;
      let notes: string | undefined = 'Standard on-time attendance';

      // 1. Weekend Check (Sundays & 2nd/4th Saturdays)
      if (dayOfWeekIdx === 0 || (dayOfWeekIdx === 6 && (d >= 8 && d <= 14 || d >= 22 && d <= 28))) {
        status = 'WEEKEND';
        statusLabel = 'Weekly Off';
        punchIn = undefined;
        punchOut = undefined;
        workedHours = 0;
        workedHoursFormatted = '0h 00m';
        notes = 'Scheduled Weekly Off / Weekend';
        weekendCount++;
      }
      // 2. Public / Gazetted Holiday (e.g. Aug 15 Independence Day)
      else if (monthIndex === 7 && d === 15) {
        status = 'HOLIDAY';
        statusLabel = 'Independence Day';
        holidayName = '79th Indian Independence Day (National Gazetted)';
        punchIn = undefined;
        punchOut = undefined;
        workedHours = 0;
        workedHoursFormatted = '0h 00m';
        notes = 'Paid National Holiday';
        holidayCount++;
      }
      // 3. Late Arrival Days (e.g. Aug 3, Aug 24)
      else if (d === 3 || d === 24) {
        status = 'LATE';
        statusLabel = d === 3 ? 'Late (+35m)' : 'Late (+18m)';
        punchIn = d === 3 ? '08:35:10 AM' : '08:18:00 AM';
        punchOut = '05:45:00 PM';
        workedHours = 8.2;
        workedHoursFormatted = '8h 12m';
        notes = 'Punched in after 15-minute grace tolerance.';
        lateCount++;
        totalWorkedHours += workedHours;
      }
      // 4. Half Day Work (e.g. Aug 12)
      else if (d === 12) {
        status = 'HALF_DAY';
        statusLabel = 'Half Day (4.0h)';
        punchIn = '08:00:00 AM';
        punchOut = '12:15:00 PM';
        workedHours = 4.0;
        workedHoursFormatted = '4h 00m';
        notes = 'First-half attended. Approved second-half personal leave.';
        halfDayCount++;
        totalWorkedHours += workedHours;
      }
      // 5. Approved Leave Day (e.g. Aug 19)
      else if (d === 19) {
        status = 'LEAVE';
        statusLabel = 'Casual Leave';
        leaveType = 'Casual Leave (CL)';
        punchIn = undefined;
        punchOut = undefined;
        workedHours = 0;
        workedHoursFormatted = '0h 00m';
        notes = 'Pre-approved Casual Leave by Reporting Manager';
        leaveCount++;
      }
      // 6. Absent Day (e.g. Aug 21)
      else if (d === 21) {
        status = 'ABSENT';
        statusLabel = 'Absent';
        punchIn = undefined;
        punchOut = undefined;
        workedHours = 0;
        workedHoursFormatted = '0h 00m';
        notes = 'Unplanned absence without leave request';
        absentCount++;
      }
      // 7. Future Days beyond 26
      else if (d > 26) {
        status = 'PRESENT';
        statusLabel = 'Scheduled';
        punchIn = '08:00:00 AM';
        punchOut = '05:00:00 PM';
        workedHours = 8.5;
        workedHoursFormatted = '8h 30m';
        notes = 'Upcoming rostered working shift';
        presentCount++;
        totalWorkedHours += workedHours;
      }
      // Standard Present Day
      else {
        status = 'PRESENT';
        statusLabel = 'Present (8.5h)';
        punchIn = '08:05:14 AM';
        punchOut = '05:05:14 PM';
        workedHours = 8.5;
        workedHoursFormatted = '8h 30m';
        notes = 'On-time GPS verified punch';
        presentCount++;
        totalWorkedHours += workedHours;
      }

      days.push({
        date: dateStr,
        dayNumber: d,
        dayOfWeek,
        isCurrentMonth: true,
        isToday,
        status,
        statusLabel,
        color: this.getColorToken(status),
        punchIn,
        punchOut,
        workedHours,
        workedHoursFormatted,
        holidayName,
        leaveType,
        notes,
      });
    }

    const totalWorkingDays = presentCount + lateCount + halfDayCount + absentCount + leaveCount;
    const attendedDays = presentCount + lateCount + (halfDayCount * 0.5);
    const attendancePercentage = totalWorkingDays > 0 
      ? Number(((attendedDays / totalWorkingDays) * 100).toFixed(1)) 
      : 95.8;

    return {
      month: monthLabel,
      year,
      monthIndex,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      daysInMonth,
      presentCount,
      absentCount,
      leaveCount,
      holidayCount,
      weekendCount,
      halfDayCount,
      lateCount,
      totalWorkedHours: Number(totalWorkedHours.toFixed(1)),
      attendancePercentage,
      days,
    };
  }
}
