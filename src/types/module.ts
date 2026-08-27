import { BusinessTemplate, BusinessType } from './template';

export type ModuleId =
  | 'dashboard'
  | 'sales'         // Billing POS / Sales Checkout
  | 'catalog'       // Menu / Products / Services
  | 'inventory'     // Stock, Raw Materials, Batches, BOM
  | 'purchase'      // Supplier Purchase Orders & Inwarding
  | 'crm'           // Customers, Loyalty & Client Ledgers
  | 'kitchen'       // Kitchen KDS / Fulfillment Stations / Job Queue
  | 'tables'        // Dining Tables / Service Points / Bays / Chairs
  | 'delivery'      // Delivery & Shipping Dispatch
  | 'promotions'    // BOGO Offers, Coupons, Discounts
  | 'accounts'      // Financial Ledgers, Tax & Cash Register
  | 'reports'       // Analytics & Audit Reports
  | 'hr'            // Staff Directory, Shifts & PINs
  | 'users'         // User Accounts & RBAC
  | 'settings';     // Store Settings, Profile, Hardware

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN_STAFF' | 'STAFF';

export interface ModulePermissionDefinition {
  key: string;
  name: string;
  description: string;
  defaultRoles: UserRole[];
}

export interface ModuleRouteDefinition {
  path: string;
  pageComponent: string; // Identifier for lazy loading
  title: string;
  requiredPermission?: string;
  subRoutes?: ModuleRouteDefinition[];
}

export interface ModuleMenuItemDefinition {
  path: string;
  name: string;
  icon: string;
  order: number;
  rolesAllowed: UserRole[];
  badgeKey?: string;
}

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  category: 'Core Billing' | 'Operations & Fulfillment' | 'Back Office & Finance' | 'Administration';
  defaultEnabled: boolean;
  isCore?: boolean; // Cannot be disabled (e.g. Dashboard, Settings)
  dependencies?: ModuleId[];
  menuItem: ModuleMenuItemDefinition;
  routes: ModuleRouteDefinition[];
  permissions: ModulePermissionDefinition[];
}

export type EnabledModulesState = Record<ModuleId, boolean>;

export interface ModuleEngineConfig {
  enabledModules: EnabledModulesState;
  activeTemplate: BusinessTemplate;
  userRole: UserRole;
}
