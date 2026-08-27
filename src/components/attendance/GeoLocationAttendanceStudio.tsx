import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Compass, ShieldCheck, AlertTriangle, 
  Smartphone, Monitor, Globe, Clock, CheckCircle2, XCircle, 
  Search, RefreshCw, ExternalLink, ShieldAlert, Cpu, Radio
} from 'lucide-react';
import { 
  GeoLocationPayload, 
  GeoAttendanceRecord, 
  LocationPermissionStatus 
} from '../../types/attendance';
import { 
  GeoLocationEngine, 
  BRANCH_GEOFENCE_LOCATIONS 
} from '../../lib/attendance/geoLocationEngine';
import { GeofenceValidator, GeofenceValidationResult } from '../../lib/attendance/geofenceValidator';
import { EmployeeEngine } from '../../lib/employees/employeeEngine';
import { cn } from '../../lib/utils';

export default function GeoLocationAttendanceStudio() {
  const [liveGeo, setLiveGeo] = useState<GeoLocationPayload | null>(null);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [logs, setLogs] = useState<GeoAttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [punchTypeFilter, setPunchTypeFilter] = useState('ALL');

  // Punch Alert State
  const [punchAlert, setPunchAlert] = useState<{
    type: 'SUCCESS' | 'ERROR';
    message: string;
    details?: string;
  } | null>(null);

  // Quick Punch State
  const [selectedEmpId, setSelectedEmpId] = useState('emp-001');
  const [selectedBranchId, setSelectedBranchId] = useState('branch-001');
  const [employees, setEmployees] = useState(EmployeeEngine.getEmployees({ pageSize: 50 }).employees);

  const refreshLogs = () => {
    const records = GeoLocationEngine.getGeoAttendanceLogs({
      search,
      status: statusFilter as any,
      punchType: punchTypeFilter as any,
    });
    setLogs(records);
  };

  const acquireGPS = async () => {
    setIsAcquiring(true);
    try {
      const geo = await GeoLocationEngine.acquireLiveGeoLocation(selectedBranchId);
      setLiveGeo(geo);
    } finally {
      setIsAcquiring(false);
    }
  };

  useEffect(() => {
    acquireGPS();
    refreshLogs();
  }, [search, statusFilter, punchTypeFilter]);

  const handlePunch = async (punchType: 'IN' | 'OUT') => {
    setIsAcquiring(true);
    setPunchAlert(null);
    try {
      const geo = liveGeo || await GeoLocationEngine.acquireLiveGeoLocation(selectedBranchId);
      setLiveGeo(geo);

      const emp = employees.find(e => e.id === selectedEmpId) || {
        name: 'Kowsalya Sundaram',
        department: 'Billing & Cash Desk',
      };
      const branch = BRANCH_GEOFENCE_LOCATIONS.find(b => b.id === selectedBranchId) || BRANCH_GEOFENCE_LOCATIONS[0];

      if (punchType === 'IN') {
        const result = GeofenceValidator.executeEnforcedPunchIn({
          employeeId: selectedEmpId,
          employeeName: emp.name,
          department: emp.department,
          branchId: branch.id,
          branchName: branch.name,
          geo,
        });

        if (!result.success) {
          setPunchAlert({
            type: 'ERROR',
            message: 'You are outside office premises.',
            details: `Current distance is ${result.validation.distanceMeters} meters away from "${result.validation.officeName}" (Allowed Radius: ${result.validation.allowedRadiusMeters} meters). Punch In is rejected.`,
          });
          return;
        }

        setPunchAlert({
          type: 'SUCCESS',
          message: 'Punch In Allowed & Recorded!',
          details: `Verified inside "${result.validation.officeName}" (${result.validation.distanceMeters}m from office centroid, Allowed: ${result.validation.allowedRadiusMeters}m).`,
        });
      } else {
        // Punch Out
        GeoLocationEngine.saveGeoPunch({
          employeeId: selectedEmpId,
          employeeName: emp.name,
          department: emp.department,
          branchId: branch.id,
          branchName: branch.name,
          punchType: 'OUT',
          geo,
          remarks: 'GPS Verified Punch Out',
        });

        setPunchAlert({
          type: 'SUCCESS',
          message: 'Punch Out Recorded Successfully!',
          details: `Logged at ${new Date().toLocaleTimeString()} with GPS validation.`,
        });
      }

      refreshLogs();
    } finally {
      setIsAcquiring(false);
    }
  };

  const simulateLocation = (type: 'INSIDE' | 'OUTSIDE') => {
    const targetBranch = BRANCH_GEOFENCE_LOCATIONS.find(b => b.id === selectedBranchId) || BRANCH_GEOFENCE_LOCATIONS[0];
    
    if (type === 'INSIDE') {
      // 20 meters away
      const simulatedLat = targetBranch.latitude + 0.00015;
      const simulatedLon = targetBranch.longitude + 0.00015;
      const geo: GeoLocationPayload = {
        latitude: simulatedLat,
        longitude: simulatedLon,
        accuracy: 6.5,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.104',
        device: 'Mobile Phone (Apple iPhone 15 Pro)',
        browser: 'Safari Mobile 18.0',
        operatingSystem: 'iOS 18.1',
        permissionStatus: 'GRANTED',
        geofenceStatus: 'INSIDE_GEOFENCE',
        distanceFromBranchMeters: 23.4,
        nearestBranch: targetBranch.name,
      };
      setLiveGeo(geo);
      setPunchAlert({
        type: 'SUCCESS',
        message: 'Simulated Location: Within 100m Allowed Office Radius (23.4m)',
        details: 'Ready to test: Punch In will be ALLOWED.',
      });
    } else {
      // 650 meters away
      const simulatedLat = targetBranch.latitude + 0.006;
      const simulatedLon = targetBranch.longitude + 0.006;
      const geo: GeoLocationPayload = {
        latitude: simulatedLat,
        longitude: simulatedLon,
        accuracy: 15.0,
        timestamp: new Date().toISOString(),
        ipAddress: '49.207.180.92',
        device: 'Mobile Phone (Samsung Galaxy S24)',
        browser: 'Chrome Mobile 128.0',
        operatingSystem: 'Android 15',
        permissionStatus: 'GRANTED',
        geofenceStatus: 'OUTSIDE_GEOFENCE',
        distanceFromBranchMeters: 650.2,
        nearestBranch: targetBranch.name,
      };
      setLiveGeo(geo);
      setPunchAlert({
        type: 'ERROR',
        message: 'Simulated Location: Outside Allowed Office Radius (650.2m)',
        details: 'Ready to test: Punch In will be REJECTED with "You are outside office premises."',
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C5A059]" />
            Location-Based Geo Attendance Studio
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Browser & Mobile GPS • Accurate Lat/Long • ± Accuracy • Timestamp • IP Address • Device • Browser • Operating System • Geofencing.
          </p>
        </div>

        <button
          onClick={acquireGPS}
          disabled={isAcquiring}
          className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isAcquiring && "animate-spin")} />
          {isAcquiring ? 'Acquiring GPS...' : 'Test Live GPS Location'}
        </button>
      </div>

      {/* Live GPS Diagnostics Card */}
      {liveGeo && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#C5A059] animate-pulse" />
              Live Geolocation Payload Diagnostics
            </h4>

            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase",
                liveGeo.permissionStatus === 'GRANTED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              )}>
                GPS Permission: {liveGeo.permissionStatus}
              </span>

              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase",
                liveGeo.geofenceStatus === 'INSIDE_GEOFENCE' ? "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              )}>
                {liveGeo.geofenceStatus === 'INSIDE_GEOFENCE' ? 'Inside Geofence' : 'Outside Geofence'}
              </span>
            </div>
          </div>

          {/* 8 Captured Metadata Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {/* 1. Latitude */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1">
              <span className="text-gray-500 text-[10px] block">1. LATITUDE</span>
              <strong className="text-white block text-sm">{liveGeo.latitude.toFixed(6)}°</strong>
            </div>

            {/* 2. Longitude */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1">
              <span className="text-gray-500 text-[10px] block">2. LONGITUDE</span>
              <strong className="text-white block text-sm">{liveGeo.longitude.toFixed(6)}°</strong>
            </div>

            {/* 3. Accuracy */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1">
              <span className="text-gray-500 text-[10px] block">3. ACCURACY</span>
              <strong className="text-emerald-400 block text-sm">± {liveGeo.accuracy} meters</strong>
            </div>

            {/* 4. Timestamp */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1 truncate">
              <span className="text-gray-500 text-[10px] block">4. TIMESTAMP</span>
              <strong className="text-gray-300 block text-xs truncate">{new Date(liveGeo.timestamp).toLocaleTimeString()}</strong>
            </div>

            {/* 5. IP Address */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1">
              <span className="text-gray-500 text-[10px] block">5. IP ADDRESS</span>
              <strong className="text-cyan-400 block text-xs">{liveGeo.ipAddress}</strong>
            </div>

            {/* 6. Device */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1 truncate">
              <span className="text-gray-500 text-[10px] block">6. DEVICE</span>
              <strong className="text-white block text-xs truncate">{liveGeo.device}</strong>
            </div>

            {/* 7. Browser */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1 truncate">
              <span className="text-gray-500 text-[10px] block">7. BROWSER</span>
              <strong className="text-white block text-xs truncate">{liveGeo.browser}</strong>
            </div>

            {/* 8. Operating System */}
            <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1 truncate">
              <span className="text-gray-500 text-[10px] block">8. OPERATING SYSTEM</span>
              <strong className="text-purple-400 block text-xs truncate">{liveGeo.operatingSystem}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>
              Target Branch: <strong className="text-white">{liveGeo.nearestBranch}</strong> ({liveGeo.distanceFromBranchMeters}m away)
            </span>
            <a
              href={`https://www.google.com/maps?q=${liveGeo.latitude},${liveGeo.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#C5A059] hover:underline flex items-center gap-1 font-mono"
            >
              Open in Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Geofence Testing & Simulation Toolbar */}
      <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#C5A059] animate-pulse" />
            Geofence Boundary Tester & Enforcer
          </span>
          <p className="text-[11px] text-gray-400">
            Simulate GPS coordinates within or outside the 100m - 200m allowed office perimeter to verify punch validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => simulateLocation('INSIDE')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
          >
            📍 Simulate Inside (23m)
          </button>
          <button
            type="button"
            onClick={() => simulateLocation('OUTSIDE')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
          >
            📍 Simulate Outside (650m)
          </button>
        </div>
      </div>

      {/* Prominent Geofence Validation Alert */}
      {punchAlert && (
        <div className={cn(
          "p-4 rounded-2xl border transition-all flex items-start gap-3 shadow-xl animate-in fade-in duration-200",
          punchAlert.type === 'SUCCESS' 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/15 border-rose-500/40 text-rose-300"
        )}>
          {punchAlert.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <strong className={cn(
              "text-sm font-bold block",
              punchAlert.type === 'SUCCESS' ? "text-emerald-400" : "text-rose-400"
            )}>
              {punchAlert.message}
            </strong>
            {punchAlert.details && (
              <p className="text-xs text-gray-300 font-mono leading-relaxed">
                {punchAlert.details}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Staff Quick Geo Punch Action Bar */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059] w-full"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Assigned Branch Geofence</label>
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              className="bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059] w-full"
            >
              {BRANCH_GEOFENCE_LOCATIONS.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.geofenceRadiusMeters}m Geofence)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => handlePunch('IN')}
            disabled={isAcquiring}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Punch IN (GPS Verified)
          </button>

          <button
            onClick={() => handlePunch('OUT')}
            disabled={isAcquiring}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            Punch OUT (GPS Verified)
          </button>
        </div>
      </div>

      {/* Geo-Attendance Audit Log Trail */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F1F21] pb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              Geo-Location Verified Attendance Records
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Audited records with exact GPS coordinates, accuracy tolerances, IP address, device fingerprints, and geofencing validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, IP, device..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#C5A059]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified In-Geofence</option>
              <option value="FLAGGED_OUTSIDE_GEOFENCE">Flagged Outside Geofence</option>
            </select>
          </div>
        </div>

        {/* Audit Records Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase font-mono">
                <th className="py-3 px-4">Staff & Department</th>
                <th className="py-3 px-4">Punch Type</th>
                <th className="py-3 px-4">GPS Coordinates & Accuracy</th>
                <th className="py-3 px-4">Network & IP Address</th>
                <th className="py-3 px-4">Device & OS Fingerprint</th>
                <th className="py-3 px-4">Geofence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[#161618] transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-white block font-bold">{log.employeeName}</strong>
                    <span className="text-[10px] text-gray-500 font-mono">{log.department}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase",
                      log.punchType === 'IN' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    )}>
                      Punch {log.punchType}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <span>{log.geo.latitude.toFixed(4)}°, {log.geo.longitude.toFixed(4)}°</span>
                      <a
                        href={`https://www.google.com/maps?q=${log.geo.latitude},${log.geo.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#C5A059] hover:underline"
                        title="View Map"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <span className="text-[10px] text-emerald-400">± {log.geo.accuracy}m Accuracy</span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <span className="text-cyan-400 block">{log.geo.ipAddress}</span>
                    <span className="text-[10px] text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-gray-300 block text-[11px] truncate max-w-[200px]">{log.geo.device}</span>
                    <span className="text-[10px] text-purple-400 font-mono block truncate max-w-[200px]">
                      {log.geo.browser} • {log.geo.operatingSystem}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase inline-block",
                        log.status === 'VERIFIED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      )}>
                        {log.status === 'VERIFIED' ? 'Inside Geofence' : 'Outside Geofence'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono block">
                        {log.geo.distanceFromBranchMeters}m from branch
                      </span>
                    </div>
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
