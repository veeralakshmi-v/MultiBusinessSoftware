import { BusinessType } from '../../types/template';

export type TenantPlan = 'TRIAL' | 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';

export interface TenantSubscription {
  plan: TenantPlan;
  status: TenantStatus;
  startDate: string;
  expiryDate: string;
  monthlyFee: number;
  maxStaff: number;
  maxInvoicesPerMonth: number;
  allowWebsite: boolean;
  allowCustomDomain: boolean;
  autoRenew: boolean;
}

export interface Tenant {
  id: string; // e.g. 'biz-apex-supermarket'
  businessName: string;
  legalEntityName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAadhaar?: string;
  adminUsername: string;
  adminPasswordHash: string; // stored for direct client auth
  businessType: BusinessType;
  currency: string;
  currencySymbol: string;
  gstin?: string;
  city?: string;
  state?: string;
  address?: string;
  subdomain?: string;
  customDomain?: string;
  status?: TenantStatus;
  subscription: TenantSubscription;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  totalInvoicesCount?: number;
  totalRevenueGenerated?: number;
  notes?: string;
}

export interface SaaSPlanConfig {
  id: TenantPlan;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  maxStaff: number;
  maxInvoicesPerMonth: number;
  allowWebsite: boolean;
  allowCustomDomain: boolean;
  features: string[];
  popular?: boolean;
}

export const SAAS_PLANS: SaaSPlanConfig[] = [
  {
    id: 'TRIAL',
    name: '14-Day Free Trial',
    priceMonthly: 0,
    priceAnnual: 0,
    maxStaff: 5,
    maxInvoicesPerMonth: 100,
    allowWebsite: true,
    allowCustomDomain: false,
    features: ['Full POS & Invoicing', 'Inventory & Barcode', 'Up to 5 Staff Members', 'Public Storefront Website', '14 Days Access'],
  },
  {
    id: 'STARTER',
    name: 'Starter Business',
    priceMonthly: 999,
    priceAnnual: 9990,
    maxStaff: 3,
    maxInvoicesPerMonth: 500,
    allowWebsite: false,
    allowCustomDomain: false,
    features: ['Standard POS Billing', 'Product & Stock Management', 'Up to 3 Staff Members', 'GST & Non-GST Invoicing', 'Basic Reports'],
  },
  {
    id: 'GROWTH',
    name: 'Growth Retail & Cafe',
    priceMonthly: 1999,
    priceAnnual: 19990,
    maxStaff: 10,
    maxInvoicesPerMonth: 2500,
    allowWebsite: true,
    allowCustomDomain: false,
    features: ['Advanced POS & Barcodes', 'Inventory & Low Stock Alerts', 'Up to 10 Staff & Permissions', 'Online Website Catalog', 'Customer Loyalty & Offers'],
    popular: true,
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional Enterprise',
    priceMonthly: 3499,
    priceAnnual: 34990,
    maxStaff: 25,
    maxInvoicesPerMonth: 10000,
    allowWebsite: true,
    allowCustomDomain: true,
    features: ['High Volume Rapid POS', 'Automated Purchase Orders', 'Multi-shift Staff & Attendance', 'Custom Domain Website', 'Full Financial Analytics & P&L'],
  },
  {
    id: 'ENTERPRISE',
    name: 'Custom Enterprise',
    priceMonthly: 6999,
    priceAnnual: 69990,
    maxStaff: 100,
    maxInvoicesPerMonth: 999999,
    allowWebsite: true,
    allowCustomDomain: true,
    features: ['Unlimited Staff & Branches', 'Unlimited Monthly Bills', 'Dedicated Cloud Database', 'Custom ERP Integrations', 'Priority 24/7 Phone Support'],
  },
];

const DEFAULT_TENANTS: Tenant[] = [];

const TENANTS_STORAGE_KEY = 'saas_tenants_master_registry';

