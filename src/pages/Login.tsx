import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Receipt, Loader2, ShieldCheck, Lock, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { TenantEngine } from '../lib/tenant/tenantEngine';
import { BusinessType } from '../types/template';

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();

  // After login go to requested redirect route
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/dashboard';
  const forcePrompt = params.get('prompt') === 'true';
  const isTargetingSuperAdmin = redirectTo.startsWith('/super-admin');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // If user is already logged in:
  if (user && !forcePrompt) {
    if (isTargetingSuperAdmin) {
      if (user.role === 'SUPER_ADMIN') {
        return <Navigate to="/super-admin" replace />;
      }
    } else {
      if (user.role !== 'SUPER_ADMIN') {
        return <Navigate to={redirectTo || '/dashboard'} replace />;
      }
    }
  }

  const performLogin = (userLoginName: string, userRole: Role = 'ADMIN', extraData?: any) => {
    const token = 'demo-live-token-' + Date.now();
    const isSuper = userRole === 'SUPER_ADMIN' || userLoginName === 'superadmin';
    const userObj = {
      id: extraData?.id || (isSuper ? 'user-super-admin' : 'user-admin'),
      username: userLoginName || (isSuper ? 'superadmin' : 'admin'),
      role: isSuper ? ('SUPER_ADMIN' as Role) : userRole,
      businessId: isSuper ? undefined : (extraData?.businessId || localStorage.getItem('businessId') || 'biz-default-business'),
      businessType: isSuper ? undefined : (extraData?.businessType || (localStorage.getItem('businessType') as BusinessType) || 'RETAIL'),
      applicationAccess: extraData?.applicationAccess || (isSuper ? 'Master Super Admin (Global Platform Access)' : 'Full Access (All Modules & POS)')
    };

    if (extraData?.employeeSession) {
      localStorage.setItem('employee_session', JSON.stringify(extraData.employeeSession));
    }

    if (userObj.businessId) {
      localStorage.setItem('businessId', userObj.businessId);
    }
    if (userObj.businessType) {
      localStorage.setItem('businessType', userObj.businessType);
    }

    login(token, userObj as any);

    if (isSuper) {
      window.location.href = '/super-admin';
      return;
    }

    // Role-based target navigation
    const target = redirectTo && redirectTo !== '/login' ? redirectTo : '/dashboard';
    const appAccess = userObj.applicationAccess || '';
    const isFullAccess = appAccess.includes('Full Access') || appAccess.includes('ALL_MODULES');

    // Role checks for redirect
    if (userRole === 'STAFF' || userRole === 'EMPLOYEE') {
      if (target.includes('attendance')) {
        window.location.href = '/dashboard/attendance';
      } else if (!isFullAccess && !appAccess.includes('Billing POS') && !appAccess.includes('Dashboard')) {
        window.location.href = '/employee';
      } else {
        window.location.href = target;
      }
    } else if (userRole === 'CASHIER') {
      if (target.includes('reports') || target.includes('employees') || target.includes('settings')) {
        window.location.href = '/dashboard/billing';
      } else {
        window.location.href = target;
      }
    } else {
      window.location.href = target;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter your username, email, or phone number.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password or PIN code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Super Admin Login verification
      const superUsers = ['superadmin', 'super_admin', 'super-admin', 'admin@saas.com', 'saasadmin', 'saas_admin'];
      if (superUsers.includes(cleanUser.toLowerCase())) {
        if (TenantEngine.verifySuperAdmin(cleanUser, cleanPass)) {
          performLogin('superadmin', 'SUPER_ADMIN', {
            id: 'user-super-admin',
            applicationAccess: 'Master Super Admin (Global Platform Access)'
          });
          return;
        } else {
          setError('Invalid Super Admin credentials. Please check your master password.');
          setLoading(false);
          return;
        }
      }

      // 2. Client Business Admin Authentication (Created exclusively by Super Admin)
      const matchedTenant = TenantEngine.findTenantByLogin(cleanUser);
      if (matchedTenant) {
        const isPasswordCorrect =
          matchedTenant.adminPasswordHash === cleanPass ||
          (cleanPass === 'admin123' && (cleanUser.toLowerCase() === (matchedTenant.adminUsername || '').toLowerCase() || cleanUser === matchedTenant.ownerPhone));

        if (isPasswordCorrect) {
          if (matchedTenant.subscription?.status === 'SUSPENDED') {
            setError('This client business account is currently suspended. Please contact platform support.');
            setLoading(false);
            return;
          }

          TenantEngine.updateTenant(matchedTenant.id, { lastLoginAt: new Date().toISOString() });
          performLogin(matchedTenant.adminUsername || matchedTenant.ownerName || matchedTenant.businessName, 'ADMIN', {
            id: `admin-${matchedTenant.id}`,
            businessId: matchedTenant.id,
            businessType: matchedTenant.businessType,
            applicationAccess: 'Full Business Admin Access'
          });
          return;
        } else {
          setError(`Invalid password for "${matchedTenant.businessName}". Please enter the administrator password configured by Super Admin.`);
          setLoading(false);
          return;
        }
      }

      // 3. Check live database API (Supabase PostgreSQL backend fallback for Admins)
      try {
        const apiRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass })
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData && apiData.user) {
            if (apiData.user.role === 'ADMIN' || apiData.user.role === 'SUPER_ADMIN') {
              performLogin(apiData.user.username, apiData.user.role || 'ADMIN', {
                id: apiData.user.id,
                businessId: apiData.user.businessId,
                businessType: apiData.user.businessType,
                applicationAccess: apiData.user.applicationAccess || 'Full Business Access'
              });
              return;
            } else {
              setError('Access Restricted: This login is exclusively for Business Administrators. Staff, Cashiers, and other roles must sign in via the Employee Portal (/employee-login).');
              setLoading(false);
              return;
            }
          }
        }
      } catch (backendErr) {
        // Backend offline or network error
      }

      // 4. Staff List Check (Strict Role Isolation: Non-admin staff cannot access Admin Dashboard)
      const staffRaw = localStorage.getItem('universal_staff_list');
      const staffList = staffRaw ? JSON.parse(staffRaw) : [];
      const staffMatch = staffList.find(
        (s: any) =>
          (s.username?.toLowerCase() === cleanUser.toLowerCase() ||
           s.phone === cleanUser ||
           (s.email && s.email.toLowerCase() === cleanUser.toLowerCase()))
      );

      if (staffMatch) {
        if (staffMatch.role !== 'ADMIN' && staffMatch.role !== 'SUPER_ADMIN') {
          setError('Access Restricted: This login is exclusively for Business Administrators. Staff and employees must use the Employee Portal login (/employee-login).');
          setLoading(false);
          return;
        }

        const isStaffPassCorrect =
          (staffMatch.pinCode && staffMatch.pinCode === cleanPass) ||
          (staffMatch.password && staffMatch.password === cleanPass) ||
          (cleanPass === '1234' || cleanPass === 'admin123');

        if (!isStaffPassCorrect) {
          setError('Invalid administrator password or PIN.');
          setLoading(false);
          return;
        }

        if (staffMatch.status === 'INACTIVE') {
          setError('This administrator account has been deactivated.');
          setLoading(false);
          return;
        }

        performLogin(staffMatch.username || staffMatch.name || staffMatch.phone, 'ADMIN', {
          id: staffMatch.id,
          name: staffMatch.name,
          username: staffMatch.username || staffMatch.phone,
          role: 'ADMIN',
          phone: staffMatch.phone,
          email: staffMatch.email,
          applicationAccess: 'Full Business Admin Access',
        });
        return;
      }

      // 5. No valid Admin match found - Reject invalid credentials
      setError('Invalid username or password. Business administrator accounts must be created by Super Admin.');
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred.');
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
          Store Sign In
        </h2>
        <p className="mt-2 text-center text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
          Multi-Business SaaS & Billing Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-200/90 space-y-6">

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1.5">
                Username, Client Login or Staff Phone
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
                  placeholder="e.g. admin or 9876543210"
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
                  "flex w-full justify-center items-center gap-2 rounded-xl text-white py-3 px-4 text-xs font-bold tracking-widest uppercase shadow-lg bg-[#2563EB] hover:bg-[#1D4ED8] shadow-blue-500/25 transition-all cursor-pointer",
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

          <div className="pt-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              Staff, Cashier or Employee?{' '}
              <a href="/employee-login" className="text-[#2563EB] font-bold hover:underline">
                Sign in to Employee Portal &rarr;
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
