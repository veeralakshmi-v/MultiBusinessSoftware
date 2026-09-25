import { 
  LeaveApplication, 
  LeaveType, 
  LeaveStatus, 
  LeaveBalance, 
  LeaveSummaryMetrics,
  MonthlyLeaveSummaryItem,
  YearlyLeaveSummaryItem
} from '../../types/leave';

export const LEAVE_TYPE_CONFIG: Record<LeaveType, { label: string; defaultQuota: number; color: string }> = {
  CASUAL_LEAVE: { label: 'Casual Leave (CL)', defaultQuota: 12, color: '#C5A059' },
  SICK_LEAVE: { label: 'Sick Leave (SL)', defaultQuota: 8, color: '#EF4444' },
  EARNED_LEAVE: { label: 'Earned Leave (EL)', defaultQuota: 18, color: '#3B82F6' },
  MATERNITY_LEAVE: { label: 'Maternity Leave (ML)', defaultQuota: 180, color: '#EC4899' },
  PATERNITY_LEAVE: { label: 'Paternity Leave (PL)', defaultQuota: 15, color: '#8B5CF6' },
  LOSS_OF_PAY: { label: 'Loss Of Pay (LOP)', defaultQuota: 0, color: '#6B7280' },
  WORK_FROM_HOME: { label: 'Work From Home (WFH)', defaultQuota: 12, color: '#10B981' },
  CUSTOM: { label: 'Custom Leave', defaultQuota: 5, color: '#F59E0B' },
};

export const INITIAL_LEAVE_APPLICATIONS: LeaveApplication[] = [];

export class LeaveEngine {
  private static STORAGE_KEY = 'multi_biz_leave_applications_db';
  private static memoryLeaves: LeaveApplication[] = [];

