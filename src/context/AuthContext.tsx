import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { BusinessTemplate, BusinessType } from '../types/template';
import { ModuleId, EnabledModulesState, UserRole } from '../types/module';
import { TemplateResolver } from '../lib/templates/templateResolver';
import { ModuleEngine } from '../lib/modules/moduleEngine';
import { TenantEngine, Tenant, TenantPlan, TenantStatus, SAAS_PLANS } from '../lib/tenant/tenantEngine';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'STAFF' | string;

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
  // Multi-Tenant SaaS & Super Admin
  isSuperAdmin: boolean;
  tenants: Tenant[];
  activeTenant: Tenant | null;
  impersonatingTenant: Tenant | null;
  impersonateTenant: (tenantId: string) => void;
  exitImpersonation: () => void;
  createTenant: (data: Parameters<typeof TenantEngine.createTenant>[0]) => Tenant;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => Tenant | null;
  deleteTenant: (tenantId: string) => boolean;
  setTenantStatus: (tenantId: string, status: TenantStatus) => Tenant | null;
  refreshTenants: () => void;
}

const DEFAULT_BUSINESS_ID = 'biz-apex-retail';
const DEFAULT_BUSINESS_TYPE: BusinessType = 'RETAIL';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const refreshTenants = () => {
    setTenants(TenantEngine.getTenants());
  };

  useEffect(() => {
    const handleTenantsUpdated = () => refreshTenants();
    window.addEventListener('saas_tenants_updated', handleTenantsUpdated);
    return () => window.removeEventListener('saas_tenants_updated', handleTenantsUpdated);
  }, []);

  // Super Admin Impersonation State
  const [impersonatingTenantId, setImpersonatingTenantId] = useState<string | null>(() => {
    return localStorage.getItem('saas_impersonating_tenant_id') || null;
  });

  const isSuperAdmin = useMemo(() => {
    return user?.role === 'SUPER_ADMIN' || user?.username === 'superadmin' || user?.username === 'admin@saas.com';
  }, [user]);

  // Determine active tenant
  const activeTenant = useMemo(() => {
    if (impersonatingTenantId) {
      return tenants.find(t => t.id === impersonatingTenantId) || null;
    }
    if (user?.businessId) {
      return tenants.find(t => t.id === user.businessId) || null;
    }
    return tenants[0] || null;
  }, [tenants, impersonatingTenantId, user?.businessId]);

  const impersonatingTenant = useMemo(() => {
    if (impersonatingTenantId) {
      return tenants.find(t => t.id === impersonatingTenantId) || null;
    }
    return null;
  }, [tenants, impersonatingTenantId]);

  const [businessId, setBusinessId] = useState<string>(() => {
    return impersonatingTenantId || user?.businessId || localStorage.getItem('businessId') || DEFAULT_BUSINESS_ID;
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
    const tenantPrefix = activeTenant ? `tenant_${activeTenant.id}_` : '';
    const saved = localStorage.getItem(`${tenantPrefix}business_profile`) || localStorage.getItem('universal_business_profile');
    if (saved) {
      try {
        return { ...DEFAULT_BUSINESS_PROFILE, ...JSON.parse(saved) };
      } catch {}
    }
    if (activeTenant) {
      return {
        ...DEFAULT_BUSINESS_PROFILE,
        businessName: activeTenant.businessName,
        legalName: activeTenant.legalEntityName,
        phone: activeTenant.ownerPhone,
        email: activeTenant.ownerEmail,
        gstin: activeTenant.gstin || '',
        city: activeTenant.city || 'Chennai',
        state: activeTenant.state || 'Tamil Nadu',
        currencySymbol: activeTenant.currencySymbol || '₹',
        currencyCode: activeTenant.currency || 'INR',
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
          setBusinessProfile({ ...DEFAULT_BUSINESS_PROFILE, ...JSON.parse(saved) });
          return;
        } catch {}
      }
      setBusinessProfile({
        ...DEFAULT_BUSINESS_PROFILE,
        businessName: activeTenant.businessName,
        legalName: activeTenant.legalEntityName,
        phone: activeTenant.ownerPhone,
        email: activeTenant.ownerEmail,
        gstin: activeTenant.gstin || '',
        city: activeTenant.city || 'Chennai',
        state: activeTenant.state || 'Tamil Nadu',
        currencySymbol: activeTenant.currencySymbol || '₹',
        currencyCode: activeTenant.currency || 'INR',
        invoicePrefix: `${activeTenant.businessName.slice(0, 3).toUpperCase()}/2026/`,
      });
    }
  }, [activeTenant?.id]);

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(() => {});
      } catch (e) {}

      return updated;
    });
    window.dispatchEvent(new Event('settings_updated'));
  };

  const impersonateTenant = (tenantId: string) => {
    const t = TenantEngine.getTenantById(tenantId);
    if (!t) return;
    setImpersonatingTenantId(t.id);
    localStorage.setItem('saas_impersonating_tenant_id', t.id);
    setBusinessId(t.id);
    setBusinessTypeState(t.businessType);
    window.dispatchEvent(new Event('saas_tenants_updated'));
  };

  const exitImpersonation = () => {
    setImpersonatingTenantId(null);
    localStorage.removeItem('saas_impersonating_tenant_id');
    window.dispatchEvent(new Event('saas_tenants_updated'));
  };

  const createTenant = (data: Parameters<typeof TenantEngine.createTenant>[0]): Tenant => {
    const created = TenantEngine.createTenant(data);
    refreshTenants();
    return created;
  };

  const updateTenant = (tenantId: string, updates: Partial<Tenant>): Tenant | null => {
    const updated = TenantEngine.updateTenant(tenantId, updates);
    refreshTenants();
    return updated;
  };

  const deleteTenant = (tenantId: string): boolean => {
    const res = TenantEngine.deleteTenant(tenantId);
    if (impersonatingTenantId === tenantId) {
      exitImpersonation();
    }
    refreshTenants();
    return res;
  };

  const setTenantStatus = (tenantId: string, status: TenantStatus): Tenant | null => {
    const updated = TenantEngine.setTenantStatus(tenantId, status);
    refreshTenants();
    return updated;
  };
  // Sync Business Profile settings from backend database API on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && (data.businessName || data.phone || data.email)) {
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
            taxMode: data.taxMode || prev.taxMode,
            termsText: data.termsText || prev.termsText,
            thankYouNote: data.thankYouNote || prev.thankYouNote,
            logoUrl: data.logoUrl || prev.logoUrl,
          }));
        }
      })
      .catch(() => {});
  }, []);

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
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('user_profile', JSON.stringify(data.user));
        }
      } catch (error) {
        // Retain local demo session
      } finally {
        setIsLoading(false);
      }
    };
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.businessName) {
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
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_profile', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser.businessId) {
      setBusinessId(newUser.businessId);
      localStorage.setItem('businessId', newUser.businessId);
    }
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
        isSuperAdmin,
        tenants,
        activeTenant,
        impersonatingTenant,
        impersonateTenant,
        exitImpersonation,
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
