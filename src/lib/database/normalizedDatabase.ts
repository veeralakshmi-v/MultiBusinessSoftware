import { 
  NormalizedBusiness,
  NormalizedBusinessType,
  NormalizedTemplate,
  NormalizedModule,
  NormalizedPermission,
  NormalizedProductAttribute,
  NormalizedFormDefinition,
  NormalizedWorkflow,
  NormalizedNotification,
  NormalizedAutomation,
  NormalizedPlugin,
  NormalizedTheme,
  NormalizedAuditLog,
  NormalizedBranch,
  NormalizedWarehouse,
  NormalizedCounter,
  NormalizedDatabaseState
} from '../../types/database';

export const INITIAL_BUSINESS_TYPES: NormalizedBusinessType[] = [
  { id: 'type-hospitality', name: 'Food & Hospitality', code: 'RESTAURANT', description: 'Dine-In, QSR, Takeaway & Cloud Kitchens', industryCategory: 'Hospitality' },
  { id: 'type-retail', name: 'Retail & Supermarket', code: 'RETAIL', description: 'Grocery, Supermarket, Fashion & Electronics', industryCategory: 'Retail' },
  { id: 'type-healthcare', name: 'Healthcare & Pharma', code: 'MEDICAL', description: 'Pharmacy, Clinics & Diagnostic Labs', industryCategory: 'Healthcare' },
  { id: 'type-services', name: 'Services & B2B', code: 'SERVICES', description: 'Salons, Spa, Repair & Wholesale Distribution', industryCategory: 'Services' },
];

export const INITIAL_BUSINESSES: NormalizedBusiness[] = [
  {
    id: 'biz-apex-group',
    name: 'Apex Multi-Business Enterprise',
    businessTypeId: 'type-hospitality',
    activeTemplateId: 'tpl-restaurant-apex',
    legalEntityName: 'Apex Retail & Foodtech Private Limited',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T16:00:00.000Z',
  }
];

export const INITIAL_TEMPLATES: NormalizedTemplate[] = [
  {
    id: 'tpl-restaurant-apex',
    businessId: 'biz-apex-group',
    name: 'Fine Dining & Quick Service Template',
    code: 'RESTAURANT',
    category: 'Hospitality',
    configSnapshot: { hasTables: true, hasKOT: true, serviceCharge: 5 },
    createdAt: '2026-01-01T00:00:00.000Z',
  }
];

export const INITIAL_MODULES: NormalizedModule[] = [
  { id: 'mod-01', businessId: 'biz-apex-group', moduleId: 'sales', name: 'Sales & POS Billing', isEnabled: true, config: {} },
  { id: 'mod-02', businessId: 'biz-apex-group', moduleId: 'inventory', name: 'Inventory & Stock Control', isEnabled: true, config: {} },
  { id: 'mod-03', businessId: 'biz-apex-group', moduleId: 'kitchen', name: 'Kitchen Order Display (KOT)', isEnabled: true, config: {} },
  { id: 'mod-04', businessId: 'biz-apex-group', moduleId: 'crm', name: 'Customer Loyalty & CRM', isEnabled: true, config: {} },
  { id: 'mod-05', businessId: 'biz-apex-group', moduleId: 'reports', name: 'Analytics & Financial Reports', isEnabled: true, config: {} },
];

export const INITIAL_PERMISSIONS: NormalizedPermission[] = [
  {
    id: 'perm-01',
    businessId: 'biz-apex-group',
    role: 'ADMIN',
    tier: 6,
    action: '*',
    screen: '*',
    fieldRules: { costPrice: 'READ_WRITE', sellingPrice: 'READ_WRITE', profitMargin: 'READ_WRITE' },
  },
  {
    id: 'perm-02',
    businessId: 'biz-apex-group',
    role: 'CASHIER',
    tier: 6,
    action: 'CREATE_ORDER,APPLY_DISCOUNT',
    screen: 'SCREEN_POS',
    fieldRules: { costPrice: 'READ_ONLY', sellingPrice: 'READ_WRITE', profitMargin: 'HIDDEN' },
  },
];

