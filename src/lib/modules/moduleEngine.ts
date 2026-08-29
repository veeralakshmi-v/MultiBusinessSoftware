import { 
  ModuleId, 
  ModuleDefinition, 
  EnabledModulesState, 
  UserRole, 
  ModuleMenuItemDefinition, 
  ModuleRouteDefinition 
} from '../../types/module';
import { BusinessTemplate } from '../../types/template';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MASTER MODULE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard Overview',
    description: 'Executive overview, real-time KPI metrics, revenue trends, and day-wise order summaries.',
    icon: 'LayoutDashboard',
    category: 'Core Billing',
    defaultEnabled: true,
    isCore: true,
    menuItem: {
      path: '/',
      name: 'Dashboard',
      icon: 'LayoutDashboard',
      order: 1,
      rolesAllowed: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    routes: [
      { path: '/', pageComponent: 'Dashboard', title: 'Dashboard Overview', requiredPermission: 'viewDashboard' }
    ],
    permissions: [
      { key: 'viewDashboard', name: 'View Dashboard', description: 'Access revenue metrics and sales summaries', defaultRoles: ['ADMIN', 'MANAGER', 'CASHIER'] }
    ]
  },

  sales: {
    id: 'sales',
    name: 'Sales & Billing POS',
    description: 'Point of Sale checkout, product search, cart calculation, barcode scanning, and multi-mode payment.',
    icon: 'ReceiptText',
    category: 'Core Billing',
    defaultEnabled: true,
    isCore: true,
    menuItem: {
      path: '/billing',
      name: 'Billing POS',
      icon: 'ReceiptText',
      order: 2,
      rolesAllowed: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    routes: [
      { path: '/billing', pageComponent: 'BillingPOS', title: 'Billing POS', requiredPermission: 'billingPos' }
    ],
    permissions: [
      { key: 'billingPos', name: 'Create Sales Invoices', description: 'Create and print invoices on POS', defaultRoles: ['ADMIN', 'MANAGER', 'CASHIER'] },
      { key: 'manualDiscount', name: 'Apply Manual Discounts', description: 'Override bill discount amounts', defaultRoles: ['ADMIN', 'MANAGER'] },
      { key: 'cancelOrders', name: 'Cancel / Refund Orders', description: 'Void or cancel generated bills', defaultRoles: ['ADMIN', 'MANAGER'] },
    ]
  },

  catalog: {
    id: 'catalog',
    name: 'Products & Catalog',
    description: 'Manage items, pricing, categories, dynamic attributes, barcodes, and availability.',
    icon: 'BookOpen',
    category: 'Core Billing',
    defaultEnabled: true,
    menuItem: {
      path: '/menu',
      name: 'Catalog & Menu',
      icon: 'BookOpen',
      order: 3,
      rolesAllowed: ['ADMIN', 'MANAGER'],
    },
    routes: [
      { path: '/menu', pageComponent: 'MenuManagement', title: 'Product Catalog', requiredPermission: 'manageCatalog' }
    ],
    permissions: [
      { key: 'manageCatalog', name: 'Manage Catalog & Pricing', description: 'Create and edit items and categories', defaultRoles: ['ADMIN', 'MANAGER'] },
      { key: 'viewCatalog', name: 'View Catalog', description: 'Browse products and price lists', defaultRoles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    ]
  },

  tables: {
    id: 'tables',
    name: 'Dining Tables & Service Points',
    description: 'Manage dining tables, salon chairs, service bays, occupancy tracking, and table shift/merge.',
    icon: 'GripHorizontal',
    category: 'Operations & Fulfillment',
    defaultEnabled: true,
    menuItem: {
      path: '/tables',
      name: 'Tables & Seating',
      icon: 'GripHorizontal',
      order: 4,
      rolesAllowed: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    routes: [
      { path: '/tables', pageComponent: 'FloorPlan', title: 'Service Points & Tables', requiredPermission: 'manageTables' }
    ],
    permissions: [
      { key: 'manageTables', name: 'Manage Tables & Seating', description: 'Change occupancy and shift/merge tables', defaultRoles: ['ADMIN', 'MANAGER', 'CASHIER'] }
    ]
  },

  kitchen: {
    id: 'kitchen',
    name: 'Kitchen & Order Fulfillment (KDS)',
    description: 'Live order queue, fulfillment status pipeline, audio alerts, and station routing.',
    icon: 'ChefHat',
    category: 'Operations & Fulfillment',
    defaultEnabled: true,
    menuItem: {
      path: '/orders',
      name: 'Kitchen Orders',
      icon: 'ChefHat',
      order: 5,
      rolesAllowed: ['ADMIN', 'MANAGER', 'STAFF'],
    },
    routes: [
      { path: '/orders', pageComponent: 'Orders', title: 'Fulfillment Queue', requiredPermission: 'viewFulfillment' }
    ],
    permissions: [
      { key: 'viewFulfillment', name: 'View Orders Queue', description: 'Access live order prep screen', defaultRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { key: 'updateOrderStatus', name: 'Update Order Status', description: 'Advance preparation status', defaultRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
    ]
  },

  inventory: {
    id: 'inventory',
    name: 'Inventory & Stock Management',
    description: 'Track SKU stock, raw materials, BOM recipes, suppliers, stock movements, and batch expiry.',
    icon: 'Package',
    category: 'Back Office & Finance',
    defaultEnabled: true,
    menuItem: {
      path: '/inventory',
      name: 'Inventory & Stock',
      icon: 'Package',
      order: 6,
      rolesAllowed: ['ADMIN', 'MANAGER'],
    },
    routes: [
      { path: '/inventory', pageComponent: 'Inventory', title: 'Inventory Management', requiredPermission: 'manageInventory' }
    ],
    permissions: [
      { key: 'manageInventory', name: 'Manage Stock & Recipes', description: 'Adjust stock, manage BOM and batches', defaultRoles: ['ADMIN', 'MANAGER'] },
      { key: 'viewInventory', name: 'View Stock Balances', description: 'Check current inventory levels', defaultRoles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    ]
  },

  purchase: {
    id: 'purchase',
    name: 'Purchase Orders & Inward Stock',
    description: 'Manage supplier purchase orders, inward goods inspection, and vendor bills.',
    icon: 'Boxes',
    category: 'Back Office & Finance',
    defaultEnabled: false,
    menuItem: {
      path: '/inventory',
      name: 'Purchase Orders',
      icon: 'Boxes',
      order: 7,
      rolesAllowed: ['ADMIN', 'MANAGER'],
    },
    routes: [
      { path: '/purchase', pageComponent: 'Inventory', title: 'Purchase Management', requiredPermission: 'managePurchase' }
    ],
    permissions: [
      { key: 'managePurchase', name: 'Manage Purchase Inwarding', description: 'Create and receive purchase orders', defaultRoles: ['ADMIN', 'MANAGER'] }
    ]
  },

  crm: {
    id: 'crm',
    name: 'CRM & Customer Loyalty',
    description: 'Customer profiles, loyalty rewards points, credit limits, purchase histories, and WhatsApp/SMS messaging.',
    icon: 'Users',
    category: 'Operations & Fulfillment',
    defaultEnabled: true,
    menuItem: {
      path: '/customers',
      name: 'Customers & CRM',
      icon: 'Users',
      order: 8,
      rolesAllowed: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    routes: [
      { path: '/customers', pageComponent: 'Customers', title: 'Customer Management', requiredPermission: 'manageCrm' }
    ],
    permissions: [
      { key: 'manageCrm', name: 'Manage Customers & Loyalty', description: 'Create profiles and manage credit lines', defaultRoles: ['ADMIN', 'MANAGER', 'CASHIER'] }
    ]
  },

  promotions: {
    id: 'promotions',
    name: 'Promotions & Discounts Engine',
    description: 'Create BOGO offers, percentage discounts, happy hours, and coupon codes.',
    icon: 'Tag',
    category: 'Core Billing',
    defaultEnabled: true,
    menuItem: {
      path: '/promotions',
      name: 'Promotions & Deals',
      icon: 'Tag',
      order: 9,
      rolesAllowed: ['ADMIN', 'MANAGER'],
    },
    routes: [
      { path: '/promotions', pageComponent: 'Promotions', title: 'Promotions Engine', requiredPermission: 'managePromotions' }
    ],
    permissions: [
      { key: 'managePromotions', name: 'Manage Discounts & Offers', description: 'Create and edit promotional deals', defaultRoles: ['ADMIN', 'MANAGER'] }
    ]
  },

  delivery: {
    id: 'delivery',
    name: 'Home Delivery & Shipping',
    description: 'Manage delivery partner assignments, parcel tracking, and shipping fees.',
    icon: 'Truck',
    category: 'Operations & Fulfillment',
    defaultEnabled: false,
    menuItem: {
      path: '/orders',
      name: 'Delivery Queue',
      icon: 'Truck',
      order: 10,
      rolesAllowed: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    routes: [
      { path: '/delivery', pageComponent: 'Orders', title: 'Delivery Management', requiredPermission: 'manageDelivery' }
    ],
    permissions: [
      { key: 'manageDelivery', name: 'Manage Delivery Dispatch', description: 'Assign riders and dispatch shipments', defaultRoles: ['ADMIN', 'MANAGER', 'CASHIER'] }
    ]
  },

  accounts: {
    id: 'accounts',
    name: 'Accounts & Financial Ledgers',
    description: 'Cash drawer balances, payment reconciliations, customer credit ledgers, and expense logging.',
    icon: 'DollarSign',
    category: 'Back Office & Finance',
    defaultEnabled: false,
    menuItem: {
      path: '/reports',
      name: 'Accounts & Ledgers',
      icon: 'DollarSign',
      order: 11,
      rolesAllowed: ['ADMIN', 'MANAGER'],
    },
    routes: [
      { path: '/accounts', pageComponent: 'Reports', title: 'Accounts & Ledgers', requiredPermission: 'viewAccounts' }
    ],
    permissions: [
      { key: 'viewAccounts', name: 'View Financial Accounts', description: 'Access cash collections and ledgers', defaultRoles: ['ADMIN'] }
    ]
  },

  reports: {
    id: 'reports',
    name: 'Analytics & Audit Reports',
    description: 'Sales summaries, item-wise volume, cashier collections, GSTR tax returns, and CSV/PDF export.',
    icon: 'BarChart3',
    category: 'Back Office & Finance',
    defaultEnabled: true,
    menuItem: {
      path: '/reports',
      name: 'Reports & Analytics',
      icon: 'BarChart3',
      order: 12,
      rolesAllowed: ['ADMIN', 'MANAGER'],
    },
    routes: [
      { path: '/reports', pageComponent: 'Reports', title: 'Reports & Analytics', requiredPermission: 'viewReports' }
    ],
    permissions: [
      { key: 'viewReports', name: 'View Business Analytics', description: 'Generate audit and tax reports', defaultRoles: ['ADMIN', 'MANAGER'] }
    ]
  },

  hr: {
    id: 'hr',
    name: 'Staff & HR Maintenance',
    description: 'Employee directory, quick login PIN codes, staff roles, and shift tracking.',
    icon: 'Users',
    category: 'Administration',
    defaultEnabled: true,
    menuItem: {
      path: '/staff',
      name: 'Staff Management',
      icon: 'Users',
      order: 13,
      rolesAllowed: ['ADMIN'],
    },
    routes: [
      { path: '/staff', pageComponent: 'Settings', title: 'Staff Maintenance', requiredPermission: 'manageStaff' }
    ],
    permissions: [
      { key: 'manageStaff', name: 'Manage Staff Profiles', description: 'Add employees and reset PIN codes', defaultRoles: ['ADMIN'] }
    ]
  },

  users: {
    id: 'users',
    name: 'User Accounts & Security',
    description: 'System login credentials, role-based access control, and password management.',
    icon: 'Key',
    category: 'Administration',
    defaultEnabled: true,
    menuItem: {
      path: '/staff',
      name: 'User Accounts',
      icon: 'Key',
      order: 14,
      rolesAllowed: ['ADMIN'],
    },
    routes: [
      { path: '/users', pageComponent: 'Settings', title: 'User Accounts', requiredPermission: 'manageUsers' }
    ],
    permissions: [
      { key: 'manageUsers', name: 'Manage User Accounts', description: 'Create and edit login credentials', defaultRoles: ['ADMIN'] }
    ]
  },

  settings: {
    id: 'settings',
    name: 'Business Profile & Settings',
    description: 'Store branding, thermal printer hardware, tax slabs, invoice numbering, and theme customizations.',
    icon: 'Settings',
    category: 'Administration',
    defaultEnabled: true,
    isCore: true,
    menuItem: {
      path: '/settings',
      name: 'Settings',
      icon: 'Settings',
      order: 15,
      rolesAllowed: ['ADMIN'],
    },
    routes: [
      { path: '/settings', pageComponent: 'Settings', title: 'Store Settings', requiredPermission: 'manageSettings' }
    ],
    permissions: [
      { key: 'manageSettings', name: 'Manage Store Configuration', description: 'Edit store profile, tax and hardware', defaultRoles: ['ADMIN'] }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MODULE ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class ModuleEngine {
  /**
   * Retrieves all registered modules in the system.
   */
  public static getAllModules(): ModuleDefinition[] {
    return Object.values(MODULE_REGISTRY);
  }

  /**
   * Retrieves a single module definition by ID.
   */
  public static getModule(id: ModuleId): ModuleDefinition | undefined {
    return MODULE_REGISTRY[id];
  }

  /**
   * Calculates the default enabled module state for a given Business Template.
   */
  public static getDefaultEnabledModules(template: BusinessTemplate): EnabledModulesState {
    const tmplModules = template.modules;
    return {
      dashboard: true,
      sales: true,
      catalog: true,
      inventory: tmplModules.enableInventory ?? true,
      purchase: false,
      crm: tmplModules.enableCrm ?? true,
      kitchen: tmplModules.enableFulfillmentStations ?? false,
      tables: tmplModules.enableServicePoints ?? false,
      delivery: false,
      promotions: tmplModules.enablePromotions ?? true,
      accounts: false,
      reports: tmplModules.enableReports ?? true,
      hr: tmplModules.enableStaffManagement ?? true,
      users: true,
      settings: true,
    };
  }

  /**
   * AUTOMATIC MENU GENERATOR
   * Generates dynamic sidebar navigation items based on active modules, template terminology, and user role.
   */
  public static generateMenus(
    enabledModules: EnabledModulesState,
    template: BusinessTemplate,
    userRole: UserRole = 'ADMIN'
  ): ModuleMenuItemDefinition[] {
    const terms = template.terms;
    const allModules = Object.values(MODULE_REGISTRY);

    return allModules
      .filter(module => {
        // Module must be enabled in tenant state
        const isEnabled = enabledModules[module.id] ?? module.defaultEnabled;
        if (!isEnabled && !module.isCore) return false;

        // User role must be allowed
        return module.menuItem.rolesAllowed.includes(userRole);
      })
      .sort((a, b) => a.menuItem.order - b.menuItem.order)
      .map(module => {
        const item = { ...module.menuItem };

        // Apply dynamic template nomenclature overrides
        if (module.id === 'catalog' && terms?.itemNoun) {
          item.name = `${terms.itemNoun} Catalog`;
        }
        if (module.id === 'sales' && terms?.invoiceTitle) {
          item.name = template.templateId === 'RESTAURANT' ? 'Billing POS' : 'Sales POS';
        }
        if (module.id === 'tables' && terms?.servicePointNoun) {
          item.name = terms.servicePointNoun === 'Dining Table' ? 'Dining Tables' : `${terms.servicePointNoun}s`;
        }
        if (module.id === 'kitchen' && terms?.fulfillmentNoun) {
          item.name = template.templateId === 'RESTAURANT' ? 'Kitchen Orders' : `${terms.fulfillmentNoun} Queue`;
        }
        if (module.id === 'crm' && terms?.customerNoun) {
          item.name = `${terms.customerNoun}s & CRM`;
        }

        return item;
      });
  }

  /**
   * AUTOMATIC ROUTE GENERATOR
   * Generates dynamic routes for all enabled modules.
   */
  public static generateRoutes(
    enabledModules: EnabledModulesState,
    template: BusinessTemplate
  ): ModuleRouteDefinition[] {
    const activeRoutes: ModuleRouteDefinition[] = [];

    Object.values(MODULE_REGISTRY).forEach(module => {
      const isEnabled = enabledModules[module.id] ?? module.defaultEnabled;
      if (isEnabled || module.isCore) {
        activeRoutes.push(...module.routes);
      }
    });

    return activeRoutes;
  }

  /**
   * AUTOMATIC PERMISSIONS GENERATOR
   * Generates the comprehensive RBAC permission map for all active modules.
   */
  public static generatePermissions(
    enabledModules: EnabledModulesState,
    template: BusinessTemplate
  ): Record<UserRole, Record<string, boolean>> {
    const roles: UserRole[] = ['ADMIN', 'MANAGER', 'CASHIER', 'STAFF'];
    const permissionsMap: Record<UserRole, Record<string, boolean>> = {
      ADMIN: {},
      MANAGER: {},
      CASHIER: {},
      STAFF: {},
    };

    // Iterate through all enabled modules
    Object.values(MODULE_REGISTRY).forEach(module => {
      const isEnabled = enabledModules[module.id] ?? module.defaultEnabled;
      if (!isEnabled && !module.isCore) return;

      module.permissions.forEach(perm => {
        roles.forEach(role => {
          // Check if role is in defaultRoles for this permission
          const isAllowed = perm.defaultRoles.includes(role);
          permissionsMap[role][perm.key] = isAllowed;
        });
      });
    });

    // Merge template-specific custom permissions overrides if present
    if (template.permissions) {
      Object.entries(template.permissions).forEach(([role, perms]) => {
        const targetRole = role as UserRole;
        if (permissionsMap[targetRole]) {
          Object.assign(permissionsMap[targetRole], perms);
        }
      });
    }

    return permissionsMap;
  }

  /**
   * Checks if a user role has a specific permission.
   */
  public static hasPermission(
    userRole: UserRole,
    permissionKey: string,
    permissionsMap: Record<string, Record<string, boolean>>
  ): boolean {
    return permissionsMap[userRole]?.[permissionKey] ?? false;
  }

  /**
   * Helper to verify if a module is currently active.
   */
  public static isModuleEnabled(
    moduleId: ModuleId,
    enabledModules: EnabledModulesState
  ): boolean {
    if (MODULE_REGISTRY[moduleId]?.isCore) return true;
    return Boolean(enabledModules[moduleId]);
  }
}
