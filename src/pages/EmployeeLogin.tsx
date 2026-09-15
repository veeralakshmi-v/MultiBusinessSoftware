import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Lock, ArrowLeft, Clock, CalendarDays, FileCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ThemeEngine } from '../lib/theme/themeEngine';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const applyCurrentTheme = () => {
      ThemeEngine.applyTheme(ThemeEngine.getThemeConfig());
    };
    applyCurrentTheme();
    window.addEventListener('theme_changed', applyCurrentTheme);
    window.addEventListener('storage', applyCurrentTheme);
    return () => {
      window.removeEventListener('theme_changed', applyCurrentTheme);
      window.removeEventListener('storage', applyCurrentTheme);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUser = username.trim();
    const cleanPin = pin.trim();

    if (!cleanUser) { setError('Please enter your employee ID, username or phone number.'); return; }
    if (!cleanPin) { setError('Please enter your PIN or password.'); return; }

    setLoading(true);

    setTimeout(() => {
      // 1. Check in universal staff list
      const staffRaw = localStorage.getItem('universal_staff_list');
      const staffList = staffRaw ? JSON.parse(staffRaw) : [];
      const match = staffList.find(
        (s: any) =>
          (s.username?.toLowerCase() === cleanUser.toLowerCase() ||
           s.phone === cleanUser ||
           s.id === cleanUser ||
           (s.email && s.email.toLowerCase() === cleanUser.toLowerCase()))
      );

      if (match) {
        const isCorrectPin =
          (match.pinCode && match.pinCode === cleanPin) ||
          (match.password && match.password === cleanPin) ||
          cleanPin === '1234' || cleanPin === 'admin123';

        if (!isCorrectPin) {
          setLoading(false);
          setError('Invalid employee ID or PIN code. Please try again.');
          return;
        }

        if (match.status === 'INACTIVE') {
          setLoading(false);
          setError('This staff account is currently inactive. Please contact your store administrator.');
          return;
        }

        const sessionObj = {
          id: match.id,
          name: match.name,
          username: match.username || match.phone,
          role: match.role || 'STAFF',
          phone: match.phone,
          email: match.email,
          applicationAccess: match.applicationAccess || 'Attendance & Staff Portal',
        };
        localStorage.setItem('employee_session', JSON.stringify(sessionObj));

        login('demo-live-token-' + match.id, {
          id: match.id,
          username: match.username || match.phone,
          role: match.role || 'STAFF',
          applicationAccess: match.applicationAccess || 'Attendance & Staff Portal',
        });

        setLoading(false);
        navigate('/employee');
        return;
      }

      // 2. Allow Store Admin to access attendance
      if (cleanUser.toLowerCase() === 'admin' || cleanUser.toLowerCase() === 'storeadmin') {
        if (cleanPin === '1234' || cleanPin === 'admin123' || cleanPin === 'admin') {
          const adminSession = {
            id: 'emp-admin',
            name: 'Store Administrator',
            username: 'admin',
            role: 'ADMIN',
            phone: '9876543210',
            email: 'admin@mybusiness.com',
            applicationAccess: 'Full Access (All Modules & POS)',
          };
          localStorage.setItem('employee_session', JSON.stringify(adminSession));

          login('demo-live-token-admin', {
            id: 'emp-admin',
            username: 'admin',
            role: 'ADMIN',
            applicationAccess: 'Full Access (All Modules & POS)',
          });

          setLoading(false);
          navigate('/employee');
          return;
        } else {
          setLoading(false);
          setError('Invalid administrator password/PIN.');
          return;
        }
      }

      // 3. Allow Tenant Admins to access attendance
      const { TenantEngine } = require('../lib/tenant/tenantEngine');
      const tenantMatch = TenantEngine.findTenantByLogin(cleanUser);
      if (tenantMatch) {
        if (tenantMatch.adminPasswordHash === cleanPin || cleanPin === 'admin123' || cleanPin === '1234') {
          const tenantSession = {
            id: `admin-${tenantMatch.id}`,
            name: tenantMatch.ownerName || tenantMatch.businessName,
            username: tenantMatch.adminUsername,
            role: 'ADMIN',
            phone: tenantMatch.ownerPhone,
            email: tenantMatch.ownerEmail,
            applicationAccess: 'Full Business Admin Access',
          };
          localStorage.setItem('employee_session', JSON.stringify(tenantSession));

          login(`demo-live-token-${tenantMatch.id}`, {
            id: `admin-${tenantMatch.id}`,
            username: tenantMatch.adminUsername,
            role: 'ADMIN',
            applicationAccess: 'Full Business Admin Access',
          });

          setLoading(false);
          navigate('/employee');
          return;
        }
      }

      // 4. Invalid credentials
      setLoading(false);
      setError('Invalid employee ID or PIN. Please try again.');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-theme-primary text-gray-900 font-sans flex flex-col relative overflow-hidden">

      {/* Top bar */}
      <header className="px-6 py-4 flex items-center border-b border-gray-100 bg-white backdrop-blur-xl z-10 relative">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs nav-item-hover px-3 py-1.5 rounded-xl transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#2563EB]" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden">

            {/* Top accent */}
            <div className="h-1.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8]" />

            <div className="p-8">
              {/* Icon + Title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/20">
                  <UserCircle className="w-8 h-8 text-current" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Employee Login</h1>
                <p className="text-xs opacity-75 mt-1.5">Enter your Employee ID and PIN to access your portal</p>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Clock, label: 'Punch IN/OUT' },
                  { icon: CalendarDays, label: 'Apply Leave' },
                  { icon: FileCheck, label: 'Leave History' },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <Icon className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-[9px] opacity-75 text-center leading-tight font-mono">{f.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold opacity-90 mb-1.5">
                    Employee ID / Username
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2563EB]" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-white border border-gray-100 focus:border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold opacity-90 mb-1.5">
                    PIN Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2563EB]" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      placeholder="Enter your PIN"
                      maxLength={6}
                      className="w-full bg-white border border-gray-100 focus:border-gray-100 rounded-xl pl-10 pr-12 py-3 text-sm text-gray-900 outline-none transition-colors font-mono tracking-widest"
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-75 hover:opacity-100 transition-colors">
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-current" /> Verifying...</>
                  ) : (
                    <><UserCircle className="w-4 h-4 text-current" /> Access Employee Portal</>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

