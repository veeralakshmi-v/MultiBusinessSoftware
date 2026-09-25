import { Shift, ShiftType, ShiftFilterOptions, LateRule, HalfDayRule } from '../../types/shift';

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-001',
    businessId: 'biz-apex-group',
    name: 'Morning Shift',
    code: 'SHIFT-MRN',
    type: 'MORNING',
    punchInTime: '08:00',
    graceTimeMinutes: 15,
    punchOutTime: '16:00',
    weeklyOffDays: ['Sunday'],
    lateRule: {
      graceTimeMinutes: 15,
      maxAllowedLateMinutes: 60,
      consecutiveLateTolerance: 3,
      penaltyDescription: '15 mins grace period. 3 consecutive late marks result in 0.5 day salary deduction.',
    },
    halfDayRule: {
      minWorkHoursForHalfDay: 4.0,
      minWorkHoursForFullDay: 7.5,
      halfDayCutoffTime: '12:30',
      description: 'Work < 4.0 hrs = Absent, 4.0 to 7.4 hrs = Half Day, >= 7.5 hrs = Full Day.',
    },
    totalShiftHours: 8.0,
    status: 'ACTIVE',
    assignedStaffCount: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'shift-002',
    businessId: 'biz-apex-group',
    name: 'General Shift',
    code: 'SHIFT-GEN',
    type: 'GENERAL',
    punchInTime: '09:30',
    graceTimeMinutes: 15,
    punchOutTime: '18:30',
    weeklyOffDays: ['Sunday'],
    lateRule: {
      graceTimeMinutes: 15,
      maxAllowedLateMinutes: 45,
      consecutiveLateTolerance: 3,
      penaltyDescription: 'Late marked after 09:45 AM. 3 late marks = 0.5 day deduction.',
    },
    halfDayRule: {
      minWorkHoursForHalfDay: 4.5,
      minWorkHoursForFullDay: 8.0,
      halfDayCutoffTime: '14:00',
      description: 'Min 4.5 hrs for half day, 8.0 hrs for full day.',
    },
    totalShiftHours: 9.0,
    status: 'ACTIVE',
    assignedStaffCount: 4,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'shift-003',
    businessId: 'biz-apex-group',
    name: 'Evening Shift',
    code: 'SHIFT-EVE',
    type: 'EVENING',
    punchInTime: '16:00',
    graceTimeMinutes: 15,
    punchOutTime: '00:00',
    weeklyOffDays: ['Monday'],
    lateRule: {
      graceTimeMinutes: 15,
      maxAllowedLateMinutes: 60,
      consecutiveLateTolerance: 3,
      penaltyDescription: 'Late marked after 16:15 PM.',
    },
    halfDayRule: {
      minWorkHoursForHalfDay: 4.0,
      minWorkHoursForFullDay: 7.5,
      halfDayCutoffTime: '20:00',
      description: 'Min 4.0 hrs for half day, 7.5 hrs for full day.',
    },
    totalShiftHours: 8.0,
    status: 'ACTIVE',
    assignedStaffCount: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'shift-004',
    businessId: 'biz-apex-group',
    name: 'Night Shift',
    code: 'SHIFT-NGT',
    type: 'NIGHT',
    punchInTime: '00:00',
    graceTimeMinutes: 15,
    punchOutTime: '08:00',
    weeklyOffDays: ['Tuesday'],
    lateRule: {
      graceTimeMinutes: 15,
      maxAllowedLateMinutes: 30,
      consecutiveLateTolerance: 2,
      penaltyDescription: 'Strict night shift grace: 15 mins. Late marked after 00:15 AM.',
    },
    halfDayRule: {
      minWorkHoursForHalfDay: 4.0,
      minWorkHoursForFullDay: 7.5,
      halfDayCutoffTime: '04:00',
      description: 'Min 4.0 hrs for half day, 7.5 hrs for full day.',
    },
    totalShiftHours: 8.0,
    status: 'ACTIVE',
    assignedStaffCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'shift-005',
    businessId: 'biz-apex-group',
    name: 'Custom Shift',
    code: 'SHIFT-CUST',
    type: 'CUSTOM',
    punchInTime: '11:00',
    graceTimeMinutes: 20,
    punchOutTime: '20:00',
    weeklyOffDays: ['Wednesday'],
    lateRule: {
      graceTimeMinutes: 20,
      maxAllowedLateMinutes: 60,
      consecutiveLateTolerance: 3,
      penaltyDescription: 'Flexible 20 mins grace. Late after 11:20 AM.',
    },
    halfDayRule: {
      minWorkHoursForHalfDay: 4.5,
      minWorkHoursForFullDay: 9.0,
      halfDayCutoffTime: '15:30',
      description: 'Min 4.5 hrs for half day, 9.0 hrs for full day.',
    },
    totalShiftHours: 9.0,
    status: 'ACTIVE',
    assignedStaffCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
];

