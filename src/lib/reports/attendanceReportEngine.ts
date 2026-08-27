import { 
  AttendanceReportType,
  DailyAttendanceReportRow,
  MonthlyAttendanceReportRow,
  LateReportRow,
  AbsentReportRow,
  OvertimeReportRow,
  LocationReportRow,
  ExportFormat
} from '../../types/attendanceReports';

export const MOCK_DAILY_ATTENDANCE: DailyAttendanceReportRow[] = [
  {
    date: '2026-08-26',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    shiftName: 'Morning Early Shift',
    punchIn: '08:05:14 AM',
    punchOut: '05:05:14 PM',
    workedHoursFormatted: '8h 30m',
    status: 'PRESENT',
    geofenceStatus: 'INSIDE_GEOFENCE',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    department: 'Kitchen & Culinary',
    shiftName: 'Morning Early Shift',
    punchIn: '07:55:30 AM',
    punchOut: '04:25:30 PM',
    workedHoursFormatted: '8h 00m',
    status: 'PRESENT',
    geofenceStatus: 'INSIDE_GEOFENCE',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-003',
    employeeName: 'Dinesh Karthik',
    department: 'Billing & Cash Desk',
    shiftName: 'Morning Early Shift',
    punchIn: '08:35:10 AM',
    punchOut: '05:45:00 PM',
    workedHoursFormatted: '8h 10m',
    status: 'LATE',
    geofenceStatus: 'INSIDE_GEOFENCE',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-004',
    employeeName: 'Ananya Iyer',
    department: 'Accounts & Finance',
    shiftName: 'General Shift',
    punchIn: '09:00:15 AM',
    punchOut: '06:00:00 PM',
    workedHoursFormatted: '8h 15m',
    status: 'WFH',
    geofenceStatus: 'REMOTE_VERIFIED',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-005',
    employeeName: 'Priya Selvam',
    department: 'Customer Service & Floor',
    shiftName: 'General Shift',
    punchIn: '09:28:45 AM',
    punchOut: '06:30:00 PM',
    workedHoursFormatted: '8h 15m',
    status: 'PRESENT',
    geofenceStatus: 'INSIDE_GEOFENCE',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-006',
    employeeName: 'Vikram Raghavan',
    department: 'Kitchen & Culinary',
    shiftName: 'Morning Early Shift',
    punchIn: '—',
    punchOut: '—',
    workedHoursFormatted: '0h 00m',
    status: 'ON_LEAVE',
    geofenceStatus: '—',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-007',
    employeeName: 'Meenakshi Sundaram',
    department: 'Human Resources',
    shiftName: 'General Shift',
    punchIn: '—',
    punchOut: '—',
    workedHoursFormatted: '0h 00m',
    status: 'ABSENT',
    geofenceStatus: '—',
  }
];

export const MOCK_MONTHLY_ATTENDANCE: MonthlyAttendanceReportRow[] = [
  {
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    totalWorkingDays: 24,
    presentDays: 23,
    absentDays: 0,
    lateDays: 1,
    leaveDays: 1,
    totalWorkedHours: 195.5,
    attendancePercentage: 95.8,
  },
  {
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    department: 'Kitchen & Culinary',
    totalWorkingDays: 24,
    presentDays: 24,
    absentDays: 0,
    lateDays: 0,
    leaveDays: 0,
    totalWorkedHours: 198.0,
    attendancePercentage: 100.0,
  },
  {
    employeeId: 'emp-003',
    employeeName: 'Dinesh Karthik',
    department: 'Billing & Cash Desk',
    totalWorkingDays: 24,
    presentDays: 21,
    absentDays: 1,
    lateDays: 4,
    leaveDays: 2,
    totalWorkedHours: 178.5,
    attendancePercentage: 87.5,
  },
  {
    employeeId: 'emp-004',
    employeeName: 'Ananya Iyer',
    department: 'Accounts & Finance',
    totalWorkingDays: 24,
    presentDays: 23,
    absentDays: 0,
    lateDays: 1,
    leaveDays: 1,
    totalWorkedHours: 192.0,
    attendancePercentage: 95.8,
  },
  {
    employeeId: 'emp-005',
    employeeName: 'Priya Selvam',
    department: 'Customer Service & Floor',
    totalWorkingDays: 24,
    presentDays: 22,
    absentDays: 1,
    lateDays: 2,
    leaveDays: 1,
    totalWorkedHours: 184.0,
    attendancePercentage: 91.6,
  }
];

