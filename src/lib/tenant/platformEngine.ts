import { Tenant, TenantPlan, TenantStatus } from './tenantEngine';
import { BusinessType } from '../../types/template';

// ─── TYPES & INTERFACES ──────────────────────────────────────────

export type PlatformRole = 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'SUPPORT_AGENT' | 'BILLING_ADMIN';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: PlatformRole;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface TicketReply {
  id: string;
  author: string;
  isSuperAdmin: boolean;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  businessName: string;
  ownerEmail: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  replies: TicketReply[];
}

export type NotificationType =
  | 'BUSINESS_REGISTERED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'PAYMENT_FAILED'
  | 'USAGE_LIMIT'
  | 'INACTIVE_TENANT'
  | 'SYSTEM_WARNING'
  | 'SUPPORT_TICKET';

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  tenantId?: string;
  businessName?: string;
  createdAt: string;
  read: boolean;
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  businessName: string;
  tenantId?: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  ipAddress?: string;
}

export interface IndustryTemplateConfig {
  id: string;
  businessType: BusinessType;
  name: string;
  description: string;
  iconName: string;
  themeColor: string;
  status: 'ACTIVE' | 'INACTIVE';
  defaultModules: string[];
  defaultCategories: string[];
  taxPresets: { label: string; rate: number }[];
  recommendedPlan: TenantPlan;
}

export interface PlatformSettingsConfig {
  platformName: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  autoRenewEnabled: boolean;
  trialDurationDays: number;
  gracePeriodDays: number;
  allowPublicRegistration: boolean;
  twoFactorAuth: boolean;
  sessionTimeoutMinutes: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  featureFlags: {
    whatsappBilling: boolean;
    multiCounterSync: boolean;
    aiBusinessInsights: boolean;
    customDomainRouting: boolean;
    automatedDailyBackup: boolean;
  };
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  filename: string;
  sizeBytes: number;
  type: 'FULL_PLATFORM' | 'TENANT_SNAPSHOT' | 'AUTOMATED_DAILY';
  tenantCount: number;
  status: 'SUCCESS' | 'FAILED';
}

// ─── DEFAULT SEED DATA ──────────────────────────────────────────

const DEFAULT_PLATFORM_USERS: PlatformUser[] = [
  {
    id: 'user-super-admin',
    name: 'Master Platform Admin',
    email: 'admin@saas.com',
    username: 'superadmin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'user-platform-devops',
    name: 'SaaS Infrastructure Lead',
    email: 'devops@saasplatform.io',
    username: 'devops_lead',
    role: 'PLATFORM_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-02-15T09:00:00.000Z',
    lastLoginAt: '2026-09-11T14:30:00.000Z',
  },
  {
    id: 'user-support-specialist',
    name: 'Customer Support Lead',
    email: 'support@saasplatform.io',
    username: 'support_lead',
    role: 'SUPPORT_AGENT',
    status: 'ACTIVE',
    createdAt: '2026-03-01T11:00:00.000Z',
    lastLoginAt: '2026-09-12T08:15:00.000Z',
  },
];

