import { 
  BusinessEntity, 
  Branch, 
  Warehouse, 
  BillingCounter, 
  ScopedEntityContext, 
  InventoryStockLevel 
} from '../../types/branch';

export const DEFAULT_BUSINESS: BusinessEntity = {
  id: 'biz-default-business',
  name: 'Multi-Business Enterprise',
  code: 'BIZ-GRP',
  gstin: '',
  currency: 'INR',
  defaultTemplateId: 'RETAIL',
};

export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'br-main-outlet',
    businessId: 'biz-default-business',
    name: 'Main Store Outlet',
    code: 'STR-01',
    city: 'Chennai',
    address: '124, Commercial Road, Central Plaza',
    phone: '+91 98765 43210',
    email: 'contact@mybusiness.com',
    isMainBranch: true,
    status: 'ACTIVE',
  },
];

export const DEFAULT_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-main-central',
    branchId: 'br-main-outlet',
    businessId: 'biz-default-business',
    name: 'Main Storage Depot',
    code: 'WH-MAIN',
    isPrimary: true,
    capacity: 15000,
    status: 'ACTIVE',
  },
];

export const DEFAULT_COUNTERS: BillingCounter[] = [
  {
    id: 'ctr-pos-01',
    branchId: 'br-main-outlet',
    warehouseId: 'wh-main-central',
    businessId: 'biz-default-business',
    counterNumber: 'CTR-01',
    name: 'Main Billing POS Counter',
    type: 'POS',
    status: 'OPEN',
    activeCashierName: '',
  },
];

export class BranchEngine {
  private static STORAGE_BRANCHES = 'multi_biz_branches';
  private static STORAGE_WAREHOUSES = 'multi_biz_warehouses';
  private static STORAGE_COUNTERS = 'multi_biz_counters';
  private static STORAGE_STOCK = 'multi_biz_warehouse_stock';

  /**
   * Retrieves all branches for a business
   */
  static getBranches(businessId: string = 'biz-apex-group'): Branch[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_BRANCHES);
      if (raw) {
        const saved: Branch[] = JSON.parse(raw);
        return saved.filter(b => b.businessId === businessId);
      }
    } catch {}
    return DEFAULT_BRANCHES.filter(b => b.businessId === businessId);
  }

  static getBranch(branchId: string): Branch | undefined {
    return this.getBranches().find(b => b.id === branchId);
  }

  /**
   * Retrieves warehouses for a given branch
   */
  static getWarehouses(branchId?: string): Warehouse[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_WAREHOUSES);
      let list: Warehouse[] = DEFAULT_WAREHOUSES;
      if (raw) {
        list = JSON.parse(raw);
      }
      if (branchId) {
        return list.filter(w => w.branchId === branchId);
      }
      return list;
    } catch {
      return branchId ? DEFAULT_WAREHOUSES.filter(w => w.branchId === branchId) : DEFAULT_WAREHOUSES;
    }
  }

  static getWarehouse(warehouseId: string): Warehouse | undefined {
    return this.getWarehouses().find(w => w.id === warehouseId);
  }

  /**
   * Retrieves billing counters for a given branch
   */
  static getCounters(branchId?: string): BillingCounter[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_COUNTERS);
      let list: BillingCounter[] = DEFAULT_COUNTERS;
      if (raw) {
        list = JSON.parse(raw);
      }
      if (branchId) {
        return list.filter(c => c.branchId === branchId);
      }
      return list;
    } catch {
      return branchId ? DEFAULT_COUNTERS.filter(c => c.branchId === branchId) : DEFAULT_COUNTERS;
    }
  }

  static getCounter(counterId: string): BillingCounter | undefined {
    return this.getCounters().find(c => c.id === counterId);
  }

  /**
   * Enforces strict entity isolation across dataset queries
   */
  static filterByScope<T extends { businessId?: string; branchId?: string; warehouseId?: string; counterId?: string }>(
    dataset: T[],
    scope: Partial<ScopedEntityContext>
  ): T[] {
    return dataset.filter(item => {
      if (scope.businessId && item.businessId && item.businessId !== scope.businessId) {
        return false;
      }
      if (scope.branchId && item.branchId && item.branchId !== scope.branchId) {
        return false;
      }
      if (scope.warehouseId && item.warehouseId && item.warehouseId !== scope.warehouseId) {
        return false;
      }
      if (scope.counterId && item.counterId && item.counterId !== scope.counterId) {
        return false;
      }
      return true;
    });
  }

  private static memoryStock: Record<string, number> = {};

  /**
   * Gets isolated stock level for a product in a specific warehouse
   */
  static getWarehouseStock(productId: string, warehouseId: string): number {
    const key = `${productId}_${warehouseId}`;
    if (this.memoryStock[key] !== undefined) {
      return this.memoryStock[key];
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_STOCK);
        if (raw) {
          const stocks: Record<string, number> = JSON.parse(raw);
          if (stocks[key] !== undefined) {
            this.memoryStock[key] = stocks[key];
            return stocks[key];
          }
        }
      }
    } catch {}
    this.memoryStock[key] = 100; // default baseline stock
    return 100;
  }

  /**
   * Performs an isolated inter-warehouse stock transfer
   */
  static transferStock(productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number): { success: boolean; message: string } {
    if (quantity <= 0) return { success: false, message: 'Transfer quantity must be greater than 0' };

    const currentFrom = this.getWarehouseStock(productId, fromWarehouseId);
    if (currentFrom < quantity) {
      return { success: false, message: `Insufficient stock in source warehouse (${currentFrom} available, ${quantity} requested)` };
    }

    const currentTo = this.getWarehouseStock(productId, toWarehouseId);
    const newFrom = currentFrom - quantity;
    const newTo = currentTo + quantity;

    const fromKey = `${productId}_${fromWarehouseId}`;
    const toKey = `${productId}_${toWarehouseId}`;
    this.memoryStock[fromKey] = newFrom;
    this.memoryStock[toKey] = newTo;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_STOCK);
        const stocks: Record<string, number> = raw ? JSON.parse(raw) : {};
        stocks[fromKey] = newFrom;
        stocks[toKey] = newTo;
        localStorage.setItem(this.STORAGE_STOCK, JSON.stringify(stocks));
      }
    } catch {}

    return {
      success: true,
      message: `Successfully transferred ${quantity} units from ${fromWarehouseId} to ${toWarehouseId}`,
    };
  }
}
