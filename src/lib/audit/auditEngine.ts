import { AuditLogEntry, AuditFilterOptions, AuditActionCategory } from '../../types/audit';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    userId: 'user-admin',
    userName: 'Admin User',
    userRole: 'ADMIN',
    action: 'UPDATE_PRODUCT_PRICE',
    category: 'INVENTORY',
    entityType: 'PRODUCT',
    entityId: 'prod-rice-01',
    oldValue: { costPrice: 120.00, sellingPrice: 160.00 },
    newValue: { costPrice: 135.00, sellingPrice: 175.00 },
    diffSummary: 'Cost Price: ₹120.00 ➔ ₹135.00, Selling Price: ₹160.00 ➔ ₹175.00',
    timestamp: '2026-08-26T14:30:00.000Z',
    ip: '192.168.1.102',
    device: 'POS Terminal #1 (Chrome 124 on Windows 11)',
    branchId: 'br-chennai-main',
    counterId: 'ctr-chn-pos-01',
  },
  {
    id: 'audit-002',
    userId: 'user-cashier-01',
    userName: 'Kowsalya Cashier',
    userRole: 'CASHIER',
    action: 'APPLY_CUSTOM_DISCOUNT',
    category: 'BILLING',
    entityType: 'ORDER',
    entityId: 'ORD-2026-8801',
    oldValue: { billTotal: 1500.00, discountAmount: 0.00, discountPercent: 0 },
    newValue: { billTotal: 1350.00, discountAmount: 150.00, discountPercent: 10 },
    diffSummary: 'Applied 10% VIP Discount (₹150.00 deduction)',
    timestamp: '2026-08-26T15:10:22.000Z',
    ip: '192.168.1.104',
    device: 'Counter #2 Touch POS (Edge on Windows POS)',
    branchId: 'br-chennai-main',
    counterId: 'ctr-chn-exp-02',
  },
  {
    id: 'audit-003',
    userId: 'user-manager-02',
    userName: 'Anitha Manager',
    userRole: 'MANAGER',
    action: 'CANCEL_BILL_TRANSACTION',
    category: 'FINANCIAL',
    entityType: 'ORDER',
    entityId: 'ORD-2026-8799',
    oldValue: { status: 'PAID', total: 2450.00, isVoided: false },
    newValue: { status: 'VOIDED', total: 0.00, isVoided: true, voidReason: 'Customer Return' },
    diffSummary: 'Bill Voided: Full refund of ₹2450.00 issued',
    timestamp: '2026-08-26T15:45:10.000Z',
    ip: '10.0.2.45',
    device: 'Manager iPad (Safari 17 on iPadOS)',
    branchId: 'br-bangalore-outlet',
    counterId: 'ctr-blr-pos-01',
  },
  {
    id: 'audit-004',
    userId: 'user-admin',
    userName: 'Admin User',
    userRole: 'ADMIN',
    action: 'UPDATE_USER_PERMISSIONS',
    category: 'SECURITY',
    entityType: 'USER',
    entityId: 'user-suresh-03',
    oldValue: { role: 'CASHIER', allowedModules: ['sales', 'crm'] },
    newValue: { role: 'MANAGER', allowedModules: ['sales', 'inventory', 'reports'] },
    diffSummary: 'Promoted role from CASHIER to MANAGER',
    timestamp: '2026-08-26T16:02:44.000Z',
    ip: '192.168.1.1',
    device: 'Admin Workstation (Firefox 125 on MacOS)',
    branchId: 'br-chennai-main',
  },
];

export class AuditEngine {
  private static STORAGE_KEY = 'multi_biz_audit_logs';
  private static memoryLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];

  /**
   * Logs a new action with complete mutation trail
   */
  static logAction(params: {
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    category: AuditActionCategory;
    entityType: string;
    entityId: string;
    oldValue: any;
    newValue: any;
    diffSummary?: string;
    ip?: string;
    device?: string;
    branchId?: string;
    counterId?: string;
  }): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      category: params.category,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      diffSummary: params.diffSummary || `${JSON.stringify(params.oldValue)} ➔ ${JSON.stringify(params.newValue)}`,
      timestamp: new Date().toISOString(),
      ip: params.ip || '192.168.1.100',
      device: params.device || 'POS Terminal (Chrome on Windows)',
      branchId: params.branchId,
      counterId: params.counterId,
    };

    this.memoryLogs.unshift(entry);

    try {
      if (typeof localStorage !== 'undefined') {
        const existing = this.getLogs();
        existing.unshift(entry);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing.slice(0, 500))); // keep latest 500
      }
    } catch {}

    return entry;
  }

  /**
   * Retrieves audit logs with optional filtering
   */
  static getLogs(filters?: AuditFilterOptions): AuditLogEntry[] {
    let list: AuditLogEntry[] = this.memoryLogs;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryLogs = list;
        }
      }
    } catch {}

    if (!filters) return list;

    return list.filter(item => {
      if (filters.userId && item.userId !== filters.userId) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.entityType && item.entityType !== filters.entityType) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches = 
          item.userName.toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q) ||
          item.entityId.toLowerCase().includes(q) ||
          item.ip.toLowerCase().includes(q) ||
          item.diffSummary.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  /**
   * Exports audit log data in CSV format for compliance
   */
  static exportToCSV(filters?: AuditFilterOptions): string {
    const logs = this.getLogs(filters);
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Category', 'Entity', 'Old Value', 'New Value', 'IP Address', 'Device'];
    const rows = logs.map(l => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.category,
      `${l.entityType} (${l.entityId})`,
      `"${JSON.stringify(l.oldValue).replace(/"/g, '""')}"`,
      `"${JSON.stringify(l.newValue).replace(/"/g, '""')}"`,
      l.ip,
      `"${l.device}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
