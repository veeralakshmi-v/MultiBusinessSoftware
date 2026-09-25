export type CalendarAttendanceStatus = 
  | 'PRESENT' 
  | 'ABSENT' 
  | 'LEAVE' 
  | 'HOLIDAY' 
  | 'WEEKEND' 
  | 'HALF_DAY' 
  | 'LATE';

export interface CalendarColorToken {
  bg: string;
  text: string;
  border: string;
  dot: string;
  badge: string;
}

export interface CalendarDayEntry {
  date: string; // "2026-08-26"
  dayNumber: number; // 1 to 31
  dayOfWeek: string; // "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  isCurrentMonth: boolean;
  isToday: boolean;
  status: CalendarAttendanceStatus;
  statusLabel: string;
  color: CalendarColorToken;
  punchIn?: string;
  punchOut?: string;
  workedHours?: number;
  workedHoursFormatted?: string;
  holidayName?: string;
  leaveType?: string;
  notes?: string;
}

export interface MonthlyCalendarSummary {
  month: string; // "August 2026"
  year: number;
  monthIndex: number; // 0 to 11
  employeeId: string;
  employeeName: string;
  department: string;
  daysInMonth: number;
  
  // 7 Status Counts:
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  holidayCount: number;
  weekendCount: number;
  halfDayCount: number;
  lateCount: number;
  
  totalWorkedHours: number;
  attendancePercentage: number;
  days: CalendarDayEntry[];
}
