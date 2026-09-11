import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tenant, TenantPlan, TenantStatus, SAAS_PLANS } from '../lib/tenant/tenantEngine';
import { BusinessType } from '../types/template';
import {
  Building2, Plus, Search, Shield, Zap, ExternalLink, Edit2, Key,
  PauseCircle, PlayCircle, Download, Trash2, CheckCircle2, AlertTriangle,
  TrendingUp, Users, Receipt, DollarSign, ArrowRight, X, Sparkles,
  Server, Globe, Database, Calendar, Phone, Mail, MapPin, Activity, Check,
  ChevronRight, RefreshCw, BarChart3, Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const {
    user,
    tenants,
    createTenant,
    updateTenant,
    deleteTenant,
    setTenantStatus,
    impersonateTenant,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'PROVISION' | 'ANALYTICS' | 'PLANS' | 'AUDIT'>('CLIENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | BusinessType>('ALL');

  // Modals
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [passwordResetTenant, setPasswordResetTenant] = useState<Tenant | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
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

      const matchStatus = statusFilter === 'ALL' || t.subscription.status === statusFilter;
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
      if (t.subscription.status === 'ACTIVE') {
        totalMRR += t.subscription.monthlyFee || 0;
      }
      totalInvoices += t.totalInvoicesCount || 0;
      totalRevenue += t.totalRevenueGenerated || 0;
    });

    return {
      totalClients: tenants.length,
      activeClients: tenants.filter(t => t.subscription.status === 'ACTIVE').length,
      trialClients: tenants.filter(t => t.subscription.status === 'TRIAL').length,
      suspendedClients: tenants.filter(t => t.subscription.status === 'SUSPENDED' || t.subscription.status === 'EXPIRED').length,
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
      alert('Please fill out all required fields.');
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

  const handleLoginAsClient = (tenant: Tenant) => {
    impersonateTenant(tenant.id);
    navigate('/dashboard');
  };

  const handleExportData = (tenant: Tenant) => {
    try {
      const prefix = `tenant_${tenant.id}_`;
      const data: Record<string, any> = {
        tenantMetadata: tenant,
        exportedAt: new Date().toISOString(),
        storage: {}
      };
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const raw = localStorage.getItem(key);
          try {
            data.storage[key.replace(prefix, '')] = raw ? JSON.parse(raw) : null;
          } catch {
            data.storage[key.replace(prefix, '')] = raw;
          }
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${tenant.id}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Backup exported for "${tenant.businessName}"`);
    } catch (e) {
      alert('Failed to export tenant backup');
    }
  };

  const handleDeleteClient = (tenant: Tenant) => {
    if (confirm(`⚠️ DANGER: Are you sure you want to permanently delete client "${tenant.businessName}" and all associated databases/invoices/stock data? This cannot be undone.`)) {
      deleteTenant(tenant.id);
      showToast(`Client "${tenant.businessName}" deleted.`);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetTenant || !newPassword.trim()) return;
    updateTenant(passwordResetTenant.id, { adminPasswordHash: newPassword.trim() });
    showToast(`Password updated for "${passwordResetTenant.businessName}"`);
    setPasswordResetTenant(null);
    setNewPassword('');
  };

  const handleSaveEditTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    updateTenant(editingTenant.id, {
      businessName: editingTenant.businessName,
      legalEntityName: editingTenant.legalEntityName,
      ownerName: editingTenant.ownerName,
      ownerEmail: editingTenant.ownerEmail,
      ownerPhone: editingTenant.ownerPhone,
      adminUsername: editingTenant.adminUsername,
      businessType: editingTenant.businessType,
      city: editingTenant.city,
      state: editingTenant.state,
      address: editingTenant.address,
      gstin: editingTenant.gstin,
      notes: editingTenant.notes,
      subscription: editingTenant.subscription,
    });
    showToast(`Changes saved for "${editingTenant.businessName}"`);
    setEditingTenant(null);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="bg-[#1E293B] border-b border-slate-700/80 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Super Admin Platform Center</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Master SaaS Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Manage client organizations, databases, licenses & multi-tenant operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              impersonateTenant(tenants[0]?.id || 'biz-apex-retail');
              navigate('/dashboard');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Default Client App</span>
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            Logout Super Admin
          </button>
        </div>
      </header>

      {/* Main SaaS Stats Overview Bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-[#1E293B] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Clients / Tenants</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{metrics.totalClients}</div>
              <div className="text-[10px] text-emerald-400 font-semibold">{metrics.activeClients} Active • {metrics.trialClients} Trial</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated SaaS MRR</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">₹{metrics.totalMRR.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-400">Monthly Recurring Revenue</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Combined Invoices Generated</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{metrics.totalInvoices.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-400">Processed across all client POS</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client Gross Volume</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-400">Total transaction billing throughput</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 mt-6 p-1.5 bg-[#1E293B] border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('CLIENTS')}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              activeTab === 'CLIENTS'
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>Client Organizations ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROVISION')}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              activeTab === 'PROVISION'
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Client Business</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              activeTab === 'ANALYTICS'
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>SaaS Analytics & Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('PLANS')}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              activeTab === 'PLANS'
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Zap className="w-4 h-4" />
            <span>Subscription Plans & Tiers</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        {/* TAB 1: CLIENT ORGANIZATIONS DIRECTORY */}
        {activeTab === 'CLIENTS' && (
          <div className="space-y-4">
            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1E293B] border border-slate-800 p-3.5 rounded-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients by Business name, Owner, Username, Phone, City..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Subscriptions</option>
                  <option value="TRIAL">Trial Period</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="ALL">All Business Types</option>
                  <option value="RETAIL">Retail Store</option>
                  <option value="SUPERMARKET">Supermarket & Grocery</option>
                  <option value="RESTAURANT">Restaurant & Cafe</option>
                  <option value="GARMENTS">Garments & Apparel</option>
                  <option value="MEDICAL">Pharmacy & Healthcare</option>
                  <option value="ELECTRONICS">Electronics & Mobile</option>
                  <option value="HARDWARE">Hardware & Sanitary</option>
                  <option value="SALON">Salon & Spa</option>
                  <option value="WHOLESALE">Wholesale & Distribution</option>
                  <option value="SERVICE_CENTER">Service Center</option>
                </select>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Client Business</th>
                      <th className="p-4">Business Model</th>
                      <th className="p-4">Owner & Admin Login</th>
                      <th className="p-4 text-center">Plan & Status</th>
                      <th className="p-4 text-center">Quota Limits</th>
                      <th className="p-4 text-right">Invoices & Volume</th>
                      <th className="p-4 text-right">Master Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
                          <div className="font-semibold">No client businesses match your criteria</div>
                          <p className="text-[11px] text-slate-400 mt-1">Try changing filters or click "Provision New Client Business".</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((tenant) => {
                        const isExpired = tenant.subscription.status === 'EXPIRED';
                        const isSuspended = tenant.subscription.status === 'SUSPENDED';

                        return (
                          <tr key={tenant.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                              <div className="font-extrabold text-white text-sm">{tenant.businessName}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{tenant.legalEntityName}</div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                                <span>DB: {tenant.id}</span>
                                {tenant.gstin && <span>• GST: {tenant.gstin}</span>}
                              </div>
                            </td>

                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {tenant.businessType}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1 font-mono">{tenant.city || 'India'}</div>
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{tenant.ownerName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">📱 {tenant.ownerPhone}</div>
                              <div className="text-[10px] text-slate-400 font-mono">✉️ {tenant.ownerEmail}</div>
                              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                <span>User: {tenant.adminUsername}</span>
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border inline-flex items-center gap-1",
                                tenant.subscription.status === 'ACTIVE' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                                tenant.subscription.status === 'TRIAL' ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                                "bg-red-500/15 text-red-400 border-red-500/30"
                              )}>
                                {tenant.subscription.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                                {tenant.subscription.plan}
                              </span>
                              <div className="text-[9px] text-slate-400 mt-1 font-mono">
                                ₹{tenant.subscription.monthlyFee}/mo
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <div className="text-slate-300 font-mono text-[11px] font-bold">
                                {tenant.subscription.maxStaff} Staff Limit
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {tenant.subscription.maxInvoicesPerMonth >= 999999 ? 'Unlimited' : `${tenant.subscription.maxInvoicesPerMonth} bills/mo`}
                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <div className="font-mono font-bold text-white text-xs">
                                {tenant.totalInvoicesCount || 0} Bills
                              </div>
                              <div className="font-mono text-emerald-400 text-[11px] font-bold">
                                ₹{(tenant.totalRevenueGenerated || 0).toLocaleString('en-IN')}
                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* One-Click Jump-In Impersonation Button */}
                                <button
                                  onClick={() => handleLoginAsClient(tenant)}
                                  className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-md shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer"
                                  title="Login as Client (Super Admin Impersonation)"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Login as Client</span>
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => setEditingTenant(tenant)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all cursor-pointer"
                                  title="Edit Client & Plan"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Reset Password */}
                                <button
                                  onClick={() => {
                                    setPasswordResetTenant(tenant);
                                    setNewPassword('');
                                  }}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                  title="Reset Admin Password"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>

                                {/* Suspend / Activate Toggle */}
                                <button
                                  onClick={() => {
                                    const nextStatus: TenantStatus = tenant.subscription.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                                    setTenantStatus(tenant.id, nextStatus);
                                    showToast(`Client "${tenant.businessName}" is now ${nextStatus}`);
                                  }}
                                  className={cn(
                                    "p-1.5 rounded-lg border transition-all cursor-pointer",
                                    tenant.subscription.status === 'ACTIVE'
                                      ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/30"
                                      : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30"
                                  )}
                                  title={tenant.subscription.status === 'ACTIVE' ? 'Suspend Client' : 'Activate Client'}
                                >
                                  {tenant.subscription.status === 'ACTIVE' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                </button>

                                {/* Export Backup JSON */}
                                <button
                                  onClick={() => handleExportData(tenant)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                  title="Export Database Backup (JSON)"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteClient(tenant)}
                                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                  title="Delete Client & Data"
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

        {/* TAB 2: PROVISION NEW CLIENT BUSINESS WIZARD */}
        {activeTab === 'PROVISION' && (
          <div className="max-w-4xl mx-auto bg-[#1E293B] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Provision New Client Organization</h2>
                <p className="text-xs text-slate-400">Initialize an isolated database namespace, business profile, POS catalogs, and admin credentials</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-6">
              {/* SECTION 1: Business Profile */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                  <span>1. Business Identity & Type</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Royal Fresh Supermarket, Aroma Cafe"
                      value={newForm.businessName}
                      onChange={(e) => setNewForm({ ...newForm, businessName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Legal Entity / Registered Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Retail India Pvt Ltd"
                      value={newForm.legalEntityName}
                      onChange={(e) => setNewForm({ ...newForm, legalEntityName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry / Business Type *</label>
                    <select
                      value={newForm.businessType}
                      onChange={(e) => setNewForm({ ...newForm, businessType: e.target.value as BusinessType })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="RETAIL">🛒 Supermarket, Department Store & Grocery</option>
                      <option value="RESTAURANT">🍽️ Restaurant, Cafe, QSR & Bar</option>
                      <option value="APPAREL">👗 Apparel, Clothing & Fashion Boutique</option>
                      <option value="PHARMACY">💊 Pharmacy, Chemist & Healthcare</option>
                      <option value="ELECTRONICS">📱 Electronics, Mobile & Appliance Store</option>
                      <option value="AUTOMOBILE">🚗 Automobile, Garage & Spare Parts</option>
                      <option value="SALON">✂️ Salon, Spa & Beauty Care</option>
                      <option value="WHOLESALE">📦 Wholesale, Distribution & B2B Supply</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">GSTIN / Tax ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 33AAAAA0000A1Z5"
                      value={newForm.gstin}
                      onChange={(e) => setNewForm({ ...newForm, gstin: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai, Mumbai, Bengaluru"
                      value={newForm.city}
                      onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Tamil Nadu, Karnataka"
                      value={newForm.state}
                      onChange={(e) => setNewForm({ ...newForm, state: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Commercial Address</label>
                    <input
                      type="text"
                      placeholder="Full shop / store street address"
                      value={newForm.address}
                      onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Owner & Admin Credentials */}
              <div className="border-t border-slate-800 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                  <span>2. Client Admin Credentials</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner / Contact Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      value={newForm.ownerName}
                      onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. rajesh@store.com"
                      value={newForm.ownerEmail}
                      onChange={(e) => setNewForm({ ...newForm, ownerEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner Mobile / Phone *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={newForm.ownerPhone}
                      onChange={(e) => setNewForm({ ...newForm, ownerPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Username *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. royaladmin"
                      value={newForm.adminUsername}
                      onChange={(e) => setNewForm({ ...newForm, adminUsername: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Initial Password *</label>
                    <input
                      required
                      type="password"
                      placeholder="Set secure password"
                      value={newForm.adminPassword}
                      onChange={(e) => setNewForm({ ...newForm, adminPassword: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Plan & Subscription */}
              <div className="border-t border-slate-800 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                  <span>3. Subscription Plan & Contract</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plan Tier</label>
                    <select
                      value={newForm.plan}
                      onChange={(e) => setNewForm({ ...newForm, plan: e.target.value as TenantPlan })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="TRIAL">14-Day Free Trial</option>
                      <option value="STARTER">Starter Business (₹999/mo)</option>
                      <option value="GROWTH">Growth Retail & Cafe (₹1,999/mo)</option>
                      <option value="PROFESSIONAL">Professional Enterprise (₹3,499/mo)</option>
                      <option value="ENTERPRISE">Custom Enterprise (₹6,999/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subscription Validity</label>
                    <select
                      value={newForm.durationMonths}
                      onChange={(e) => setNewForm({ ...newForm, durationMonths: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-bold"
                    >
                      <option value={1}>1 Month (Monthly Billing)</option>
                      <option value={3}>3 Months (Quarterly)</option>
                      <option value={6}>6 Months (Half-Yearly)</option>
                      <option value={12}>12 Months (1 Year Plan)</option>
                      <option value={24}>24 Months (2 Year Plan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Internal Client Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP client, multi-counter"
                      value={newForm.notes}
                      onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('CLIENTS')}
                  className="px-5 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Provision & Activate Client</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SAAS ANALYTICS & REVENUE INSIGHTS */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Distribution */}
              <div className="bg-[#1E293B] border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Client Subscription Breakdown</span>
                </h3>
                <div className="space-y-3">
                  {SAAS_PLANS.map((plan) => {
                    const count = tenants.filter(t => t.subscription.plan === plan.id).length;
                    const pct = tenants.length > 0 ? (count / tenants.length) * 100 : 0;
                    return (
                      <div key={plan.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">{plan.name}</span>
                          <span className="font-mono text-slate-400">{count} Clients ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Industry Distribution */}
              <div className="bg-[#1E293B] border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Business Industry Mix</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {['RETAIL', 'RESTAURANT', 'APPAREL', 'PHARMACY', 'ELECTRONICS', 'AUTOMOBILE', 'SALON', 'WHOLESALE'].map((type) => {
                    const count = tenants.filter(t => t.businessType === type).length;
                    return (
                      <div key={type} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300 font-semibold">{type}</span>
                        <span className="font-mono font-bold text-blue-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION PLANS & TIERS */}
        {activeTab === 'PLANS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SAAS_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "p-5 rounded-3xl border flex flex-col justify-between transition-all",
                  plan.popular
                    ? "bg-gradient-to-b from-blue-900/40 via-slate-900 to-slate-900 border-blue-500/50 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30"
                    : "bg-[#1E293B] border-slate-800"
                )}
              >
                <div className="space-y-3">
                  {plan.popular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-xs">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">₹{plan.priceMonthly}</span>
                      <span className="text-[10px] text-slate-400">/ month</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300 border-t border-slate-800 pt-3">
                    <div className="font-semibold text-blue-400">• Up to {plan.maxStaff} Staff Members</div>
                    <div className="font-semibold text-emerald-400">• {plan.maxInvoicesPerMonth >= 999999 ? 'Unlimited Monthly Bills' : `${plan.maxInvoicesPerMonth} Bills/month`}</div>
                    {plan.allowWebsite && <div className="text-slate-300">• Public Storefront Website</div>}
                    {plan.allowCustomDomain && <div className="text-slate-300">• Custom Domain Support</div>}
                  </div>

                  <ul className="space-y-1 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400">
                    {tenants.filter(t => t.subscription.plan === plan.id).length} Active Subscribers
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* EDIT TENANT MODAL */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Edit Client: {editingTenant.businessName}</h3>
              </div>
              <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTenant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Business Name</label>
                  <input
                    required
                    value={editingTenant.businessName}
                    onChange={(e) => setEditingTenant({ ...editingTenant, businessName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Owner Name</label>
                  <input
                    required
                    value={editingTenant.ownerName}
                    onChange={(e) => setEditingTenant({ ...editingTenant, ownerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Owner Phone</label>
                  <input
                    required
                    value={editingTenant.ownerPhone}
                    onChange={(e) => setEditingTenant({ ...editingTenant, ownerPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Owner Email</label>
                  <input
                    required
                    value={editingTenant.ownerEmail}
                    onChange={(e) => setEditingTenant({ ...editingTenant, ownerEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Admin Username</label>
                  <input
                    required
                    value={editingTenant.adminUsername}
                    onChange={(e) => setEditingTenant({ ...editingTenant, adminUsername: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Subscription Plan</label>
                  <select
                    value={editingTenant.subscription.plan}
                    onChange={(e) => {
                      const newPlan = e.target.value as TenantPlan;
                      const planConfig = SAAS_PLANS.find(p => p.id === newPlan) || SAAS_PLANS[0];
                      setEditingTenant({
                        ...editingTenant,
                        subscription: {
                          ...editingTenant.subscription,
                          plan: newPlan,
                          monthlyFee: planConfig.priceMonthly,
                          maxStaff: planConfig.maxStaff,
                          maxInvoicesPerMonth: planConfig.maxInvoicesPerMonth,
                        }
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    <option value="TRIAL">14-Day Trial</option>
                    <option value="STARTER">Starter Business</option>
                    <option value="GROWTH">Growth Retail & Cafe</option>
                    <option value="PROFESSIONAL">Professional Enterprise</option>
                    <option value="ENTERPRISE">Custom Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Subscription Status</label>
                  <select
                    value={editingTenant.subscription.status}
                    onChange={(e) => setEditingTenant({
                      ...editingTenant,
                      subscription: {
                        ...editingTenant.subscription,
                        status: e.target.value as TenantStatus,
                      }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="TRIAL">Trial</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {passwordResetTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Reset Admin Password</h3>
              </div>
              <button onClick={() => setPasswordResetTenant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-400">
                Set a new password for <span className="text-white font-bold">{passwordResetTenant.businessName}</span> (Username: <code className="text-amber-400 font-mono">{passwordResetTenant.adminUsername}</code>).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password *</label>
                <input
                  required
                  type="password"
                  placeholder="Enter new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setPasswordResetTenant(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
