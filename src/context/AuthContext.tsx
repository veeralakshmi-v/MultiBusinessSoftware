import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { BusinessTemplate, BusinessType } from '../types/template';
import { ModuleId, EnabledModulesState, UserRole } from '../types/module';
import { TemplateResolver } from '../lib/templates/templateResolver';
import { ModuleEngine } from '../lib/modules/moduleEngine';

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
}

const DEFAULT_BUSINESS_ID = 'biz-default-business';
const DEFAULT_BUSINESS_TYPE: BusinessType = 'RETAIL';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'user-admin',
      username: 'admin',
      role: 'ADMIN',
      businessId: DEFAULT_BUSINESS_ID,
      businessType: DEFAULT_BUSINESS_TYPE,
    };
  });
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || 'demo-live-token-admin');
  const [isLoading, setIsLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string>(
    localStorage.getItem('businessId') || DEFAULT_BUSINESS_ID
  );
  const [businessType, setBusinessTypeState] = useState<BusinessType>(
    (localStorage.getItem('businessType') as BusinessType) || DEFAULT_BUSINESS_TYPE
  );

  // Universal Business Profile State
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('universal_business_profile');
    if (saved) {
      try {
        return { ...DEFAULT_BUSINESS_PROFILE, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_BUSINESS_PROFILE;
  });

  const updateBusinessProfile = (updates: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('universal_business_profile', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist business profile to localStorage:', err);
      }
      return updated;
    });
    window.dispatchEvent(new Event('settings_updated'));
  };

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
    setToken(null);
    setUser(null);
    // Redirect to public landing page after logout
    window.location.href = '/';
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
