export interface BusinessEntity {
  id: string;
  name: string;
  code: string;
  gstin?: string;
  currency: string;
  defaultTemplateId: string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  isMainBranch: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Warehouse {
  id: string;
  branchId: string;
  businessId: string;
  name: string;
  code: string;
  isPrimary: boolean;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BillingCounter {
  id: string;
  branchId: string;
  warehouseId: string;
  businessId: string;
  counterNumber: string;
  name: string;
  type: 'POS' | 'EXPRESS' | 'DRIVE_THRU' | 'KIOSK' | 'WHOLESALE';
  status: 'OPEN' | 'CLOSED';
  activeCashierName?: string;
}

export interface ScopedEntityContext {
  businessId: string;
  branchId: string;
  warehouseId: string;
  counterId: string;
}

export interface InventoryStockLevel {
  productId: string;
  warehouseId: string;
  branchId: string;
  businessId: string;
  stock: number;
  reservedStock: number;
}
