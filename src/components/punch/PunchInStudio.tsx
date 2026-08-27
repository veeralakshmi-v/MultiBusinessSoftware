import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, MapPin, Building, Navigation, 
  CheckCircle2, XCircle, ShieldCheck, ShieldAlert, 
  Smartphone, Monitor, Globe, RefreshCw, ExternalLink,
  Award, Check, AlertTriangle, ArrowRight, User
} from 'lucide-react';
import { PunchInRecord } from '../../types/punch';
import { PunchInEngine } from '../../lib/punch/punchInEngine';
import { GeoLocationEngine } from '../../lib/attendance/geoLocationEngine';
import { GeofenceValidator } from '../../lib/attendance/geofenceValidator';
import { OfficeLocationEngine } from '../../lib/locations/officeLocationEngine';
import { ShiftEngine } from '../../lib/shifts/shiftEngine';
import { EmployeeEngine } from '../../lib/employees/employeeEngine';
import { GeoLocationPayload } from '../../types/attendance';
import { cn } from '../../lib/utils';

export default function PunchInStudio() {
  const [now, setNow] = useState(new Date());
  const [liveGeo, setLiveGeo] = useState<GeoLocationPayload | null>(null);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('emp-001');
  const [selectedOfficeId, setSelectedOfficeId] = useState('loc-001');
  
  const [employees, setEmployees] = useState(EmployeeEngine.getEmployees({ pageSize: 50 }).employees);
  const [offices, setOffices] = useState(OfficeLocationEngine.getOfficeLocations({ status: 'ACTIVE' }));
  const [shifts, setShifts] = useState(ShiftEngine.getShifts());
  const [selectedShiftId, setSelectedShiftId] = useState(shifts[0]?.id || 'shift-001');

  const [history, setHistory] = useState<PunchInRecord[]>(PunchInEngine.getPunchInHistory());
  const [todayPunch, setTodayPunch] = useState<PunchInRecord | undefined>(PunchInEngine.getTodayPunchIn(selectedEmpId));
  
  const [punchFeedback, setPunchFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    record?: PunchInRecord;
  } | null>(null);

  // 1. Live Running Clock (every second)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Live GPS Acquisition
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
    setTodayPunch(PunchInEngine.getTodayPunchIn(selectedEmpId));
  }, [selectedEmpId, history]);

  // Current Screen State Values
  const currentTimeString = now.toLocaleTimeString('en-US', { hour12: true });
  const currentDateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const targetOffice = offices.find(o => o.id === selectedOfficeId) || offices[0];
  const distance = liveGeo ? GeoLocationEngine.calculateDistanceMeters(
    liveGeo.latitude,
    liveGeo.longitude,
    targetOffice.latitude,
    targetOffice.longitude
  ) : 0;

  const isWithinGeofence = distance <= (targetOffice?.allowedRadiusMeters || 200);

  // Handle Punch In Action
  const handlePunchIn = async () => {
    setIsAcquiringGPS(true);
    setPunchFeedback(null);
    try {
      const geo = liveGeo || await GeoLocationEngine.acquireLiveGeoLocation(selectedOfficeId);
      setLiveGeo(geo);

      const emp = employees.find(e => e.id === selectedEmpId) || {
        name: 'Kowsalya Sundaram',
        department: 'Billing & Cash Desk',
      };

      const result = PunchInEngine.recordPunchIn({
        employeeId: selectedEmpId,
        employeeName: emp.name,
        department: emp.department,
        officeId: targetOffice.id,
        shiftId: selectedShiftId,
        geo,
      });

      if (!result.success) {
        setPunchFeedback({
          type: 'ERROR',
          title: 'You are outside office premises.',
          message: `Your current GPS is ${distance} meters away from "${targetOffice.name}". Punch In is rejected (Allowed radius: ${targetOffice.allowedRadiusMeters} meters).`,
        });
        return;
      }

      setPunchFeedback({
        type: 'SUCCESS',
        title: 'Punch In Recorded Successfully!',
        message: `Verified at ${result.record?.punchInTime} inside ${targetOffice.name} (${distance}m from center).`,
        record: result.record,
      });

      setHistory(PunchInEngine.getPunchInHistory());
    } finally {
      setIsAcquiringGPS(false);
    }
  };

  const simulateLocation = (type: 'INSIDE' | 'OUTSIDE') => {
    if (type === 'INSIDE') {
      const simLat = targetOffice.latitude + 0.00015;
      const simLon = targetOffice.longitude + 0.00015;
      const geo: GeoLocationPayload = {
        latitude: simLat,
        longitude: simLon,
        accuracy: 6.5,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.104',
        device: 'Desktop PC (Windows 11)',
        browser: 'Google Chrome 128.0',
        operatingSystem: 'Windows 11 Enterprise',
        permissionStatus: 'GRANTED',
        geofenceStatus: 'INSIDE_GEOFENCE',
        distanceFromBranchMeters: 23.4,
        nearestBranch: targetOffice.name,
      };
      setLiveGeo(geo);
      setPunchFeedback({
        type: 'SUCCESS',
        title: 'Simulated Location: Inside Office Premises',
        message: `Set coordinates to 23.4 meters from "${targetOffice.name}". Punch In will be ALLOWED.`,
      });
    } else {
      const simLat = targetOffice.latitude + 0.007;
      const simLon = targetOffice.longitude + 0.007;
      const geo: GeoLocationPayload = {
        latitude: simLat,
        longitude: simLon,
        accuracy: 20.0,
        timestamp: new Date().toISOString(),
        ipAddress: '49.207.180.92',
        device: 'Mobile Phone (Safari)',
        browser: 'Safari Mobile 18.0',
        operatingSystem: 'iOS 18.1',
        permissionStatus: 'GRANTED',
        geofenceStatus: 'OUTSIDE_GEOFENCE',
        distanceFromBranchMeters: 780.5,
        nearestBranch: targetOffice.name,
      };
      setLiveGeo(geo);
      setPunchFeedback({
        type: 'ERROR',
        title: 'Simulated Location: Outside Office Premises',
        message: `Set coordinates to 780.5 meters from "${targetOffice.name}". Punch In will trigger "You are outside office premises."`,
      });
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C5A059]" />
            Staff Self-Service Punch In Screen
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time Clock • Live GPS • Office Geofence Validation • Device & Network Fingerprint Capture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => simulateLocation('INSIDE')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
          >
            📍 Sim Inside (23m)
          </button>
          <button
            type="button"
            onClick={() => simulateLocation('OUTSIDE')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
          >
            📍 Sim Outside (780m)
          </button>
        </div>
      </div>

      {/* Main Punch In Terminal Card */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Staff & Office Selector Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-[#1F1F21] pb-5">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Select Staff Member</label>
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
            <label className="block text-gray-400 text-xs mb-1">Target Office Location</label>
            <select
              value={selectedOfficeId}
              onChange={e => setSelectedOfficeId(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              {offices.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.allowedRadiusMeters}m Geofence)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Assigned Shift Schedule</label>
            <select
              value={selectedShiftId}
              onChange={e => setSelectedShiftId(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.punchInTime} - {s.punchOutTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Required Display Elements: Clock, Date, GPS, Office, Distance, Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Left Column: Live Clock & Date */}
          <div className="p-6 bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl text-center space-y-2 relative shadow-inner">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-mono">
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              {/* 2. CURRENT DATE */}
              <span>{currentDateString}</span>
            </div>

            {/* 1. CURRENT TIME */}
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white py-1 bg-gradient-to-r from-white via-[#E5C07B] to-[#C5A059] bg-clip-text text-transparent">
              {currentTimeString}
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-mono text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Precision Clock</span>
            </div>
          </div>

          {/* Right Column: GPS, Office, Distance & Status */}
          <div className="space-y-3">
            
            {/* 3. CURRENT GPS */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase">Current GPS Coordinates</span>
                <strong className="text-white text-xs">
                  {liveGeo ? `${liveGeo.latitude.toFixed(4)}° N, ${liveGeo.longitude.toFixed(4)}° E` : 'Acquiring GPS...'}
                </strong>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                ± {liveGeo?.accuracy || 8.5}m Accuracy
              </span>
            </div>

            {/* 4. OFFICE NAME & 5. DISTANCE FROM OFFICE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Office Name</span>
                <strong className="text-white text-xs block truncate">{targetOffice.name}</strong>
              </div>

              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-0.5 font-mono">
                <span className="text-[10px] text-gray-500 uppercase block">Distance From Office</span>
                <strong className={cn(
                  "text-xs block",
                  isWithinGeofence ? "text-emerald-400" : "text-rose-400"
                )}>
                  {distance} Meters Away
                </strong>
              </div>
            </div>

            {/* 6. STATUS */}
            <div className={cn(
              "p-3 rounded-xl border flex items-center justify-between text-xs font-mono font-bold transition-all",
              isWithinGeofence 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            )}>
              <span className="flex items-center gap-1.5">
                {isWithinGeofence ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                Status: {isWithinGeofence ? 'Within Allowed Geofence (Punch Allowed)' : 'Outside Office Premises (Blocked)'}
              </span>
              <span className="text-[10px] opacity-80">Radius: {targetOffice.allowedRadiusMeters}m</span>
            </div>

          </div>
        </div>

        {/* Dynamic Punch Feedback Banner */}
        {punchFeedback && (
          <div className={cn(
            "p-4 rounded-2xl border flex items-start gap-3 shadow-lg animate-in fade-in duration-200 text-xs",
            punchFeedback.type === 'SUCCESS' 
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/40 text-rose-300"
          )}>
            {punchFeedback.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <strong className="text-sm font-bold block">{punchFeedback.title}</strong>
              <p className="text-gray-300 font-mono">{punchFeedback.message}</p>
            </div>
          </div>
        )}

        {/* 7. BUTTON: PUNCH IN */}
        <div className="pt-2">
          <button
            onClick={handlePunchIn}
            disabled={isAcquiringGPS}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C5A059] via-[#d4b068] to-[#C5A059] hover:from-[#b08d4a] hover:to-[#b08d4a] text-[#0A0A0B] font-black text-sm uppercase tracking-wider shadow-xl shadow-[#C5A059]/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <Clock className="w-5 h-5" />
            {isAcquiringGPS ? 'Verifying GPS Location...' : 'Punch In Now (GPS Verified)'}
          </button>
        </div>

        {/* 7 Saved Fields Verification Summary Card */}
        <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl space-y-2 text-xs font-mono">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">
            Audited Data Saved on Punch In (All 7 Parameters):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-300">
            <div><span className="text-gray-500">1. Time:</span> <strong className="text-white">{currentTimeString}</strong></div>
            <div><span className="text-gray-500">2. Lat:</span> <strong className="text-white">{liveGeo?.latitude.toFixed(4) || '13.0828'}°</strong></div>
            <div><span className="text-gray-500">3. Lon:</span> <strong className="text-white">{liveGeo?.longitude.toFixed(4) || '80.2709'}°</strong></div>
            <div><span className="text-gray-500">4. Accuracy:</span> <strong className="text-emerald-400">± {liveGeo?.accuracy || 8.5}m</strong></div>
            <div><span className="text-gray-500">5. Device:</span> <strong className="text-white truncate block">{liveGeo?.device || 'Desktop PC'}</strong></div>
            <div><span className="text-gray-500">6. IP:</span> <strong className="text-cyan-400">{liveGeo?.ipAddress || '192.168.1.104'}</strong></div>
            <div className="col-span-2 truncate"><span className="text-gray-500">7. Browser:</span> <strong className="text-purple-400">{liveGeo?.browser || 'Google Chrome'}</strong></div>
          </div>
        </div>

      </div>

      {/* Recent Punch In Logs Table */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          Today's Verified Punch In Audit Trail
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Punch In Time</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Device & Browser</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {history.map(p => (
                <tr key={p.id} className="hover:bg-[#161618] transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {p.employeeName}
                    <span className="text-[10px] text-gray-500 font-mono block font-normal">{p.department}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#C5A059]">{p.punchInTime}</td>
                  <td className="py-3 px-4 text-gray-300">{p.latitude.toFixed(4)}°, {p.longitude.toFixed(4)}°</td>
                  <td className="py-3 px-4 text-emerald-400">± {p.accuracy}m</td>
                  <td className="py-3 px-4 text-gray-300 max-w-[150px] truncate">{p.device} • {p.browser}</td>
                  <td className="py-3 px-4 text-cyan-400">{p.ipAddress}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      p.status === 'PRESENT' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    )}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