export const INITIAL_PRODUCT_ATTRIBUTES: NormalizedProductAttribute[] = [
  { id: 'attr-01', businessId: 'biz-apex-group', attributeKey: 'portionSize', label: 'Portion Size', dataType: 'SELECT', isRequired: false, options: ['Single', 'Regular', 'Large', 'Family'] },
  { id: 'attr-02', businessId: 'biz-apex-group', attributeKey: 'spiceLevel', label: 'Spice Level', dataType: 'SELECT', isRequired: false, options: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'] },
  { id: 'attr-03', businessId: 'biz-apex-group', attributeKey: 'isVegetarian', label: 'Is Vegetarian', dataType: 'BOOLEAN', isRequired: true },
];

export const INITIAL_FORM_DEFINITIONS: NormalizedFormDefinition[] = [
  {
    id: 'form-prod-01',
    businessId: 'biz-apex-group',
    entityType: 'PRODUCT',
    fields: [
      { key: 'name', label: 'Product Name', controlType: 'TEXT', isRequired: true },
      { key: 'sellingPrice', label: 'Selling Price', controlType: 'CURRENCY', isRequired: true },
      { key: 'category', label: 'Category', controlType: 'SELECT', isRequired: true },
      { key: 'stock', label: 'Initial Stock', controlType: 'NUMBER', isRequired: false },
    ],
    validationRules: { sellingPrice: { min: 0 } },
  }
];

export const INITIAL_WORKFLOWS: NormalizedWorkflow[] = [
  {
    id: 'wf-restaurant-01',
    businessId: 'biz-apex-group',
    pipelineKey: 'RESTAURANT_ORDER_PIPELINE',
    steps: [
      { id: 'PLACED', name: 'Order Placed', sequence: 1 },
      { id: 'KITCHEN', name: 'In Kitchen (KOT)', sequence: 2 },
      { id: 'READY', name: 'Food Ready', sequence: 3 },
      { id: 'BILLED', name: 'Billed & Settled', sequence: 4 },
    ],
    transitions: [
      { from: 'PLACED', to: 'KITCHEN', allowedRole: 'CAPTAIN' },
      { from: 'KITCHEN', to: 'READY', allowedRole: 'CHEF' },
      { from: 'READY', to: 'BILLED', allowedRole: 'CASHIER' },
    ],
  }
];

export const INITIAL_NOTIFICATIONS: NormalizedNotification[] = [
  { id: 'notif-01', businessId: 'biz-apex-group', event: 'INVOICE_CREATED', channels: ['SMS', 'WHATSAPP', 'EMAIL'], templateString: 'Bill #{{invoiceNo}} of ₹{{total}} generated.', isActive: true },
  { id: 'notif-02', businessId: 'biz-apex-group', event: 'LOW_STOCK', channels: ['IN_APP', 'EMAIL'], templateString: 'Warning: {{itemName}} stock is below {{threshold}}.', isActive: true },
];

export const INITIAL_AUTOMATIONS: NormalizedAutomation[] = [
  { id: 'auto-01', businessId: 'biz-apex-group', jobKey: 'DAILY_BACKUP', name: 'Daily Cloud Database Snapshot', schedule: '0 2 * * *', triggerType: 'CRON', actionType: 'BACKUP', isEnabled: true },
  { id: 'auto-02', businessId: 'biz-apex-group', jobKey: 'WEEKLY_SALES_EMAIL', name: 'Weekly Executive Sales Digest', schedule: '0 8 * * 1', triggerType: 'CRON', actionType: 'EMAIL_DIGEST', isEnabled: true },
  { id: 'auto-03', businessId: 'biz-apex-group', jobKey: 'MONTHLY_GST_REPORT', name: 'Monthly GSTR Filing Export', schedule: '0 0 1 * *', triggerType: 'CRON', actionType: 'GST_SUMMARY', isEnabled: true },
];

export const INITIAL_PLUGINS: NormalizedPlugin[] = [
  { id: 'plug-01', businessId: 'biz-apex-group', pluginKey: 'RAZORPAY', name: 'Razorpay UPI & Smart POS', category: 'PAYMENT', isEnabled: true, settings: { merchantId: 'rzp_live_apex' } },
  { id: 'plug-02', businessId: 'biz-apex-group', pluginKey: 'BARCODE_SCANNER', name: 'High-Speed USB & Bluetooth Scanner', category: 'HARDWARE', isEnabled: true, settings: { autoSubmit: true } },
  { id: 'plug-03', businessId: 'biz-apex-group', pluginKey: 'TALLY_SYNC', name: 'Tally Prime Auto Sync', category: 'ACCOUNTING', isEnabled: true, settings: { company: 'Apex Group' } },
];

export const INITIAL_THEMES: NormalizedTheme[] = [
  {
    id: 'theme-01',
    businessId: 'biz-apex-group',
    colorPreset: 'Royal Gold Luxury',
    fontPreset: 'Outfit',
    invoiceThemeId: 'theme-luxury-gold',
    customCssVars: { '--theme-primary': '#C5A059', '--theme-font': 'Outfit' },
  }
];

export const INITIAL_AUDIT_LOGS: NormalizedAuditLog[] = [
  {
    id: 'audit-norm-01',
    businessId: 'biz-apex-group',
    userId: 'user-admin',
    action: 'INITIALIZE_TENANT_SCHEMA',
    oldValue: null,
    newValue: { status: 'NORMALIZED_ACTIVE' },
    timestamp: '2026-08-26T14:00:00.000Z',
    ip: '192.168.1.100',
    device: 'Server Master Node',
  }
];

export const INITIAL_BRANCHES: NormalizedBranch[] = [
  { id: 'br-chennai-main', businessId: 'biz-apex-group', name: 'Chennai Flagship Outlet', code: 'CHN-01', address: '124, NSC Bose Road, Chennai - 600001', phone: '+91 98400 12345', isHeadquarters: true },
  { id: 'br-bangalore-outlet', businessId: 'biz-apex-group', name: 'Bangalore Tech Park Branch', code: 'BLR-02', address: '45, Outer Ring Road, Bangalore - 560103', phone: '+91 98800 54321', isHeadquarters: false },
  { id: 'br-mumbai-hub', businessId: 'biz-apex-group', name: 'Mumbai Bandra Hub', code: 'MUM-03', address: '88, Hill Road, Bandra West, Mumbai - 400050', phone: '+91 98200 67890', isHeadquarters: false },
];

export const INITIAL_WAREHOUSES: NormalizedWarehouse[] = [
  { id: 'wh-chn-central', businessId: 'biz-apex-group', branchId: 'br-chennai-main', name: 'Chennai Central Storage Depot', code: 'WH-CHN-01', capacity: 15000, type: 'CENTRAL_STORAGE' },
  { id: 'wh-chn-front', businessId: 'biz-apex-group', branchId: 'br-chennai-main', name: 'Chennai Quick Front Shelf', code: 'WH-CHN-02', capacity: 3500, type: 'OUTLET_BACKROOM' },
  { id: 'wh-blr-depot', businessId: 'biz-apex-group', branchId: 'br-bangalore-outlet', name: 'Bangalore Distribution Depot', code: 'WH-BLR-01', capacity: 10000, type: 'CENTRAL_STORAGE' },
  { id: 'wh-mum-depot', businessId: 'biz-apex-group', branchId: 'br-mumbai-hub', name: 'Mumbai Transit Depot', code: 'WH-MUM-01', capacity: 12000, type: 'TRANSIT_DEPOT' },
];

export const INITIAL_COUNTERS: NormalizedCounter[] = [
  { id: 'ctr-chn-pos-01', businessId: 'biz-apex-group', branchId: 'br-chennai-main', name: 'Dine-In Billing Counter 01', counterNumber: 'POS-01', type: 'MAIN_POS' },
  { id: 'ctr-chn-exp-02', businessId: 'biz-apex-group', branchId: 'br-chennai-main', name: 'Express Drive-Thru Counter 02', counterNumber: 'EXP-02', type: 'EXPRESS_CHECKOUT' },
  { id: 'ctr-blr-pos-01', businessId: 'biz-apex-group', branchId: 'br-bangalore-outlet', name: 'Retail Register Counter 01', counterNumber: 'POS-01', type: 'MAIN_POS' },
  { id: 'ctr-mum-pos-01', businessId: 'biz-apex-group', branchId: 'br-mumbai-hub', name: 'Wholesale Billing Counter 01', counterNumber: 'WS-01', type: 'WHOLESALE_DESK' },
];

export class NormalizedDatabaseEngine {
  private static state: NormalizedDatabaseState = {
    businesses: [...INITIAL_BUSINESSES],
    businessTypes: [...INITIAL_BUSINESS_TYPES],
    templates: [...INITIAL_TEMPLATES],
    modules: [...INITIAL_MODULES],
    permissions: [...INITIAL_PERMISSIONS],
    productAttributes: [...INITIAL_PRODUCT_ATTRIBUTES],
    formDefinitions: [...INITIAL_FORM_DEFINITIONS],
    workflows: [...INITIAL_WORKFLOWS],
    notifications: [...INITIAL_NOTIFICATIONS],
    automations: [...INITIAL_AUTOMATIONS],
    plugins: [...INITIAL_PLUGINS],
    themes: [...INITIAL_THEMES],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    branches: [...INITIAL_BRANCHES],
    warehouses: [...INITIAL_WAREHOUSES],
    counters: [...INITIAL_COUNTERS],
  };

  /**
   * Retrieves the full normalized database state
   */
  static getDatabaseState(): NormalizedDatabaseState {
    return this.state;
  }

  /**
   * Retrieves strictly isolated dataset for a specific businessId across all 15 relational tables
   */
  static getTenantDataset(businessId: string): {
    business?: NormalizedBusiness;
    templates: NormalizedTemplate[];
    modules: NormalizedModule[];
    permissions: NormalizedPermission[];
    productAttributes: NormalizedProductAttribute[];
    formDefinitions: NormalizedFormDefinition[];
    workflows: NormalizedWorkflow[];
    notifications: NormalizedNotification[];
    automations: NormalizedAutomation[];
    plugins: NormalizedPlugin[];
    themes: NormalizedTheme[];
    auditLogs: NormalizedAuditLog[];
    branches: NormalizedBranch[];
    warehouses: NormalizedWarehouse[];
    counters: NormalizedCounter[];
  } {
    return {
      business: this.state.businesses.find(b => b.id === businessId),
      templates: this.state.templates.filter(t => t.businessId === businessId),
      modules: this.state.modules.filter(m => m.businessId === businessId),
      permissions: this.state.permissions.filter(p => p.businessId === businessId),
      productAttributes: this.state.productAttributes.filter(a => a.businessId === businessId),
      formDefinitions: this.state.formDefinitions.filter(f => f.businessId === businessId),
      workflows: this.state.workflows.filter(w => w.businessId === businessId),
      notifications: this.state.notifications.filter(n => n.businessId === businessId),
      automations: this.state.automations.filter(a => a.businessId === businessId),
      plugins: this.state.plugins.filter(p => p.businessId === businessId),
      themes: this.state.themes.filter(th => th.businessId === businessId),
      auditLogs: this.state.auditLogs.filter(al => al.businessId === businessId),
      branches: this.state.branches.filter(br => br.businessId === businessId),
      warehouses: this.state.warehouses.filter(wh => wh.businessId === businessId),
      counters: this.state.counters.filter(ctr => ctr.businessId === businessId),
    };
  }

  /**
   * Validates 100% referential integrity ensuring all entities strictly reference a valid businessId
   */
  static verifyReferentialIntegrity(businessId: string): {
    isValid: boolean;
    entityCounts: Record<string, number>;
    unreferencedCount: number;
    issues: string[];
  } {
    const tenant = this.getTenantDataset(businessId);
    const issues: string[] = [];

    if (!tenant.business) {
      issues.push(`Business root record for ID '${businessId}' not found.`);
    }

    // Check branch hierarchy references
    const branchIds = new Set(tenant.branches.map(b => b.id));
    tenant.warehouses.forEach(wh => {
      if (!branchIds.has(wh.branchId)) {
        issues.push(`Warehouse '${wh.id}' references invalid branchId '${wh.branchId}'.`);
      }
    });

    tenant.counters.forEach(ctr => {
      if (!branchIds.has(ctr.branchId)) {
        issues.push(`Counter '${ctr.id}' references invalid branchId '${ctr.branchId}'.`);
      }
    });

    const entityCounts: Record<string, number> = {
      templates: tenant.templates.length,
      modules: tenant.modules.length,
      permissions: tenant.permissions.length,
      productAttributes: tenant.productAttributes.length,
      formDefinitions: tenant.formDefinitions.length,
      workflows: tenant.workflows.length,
      notifications: tenant.notifications.length,
      automations: tenant.automations.length,
      plugins: tenant.plugins.length,
      themes: tenant.themes.length,
      auditLogs: tenant.auditLogs.length,
      branches: tenant.branches.length,
      warehouses: tenant.warehouses.length,
      counters: tenant.counters.length,
    };

    return {
      isValid: issues.length === 0,
      entityCounts,
      unreferencedCount: issues.length,
      issues,
    };
  }

  /**
   * Seeds a new normalized business tenant
   */
  static createTenant(params: {
    id: string;
    name: string;
    businessTypeId: string;
    legalEntityName: string;
  }): NormalizedBusiness {
    const newBiz: NormalizedBusiness = {
      id: params.id,
      name: params.name,
      businessTypeId: params.businessTypeId,
      activeTemplateId: `tpl-${params.id}`,
      legalEntityName: params.legalEntityName,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.businesses.push(newBiz);

    // Seed default template for tenant
    this.state.templates.push({
      id: `tpl-${params.id}`,
      businessId: params.id,
      name: `${params.name} Master Template`,
      code: 'DEFAULT',
      category: 'General',
      configSnapshot: {},
      createdAt: new Date().toISOString(),
    });

    // Seed default headquarters branch
    const hqBranchId = `br-${params.id}-hq`;
    this.state.branches.push({
      id: hqBranchId,
      businessId: params.id,
      name: `${params.name} Central HQ`,
      code: 'HQ-01',
      address: 'Main Commercial Hub',
      phone: '+91 90000 00000',
      isHeadquarters: true,
    });

    // Seed default warehouse
    this.state.warehouses.push({
      id: `wh-${params.id}-01`,
      businessId: params.id,
      branchId: hqBranchId,
      name: `${params.name} Main Storage`,
      code: 'WH-01',
      capacity: 5000,
      type: 'CENTRAL_STORAGE',
    });

    // Seed default counter
    this.state.counters.push({
      id: `ctr-${params.id}-01`,
      businessId: params.id,
      branchId: hqBranchId,
      name: 'Counter 01',
      counterNumber: 'POS-01',
      type: 'MAIN_POS',
    });

    return newBiz;
  }
}
