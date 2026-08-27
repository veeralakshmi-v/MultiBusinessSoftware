export type AuditActionCategory = 
  | 'FINANCIAL' 
  | 'INVENTORY' 
  | 'BILLING' 
  | 'SECURITY' 
  | 'SETTINGS' 
  | 'SYSTEM';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: AuditActionCategory;
  entityType: string; // 'ORDER' | 'PRODUCT' | 'USER' | 'SETTINGS' | 'STOCK' | 'BRANCH'
  entityId: string;
  oldValue: any;
  newValue: any;
  diffSummary: string;
  timestamp: string;
  ip: string;
  device: string;
  branchId?: string;
  counterId?: string;
}

export interface AuditFilterOptions {
  userId?: string;
  category?: AuditActionCategory;
  entityType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
