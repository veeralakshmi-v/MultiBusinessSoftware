import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0A0A0B]">
      <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
    </div>
  );
}

/** Guard for the admin panel — redirect unauthenticated users to /login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── PUBLIC ROUTES ───────────────────────────────── */}
              {/* Landing page is the default root */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />

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
                <Route path="settings"   element={<Settings initialTab="profile" />} />
              </Route>

              {/* Catch-all → landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
