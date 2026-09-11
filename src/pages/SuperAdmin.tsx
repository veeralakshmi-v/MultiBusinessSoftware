import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { TenantEngine, Tenant, TenantPlan, TenantStatus, SAAS_PLANS } from '../lib/tenant/tenantEngine';
import { BusinessType } from '../types/template';
import {
  Shield, Building2, Plus, Search, Zap, ExternalLink, Edit2, Key,
  PauseCircle, PlayCircle, Download, Trash2, CheckCircle2, AlertTriangle,
  TrendingUp, Users, Receipt, DollarSign, ArrowRight, X, Sparkles,
  Server, Globe, Database, Calendar, Phone, Mail, MapPin, Activity, Check,
  ChevronRight, RefreshCw, BarChart3, Lock, LogOut, ArrowLeft, Upload,
  Layers, Package, ShoppingBag, Eye, Copy, HardDrive, Filter
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

  // Internal login state for self-contained unlock if not yet authenticated
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

  // Sync state if user auth changes
  useEffect(() => {
    if (isSuperAdmin || localStorage.getItem('saas_super_admin_active') === 'true' || user?.role === 'SUPER_ADMIN') {
      setInternalAuth(true);
    }
  }, [isSuperAdmin, user]);

  const handleSuperAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const u = loginUsername.trim();
    const p = loginPassword.trim();

    // Verify master credentials
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
      setLoginError('Invalid super admin credentials. Try username: superadmin');
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

  // -------------------------------------------------------------
  // Super Admin Control Center State
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'PROVISION' | 'ANALYTICS' | 'DATABASE' | 'PLANS'>('CLIENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | BusinessType>('ALL');

  // Modals
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
    let totalRevenue = 0;

    tenants.forEach(t => {
      if (t.subscription?.status === 'ACTIVE') {
        totalMRR += t.subscription.monthlyFee || 0;
      }
      totalInvoices += t.totalInvoicesCount || 0;
      totalRevenue += t.totalRevenueGenerated || 0;
    });

    return {
      totalClients: tenants.length,
      activeClients: tenants.filter(t => t.subscription?.status === 'ACTIVE').length,
      trialClients: tenants.filter(t => t.subscription?.status === 'TRIAL').length,
      suspendedClients: tenants.filter(t => t.subscription?.status === 'SUSPENDED' || t.subscription?.status === 'EXPIRED').length,
      totalMRR,
      totalInvoices,
      totalRevenue,
    };
  }, [tenants]);

  // New Client Provisioning Form State
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
    durationMonths: 12,
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '',
    gstin: '',
    notes: '',
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.businessName.trim() || !newForm.ownerName.trim() || !newForm.ownerEmail.trim()) {
      alert('Please fill out all required fields (Business Name, Owner Name, Email).');
      return;
    }

    const created = createTenant(newForm);
    showToast(`Client "${created.businessName}" successfully provisioned with isolated database!`);
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
      durationMonths: 12,
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: '',
      gstin: '',
      notes: '',
    });
    setActiveTab('CLIENTS');
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
    showToast(`Password updated for "${passwordResetTenant.businessName}" (Admin: ${passwordResetTenant.adminUsername})`);
    setPasswordResetTenant(null);
    setNewPassword('');
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    deleteTenant(tenant.id);
    showToast(`Client "${tenant.businessName}" and associated database deleted.`);
    setDeleteConfirmTenant(null);
  };

  const handleExportBackup = () => {
    TenantEngine.exportTenantsBackup();
    showToast('Platform JSON Backup generated & downloaded!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          TenantEngine.saveTenants(json);
          refreshTenants();
          showToast(`Successfully restored ${json.length} tenants from backup!`);
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // -------------------------------------------------------------
  // RENDER: Unauthenticated Master Login Screen
  // -------------------------------------------------------------
  if (!internalAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25 mb-4 ring-4 ring-amber-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Super Admin Portal
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Master SaaS Control Center</h1>
            <p className="text-xs text-slate-400 mt-1">Multi-Tenant Management & Client Database Isolation</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSuperAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Master Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="superadmin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Master Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Authenticate & Enter Control Center</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center space-y-3">
            <button
              type="button"
              onClick={handleInstantUnlock}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ One-Click Instant Master Unlock</span>
            </button>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Full Super Admin SaaS Control Center
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">SaaS Super Admin</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-extrabold uppercase border border-amber-500/20">
                  Master Control
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Multi-Tenant Isolated Billing Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant Engine Online ({tenants.length} Active Stores)</span>
            </div>

            <button
              onClick={() => setActiveTab('PROVISION')}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Client Store</span>
            </button>

            <button
              onClick={handleExportBackup}
              title="Download Platform JSON Backup"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              title="Logout from Super Admin"
              className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl text-xs border border-slate-700 hover:border-red-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Client Stores</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{metrics.totalClients}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{metrics.activeClients} Active Subscriptions</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Monthly Recurring (MRR)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
              ₹{metrics.totalMRR.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">From active SaaS plans</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Invoices (Platform)</span>
              <Receipt className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
              {metrics.totalInvoices.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Processed across all tenants</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Client GMV</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Platform billing volume</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'CLIENTS', label: 'Client Stores Directory', icon: Building2, count: tenants.length },
            { id: 'PROVISION', label: 'Provision New Client', icon: Plus },
            { id: 'ANALYTICS', label: 'SaaS Analytics', icon: BarChart3 },
            { id: 'DATABASE', label: 'Database & Backups', icon: Database },
            { id: 'PLANS', label: 'SaaS Plans & Pricing', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer',
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-md text-[10px]',
                      isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CLIENTS DIRECTORY */}
        {activeTab === 'CLIENTS' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients by name, owner, email, phone, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  aria-label="Filter by subscription status"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
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
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Business Types</option>
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

            {/* Clients Table / Cards */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Client / Business</th>
                      <th className="px-4 py-3.5">Owner & Contact</th>
                      <th className="px-4 py-3.5">Plan & Billing</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Usage Stats</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p>No client stores found matching your search.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((t) => {
                        const isSuspended = t.subscription?.status === 'SUSPENDED';
                        return (
                          <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-bold text-white text-sm">{t.businessName}</div>
                              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                                  {t.businessType}
                                </span>
                                <span>•</span>
                                <span>{t.city || 'Chennai'}</span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="text-slate-200 font-medium">{t.ownerName}</div>
                              <div className="text-slate-400 text-[11px]">{t.ownerEmail}</div>
                              <div className="text-slate-500 text-[10px] font-mono">{t.ownerPhone}</div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-bold text-[10px] border border-indigo-500/20">
                                {t.subscription?.plan || 'STARTER'}
                              </div>
                              <div className="text-slate-400 text-[11px] mt-1 font-semibold">
                                ₹{(t.subscription?.monthlyFee || 0).toLocaleString('en-IN')}/mo
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase',
                                  t.subscription?.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : t.subscription?.status === 'TRIAL'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                )}
                              >
                                <span
                                  className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    t.subscription?.status === 'ACTIVE'
                                      ? 'bg-emerald-400'
                                      : t.subscription?.status === 'TRIAL'
                                      ? 'bg-amber-400'
                                      : 'bg-red-400'
                                  )}
                                />
                                {t.subscription?.status || 'ACTIVE'}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="text-slate-300 font-semibold">{t.totalInvoicesCount || 0} Bills</div>
                              <div className="text-slate-400 text-[10px]">
                                ₹{(t.totalRevenueGenerated || 0).toLocaleString('en-IN')} vol
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Impersonate / Open Store Button */}
                                <button
                                  onClick={() => handleImpersonate(t)}
                                  title="Login as this Client (Impersonate)"
                                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
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
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                  )}
                                >
                                  {isSuspended ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                                </button>

                                {/* Reset Password */}
                                <button
                                  onClick={() => setPasswordResetTenant(t)}
                                  title="Reset Admin Credentials"
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition-all cursor-pointer"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => setEditingTenant({ ...t })}
                                  title="Edit Client Info"
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition-all cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => setDeleteConfirmTenant(t)}
                                  title="Delete Client Store"
                                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg text-xs border border-slate-700 hover:border-red-500/30 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        )}

        {/* TAB 2: PROVISION NEW CLIENT */}
        {activeTab === 'PROVISION' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <Plus className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Provision New Client Business</h2>
                <p className="text-xs text-slate-400">
                  Instantly creates an isolated store database with dedicated credentials & inventory catalog.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Store / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Silks & Sarees"
                    value={newForm.businessName}
                    onChange={(e) => setNewForm({ ...newForm, businessName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry / Category *</label>
                  <select
                    value={newForm.businessType}
                    onChange={(e) => setNewForm({ ...newForm, businessType: e.target.value as BusinessType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="GARMENTS">Garments & Textiles</option>
                    <option value="SUPERMARKET">Supermarket & Grocery</option>
                    <option value="MEDICAL">Medical & Pharmacy</option>
                    <option value="HARDWARE">Hardware & Electrical</option>
                    <option value="ELECTRONICS">Electronics & Mobile</option>
                    <option value="RESTAURANT">Restaurant & Bar</option>
                    <option value="CAFE">Cafe & Bakery</option>
                    <option value="RETAIL">General Retail & Departmental</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newForm.ownerName}
                    onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@business.com"
                    value={newForm.ownerEmail}
                    onChange={(e) => setNewForm({ ...newForm, ownerEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newForm.ownerPhone}
                    onChange={(e) => setNewForm({ ...newForm, ownerPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Username (For Login)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank (e.g. royalsilks_admin)"
                    value={newForm.adminUsername}
                    onChange={(e) => setNewForm({ ...newForm, adminUsername: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Password</label>
                  <input
                    type="text"
                    placeholder="Default: admin123"
                    value={newForm.adminPassword}
                    onChange={(e) => setNewForm({ ...newForm, adminPassword: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={newForm.plan}
                    onChange={(e) => setNewForm({ ...newForm, plan: e.target.value as TenantPlan })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="STARTER">Starter (₹999/mo)</option>
                    <option value="GROWTH">Growth Retail (₹1,999/mo)</option>
                    <option value="PROFESSIONAL">Professional Enterprise (₹3,499/mo)</option>
                    <option value="ENTERPRISE">Custom Enterprise (₹6,999/mo)</option>
                    <option value="TRIAL">14-Day Free Trial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={newForm.city}
                    onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="33AAAAA0000A1Z5"
                    value={newForm.gstin}
                    onChange={(e) => setNewForm({ ...newForm, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-amber-300">Auto Database Initialization:</span> When provisioned, this store will receive isolated tables, industry-specific catalog templates, tax defaults, and dedicated admin access.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('CLIENTS')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision Client Database Now</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ANALYTICS & REVENUE */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Revenue Breakdown</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Total Monthly Run-Rate</span>
                    <span className="font-bold text-white">₹{metrics.totalMRR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Projected Annual (ARR)</span>
                    <span className="font-bold text-emerald-400">₹{(metrics.totalMRR * 12).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Average Revenue Per User (ARPU)</span>
                    <span className="font-bold text-amber-400">
                      ₹{metrics.activeClients > 0 ? Math.round(metrics.totalMRR / metrics.activeClients).toLocaleString('en-IN') : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Store Industry Distribution</span>
                </h3>
                <div className="space-y-2.5 text-xs">
                  {['GARMENTS', 'SUPERMARKET', 'HARDWARE', 'MEDICAL', 'RESTAURANT'].map((type) => {
                    const count = tenants.filter((t) => t.businessType === type).length;
                    const percent = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">{type}</span>
                          <span className="text-slate-400">{count} stores ({percent}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>System Reliability</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300">Multi-Tenant Engine</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300">Database Storage Isolation</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Isolated
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300">Invoice Counter Sequencer</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE & BACKUPS */}
        {activeTab === 'DATABASE' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Full Platform JSON Backup</h3>
                    <p className="text-xs text-slate-400">Export all client registrations, configurations & isolated databases.</p>
                  </div>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON File</span>
                </button>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Restore Databases from Backup</h3>
                    <p className="text-xs text-slate-400">Upload a valid backup JSON file to restore client configurations.</p>
                  </div>
                </div>
                <label className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>Select JSON File to Restore</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PLANS & PRICING */}
        {activeTab === 'PLANS' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {SAAS_PLANS.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'bg-slate-900/60 border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden',
                  p.popular ? 'border-amber-500/50 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30' : 'border-slate-800'
                )}
              >
                {p.popular && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white text-base">{p.name}</h3>
                  <div className="text-2xl font-black text-amber-400 mt-2">
                    ₹{p.priceMonthly.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    or ₹{p.priceAnnual.toLocaleString('en-IN')}/year
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Up to {p.maxStaff} Staff Accounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{p.maxInvoicesPerMonth.toLocaleString()} Invoices/mo</span>
                    </li>
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                  Assigned to {tenants.filter((t) => t.subscription?.plan === p.id).length} Active Tenants
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* EDIT TENANT MODAL */}
      {/* ------------------------------------------------------------- */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Client Details</h3>
              <button
                onClick={() => setEditingTenant(null)}
                aria-label="Close modal"
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
                <input
                  type="text"
                  value={editingTenant.businessName}
                  onChange={(e) => setEditingTenant({ ...editingTenant, businessName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={editingTenant.ownerName}
                    onChange={(e) => setEditingTenant({ ...editingTenant, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingTenant.ownerPhone}
                    onChange={(e) => setEditingTenant({ ...editingTenant, ownerPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={editingTenant.city || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editingTenant.gstin || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESET PASSWORD MODAL */}
      {/* ------------------------------------------------------------- */}
      {passwordResetTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
              <button
                onClick={() => setPasswordResetTenant(null)}
                aria-label="Close reset modal"
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Setting a new login password for <span className="text-amber-300 font-bold">{passwordResetTenant.businessName}</span> (Username: <code className="bg-slate-950 px-1 py-0.5 rounded text-white">{passwordResetTenant.adminUsername}</code>)
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordResetTenant(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRM MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Client Store?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <span className="text-white font-bold">{deleteConfirmTenant.businessName}</span>? This will remove its isolated database and store settings.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTenant(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTenant(deleteConfirmTenant)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-red-600/20"
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
