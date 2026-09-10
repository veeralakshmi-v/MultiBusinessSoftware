import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Clock, CalendarDays, FileCheck, LogOut, UserCircle, CheckCircle2,
  XCircle, AlertCircle, MapPin, ChevronDown, Plus, Loader2,
  Camera, Navigation, RefreshCw, X, ShieldCheck, Receipt,
  LayoutDashboard, Boxes, BarChart3, Users as UsersIcon, Settings as SettingsIcon, Layers
} from 'lucide-react';
import { ThemeEngine } from '../lib/theme/themeEngine';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';

// ─── Types ────────────────────────────────────────────────────────────────────


interface EmployeeSession {
  id: string; name: string; username: string;
  role: string; phone: string; email: string;
  applicationAccess?: string;
}

interface LocationData {
  lat: number; lng: number; accuracy: number; display: string;
}

interface AttendanceRecord {
  id: string; date: string;
  punchIn: string; punchInSelfie: string; punchInLocation: string;
  punchOut: string | null; punchOutSelfie: string | null; punchOutLocation: string | null;
}

interface LeaveRecord {
  id: string; employeeId?: string; employeeName?: string; date: string; appliedOn: string;
  type: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ─── Selfie + Location Modal ─────────────────────────────────────────────────

interface PunchModalProps {
  mode: 'in' | 'out';
  onConfirm: (selfie: string, location: LocationData) => void;
  onClose: () => void;
}

function PunchModal({ mode, onConfirm, onClose }: PunchModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locError, setLocError] = useState('');
  const [locLoading, setLocLoading] = useState(true);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Start camera
  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => { if (mounted) setCameraReady(true); });
        }
      })
      .catch(() => { if (mounted) setCameraError('Camera access denied. Please allow camera permission.'); });

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Get location
  useEffect(() => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported.'); setLocLoading(false); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const display = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setLocation({ lat, lng, accuracy: Math.round(accuracy), display });
        setLocLoading(false);
      },
      () => { setLocError('Location access denied. Please enable GPS/location permission.'); setLocLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const captureSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(-1, 1); // Mirror
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    setCapturedSelfie(canvas.toDataURL('image/jpeg', 0.7));
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraReady(false);
  }, []);

  const retake = () => {
    setCapturedSelfie(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => setCameraReady(true));
        }
      });
  };

  const handleConfirm = () => {
    if (!capturedSelfie || !location) return;
    setConfirming(true);
    setTimeout(() => { onConfirm(capturedSelfie, location); }, 600);
  };

  const isReady = !!capturedSelfie && !!location && !locError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl">

        {/* Top accent */}
        <div className={`h-1 bg-gradient-to-r from-transparent ${mode === 'in' ? 'via-emerald-500' : 'via-red-500'} to-transparent`} />

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${mode === 'in' ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-red-500/15 border border-red-500/25'}`}>
              <Clock className={`w-4 h-4 ${mode === 'in' ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Punch {mode === 'in' ? 'IN' : 'OUT'}</p>
              <p className="text-[10px] text-gray-500 font-mono">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera / Selfie preview */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-200" style={{ aspectRatio: '4/3' }}>
            {capturedSelfie ? (
              <>
                <img src={capturedSelfie} alt="selfie" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <button onClick={retake}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-[10px] text-white font-semibold border border-white/10 hover:bg-black/80 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Retake
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-emerald-500/80 backdrop-blur-sm rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span className="text-[9px] text-white font-bold">Selfie Captured</span>
                </div>
              </>
            ) : cameraError ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-4">
                <XCircle className="w-8 h-8 text-red-500" />
                <p className="text-xs text-red-400 font-semibold">{cameraError}</p>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline autoPlay />
                {cameraReady && (
                  <button onClick={captureSelfie}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-900 font-bold text-xs rounded-full shadow-lg transition-all transform hover:scale-105">
                    <Camera className="w-4 h-4" /> Capture Selfie
                  </button>
                )}
                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Location status */}
          <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
            locLoading ? 'bg-white/[0.03] border-gray-200' :
            locError   ? 'bg-red-500/10 border-red-500/20' :
            location   ? 'bg-emerald-500/10 border-emerald-500/20' : ''
          }`}>
            {locLoading ? (
              <><Loader2 className="w-4 h-4 text-gray-500 animate-spin flex-shrink-0 mt-0.5" />
              <div><p className="text-xs text-gray-400 font-semibold">Fetching GPS location...</p><p className="text-[10px] text-gray-600 mt-0.5">Please wait</p></div></>
            ) : locError ? (
              <><XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div><p className="text-xs text-red-400 font-semibold">Location Error</p><p className="text-[10px] text-red-500/70 mt-0.5">{locError}</p></div></>
            ) : location ? (
              <><Navigation className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-emerald-400 font-semibold">Location Captured</p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">{location.display}</p>
                <p className="text-[9px] text-gray-600">Accuracy: ±{location.accuracy}m</p>
              </div></>
            ) : null}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!isReady || confirming}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${
              mode === 'in'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30'
            }`}
          >
            {confirming
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              : <><ShieldCheck className="w-4 h-4" /> Confirm Punch {mode === 'in' ? 'IN' : 'OUT'}</>
            }
          </button>

          {!isReady && !confirming && (
            <p className="text-center text-[10px] text-gray-600 font-mono">
              {!capturedSelfie && !location ? '📸 Capture selfie + 📍 Location needed' :
               !capturedSelfie ? '📸 Capture selfie to continue' :
               '📍 Waiting for location...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Employee Portal ──────────────────────────────────────────────────────────

export default function EmployeePortal() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [session, setSession] = useState<EmployeeSession | null>(null);
  const [activeTab, setActiveTab] = useState<'attendance' | 'calendar' | 'apply' | 'history'>('attendance');
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchMode, setPunchMode] = useState<'in' | 'out'>('in');
  const [punchSuccess, setPunchSuccess] = useState('');

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('emp_attendance') || '[]'); } catch { return []; }
  });

  const [leaves, setLeaves] = useState<LeaveRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('emp_leaves') || '[]'); } catch { return []; }
  });
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  useEffect(() => {
    const applyCurrentTheme = () => {
      ThemeEngine.applyTheme(ThemeEngine.getThemeConfig());
    };
    applyCurrentTheme();
    window.addEventListener('theme_changed', applyCurrentTheme);
    window.addEventListener('storage', applyCurrentTheme);

    const raw = localStorage.getItem('employee_session');
    if (!raw) { navigate('/employee-login'); return; }
    try { setSession(JSON.parse(raw)); } catch { navigate('/employee-login'); }

    return () => {
      window.removeEventListener('theme_changed', applyCurrentTheme);
      window.removeEventListener('storage', applyCurrentTheme);
    };
  }, []);

  const rawAccess = session?.applicationAccess || '';
  const isFullAccess = !rawAccess || rawAccess.includes('Full Access') || rawAccess.includes('ALL_MODULES');
  const allowedList = isFullAccess
    ? ['Dashboard', 'Billing POS', 'Categories & Items', 'Inventory', 'Sales Reports', 'Employee Details', 'Staff Attendance', 'Customers', 'Settings']
    : rawAccess.split(',').map(s => s.trim());

  const hasPosAccess = allowedList.includes('Billing POS');

  const MODULE_ROUTES: { name: string; href: string; icon: any }[] = [
    { name: 'Billing POS', href: '/dashboard/billing', icon: Receipt },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories & Items', href: '/dashboard/items', icon: Layers },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Boxes },
    { name: 'Sales Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon },
    { name: 'Employee Details', href: '/dashboard/employees', icon: UsersIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
  ];

  const allowedAppModules = MODULE_ROUTES.filter(m => allowedList.includes(m.name));

  const handleNavigateModule = (path: string) => {
    if (!session) return;
    login('demo-live-token-' + session.id, {
      id: session.id,
      username: session.username || session.phone,
      role: session.role,
      applicationAccess: session.applicationAccess || 'Full Access (All Modules & POS)',
    });
    navigate(path);
  };

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const todayRecord = attendance.find(a => a.date === today && a.id.startsWith(session?.id || ''));
  const isPunchedIn = !!todayRecord && !todayRecord.punchOut;
  const isPunchedOut = !!todayRecord?.punchOut;

  const openPunchModal = (mode: 'in' | 'out') => {
    setPunchMode(mode);
    setShowPunchModal(true);
  };

  const handlePunchConfirm = (selfie: string, location: LocationData) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const locStr = `${location.display} (±${location.accuracy}m)`;

    let updated: AttendanceRecord[];
    if (punchMode === 'in') {
      const rec: AttendanceRecord = {
        id: `${session?.id}-${today}`,
        date: today,
        punchIn: time, punchInSelfie: selfie, punchInLocation: locStr,
        punchOut: null, punchOutSelfie: null, punchOutLocation: null,
      };
      updated = [...attendance.filter(a => a.id !== rec.id), rec];
    } else {
      updated = attendance.map(a =>
        a.id === `${session?.id}-${today}`
          ? { ...a, punchOut: time, punchOutSelfie: selfie, punchOutLocation: locStr }
          : a
      );
    }
    setAttendance(updated);
    localStorage.setItem('emp_attendance', JSON.stringify(updated));
    setShowPunchModal(false);
    setPunchSuccess(punchMode === 'in' ? 'Punched IN successfully! ✅' : 'Punched OUT successfully! ✅');

    // Trigger Notification
    try {
      const { NotificationEngine } = require('../lib/notifications/notificationEngine');
      NotificationEngine.dispatch({
        event: punchMode === 'in' ? 'STAFF_PUNCHED_IN' : 'STAFF_PUNCHED_OUT',
        recipient: { name: session.name, mobile: session.phone },
        data: {
          staffName: session.name,
          time,
          location: locStr,
        },
      });
    } catch {}

    setTimeout(() => setPunchSuccess(''), 4000);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason.trim()) return;
    setLeaveLoading(true);
    setTimeout(() => {
      const newLeave: LeaveRecord = {
        id: `leave-${Date.now()}`,
        employeeId: session.id,
        employeeName: session.name,
        date: leaveDate,
        appliedOn: today,
        type: leaveType,
        reason: leaveReason.trim(),
        status: 'PENDING',
      };
      const updated = [newLeave, ...leaves];
      setLeaves(updated);
      localStorage.setItem('emp_leaves', JSON.stringify(updated));

      // Trigger Notification
      try {
        const { NotificationEngine } = require('../lib/notifications/notificationEngine');
        NotificationEngine.dispatch({
          event: 'LEAVE_REQUESTED',
          recipient: { name: session.name },
          data: {
            staffName: session.name,
            type: leaveType,
            date: leaveDate,
            reason: leaveReason.trim(),
          },
        });
      } catch {}

      setLeaveDate(''); setLeaveReason(''); setLeaveLoading(false);
      setLeaveSuccess(true);
      setTimeout(() => setLeaveSuccess(false), 3000);
      setActiveTab('history');
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_session');
    navigate('/');
  };

  if (!session) return null;

  const myAttendance = attendance.filter(a => a.id.startsWith(session.id));
  const myLeaves = leaves.filter(l => !l.employeeId || l.employeeId === session.id || l.employeeName === session.name);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full bg-theme-primary text-gray-900 font-sans flex flex-col relative">

      {/* Punch Modal */}
      {showPunchModal && (
        <PunchModal mode={punchMode} onConfirm={handlePunchConfirm} onClose={() => setShowPunchModal(false)} />
      )}

      {/* Header */}
      <header className="flex-shrink-0 px-5 md:px-8 py-3.5 flex items-center justify-between border-b border-gray-100 bg-white backdrop-blur-2xl z-30 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center border border-white/20 shadow-md">
            <UserCircle className="w-5 h-5 text-current" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{session.name}</p>
            <p className="text-[9px] font-mono text-[#2563EB] uppercase tracking-wider">{session.role} · Employee Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPosAccess && (
            <button
              onClick={() => handleNavigateModule('/dashboard/billing')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#C5A059] to-[#9E7B35] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer"
              title="Open Billing POS Interface"
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Open Billing POS</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
            <Clock className="w-3 h-3 text-[#2563EB]" />
            <span className="text-[10px] font-mono opacity-80">{now}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 min-h-0 p-5 md:p-6 lg:p-8 flex flex-col gap-5 relative z-10 overflow-auto lg:overflow-hidden">

        {/* Authorized Modules Quick Access Banner */}
        {allowedAppModules.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center text-current font-bold border border-white/20 shadow-md">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Authorized Application Access</p>
                <p className="text-[10px] text-[#2563EB]">You have permissions for {allowedAppModules.length} project module(s)</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {allowedAppModules.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.name}
                    onClick={() => handleNavigateModule(m.href)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>Open {m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {[
            { id: 'attendance', label: 'Punch IN / OUT', icon: Clock },
            { id: 'calendar',   label: 'Attendance Calendar', icon: CalendarDays },
            { id: 'apply',      label: 'Apply Leave',    icon: Plus },
            { id: 'history',    label: 'Leave History',  icon: FileCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  active
                    ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md border-transparent'
                    : 'bg-white text-gray-900 border-gray-100 hover:bg-blue-50'
                }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── ATTENDANCE CALENDAR TAB ── */}
        {activeTab === 'calendar' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <AttendanceCalendar
              userId={session.id}
              userName={session.name}
              userRole={session.role}
              attendanceRecords={attendance}
              leaveRecords={leaves}
              onAddLeave={(newLeave) => setLeaves([newLeave, ...leaves])}
            />
          </div>
        )}


        {/* ── ATTENDANCE TAB ── */}
        {activeTab === 'attendance' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Punch card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 text-center">

              {punchSuccess && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> {punchSuccess}
                </div>
              )}

              {/* Clock visual */}
              <div className="relative">
                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                  isPunchedOut ? 'border-gray-600 bg-gray-800/30' :
                  isPunchedIn  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' :
                  'border-cyan-500/40 bg-cyan-500/5'
                }`}>
                  <Clock className={`w-12 h-12 transition-colors ${
                    isPunchedOut ? 'text-gray-600' :
                    isPunchedIn  ? 'text-emerald-400' : 'text-cyan-500/60'
                  }`} />
                </div>
                {isPunchedIn && <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping" />}
              </div>

              {/* Today's selfie thumbnails */}
              {todayRecord && (
                <div className="flex items-center gap-3">
                  {todayRecord.punchInSelfie && (
                    <div className="text-center">
                      <img src={todayRecord.punchInSelfie} alt="punch in selfie"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/40 shadow-md" />
                      <p className="text-[9px] text-emerald-400 font-mono mt-1">IN {todayRecord.punchIn}</p>
                    </div>
                  )}
                  {todayRecord.punchOutSelfie && (
                    <div className="text-center">
                      <img src={todayRecord.punchOutSelfie} alt="punch out selfie"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-red-500/40 shadow-md" />
                      <p className="text-[9px] text-red-400 font-mono mt-1">OUT {todayRecord.punchOut}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-lg font-bold text-gray-900">
                  {isPunchedOut ? 'Day Complete' : isPunchedIn ? "You're Clocked In" : 'Not Punched In'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {todayRecord
                    ? `IN: ${todayRecord.punchIn}${todayRecord.punchOut ? ` · OUT: ${todayRecord.punchOut}` : ''}`
                    : 'Take a selfie with live location to punch in'}
                </p>
                {todayRecord?.punchInLocation && (
                  <p className="text-[10px] text-gray-600 font-mono mt-1 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" /> {todayRecord.punchInLocation}
                  </p>
                )}
              </div>

              {!isPunchedOut && (
                <button
                  onClick={() => openPunchModal(isPunchedIn ? 'out' : 'in')}
                  className={`px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 border ${
                    isPunchedIn
                      ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                      : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-lg border-transparent'
                  }`}
                >
                  <Camera className="w-4 h-4 text-current" />
                  {isPunchedIn ? 'Punch OUT with Selfie' : 'Punch IN with Selfie'}
                </button>
              )}


              {isPunchedOut && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Attendance marked for today
                </p>
              )}
            </div>

            {/* Recent attendance table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-900">Recent Attendance</h3>
              </div>
              <div className="overflow-auto flex-1">
                {myAttendance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6 h-full">
                    <Clock className="w-8 h-8 text-gray-700 mb-3" />
                    <p className="text-xs text-gray-500">No attendance records yet</p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        <th className="text-left px-4 py-3 text-gray-500 font-semibold">Selfies</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-semibold">IN</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-semibold">OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.slice().reverse().map(rec => {
                        const inMin = rec.punchIn ? (parseInt(rec.punchIn.split(':')[0]) * 60 + parseInt(rec.punchIn.split(':')[1])) : 0;
                        const outMin = rec.punchOut ? (parseInt(rec.punchOut.split(':')[0]) * 60 + parseInt(rec.punchOut.split(':')[1])) : 0;
                        const worked = rec.punchOut ? Math.max(0, (outMin - inMin) / 60) : 0;
                        const isAbsent = rec.punchOut && worked < 1;
                        const isHalfDay = rec.punchOut && worked >= 1 && worked < 4;

                        return (
                          <tr key={rec.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                {rec.punchInSelfie && (
                                  <img src={rec.punchInSelfie} alt="" className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30" />
                                )}
                                {rec.punchOutSelfie && (
                                  <img src={rec.punchOutSelfie} alt="" className="w-8 h-8 rounded-lg object-cover border border-red-500/30" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-gray-300">{rec.date}</td>
                            <td className="px-4 py-2.5">
                              {!rec.punchOut ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono text-[9px]">ACTIVE</span>
                              ) : isAbsent ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/20 text-red-400 font-mono text-[9px] font-bold">ABSENT</span>
                              ) : isHalfDay ? (
                                <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/20 text-orange-400 font-mono text-[9px] font-bold">HALF DAY</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">PRESENT</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="text-emerald-400 font-semibold">{rec.punchIn}</p>
                              {rec.punchInLocation && <p className="text-[9px] text-gray-600 font-mono truncate max-w-[80px]">{rec.punchInLocation.split(',')[0]}</p>}
                            </td>
                            <td className="px-4 py-2.5">
                              {rec.punchOut
                                ? <><p className="text-red-400 font-semibold">{rec.punchOut}</p>
                                  {rec.punchOutLocation && <p className="text-[9px] text-gray-600 font-mono truncate max-w-[80px]">{rec.punchOutLocation.split(',')[0]}</p>}</>
                                : <span className="text-gray-500">—</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── APPLY LEAVE TAB ── */}
        {activeTab === 'apply' && (
          <div className="flex-1 flex items-start justify-center">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-gray-900">Apply for Leave</h3>
              </div>

              {leaveSuccess && (
                <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Leave request submitted successfully!
                </div>
              )}

              <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Leave Type</label>
                  <div className="relative">
                    <select value={leaveType} onChange={e => setLeaveType(e.target.value)}
                      className="w-full bg-gray-50 border border-[#2A2A2D] focus:border-pink-500/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none appearance-none cursor-pointer">
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Earned Leave</option>
                      <option>Emergency Leave</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Leave Date</label>
                  <input type="date" value={leaveDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setLeaveDate(e.target.value)}
                    className="w-full bg-gray-50 border border-[#2A2A2D] focus:border-pink-500/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none [color-scheme:dark]" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Reason</label>
                  <textarea rows={3} value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                    placeholder="Brief reason for your leave request..."
                    className="w-full bg-gray-50 border border-[#2A2A2D] focus:border-pink-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none resize-none" />
                </div>

                <button type="submit" disabled={leaveLoading || !leaveDate || !leaveReason.trim()}
                  className="w-full py-3 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 hover:border-pink-500/70 text-pink-300 font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {leaveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {leaveLoading ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── LEAVE HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-gray-900">Leave History</h3>
            </div>

            {leaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6 flex-1">
                <CalendarDays className="w-8 h-8 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-400">No leave requests yet</p>
                <p className="text-xs text-gray-600 mt-1">Your leave applications will appear here</p>
              </div>
            ) : (
              <div className="overflow-auto flex-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left px-5 py-3 text-gray-500 font-semibold">Leave Date</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-semibold">Type</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-semibold">Reason</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-semibold">Applied On</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(leave => (
                      <tr key={leave.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-3 font-mono text-gray-300">{leave.date}</td>
                        <td className="px-5 py-3 text-white font-semibold">{leave.type}</td>
                        <td className="px-5 py-3 text-gray-400 max-w-[200px] truncate">{leave.reason}</td>
                        <td className="px-5 py-3 font-mono text-gray-500">{leave.appliedOn}</td>
                        <td className="px-5 py-3">
                          {leave.status === 'APPROVED' && (
                            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Approved</span>
                          )}
                          {leave.status === 'REJECTED' && (
                            <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" /> Rejected</span>
                          )}
                          {leave.status === 'PENDING' && (
                            <span className="flex items-center gap-1 text-yellow-400"><AlertCircle className="w-3 h-3" /> Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
