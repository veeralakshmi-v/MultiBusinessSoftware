export type LeaveType = 
  | 'CASUAL_LEAVE'
  | 'SICK_LEAVE'
  | 'EARNED_LEAVE'
  | 'MATERNITY_LEAVE'
  | 'PATERNITY_LEAVE'
  | 'LOSS_OF_PAY'
  | 'WORK_FROM_HOME'
  | 'CUSTOM';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'FORWARDED';

export interface LeaveBalance {
  leaveType: LeaveType;
  label: string;
  totalQuota: number;
  used: number;
  available: number;
}

export interface LeaveApplication {
  id: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  isHalfDay?: boolean;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  managerRemarks?: string;
  forwardedTo?: string;
  hrOverrideRemarks?: string;
  reviewedBy?: string;
  reviewedOn?: string;
}

export interface LeaveSummaryMetrics {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  balances: Record<string, LeaveBalance>;
}

export interface MonthlyLeaveSummaryItem {
  month: string; // e.g. 'Jan 2026'
  totalLeaves: number;
  casualLeaves: number;
  sickLeaves: number;
  earnedLeaves: number;
  wfhCount: number;
  lossOfPay: number;
}

export interface YearlyLeaveSummaryItem {
  leaveType: LeaveType;
  label: string;
  allocated: number;
  consumed: number;
  balance: number;
  utilizationRate: number; // Percentage
}