export const MOCK_LATE_REPORT: LateReportRow[] = [
  {
    date: '2026-08-26',
    employeeId: 'emp-003',
    employeeName: 'Dinesh Karthik',
    department: 'Billing & Cash Desk',
    shiftName: 'Morning Early Shift',
    shiftStartTime: '08:00:00 AM',
    actualPunchIn: '08:35:10 AM',
    lateMinutes: 35,
    graceAllowedMinutes: 15,
    status: 'LATE_PENALIZED',
  },
  {
    date: '2026-08-25',
    employeeId: 'emp-005',
    employeeName: 'Priya Selvam',
    department: 'Customer Service & Floor',
    shiftName: 'General Shift',
    shiftStartTime: '09:30:00 AM',
    actualPunchIn: '09:52:00 AM',
    lateMinutes: 22,
    graceAllowedMinutes: 15,
    status: 'LATE_TOLERATED',
  },
  {
    date: '2026-08-24',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    shiftName: 'Morning Early Shift',
    shiftStartTime: '08:00:00 AM',
    actualPunchIn: '08:18:00 AM',
    lateMinutes: 18,
    graceAllowedMinutes: 15,
    status: 'LATE_TOLERATED',
  }
];

export const MOCK_ABSENT_REPORT: AbsentReportRow[] = [
  {
    date: '2026-08-26',
    employeeId: 'emp-007',
    employeeName: 'Meenakshi Sundaram',
    department: 'Human Resources',
    reportingManager: 'Venkatesh Prabhu',
    leaveType: 'UNPLANNED_ABSENCE',
    isApproved: false,
    remarks: 'No prior notification or leave applied.',
  },
  {
    date: '2026-08-25',
    employeeId: 'emp-003',
    employeeName: 'Dinesh Karthik',
    department: 'Billing & Cash Desk',
    reportingManager: 'Kowsalya Sundaram',
    leaveType: 'CASUAL_LEAVE',
    isApproved: true,
    remarks: 'Approved casual leave for personal work.',
  }
];

export const MOCK_OVERTIME_REPORT: OvertimeReportRow[] = [
  {
    date: '2026-08-26',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    standardHours: 8.0,
    actualWorkedHours: 8.75,
    overtimeHours: 0.75,
    overtimePayEstimated: 350.0,
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-003',
    employeeName: 'Dinesh Karthik',
    department: 'Billing & Cash Desk',
    standardHours: 8.0,
    actualWorkedHours: 9.25,
    overtimeHours: 1.25,
    overtimePayEstimated: 520.0,
  },
  {
    date: '2026-08-25',
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    department: 'Kitchen & Culinary',
    standardHours: 8.0,
    actualWorkedHours: 9.50,
    overtimeHours: 1.50,
    overtimePayEstimated: 675.0,
  }
];