const DEFAULT_INDUSTRY_TEMPLATES: IndustryTemplateConfig[] = [
  {
    id: 'tpl-supermarket',
    businessType: 'SUPERMARKET',
    name: 'Supermarket & Hypermarket',
    description: 'High-speed barcode scanner billing, batch pricing, FMCG inventory, expiry date alerts and weighing scale integration.',
    iconName: 'ShoppingCart',
    themeColor: '#16a34a',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Inventory', 'Customers', 'Suppliers', 'Reports', 'Website', 'Advanced Analytics'],
    defaultCategories: ['Packaged Foods', 'Fresh Produce & Fruits', 'Dairy & Eggs', 'Household & Cleaning', 'Beverages & Snacks'],
    taxPresets: [{ label: 'GST 0% (Essentials)', rate: 0 }, { label: 'GST 5% (Food)', rate: 5 }, { label: 'GST 12%', rate: 12 }, { label: 'GST 18% (Goods)', rate: 18 }],
    recommendedPlan: 'PROFESSIONAL',
  },
  {
    id: 'tpl-garments',
    businessType: 'GARMENTS',
    name: 'Garments, Apparel & Textiles',
    description: 'Matrix variants for Size, Color, Fit & Brand. Barcode tag printing, seasonal sales offers and fashion catalog website.',
    iconName: 'Shirt',
    themeColor: '#7c3aed',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Inventory', 'Customers', 'Staff', 'Website', 'CRM', 'Reports'],
    defaultCategories: ['Mens Ethnic & Casuals', 'Womenswear & Sarees', 'Kids Wear', 'Accessories & Footwear', 'Fabrics & Unstitched'],
    taxPresets: [{ label: 'GST 5% (Under ₹1000)', rate: 5 }, { label: 'GST 12% (Above ₹1000)', rate: 12 }],
    recommendedPlan: 'GROWTH',
  },
  {
    id: 'tpl-medical',
    businessType: 'MEDICAL',
    name: 'Pharmacy & Medical Store',
    description: 'Schedule H drug records, Batch & Expiry tracking, Doctor prescription attachments and Medicine substitute finder.',
    iconName: 'Activity',
    themeColor: '#0284c7',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Inventory', 'Customers', 'Suppliers', 'Reports', 'Advanced Analytics'],
    defaultCategories: ['Tablets & Capsules', 'Syrups & Suspensions', 'Injectables', 'Surgicals & Bandages', 'Health Supplements'],
    taxPresets: [{ label: 'GST 0% (Lifesaving)', rate: 0 }, { label: 'GST 5% (Medicines)', rate: 5 }, { label: 'GST 12% (Supplements)', rate: 12 }],
    recommendedPlan: 'GROWTH',
  },
  {
    id: 'tpl-hardware',
    businessType: 'HARDWARE',
    name: 'Hardware, Paints & Electricals',
    description: 'Multiple unit billing (Mtr, Kg, SqFt, Pcs), Contractor loyalty accounts and quotation to invoice conversions.',
    iconName: 'Wrench',
    themeColor: '#d97706',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Sales', 'Purchases', 'Inventory', 'Customers', 'Suppliers', 'Reports'],
    defaultCategories: ['Hand Tools & Fasteners', 'Electricals & Wiring', 'Paints & Primers', 'Plumbing & Pipes', 'Sanitaryware'],
    taxPresets: [{ label: 'GST 18% (Standard Hardware)', rate: 18 }, { label: 'GST 28% (Paints & Luxury)', rate: 28 }],
    recommendedPlan: 'GROWTH',
  },
  {
    id: 'tpl-restaurant',
    businessType: 'RESTAURANT',
    name: 'Restaurant, Dining & Bar',
    description: 'Table management, Kitchen Order Tickets (KOT), Captain order billing, parcel orders and food aggregators sync.',
    iconName: 'Utensils',
    themeColor: '#dc2626',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Inventory', 'Staff', 'Attendance', 'Reports', 'Website', 'Online Store'],
    defaultCategories: ['Starters & Appetizers', 'Main Course (Veg & Non-Veg)', 'Breads & Rice', 'Desserts & Sweets', 'Beverages & Mocktails'],
    taxPresets: [{ label: 'GST 5% (Restaurant Non-AC/AC)', rate: 5 }, { label: 'GST 18% (Liquor/Special)', rate: 18 }],
    recommendedPlan: 'GROWTH',
  },
  {
    id: 'tpl-cafe',
    businessType: 'BAKERY',
    name: 'Cafe, Bakery & Quick Service (QSR)',
    description: 'Quick counter billing, recipe costing, topping modifiers, token calling screen and online preorder catalog.',
    iconName: 'Coffee',
    themeColor: '#b45309',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Inventory', 'Customers', 'Reports', 'Website', 'Online Store'],
    defaultCategories: ['Specialty Coffee & Teas', 'Artisan Pastries & Cakes', 'Burgers & Wraps', 'Shakes & Smoothies'],
    taxPresets: [{ label: 'GST 5% (Food & Bakery)', rate: 5 }],
    recommendedPlan: 'STARTER',
  },
  {
    id: 'tpl-electronics',
    businessType: 'ELECTRONICS',
    name: 'Electronics, Mobile & Appliances',
    description: 'IMEI & Serial number tracking, Warranty management, EMI finance partners and service repair job tickets.',
    iconName: 'Cpu',
    themeColor: '#4f46e5',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Sales', 'Inventory', 'Customers', 'Suppliers', 'Reports', 'Website'],
    defaultCategories: ['Smartphones & Tablets', 'Mobile Accessories', 'Home Appliances', 'Laptops & Computers', 'Audio & Wearables'],
    taxPresets: [{ label: 'GST 18% (Mobile & Tech)', rate: 18 }, { label: 'GST 28% (Large Appliances)', rate: 28 }],
    recommendedPlan: 'PROFESSIONAL',
  },
  {
    id: 'tpl-retail',
    businessType: 'RETAIL',
    name: 'General Retail & Departmental',
    description: 'Versatile multi-counter POS billing with barcode labels, customer loyalty points, GST invoicing and online website.',
    iconName: 'Store',
    themeColor: '#2563eb',
    status: 'ACTIVE',
    defaultModules: ['Billing', 'POS', 'Sales', 'Purchases', 'Inventory', 'Customers', 'Suppliers', 'Staff', 'Reports', 'Website'],
    defaultCategories: ['Top Sellers', 'New Arrivals', 'Special Offers', 'Stationery & Gifts', 'General Merchandise'],
    taxPresets: [{ label: 'GST 5%', rate: 5 }, { label: 'GST 12%', rate: 12 }, { label: 'GST 18%', rate: 18 }],
    recommendedPlan: 'GROWTH',
  },
];

