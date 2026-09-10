import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Receipt, Loader2, Zap, ShieldCheck, Lock, User, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // After login go to requested redirect route
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/dashboard';
  const forcePrompt = params.get('prompt') === 'true';

  if (user && !forcePrompt) {
    return <Navigate to={redirectTo} replace />;
  }

  const performLogin = (userLoginName: string, userRole: Role = 'ADMIN', extraData?: any) => {
    const token = 'demo-live-token-' + Date.now();
    const userObj = {
      id: extraData?.id || 'user-admin',
      username: userLoginName || 'admin',
      role: userRole,
      applicationAccess: extraData?.applicationAccess || 'Full Access (All Modules & POS)'
    };

    if (extraData) {
      localStorage.setItem('employee_session', JSON.stringify(extraData));
    }

    login(token, userObj as any);
    navigate(redirectTo, { replace: true });
  };

  const handleQuickDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      performLogin('admin', 'ADMIN');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanUser = username.trim() || 'admin';
      const cleanPass = password.trim() || 'admin123';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data && data.token && data.user) {
              login(data.token, data.user);
              navigate(redirectTo, { replace: true });
              return;
            }
          }
        }
      } catch (e) {}

      // Staff List match
      const staffRaw = localStorage.getItem('universal_staff_list');
      const staffList = staffRaw ? JSON.parse(staffRaw) : [];
      const staffMatch = staffList.find(
        (s: any) =>
          (s.username?.toLowerCase() === cleanUser.toLowerCase() || s.phone === cleanUser) &&
          (s.pinCode === cleanPass || s.password === cleanPass) &&
          s.status === 'ACTIVE'
      );

      if (staffMatch) {
        performLogin(staffMatch.username || staffMatch.name || staffMatch.phone, staffMatch.role, {
          id: staffMatch.id,
          name: staffMatch.name,
          username: staffMatch.username || staffMatch.phone,
          role: staffMatch.role,
          phone: staffMatch.phone,
          email: staffMatch.email,
          applicationAccess: staffMatch.applicationAccess || 'Full Access (All Modules & POS)',
        });
        return;
      }

      // Default Admin Access
      performLogin(cleanUser, 'ADMIN');

    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/50 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
            <Receipt className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-black tracking-tight text-[#0F172A]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
          Multi-Business Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-200/90 space-y-6">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1.5">
                Username or Staff Phone
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2563EB]" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50/60 pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1.5">
                Password or PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2563EB]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50/60 pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  placeholder="e.g. admin123"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB]"
                />
                <label htmlFor="remember-me" className="text-gray-600 font-medium cursor-pointer">
                  Remember me
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex w-full justify-center items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-4 text-xs font-bold tracking-widest uppercase shadow-lg shadow-blue-500/25 transition-all cursor-pointer",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