export const MOCK_LOCATION_REPORT: LocationReportRow[] = [
  {
    date: '2026-08-26',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    branchName: 'Apex Central Flagship (Anna Salai)',
    latitude: 13.0828,
    longitude: 80.2709,
    distanceMeters: 24.2,
    allowedRadiusMeters: 200,
    geofenceStatus: 'INSIDE_GEOFENCE',
    device: 'Desktop PC (Windows 11)',
    ipAddress: '192.168.1.104',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    branchName: 'Apex Central Flagship (Anna Salai)',
    latitude: 13.0826,
    longitude: 80.2706,
    distanceMeters: 15.8,
    allowedRadiusMeters: 200,
    geofenceStatus: 'INSIDE_GEOFENCE',
    device: 'Mobile Phone (iOS 18)',
    ipAddress: '192.168.1.112',
  },
  {
    date: '2026-08-26',
    employeeId: 'emp-005',
    employeeName: 'Priya Selvam',
    branchName: 'Apex Express Station (T. Nagar)',
    latitude: 13.0419,
    longitude: 80.2340,
    distanceMeters: 18.1,
    allowedRadiusMeters: 150,
    geofenceStatus: 'INSIDE_GEOFENCE',
    device: 'Mobile Phone (Android 15)',
    ipAddress: '192.168.2.45',
  }
];

export class AttendanceReportEngine {
  /**
   * 1. Daily Attendance Report
   */
  static generateDailyReport(search?: string, department?: string): DailyAttendanceReportRow[] {
    let data = MOCK_DAILY_ATTENDANCE;
    if (department && department !== 'ALL') {
      data = data.filter(d => d.department === department);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.employeeName.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }
    return data;
  }

  /**
   * 2. Monthly Attendance Report
   */
  static generateMonthlyReport(search?: string, department?: string): MonthlyAttendanceReportRow[] {
    let data = MOCK_MONTHLY_ATTENDANCE;
    if (department && department !== 'ALL') {
      data = data.filter(d => d.department === department);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.employeeName.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }
    return data;
  }

  /**
   * 3. Late Report
   */
  static generateLateReport(search?: string): LateReportRow[] {
    let data = MOCK_LATE_REPORT;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.employeeName.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }
    return data;
  }

  /**
   * 4. Absent Report
   */
  static generateAbsentReport(search?: string): AbsentReportRow[] {
    let data = MOCK_ABSENT_REPORT;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.employeeName.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }
    return data;
  }

  /**
   * 5. Overtime Report
   */
  static generateOvertimeReport(search?: string): OvertimeReportRow[] {
    let data = MOCK_OVERTIME_REPORT;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.employeeName.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }
    return data;
  }

  /**
   * 6. Location Report
   */
  static generateLocationReport(search?: string): LocationReportRow[] {
    let data = MOCK_LOCATION_REPORT;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.employeeName.toLowerCase().includes(q) || d.branchName.toLowerCase().includes(q));
    }
    return data;
  }

  /**
   * Converts data rows into CSV string
   */
  static generateCSVString(reportType: AttendanceReportType, data: any[]): string {
    if (!data || data.length === 0) return 'No data available';

    const headers = Object.keys(data[0]);
    const headerLine = headers.join(',');
    const rows = data.map(row => 
      headers.map(field => {
        let val = row[field];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val ?? '';
      }).join(',')
    );

    return [headerLine, ...rows].join('\n');
  }

  /**
   * Triggers export download in CSV, Excel, or PDF
   */
  static exportReport(reportType: AttendanceReportType, format: ExportFormat, data: any[]) {
    const csvContent = this.generateCSVString(reportType, data);
    const filename = `Attendance_Report_${reportType}_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'CSV') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.triggerDownload(blob, `${filename}.csv`);
    } else if (format === 'EXCEL') {
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      this.triggerDownload(blob, `${filename}.xlsx`);
    } else if (format === 'PDF') {
      // PDF Printable Window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #111; }
                h1 { color: #C5A059; font-size: 18px; margin-bottom: 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                tr:nth-child(even) { background-color: #fafafa; }
              </style>
            </head>
            <body>
              <h1>Apex Enterprise Attendance Suite - ${reportType} Report</h1>
              <p>Generated on ${new Date().toLocaleString()}</p>
              <table>
                <thead>
                  <tr>${Object.keys(data[0] || {}).map(k => `<th>${k.toUpperCase()}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${data.map(r => `<tr>${Object.values(r).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }

  private static triggerDownload(blob: Blob, filename: string) {
    if (typeof window === 'undefined') return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
