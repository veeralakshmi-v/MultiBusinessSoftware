import { BreakRecord, BreakType, BreakStatus, DailyWorkBreakSummary } from '../../types/break';

export const INITIAL_BREAK_LOGS: BreakRecord[] = [
  {
    id: 'brk-001',
    businessId: 'biz-apex-group',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    breakType: 'TEA',
    breakTitle: 'Morning Tea Break',
    breakStart: '11:00:00 AM',
    breakEnd: '11:15:00 AM',
    durationMinutes: 15,
    durationHours: 0.25,
    durationFormatted: '15m',
    status: 'COMPLETED',
    date: '2026-08-26',
    createdAt: '2026-08-26T11:00:00.000Z',
    updatedAt: '2026-08-26T11:15:00.000Z',
  },
  {
    id: 'brk-002',
    businessId: 'biz-apex-group',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    breakType: 'LUNCH',
    breakTitle: 'Lunch Break',
    breakStart: '01:15:00 PM',
    breakEnd: '01:50:00 PM',
    durationMinutes: 35,
    durationHours: 0.58,
    durationFormatted: '35m',
    status: 'COMPLETED',
    date: '2026-08-26',
    createdAt: '2026-08-26T13:15:00.000Z',
    updatedAt: '2026-08-26T13:50:00.000Z',
  },
  {
    id: 'brk-003',
    businessId: 'biz-apex-group',
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    department: 'Kitchen & Culinary',
    breakType: 'LUNCH',
    breakTitle: 'Lunch Break',
    breakStart: '01:00:00 PM',
    breakEnd: '01:45:00 PM',
    durationMinutes: 45,
    durationHours: 0.75,
    durationFormatted: '45m',
    status: 'COMPLETED',
    date: '2026-08-26',
    createdAt: '2026-08-26T13:00:00.000Z',
    updatedAt: '2026-08-26T13:45:00.000Z',
  },
  {
    id: 'brk-004',
    businessId: 'biz-apex-group',
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    department: 'Kitchen & Culinary',
    breakType: 'CUSTOM',
    breakTitle: 'Custom Rest & Hydration Break',
    customReason: 'Kitchen heat cool-off and hydration',
    breakStart: '03:30:00 PM',
    breakEnd: '03:45:00 PM',
    durationMinutes: 15,
    durationHours: 0.25,
    durationFormatted: '15m',
    status: 'COMPLETED',
    date: '2026-08-26',
    createdAt: '2026-08-26T15:30:00.000Z',
    updatedAt: '2026-08-26T15:45:00.000Z',
  },
];

export class BreakEngine {
  private static STORAGE_KEY = 'multi_biz_break_records_db';
  private static memoryBreaks: BreakRecord[] = [...INITIAL_BREAK_LOGS];

