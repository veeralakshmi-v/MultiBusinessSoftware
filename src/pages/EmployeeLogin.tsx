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
    if (!username.trim()) { setError('Please enter your employee ID or username.'); return; }
    if (!pin.trim()) { setError('Please enter your PIN.'); return; }

    setLoading(true);

    // Verify against saved staff list
    const staffRaw = localStorage.getItem('universal_staff_list');
    const staffList = staffRaw ? JSON.parse(staffRaw) : [];
    const match = staffList.find(
      (s: { username: string; pinCode: string; status: string }) =>
        s.username.toLowerCase() === username.trim().toLowerCase() &&
        s.pinCode === pin.trim() &&
        s.status === 'ACTIVE'
    );

    setTimeout(() => {
      setLoading(false);
      if (match) {
        // Store employee session & sync auth context
        const sessionObj = {
          id: match.id,
          name: match.name,
          username: match.username || match.phone,
          role: match.role,
          phone: match.phone,
          email: match.email,
          applicationAccess: match.applicationAccess || 'Full Access (All Modules & POS)',
        };
        localStorage.setItem('employee_session', JSON.stringify(sessionObj));

        login('demo-live-token-' + match.id, {
          id: match.id,
          username: match.username || match.phone,
          role: match.role,
          applicationAccess: match.applicationAccess || 'Full Access (All Modules & POS)',
        });

        navigate('/employee');
      } else {
        setError('Invalid employee ID or PIN. Please try again.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-theme-primary text-theme-primary font-sans flex flex-col relative overflow-hidden">

      {/* Top bar */}
      <header className="px-6 py-4 flex items-center border-b border-theme-secondary/20 bg-theme-surface backdrop-blur-xl z-10 relative">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs nav-item-hover px-3 py-1.5 rounded-xl transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-theme-accent" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-theme-surface border border-theme-secondary/30 rounded-3xl shadow-2xl overflow-hidden">

            {/* Top accent */}
            <div className="h-1.5 btn-theme-secondary" />

            <div className="p-8">
              {/* Icon + Title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl btn-theme-secondary flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/20">
                  <UserCircle className="w-8 h-8 text-current" />
                </div>
                <h1 className="text-xl font-bold text-theme-primary tracking-tight">Employee Login</h1>
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
                    <div key={f.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-theme-card border border-theme-secondary/20">
                      <Icon className="w-4 h-4 text-theme-accent" />
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
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-accent" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-theme-surface border border-theme-secondary/30 focus:border-theme-secondary rounded-xl pl-10 pr-4 py-3 text-sm text-theme-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold opacity-90 mb-1.5">
                    PIN Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-accent" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      placeholder="Enter your PIN"
                      maxLength={6}
                      className="w-full bg-theme-surface border border-theme-secondary/30 focus:border-theme-secondary rounded-xl pl-10 pr-12 py-3 text-sm text-theme-primary outline-none transition-colors font-mono tracking-widest"
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
                  className="w-full py-3.5 btn-theme-secondary font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg"
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

