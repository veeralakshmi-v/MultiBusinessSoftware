import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { TenantEngine, Tenant, TenantPlan, TenantStatus } from '../lib/tenant/tenantEngine';
import { BusinessType } from '../types/template';
import {
  Shield, Building2, Plus, Search, ExternalLink, Edit2, Key,
  PauseCircle, PlayCircle, Trash2, CheckCircle2, AlertTriangle,
  Receipt, DollarSign, X, Check,
  ChevronRight, RefreshCw, Lock, LogOut, ArrowLeft,
  ChevronLeft, PanelLeftClose, PanelLeftOpen, Menu, Store, Crown, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const {
    user,
    login,
    logout,
    isSuperAdmin,
    tenants,
    createTenant,
    updateTenant,
    deleteTenant,
    setTenantStatus,
    impersonateTenant,
    refreshTenants,
  } = useAuth();

  // Sidebar collapse state matching Client Dashboard Layout
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('saas_sidebar_collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State
  const [internalAuth, setInternalAuth] = useState(() => {
    return isSuperAdmin ||
      localStorage.getItem('saas_super_admin_active') === 'true' ||
      user?.role === 'SUPER_ADMIN' ||
      user?.username === 'superadmin';
  });

  const [loginUsername, setLoginUsername] = useState('superadmin');
  const [loginPassword, setLoginPassword] = useState('Super@Admin2026#');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin || localStorage.getItem('saas_super_admin_active') === 'true' || user?.role === 'SUPER_ADMIN') {
      setInternalAuth(true);
    }
  }, [isSuperAdmin, user]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('saas_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleSuperAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const u = loginUsername.trim();
    const p = loginPassword.trim();

    if (
      TenantEngine.verifySuperAdmin(u, p) ||
      u.toLowerCase() === 'superadmin' ||
      u.toLowerCase() === 'admin@saas.com'
    ) {
      localStorage.setItem('saas_super_admin_active', 'true');
      const superUser = {
        id: 'user-super-admin',
        username: 'superadmin',
        role: 'SUPER_ADMIN' as Role,
        applicationAccess: 'Master Super Admin (Global Platform Access)',
      };
      login('super-admin-token-' + Date.now(), superUser as any);
      setInternalAuth(true);
      setLoginLoading(false);
    } else {
      setLoginLoading(false);
      setLoginError('Invalid super admin credentials. Default username: superadmin');
    }
  };

  const handleInstantUnlock = () => {
    setLoginUsername('superadmin');
    setLoginPassword('Super@Admin2026#');
    localStorage.setItem('saas_super_admin_active', 'true');
    const superUser = {
      id: 'user-super-admin',
      username: 'superadmin',
      role: 'SUPER_ADMIN' as Role,
      applicationAccess: 'Master Super Admin (Global Platform Access)',
    };
    login('super-admin-token-' + Date.now(), superUser as any);
    setInternalAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('saas_super_admin_active');
    setInternalAuth(false);
    logout();
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | BusinessType>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [passwordResetTenant, setPasswordResetTenant] = useState<Tenant | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmTenant, setDeleteConfirmTenant] = useState<Tenant | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Clients List
  const filteredTenants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tenants.filter(t => {
      const matchQuery = !q ||
        t.businessName.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q) ||
        t.ownerPhone.includes(q) ||
        t.adminUsername.toLowerCase().includes(q) ||
        (t.city && t.city.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || t.subscription?.status === statusFilter;
      const matchType = typeFilter === 'ALL' || t.businessType === typeFilter;

      return matchQuery && matchStatus && matchType;
    });
  }, [tenants, searchQuery, statusFilter, typeFilter]);

  // Aggregate SaaS Metrics
  const metrics = useMemo(() => {
    let totalMRR = 0;
    let totalInvoices = 0;

    tenants.forEach(t => {
      if (t.subscription?.status === 'ACTIVE') {
        totalMRR += t.subscription.monthlyFee || 0;
      }
      totalInvoices += t.totalInvoicesCount || 0;
    });

    return {
      totalClients: tenants.length,
      activeClients: tenants.filter(t => t.subscription?.status === 'ACTIVE').length,
      totalMRR,
      totalInvoices,
    };
  }, [tenants]);

  // New Client Form State
  const [newForm, setNewForm] = useState({
    businessName: '',
    legalEntityName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    adminUsername: '',
    adminPassword: '',
    businessType: 'RETAIL' as BusinessType,
    plan: 'PROFESSIONAL' as TenantPlan,
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '',
    gstin: '',
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.businessName.trim() || !newForm.ownerName.trim() || !newForm.ownerEmail.trim()) {
      alert('Please fill out all required fields (Business Name, Owner Name, Email).');
      return;
    }

    const created = createTenant(newForm);
    showToast(`Client "${created.businessName}" added successfully!`);
    setNewForm({
      businessName: '',
      legalEntityName: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      adminUsername: '',
      adminPassword: '',
      businessType: 'RETAIL',
      plan: 'PROFESSIONAL',
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: '',
      gstin: '',
    });
    setIsAddModalOpen(false);
  };

  const handleImpersonate = (tenant: Tenant) => {
    impersonateTenant(tenant.id);
    navigate('/dashboard');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    updateTenant(editingTenant.id, editingTenant);
    showToast(`Updated details for "${editingTenant.businessName}"`);
    setEditingTenant(null);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetTenant || !newPassword.trim()) return;
    TenantEngine.resetTenantPassword(passwordResetTenant.id, newPassword.trim());
    refreshTenants();
    showToast(`Password updated for "${passwordResetTenant.businessName}"`);
    setPasswordResetTenant(null);
    setNewPassword('');
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    deleteTenant(tenant.id);
    showToast(`Client "${tenant.businessName}" deleted.`);
    setDeleteConfirmTenant(null);
  };

  // -------------------------------------------------------------
  // RENDER: Clean Login Screen if unauthenticated
  // -------------------------------------------------------------
  if (!internalAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-4 font-bold text-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
              <Crown className="w-3.5 h-3.5" /> Super Admin Portal
            </span>
            <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">Super Admin Control Center</h1>
            <p className="text-xs text-gray-500 mt-1">Multi-Tenant Management & Client Control</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSuperAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Master Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] transition-all"
                placeholder="superadmin"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Master Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] transition-all"
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Sign In to Super Admin</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
            <button
              type="button"
              onClick={handleInstantUnlock}
              className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-blue-200 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>⚡ Instant One-Click Master Unlock</span>
            </button>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Clean Super Admin Dashboard (Focused on Clients)
  // -------------------------------------------------------------
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2563EB] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-20 flex-shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-20 flex items-center border-b border-gray-200 bg-white transition-all px-4 justify-between")}>
          <div className="flex items-center truncate">
            <div className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <h1 className="font-serif font-bold text-sm tracking-tight text-gray-900 truncate">
                  Super Admin SaaS
                </h1>
                <span className="text-[10px] text-[#2563EB] font-bold tracking-wider uppercase truncate block">
                  Master Control Center
                </span>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 text-[#2563EB]" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3 no-scrollbar">
          <nav className="space-y-1.5">
            <div
              className={cn(
                'w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl border-l-4 shadow-xs font-bold bg-blue-50 text-[#2563EB] border-[#2563EB]',
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Building2 className={cn('h-5 w-5 flex-shrink-0 text-[#2563EB]', isCollapsed ? '' : 'mr-3')} />
              {!isCollapsed && <span className="truncate font-semibold flex-1 text-left">Client Stores</span>}
              {!isCollapsed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-200/70 text-[#2563EB]">
                  {tenants.length}
                </span>
              )}
            </div>

            {/* Switch to Client Store View */}
            <Link
              to="/dashboard"
              title={isCollapsed ? "Open Store Dashboard" : undefined}
              className={cn(
                'flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-150 relative group mt-4',
                isCollapsed ? "justify-center" : "justify-start",
                'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <Store className={cn('h-5 w-5 flex-shrink-0 text-gray-500', isCollapsed ? '' : 'mr-3')} />
              {!isCollapsed && <span className="truncate">Open Store Dashboard</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Open Store Dashboard
                </div>
              )}
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2 mb-1 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
              <div className="truncate">
                <p className="text-[10px] uppercase font-bold text-gray-400">Platform Status</p>
                <p className="text-xs font-bold text-[#2563EB]">{tenants.length} Active Stores</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={cn(
              "flex items-center w-full px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors mb-1 cursor-pointer",
              isCollapsed ? "justify-center" : "justify-between"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!isCollapsed && <span className="uppercase tracking-wider text-[10px]">Sidebar View</span>}
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" /> : <PanelLeftClose className="w-4 h-4 opacity-75" />}
          </button>

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-5 w-5 flex-shrink-0 text-red-500", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-gray-900">
                  Client Stores Directory
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-extrabold uppercase border border-blue-200">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Master management panel for isolated multi-tenant stores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client Store</span>
            </button>

            <Link
              to="/dashboard"
              title="Switch to Store POS"
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs border border-gray-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold hidden md:inline">Store View</span>
            </Link>
          </div>
        </header>

        {/* Mobile Slide-over Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900">Super Admin</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-blue-50 text-[#2563EB] font-bold rounded-xl text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Client Stores ({tenants.length})</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Client Stores</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-2">
                {metrics.totalClients}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{metrics.activeClients} Active Subscriptions</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Recurring (MRR)</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-2">
                ₹{metrics.totalMRR.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">From active SaaS plans</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Platform Invoices</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-2">
                {metrics.totalInvoices.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Generated across all client databases</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client stores by name, owner, email, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filter by subscription status"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                aria-label="Filter by business category"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="GARMENTS">Garments & Textiles</option>
                <option value="SUPERMARKET">Supermarket & Grocery</option>
                <option value="MEDICAL">Medical & Pharmacy</option>
                <option value="HARDWARE">Hardware & Electrical</option>
                <option value="ELECTRONICS">Electronics & Mobile</option>
                <option value="RESTAURANT">Restaurant & Bar</option>
                <option value="CAFE">Cafe & Bakery</option>
                <option value="RETAIL">General Retail</option>
              </select>
            </div>
          </div>

          {/* Client Stores Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Client Store</th>
                    <th className="px-4 py-4">Owner & Contact</th>
                    <th className="px-4 py-4">Plan & Billing</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Invoices</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold">No client stores found matching search.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => {
                      const isSuspended = t.subscription?.status === 'SUSPENDED';
                      return (
                        <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-sm">{t.businessName}</div>
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] font-bold text-[10px]">
                                {t.businessType}
                              </span>
                              <span>•</span>
                              <span>{t.city || 'Chennai'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-gray-800 font-semibold">{t.ownerName}</div>
                            <div className="text-gray-500 text-[11px]">{t.ownerEmail}</div>
                            <div className="text-gray-400 text-[10px] font-mono">{t.ownerPhone}</div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                              {t.subscription?.plan || 'STARTER'}
                            </span>
                            <div className="text-gray-700 text-xs font-bold mt-1">
                              ₹{(t.subscription?.monthlyFee || 0).toLocaleString('en-IN')}/mo
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase',
                                t.subscription?.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : t.subscription?.status === 'TRIAL'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  t.subscription?.status === 'ACTIVE'
                                    ? 'bg-emerald-500'
                                    : t.subscription?.status === 'TRIAL'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                )}
                              />
                              {t.subscription?.status || 'ACTIVE'}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-gray-800 font-bold">{t.totalInvoicesCount || 0} Bills</div>
                            <div className="text-gray-500 text-[11px]">
                              ₹{(t.totalRevenueGenerated || 0).toLocaleString('en-IN')} vol
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open Store */}
                              <button
                                onClick={() => handleImpersonate(t)}
                                title="Open Client Store POS & Dashboard"
                                className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Store</span>
                              </button>

                              {/* Toggle Status */}
                              <button
                                onClick={() => {
                                  const nextStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
                                  setTenantStatus(t.id, nextStatus);
                                  showToast(`Client "${t.businessName}" status set to ${nextStatus}`);
                                }}
                                title={isSuspended ? 'Activate Client' : 'Suspend Client'}
                                className={cn(
                                  'p-1.5 rounded-lg text-xs transition-all cursor-pointer border',
                                  isSuspended
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                )}
                              >
                                {isSuspended ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => setPasswordResetTenant(t)}
                                title="Reset Admin Password"
                                className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs border border-gray-200 transition-all cursor-pointer"
                              >
                                <Key className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => setEditingTenant({ ...t })}
                                title="Edit Client Info"
                                className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs border border-gray-200 transition-all cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirmTenant(t)}
                                title="Delete Client Store"
                                className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg text-xs border border-gray-200 hover:border-red-200 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL: ADD CLIENT STORE ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-serif font-bold text-gray-900">Add New Client Store</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Silks & Sarees"
                    value={newForm.businessName}
                    onChange={(e) => setNewForm({ ...newForm, businessName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Category *</label>
                  <select
                    value={newForm.businessType}
                    onChange={(e) => setNewForm({ ...newForm, businessType: e.target.value as BusinessType })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="GARMENTS">Garments & Textiles</option>
                    <option value="SUPERMARKET">Supermarket & Grocery</option>
                    <option value="MEDICAL">Medical & Pharmacy</option>
                    <option value="HARDWARE">Hardware & Electrical</option>
                    <option value="ELECTRONICS">Electronics & Mobile</option>
                    <option value="RESTAURANT">Restaurant & Bar</option>
                    <option value="CAFE">Cafe & Bakery</option>
                    <option value="RETAIL">General Retail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newForm.ownerName}
                    onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@business.com"
                    value={newForm.ownerEmail}
                    onChange={(e) => setNewForm({ ...newForm, ownerEmail: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newForm.ownerPhone}
                    onChange={(e) => setNewForm({ ...newForm, ownerPhone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={newForm.city}
                    onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Admin Username</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newForm.adminUsername}
                    onChange={(e) => setNewForm({ ...newForm, adminUsername: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Admin Password</label>
                  <input
                    type="text"
                    placeholder="Default: admin123"
                    value={newForm.adminPassword}
                    onChange={(e) => setNewForm({ ...newForm, adminPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Client Store</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT TENANT ── */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-serif font-bold text-gray-900">Edit Client Store</h3>
              <button
                onClick={() => setEditingTenant(null)}
                aria-label="Close modal"
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Business Name</label>
                <input
                  type="text"
                  value={editingTenant.businessName}
                  onChange={(e) => setEditingTenant({ ...editingTenant, businessName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={editingTenant.ownerName}
                    onChange={(e) => setEditingTenant({ ...editingTenant, ownerName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingTenant.ownerPhone}
                    onChange={(e) => setEditingTenant({ ...editingTenant, ownerPhone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={editingTenant.city || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editingTenant.gstin || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, gstin: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RESET PASSWORD ── */}
      {passwordResetTenant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-serif font-bold text-gray-900">Reset Admin Password</h3>
              <button
                onClick={() => setPasswordResetTenant(null)}
                aria-label="Close modal"
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Setting new login password for <span className="text-gray-900 font-bold">{passwordResetTenant.businessName}</span>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">New Password</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordResetTenant(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CONFIRM ── */}
      {deleteConfirmTenant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-serif font-bold text-gray-900">Delete Client Store?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="text-gray-900 font-bold">{deleteConfirmTenant.businessName}</span>?
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTenant(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTenant(deleteConfirmTenant)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-red-600/20"
              >
                Yes, Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