export class TenantEngine {
  /**
   * Retrieves all registered client tenants
   */
  static getTenants(): Tenant[] {
    try {
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) => ({
            ...t,
            subscription: {
              plan: t.subscription?.plan || 'GROWTH',
              status: t.subscription?.status || t.status || 'ACTIVE',
              startDate: t.subscription?.startDate || t.createdAt || new Date().toISOString(),
              expiryDate: t.subscription?.expiryDate || new Date(Date.now() + 365*24*3600*1000).toISOString(),
              monthlyFee: t.subscription?.monthlyFee || 1999,
              maxStaff: t.subscription?.maxStaff || 10,
              maxInvoicesPerMonth: t.subscription?.maxInvoicesPerMonth || 5000,
              allowWebsite: t.subscription?.allowWebsite ?? true,
              allowCustomDomain: t.subscription?.allowCustomDomain ?? false,
              autoRenew: t.subscription?.autoRenew ?? true,
            }
          }));
        }
      }
    } catch {}
    return [];
  }

  /**
   * Saves tenants list to persistent registry
   */
  static saveTenants(tenants: Tenant[]): void {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
      window.dispatchEvent(new Event('saas_tenants_updated'));
    } catch (e) {
      console.error('Failed to save tenants registry', e);
    }
  }

  /**
   * Get single tenant by ID
   */
  static getTenantById(tenantId: string): Tenant | null {
    const list = this.getTenants();
    return list.find(t => t.id === tenantId) || null;
  }

  /**
   * Get single tenant by username, phone number, email, business name, or ID
   */
  static findTenantByLogin(identifier: string): Tenant | null {
    if (!identifier) return null;
    const q = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const list = this.getTenants();
    
    return list.find(t => {
      // 1. Exact match on username, email, ID, or business name
      if (t.adminUsername && t.adminUsername.toLowerCase() === q) return true;
      if (t.ownerEmail && t.ownerEmail.toLowerCase() === q) return true;
      if (t.id && t.id.toLowerCase() === q) return true;
      if (t.businessName && t.businessName.toLowerCase() === q) return true;
      if (t.ownerName && t.ownerName.toLowerCase() === q) return true;
      if (t.subdomain && t.subdomain.toLowerCase() === q) return true;

      // 2. Phone number match (clean digits and formatted string)
      if (t.ownerPhone) {
        const phoneLower = t.ownerPhone.toLowerCase().trim();
        if (phoneLower === q) return true;
        const tenantDigits = t.ownerPhone.replace(/\D/g, '');
        if (cleanDigits.length >= 7 && tenantDigits.length >= 7) {
          if (tenantDigits === cleanDigits) return true;
          if (tenantDigits.endsWith(cleanDigits) || cleanDigits.endsWith(tenantDigits)) return true;
        }
      }
      return false;
    }) || null;
  }

  /**
   * Creates and provisions a new client business with isolated database namespace
   */
  static createTenant(data: {
    businessName: string;
    legalEntityName?: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerAadhaar?: string;
    adminUsername: string;
    adminPassword: string;
    businessType: BusinessType;
    plan: TenantPlan;
    durationMonths?: number;
    city?: string;
    state?: string;
    address?: string;
    gstin?: string;
    notes?: string;
  }): Tenant {
    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const tenantId = `biz-${slug || Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const planConfig = SAAS_PLANS.find(p => p.id === data.plan) || SAAS_PLANS[0];
    const durationMonths = data.durationMonths || (data.plan === 'TRIAL' ? 0.5 : 12);
    
    const now = new Date();
    const expiry = new Date();
    if (data.plan === 'TRIAL') {
      expiry.setDate(now.getDate() + 14);
    } else {
      expiry.setMonth(now.getMonth() + durationMonths);
    }

    const newTenant: Tenant = {
      id: tenantId,
      businessName: data.businessName.trim(),
      legalEntityName: data.legalEntityName?.trim() || data.businessName.trim(),
      ownerName: data.ownerName.trim(),
      ownerEmail: data.ownerEmail.trim(),
      ownerPhone: data.ownerPhone.trim(),
      ownerAadhaar: data.ownerAadhaar?.trim() || '',
      adminUsername: data.adminUsername.trim() || slug,
      adminPasswordHash: data.adminPassword.trim() || 'admin123',
      businessType: data.businessType,
      currency: 'INR',
      currencySymbol: '₹',
      gstin: data.gstin?.trim() || '',
      city: data.city?.trim() || '',
      state: data.state?.trim() || '',
      address: data.address?.trim() || '',
      subdomain: slug,
      subscription: {
        plan: data.plan,
        status: data.plan === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
        startDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        monthlyFee: planConfig.priceMonthly,
        maxStaff: planConfig.maxStaff,
        maxInvoicesPerMonth: planConfig.maxInvoicesPerMonth,
        allowWebsite: planConfig.allowWebsite,
        allowCustomDomain: planConfig.allowCustomDomain,
        autoRenew: true,
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      totalInvoicesCount: 0,
      totalRevenueGenerated: 0,
      notes: data.notes?.trim() || '',
    };

    const tenants = [newTenant, ...this.getTenants()];
    this.saveTenants(tenants);

    // Seed clean initial database records for this tenant
    this.seedTenantDatabase(newTenant);

    return newTenant;
  }

  /**
   * Initializes initial business profile and seed data inside the tenant's isolated namespace
   */
  static seedTenantDatabase(tenant: Tenant): void {
    const prefix = `tenant_${tenant.id}_`;

    // 1. Seed Business Profile
    const profile = {
      businessName: tenant.businessName,
      legalName: tenant.legalEntityName,
      tagline: `${tenant.businessType} Management & POS System`,
      landingTagline: `Welcome to ${tenant.businessName}. Delivering top quality and service.`,
      address: tenant.address || 'Commercial Center',
      city: tenant.city || 'City',
      state: tenant.state || 'State',
      pincode: '600001',
      phone: tenant.ownerPhone,
      email: tenant.ownerEmail,
      gstin: tenant.gstin || '',
      currencySymbol: '₹',
      currencyCode: 'INR',
      invoicePrefix: `${tenant.businessName.slice(0, 3).toUpperCase()}/2026/`,
      orderPrefix: 'ORD-',
      nextInvoiceNumber: 1001,
      defaultTaxRate: 5.0,
      taxMode: 'EXCLUSIVE',
      paperSize: '80MM',
      termsText: 'Goods once sold will not be taken back without original bill.',
      thankYouNote: `Thank you for shopping at ${tenant.businessName}!`,
      logoUrl: '',
      landingSlides: [],
    };
    localStorage.setItem(`${prefix}business_profile`, JSON.stringify(profile));

    // 2. Seed default categories based on business type
    let defaultCategories = [
      { id: `cat-${tenant.id}-1`, name: 'General Products', description: 'Standard Catalog' },
      { id: `cat-${tenant.id}-2`, name: 'Featured Items', description: 'Top Selling' },
    ];
    if (tenant.businessType === 'RESTAURANT') {
      defaultCategories = [
        { id: `cat-${tenant.id}-1`, name: 'Beverages & Drinks', description: 'Hot & Cold' },
        { id: `cat-${tenant.id}-2`, name: 'Main Course', description: 'Special dishes' },
        { id: `cat-${tenant.id}-3`, name: 'Snacks & Starters', description: 'Quick bites' },
      ];
    } else if (tenant.businessType === 'GARMENTS') {
      defaultCategories = [
        { id: `cat-${tenant.id}-1`, name: 'Menswear', description: 'Shirts, Trousers' },
        { id: `cat-${tenant.id}-2`, name: 'Womenswear', description: 'Ethnic & Western' },
        { id: `cat-${tenant.id}-3`, name: 'Accessories', description: 'Belts, Wallets' },
      ];
    } else if (tenant.businessType === 'MEDICAL') {
      defaultCategories = [
        { id: `cat-${tenant.id}-1`, name: 'Antibiotics & OTC', description: 'Tablets & Syrups' },
        { id: `cat-${tenant.id}-2`, name: 'Wellness & Nutrition', description: 'Supplements' },
      ];
    }
    localStorage.setItem(`${prefix}universal_categories`, JSON.stringify(defaultCategories));

    // 3. Seed initial starter products
    const starterItems = [
      {
        id: `item-${tenant.id}-101`,
        name: `${tenant.businessName.split(' ')[0]} Starter Item 1`,
        categoryId: defaultCategories[0].id,
        categoryName: defaultCategories[0].name,
        price: 250,
        costPrice: 180,
        currentStock: 45,
        minStock: 10,
        unit: 'Pcs',
        gst: 5,
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        isAvailable: true,
        showInWebsite: true,
      },
      {
        id: `item-${tenant.id}-102`,
        name: `${tenant.businessName.split(' ')[0]} Premium Item 2`,
        categoryId: defaultCategories[1]?.id || defaultCategories[0].id,
        categoryName: defaultCategories[1]?.name || defaultCategories[0].name,
        price: 499,
        costPrice: 320,
        currentStock: 30,
        minStock: 5,
        unit: 'Pcs',
        gst: 12,
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        isAvailable: true,
        showInWebsite: true,
      }
    ];
    localStorage.setItem(`${prefix}universal_items`, JSON.stringify(starterItems));

    // 4. Seed initial Business Admin account created by Super Admin
    const initialAdmin = {
      id: `admin-${tenant.id}`,
      name: tenant.ownerName || `${tenant.businessName} Admin`,
      username: tenant.adminUsername,
      role: 'ADMIN',
      category: 'Management/Admin',
      applicationAccess: 'Full Access (All Modules & POS)',
      phone: tenant.ownerPhone || '9876543210',
      email: tenant.ownerEmail || '',
      pinCode: tenant.adminPasswordHash || 'admin123',
      password: tenant.adminPasswordHash || 'admin123',
      status: 'ACTIVE',
      dob: '1990-01-01',
      doj: new Date().toISOString().slice(0, 10),
      dor: '',
      aadharNumber: '',
      address: tenant.address || '',
    };
    localStorage.setItem(`${prefix}universal_staff_list`, JSON.stringify([initialAdmin]));

    // 5. Seed empty isolated collections
    localStorage.setItem(`${prefix}universal_customers`, JSON.stringify([]));
    localStorage.setItem(`${prefix}universal_orders`, JSON.stringify([]));
    localStorage.setItem(`${prefix}universal_suppliers`, JSON.stringify([]));
    localStorage.setItem(`${prefix}universal_employees`, JSON.stringify([]));
    localStorage.setItem(`${prefix}universal_attendance_records`, JSON.stringify([]));

    // Sync business & admin to Supabase database API
    try {
      fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
          'x-business-id': tenant.id,
        },
        body: JSON.stringify({
          id: tenant.id,
          businessName: tenant.businessName,
          legalEntityName: tenant.legalEntityName,
          businessType: tenant.businessType,
          ownerName: tenant.ownerName,
          ownerPhone: tenant.ownerPhone,
          ownerEmail: tenant.ownerEmail,
          adminUsername: tenant.adminUsername,
          adminPassword: tenant.adminPasswordHash,
          adminPasswordHash: tenant.adminPasswordHash,
          address: tenant.address,
          city: tenant.city,
          state: tenant.state,
          gstin: tenant.gstin,
          currency: tenant.currency,
          currencySymbol: tenant.currencySymbol,
          subscription: tenant.subscription,
        })
      }).catch(() => {});
    } catch (e) {}
  }

  /**
   * Updates an existing tenant profile & subscription
   */
  static updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant | null {
    const list = this.getTenants();
    const idx = list.findIndex(t => t.id === tenantId);
    if (idx === -1) return null;

    const updated: Tenant = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    this.saveTenants(list);

    // Sync updates to database API
    try {
      fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
          'x-business-id': updated.id,
        },
        body: JSON.stringify(updated)
      }).catch(() => {});
    } catch (e) {}

    return updated;
  }

  /**
   * Toggles tenant active or suspended status
   */
  static setTenantStatus(tenantId: string, status: TenantStatus): Tenant | null {
    const list = this.getTenants();
    const tenant = list.find(t => t.id === tenantId);
    if (!tenant) return null;

    tenant.subscription.status = status;
    tenant.updatedAt = new Date().toISOString();
    this.saveTenants(list);

    try {
      fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
          'x-business-id': tenant.id,
        },
        body: JSON.stringify(tenant)
      }).catch(() => {});
    } catch (e) {}

    return tenant;
  }

  /**
   * Deletes a tenant and purges all their isolated data
   */
  static deleteTenant(tenantId: string): boolean {
    const list = this.getTenants().filter(t => t.id !== tenantId);
    this.saveTenants(list);

    // Sync delete to backend API
    try {
      fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token',
        }
      }).catch(() => {});
    } catch (e) {}

    // Purge tenant isolated keys
    try {
      const prefix = `tenant_${tenantId}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}

    return true;
  }

  /**
   * Exports full tenant database bundle as JSON backup
   */
  static exportTenantData(tenantId: string): string {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) return '{}';

    const prefix = `tenant_${tenantId}_`;
    const data: Record<string, any> = {
      tenantMetadata: tenant,
      exportedAt: new Date().toISOString(),
      storage: {}
    };

    try {
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
    } catch {}

    return JSON.stringify(data, null, 2);
  }

  /**
   * Computes Global SaaS KPIs & Financial Analytics
   */
  static getGlobalSaaSMetrics(): {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    suspendedTenants: number;
    totalMRR: number;
    totalInvoicesAllTenants: number;
    totalGrossRevenueAllTenants: number;
    planBreakdown: Record<string, number>;
    businessTypeBreakdown: Record<string, number>;
  } {
    const tenants = this.getTenants();
    let totalMRR = 0;
    let totalInvoices = 0;
    let totalRevenue = 0;

    const planBreakdown: Record<string, number> = {};
    const businessTypeBreakdown: Record<string, number> = {};

    tenants.forEach(t => {
      if (t.subscription.status === 'ACTIVE') {
        totalMRR += t.subscription.monthlyFee || 0;
      }
      totalInvoices += t.totalInvoicesCount || 0;
      totalRevenue += t.totalRevenueGenerated || 0;

      planBreakdown[t.subscription.plan] = (planBreakdown[t.subscription.plan] || 0) + 1;
      businessTypeBreakdown[t.businessType] = (businessTypeBreakdown[t.businessType] || 0) + 1;
    });

    return {
      totalTenants: tenants.length,
      activeTenants: tenants.filter(t => t.subscription.status === 'ACTIVE').length,
      trialTenants: tenants.filter(t => t.subscription.status === 'TRIAL').length,
      suspendedTenants: tenants.filter(t => t.subscription.status === 'SUSPENDED' || t.subscription.status === 'EXPIRED').length,
      totalMRR,
      totalInvoicesAllTenants: totalInvoices,
      totalGrossRevenueAllTenants: totalRevenue,
      planBreakdown,
      businessTypeBreakdown,
    };
  }

  /**
   * Resets tenant admin credentials
   */
  static resetTenantPassword(tenantId: string, newPass: string): boolean {
    const list = this.getTenants();
    const idx = list.findIndex(t => t.id === tenantId);
    if (idx === -1) return false;
    list[idx].adminPasswordHash = newPass;
    list[idx].updatedAt = new Date().toISOString();
    this.saveTenants(list);
    return true;
  }

  /**
   * Generates and downloads a complete JSON backup of the tenants registry
   */
  static exportTenantsBackup(): void {
    try {
      const tenants = this.getTenants();
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalTenants: tenants.length,
        tenants,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saas-tenants-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export backup', e);
    }
  }
}
