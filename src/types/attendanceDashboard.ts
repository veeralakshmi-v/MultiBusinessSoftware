export interface AttendanceDashboardMetrics {
  presentToday: number; // 1. Present Today
  absentToday: number; // 2. Absent Today
  lateToday: number; // 3. Late Today
  leaveToday: number; // 4. Leave Today
  workFromHome: number; // 5. Work From Home
  averageHours: number; // 6. Average Hours (decimal e.g. 8.25)
  averageHoursFormatted: string; // "8h 15m"
  monthlyAttendancePercentage: number; // 7. Monthly Attendance % (e.g. 94.8)
  totalStaffCount: number;
}

export interface AttendanceTrendPoint {
  dayLabel: string; // e.g. "Mon 21", "Tue 22"
  fullDate: string; // "2026-08-26"
  present: number;
  late: number;
  absent: number;
  leave: number;
  wfh: number;
  attendancePercentage: number;
}

export interface TodayPunchFeedItem {
  id: string;
  employeeId: string;
  employeeName: string;
  photo?: string;
  department: string;
  branchName: string;
  punchInTime: string;
  punchOutTime?: string;
  workedHoursFormatted?: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'WFH' | 'ON_LEAVE' | 'ABSENT';
  isGeofenceVerified: boolean;
  device: string;
  ipAddress?: string;
  browser?: string;
}