const DEFAULT_SUPPORT_TICKETS: SupportTicket[] = [];

const DEFAULT_PLATFORM_NOTIFICATIONS: PlatformNotification[] = [];

const DEFAULT_AUDIT_LOGS: PlatformAuditLog[] = [];

const DEFAULT_SETTINGS: PlatformSettingsConfig = {
  platformName: 'MultiBiz SaaS Platform',
  companyName: 'Multi-Business Cloud Systems Inc.',
  supportEmail: 'support@multibizplatform.io',
  supportPhone: '+91 (044) 4920-8000',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata (IST)',
  autoRenewEnabled: true,
  trialDurationDays: 14,
  gracePeriodDays: 7,
  allowPublicRegistration: true,
  twoFactorAuth: false,
  sessionTimeoutMinutes: 120,
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpUser: 'apikey',
  smtpFrom: 'no-reply@multibizplatform.io',
  maintenanceMode: false,
  maintenanceNotice: 'Platform upgrade scheduled for Sunday at 02:00 AM IST. Estimated downtime: 15 minutes.',
  featureFlags: {
    whatsappBilling: true,
    multiCounterSync: true,
    aiBusinessInsights: true,
    customDomainRouting: true,
    automatedDailyBackup: true,
  },
};

const DEFAULT_BACKUPS: BackupRecord[] = [];

// ─── STORAGE KEYS ───────────────────────────────────────────────

const KEYS = {
  USERS: 'saas_platform_users_registry',
  TEMPLATES: 'saas_industry_templates_registry',
  TICKETS: 'saas_support_tickets_registry',
  NOTIFICATIONS: 'saas_platform_notifications_registry',
  AUDIT_LOGS: 'saas_platform_audit_logs_registry',
  SETTINGS: 'saas_platform_settings_registry',
  BACKUPS: 'saas_platform_backups_registry',
};

// ─── PLATFORM ENGINE CLASS ──────────────────────────────────────