  /**
   * Retrieves leave applications with optional filtering
   */
  static getLeaveApplications(filters?: {
    employeeId?: string;
    status?: LeaveStatus | 'ALL';
    leaveType?: LeaveType | 'ALL';
    search?: string;
  }): LeaveApplication[] {
    let list = this.memoryLeaves;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryLeaves = list;
        }
      }
    } catch {}

    if (filters) {
      if (filters.employeeId) {
        list = list.filter(l => l.employeeId === filters.employeeId);
      }

      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(l => l.status === filters.status);
      }

      if (filters.leaveType && filters.leaveType !== 'ALL') {
        list = list.filter(l => l.leaveType === filters.leaveType);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(l => 
          l.employeeName.toLowerCase().includes(q) ||
          l.reason.toLowerCase().includes(q) ||
          l.department.toLowerCase().includes(q)
        );
      }
    }

    return list.sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
  }

  /**
   * 1. Employee Action: Apply Leave
   */
  static applyLeave(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
    businessId?: string;
  }): LeaveApplication {
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    const totalDays = params.isHalfDay ? 0.5 : Math.max(1, diffDays);

    const newApp: LeaveApplication = {
      id: `leave-${Date.now()}`,
      businessId: params.businessId || 'biz-apex-group',
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      leaveType: params.leaveType,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays,
      isHalfDay: params.isHalfDay,
      reason: params.reason,
      status: 'PENDING',
      appliedOn: new Date().toISOString(),
    };

    this.memoryLeaves.unshift(newApp);
    this.saveState();
    return newApp;
  }

  /**
   * 2. Employee Action: Cancel Leave
   */
  static cancelLeave(id: string, employeeId?: string): boolean {
    const app = this.memoryLeaves.find(l => l.id === id);
    if (!app) return false;

    if (employeeId && app.employeeId !== employeeId) {
      return false; // Security check
    }

    app.status = 'CANCELLED';
    this.saveState();
    return true;
  }

  /**
   * 3. Manager Action: Approve Leave
   */
  static managerApprove(id: string, managerName: string, remarks?: string): LeaveApplication | undefined {
    const app = this.memoryLeaves.find(l => l.id === id);
    if (!app) return undefined;

    app.status = 'APPROVED';
    app.reviewedBy = managerName;
    app.reviewedOn = new Date().toISOString();
    app.managerRemarks = remarks || 'Approved by reporting manager.';
    this.saveState();
    return app;
  }

  /**
   * 4. Manager Action: Reject Leave
   */
  static managerReject(id: string, managerName: string, reason: string): LeaveApplication | undefined {
    const app = this.memoryLeaves.find(l => l.id === id);
    if (!app) return undefined;

    app.status = 'REJECTED';
    app.reviewedBy = managerName;
    app.reviewedOn = new Date().toISOString();
    app.managerRemarks = reason;
    this.saveState();
    return app;
  }

  /**
   * 5. Manager Action: Forward Leave
   */
  static managerForward(id: string, managerName: string, forwardTo: string): LeaveApplication | undefined {
    const app = this.memoryLeaves.find(l => l.id === id);
    if (!app) return undefined;

    app.status = 'FORWARDED';
    app.reviewedBy = managerName;
    app.forwardedTo = forwardTo;
    app.managerRemarks = `Forwarded to ${forwardTo} for administrative concurrence.`;
    this.saveState();
    return app;
  }

  /**
   * 6. HR Action: Override Leave
   */
  static hrOverride(id: string, hrName: string, newStatus: LeaveStatus, remarks: string): LeaveApplication | undefined {
    const app = this.memoryLeaves.find(l => l.id === id);
    if (!app) return undefined;

    app.status = newStatus;
    app.hrOverrideRemarks = `[HR Override by ${hrName}]: ${remarks}`;
    app.reviewedBy = hrName;
    app.reviewedOn = new Date().toISOString();
    this.saveState();
    return app;
  }

  /**
   * Retrieves leave quota balances for an employee or organization
   */
  static getLeaveBalances(employeeId?: string): Record<LeaveType, LeaveBalance> {
    const apps = this.getLeaveApplications(employeeId ? { employeeId, status: 'APPROVED' } : { status: 'APPROVED' });

    const balances = {} as Record<LeaveType, LeaveBalance>;

    (Object.keys(LEAVE_TYPE_CONFIG) as LeaveType[]).forEach(type => {
      const config = LEAVE_TYPE_CONFIG[type];
      const usedDays = apps
        .filter(a => a.leaveType === type)
        .reduce((sum, a) => sum + a.totalDays, 0);

      balances[type] = {
        leaveType: type,
        label: config.label,
        totalQuota: config.defaultQuota,
        used: usedDays,
        available: Math.max(0, config.defaultQuota - usedDays),
      };
    });

    return balances;
  }

  /**
   * Computes high-level dashboard metrics
   */
  static getLeaveMetrics(employeeId?: string): LeaveSummaryMetrics {
    const all = this.getLeaveApplications(employeeId ? { employeeId } : undefined);

    const pendingCount = all.filter(a => a.status === 'PENDING' || a.status === 'FORWARDED').length;
    const approvedCount = all.filter(a => a.status === 'APPROVED').length;
    const rejectedCount = all.filter(a => a.status === 'REJECTED').length;
    const cancelledCount = all.filter(a => a.status === 'CANCELLED').length;
    const balances = this.getLeaveBalances(employeeId);

    return {
      pendingCount,
      approvedCount,
      rejectedCount,
      cancelledCount,
      balances,
    };
  }

  /**
   * Aggregates monthly leave summary
   */
  static getMonthlyLeaveSummary(year = 2026): MonthlyLeaveSummaryItem[] {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const apps = this.getLeaveApplications({ status: 'APPROVED' });

    return months.map((m, idx) => {
      const monthStr = `${year}-${String(idx + 1).padStart(2, '0')}`;
      const monthApps = apps.filter(a => a.startDate.startsWith(monthStr));

      return {
        month: `${m} ${year}`,
        totalLeaves: monthApps.reduce((sum, a) => sum + a.totalDays, 0),
        casualLeaves: monthApps.filter(a => a.leaveType === 'CASUAL_LEAVE').reduce((sum, a) => sum + a.totalDays, 0),
        sickLeaves: monthApps.filter(a => a.leaveType === 'SICK_LEAVE').reduce((sum, a) => sum + a.totalDays, 0),
        earnedLeaves: monthApps.filter(a => a.leaveType === 'EARNED_LEAVE').reduce((sum, a) => sum + a.totalDays, 0),
        wfhCount: monthApps.filter(a => a.leaveType === 'WORK_FROM_HOME').reduce((sum, a) => sum + a.totalDays, 0),
        lossOfPay: monthApps.filter(a => a.leaveType === 'LOSS_OF_PAY').reduce((sum, a) => sum + a.totalDays, 0),
      };
    });
  }

  /**
   * Aggregates yearly leave summary
   */
  static getYearlyLeaveSummary(year = 2026): YearlyLeaveSummaryItem[] {
    const balances = this.getLeaveBalances();

    return (Object.keys(LEAVE_TYPE_CONFIG) as LeaveType[]).map(type => {
      const b = balances[type];
      const rate = b.totalQuota > 0 ? Math.round((b.used / b.totalQuota) * 100) : 0;

      return {
        leaveType: type,
        label: b.label,
        allocated: b.totalQuota,
        consumed: b.used,
        balance: b.available,
        utilizationRate: Math.min(100, rate),
      };
    });
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryLeaves));
      }
    } catch {}
  }
}
