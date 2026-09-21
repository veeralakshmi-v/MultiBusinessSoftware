import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy Loaded Pages
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const BillingPOS     = lazy(() => import('./pages/BillingPOS'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const Inventory      = lazy(() => import('./pages/Inventory'));
const Customers      = lazy(() => import('./pages/Customers'));
const Reports        = lazy(() => import('./pages/Reports'));
const Settings       = lazy(() => import('./pages/Settings'));
const Orders         = lazy(() => import('./pages/Orders'));
const EmployeeLogin  = lazy(() => import('./pages/EmployeeLogin'));
const EmployeePortal = lazy(() => import('./pages/EmployeePortal'));
const StaffAttendance = lazy(() => import('./pages/StaffAttendance'));
const EmployeeDirectory = lazy(() => import('./pages/EmployeeDirectory'));
const WebsiteBuilder    = lazy(() => import('./pages/WebsiteBuilder'));
const PublicStorefront  = lazy(() => import('./pages/PublicStorefront'));

function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
    </div>
  );
}

export function isRouteAllowed(user: any, pathname: string): boolean {
  if (!user) return false;
  const role = user.role || 'STAFF';
  if (role === 'ADMIN' || user.username === 'admin') return true;
  if (pathname.startsWith('/dashboard/attendance')) return true;

  const appAccess = user.applicationAccess;
  if (appAccess && typeof appAccess === 'string' && appAccess.trim().length > 0) {
    if (appAccess.includes('Full Access') || appAccess.includes('ALL_MODULES') || appAccess.includes('All Modules')) {
      return true;
    }
    if (appAccess.includes('No Access')) {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/attendance');
    }

    const routeMenuMap: Record<string, string[]> = {
      '/dashboard': ['Dashboard'],
      '/dashboard/billing': ['Billing POS', 'POS'],
      '/dashboard/items': ['Categories & Items', 'Products & Inventory', 'Catalog', 'Menu'],
      '/dashboard/menu': ['Categories & Items', 'Products & Inventory', 'Catalog', 'Menu'],
      '/dashboard/inventory': ['Inventory', 'Products & Inventory', 'Categories & Items'],
      '/dashboard/reports': ['Sales Reports', 'Reports'],
      '/dashboard/employees': ['Employee Details', 'Staff'],
      '/dashboard/attendance': ['Staff Attendance', 'Attendance'],
      '/dashboard/customers': ['Customers', 'CRM'],
      '/dashboard/settings': ['Settings'],
      '/dashboard/website': ['My Website'],
    };

    const allowedItems = appAccess.split(',').map(s => s.trim().toLowerCase());
    for (const [route, names] of Object.entries(routeMenuMap)) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        return names.some(name => allowedItems.includes(name.toLowerCase()));
      }
    }
    return false;
  }

  if (role === 'MANAGER') {
    return !pathname.startsWith('/dashboard/settings') && !pathname.startsWith('/dashboard/employees');
  }

  if (role === 'CASHIER') {
    return pathname.startsWith('/dashboard/billing') || pathname.startsWith('/dashboard/customers') || pathname.startsWith('/dashboard/attendance') || pathname === '/dashboard';
  }

  return pathname === '/dashboard' || pathname.startsWith('/dashboard/attendance');
}

/** Guard for the admin & employee dashboard — permits admins and authorized employees */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;

  // Resolve user either from AuthContext or from active employee session
  let activeUser = user;
  if (!activeUser) {
    const empSaved = localStorage.getItem('employee_session');
    if (empSaved) {
      try {
        const emp = JSON.parse(empSaved);
        if (emp && emp.id) {
          activeUser = emp;
        }
      } catch {}
    }
  }

  if (!activeUser) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  if (!isRouteAllowed(activeUser, location.pathname)) {
    return <Navigate to="/employee" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── PUBLIC ROUTES ───────────────────────────────── */}
              {/* Landing page is the default root */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/store" element={<PublicStorefront />} />
              <Route path="/store/:storeSlug" element={<PublicStorefront />} />
              <Route path="/website" element={<PublicStorefront />} />
              <Route path="/website/:storeSlug" element={<PublicStorefront />} />

              {/* ── EMPLOYEE ROUTES ─────────────────────────────── */}
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route path="/employee" element={<EmployeePortal />} />

              {/* ── PROTECTED ADMIN PANEL ───────────────────────── */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="billing"    element={<BillingPOS />} />
                <Route path="items"      element={<Inventory />} />
                <Route path="menu"       element={<Inventory />} />
                <Route path="inventory"  element={<Inventory />} />
                <Route path="reports"    element={<Reports />} />
                <Route path="customers"  element={<Customers />} />
                <Route path="orders"     element={<Orders />} />
                <Route path="employees"  element={<EmployeeDirectory />} />
                <Route path="attendance" element={<StaffAttendance />} />
                <Route path="settings"   element={<Settings />} />
                <Route path="website"    element={<WebsiteBuilder />} />
              </Route>

              {/* ── TOP-LEVEL ADMIN SHORTCUTS & REDIRECTS ──────── */}
              <Route path="/billing" element={<Navigate to="/dashboard/billing" replace />} />
              <Route path="/inventory" element={<Navigate to="/dashboard/inventory" replace />} />
              <Route path="/items" element={<Navigate to="/dashboard/inventory" replace />} />
              <Route path="/menu" element={<Navigate to="/dashboard/inventory" replace />} />
              <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
              <Route path="/customers" element={<Navigate to="/dashboard/customers" replace />} />
              <Route path="/orders" element={<Navigate to="/dashboard/orders" replace />} />
              <Route path="/employees" element={<Navigate to="/dashboard/employees" replace />} />
              <Route path="/attendance" element={<Navigate to="/dashboard/attendance" replace />} />
              <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

              {/* ── DYNAMIC STOREFRONT BY STORE NAME (https://domain/:storeSlug) ── */}
              <Route path="/:storeSlug" element={<PublicStorefront />} />

              {/* Catch-all → landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