  /**
   * Starts a new Break session (Lunch Break, Tea Break, or Custom Break)
   */
  static startBreak(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    breakType: BreakType;
    customTitle?: string;
    customReason?: string;
    customStartTime?: string;
    businessId?: string;
  }): {
    success: boolean;
    record?: BreakRecord;
    error?: string;
  } {
    // Check if an in-progress break already exists
    const active = this.getActiveBreak(params.employeeId);
    if (active) {
      return {
        success: false,
        error: `You already have an active "${active.breakTitle}" in progress since ${active.breakStart}. Please end it first.`,
      };
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const timeStr = params.customStartTime || now.toLocaleTimeString('en-US', { hour12: true });

    let title = 'Tea Break';
    if (params.breakType === 'LUNCH') title = 'Lunch Break';
    else if (params.breakType === 'CUSTOM') title = params.customTitle || 'Custom Break';

    const newBreak: BreakRecord = {
      id: `brk-${Date.now()}`,
      businessId: params.businessId || 'biz-apex-group',
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      breakType: params.breakType,
      breakTitle: title,
      customReason: params.customReason,
      breakStart: timeStr,
      durationMinutes: 0,
      durationHours: 0,
      durationFormatted: 'In Progress...',
      status: 'IN_PROGRESS',
      date: today,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.memoryBreaks.unshift(newBreak);
    this.saveState();

    return {
      success: true,
      record: newBreak,
    };
  }

  /**
   * Ends an active Break session and calculates elapsed break duration
   */
  static endBreak(
    employeeId: string, 
    customEndTime?: string,
    forcedDurationMinutes?: number
  ): {
    success: boolean;
    record?: BreakRecord;
    error?: string;
  } {
    const active = this.getActiveBreak(employeeId);
    if (!active) {
      return {
        success: false,
        error: 'No active break session found for this employee.',
      };
    }

    const now = new Date();
    const endTimeStr = customEndTime || now.toLocaleTimeString('en-US', { hour12: true });
    
    // Calculate duration
    let durationM = forcedDurationMinutes;
    if (durationM === undefined) {
      const startMs = new Date(active.createdAt).getTime();
      const endMs = now.getTime();
      const diffMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
      durationM = diffMinutes > 0 ? diffMinutes : (active.breakType === 'TEA' ? 15 : 30);
    }

    const durationH = Number((durationM / 60).toFixed(2));
    const h = Math.floor(durationM / 60);
    const m = durationM % 60;
    const durationFormatted = h > 0 ? `${h}h ${m}m` : `${m}m`;

    active.breakEnd = endTimeStr;
    active.durationMinutes = durationM;
    active.durationHours = durationH;
    active.durationFormatted = durationFormatted;
    active.status = 'COMPLETED';
    active.updatedAt = now.toISOString();

    this.saveState();

    return {
      success: true,
      record: active,
    };
  }

  /**
   * Calculates Total Break Hours and Net Working Hours for an employee
   * Net Working Hours = Gross Work Hours - Total Break Hours
   */
  static calculateDailyWorkingHours(
    employeeId: string,
    grossWorkHours: number = 8.5,
    date?: string
  ): DailyWorkBreakSummary {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const breaks = this.getBreakHistory(employeeId, targetDate);
    const active = this.getActiveBreak(employeeId);

    const completedBreaks = breaks.filter(b => b.status === 'COMPLETED');
    const totalBreakMinutes = completedBreaks.reduce((sum, b) => sum + (b.durationMinutes || 0), 0);
    const totalBreakHours = Number((totalBreakMinutes / 60).toFixed(2));

    const netWorkingHours = Math.max(0, Number((grossWorkHours - totalBreakHours).toFixed(2)));
    const netH = Math.floor(netWorkingHours);
    const netM = Math.round((netWorkingHours - netH) * 60);
    const netWorkingHoursFormatted = `${netH}h ${netM.toString().padStart(2, '0')}m`;

    const empName = breaks[0]?.employeeName || 'Staff Member';

    return {
      employeeId,
      employeeName: empName,
      date: targetDate,
      grossWorkHours: Number(grossWorkHours.toFixed(2)),
      totalBreakMinutes,
      totalBreakHours,
      netWorkingHours,
      netWorkingHoursFormatted,
      breaksCount: completedBreaks.length,
      breaks,
      activeBreak: active,
    };
  }

  /**
   * Retrieves active in-progress break for an employee
   */
  static getActiveBreak(employeeId: string): BreakRecord | undefined {
    return this.getBreakHistory(employeeId).find(b => b.status === 'IN_PROGRESS');
  }

  /**
   * Retrieves Break history
   */
  static getBreakHistory(employeeId?: string, date?: string): BreakRecord[] {
    let list = this.memoryBreaks;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryBreaks = list;
        }
      }
    } catch {}

    if (employeeId) {
      list = list.filter(b => b.employeeId === employeeId);
    }

    if (date) {
      list = list.filter(b => b.date === date);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryBreaks));
      }
    } catch {}
  }
}
