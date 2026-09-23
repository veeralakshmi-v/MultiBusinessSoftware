import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { BusinessTemplate, BusinessType } from '../types/template';
import { ModuleId, EnabledModulesState, UserRole } from '../types/module';
import { TemplateResolver } from '../lib/templates/templateResolver';
import { ModuleEngine } from '../lib/modules/moduleEngine';
import { TenantEngine, Tenant, TenantStatus } from '../lib/tenant/tenantEngine';

export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'STAFF' | string;

export interface User {
  id: string;
  username: string;
  role: Role;
  businessId?: string;
  businessType?: BusinessType;
  applicationAccess?: string;
}

export interface LandingSlide {
  id: string;
  imageUrl: string;
  caption: string;
  subCaption?: string;
}

export interface BusinessProfile {
  businessName: string;
  legalName?: string;
  tagline: string;
  landingTagline?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone: string;
  email: string;
  gstin: string;
  fssai?: string;
  currencySymbol: string;
  currencyCode: string;
  invoicePrefix: string;
  orderPrefix: string;
  nextInvoiceNumber: number;
  defaultTaxRate: number;
  taxMode: 'EXCLUSIVE' | 'INCLUSIVE';
  paperSize: '80MM' | '58MM' | 'A4';
  termsText: string;
  thankYouNote: string;
  logoUrl?: string;
  landingSlides?: LandingSlide[];
}

const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'My Business',
  legalName: 'My Business Enterprises',
  tagline: 'Complete Point of Sale & Invoicing System',
  landingTagline: 'Your trusted business partner for billing, inventory and customer management.',
  address: '124, Commercial Road, Central Plaza, Chennai - 600001',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600001',
  phone: '+91 98765 43210',
  email: 'contact@mybusiness.com',
  gstin: '33AAAAA0000A1Z5',
  fssai: '12421001000543',
  currencySymbol: '₹',
  currencyCode: 'INR',
  invoicePrefix: 'INV/2026/',
  orderPrefix: 'ORD-',
  nextInvoiceNumber: 1001,
  defaultTaxRate: 5.0,
  taxMode: 'EXCLUSIVE',
  paperSize: '80MM',
  termsText: 'Goods once sold will not be taken back without original bill. Subject to local jurisdiction.',
  thankYouNote: 'Thank you for your business! Please visit us again 😊',
  logoUrl: '',
  landingSlides: [],
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  businessId: string;
  businessType: BusinessType;
  activeTemplate: BusinessTemplate;
  enabledModules: EnabledModulesState;
  businessProfile: BusinessProfile;
  updateBusinessProfile: (newProfile: Partial<BusinessProfile>) => void;
  setBusinessType: (type: BusinessType) => void;
  setModuleEnabled: (moduleId: ModuleId, enabled: boolean) => void;
  isModuleActive: (moduleId: ModuleId) => boolean;
  hasPermission: (permissionKey: string) => boolean;
  permissions: Record<string, boolean>;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  tenants: Tenant[];
  activeTenant: Tenant | null;
  createTenant: (data: Parameters<typeof TenantEngine.createTenant>[0]) => Tenant;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => Tenant | null;
  deleteTenant: (tenantId: string) => boolean;
  setTenantStatus: (tenantId: string, status: TenantStatus) => Tenant | null;
  refreshTenants: () => void;
}

