export type ShiftType = 'MORNING' | 'GENERAL' | 'EVENING' | 'NIGHT' | 'CUSTOM';

export interface LateRule {
  graceTimeMinutes: number; // e.g. 15 mins
  maxAllowedLateMinutes: number; // e.g. 60 mins
  consecutiveLateTolerance: number; // e.g. 3 lates before half-day cut
  penaltyDescription: string;
}

export interface HalfDayRule {
  minWorkHoursForHalfDay: number; // e.g. 4.5 hours
  minWorkHoursForFullDay: number; // e.g. 8.0 hours
  halfDayCutoffTime: string; // e.g. '13:00'
  description: string;
}

export interface Shift {
  id: string;
  businessId: string;
  name: string; // Shift Name e.g. 'Morning Shift (Kitchen & Cash Desk)'
  code: string; // e.g. 'SHIFT-MRN'
  type: ShiftType;
  punchInTime: string; // Format 'HH:mm' e.g. '08:00'
  graceTimeMinutes: number; // Grace Time in minutes e.g. 15
  punchOutTime: string; // Format 'HH:mm' e.g. '16:00'
  weeklyOffDays: string[]; // Weekly Off e.g. ['Sunday']
  lateRule: LateRule;
  halfDayRule: HalfDayRule;
  totalShiftHours: number;
  status: 'ACTIVE' | 'INACTIVE';
  assignedStaffCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftFilterOptions {
  search?: string;
  type?: ShiftType | 'ALL';
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
}