export class PlatformEngine {
  // ── 1. PLATFORM USERS ──
  static getPlatformUsers(): PlatformUser[] {
    try {
      const saved = localStorage.getItem(KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    this.savePlatformUsers(DEFAULT_PLATFORM_USERS);
    return DEFAULT_PLATFORM_USERS;
  }

  static savePlatformUsers(users: PlatformUser[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  static addPlatformUser(data: Omit<PlatformUser, 'id' | 'createdAt'>): PlatformUser {
    const list = this.getPlatformUsers();
    const newUser: PlatformUser = {
      ...data,
      id: `puser-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newUser);
    this.savePlatformUsers(list);
    this.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Global', 'CREATE_PLATFORM_USER', `Created platform administrator "${newUser.name}" (${newUser.role})`);
    return newUser;
  }

  static updatePlatformUser(id: string, updates: Partial<PlatformUser>): PlatformUser | null {
    const list = this.getPlatformUsers();
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.savePlatformUsers(list);
    return list[idx];
  }

  static deletePlatformUser(id: string): boolean {
    const list = this.getPlatformUsers().filter(u => u.id !== id);
    this.savePlatformUsers(list);
    return true;
  }

  // ── 2. INDUSTRY TEMPLATES ──
  static getIndustryTemplates(): IndustryTemplateConfig[] {
    try {
      const saved = localStorage.getItem(KEYS.TEMPLATES);
      if (saved) return JSON.parse(saved);
    } catch {}
    this.saveIndustryTemplates(DEFAULT_INDUSTRY_TEMPLATES);
    return DEFAULT_INDUSTRY_TEMPLATES;
  }

  static saveIndustryTemplates(templates: IndustryTemplateConfig[]): void {
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  }

  static updateIndustryTemplate(id: string, updates: Partial<IndustryTemplateConfig>): IndustryTemplateConfig | null {
    const list = this.getIndustryTemplates();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.saveIndustryTemplates(list);
    this.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Templates', 'UPDATE_TEMPLATE', `Updated configuration for industry template "${list[idx].name}"`);
    return list[idx];
  }

  static createIndustryTemplate(data: Omit<IndustryTemplateConfig, 'id'>): IndustryTemplateConfig {
    const list = this.getIndustryTemplates();
    const newTpl: IndustryTemplateConfig = {
      ...data,
      id: `tpl-${Date.now()}`,
    };
    list.push(newTpl);
    this.saveIndustryTemplates(list);
    this.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Templates', 'CREATE_TEMPLATE', `Created new industry template "${newTpl.name}"`);
    return newTpl;
  }

  // ── 3. SUPPORT TICKETS ──
  static getSupportTickets(): SupportTicket[] {
    try {
      const saved = localStorage.getItem(KEYS.TICKETS);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return [];
  }

  static saveSupportTickets(tickets: SupportTicket[]): void {
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
  }

  static createTicket(data: {
    tenantId: string;
    businessName: string;
    ownerEmail: string;
    subject: string;
    description: string;
    priority: TicketPriority;
  }): SupportTicket {
    const list = this.getSupportTickets();
    const newTicket: SupportTicket = {
      ...data,
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [
        {
          id: `rep-${Date.now()}`,
          author: data.businessName,
          isSuperAdmin: false,
          message: data.description,
          createdAt: new Date().toISOString(),
        }
      ],
    };
    list.unshift(newTicket);
    this.saveSupportTickets(list);
    this.addNotification({
      title: `New Support Ticket #${newTicket.id}`,
      message: `${newTicket.businessName}: ${newTicket.subject}`,
      type: 'SUPPORT_TICKET',
      tenantId: newTicket.tenantId,
      businessName: newTicket.businessName,
    });
    return newTicket;
  }

  static updateTicketStatus(id: string, status: TicketStatus, assignedTo?: string): SupportTicket | null {
    const list = this.getSupportTickets();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;
    list[idx].status = status;
    if (assignedTo !== undefined) list[idx].assignedTo = assignedTo;
    list[idx].updatedAt = new Date().toISOString();
    this.saveSupportTickets(list);
    return list[idx];
  }

  static addTicketReply(id: string, author: string, message: string, isSuperAdmin = true): SupportTicket | null {
    const list = this.getSupportTickets();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;
    list[idx].replies.push({
      id: `rep-${Date.now()}`,
      author,
      isSuperAdmin,
      message,
      createdAt: new Date().toISOString(),
    });
    list[idx].updatedAt = new Date().toISOString();
    this.saveSupportTickets(list);
    return list[idx];
  }

  // ── 4. NOTIFICATIONS ──
  static getNotifications(): PlatformNotification[] {
    try {
      const saved = localStorage.getItem(KEYS.NOTIFICATIONS);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return [];
  }

  static saveNotifications(notifications: PlatformNotification[]): void {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  static addNotification(data: Omit<PlatformNotification, 'id' | 'createdAt' | 'read'>): PlatformNotification {
    const list = this.getNotifications();
    const item: PlatformNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    list.unshift(item);
    this.saveNotifications(list);
    return item;
  }

  static markAsRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.saveNotifications(list);
    }
  }

  static markAllAsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(list);
  }

  static clearNotification(id: string): void {
    const list = this.getNotifications().filter(n => n.id !== id);
    this.saveNotifications(list);
  }

  // ── 5. AUDIT LOGS ──
  static getAuditLogs(): PlatformAuditLog[] {
    try {
      const saved = localStorage.getItem(KEYS.AUDIT_LOGS);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return [];
  }

  static saveAuditLogs(logs: PlatformAuditLog[]): void {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 500))); // keep latest 500
  }

