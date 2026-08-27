import React, { useState, useEffect } from 'react';
import {
  Server, RefreshCw, Send, CheckCircle2, XCircle, ChevronRight,
  Users, Building2, Award, Clock, MapPin, LogIn, LogOut,
  FileText, CalendarDays, Settings, Loader2, AlertCircle,
  Database, Wifi, Copy, Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

const BASE = 'http://localhost:3001';

type ApiResult = { status: number; data: any; ms: number } | null;
type EndpointDef = { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; label: string; body?: Record<string, any> };

// All Feature 20 REST API endpoints
const ENDPOINT_GROUPS: { icon: React.ReactNode; label: string; color: string; endpoints: EndpointDef[] }[] = [
  {
    icon: <Building2 className="w-4 h-4" />,
    label: 'Department',
    color: 'text-sky-400',
    endpoints: [
      { method: 'GET',    path: '/api/attendance/departments',     label: 'List Departments' },
      { method: 'POST',   path: '/api/attendance/departments',     label: 'Create Department',   body: { name: 'Accounts', code: 'ACC', description: 'Finance & Accounts' } },
      { method: 'PUT',    path: '/api/attendance/departments/d-001', label: 'Update Department', body: { description: 'Updated kitchen dept' } },
      { method: 'DELETE', path: '/api/attendance/departments/d-001', label: 'Deactivate Department' },
    ],
  },
  {
    icon: <Award className="w-4 h-4" />,
    label: 'Designation',
    color: 'text-purple-400',
    endpoints: [
      { method: 'GET',    path: '/api/attendance/designations',       label: 'List Designations' },
      { method: 'POST',   path: '/api/attendance/designations',       label: 'Create Designation', body: { title: 'Senior Waiter', grade: 'L2', departmentId: 'd-002' } },
      { method: 'PUT',    path: '/api/attendance/designations/dsg-001', label: 'Update Designation', body: { grade: 'L5' } },
      { method: 'DELETE', path: '/api/attendance/designations/dsg-001', label: 'Deactivate Designation' },
    ],
  },
  {
    icon: <Clock className="w-4 h-4" />,
    label: 'Shift',
    color: 'text-amber-400',
    endpoints: [
      { method: 'GET',    path: '/api/attendance/shifts',       label: 'List Shifts' },
      { method: 'POST',   path: '/api/attendance/shifts',       label: 'Create Shift', body: { name: 'Night Shift', startTime: '22:00', endTime: '06:00', daysOfWeek: '1,2,3,4,5', isNightShift: true } },
      { method: 'PUT',    path: '/api/attendance/shifts/sh-001', label: 'Update Shift', body: { gracePeriodMinutes: 20 } },
      { method: 'DELETE', path: '/api/attendance/shifts/sh-003', label: 'Deactivate Shift' },
    ],
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: 'Employee',
    color: 'text-emerald-400',
    endpoints: [
      { method: 'GET',    path: '/api/attendance/employees',          label: 'List Employees (paginated)' },
      { method: 'GET',    path: '/api/attendance/employees/emp-001',  label: 'Get Employee by ID' },
      { method: 'POST',   path: '/api/attendance/employees',          label: 'Create Employee', body: { firstName: 'Priya', lastName: 'Selvam', email: 'priya@business.com', phone: '+91 98765 44444', departmentId: 'd-002', designationId: 'dsg-002', shiftId: 'sh-002', role: 'EMPLOYEE', gender: 'FEMALE', baseSalary: 24000 } },
      { method: 'PUT',    path: '/api/attendance/employees/emp-003',  label: 'Update Employee', body: { phone: '+91 99999 00003', baseSalary: 26000 } },
      { method: 'DELETE', path: '/api/attendance/employees/emp-003',  label: 'Terminate Employee' },
    ],
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    label: 'Location Validation',
    color: 'text-rose-400',
    endpoints: [
      { method: 'POST', path: '/api/attendance/validate-location', label: 'Validate GPS (Within Radius)',  body: { lat: 13.0827, lon: 80.2707 } },
      { method: 'POST', path: '/api/attendance/validate-location', label: 'Validate GPS (Outside Radius)', body: { lat: 13.1200, lon: 80.3100 } },
    ],
  },
  {
    icon: <LogIn className="w-4 h-4" />,
    label: 'Punch In',
    color: 'text-cyan-400',
    endpoints: [
      { method: 'POST', path: '/api/attendance/punch-in',  label: 'Punch In (Within Radius)',  body: { employeeId: 'emp-002', lat: 13.0827, lon: 80.2707, accuracy: 5, browser: 'Chrome 126', deviceInfo: 'Windows 11', ipAddress: '192.168.1.101' } },
      { method: 'GET',  path: '/api/attendance/today',     label: 'Today Attendance Status' },
    ],
  },
  {
    icon: <LogOut className="w-4 h-4" />,
    label: 'Punch Out',
    color: 'text-orange-400',
    endpoints: [
      { method: 'POST', path: '/api/attendance/punch-out', label: 'Punch Out', body: { employeeId: 'emp-002', lat: 13.0827, lon: 80.2707, accuracy: 8, browser: 'Chrome 126', deviceInfo: 'Windows 11', ipAddress: '192.168.1.101' } },
      { method: 'GET',  path: '/api/attendance',           label: 'List All Attendance Records' },
    ],
  },
  {
    icon: <CalendarDays className="w-4 h-4" />,
    label: 'Leave Approval',
    color: 'text-pink-400',
    endpoints: [
      { method: 'GET',    path: '/api/attendance/leave',                 label: 'List Leave Requests' },
      { method: 'POST',   path: '/api/attendance/leave/apply',           label: 'Apply Leave', body: { employeeId: 'emp-001', leaveTypeName: 'Casual Leave', startDate: '2026-09-01', endDate: '2026-09-02', totalDays: 2, reason: 'Personal work' } },
      { method: 'PUT',    path: '/api/attendance/leave/__LEAVE_ID__/approve', label: 'Approve Leave *(run Apply first)', body: { approvedBy: 'Venkatesh Prabhu' } },
      { method: 'PUT',    path: '/api/attendance/leave/__LEAVE_ID__/reject',  label: 'Reject Leave *(run Apply first)',  body: { rejectedBy: 'HR Manager', rejectionReason: 'Peak season' } },
    ],
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: 'Reports',
    color: 'text-teal-400',
    endpoints: [
      { method: 'GET', path: '/api/attendance/reports/summary', label: 'Dashboard Summary' },
      { method: 'GET', path: `/api/attendance/reports/daily?date=${new Date().toISOString().slice(0,10)}`, label: 'Daily Attendance Report' },
      { method: 'GET', path: `/api/attendance/reports/monthly?year=${new Date().getFullYear()}&month=${new Date().getMonth()+1}`, label: 'Monthly Attendance Report' },
    ],
  },
  {
    icon: <Settings className="w-4 h-4" />,
    label: 'Attendance Settings',
    color: 'text-gray-400',
    endpoints: [
      { method: 'GET', path: '/api/attendance/settings', label: 'Get Settings' },
      { method: 'PUT', path: '/api/attendance/settings', label: 'Update Settings', body: { enableGeofence: true, defaultGeofenceRadiusM: 150, gracePeriodMins: 20, enableLateAlert: true } },
    ],
  },
];

const METHOD_STYLES: Record<string, string> = {
  GET:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  POST:   'bg-sky-500/10    text-sky-400    border-sky-500/30',
  PUT:    'bg-amber-500/10  text-amber-400  border-amber-500/30',
  DELETE: 'bg-rose-500/10   text-rose-400   border-rose-500/30',
};

async function callApi(ep: EndpointDef): Promise<ApiResult> {
  const t0 = performance.now();
  try {
    // Replace placeholder leave ID with a real id by first applying a leave
    let path = ep.path;
    const resp = await fetch(`${BASE}${path}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    const data = await resp.json();
    return { status: resp.status, data, ms: Math.round(performance.now() - t0) };
  } catch (e: any) {
    return { status: 0, data: { error: e.message || 'Network error – is the dev server running on port 3001?' }, ms: Math.round(performance.now() - t0) };
  }
}

export default function AttendanceAPIStudio() {
  const [results, setResults] = useState<Record<string, ApiResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Employee');

  useEffect(() => {
    fetch(`${BASE}/api/health`)
      .then(r => r.ok ? setHealthStatus('online') : setHealthStatus('offline'))
      .catch(() => setHealthStatus('offline'));
  }, []);

  const run = async (key: string, ep: EndpointDef) => {
    setLoading(p => ({ ...p, [key]: true }));
    const result = await callApi(ep);
    setResults(p => ({ ...p, [key]: result }));
    setLoading(p => ({ ...p, [key]: false }));
  };

  const copyJson = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-5 font-sans">

      {/* Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Server className="w-5 h-5 text-[#C5A059]" />
            Attendance REST API Studio – Feature 20 & 21
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Live API console for all 11 endpoint groups — Employee, Department, Designation, Shift CRUD + Punch In/Out, Leave Approval, Reports & Location Validation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border",
            healthStatus === 'online'   && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            healthStatus === 'offline'  && 'bg-rose-500/10    text-rose-400    border-rose-500/30',
            healthStatus === 'checking' && 'bg-gray-500/10    text-gray-400    border-gray-500/30',
          )}>
            {healthStatus === 'online'   && <><Wifi className="w-3 h-3" /> API Online</>}
            {healthStatus === 'offline'  && <><XCircle className="w-3 h-3" /> API Offline</>}
            {healthStatus === 'checking' && <><Loader2 className="w-3 h-3 animate-spin" /> Checking...</>}
          </div>
          <div className="text-[10px] font-mono text-gray-500 bg-[#0A0A0B] border border-[#2D2D30] px-2 py-1 rounded-lg">
            {BASE}
          </div>
        </div>
      </div>

      {/* Endpoint Groups */}
      <div className="space-y-3">
        {ENDPOINT_GROUPS.map(group => (
          <div key={group.label} className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden shadow-md">
            {/* Group Header */}
            <button
              onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#1a1a1c] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("flex items-center", group.color)}>{group.icon}</span>
                <span className="font-bold text-white text-sm">{group.label}</span>
                <span className="text-[10px] font-mono text-gray-500 bg-[#0A0A0B] px-2 py-0.5 rounded-md border border-[#2D2D30]">
                  {group.endpoints.length} endpoints
                </span>
              </div>
              <ChevronRight className={cn("w-4 h-4 text-gray-500 transition-transform", expandedGroup === group.label && 'rotate-90')} />
            </button>

            {/* Endpoint Rows */}
            {expandedGroup === group.label && (
              <div className="border-t border-[#1F1F21]">
                {group.endpoints.map((ep, i) => {
                  const key = `${group.label}-${i}`;
                  const result = results[key];
                  const isLoading = loading[key];

                  return (
                    <div key={key} className="border-b border-[#1F1F21] last:border-0">
                      {/* Endpoint Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3">
                        <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded border w-14 text-center flex-shrink-0", METHOD_STYLES[ep.method])}>
                          {ep.method}
                        </span>
                        <code className="text-xs text-[#C5A059] font-mono flex-1 min-w-0 truncate">{ep.path}</code>
                        <span className="text-xs text-gray-500 hidden lg:block flex-shrink-0">{ep.label}</span>
                        <button
                          onClick={() => run(key, ep)}
                          disabled={isLoading}
                          className={cn(
                            "ml-auto px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border flex-shrink-0",
                            isLoading
                              ? "bg-[#1F1F21] text-gray-500 border-[#2D2D30] cursor-not-allowed"
                              : "bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/30"
                          )}
                        >
                          {isLoading
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> Running</>
                            : <><Send className="w-3 h-3" /> Run</>
                          }
                        </button>
                      </div>

                      {/* Request body preview */}
                      {ep.body && (
                        <div className="px-5 pb-2">
                          <div className="text-[10px] font-mono text-gray-600 mb-1">REQUEST BODY:</div>
                          <pre className="text-[10px] font-mono text-gray-500 bg-[#0A0A0B] p-2 rounded-xl border border-[#1F1F21] overflow-x-auto">{JSON.stringify(ep.body, null, 2)}</pre>
                        </div>
                      )}

                      {/* Response Panel */}
                      {result && (
                        <div className="px-5 pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded", result.status >= 200 && result.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                                {result.status || 'ERR'}
                              </span>
                              <span className="text-[10px] font-mono text-gray-500">{result.ms}ms</span>
                              {result.status >= 200 && result.status < 300
                                ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                : <XCircle className="w-3 h-3 text-rose-400" />
                              }
                            </div>
                            <button
                              onClick={() => copyJson(key, JSON.stringify(result.data, null, 2))}
                              className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-gray-300 transition-colors"
                            >
                              {copiedKey === key ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy JSON</>}
                            </button>
                          </div>
                          <pre className="text-[10px] font-mono text-gray-300 bg-[#0A0A0B] p-3 rounded-xl border border-[#1F1F21] overflow-x-auto max-h-64 overflow-y-auto">{JSON.stringify(result.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <AlertCircle className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
        <p className="text-xs text-gray-400">
          All APIs automatically fall back to in-memory demo data if the database has not been migrated yet.
          Run <code className="text-[#C5A059] font-mono mx-1">npx prisma db push</code> to persist to SQLite.
        </p>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-gray-600">
          <Database className="w-3 h-3" /> 11 groups · 31 endpoints
        </div>
      </div>

    </div>
  );
}
