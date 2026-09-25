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

export const MOCK_DAILY_ATTENDANCE: DailyAttendanceReportRow[] = [];

export const MOCK_MONTHLY_ATTENDANCE: MonthlyAttendanceReportRow[] = [];

export const MOCK_LATE_REPORT: LateReportRow[] = [];

export const MOCK_ABSENT_REPORT: AbsentReportRow[] = [];

export const MOCK_OVERTIME_REPORT: OvertimeReportRow[] = [];

export const MOCK_LOCATION_REPORT: LocationReportRow[] = [];

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
