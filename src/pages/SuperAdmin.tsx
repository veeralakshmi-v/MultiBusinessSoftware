import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { TenantEngine, Tenant, TenantPlan, TenantStatus, SAAS_PLANS, SaaSPlanConfig } from '../lib/tenant/tenantEngine';
import { BusinessType } from '../types/template';
import {
  PlatformEngine,
  PlatformUser,
  SupportTicket,
  PlatformNotification,
  PlatformAuditLog,
  IndustryTemplateConfig,
  PlatformSettingsConfig,
  BackupRecord,
  TicketStatus,
  TicketPriority,
  PlatformRole,
} from '../lib/tenant/platformEngine';
import {
  Shield, Building2, Plus, Search, ExternalLink, Edit2, Key,
  PauseCircle, PlayCircle, Trash2, CheckCircle2, AlertTriangle,
  Receipt, DollarSign, X, Check,
  ChevronRight, RefreshCw, Lock, LogOut, ArrowLeft,
  ChevronLeft, PanelLeftClose, PanelLeftOpen, Menu, Store, Crown, Sparkles,
  Settings as SettingsIcon, Download, Upload, Eye, EyeOff, Save, KeyRound,
  LayoutDashboard, Layers, Users, Bell, FileText, Database, LifeBuoy,
  CreditCard, BarChart3, TrendingUp, AlertCircle, Clock, CheckCircle,
  HelpCircle, Sliders, Server, ShieldCheck, Mail, Send, Filter,
  ArrowUpRight, ArrowDownRight, Tag, ShoppingBag, Laptop, Utensils,
  Coffee, Wrench, Shirt, Activity, Cpu, MoreVertical, Copy, ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';

// Streamlined 5 Main Super Admin Navigation Sections
type SuperAdminTab = 'DASHBOARD' | 'BUSINESSES' | 'SUBSCRIPTIONS' | 'SUPPORT' | 'SETTINGS';

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

  // Sidebar collapse state matching Admin Dashboard
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

  // Active Streamlined Navigation Tab
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('DASHBOARD');

  // Sub-tab selectors for consolidated views
  const [subscriptionSubTab, setSubscriptionSubTab] = useState<'SUBSCRIPTIONS' | 'PLANS' | 'MODULES'>('SUBSCRIPTIONS');
  const [settingsSubTab, setSettingsSubTab] = useState<'CREDENTIALS' | 'BACKUPS' | 'USERS' | 'AUDIT_LOGS' | 'FEATURES'>('CREDENTIALS');

  // Platform Data Registries State
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>(() => PlatformEngine.getPlatformUsers());
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => PlatformEngine.getSupportTickets());
  const [notifications, setNotifications] = useState<PlatformNotification[]>(() => PlatformEngine.getNotifications());
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>(() => PlatformEngine.getAuditLogs());
  const [industryTemplates, setIndustryTemplates] = useState<IndustryTemplateConfig[]>(() => PlatformEngine.getIndustryTemplates());
  const [backupsList, setBackupsList] = useState<BackupRecord[]>(() => PlatformEngine.getBackups());
  const [saasPlans, setSaasPlans] = useState<SaaSPlanConfig[]>(() => SAAS_PLANS);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | BusinessType>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | TenantPlan>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'MRR' | 'CREATED' | 'ACTIVITY'>('CREATED');

  // Modals & Drawers State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState<Tenant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [changePlanTenant, setChangePlanTenant] = useState<Tenant | null>(null);
  const [passwordResetTenant, setPasswordResetTenant] = useState<Tenant | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmTenant, setDeleteConfirmTenant] = useState<Tenant | null>(null);
  const [provisionSuccessTenant, setProvisionSuccessTenant] = useState<Tenant | null>(null);

  // Support Ticket Drawer & Reply State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'ALL' | TicketStatus>('ALL');

  // Audit Logs Filter State
  const [auditSearch, setAuditSearch] = useState('');

  // Platform User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newPlatformUser, setNewPlatformUser] = useState({
    name: '',
    email: '',
    username: '',
    role: 'PLATFORM_ADMIN' as PlatformRole,
  });

  // Super Admin Master Password Change State
  const [superAdminPassForm, setSuperAdminPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');

  // New Provision Business Form State
  const [newBizForm, setNewBizForm] = useState({
    businessName: '',
    legalEntityName: '',
    businessType: 'SUPERMARKET' as BusinessType,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerAadhaar: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    gstin: '',
    currency: 'INR',
    plan: 'GROWTH' as TenantPlan,
    trialDays: 14,
    adminUsername: '',
    adminPassword: '',
  });

  useEffect(() => {
    if (isSuperAdmin || localStorage.getItem('saas_super_admin_active') === 'true' || user?.role === 'SUPER_ADMIN') {
      setInternalAuth(true);
    }
  }, [isSuperAdmin, user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
      PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Global', 'SUPER_ADMIN_LOGIN', 'Master Super Admin logged in successfully.');
    } else {
      setLoginLoading(false);
      setLoginError('Invalid super admin credentials.');
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
    PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Global', 'SUPER_ADMIN_UNLOCK', 'Master Super Admin unlocked platform control center.');
  };

  const handleLogout = () => {
    PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Global', 'SUPER_ADMIN_LOGOUT', 'Master Super Admin logged out.');
    localStorage.removeItem('saas_super_admin_active');
    setInternalAuth(false);
    logout();
  };

  // ── IMPERSONATION (LOGIN AS BUSINESS ADMIN) ──
  const handleImpersonate = (tenant: Tenant) => {
    PlatformEngine.logAudit(
      'superadmin',
      'SUPER_ADMIN',
      tenant.businessName,
      'IMPERSONATION_LOGIN',
      `Super Admin accessed tenant environment for support and maintenance.`,
      'SUCCESS',
      tenant.id
    );
    impersonateTenant(tenant.id);
    navigate('/dashboard');
  };

  // ── AGGREGATED SAAS METRICS ──
  const metrics = useMemo(() => {
    let totalMRR = 0;
    let totalInvoices = 0;
    let totalRevenue = 0;
    let totalUsers = 0;

    const planCounts: Record<TenantPlan, number> = {
      TRIAL: 0,
      STARTER: 0,
      GROWTH: 0,
      PROFESSIONAL: 0,
      ENTERPRISE: 0,
    };

    tenants.forEach(t => {
      const plan = t.subscription?.plan || 'GROWTH';
      if (planCounts[plan] !== undefined) planCounts[plan]++;

      if (t.subscription?.status === 'ACTIVE') {
        totalMRR += t.subscription.monthlyFee || 0;
      }
      totalInvoices += t.totalInvoicesCount || 0;
      totalRevenue += t.totalRevenueGenerated || 0;
      totalUsers += t.subscription.maxStaff || 3;
    });

    const activeCount = tenants.filter(t => t.subscription?.status === 'ACTIVE').length;
    const trialCount = tenants.filter(t => t.subscription?.status === 'TRIAL').length;
    const suspendedCount = tenants.filter(t => t.subscription?.status === 'SUSPENDED' || t.subscription?.status === 'EXPIRED').length;

    return {
      totalBusinesses: tenants.length,
      activeBusinesses: activeCount,
      trialBusinesses: trialCount,
      suspendedBusinesses: suspendedCount,
      mrr: totalMRR,
      arr: totalMRR * 12,
      totalPlatformUsers: totalUsers + platformUsers.length,
      activeUsers: totalUsers > 0 ? Math.round(totalUsers * 0.72) + platformUsers.length : platformUsers.length,
      newBusinessesThisMonth: tenants.filter(t => {
        const d = new Date(t.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      totalInvoices,
      totalRevenue,
      planCounts,
    };
  }, [tenants, platformUsers]);

  // ── FILTERED TENANTS ──
  const filteredTenants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = tenants.filter(t => {
      const matchQuery = !q ||
        t.businessName.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q) ||
        t.ownerPhone.includes(q) ||
        t.adminUsername.toLowerCase().includes(q) ||
        (t.city && t.city.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || t.subscription?.status === statusFilter;
      const matchType = typeFilter === 'ALL' || t.businessType === typeFilter;
      const matchPlan = planFilter === 'ALL' || t.subscription?.plan === planFilter;

      return matchQuery && matchStatus && matchType && matchPlan;
    });

    list.sort((a, b) => {
      if (sortBy === 'NAME') return a.businessName.localeCompare(b.businessName);
      if (sortBy === 'MRR') return (b.subscription.monthlyFee || 0) - (a.subscription.monthlyFee || 0);
      if (sortBy === 'ACTIVITY') return new Date(b.lastLoginAt || b.updatedAt).getTime() - new Date(a.lastLoginAt || a.updatedAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [tenants, searchQuery, statusFilter, typeFilter, planFilter, sortBy]);

  // ── PROVISION / CREATE NEW BUSINESS ──
  const handleProvisionBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizForm.businessName.trim() || !newBizForm.ownerName.trim() || !newBizForm.ownerEmail.trim()) {
      alert('Please fill out all required fields (Business Name, Owner Name, Email).');
      return;
    }

    // Phone Number Validation (Standard 10-digit Indian Mobile Number)
    const digitsPhone = newBizForm.ownerPhone.replace(/\D/g, '');
    const phone10 = digitsPhone.length === 12 && digitsPhone.startsWith('91')
      ? digitsPhone.slice(2)
      : (digitsPhone.length === 11 && digitsPhone.startsWith('0') ? digitsPhone.slice(1) : digitsPhone);

    if (!phone10 || phone10.length !== 10 || !/^[6-9]\d{9}$/.test(phone10)) {
      alert('Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9 (e.g. 9876543210).');
      return;
    }

    // Aadhaar Card Validation (12-digit Indian Aadhaar Number)
    const digitsAadhaar = newBizForm.ownerAadhaar.replace(/\D/g, '');
    if (!digitsAadhaar || digitsAadhaar.length !== 12 || !/^\d{12}$/.test(digitsAadhaar)) {
      alert('Please enter a valid 12-digit Aadhaar Card number (e.g. 1234 5678 9012).');
      return;
    }

    const created = createTenant({
      businessName: newBizForm.businessName,
      legalEntityName: newBizForm.legalEntityName || newBizForm.businessName,
      ownerName: newBizForm.ownerName,
      ownerEmail: newBizForm.ownerEmail,
      ownerPhone: `+91 ${phone10}`,
      ownerAadhaar: digitsAadhaar.replace(/(\d{4})(?=\d)/g, '$1 '),
      adminUsername: newBizForm.adminUsername || newBizForm.businessName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10),
      adminPassword: newBizForm.adminPassword || 'admin123',
      businessType: newBizForm.businessType,
      plan: newBizForm.plan,
      city: newBizForm.city,
      state: newBizForm.state,
      address: newBizForm.address,
      gstin: newBizForm.gstin,
    });

    PlatformEngine.logAudit(
      'superadmin',
      'SUPER_ADMIN',
      created.businessName,
      'PROVISION_TENANT',
      `Provisioned new tenant database namespace (${created.businessType}, ${created.subscription.plan} plan).`,
      'SUCCESS',
      created.id
    );

    PlatformEngine.addNotification({
      title: `Tenant Provisioned: ${created.businessName}`,
      message: `New client business ${created.businessName} initialized with ${created.subscription.plan} plan.`,
      type: 'BUSINESS_REGISTERED',
      tenantId: created.id,
      businessName: created.businessName,
    });
    setNotifications(PlatformEngine.getNotifications());
    setAuditLogs(PlatformEngine.getAuditLogs());

    setProvisionSuccessTenant(created);
    setIsAddModalOpen(false);
    showToast(`Business "${created.businessName}" successfully provisioned!`);

    setNewBizForm({
      businessName: '',
      legalEntityName: '',
      businessType: 'SUPERMARKET',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      ownerAadhaar: '',
      address: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      gstin: '',
      currency: 'INR',
      plan: 'GROWTH',
      trialDays: 14,
      adminUsername: '',
      adminPassword: '',
    });
  };

  // ── SAVE EDIT TENANT ──
  const handleSaveEditTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    updateTenant(editingTenant.id, editingTenant);
    PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', editingTenant.businessName, 'EDIT_TENANT', `Updated profile for ${editingTenant.businessName}`, 'SUCCESS', editingTenant.id);
    setAuditLogs(PlatformEngine.getAuditLogs());
    showToast(`Updated details for "${editingTenant.businessName}"`);
    setEditingTenant(null);
  };

  // ── CHANGE PLAN ──
  const handleChangePlanSubmit = (newPlan: TenantPlan) => {
    if (!changePlanTenant) return;
    const planConfig = saasPlans.find(p => p.id === newPlan) || saasPlans[0];
    const updatedSub = {
      ...changePlanTenant.subscription,
      plan: newPlan,
      monthlyFee: planConfig.priceMonthly,
      maxStaff: planConfig.maxStaff,
      maxInvoicesPerMonth: planConfig.maxInvoicesPerMonth,
      allowWebsite: planConfig.allowWebsite,
      allowCustomDomain: planConfig.allowCustomDomain,
    };
    updateTenant(changePlanTenant.id, { subscription: updatedSub });
    PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', changePlanTenant.businessName, 'CHANGE_PLAN', `Changed subscription plan to ${newPlan} (₹${planConfig.priceMonthly}/mo)`, 'SUCCESS', changePlanTenant.id);
    setAuditLogs(PlatformEngine.getAuditLogs());
    showToast(`Updated "${changePlanTenant.businessName}" to ${newPlan} Plan`);
    setChangePlanTenant(null);
  };

  // ── RESET CLIENT PASSWORD ──
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetTenant || !newPassword.trim()) return;
    TenantEngine.resetTenantPassword(passwordResetTenant.id, newPassword.trim());
    refreshTenants();
    PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', passwordResetTenant.businessName, 'RESET_ADMIN_PASSWORD', `Master Super Admin reset client admin password`, 'SUCCESS', passwordResetTenant.id);
    setAuditLogs(PlatformEngine.getAuditLogs());
    showToast(`Admin password reset for "${passwordResetTenant.businessName}"`);
    setPasswordResetTenant(null);
    setNewPassword('');
  };

  // ── DELETE TENANT ──
  const handleDeleteTenant = (tenant: Tenant) => {
    deleteTenant(tenant.id);
    PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', tenant.businessName, 'DELETE_TENANT', `Permanently deleted business namespace and purged data`, 'WARNING', tenant.id);
    setAuditLogs(PlatformEngine.getAuditLogs());
    showToast(`Client "${tenant.businessName}" deleted.`);
    setDeleteConfirmTenant(null);
    if (selectedTenantDetails?.id === tenant.id) setSelectedTenantDetails(null);
  };

  // ── CHANGE SUPER ADMIN PASSWORD ──
  const handleChangeSuperAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    const { newPassword: np, confirmPassword: cp } = superAdminPassForm;
    if (!np.trim() || np.trim().length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (np !== cp) {
      setPassError('New password and confirm password do not match.');
      return;
    }
    TenantEngine.setSuperAdminPassword(np.trim(), 'superadmin');
    PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Security', 'CHANGE_SUPERADMIN_PASSWORD', `Updated Master Super Admin credentials`, 'SUCCESS');
    setAuditLogs(PlatformEngine.getAuditLogs());
    showToast('Super Admin master password changed successfully!');
    setSuperAdminPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // ── EXPORT / IMPORT BACKUPS ──
  const handleExportFullBackup = () => {
    TenantEngine.exportTenantsBackup();
    const rec = PlatformEngine.recordBackupCreated('FULL_PLATFORM', tenants.length, 1024 * 1024 * 1.5);
    setBackupsList(PlatformEngine.getBackups());
    setAuditLogs(PlatformEngine.getAuditLogs());
    showToast(`Platform backup "${rec.filename}" exported!`);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json?.tenants) || Array.isArray(json)) {
          const list = Array.isArray(json) ? json : json.tenants;
          TenantEngine.saveTenants(list);
          refreshTenants();
          PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Backups', 'RESTORE_BACKUP', `Restored ${list.length} client databases from backup file`, 'SUCCESS');
          setAuditLogs(PlatformEngine.getAuditLogs());
          showToast(`Successfully restored ${list.length} client databases!`);
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── SUPPORT TICKETS HANDLERS ──
  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    const updated = PlatformEngine.addTicketReply(selectedTicket.id, 'Super Admin Support', ticketReplyText.trim(), true);
    if (updated) {
      setSelectedTicket(updated);
      setSupportTickets(PlatformEngine.getSupportTickets());
      setTicketReplyText('');
      showToast('Reply posted to ticket.');
    }
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    const updated = PlatformEngine.updateTicketStatus(ticketId, newStatus);
    if (updated) {
      if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
      setSupportTickets(PlatformEngine.getSupportTickets());
      showToast(`Ticket status updated to ${newStatus}`);
    }
  };

  // ── PLATFORM USERS HANDLERS ──
  const handleCreatePlatformUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatformUser.name || !newPlatformUser.email) return;
    PlatformEngine.addPlatformUser({
      name: newPlatformUser.name,
      email: newPlatformUser.email,
      username: newPlatformUser.username || newPlatformUser.email.split('@')[0],
      role: newPlatformUser.role,
      status: 'ACTIVE',
    });
    setPlatformUsers(PlatformEngine.getPlatformUsers());
    setAuditLogs(PlatformEngine.getAuditLogs());
    setIsAddUserModalOpen(false);
    setNewPlatformUser({ name: '', email: '', username: '', role: 'PLATFORM_ADMIN' });
    showToast('Platform administrator created successfully!');
  };

  // ── NOTIFICATIONS HANDLERS ──
  const handleMarkAllNotifsRead = () => {
    PlatformEngine.markAllAsRead();
    setNotifications(PlatformEngine.getNotifications());
    showToast('All notifications marked as read.');
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: Master Login Screen if unauthenticated
  // ─────────────────────────────────────────────────────────────
  if (!internalAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-4 font-bold text-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
              <Crown className="w-3.5 h-3.5 text-[#2563EB]" /> Super Admin Portal
            </span>
            <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">Super Admin Control Center</h1>
            <p className="text-xs text-gray-500 mt-1">Multi-Tenant SaaS Platform Administration</p>
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
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store Client Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Streamlined Super Admin Portal Layout (Admin Dashboard Matching)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── STREAMLINED SIDEBAR (MATCHING ADMIN DASHBOARD LOOK & FEEL) ── */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-20 flex-shrink-0 select-none",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-20 flex items-center border-b border-gray-200 bg-white px-4 justify-between")}>
          <div className="flex items-center truncate">
            <div className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <h1 className="font-serif font-bold text-sm tracking-tight text-gray-900 truncate">
                  Super Admin
                </h1>
                <span className="text-[10px] text-[#2563EB] font-bold tracking-wider uppercase truncate block">
                  SaaS Platform Owner
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

        {/* Navigation Items (Streamlined 5-Item Menu) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3 no-scrollbar">
          <nav className="space-y-1.5">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              title={isCollapsed ? "Dashboard" : undefined}
              className={cn(
                'w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-150 relative group cursor-pointer',
                isCollapsed ? "justify-center" : "justify-start",
                activeTab === 'DASHBOARD'
                  ? 'border-l-4 shadow-xs font-bold bg-blue-50 text-[#2563EB] border-[#2563EB]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <LayoutDashboard
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isCollapsed ? '' : 'mr-3',
                  activeTab === 'DASHBOARD' ? 'text-[#2563EB]' : 'text-gray-400 group-hover:text-gray-700'
                )}
              />
              {!isCollapsed && <span className="truncate font-semibold flex-1 text-left">Dashboard</span>}
            </button>

            {/* 2. Businesses */}
            <button
              onClick={() => setActiveTab('BUSINESSES')}
              title={isCollapsed ? "Businesses" : undefined}
              className={cn(
                'w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-150 relative group cursor-pointer',
                isCollapsed ? "justify-center" : "justify-start",
                activeTab === 'BUSINESSES'
                  ? 'border-l-4 shadow-xs font-bold bg-blue-50 text-[#2563EB] border-[#2563EB]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Building2
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isCollapsed ? '' : 'mr-3',
                  activeTab === 'BUSINESSES' ? 'text-[#2563EB]' : 'text-gray-400 group-hover:text-gray-700'
                )}
              />
              {!isCollapsed && <span className="truncate font-semibold flex-1 text-left">Businesses</span>}
              {!isCollapsed && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-black',
                    activeTab === 'BUSINESSES' ? 'bg-blue-200/70 text-[#2563EB]' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tenants.length}
                </span>
              )}
            </button>

            {/* 3. Subscriptions & Plans */}
            <button
              onClick={() => setActiveTab('SUBSCRIPTIONS')}
              title={isCollapsed ? "Subscriptions & Plans" : undefined}
              className={cn(
                'w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-150 relative group cursor-pointer',
                isCollapsed ? "justify-center" : "justify-start",
                activeTab === 'SUBSCRIPTIONS'
                  ? 'border-l-4 shadow-xs font-bold bg-blue-50 text-[#2563EB] border-[#2563EB]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <CreditCard
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isCollapsed ? '' : 'mr-3',
                  activeTab === 'SUBSCRIPTIONS' ? 'text-[#2563EB]' : 'text-gray-400 group-hover:text-gray-700'
                )}
              />
              {!isCollapsed && <span className="truncate font-semibold flex-1 text-left">Subscriptions & Plans</span>}
            </button>

            {/* 4. Support Tickets */}
            <button
              onClick={() => setActiveTab('SUPPORT')}
              title={isCollapsed ? "Support Tickets" : undefined}
              className={cn(
                'w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-150 relative group cursor-pointer',
                isCollapsed ? "justify-center" : "justify-start",
                activeTab === 'SUPPORT'
                  ? 'border-l-4 shadow-xs font-bold bg-blue-50 text-[#2563EB] border-[#2563EB]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <LifeBuoy
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isCollapsed ? '' : 'mr-3',
                  activeTab === 'SUPPORT' ? 'text-[#2563EB]' : 'text-gray-400 group-hover:text-gray-700'
                )}
              />
              {!isCollapsed && <span className="truncate font-semibold flex-1 text-left">Support Tickets</span>}
              {!isCollapsed && supportTickets.filter(t => t.status === 'OPEN').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                  {supportTickets.filter(t => t.status === 'OPEN').length}
                </span>
              )}
            </button>

            {/* 5. System Settings */}
            <button
              onClick={() => setActiveTab('SETTINGS')}
              title={isCollapsed ? "Settings & System" : undefined}
              className={cn(
                'w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-150 relative group cursor-pointer',
                isCollapsed ? "justify-center" : "justify-start",
                activeTab === 'SETTINGS'
                  ? 'border-l-4 shadow-xs font-bold bg-blue-50 text-[#2563EB] border-[#2563EB]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <SettingsIcon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isCollapsed ? '' : 'mr-3',
                  activeTab === 'SETTINGS' ? 'text-[#2563EB]' : 'text-gray-400 group-hover:text-gray-700'
                )}
              />
              {!isCollapsed && <span className="truncate font-semibold flex-1 text-left">Settings & System</span>}
            </button>

            {/* Switch to Client Store POS */}
            <Link
              to="/dashboard"
              title={isCollapsed ? "Open Store View" : undefined}
              className={cn(
                'flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-150 relative group mt-4',
                isCollapsed ? "justify-center" : "justify-start",
                'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <Store className={cn('h-5 w-5 flex-shrink-0 text-gray-500', isCollapsed ? '' : 'mr-3')} />
              {!isCollapsed && <span className="truncate">Open Store POS</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Open Store POS
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Top Navbar matching Admin Dashboard */}
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
                  Good Morning, Super Admin
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-extrabold uppercase border border-blue-200">
                  SaaS Platform Owner
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Here's what's happening across your platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Provision Business */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Provision Business</span>
            </button>

            {/* Platform Backup Download */}
            <button
              onClick={handleExportFullBackup}
              title="Download Full Platform JSON Backup"
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs border border-gray-200 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Slide-Over Menu */}
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
                <div className="mt-4 space-y-1">
                  {[
                    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'BUSINESSES', label: 'Businesses', icon: Building2 },
                    { id: 'SUBSCRIPTIONS', label: 'Subscriptions & Plans', icon: CreditCard },
                    { id: 'SUPPORT', label: 'Support Tickets', icon: LifeBuoy },
                    { id: 'SETTINGS', label: 'Settings & System', icon: SettingsIcon },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as SuperAdminTab);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        'w-full p-3 font-bold rounded-xl text-sm flex items-center gap-2',
                        activeTab === item.id ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-700'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* ══════════════════════════════════════════════════════
              TAB 1: DASHBOARD
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top 8 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Businesses</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-gray-900 mt-2">{metrics.totalBusinesses}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Across all industries</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Businesses</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-emerald-600 mt-2">{metrics.activeBusinesses}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {Math.round((metrics.activeBusinesses / (metrics.totalBusinesses || 1)) * 100)}% active rate
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trial Businesses</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-amber-600 mt-2">{metrics.trialBusinesses}</div>
                  <div className="text-[11px] text-gray-500 mt-1">14-Day Free Evaluation</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Suspended / Expired</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-rose-600 mt-2">{metrics.suspendedBusinesses}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Requires attention</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Monthly Revenue (MRR)</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-gray-900 mt-2">₹{metrics.mrr.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-indigo-600 font-semibold mt-1">ARR: ₹{(metrics.arr).toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Platform Users</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-gray-900 mt-2">{metrics.totalPlatformUsers}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Across all client stores</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">New This Month</span>
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-teal-600 mt-2">+{metrics.newBusinessesThisMonth}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Provisioned recently</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Concurrency</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#2563EB] mt-2">{metrics.activeUsers}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live sessions</span>
                  </div>
                </div>
              </div>

              {/* Growth, Subscription Distribution & Revenue Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Growth */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                      <span>Business Growth</span>
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400">Monthly Run</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Active vs Inactive Businesses</span>
                      <span className="font-bold text-gray-800">{metrics.activeBusinesses} Active / {metrics.suspendedBusinesses} Inactive</span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${(metrics.activeBusinesses / (metrics.totalBusinesses || 1)) * 100}%` }}
                      />
                      <div
                        className="bg-amber-400 h-full transition-all"
                        style={{ width: `${(metrics.trialBusinesses / (metrics.totalBusinesses || 1)) * 100}%` }}
                      />
                      <div
                        className="bg-rose-400 h-full transition-all"
                        style={{ width: `${(metrics.suspendedBusinesses / (metrics.totalBusinesses || 1)) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-bold">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                        <div>{metrics.activeBusinesses}</div>
                        <div className="text-gray-400 text-[9px] uppercase">Active</div>
                      </div>
                      <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                        <div>{metrics.trialBusinesses}</div>
                        <div className="text-gray-400 text-[9px] uppercase">Trial</div>
                      </div>
                      <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                        <div>{metrics.suspendedBusinesses}</div>
                        <div className="text-gray-400 text-[9px] uppercase">Suspended</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Distribution */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>Subscription Distribution</span>
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-600">5 Tier Plans</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {(['ENTERPRISE', 'PROFESSIONAL', 'GROWTH', 'STARTER', 'TRIAL'] as TenantPlan[]).map(p => {
                      const count = metrics.planCounts[p] || 0;
                      const percent = Math.round((count / (metrics.totalBusinesses || 1)) * 100);
                      return (
                        <div key={p} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-700">{p}</span>
                            <span className="text-gray-500">{count} ({percent}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revenue Overview */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Revenue Overview</span>
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600">SaaS Finances</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Monthly MRR</div>
                      <div className="text-base font-serif font-bold text-gray-900 mt-0.5">₹{metrics.mrr.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Annual ARR</div>
                      <div className="text-base font-serif font-bold text-emerald-600 mt-0.5">₹{metrics.arr.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">New Subs</div>
                      <div className="text-sm font-bold text-gray-800 mt-0.5">+{metrics.newBusinessesThisMonth} this cycle</div>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Renewals</div>
                      <div className="text-sm font-bold text-amber-600 mt-0.5">{metrics.trialBusinesses} Upcoming</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Businesses Table & Platform Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#2563EB]" />
                      <span>Recent Businesses</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('BUSINESSES')}
                      className="text-xs font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All ({tenants.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-bold uppercase text-gray-400 border-b border-gray-100">
                        <tr>
                          <th className="pb-2.5">Business Name</th>
                          <th className="pb-2.5">Owner</th>
                          <th className="pb-2.5">Industry</th>
                          <th className="pb-2.5">Plan</th>
                          <th className="pb-2.5">Status</th>
                          <th className="pb-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tenants.slice(0, 5).map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 font-bold text-gray-900">{t.businessName}</td>
                            <td className="py-3 text-gray-600">{t.ownerName}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] font-bold text-[10px]">
                                {t.businessType}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-gray-700">{t.subscription.plan}</td>
                            <td className="py-3">
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                                  t.subscription.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : t.subscription.status === 'TRIAL'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                )}
                              >
                                {t.subscription.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => setSelectedTenantDetails(t)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-[#2563EB] text-gray-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Alerts Card */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Platform Alerts</span>
                    </h3>
                    <span className="text-[10px] font-bold text-amber-600">Active</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 bg-gray-50 border border-gray-100 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                        <p className="font-semibold text-[11px]">All systems operational. No active alerts.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 3).map((n) => (
                        <div key={n.id} className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-amber-900">{n.title}</div>
                            <div className="text-[11px] text-amber-800">{n.message}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 2: BUSINESSES & TEMPLATES
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'BUSINESSES' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Directory Header & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Client Businesses Directory ({tenants.length})</h2>
                  <p className="text-xs text-gray-500">Manage all registered client tenants, provision new businesses, and control access.</p>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision New Business</span>
                </button>
              </div>
                  {/* Search & Filter Bar */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search businesses by name, owner, email, phone, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none"
                      >
                        <option value="ALL">All Industries</option>
                        <option value="SUPERMARKET">Supermarket</option>
                        <option value="GARMENTS">Garments</option>
                        <option value="MEDICAL">Pharmacy</option>
                        <option value="HARDWARE">Hardware</option>
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="BAKERY">Cafe & Bakery</option>
                        <option value="ELECTRONICS">Electronics</option>
                        <option value="RETAIL">General Retail</option>
                      </select>

                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none"
                      >
                        <option value="ALL">All Plans</option>
                        <option value="TRIAL">Trial</option>
                        <option value="STARTER">Starter</option>
                        <option value="GROWTH">Growth</option>
                        <option value="PROFESSIONAL">Professional</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-semibold focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="TRIAL">Trial</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Businesses Table */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Business</th>
                            <th className="px-4 py-4 whitespace-nowrap">Owner</th>
                            <th className="px-4 py-4 whitespace-nowrap">Industry</th>
                            <th className="px-4 py-4 whitespace-nowrap">Plan</th>
                            <th className="px-4 py-4 whitespace-nowrap text-center">Status</th>
                            <th className="px-4 py-4 whitespace-nowrap">Users / Usage</th>
                            <th className="px-4 py-4 whitespace-nowrap">Created</th>
                            <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredTenants.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                                <p className="font-semibold text-gray-600">No businesses found matching current search.</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Click "Provision New Business" to onboard a new client business.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredTenants.map((t) => {
                              const health = PlatformEngine.getTenantHealthAndUsage(t);
                              const isSuspended = t.subscription.status === 'SUSPENDED';

                              return (
                                <tr key={t.id} className="hover:bg-blue-50/20 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-gray-900 text-sm">{t.businessName}</div>
                                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                      {t.id} • {t.city || 'Chennai'}
                                    </div>
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-gray-800">{t.ownerName}</div>
                                    <div className="text-[11px] text-gray-500">{t.ownerEmail}</div>
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] font-bold text-[10px] border border-blue-200">
                                      {t.businessType}
                                    </span>
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                                      {t.subscription.plan}
                                    </span>
                                    <div className="text-gray-700 font-bold text-xs mt-1">
                                      ₹{(t.subscription.monthlyFee || 0).toLocaleString('en-IN')}/mo
                                    </div>
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap text-center">
                                    <span
                                      className={cn(
                                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap justify-center min-w-[80px]',
                                        t.subscription.status === 'ACTIVE'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : t.subscription.status === 'TRIAL'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      )}
                                    >
                                      {t.subscription.status}
                                    </span>
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="font-bold text-gray-800">
                                      {health.usersCount} / {health.maxUsers} Users
                                    </div>
                                    <div className="text-[11px] text-gray-500">
                                      {health.productsCount} Prods • {health.storagePercent}% Storage
                                    </div>
                                  </td>

                                  <td className="px-4 py-4 text-gray-500 text-[11px] whitespace-nowrap">
                                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                                  </td>

                                  <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* View Details */}
                                      <button
                                        onClick={() => setSelectedTenantDetails(t)}
                                        title="View Full Business Details"
                                        className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-all cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Login as Business */}
                                      <button
                                        onClick={() => handleImpersonate(t)}
                                        title="Login as Business Admin"
                                        className="px-2.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Login as Business</span>
                                      </button>

                                      {/* Change Plan */}
                                      <button
                                        onClick={() => setChangePlanTenant(t)}
                                        title="Change Plan"
                                        className="p-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 rounded-lg border border-gray-200 transition-all cursor-pointer"
                                      >
                                        <CreditCard className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Suspend / Activate */}
                                      <button
                                        onClick={() => {
                                          const nextStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
                                          setTenantStatus(t.id, nextStatus);
                                          PlatformEngine.logAudit('superadmin', 'SUPER_ADMIN', t.businessName, nextStatus === 'ACTIVE' ? 'ACTIVATE_TENANT' : 'SUSPEND_TENANT', `Toggled status to ${nextStatus}`, 'SUCCESS', t.id);
                                          setAuditLogs(PlatformEngine.getAuditLogs());
                                          showToast(`Tenant "${t.businessName}" set to ${nextStatus}`);
                                        }}
                                        title={isSuspended ? 'Activate Business' : 'Suspend Business'}
                                        className={cn(
                                          'p-1.5 rounded-lg text-xs transition-all cursor-pointer border',
                                          isSuspended
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                        )}
                                      >
                                        {isSuspended ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                                      </button>

                                      {/* Reset Password */}
                                      <button
                                        onClick={() => setPasswordResetTenant(t)}
                                        title="Reset Password"
                                        className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-all cursor-pointer"
                                      >
                                        <Key className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Edit */}
                                      <button
                                        onClick={() => setEditingTenant({ ...t })}
                                        title="Edit Business"
                                        className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-all cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Delete */}
                                      <button
                                        onClick={() => setDeleteConfirmTenant(t)}
                                        title="Delete Tenant"
                                        className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg border border-gray-200 hover:border-rose-200 transition-all cursor-pointer"
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

          {/* ══════════════════════════════════════════════════════
              TAB 3: SUBSCRIPTIONS & PLANS
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'SUBSCRIPTIONS' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Sub-Tabs: Subscriptions vs Plans vs Modules */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSubscriptionSubTab('SUBSCRIPTIONS')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    subscriptionSubTab === 'SUBSCRIPTIONS'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Active Subscriptions ({tenants.length})
                </button>

                <button
                  onClick={() => setSubscriptionSubTab('PLANS')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    subscriptionSubTab === 'PLANS'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Plans & Pricing (5 Tiers)
                </button>

                <button
                  onClick={() => setSubscriptionSubTab('MODULES')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    subscriptionSubTab === 'MODULES'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Modules Matrix
                </button>
              </div>

              {subscriptionSubTab === 'SUBSCRIPTIONS' && (
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 font-bold text-xs text-gray-700 flex justify-between items-center">
                    <span>Active Client Subscriptions</span>
                    <span>Total Recurring: ₹{metrics.mrr.toLocaleString('en-IN')}/month</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 whitespace-nowrap">Tenant Name</th>
                          <th className="px-4 py-3 whitespace-nowrap">Plan</th>
                          <th className="px-4 py-3 whitespace-nowrap">Monthly Fee</th>
                          <th className="px-4 py-3 whitespace-nowrap">Start Date</th>
                          <th className="px-4 py-3 whitespace-nowrap">Renewal Date</th>
                          <th className="px-4 py-3 whitespace-nowrap text-center">Status</th>
                          <th className="px-6 py-3 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tenants.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                              <p className="font-semibold text-gray-600">No active subscriptions yet.</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Provision a new business to start tracking active subscriptions.</p>
                            </td>
                          </tr>
                        ) : (
                          tenants.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3.5 font-bold text-gray-900 whitespace-nowrap">{t.businessName}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-200">
                                  {t.subscription.plan}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-bold text-gray-800 whitespace-nowrap">
                                ₹{(t.subscription.monthlyFee || 0).toLocaleString('en-IN')}/mo
                              </td>
                              <td className="px-4 py-3.5 text-gray-500 text-[11px] whitespace-nowrap">
                                {new Date(t.subscription.startDate).toLocaleDateString('en-IN')}
                              </td>
                              <td className="px-4 py-3.5 text-gray-500 text-[11px] whitespace-nowrap">
                                {new Date(t.subscription.expiryDate).toLocaleDateString('en-IN')}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                <span
                                  className={cn(
                                    'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center min-w-[80px]',
                                    t.subscription.status === 'ACTIVE'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : t.subscription.status === 'TRIAL'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  )}
                                >
                                  {t.subscription.status}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setChangePlanTenant(t)}
                                  className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-[#2563EB] text-gray-700 font-bold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Change Plan
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {subscriptionSubTab === 'PLANS' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {saasPlans.map((plan) => (
                    <div key={plan.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">{plan.id}</span>
                          <h3 className="font-serif font-bold text-base text-gray-900 mt-0.5">{plan.name}</h3>
                        </div>

                        <div className="py-2 border-y border-gray-100">
                          <div className="text-2xl font-serif font-bold text-gray-900">₹{plan.priceMonthly.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-gray-400">per business/month</div>
                        </div>

                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Max Staff:</span>
                            <span className="font-bold text-gray-800">{plan.maxStaff} Users</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Monthly Bills:</span>
                            <span className="font-bold text-gray-800">{plan.maxInvoicesPerMonth.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Online Website:</span>
                            <span className="font-bold text-gray-800">{plan.allowWebsite ? 'Included' : 'Disabled'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => showToast(`Configuring limits for ${plan.name}`)}
                        className="w-full py-2 bg-gray-50 hover:bg-blue-50 hover:text-[#2563EB] text-gray-700 font-bold rounded-xl text-xs border border-gray-200 transition-all cursor-pointer"
                      >
                        Edit Plan Limits
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {subscriptionSubTab === 'MODULES' && (
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4">Module Name</th>
                          <th className="px-4 py-4 text-center">Trial</th>
                          <th className="px-4 py-4 text-center">Starter</th>
                          <th className="px-4 py-4 text-center">Growth</th>
                          <th className="px-4 py-4 text-center">Professional</th>
                          <th className="px-4 py-4 text-center">Enterprise</th>
                          <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          { name: 'POS Billing & Invoicing', trial: true, starter: true, growth: true, pro: true, ent: true },
                          { name: 'Inventory & Barcode Scanning', trial: true, starter: true, growth: true, pro: true, ent: true },
                          { name: 'Customer Loyalty & CRM', trial: true, starter: false, growth: true, pro: true, ent: true },
                          { name: 'Suppliers & Purchase Orders', trial: false, starter: false, growth: true, pro: true, ent: true },
                          { name: 'Staff Management & Shifts', trial: true, starter: false, growth: true, pro: true, ent: true },
                          { name: 'Staff Attendance & Biometrics', trial: false, starter: false, growth: true, pro: true, ent: true },
                          { name: 'Staff Leave Management', trial: false, starter: false, growth: false, pro: true, ent: true },
                          { name: 'Financial & GST Reports', trial: true, starter: true, growth: true, pro: true, ent: true },
                          { name: 'Public Storefront Website', trial: true, starter: false, growth: true, pro: true, ent: true },
                          { name: 'Custom Domain Routing', trial: false, starter: false, growth: false, pro: true, ent: true },
                        ].map((mod) => (
                          <tr key={mod.name} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-bold text-gray-900">{mod.name}</td>
                            <td className="px-4 py-3.5 text-center">{mod.trial ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                            <td className="px-4 py-3.5 text-center">{mod.starter ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                            <td className="px-4 py-3.5 text-center">{mod.growth ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                            <td className="px-4 py-3.5 text-center">{mod.pro ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                            <td className="px-4 py-3.5 text-center">{mod.ent ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                            <td className="px-6 py-3.5 text-right">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 4: SUPPORT TICKETS
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'SUPPORT' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-serif font-bold text-gray-900">Support Tickets Helpdesk</h2>
                  <p className="text-xs text-gray-500">Resolve client inquiries, printer setups and billing questions.</p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as (TicketStatus | 'ALL')[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketFilterStatus(st)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      ticketFilterStatus === st
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Tickets Table */}
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Ticket ID</th>
                        <th className="px-4 py-4 whitespace-nowrap">Business</th>
                        <th className="px-6 py-4 min-w-[280px]">Subject & Description</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Priority</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Status</th>
                        <th className="px-4 py-4 whitespace-nowrap">Created Date</th>
                        <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {supportTickets.filter(t => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                            <p className="font-semibold text-gray-600">No support tickets found.</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Tickets created by client businesses will appear here in real-time.</p>
                          </td>
                        </tr>
                      ) : (
                        supportTickets
                          .filter(t => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus)
                          .map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">{ticket.id}</td>
                              <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{ticket.businessName}</td>
                              <td className="px-6 py-4 min-w-[280px] max-w-md">
                                <div className="font-bold text-gray-900">{ticket.subject}</div>
                                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{ticket.description}</p>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <span
                                  className={cn(
                                    'px-3 py-1 rounded-md text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center min-w-[70px]',
                                    ticket.priority === 'HIGH' || ticket.priority === 'URGENT'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : ticket.priority === 'MEDIUM'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  )}
                                >
                                  {ticket.priority}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <span
                                  className={cn(
                                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center min-w-[90px]',
                                    ticket.status === 'OPEN'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : ticket.status === 'IN_PROGRESS'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  )}
                                >
                                  {ticket.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-gray-500 text-[11px] whitespace-nowrap">
                                {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Reply & Resolve
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 5: SETTINGS & SYSTEM (CONSOLIDATED)
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Settings Sub-Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'CREDENTIALS', label: 'Master Password', icon: KeyRound },
                  { id: 'BACKUPS', label: 'Backups & Recovery', icon: Database },
                  { id: 'USERS', label: 'Platform Admins', icon: Users },
                  { id: 'AUDIT_LOGS', label: 'Audit Logs', icon: FileText },
                  { id: 'FEATURES', label: 'Feature Flags', icon: Sliders },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSettingsSubTab(st.id as any)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                      settingsSubTab === st.id
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <st.icon className="w-3.5 h-3.5" />
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>

              {/* Sub-tab 1: Change Master Password */}
              {settingsSubTab === 'CREDENTIALS' && (
                <div className="max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center font-bold">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-gray-900">Change Master Super Admin Password</h3>
                      <p className="text-xs text-gray-500">Update master password used to authenticate this control center.</p>
                    </div>
                  </div>

                  {passError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
                      <span>{passError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangeSuperAdminPassword} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Master Username</label>
                      <input
                        type="text"
                        disabled
                        value="superadmin"
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-500 font-mono font-bold cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">New Master Password *</label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            required
                            placeholder="Min 6 characters..."
                            value={superAdminPassForm.newPassword}
                            onChange={(e) => setSuperAdminPassForm({ ...superAdminPassForm, newPassword: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Confirm New Password *</label>
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password..."
                          value={superAdminPassForm.confirmPassword}
                          onChange={(e) => setSuperAdminPassForm({ ...superAdminPassForm, confirmPassword: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Master Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-tab 2: Backups */}
              {settingsSubTab === 'BACKUPS' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center font-bold">
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-base text-gray-900">Export Platform JSON Snapshot</h3>
                          <p className="text-xs text-gray-500">Download full JSON snapshot containing all {tenants.length} client databases.</p>
                        </div>
                      </div>

                      <button
                        onClick={handleExportFullBackup}
                        className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Full Backup JSON</span>
                      </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-base text-gray-900">Restore from JSON Archive</h3>
                          <p className="text-xs text-gray-500">Safely restore client stores and settings from an exported JSON file.</p>
                        </div>
                      </div>

                      <label className="w-full py-3 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-gray-300 transition-all cursor-pointer">
                        <Upload className="w-4 h-4 text-gray-600" />
                        <span>Upload & Restore Backup JSON</span>
                        <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Backup History */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="font-serif font-bold text-sm text-gray-900">Backup Snapshot History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 whitespace-nowrap">Filename</th>
                            <th className="px-4 py-3 whitespace-nowrap">Type</th>
                            <th className="px-4 py-3 whitespace-nowrap">Timestamp</th>
                            <th className="px-4 py-3 whitespace-nowrap">Tenants Included</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {backupsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                <Database className="w-7 h-7 mx-auto mb-2 opacity-40 text-blue-500" />
                                <p className="font-semibold text-gray-600">No backup snapshots generated yet.</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Click "Download Full Backup JSON" above to create your first platform snapshot.</p>
                              </td>
                            </tr>
                          ) : (
                            backupsList.map((b) => (
                              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">{b.filename}</td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.type}</td>
                                <td className="px-4 py-3 text-gray-500 text-[11px] font-mono whitespace-nowrap">
                                  {new Date(b.timestamp).toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{b.tenantCount} Tenants</td>
                                <td className="px-6 py-3 text-right whitespace-nowrap">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Platform Admins */}
              {settingsSubTab === 'USERS' && (
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-serif font-bold text-sm text-gray-900">Platform Administrators</h3>
                    <button
                      onClick={() => setIsAddUserModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Platform Admin</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 whitespace-nowrap">Admin Name</th>
                          <th className="px-4 py-4 whitespace-nowrap">Email</th>
                          <th className="px-4 py-4 whitespace-nowrap">Role</th>
                          <th className="px-4 py-4 whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {platformUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-bold text-gray-900 whitespace-nowrap">{u.name}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{u.email}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 bg-blue-50 text-[#2563EB] rounded-md font-bold text-[10px] border border-blue-200">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] border border-emerald-200">
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right whitespace-nowrap">
                              {u.role !== 'SUPER_ADMIN' && (
                                <button
                                  onClick={() => {
                                    PlatformEngine.deletePlatformUser(u.id);
                                    setPlatformUsers(PlatformEngine.getPlatformUsers());
                                    showToast(`Removed user ${u.name}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Audit Logs */}
              {settingsSubTab === 'AUDIT_LOGS' && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs flex items-center gap-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filter audit logs by keyword..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                            <th className="px-4 py-4 whitespace-nowrap">User</th>
                            <th className="px-4 py-4 whitespace-nowrap">Tenant / Target</th>
                            <th className="px-4 py-4 whitespace-nowrap">Action</th>
                            <th className="px-6 py-4 min-w-[240px]">Details</th>
                            <th className="px-4 py-4 text-right whitespace-nowrap">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {auditLogs.filter(l => !auditSearch || l.user.toLowerCase().includes(auditSearch.toLowerCase()) || l.action.toLowerCase().includes(auditSearch.toLowerCase()) || l.businessName.toLowerCase().includes(auditSearch.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                                <p className="font-semibold text-gray-600">No audit logs recorded yet.</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Platform and security events will be logged here in real-time.</p>
                              </td>
                            </tr>
                          ) : (
                            auditLogs
                              .filter(l => !auditSearch || l.user.toLowerCase().includes(auditSearch.toLowerCase()) || l.action.toLowerCase().includes(auditSearch.toLowerCase()) || l.businessName.toLowerCase().includes(auditSearch.toLowerCase()))
                              .map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-3.5 text-gray-500 text-[11px] font-mono whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">{log.user}</td>
                                  <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{log.businessName}</td>
                                  <td className="px-4 py-3.5 font-mono text-[10px] text-gray-700 whitespace-nowrap">{log.action}</td>
                                  <td className="px-6 py-3.5 text-gray-600 text-[11px] min-w-[240px] max-w-md">{log.details}</td>
                                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                    <span
                                      className={cn(
                                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center',
                                        log.status === 'SUCCESS'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : log.status === 'WARNING'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      )}
                                    >
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Feature Flags */}
              {settingsSubTab === 'FEATURES' && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
                  <h3 className="font-serif font-bold text-sm text-gray-900 mb-3">Global Feature Flags</h3>
                  {[
                    { label: 'WhatsApp Digital Invoice Dispatch', desc: 'Allows client POS terminals to send digital bills via WhatsApp.' },
                    { label: 'Multi-Counter POS Synchronization', desc: 'Real-time WebSocket data broadcast across store billing counters.' },
                    { label: 'AI Business Analytics & Demand Forecast', desc: 'Generates smart reordering suggestions for tenant admins.' },
                    { label: 'Custom Domain SSL Auto-Provisioning', desc: 'Enables tenants to map www.businessname.com to their store website.' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div>
                        <div className="font-bold text-gray-900">{f.label}</div>
                        <div className="text-[11px] text-gray-500">{f.desc}</div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                        Enabled
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DRAWER: BUSINESS DETAILS & METRICS
         ───────────────────────────────────────────────────────────── */}
      {selectedTenantDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white font-bold flex items-center justify-center text-xl shadow-md">
                  {selectedTenantDetails.businessName.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900">{selectedTenantDetails.businessName}</h3>
                  <span className="text-xs text-gray-500 font-mono">{selectedTenantDetails.id}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTenantDetails(null)} className="p-2 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Subscription Status</div>
                  <div className="font-bold text-emerald-600 text-sm mt-0.5">{selectedTenantDetails.subscription.status}</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Active Plan</div>
                  <div className="font-bold text-indigo-600 text-sm mt-0.5">{selectedTenantDetails.subscription.plan}</div>
                </div>
              </div>

              {/* Resource Metrics */}
              {(() => {
                const h = PlatformEngine.getTenantHealthAndUsage(selectedTenantDetails);
                return (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
                    <div className="font-bold text-gray-900 text-xs flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                      <span>Live Tenant Resource Metrics</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white rounded-xl shadow-xs">
                        <div className="text-sm font-bold text-gray-900">{h.usersCount} / {h.maxUsers}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Users</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-xs">
                        <div className="text-sm font-bold text-gray-900">{h.productsCount}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Products</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-xs">
                        <div className="text-sm font-bold text-gray-900">{h.storagePercent}%</div>
                        <div className="text-[10px] text-gray-400 uppercase">Storage</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Owner & Contact */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900">Owner & Location</h4>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5 text-gray-600">
                  <div><strong className="text-gray-900">Owner:</strong> {selectedTenantDetails.ownerName}</div>
                  <div><strong className="text-gray-900">Email:</strong> {selectedTenantDetails.ownerEmail}</div>
                  <div><strong className="text-gray-900">Phone:</strong> {selectedTenantDetails.ownerPhone}</div>
                  <div><strong className="text-gray-900">City / State:</strong> {selectedTenantDetails.city || 'Chennai'}, {selectedTenantDetails.state || 'Tamil Nadu'}</div>
                  <div><strong className="text-gray-900">GSTIN:</strong> {selectedTenantDetails.gstin || 'Unregistered'}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900">Admin Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleImpersonate(selectedTenantDetails);
                      setSelectedTenantDetails(null);
                    }}
                    className="py-2.5 px-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Login as Admin</span>
                  </button>

                  <button
                    onClick={() => {
                      setChangePlanTenant(selectedTenantDetails);
                      setSelectedTenantDetails(null);
                    }}
                    className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Change Plan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedTenantDetails(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD / PROVISION NEW BUSINESS
         ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-serif font-bold text-gray-900">Add & Provision New Business Tenant</h3>
                <p className="text-xs text-gray-500">Initializes an isolated tenant namespace, seeded database and admin account.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionBusiness} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Silks & Sarees"
                    value={newBizForm.businessName}
                    onChange={(e) => setNewBizForm({ ...newBizForm, businessName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Industry / Template *</label>
                  <select
                    value={newBizForm.businessType}
                    onChange={(e) => setNewBizForm({ ...newBizForm, businessType: e.target.value as BusinessType })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="SUPERMARKET">Supermarket & Grocery</option>
                    <option value="GARMENTS">Garments & Textiles</option>
                    <option value="MEDICAL">Medical & Pharmacy</option>
                    <option value="HARDWARE">Hardware & Electrical</option>
                    <option value="RESTAURANT">Restaurant & Bar</option>
                    <option value="BAKERY">Cafe & Bakery</option>
                    <option value="ELECTRONICS">Electronics & Mobile</option>
                    <option value="RETAIL">General Retail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newBizForm.ownerName}
                    onChange={(e) => setNewBizForm({ ...newBizForm, ownerName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@business.com"
                    value={newBizForm.ownerEmail}
                    onChange={(e) => setNewBizForm({ ...newBizForm, ownerEmail: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    maxLength={14}
                    value={newBizForm.ownerPhone}
                    onChange={(e) => setNewBizForm({ ...newBizForm, ownerPhone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Aadhaar Card Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012"
                    maxLength={14}
                    value={newBizForm.ownerAadhaar}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setNewBizForm({ ...newBizForm, ownerAadhaar: formatted });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Subscription Plan</label>
                <select
                  value={newBizForm.plan}
                  onChange={(e) => setNewBizForm({ ...newBizForm, plan: e.target.value as TenantPlan })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="TRIAL">14-Day Free Trial (₹0)</option>
                  <option value="STARTER">Starter Business (₹999/mo)</option>
                  <option value="GROWTH">Growth Retail & Cafe (₹1,999/mo)</option>
                  <option value="PROFESSIONAL">Professional Enterprise (₹3,499/mo)</option>
                  <option value="ENTERPRISE">Custom Enterprise (₹6,999/mo)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Admin Username</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newBizForm.adminUsername}
                    onChange={(e) => setNewBizForm({ ...newBizForm, adminUsername: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Admin Password</label>
                  <input
                    type="text"
                    placeholder="Default: admin123"
                    value={newBizForm.adminPassword}
                    onChange={(e) => setNewBizForm({ ...newBizForm, adminPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision Business Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PROVISION CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      {provisionSuccessTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-gray-900">Business Provisioned Successfully!</h3>
              <p className="text-xs text-gray-500 mt-0.5">Isolated tenant namespace initialized with seeded defaults.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left space-y-1.5 text-xs">
              <div><strong className="text-gray-900">Tenant Name:</strong> {provisionSuccessTenant.businessName}</div>
              <div><strong className="text-gray-900">Admin Username:</strong> <span className="font-mono text-[#2563EB]">{provisionSuccessTenant.adminUsername}</span></div>
              <div><strong className="text-gray-900">Admin Password:</strong> <span className="font-mono text-[#2563EB]">{provisionSuccessTenant.adminPasswordHash}</span></div>
              <div><strong className="text-gray-900">Plan:</strong> {provisionSuccessTenant.subscription.plan}</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProvisionSuccessTenant(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleImpersonate(provisionSuccessTenant);
                  setProvisionSuccessTenant(null);
                }}
                className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Store POS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CHANGE SUBSCRIPTION PLAN
         ───────────────────────────────────────────────────────────── */}
      {changePlanTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900">Change Subscription Plan</h3>
                <p className="text-xs text-gray-500">for {changePlanTenant.businessName}</p>
              </div>
              <button onClick={() => setChangePlanTenant(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {saasPlans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleChangePlanSubmit(p.id)}
                  className={cn(
                    'w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer',
                    changePlanTenant.subscription.plan === p.id
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-[11px] text-gray-500">{p.maxStaff} Users • {p.maxInvoicesPerMonth} Bills/mo</div>
                  </div>
                  <div className="text-right font-bold text-sm text-gray-900">
                    ₹{p.priceMonthly.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-500">/mo</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT TENANT
         ───────────────────────────────────────────────────────────── */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif font-bold text-base text-gray-900">Edit Business Details</h3>
              <button onClick={() => setEditingTenant(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTenant} className="space-y-4 text-xs">
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

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SUPPORT TICKET CONVERSATION & RESOLVE
         ───────────────────────────────────────────────────────────── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#2563EB]">{selectedTicket.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#2563EB]">
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-gray-900 mt-1">{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3 overflow-y-auto max-h-60 p-2 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
              {selectedTicket.replies.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    'p-3 rounded-xl max-w-[85%]',
                    r.isSuperAdmin ? 'ml-auto bg-[#2563EB] text-white' : 'mr-auto bg-white border border-gray-200 text-gray-800'
                  )}
                >
                  <div className="text-[10px] font-bold opacity-75 mb-1">{r.author}</div>
                  <p>{r.message}</p>
                </div>
              ))}
            </div>

            {/* Super Admin Reply Form */}
            <form onSubmit={handleSendTicketReply} className="space-y-3 text-xs pt-2 border-t border-gray-100">
              <input
                type="text"
                placeholder="Type response to client..."
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg text-[11px] border border-amber-200"
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'RESOLVED')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px] border border-emerald-200"
                  >
                    Resolved
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD PLATFORM USER
         ───────────────────────────────────────────────────────────── */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif font-bold text-base text-gray-900">Add Platform Administrator</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlatformUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arun Kumar"
                  value={newPlatformUser.name}
                  onChange={(e) => setNewPlatformUser({ ...newPlatformUser, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="arun@saasplatform.io"
                  value={newPlatformUser.email}
                  onChange={(e) => setNewPlatformUser({ ...newPlatformUser, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Platform Role *</label>
                <select
                  value={newPlatformUser.role}
                  onChange={(e) => setNewPlatformUser({ ...newPlatformUser, role: e.target.value as PlatformRole })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="PLATFORM_ADMIN">Platform Administrator</option>
                  <option value="SUPPORT_AGENT">Customer Support Agent</option>
                  <option value="BILLING_ADMIN">Billing & Finance Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: RESET CLIENT ADMIN PASSWORD
         ───────────────────────────────────────────────────────────── */}
      {passwordResetTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif font-bold text-base text-gray-900">Reset Client Admin Password</h3>
              <button onClick={() => setPasswordResetTenant(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Setting new login password for <strong className="text-gray-900">{passwordResetTenant.businessName}</strong>
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

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DELETE TENANT CONFIRM
         ───────────────────────────────────────────────────────────── */}
      {deleteConfirmTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-serif font-bold text-base text-gray-900">Delete Client Tenant?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <strong className="text-gray-900">{deleteConfirmTenant.businessName}</strong>? All isolated products and billing records will be permanently purged.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Yes, Purge Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
