import { Shift, ShiftType, ShiftFilterOptions, LateRule, HalfDayRule } from '../../types/shift';

export const INITIAL_SHIFTS: Shift[] = [];

export class ShiftEngine {
  private static STORAGE_KEY = 'multi_biz_shifts_db';
  private static memoryShifts: Shift[] = [];

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
