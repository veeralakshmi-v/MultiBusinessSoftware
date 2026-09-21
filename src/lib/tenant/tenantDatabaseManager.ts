/**
 * TenantDatabaseManager.ts
 * 
 * Provides isolated Database-Per-Tenant / Schema-Per-Tenant architecture.
 * Ensures every business created in the platform has a strictly isolated database namespace
 * with its own independent tables for Employees, Products, Categories, Orders, Customers,
 * Suppliers, Attendance, and Settings.
 */

// List of all collection keys that must be isolated per tenant database
export const TENANT_ISOLATED_TABLES = [
  'universal_items',
  'universal_categories',
  'universal_staff_list',
  'universal_employees',
  'universal_customers',
  'universal_orders',
  'universal_suppliers',
  'universal_attendance_records',
  'universal_attendance_logs',
  'universal_leave_requests',
  'universal_shifts',
  'universal_holidays',
  'universal_business_profile',
  'universal_website_config',
  'universal_website_inquiries',
  'orders_today',
  'bills_list',
  'invoices_history',
  'pos_draft_order',
  'inventory_transactions',
  'inventory_movements',
  'raw_materials',
  'recipe_items',
  'custom_fields',
  'promotions_list',
] as const;

export type TenantTable = typeof TENANT_ISOLATED_TABLES[number];

export interface TenantDatabaseStats {
  databaseName: string;
  schemaNamespace: string;
  businessId: string;
  totalProducts: number;
  totalEmployees: number;
  totalOrders: number;
  totalCustomers: number;
  totalSuppliers: number;
  sizeBytes: number;
  lastUpdated: string;
}

export class TenantDatabaseManager {
  private static isInitialized = false;

  /**
   * Retrieves the currently active tenant ID
   */
  static getActiveTenantId(): string {
    return (
      localStorage.getItem('businessId') ||
      'biz-default-business'
    );
  }

  /**
   * Returns the dedicated database / schema name for a tenant
   */
  static getDatabaseName(tenantId?: string): string {
    const tid = tenantId || this.getActiveTenantId();
    const cleanId = tid.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return `tenant_db_${cleanId}`;
  }

  /**
   * Translates a table name into the tenant's isolated storage key
   */
  static getTenantKey(tableName: string, tenantId?: string): string {
    const tid = tenantId || this.getActiveTenantId();
    return `tenant_${tid}_${tableName}`;
  }

  /**
   * Reads data strictly from a tenant's isolated database
   */
  static getTable<T = any>(tableName: string, tenantId?: string, defaultVal: T = [] as any): T {
    const key = this.getTenantKey(tableName, tenantId);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return defaultVal;
  }

  /**
   * Writes data strictly into a tenant's isolated database
   */
  static setTable<T = any>(tableName: string, data: T, tenantId?: string): void {
    const key = this.getTenantKey(tableName, tenantId);
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('tenant_database_updated', {
      detail: { tenantId: tenantId || this.getActiveTenantId(), tableName, key }
    }));
  }

  /**
   * Deletes a table in a tenant's isolated database
   */
  static deleteTable(tableName: string, tenantId?: string): void {
    const key = this.getTenantKey(tableName, tenantId);
    localStorage.removeItem(key);
  }

  /**
   * Completely purges a tenant's database namespace
   */
  static dropTenantDatabase(tenantId: string): void {
    const prefix = `tenant_${tenantId}_`;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  }

  /**
   * Retrieves statistics and table row counts for a specific tenant database
   */
  static getDatabaseStats(tenantId: string): TenantDatabaseStats {
    const products = this.getTable<any[]>('universal_items', tenantId, []);
    const employees = this.getTable<any[]>('universal_staff_list', tenantId, []);
    const orders = this.getTable<any[]>('universal_orders', tenantId, []);
    const customers = this.getTable<any[]>('universal_customers', tenantId, []);
    const suppliers = this.getTable<any[]>('universal_suppliers', tenantId, []);

    // Calculate approx size in bytes for this tenant's namespace
    let sizeBytes = 0;
    const prefix = `tenant_${tenantId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const val = localStorage.getItem(key) || '';
        sizeBytes += key.length + val.length * 2;
      }
    }

    return {
      databaseName: this.getDatabaseName(tenantId),
      schemaNamespace: `schema_${tenantId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      businessId: tenantId,
      totalProducts: Array.isArray(products) ? products.length : 0,
      totalEmployees: Array.isArray(employees) ? employees.length : 0,
      totalOrders: Array.isArray(orders) ? orders.length : 0,
      totalCustomers: Array.isArray(customers) ? customers.length : 0,
      totalSuppliers: Array.isArray(suppliers) ? suppliers.length : 0,
      sizeBytes,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Initializes transparent routing interceptor so any component reading or writing
   * `universal_...` automatically routes to that active tenant's isolated database namespace.
   */
  static initializeStorageRouter(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    const originalGetItem = localStorage.getItem.bind(localStorage);
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    const isIsolatedTable = (key: string): boolean => {
      // Check if key is one of the isolated tables and not already tenant-prefixed
      if (key.startsWith('tenant_') || key.startsWith('saas_') || key.startsWith('user_') || key.startsWith('token')) {
        return false;
      }
      return TENANT_ISOLATED_TABLES.some(t => key === t || key.startsWith(`${t}_`));
    };

    // Proxy getItem
    localStorage.getItem = function (key: string): string | null {
      if (isIsolatedTable(key)) {
        const activeTenantId = originalGetItem('businessId') ||
          'biz-default-business';
        const tenantKey = `tenant_${activeTenantId}_${key}`;
        const tenantVal = originalGetItem(tenantKey);
        if (tenantVal !== null) {
          return tenantVal;
        }
        return null;
      }
      return originalGetItem(key);
    };

    // Proxy setItem
    localStorage.setItem = function (key: string, value: string): void {
      if (isIsolatedTable(key)) {
        const activeTenantId = originalGetItem('businessId') ||
          'biz-default-business';
        const tenantKey = `tenant_${activeTenantId}_${key}`;
        return originalSetItem(tenantKey, value);
      }
      return originalSetItem(key, value);
    };

    // Proxy removeItem
    localStorage.removeItem = function (key: string): void {
      if (isIsolatedTable(key)) {
        const activeTenantId = originalGetItem('businessId') ||
          'biz-default-business';
        const tenantKey = `tenant_${activeTenantId}_${key}`;
        return originalRemoveItem(tenantKey);
      }
      return originalRemoveItem(key);
    };
  }
}
