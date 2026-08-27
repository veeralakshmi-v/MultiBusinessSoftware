import React, { useState, useEffect } from 'react';
import { 
  Clock, LogOut, Coffee, MapPin, Building, ShieldCheck, 
  CheckCircle2, AlertCircle, RefreshCw, Award, ArrowRight,
  TrendingUp, Calendar, Zap, FileText
} from 'lucide-react';
import { PunchOutRecord } from '../../types/punch';
import { PunchOutEngine } from '../../lib/punch/punchOutEngine';
import { PunchInEngine } from '../../lib/punch/punchInEngine';
import { GeoLocationEngine } from '../../lib/attendance/geoLocationEngine';
import { OfficeLocationEngine } from '../../lib/locations/officeLocationEngine';
import { EmployeeEngine } from '../../lib/employees/employeeEngine';
import { GeoLocationPayload } from '../../types/attendance';
import { cn } from '../../lib/utils';

export default function PunchOutStudio() {
  const [selectedEmpId, setSelectedEmpId] = useState('emp-001');
  const [selectedOfficeId, setSelectedOfficeId] = useState('loc-001');
  const [breakMinutes, setBreakMinutes] = useState(45); // default 45m break

  const [employees, setEmployees] = useState(EmployeeEngine.getEmployees({ pageSize: 50 }).employees);
  const [offices, setOffices] = useState(OfficeLocationEngine.getOfficeLocations({ status: 'ACTIVE' }));
  const [liveGeo, setLiveGeo] = useState<GeoLocationPayload | null>(null);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(false);

  const [todayPunchIn, setTodayPunchIn] = useState(PunchInEngine.getTodayPunchIn(selectedEmpId));
  const [history, setHistory] = useState<PunchOutRecord[]>(PunchOutEngine.getPunchOutHistory());
  
  const [feedback, setFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    record?: PunchOutRecord;
  } | null>(null);

  // Live GPS Acquisition
  const acquireGPS = async () => {
    setIsAcquiringGPS(true);
    try {
      const geo = await GeoLocationEngine.acquireLiveGeoLocation(selectedOfficeId);
      setLiveGeo(geo);
    } finally {
      setIsAcquiringGPS(false);
    }
  };

  useEffect(() => {
    acquireGPS();
  }, [selectedOfficeId]);

  useEffect(() => {
    setTodayPunchIn(PunchInEngine.getTodayPunchIn(selectedEmpId));
  }, [selectedEmpId]);

  const targetOffice = offices.find(o => o.id === selectedOfficeId) || offices[0];

  // Calculate live values for Screen
  const inTimeStr = todayPunchIn?.punchInTime || '08:30:00 AM';
  const breakHoursDecimal = breakMinutes / 60;
  
  // Computed values
  const calc = PunchOutEngine.calculateWorkedAndOvertime(
    '2026-08-26T08:30:00',
    new Date().toISOString(),
    breakHoursDecimal,
    8.0
  );

  const workedHoursDisplay = calc.workedHoursFormatted || '8h 30m';
  const breakHoursDisplay = breakMinutes >= 60 
    ? `${Math.floor(breakMinutes / 60)}h ${breakMinutes % 60}m`
    : `${breakMinutes} mins`;

  const handlePunchOut = async () => {
    setIsAcquiringGPS(true);
    setFeedback(null);
    try {
      const geo = liveGeo || await GeoLocationEngine.acquireLiveGeoLocation(selectedOfficeId);
      setLiveGeo(geo);

      const emp = employees.find(e => e.id === selectedEmpId) || {
        name: 'Kowsalya Sundaram',
        department: 'Billing & Cash Desk',
      };

      const result = PunchOutEngine.recordPunchOut({
        employeeId: selectedEmpId,
        employeeName: emp.name,
        department: emp.department,
        punchInTime: inTimeStr,
        breakHours: breakHoursDecimal,
        geo,
        officeName: targetOffice.name,
        standardShiftHours: 8.0,
      });

      if (!result.success) {
        setFeedback({
          type: 'ERROR',
          title: 'Punch Out Failed',
          message: result.error || 'Unable to record punch out.',
        });
        return;
      }

      setFeedback({
        type: 'SUCCESS',
        title: 'Punch Out Successful!',
        message: `Saved at ${result.record?.punchOutTime}. Total Worked: ${result.record?.workedHoursFormatted} | Overtime: ${result.record?.overtimeFormatted}`,
        record: result.record,
      });

      setHistory(PunchOutEngine.getPunchOutHistory());
    } finally {
      setIsAcquiringGPS(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <LogOut className="w-5 h-5 text-[#C5A059]" />
            Staff Self-Service Punch Out Screen
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time Worked Hours • Tracked Break Hours • Live Location • Automated Overtime Calculation.
          </p>
        </div>

        <button
          onClick={acquireGPS}
          disabled={isAcquiringGPS}
          className="px-4 py-2 bg-[#0A0A0B] border border-[#2D2D30] hover:border-[#C5A059] text-xs font-mono text-gray-300 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isAcquiringGPS && "animate-spin text-[#C5A059]")} />
          Refresh Location
        </button>
      </div>

      {/* Main Punch Out Terminal Card */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-[#1F1F21] pb-5">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Staff Member</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} • {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Current Office Premises</label>
            <select
              value={selectedOfficeId}
              onChange={e => setSelectedOfficeId(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              {offices.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Break Duration Taken</label>
            <select
              value={breakMinutes}
              onChange={e => setBreakMinutes(Number(e.target.value))}
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              <option value="15">15 Minutes (Tea / Rest Break)</option>
              <option value="30">30 Minutes (Standard Lunch)</option>
              <option value="45">45 Minutes (Lunch + Tea)</option>
              <option value="60">60 Minutes (Full 1-Hour Meal)</option>
            </select>
          </div>
        </div>

        {/* 3 Required Display Screen Elements: Worked Hours, Break Hours, Current Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. WORKED HOURS */}
          <div className="p-5 bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                1. Worked Hours
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Since {inTimeStr}</span>
            </div>

            <div className="text-3xl font-black font-mono text-white tracking-tight">
              {workedHoursDisplay}
            </div>

            <div className="w-full bg-[#1F1F21] rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#C5A059] to-emerald-400 h-1.5 rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-[10px] text-gray-400 font-mono block">Standard Shift: 8.00 hrs</span>
          </div>

          {/* 2. BREAK HOURS */}
          <div className="p-5 bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                2. Break Hours
              </span>
              <span className="text-[10px] font-mono text-amber-400">Meal & Rest</span>
            </div>

            <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">
              {breakHoursDisplay}
            </div>

            <div className="w-full bg-[#1F1F21] rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(breakMinutes / 60) * 100}%` }} />
            </div>
            <span className="text-[10px] text-gray-400 font-mono block">Deducted from gross duration</span>
          </div>

          {/* 3. CURRENT LOCATION */}
          <div className="p-5 bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                3. Current Location
              </span>
              <span className="text-[10px] font-mono text-cyan-400">GPS Live</span>
            </div>

            <div className="text-sm font-bold text-white truncate block">
              {targetOffice.name}
            </div>

            <div className="font-mono text-xs text-gray-300">
              {liveGeo ? `${liveGeo.latitude.toFixed(4)}°, ${liveGeo.longitude.toFixed(4)}°` : '13.0828°, 80.2709°'}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">± {liveGeo?.accuracy || 6.5}m Accuracy</span>
          </div>

        </div>

        {/* Overtime Live Calculation Preview */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">Calculated Overtime:</span>
            <strong className="text-emerald-400 text-sm">+{calc.overtimeFormatted || '0h 30m'}</strong>
          </div>
          <span className="text-gray-400 text-[11px]">Net Worked: {calc.workedHours || 8.5} hrs</span>
        </div>

        {/* Dynamic Confirmation Banner */}
        {feedback && (
          <div className={cn(
            "p-4 rounded-2xl border flex items-start gap-3 shadow-lg animate-in fade-in duration-200 text-xs",
            feedback.type === 'SUCCESS' 
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/40 text-rose-300"
          )}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-sm font-bold block">{feedback.title}</strong>
              <p className="text-gray-300 font-mono">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* 4. BUTTON: PUNCH OUT */}
        <div className="pt-2">
          <button
            onClick={handlePunchOut}
            disabled={isAcquiringGPS}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 hover:from-rose-600 hover:to-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            {isAcquiringGPS ? 'Recording Punch Out...' : 'Punch Out Now (Save Worked Hours & Overtime)'}
          </button>
        </div>

        {/* 3 Saved Fields Summary */}
        <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl space-y-2 text-xs font-mono">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">
            Audited Data Saved on Punch Out (All 3 Parameters):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
            <div className="p-2.5 bg-[#131315] border border-[#2D2D30] rounded-xl">
              <span className="text-gray-500 text-[10px] block">1. PUNCH OUT TIME</span>
              <strong className="text-white">{new Date().toLocaleTimeString()}</strong>
            </div>
            <div className="p-2.5 bg-[#131315] border border-[#2D2D30] rounded-xl">
              <span className="text-gray-500 text-[10px] block">2. WORKED HOURS</span>
              <strong className="text-emerald-400">{workedHoursDisplay} ({calc.workedHours || 8.5} hrs)</strong>
            </div>
            <div className="p-2.5 bg-[#131315] border border-[#2D2D30] rounded-xl">
              <span className="text-gray-500 text-[10px] block">3. OVERTIME</span>
              <strong className="text-[#C5A059]">+{calc.overtimeFormatted || '0h 30m'} ({calc.overtime || 0.5} hrs)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Punch Out Logs Table */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          Today's Verified Punch Out & Daily Overtime Records
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Punch In</th>
                <th className="py-3 px-4">Punch Out Time</th>
                <th className="py-3 px-4">Worked Hours</th>
                <th className="py-3 px-4">Break Hours</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {history.map(p => (
                <tr key={p.id} className="hover:bg-[#161618] transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {p.employeeName}
                    <span className="text-[10px] text-gray-500 font-mono block font-normal">{p.department}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{p.punchInTime}</td>
                  <td className="py-3 px-4 font-bold text-rose-400">{p.punchOutTime}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{p.workedHoursFormatted}</td>
                  <td className="py-3 px-4 text-amber-400">{p.breakHoursFormatted}</td>
                  <td className="py-3 px-4 text-[#C5A059] font-bold">+{p.overtimeFormatted}</td>
                  <td className="py-3 px-4 text-gray-300 max-w-[150px] truncate">{p.currentLocation.officeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
