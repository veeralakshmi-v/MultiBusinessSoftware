export type AttendanceReportType = 
  | 'DAILY' 
  | 'MONTHLY' 
  | 'LATE' 
  | 'ABSENT' 
  | 'OVERTIME' 
  | 'LOCATION';

export type ExportFormat = 'EXCEL' | 'CSV' | 'PDF';

export interface DailyAttendanceReportRow {
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shiftName: string;
  punchIn: string;
  punchOut: string;
  workedHoursFormatted: string;
  status: string;
  geofenceStatus: string;
}

export interface MonthlyAttendanceReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  totalWorkedHours: number;
  attendancePercentage: number;
}

export interface LateReportRow {
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shiftName: string;
  shiftStartTime: string;
  actualPunchIn: string;
  lateMinutes: number;
  graceAllowedMinutes: number;
  status: string;
}

export interface AbsentReportRow {
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reportingManager: string;
  leaveType: string;
  isApproved: boolean;
  remarks: string;
}

export interface OvertimeReportRow {
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  standardHours: number;
  actualWorkedHours: number;
  overtimeHours: number;
  overtimePayEstimated: number;
}

export interface LocationReportRow {
  date: string;
  employeeId: string;
  employeeName: string;
  branchName: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  allowedRadiusMeters: number;
  geofenceStatus: 'INSIDE_GEOFENCE' | 'OUTSIDE_GEOFENCE';
  device: string;
  ipAddress: string;
}