  static logAudit(
    user: string,
    role: string,
    businessName: string,
    action: string,
    details: string,
    status: 'SUCCESS' | 'FAILED' | 'WARNING' = 'SUCCESS',
    tenantId?: string
  ): PlatformAuditLog {
    const list = this.getAuditLogs();
    const entry: PlatformAuditLog = {
      id: `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      businessName,
      tenantId,
      action,
      details,
      status,
      ipAddress: '127.0.0.1 (Local Session)',
    };
    list.unshift(entry);
    this.saveAuditLogs(list);
    return entry;
  }

  // ── 6. PLATFORM SETTINGS ──
  static getPlatformSettings(): PlatformSettingsConfig {
    try {
      const saved = localStorage.getItem(KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    this.savePlatformSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  static savePlatformSettings(settings: PlatformSettingsConfig): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    this.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Global', 'UPDATE_SETTINGS', 'Updated SaaS platform configuration settings');
  }

  // ── 7. BACKUPS MANAGEMENT ──
  static getBackups(): BackupRecord[] {
    try {
      const saved = localStorage.getItem(KEYS.BACKUPS);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return [];
  }

  static saveBackups(backups: BackupRecord[]): void {
    localStorage.setItem(KEYS.BACKUPS, JSON.stringify(backups));
  }

  static recordBackupCreated(type: BackupRecord['type'], tenantCount: number, sizeBytes: number): BackupRecord {
    const list = this.getBackups();
    const rec: BackupRecord = {
      id: `bkp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      filename: `saas_snapshot_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.json`,
      sizeBytes,
      type,
      tenantCount,
      status: 'SUCCESS',
    };
    list.unshift(rec);
    this.saveBackups(list);
    this.logAudit('superadmin', 'SUPER_ADMIN', 'Platform Backups', 'CREATE_BACKUP', `Generated backup snapshot (${rec.filename}, ${tenantCount} businesses)`);
    return rec;
  }

  // ── 8. TENANT USAGE COMPUTATION ──
  static getTenantHealthAndUsage(tenant: Tenant): {
    usersCount: number;
    maxUsers: number;
    userUsagePercent: number;
    productsCount: number;
    customersCount: number;
    ordersCount: number;
    storageUsedMB: number;
    storageLimitMB: number;
    storagePercent: number;
    healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    lastActivityText: string;
  } {
    const prefix = `tenant_${tenant.id}_`;
    let productsCount = 0;
    let customersCount = 0;
    let ordersCount = 0;
    let employeesCount = 1; // Admin always counts

    try {
      const itemsRaw = localStorage.getItem(`${prefix}universal_items`);
      if (itemsRaw) productsCount = JSON.parse(itemsRaw).length;

      const custRaw = localStorage.getItem(`${prefix}universal_customers`);
      if (custRaw) customersCount = JSON.parse(custRaw).length;

      const ordRaw = localStorage.getItem(`${prefix}universal_orders`);
      if (ordRaw) ordersCount = JSON.parse(ordRaw).length;

      const empRaw = localStorage.getItem(`${prefix}universal_employees`);
      if (empRaw) employeesCount += JSON.parse(empRaw).length;
    } catch {}

    // Calculate simulated storage based on payload + base
    let totalBytes = 1024 * 350; // base footprint
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          totalBytes += (localStorage.getItem(k)?.length || 0) * 2;
        }
      }
    } catch {}

    const maxUsers = tenant.subscription.maxStaff || 5;
    const userUsagePercent = Math.min(100, Math.round((employeesCount / maxUsers) * 100));

    const storageLimitMB = tenant.subscription.plan === 'ENTERPRISE' ? 10000 : tenant.subscription.plan === 'PROFESSIONAL' ? 5000 : tenant.subscription.plan === 'GROWTH' ? 2000 : 1000;
    const storageUsedMB = Math.max(12, Math.round(totalBytes / (1024 * 1024) * 50) / 10); // scale gracefully
    const storagePercent = Math.min(100, Math.round((storageUsedMB / storageLimitMB) * 100));

    let healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (tenant.subscription.status === 'SUSPENDED' || tenant.subscription.status === 'EXPIRED') {
      healthStatus = 'CRITICAL';
    } else if (storagePercent > 85 || userUsagePercent >= 100) {
      healthStatus = 'WARNING';
    }

    let lastActivityText = 'Just now';
    if (tenant.lastLoginAt) {
      const diffMs = Date.now() - new Date(tenant.lastLoginAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) lastActivityText = `${diffMins}m ago`;
      else if (diffMins < 1440) lastActivityText = `${Math.floor(diffMins / 60)}h ago`;
      else lastActivityText = `${Math.floor(diffMins / 1440)}d ago`;
    } else {
      lastActivityText = 'Recently';
    }

    return {
      usersCount: employeesCount,
      maxUsers,
      userUsagePercent,
      productsCount: productsCount || (tenant.totalInvoicesCount ? tenant.totalInvoicesCount * 3 + 12 : 24),
      customersCount: customersCount || (tenant.totalInvoicesCount ? Math.floor(tenant.totalInvoicesCount * 0.8) + 8 : 15),
      ordersCount: ordersCount || tenant.totalInvoicesCount || 0,
      storageUsedMB,
      storageLimitMB,
      storagePercent,
      healthStatus,
      lastActivityText,
    };
  }
}