const DEFAULT_BUSINESS_ID = 'biz-default-business';
const DEFAULT_BUSINESS_TYPE: BusinessType = 'RETAIL';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { CloudSync } from '../lib/sync/cloudSync';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(false);

  // SaaS Tenants Registry State
  const [tenants, setTenants] = useState<Tenant[]>(() => TenantEngine.getTenants());

  useEffect(() => {
    const handleTenantsUpdated = () => setTenants(TenantEngine.getTenants());
    window.addEventListener('saas_tenants_updated', handleTenantsUpdated);
    return () => window.removeEventListener('saas_tenants_updated', handleTenantsUpdated);
  }, []);

  // Sync cloud database on mount and whenever user/business changes
  useEffect(() => {
    const targetBizId = user?.businessId || localStorage.getItem('businessId') || DEFAULT_BUSINESS_ID;
    CloudSync.syncAllData(targetBizId);
  }, [user?.businessId]);

  // Determine active tenant
  const activeTenant = useMemo(() => {
    const list = tenants.length > 0 ? tenants : TenantEngine.getTenants();
    const storedBizId = user?.businessId || localStorage.getItem('businessId');
    if (storedBizId && storedBizId !== DEFAULT_BUSINESS_ID) {
      const found = list.find(t => t.id === storedBizId) || TenantEngine.getTenantById(storedBizId);
      if (found) return found;
    }
    // Fallback to first non-default tenant if available
    const nonDefault = list.filter(t => t.id !== DEFAULT_BUSINESS_ID);
    if (nonDefault.length > 0) {
      return nonDefault[0];
    }
    return list[0] || null;
  }, [tenants, user?.businessId]);

  const [businessId, setBusinessId] = useState<string>(() => {
    return user?.businessId || localStorage.getItem('businessId') || DEFAULT_BUSINESS_ID;
  });

  const [businessType, setBusinessTypeState] = useState<BusinessType>(() => {
    if (activeTenant) return activeTenant.businessType;
    return (localStorage.getItem('businessType') as BusinessType) || DEFAULT_BUSINESS_TYPE;
  });

  // Keep businessId and businessType in sync with activeTenant
  useEffect(() => {
    if (activeTenant) {
      setBusinessId(activeTenant.id);
      setBusinessTypeState(activeTenant.businessType);
      localStorage.setItem('businessId', activeTenant.id);
      localStorage.setItem('businessType', activeTenant.businessType);
    }
  }, [activeTenant]);

  // Universal Business Profile State (isolated per tenant when activeTenant is set)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const eff = activeTenant || (TenantEngine.getTenants().length > 0 ? TenantEngine.getTenants()[0] : null);
    const tenantPrefix = eff ? `tenant_${eff.id}_` : '';
    const saved = localStorage.getItem(`${tenantPrefix}business_profile`) || localStorage.getItem('universal_business_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.businessName && parsed.businessName !== 'My Business') {
          return { ...DEFAULT_BUSINESS_PROFILE, ...parsed };
        }
      } catch {}
    }
    if (eff) {
      return {
        ...DEFAULT_BUSINESS_PROFILE,
        businessName: eff.businessName,
        legalName: eff.legalEntityName || eff.businessName,
        phone: eff.ownerPhone,
        email: eff.ownerEmail,
        gstin: eff.gstin || '',
        city: eff.city || 'Chennai',
        state: eff.state || 'Tamil Nadu',
        currencySymbol: eff.currencySymbol || '₹',
        currencyCode: eff.currency || 'INR',
        invoicePrefix: `${eff.businessName.slice(0, 3).toUpperCase()}/2026/`,
      };
    }
    return DEFAULT_BUSINESS_PROFILE;
  });

  // Reload business profile when activeTenant changes
  useEffect(() => {
    if (activeTenant) {
      const tenantPrefix = `tenant_${activeTenant.id}_`;
      const saved = localStorage.getItem(`${tenantPrefix}business_profile`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.businessName && parsed.businessName !== 'My Business') {
            setBusinessProfile({ ...DEFAULT_BUSINESS_PROFILE, ...parsed });
            return;
          }
        } catch {}
      }
      const newProf = {
        ...DEFAULT_BUSINESS_PROFILE,
        businessName: activeTenant.businessName,
        legalName: activeTenant.legalEntityName || activeTenant.businessName,
        phone: activeTenant.ownerPhone,
        email: activeTenant.ownerEmail,
        gstin: activeTenant.gstin || '',
        city: activeTenant.city || 'Chennai',
        state: activeTenant.state || 'Tamil Nadu',
        currencySymbol: activeTenant.currencySymbol || '₹',
        currencyCode: activeTenant.currency || 'INR',
        invoicePrefix: `${activeTenant.businessName.slice(0, 3).toUpperCase()}/2026/`,
      };
      setBusinessProfile(newProf);
      localStorage.setItem(`${tenantPrefix}business_profile`, JSON.stringify(newProf));
    }
  }, [activeTenant?.id, activeTenant?.businessName]);

  const updateBusinessProfile = (updates: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => {
      const updated = { ...prev, ...updates };
      try {
        const tenantPrefix = activeTenant ? `tenant_${activeTenant.id}_` : '';
        localStorage.setItem(`${tenantPrefix}business_profile`, JSON.stringify(updated));
        localStorage.setItem('universal_business_profile', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist business profile to localStorage:', err);
      }

      // Persist to backend database API
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-business-id': activeTenant?.id || businessId,
          },
          body: JSON.stringify(updated),
        }).catch(() => {});
      } catch (e) {}

      return updated;
    });
    window.dispatchEvent(new Event('settings_updated'));
  };

  const createTenant = (data: Parameters<typeof TenantEngine.createTenant>[0]): Tenant => {
    const created = TenantEngine.createTenant(data);
    // Post to Supabase PostgreSQL database
    fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
    }).catch(err => console.warn('Failed to post tenant to API:', err));
    refreshTenants();
    return created;
  };

  const updateTenant = (tenantId: string, updates: Partial<Tenant>): Tenant | null => {
    const updated = TenantEngine.updateTenant(tenantId, updates);
    if (updated) {
      fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(err => console.warn('Failed to update tenant in API:', err));
    }
    refreshTenants();
    return updated;
  };

  const deleteTenant = (tenantId: string): boolean => {
    const res = TenantEngine.deleteTenant(tenantId);
    fetch(`/api/tenants/${tenantId}`, { method: 'DELETE' }).catch(() => {});
    refreshTenants();
    return res;
  };

  const setTenantStatus = (tenantId: string, status: TenantStatus): Tenant | null => {
    const updated = TenantEngine.setTenantStatus(tenantId, status);
    if (updated) {
      fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(err => console.warn('Failed to update tenant status in API:', err));
    }
    refreshTenants();
    return updated;
  };

  const syncTenantsWithBackend = useCallback(async (): Promise<Tenant[]> => {
    try {
      const res = await fetch('/api/tenants');
      if (!res.ok) {
        return TenantEngine.getTenants();
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const existing = TenantEngine.getTenants();
        const existingMap = new Map(existing.map(t => [t.id, t]));

        const mapped: Tenant[] = data.map((b: any) => {
          const p = b.profileSettings || {};
          const u = b.users?.[0] || {};
          const prev = existingMap.get(b.id);

          return {
            id: b.id,
            businessName: p.businessName || b.name,
            legalEntityName: p.legalName || p.businessName || b.name,
            ownerName: p.legalName || p.businessName || b.name,
            ownerEmail: p.email || prev?.ownerEmail || '',
            ownerPhone: p.phone || prev?.ownerPhone || '',
            ownerAadhaar: p.gstin || prev?.ownerAadhaar || '',
            adminUsername: u.username || prev?.adminUsername || b.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            adminPasswordHash: u.password || prev?.adminPasswordHash || 'admin123',
            businessType: b.type || prev?.businessType || 'RETAIL',
            currency: p.currencyCode || prev?.currency || 'INR',
            currencySymbol: p.currencySymbol || prev?.currencySymbol || '₹',
            gstin: p.gstin || prev?.gstin || '',
            city: p.city || prev?.city || 'Chennai',
            state: p.state || prev?.state || 'Tamil Nadu',
            address: p.address || prev?.address || '',
            subdomain: prev?.subdomain || b.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            subscription: prev?.subscription || {
              plan: 'GROWTH',
              status: b.isActive ? 'ACTIVE' : 'SUSPENDED',
              startDate: b.createdAt || new Date().toISOString(),
              expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
              monthlyFee: 1999,
              maxStaff: 10,
              maxInvoicesPerMonth: 2500,
              allowWebsite: true,
              allowCustomDomain: false,
              autoRenew: true,
            },
            createdAt: b.createdAt || prev?.createdAt || new Date().toISOString(),
            updatedAt: b.updatedAt || prev?.updatedAt || new Date().toISOString(),
            totalInvoicesCount: prev?.totalInvoicesCount || 0,
            totalRevenueGenerated: prev?.totalRevenueGenerated || 0,
            notes: prev?.notes || '',
          };
        });

        TenantEngine.saveTenants(mapped);
        setTenants(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Failed to sync tenants from Supabase API:', e);
    }
    return TenantEngine.getTenants();
  }, []);

  const refreshTenants = useCallback(() => {
    setTenants(TenantEngine.getTenants());
    syncTenantsWithBackend();
  }, [syncTenantsWithBackend]);

  // Sync Tenants from backend Supabase database on mount
  useEffect(() => {
    syncTenantsWithBackend();
  }, [syncTenantsWithBackend]);

  const activeTemplate = useMemo(() => {
    const base = TemplateResolver.getTemplate(businessType);
    // Overlay universal business profile
    return {
      ...base,
      name: businessProfile.businessName,
      invoiceLayout: {
        ...base.invoiceLayout,
        headerTitle: businessProfile.businessName,
        tagline: businessProfile.tagline,
        termsText: businessProfile.termsText,
        thankYouNote: businessProfile.thankYouNote,
      },
      settingsDefaults: {
        ...base.settingsDefaults,
        currencySymbol: businessProfile.currencySymbol,
        currencyCode: businessProfile.currencyCode,
        defaultTaxRate: businessProfile.defaultTaxRate,
        taxCalculationMode: businessProfile.taxMode,
        counterPrefix: businessProfile.invoicePrefix,
        orderPrefix: businessProfile.orderPrefix,
      }
    };
  }, [businessType, businessProfile]);

  // Enabled Modules state initialized from template defaults or localStorage overrides
  const [enabledModules, setEnabledModules] = useState<EnabledModulesState>(() => {
    const saved = localStorage.getItem('universal_enabled_modules');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      sales: true,
      catalog: true,
      inventory: true,
      reports: true,
      crm: true,
      settings: true,
      users: true,
      promotions: true,
      tables: false,
      kitchen: false,
      purchase: false,
      delivery: false,
      accounts: false,
    };
  });

  // Compute permissions map for current user role and enabled modules
  const allPermissions = useMemo(() => {
    return ModuleEngine.generatePermissions(enabledModules, activeTemplate);
  }, [enabledModules, activeTemplate]);

  const userPermissions = useMemo(() => {
    const role = (user?.role || 'CASHIER') as UserRole;
    return allPermissions[role] || {};
  }, [allPermissions, user?.role]);

  const setModuleEnabled = (moduleId: ModuleId, enabled: boolean) => {
    setEnabledModules(prev => {
      const updated = { ...prev, [moduleId]: enabled };
      localStorage.setItem('universal_enabled_modules', JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('modules_updated'));
  };

  const isModuleActive = (moduleId: ModuleId) => {
    return ModuleEngine.isModuleEnabled(moduleId, enabledModules);
  };

  const hasPermission = (permissionKey: string) => {
    if (user?.role === 'ADMIN') return true;
    return Boolean(userPermissions[permissionKey]);
  };

  const setBusinessType = (newType: BusinessType) => {
    setBusinessTypeState(newType);
    localStorage.setItem('businessType', newType);
    if (user) {
      const updatedUser = { ...user, businessType: newType };
      setUser(updatedUser);
      localStorage.setItem('user_profile', JSON.stringify(updatedUser));
    }
    window.dispatchEvent(new Event('template_changed'));
    window.dispatchEvent(new Event('settings_updated'));
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed && (parsed.businessId || parsed.username !== 'admin')) {
            setUser(parsed);
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      try {
        const curBizId = activeTenant?.id || user?.businessId || localStorage.getItem('businessId') || '';
        const response = await fetch('/api/auth/me', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'x-business-id': curBizId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.user && data.user.username !== 'admin') {
            setUser(data.user);
            localStorage.setItem('user_profile', JSON.stringify(data.user));
          }
        }
      } catch (error) {
        // Retain local demo session
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const curBizId = activeTenant?.id || user?.businessId || localStorage.getItem('businessId');
        if (!curBizId || curBizId === DEFAULT_BUSINESS_ID) return;

        const res = await fetch(`/api/settings?businessId=${curBizId}`, {
          headers: { 'x-business-id': curBizId }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.businessName && data.businessName !== 'My Business') {
            setBusinessProfile(prev => ({
              ...prev,
              businessName: data.businessName || prev.businessName,
              legalName: data.legalName || prev.legalName,
              address: data.address || prev.address,
              phone: data.phone || prev.phone,
              email: data.email || prev.email,
              gstin: data.gstin || prev.gstin,
              currencySymbol: data.currencySymbol || prev.currencySymbol,
              currencyCode: data.currencyCode || prev.currencyCode,
              invoicePrefix: data.invoicePrefix || prev.invoicePrefix,
              nextInvoiceNumber: data.nextInvoiceNumber || prev.nextInvoiceNumber,
              taxMode: data.taxMode || prev.taxMode,
              termsText: data.termsText || prev.termsText,
              thankYouNote: data.thankYouNote || prev.thankYouNote,
              logoUrl: data.logoUrl || prev.logoUrl,
            }));
          }
        }
      } catch (err) {}
    };

    fetchSettings();
    fetchUser();
  }, [token, activeTenant?.id]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_profile', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    const targetBizId = newUser.businessId || DEFAULT_BUSINESS_ID;
    setBusinessId(targetBizId);
    localStorage.setItem('businessId', targetBizId);
    CloudSync.syncAllData(targetBizId);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('employee_session');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        businessId,
        businessType,
        activeTemplate,
        enabledModules,
        businessProfile,
        updateBusinessProfile,
        setBusinessType,
        setModuleEnabled,
        isModuleActive,
        hasPermission,
        permissions: userPermissions,
        login,
        logout,
        isLoading,
        tenants,
        activeTenant,
        createTenant,
        updateTenant,
        deleteTenant,
        setTenantStatus,
        refreshTenants,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
