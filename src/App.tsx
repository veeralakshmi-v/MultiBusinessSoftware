import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import SuperAdminImpersonationBanner from './components/SuperAdminImpersonationBanner';
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
const SuperAdmin        = lazy(() => import('./pages/SuperAdmin'));

function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
    </div>
  );
}

/** Guard for the admin panel — only users with valid Admin / Super Admin credentials can access the Admin Dashboard */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!user) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  const isSuperOrAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.username === 'superadmin';
  if (!isSuperOrAdmin) {
    // Attendance module is accessible to all roles
    if (location.pathname.startsWith('/dashboard/attendance')) {
      return <>{children}</>;
    }
    // Non-admin roles are restricted to their employee portal
    return <Navigate to="/employee" replace />;
  }

  return <>{children}</>;
}

/** Guard for the Super Admin Control Center */
function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SuperAdminImpersonationBanner />
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

              {/* ── SUPER ADMIN SAAS CONTROL CENTER ─────────────── */}
              <Route
                path="/super-admin"
                element={
                  <SuperAdminRoute>
                    <SuperAdmin />
                  </SuperAdminRoute>
                }
              />

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