export class ShiftEngine {
  private static STORAGE_KEY = 'multi_biz_shifts_db';
  private static memoryShifts: Shift[] = [...INITIAL_SHIFTS];

  /**
   * Retrieves filtered and searched shifts
   */
  static getShifts(filters?: ShiftFilterOptions): Shift[] {
    let list = this.memoryShifts;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryShifts = list;
        }
      }
    } catch {}

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(s => 
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
        );
      }

      if (filters.type && filters.type !== 'ALL') {
        list = list.filter(s => s.type === filters.type);
      }

      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(s => s.status === filters.status);
      }
    }

    return list;
  }

  /**
   * Retrieves shift by ID or Code
   */
  static getShiftById(id: string): Shift | undefined {
    return this.memoryShifts.find(s => s.id === id || s.code === id || s.type === id);
  }

  /**
   * Adds a new shift
   */
  static addShift(data: {
    name: string;
    code: string;
    type: ShiftType;
    punchInTime: string;
    graceTimeMinutes: number;
    punchOutTime: string;
    weeklyOffDays: string[];
    lateRule: LateRule;
    halfDayRule: HalfDayRule;
    status?: 'ACTIVE' | 'INACTIVE';
    businessId?: string;
  }): Shift {
    // Calculate total hours
    const [inH, inM] = data.punchInTime.split(':').map(Number);
    const [outH, outM] = data.punchOutTime.split(':').map(Number);
    let diff = (outH + outM / 60) - (inH + inM / 60);
    if (diff < 0) diff += 24; // Cross midnight

    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      businessId: data.businessId || 'biz-apex-group',
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type,
      punchInTime: data.punchInTime,
      graceTimeMinutes: data.graceTimeMinutes,
      punchOutTime: data.punchOutTime,
      weeklyOffDays: data.weeklyOffDays,
      lateRule: data.lateRule,
      halfDayRule: data.halfDayRule,
      totalShiftHours: Number(diff.toFixed(1)),
      status: data.status || 'ACTIVE',
      assignedStaffCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryShifts.unshift(newShift);
    this.saveState();
    return newShift;
  }

  /**
   * Updates an existing shift
   */
  static updateShift(id: string, updates: Partial<Shift>): Shift | undefined {
    const index = this.memoryShifts.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const current = this.memoryShifts[index];
    const updated: Shift = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.memoryShifts[index] = updated;
    this.saveState();
    return updated;
  }

  /**
   * Deletes a shift
   */
  static deleteShift(id: string): boolean {
    const initialLen = this.memoryShifts.length;
    this.memoryShifts = this.memoryShifts.filter(s => s.id !== id);
    if (this.memoryShifts.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Evaluates attendance punch against shift rules
   */
  static evaluateAttendancePunch(
    shift: Shift, 
    actualPunchIn: string, 
    actualPunchOut?: string
  ): {
    status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';
    lateMinutes: number;
    isLate: boolean;
    workHours: number;
    ruleRemarks: string;
  } {
    const [shiftInH, shiftInM] = shift.punchInTime.split(':').map(Number);
    const [actInH, actInM] = actualPunchIn.split(':').map(Number);

    const shiftInMinutes = shiftInH * 60 + shiftInM;
    const actInMinutes = actInH * 60 + actInM;

    let lateMinutes = actInMinutes - shiftInMinutes;
    if (lateMinutes < 0) lateMinutes = 0; // Early arrival

    const isLate = lateMinutes > shift.graceTimeMinutes;

    let workHours = 0;
    if (actualPunchOut) {
      const [actOutH, actOutM] = actualPunchOut.split(':').map(Number);
      let outMin = actOutH * 60 + actOutM;
      if (outMin < actInMinutes) outMin += 24 * 60; // Overnight
      workHours = Number(((outMin - actInMinutes) / 60).toFixed(1));
    }

    let status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' = 'PRESENT';
    let ruleRemarks = 'Punched on time within grace window.';

    if (workHours > 0 && workHours < shift.halfDayRule.minWorkHoursForHalfDay) {
      status = 'ABSENT';
      ruleRemarks = `Work hours (${workHours} hrs) below half-day threshold (${shift.halfDayRule.minWorkHoursForHalfDay} hrs).`;
    } else if (workHours > 0 && workHours < shift.halfDayRule.minWorkHoursForFullDay) {
      status = 'HALF_DAY';
      ruleRemarks = `Half-Day marked: Worked ${workHours} hrs (Threshold: ${shift.halfDayRule.minWorkHoursForFullDay} hrs).`;
    } else if (isLate) {
      status = 'LATE';
      ruleRemarks = `Late punch-in by ${lateMinutes} mins (Grace was ${shift.graceTimeMinutes} mins).`;
    }

    return {
      status,
      lateMinutes,
      isLate,
      workHours,
      ruleRemarks,
    };
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryShifts));
      }
    } catch {}
  }
}
