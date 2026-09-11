import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Receipt, Loader2, Zap, ShieldCheck, Lock, User, UserCircle, Shield, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { TenantEngine } from '../lib/tenant/tenantEngine';

export default function Login() {
  const { user, login, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // After login go to requested redirect route
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/dashboard';
  const forcePrompt = params.get('prompt') === 'true';
  const isTargetingSuperAdmin = redirectTo.startsWith('/super-admin');

  const [authMode, setAuthMode] = useState<'CLIENT' | 'SUPER_ADMIN'>(() => isTargetingSuperAdmin ? 'SUPER_ADMIN' : 'CLIENT');
  const [username, setUsername] = useState(() => isTargetingSuperAdmin ? 'superadmin' : 'admin');
  const [password, setPassword] = useState(() => isTargetingSuperAdmin ? 'superadmin123' : 'admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // If user is already logged in:
  if (user && !forcePrompt) {
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin" replace />;
    }
    // If non-super admin, only auto-redirect if NOT attempting to access super admin portal
    if (!isTargetingSuperAdmin) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  const handleModeSwitch = (mode: 'CLIENT' | 'SUPER_ADMIN') => {
    setAuthMode(mode);
    setError('');
    if (mode === 'SUPER_ADMIN') {
      setUsername('superadmin');
      setPassword('superadmin123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  const performLogin = (userLoginName: string, userRole: Role = 'ADMIN', extraData?: any) => {
    const token = 'demo-live-token-' + Date.now();
    const userObj = {
      id: extraData?.id || (userRole === 'SUPER_ADMIN' ? 'user-super-admin' : 'user-admin'),
      username: userLoginName || (userRole === 'SUPER_ADMIN' ? 'superadmin' : 'admin'),
      role: userRole,
      businessId: extraData?.businessId || undefined,
      businessType: extraData?.businessType || undefined,
      applicationAccess: extraData?.applicationAccess || (userRole === 'SUPER_ADMIN' ? 'Master Super Admin (Global Platform Access)' : 'Full Access (All Modules & POS)')
    };

    if (extraData?.employeeSession) {
      localStorage.setItem('employee_session', JSON.stringify(extraData.employeeSession));
    }

    login(token, userObj as any);

    if (userRole === 'SUPER_ADMIN' || userLoginName === 'superadmin') {
      window.location.href = '/super-admin';
    } else {
      const dest = (!redirectTo || redirectTo.startsWith('/super-admin')) ? '/dashboard' : redirectTo;
      window.location.href = dest;
    }
  };

  const handleQuickSuperAdminLogin = () => {
    setAuthMode('SUPER_ADMIN');
    setUsername('superadmin');
    setPassword('superadmin123');
    setLoading(true);
    performLogin('superadmin', 'SUPER_ADMIN', {
      id: 'user-super-admin',
      applicationAccess: 'Master Super Admin (Global Platform Access)'
    });
  };

  const handleQuickClientLogin = () => {
    setAuthMode('CLIENT');
    setUsername('admin');
    setPassword('admin123');
    setLoading(true);
    performLogin('admin', 'ADMIN', {
      businessId: 'biz-apex-supermarket',
      businessType: 'SUPERMARKET'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      // 1. Check Super Admin Master Login
      if (
        authMode === 'SUPER_ADMIN' ||
        TenantEngine.verifySuperAdmin(cleanUser, cleanPass) ||
        cleanUser.toLowerCase() === 'superadmin' ||
        cleanUser.toLowerCase() === 'admin@saas.com'
      ) {
        performLogin('superadmin', 'SUPER_ADMIN', {
          id: 'user-super-admin',
          applicationAccess: 'Master Super Admin (Global Platform Access)'
        });
        return;
      }

      // 2. Default Fallback Admin Access
      if (
        cleanUser.toLowerCase() === 'admin' ||
        cleanUser.toLowerCase() === 'storeadmin' ||
        !cleanUser
      ) {
        performLogin('admin', 'ADMIN', {
          businessId: 'biz-apex-supermarket',
          businessType: 'SUPERMARKET'
        });
        return;
      }

      // 3. Check Client Tenant Admins
      const matchedTenant = TenantEngine.findTenantByLogin(cleanUser);
      if (matchedTenant) {
        if (matchedTenant.subscription?.status === 'SUSPENDED') {
          throw new Error('This client business account is currently suspended. Please contact Super Admin support.');
        }

        // Update last login
        TenantEngine.updateTenant(matchedTenant.id, { lastLoginAt: new Date().toISOString() });

        performLogin(matchedTenant.adminUsername, 'ADMIN', {
          id: `admin-${matchedTenant.id}`,
          businessId: matchedTenant.id,
          businessType: matchedTenant.businessType,
          applicationAccess: 'Full Business Admin Access'
        });
        return;
      }

      // 4. Staff List match
      const staffRaw = localStorage.getItem('universal_staff_list');
      const staffList = staffRaw ? JSON.parse(staffRaw) : [];
      const staffMatch = staffList.find(
        (s: any) =>
          (s.username?.toLowerCase() === cleanUser.toLowerCase() || s.phone === cleanUser) &&
          (s.pinCode === cleanPass || s.password === cleanPass || !cleanPass) &&
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
          employeeSession: staffMatch,
        });
        return;
      }

      // 5. Default login fallback
      performLogin(cleanUser || 'admin', 'ADMIN', {
        businessId: 'biz-apex-supermarket',
        businessType: 'SUPERMARKET'
      });

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
          Multi-Business SaaS & Billing Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-200/90 space-y-6">
          
          {/* Segmented Auth Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('CLIENT')}
              className={cn(
                "py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                authMode === 'CLIENT'
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Client Store</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('SUPER_ADMIN')}
              className={cn(
                "py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                authMode === 'SUPER_ADMIN'
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          </div>

          {authMode === 'SUPER_ADMIN' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                Super Admin Master Mode
              </p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Full platform control center: manage multiple clients, provision tenants & view SaaS analytics.
              </p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1.5">
                {authMode === 'SUPER_ADMIN' ? 'Super Admin Master Username / Email' : 'Username, Client Login or Staff Phone'}
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
                  placeholder={authMode === 'SUPER_ADMIN' ? 'superadmin or admin@saas.com' : 'e.g. admin or 9876543210'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1.5">
                Password {authMode === 'CLIENT' && 'or PIN'}
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
                  placeholder="••••••••"
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
                  "flex w-full justify-center items-center gap-2 rounded-xl text-white py-3 px-4 text-xs font-bold tracking-widest uppercase shadow-lg transition-all cursor-pointer",
                  authMode === 'SUPER_ADMIN'
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25"
                    : "bg-[#2563EB] hover:bg-[#1D4ED8] shadow-blue-500/25",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>{authMode === 'SUPER_ADMIN' ? 'Sign In as Super Admin' : 'Sign In to Dashboard'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Direct 1-Click Quick Login Buttons */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <p className="text-[10px] uppercase font-bold text-gray-400 text-center tracking-wider">Quick Testing Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickClientLogin}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Store Admin</span>
              </button>
              <button
                type="button"
                onClick={handleQuickSuperAdminLogin}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Super Admin</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
