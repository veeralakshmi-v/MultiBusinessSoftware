import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, Clock, AlertTriangle, 
  TrendingUp, MapPin, Search, Filter, RefreshCw, 
  FileSpreadsheet, FileCode, Printer, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  AttendanceReportType, 
  ExportFormat 
} from '../../types/attendanceReports';
import { AttendanceReportEngine } from '../../lib/reports/attendanceReportEngine';
import { cn } from '../../lib/utils';

export default function AttendanceReportsStudio() {
  const [activeReport, setActiveReport] = useState<AttendanceReportType>('DAILY');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');

  // Report Data
  const dailyData = AttendanceReportEngine.generateDailyReport(search, department);
  const monthlyData = AttendanceReportEngine.generateMonthlyReport(search, department);
  const lateData = AttendanceReportEngine.generateLateReport(search);
  const absentData = AttendanceReportEngine.generateAbsentReport(search);
  const overtimeData = AttendanceReportEngine.generateOvertimeReport(search);
  const locationData = AttendanceReportEngine.generateLocationReport(search);

  const getCurrentData = () => {
    switch (activeReport) {
      case 'DAILY': return dailyData;
      case 'MONTHLY': return monthlyData;
      case 'LATE': return lateData;
      case 'ABSENT': return absentData;
      case 'OVERTIME': return overtimeData;
      case 'LOCATION': return locationData;
    }
  };

  const currentData = getCurrentData();

  const handleExport = (format: ExportFormat) => {
    AttendanceReportEngine.exportReport(activeReport, format, currentData);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Export Actions */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C5A059]" />
            Enterprise Attendance & Payroll Reports
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Generate Daily, Monthly, Late, Absent, Overtime, and Location audit reports with 1-click Excel, CSV, and PDF export.
          </p>
        </div>

        {/* 3 Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('EXCEL')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
            title="Download Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>

          <button
            onClick={() => handleExport('CSV')}
            className="px-3.5 py-2 bg-[#0A0A0B] border border-[#2D2D30] hover:border-[#C5A059] text-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            title="Download Comma Separated Values"
          >
            <FileCode className="w-4 h-4 text-[#C5A059]" />
            Export CSV
          </button>

          <button
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-1.5 transition-all transform hover:scale-105"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* 6 Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        
        <button
          onClick={() => setActiveReport('DAILY')}
          className={cn(
            "p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2",
            activeReport === 'DAILY'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Calendar className="w-4 h-4" />
          1. Daily Report
        </button>

        <button
          onClick={() => setActiveReport('MONTHLY')}
          className={cn(
            "p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2",
            activeReport === 'MONTHLY'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          2. Monthly Report
        </button>

        <button
          onClick={() => setActiveReport('LATE')}
          className={cn(
            "p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2",
            activeReport === 'LATE'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Clock className="w-4 h-4" />
          3. Late Report
        </button>

        <button
          onClick={() => setActiveReport('ABSENT')}
          className={cn(
            "p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2",
            activeReport === 'ABSENT'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          4. Absent Report
        </button>

        <button
          onClick={() => setActiveReport('OVERTIME')}
          className={cn(
            "p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2",
            activeReport === 'OVERTIME'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Clock className="w-4 h-4" />
          5. Overtime Report
        </button>

        <button
          onClick={() => setActiveReport('LOCATION')}
          className={cn(
            "p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2",
            activeReport === 'LOCATION'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <MapPin className="w-4 h-4" />
          6. Location Report
        </button>

      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff, dept, branch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
          />
        </div>

        <div>
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Billing & Cash Desk">Billing & Cash Desk</option>
            <option value="Kitchen & Culinary">Kitchen & Culinary</option>
            <option value="Customer Service & Floor">Customer Service & Floor</option>
            <option value="Accounts & Finance">Accounts & Finance</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-xs font-mono text-gray-400">
          Total Records: <strong className="text-white ml-1.5">{currentData.length} Entries</strong>
        </div>
      </div>

      {/* REPORT DATA TABLES */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        
        {/* 1. DAILY ATTENDANCE TABLE */}
        {activeReport === 'DAILY' && (
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Punch In</th>
                  <th className="py-3 px-4">Punch Out</th>
                  <th className="py-3 px-4">Worked Hours</th>
                  <th className="py-3 px-4">Geofence</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {dailyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4 text-gray-400">{row.date}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{row.employeeName}</td>
                    <td className="py-3 px-4 text-gray-300">{row.department}</td>
                    <td className="py-3 px-4 text-[#C5A059] font-bold">{row.punchIn}</td>
                    <td className="py-3 px-4 text-gray-400">{row.punchOut}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{row.workedHoursFormatted}</td>
                    <td className="py-3 px-4 text-gray-300">{row.geofenceStatus}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        row.status === 'PRESENT' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                        row.status === 'LATE' ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                        row.status === 'WFH' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" :
                        "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      )}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. MONTHLY ATTENDANCE TABLE */}
        {activeReport === 'MONTHLY' && (
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Working Days</th>
                  <th className="py-3 px-4">Present</th>
                  <th className="py-3 px-4">Absent</th>
                  <th className="py-3 px-4">Late Marks</th>
                  <th className="py-3 px-4">Leaves</th>
                  <th className="py-3 px-4">Total Worked Hours</th>
                  <th className="py-3 px-4">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {monthlyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-white">{row.employeeName}</td>
                    <td className="py-3 px-4 text-gray-300">{row.department}</td>
                    <td className="py-3 px-4 text-gray-400">{row.totalWorkingDays}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{row.presentDays}</td>
                    <td className="py-3 px-4 text-rose-400">{row.absentDays}</td>
                    <td className="py-3 px-4 text-amber-400">{row.lateDays}</td>
                    <td className="py-3 px-4 text-purple-400">{row.leaveDays}</td>
                    <td className="py-3 px-4 text-white font-bold">{row.totalWorkedHours} hrs</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        {row.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. LATE REPORT TABLE */}
        {activeReport === 'LATE' && (
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Shift Start</th>
                  <th className="py-3 px-4">Actual Punch In</th>
                  <th className="py-3 px-4">Late Duration</th>
                  <th className="py-3 px-4">Grace Allowed</th>
                  <th className="py-3 px-4">Penalty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {lateData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4 text-gray-400">{row.date}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{row.employeeName}</td>
                    <td className="py-3 px-4 text-gray-300">{row.department}</td>
                    <td className="py-3 px-4 text-gray-400">{row.shiftStartTime}</td>
                    <td className="py-3 px-4 text-amber-400 font-bold">{row.actualPunchIn}</td>
                    <td className="py-3 px-4 text-rose-400 font-bold">+{row.lateMinutes} mins</td>
                    <td className="py-3 px-4 text-gray-400">{row.graceAllowedMinutes} mins</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. ABSENT REPORT TABLE */}
        {activeReport === 'ABSENT' && (
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Reporting Manager</th>
                  <th className="py-3 px-4">Absence Type</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {absentData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4 text-gray-400">{row.date}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{row.employeeName}</td>
                    <td className="py-3 px-4 text-gray-300">{row.department}</td>
                    <td className="py-3 px-4 text-gray-400">{row.reportingManager}</td>
                    <td className="py-3 px-4 text-rose-400 font-bold">{row.leaveType}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        row.isApproved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      )}>
                        {row.isApproved ? 'Approved' : 'Unapproved'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. OVERTIME REPORT TABLE */}
        {activeReport === 'OVERTIME' && (
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Standard Shift</th>
                  <th className="py-3 px-4">Actual Worked</th>
                  <th className="py-3 px-4">Overtime Hours</th>
                  <th className="py-3 px-4">Estimated OT Pay (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {overtimeData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4 text-gray-400">{row.date}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{row.employeeName}</td>
                    <td className="py-3 px-4 text-gray-300">{row.department}</td>
                    <td className="py-3 px-4 text-gray-400">{row.standardHours} hrs</td>
                    <td className="py-3 px-4 text-white font-bold">{row.actualWorkedHours} hrs</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">+{row.overtimeHours} hrs</td>
                    <td className="py-3 px-4 text-[#C5A059] font-bold">₹{row.overtimePayEstimated.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. LOCATION REPORT TABLE */}
        {activeReport === 'LOCATION' && (
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Assigned Branch</th>
                  <th className="py-3 px-4">GPS Coordinates</th>
                  <th className="py-3 px-4">Distance / Radius</th>
                  <th className="py-3 px-4">Geofence Status</th>
                  <th className="py-3 px-4">Device & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {locationData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4 text-gray-400">{row.date}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{row.employeeName}</td>
                    <td className="py-3 px-4 text-gray-300">{row.branchName}</td>
                    <td className="py-3 px-4 text-gray-300">{row.latitude.toFixed(4)}°, {row.longitude.toFixed(4)}°</td>
                    <td className="py-3 px-4 text-emerald-400">{row.distanceMeters}m / {row.allowedRadiusMeters}m</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {row.geofenceStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-[11px]">{row.device} ({row.ipAddress})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
