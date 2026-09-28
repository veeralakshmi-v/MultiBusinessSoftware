import { AuditLogEntry, AuditFilterOptions, AuditActionCategory } from '../../types/audit';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

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
