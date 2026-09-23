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

export interface PunchSession {
  id: string;
  punchIn: string;
  punchInSelfie?: string | null;
  punchInLocation?: string | null;
  punchOut?: string | null;
  punchOutSelfie?: string | null;
  punchOutLocation?: string | null;
  type?: 'NORMAL' | 'BREAK' | 'PERMISSION' | string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  punchIn: string;
  punchInSelfie: string;
  punchInLocation: string;
  punchOut: string | null;
  punchOutSelfie: string | null;
  punchOutLocation: string | null;
  sessions?: PunchSession[];
}

interface LeaveRecord {
  id: string; employeeId?: string; employeeName?: string; date: string; appliedOn: string;
  type: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

function calcTotalWorkedHours(rec: AttendanceRecord): number {
  if (rec.sessions && rec.sessions.length > 0) {
    let totalMins = 0;
    for (const s of rec.sessions) {
      if (s.punchIn && s.punchOut) {
        const [inH, inM] = s.punchIn.split(':').map(Number);
        const [outH, outM] = s.punchOut.split(':').map(Number);
        const diff = (outH * 60 + outM) - (inH * 60 + inM);
        if (diff > 0) totalMins += diff;
      }
    }
    return Math.round((totalMins / 60) * 10) / 10;
  }
  if (!rec.punchOut) return 0;
  const [inH, inM] = rec.punchIn.split(':').map(Number);
  const [outH, outM] = rec.punchOut.split(':').map(Number);
  const diff = (outH * 60 + outM) - (inH * 60 + inM);
  return Math.max(0, Math.round((diff / 60) * 10) / 10);
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
      name: session.name,
      fullName: session.name,
      username: session.username || session.phone,
      role: session.role,
      businessId: (session as any).businessId || localStorage.getItem('businessId') || '',
      applicationAccess: session.applicationAccess || 'Full Access (All Modules & POS)',
    } as any);
    navigate(path);
  };

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const todayRecord = attendance.find(a => a.date === today && a.id.startsWith(session?.id || ''));
  const hasSessions = !!(todayRecord?.sessions && todayRecord.sessions.length > 0);
  const isClockedIn = hasSessions
    ? todayRecord!.sessions!.some(s => !s.punchOut)
    : (!!todayRecord && !todayRecord.punchOut);
  const activeSession = hasSessions ? todayRecord!.sessions!.find(s => !s.punchOut) : null;
  const completedSessions = hasSessions ? todayRecord!.sessions!.filter(s => !!s.punchOut) : (todayRecord?.punchOut ? [todayRecord] : []);
  const todaySessionsCount = hasSessions ? todayRecord!.sessions!.length : (todayRecord ? 1 : 0);
  const todayWorkedHours = todayRecord ? calcTotalWorkedHours(todayRecord) : 0;

  const openPunchModal = (mode: 'in' | 'out') => {
    setPunchMode(mode);
    setShowPunchModal(true);
  };

  const handlePunchConfirm = (selfie: string, location: LocationData) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const locStr = `${location.display} (±${location.accuracy}m)`;
    const recordId = `${session?.id}-${today}`;

    let updated: AttendanceRecord[];
    const existingRec = attendance.find(a => a.id === recordId);

    if (punchMode === 'in') {
      const newSession: PunchSession = {
        id: `sess-${Date.now()}`,
        punchIn: time,
        punchInSelfie: selfie,
        punchInLocation: locStr,
        punchOut: null,
        punchOutSelfie: null,
        punchOutLocation: null,
      };

      if (!existingRec) {
        const newRec: AttendanceRecord = {
          id: recordId,
          date: today,
          punchIn: time,
          punchInSelfie: selfie,
          punchInLocation: locStr,
          punchOut: null,
          punchOutSelfie: null,
          punchOutLocation: null,
          sessions: [newSession],
        };
        updated = [...attendance.filter(a => a.id !== recordId), newRec];
      } else {
        const existingSessions: PunchSession[] = existingRec.sessions && existingRec.sessions.length > 0
          ? [...existingRec.sessions]
          : [{
              id: `sess-legacy-${Date.now()}`,
              punchIn: existingRec.punchIn,
              punchInSelfie: existingRec.punchInSelfie,
              punchInLocation: existingRec.punchInLocation,
              punchOut: existingRec.punchOut,
              punchOutSelfie: existingRec.punchOutSelfie,
              punchOutLocation: existingRec.punchOutLocation,
            }];

        const updatedSessions = [...existingSessions, newSession];
        const updatedRec: AttendanceRecord = {
          ...existingRec,
          punchOut: null,
          punchOutSelfie: null,
          punchOutLocation: null,
          sessions: updatedSessions,
        };
        updated = attendance.map(a => a.id === recordId ? updatedRec : a);
      }
    } else {
      // Punch OUT
      if (existingRec) {
        let updatedSessions: PunchSession[];
        if (existingRec.sessions && existingRec.sessions.length > 0) {
          updatedSessions = existingRec.sessions.map((s, idx) => {
            if (idx === existingRec.sessions!.length - 1 && !s.punchOut) {
              return {
                ...s,
                punchOut: time,
                punchOutSelfie: selfie,
                punchOutLocation: locStr,
              };
            }
            return s;
          });
        } else {
          updatedSessions = [{
            id: `sess-${Date.now()}`,
            punchIn: existingRec.punchIn,
            punchInSelfie: existingRec.punchInSelfie,
            punchInLocation: existingRec.punchInLocation,
            punchOut: time,
            punchOutSelfie: selfie,
            punchOutLocation: locStr,
          }];
        }

        const updatedRec: AttendanceRecord = {
          ...existingRec,
          punchOut: time,
          punchOutSelfie: selfie,
          punchOutLocation: locStr,
          sessions: updatedSessions,
        };
        updated = attendance.map(a => a.id === recordId ? updatedRec : a);
      } else {
        updated = attendance;
      }
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto pr-1">

            {/* Punch card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-5 text-center shadow-sm">

              {punchSuccess && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> {punchSuccess}
                </div>
              )}

              {/* Clock visual */}
              <div className="relative">
                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                  isClockedIn
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                    : todayRecord
                    ? 'border-cyan-500/40 bg-cyan-500/5'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <Clock className={`w-12 h-12 transition-colors ${
                    isClockedIn ? 'text-emerald-500 animate-pulse' : todayRecord ? 'text-cyan-600' : 'text-gray-400'
                  }`} />
                </div>
                {isClockedIn && <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping" />}
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">
                  {isClockedIn
                    ? "🟢 You're Currently Clocked In"
                    : todayRecord
                    ? '🟡 Currently Clocked Out / Out on Permission'
                    : '⚪ Not Punched In Today'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isClockedIn
                    ? `Active Session started at ${activeSession?.punchIn || todayRecord?.punchIn} · Total logged today: ${todayWorkedHours} hrs`
                    : todayRecord
                    ? `Completed ${completedSessions.length} session(s) today (${todayWorkedHours} hrs worked). You can punch back in anytime upon return!`
                    : 'Take a selfie with live location to start your shift or punch in'}
                </p>
                {todayRecord?.punchInLocation && (
                  <p className="text-[10px] text-gray-600 font-mono mt-1 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 text-[#2563EB]" /> {todayRecord.punchInLocation}
                  </p>
                )}
              </div>

              {/* Main Punch Action Button - Always active so employees can punch back in after permissions */}
              <button
                onClick={() => openPunchModal(isClockedIn ? 'out' : 'in')}
                className={`px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 border shadow-lg cursor-pointer ${
                  isClockedIn
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500/50 hover:brightness-110 shadow-red-500/20'
                    : todayRecord
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/50 hover:brightness-110 shadow-emerald-500/20'
                    : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-blue-500/20 border-transparent'
                }`}
              >
                <Camera className="w-4 h-4 text-current" />
                {isClockedIn
                  ? 'Punch OUT (Permission / Break / End Shift)'
                  : todayRecord
                  ? 'Punch IN (Return from Permission / New Shift)'
                  : 'Punch IN with Selfie'}
              </button>

              {/* Today's Punch Sessions Breakdown */}
              {todayRecord?.sessions && todayRecord.sessions.length > 0 && (
                <div className="w-full mt-2 pt-4 border-t border-gray-100 text-left">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Today's Punch History ({todayRecord.sessions.length} {todayRecord.sessions.length === 1 ? 'session' : 'sessions'})
                    </span>
                    <span className="text-[11px] font-bold font-mono text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                      Total: {todayWorkedHours} hrs
                    </span>
                  </div>

                  <div className="space-y-2">
                    {todayRecord.sessions.map((sess, idx) => {
                      const isCurr = !sess.punchOut;
                      let durationStr = 'Ongoing';
                      if (sess.punchIn && sess.punchOut) {
                        const [inH, inM] = sess.punchIn.split(':').map(Number);
                        const [outH, outM] = sess.punchOut.split(':').map(Number);
                        const diff = (outH * 60 + outM) - (inH * 60 + inM);
                        if (diff > 0) {
                          const hrs = Math.floor(diff / 60);
                          const mins = diff % 60;
                          durationStr = `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
                        }
                      }

                      return (
                        <div
                          key={sess.id || idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                            isCurr
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-gray-50 border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                              isCurr ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-emerald-600 font-mono">IN: {sess.punchIn}</span>
                                <span className="text-gray-400">→</span>
                                <span className={`font-mono ${sess.punchOut ? 'text-red-500 font-semibold' : 'text-emerald-500 font-bold animate-pulse'}`}>
                                  OUT: {sess.punchOut || 'Active'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 font-mono">Duration: {durationStr}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {sess.punchInSelfie && (
                              <img src={sess.punchInSelfie} alt="in" className="w-7 h-7 rounded-lg object-cover border border-emerald-400" title="Punch In Selfie" />
                            )}
                            {sess.punchOutSelfie && (
                              <img src={sess.punchOutSelfie} alt="out" className="w-7 h-7 rounded-lg object-cover border border-red-400" title="Punch Out Selfie" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Recent attendance table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-900">Recent Attendance History</h3>
                <span className="text-[10px] text-gray-500">Includes multi-session hours</span>
              </div>
              <div className="overflow-auto flex-1">
                {myAttendance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6 h-full">
                    <Clock className="w-8 h-8 text-gray-300 mb-3" />
                    <p className="text-xs text-gray-500">No attendance records yet</p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Selfies</th>
                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Sessions</th>
                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.slice().reverse().map(rec => {
                        const worked = calcTotalWorkedHours(rec);
                        const isCurrentlyActive = !rec.punchOut || (rec.sessions && rec.sessions.some(s => !s.punchOut));
                        const isAbsent = !isCurrentlyActive && worked < 1;
                        const isHalfDay = !isCurrentlyActive && worked >= 1 && worked < 4;
                        const sessionCount = rec.sessions?.length || 1;

                        return (
                          <tr key={rec.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                {rec.punchInSelfie && (
                                  <img src={rec.punchInSelfie} alt="" className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30 shadow-sm" />
                                )}
                                {rec.punchOutSelfie && (
                                  <img src={rec.punchOutSelfie} alt="" className="w-8 h-8 rounded-lg object-cover border border-red-500/30 shadow-sm" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-gray-700 font-medium">{rec.date}</td>
                            <td className="px-4 py-2.5">
                              {isCurrentlyActive ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-mono text-[9px] font-bold">ACTIVE</span>
                              ) : isAbsent ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-[9px] font-bold">ABSENT</span>
                              ) : isHalfDay ? (
                                <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-mono text-[9px] font-bold">HALF DAY</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-mono text-[9px] font-bold">PRESENT</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-mono text-gray-600 font-medium">{sessionCount} {sessionCount === 1 ? 'shift' : 'sessions'}</span>
                              <p className="text-[10px] text-gray-400 font-mono">IN: {rec.punchIn} {rec.punchOut ? `· OUT: ${rec.punchOut}` : ''}</p>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-mono font-bold text-gray-900">{worked} hrs</span>
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
          <div className="flex-1 flex items-start justify-center overflow-y-auto p-2">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                    <CalendarDays className="w-4 h-4 text-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Apply for Leave</h3>
                    <p className="text-[11px] text-gray-500">Submit a leave request for administrative review</p>
                  </div>
                </div>
              </div>

              {leaveSuccess && (
                <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Leave request submitted successfully!
                </div>
              )}

              <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Leave Type</label>
                  <div className="relative">
                    <select
                      value={leaveType}
                      onChange={e => setLeaveType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none appearance-none cursor-pointer transition-all"
                    >
                      <option value="Casual Leave" className="bg-white text-gray-900">Casual Leave</option>
                      <option value="Sick Leave" className="bg-white text-gray-900">Sick Leave</option>
                      <option value="Earned Leave" className="bg-white text-gray-900">Earned Leave</option>
                      <option value="Emergency Leave" className="bg-white text-gray-900">Emergency Leave</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Leave Date</label>
                  <input
                    type="date"
                    value={leaveDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setLeaveDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all [color-scheme:light]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Reason</label>
                  <textarea
                    rows={3}
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    placeholder="Brief reason for your leave request..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={leaveLoading || !leaveDate || !leaveReason.trim()}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {leaveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {leaveLoading ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── LEAVE HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-gray-900">Leave History</h3>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">{myLeaves.length} record(s)</span>
            </div>

            {myLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6 flex-1">
                <CalendarDays className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-600">No leave requests yet</p>
                <p className="text-xs text-gray-400 mt-1">Your leave applications will appear here</p>
              </div>
            ) : (
              <div className="overflow-auto flex-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Leave Date</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Type</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Reason</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Applied On</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.map(leave => (
                      <tr key={leave.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-gray-700 font-medium">{leave.date}</td>
                        <td className="px-5 py-3 text-gray-900 font-semibold">{leave.type}</td>
                        <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                        <td className="px-5 py-3 font-mono text-gray-500">{leave.appliedOn}</td>
                        <td className="px-5 py-3">
                          {leave.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-semibold text-[11px]"><CheckCircle2 className="w-3 h-3" /> Approved</span>
                          )}
                          {leave.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 font-semibold text-[11px]"><XCircle className="w-3 h-3" /> Rejected</span>
                          )}
                          {leave.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-semibold text-[11px]"><AlertCircle className="w-3 h-3" /> Pending</span>
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
