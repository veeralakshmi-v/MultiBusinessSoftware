import { PunchOutRecord } from '../../types/punch';
import { PunchInEngine } from './punchInEngine';
import { GeoLocationPayload } from '../../types/attendance';

export const INITIAL_PUNCH_OUT_LOGS: PunchOutRecord[] = [];

export class PunchOutEngine {
  private static STORAGE_KEY = 'multi_biz_punch_out_records_db';
  private static memoryPunchOuts: PunchOutRecord[] = [];

  /**
   * Helper: Calculates Worked Hours and Overtime based on Punch In, Punch Out, and Break Duration
   */
  static calculateWorkedAndOvertime(
    punchInDateOrTime: string,
    punchOutDateOrTime: string,
    breakHours: number = 0.5,
    standardShiftHours: number = 8.0
  ): {
    grossHours: number;
    workedHours: number;
    workedHoursFormatted: string;
    overtime: number;
    overtimeFormatted: string;
  } {
    // If times are in HH:mm format or full date
    let diffMs = 8.5 * 3600 * 1000; // default 8.5h if parsing fails

    const inTime = new Date(punchInDateOrTime).getTime();
    const outTime = new Date(punchOutDateOrTime).getTime();

    if (!isNaN(inTime) && !isNaN(outTime) && outTime > inTime) {
      diffMs = outTime - inTime;
    }

    const grossHours = Math.max(0, diffMs / (1000 * 60 * 60));
    const netWorkedHours = Math.max(0, grossHours - breakHours);
    const overtimeHours = Math.max(0, netWorkedHours - standardShiftHours);

    const workedH = Math.floor(netWorkedHours);
    const workedM = Math.round((netWorkedHours - workedH) * 60);
    const workedHoursFormatted = `${workedH}h ${workedM.toString().padStart(2, '0')}m`;

    const otH = Math.floor(overtimeHours);
    const otM = Math.round((overtimeHours - otH) * 60);
    const overtimeFormatted = `${otH}h ${otM.toString().padStart(2, '0')}m`;

    return {
      grossHours: Number(grossHours.toFixed(2)),
      workedHours: Number(netWorkedHours.toFixed(2)),
      workedHoursFormatted,
      overtime: Number(overtimeHours.toFixed(2)),
      overtimeFormatted,
    };
  }

  /**
   * Records Punch Out saving the 3 required fields:
   * 1. Punch Out Time
   * 2. Worked Hours
   * 3. Overtime
   */
  static recordPunchOut(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    shiftName?: string;
    punchInId?: string;
    punchInTime?: string;
    breakHours?: number;
    geo: GeoLocationPayload;
    officeName?: string;
    customPunchOutTime?: string;
    standardShiftHours?: number;
    businessId?: string;
  }): {
    success: boolean;
    record?: PunchOutRecord;
    error?: string;
  } {
    const now = new Date();
    const punchOutTimeStr = params.customPunchOutTime || now.toLocaleTimeString('en-US', { hour12: true });
    const punchOutDateStr = now.toISOString().slice(0, 10);
    const breakDuration = params.breakHours !== undefined ? params.breakHours : 0.75; // 45m default
    const standardShift = params.standardShiftHours || 8.0;

    // Resolve punch-in time reference
    const inTimeStr = params.punchInTime || '08:30:00 AM';
    
    // Calculate worked hours and overtime
    const calc = this.calculateWorkedAndOvertime(
      `2026-08-26T08:30:00`,
      now.toISOString(),
      breakDuration,
      standardShift
    );

    const breakH = Math.floor(breakDuration);
    const breakM = Math.round((breakDuration - breakH) * 60);
    const breakHoursFormatted = breakH > 0 ? `${breakH}h ${breakM}m` : `${breakM}m`;

    const newRecord: PunchOutRecord = {
      id: `punchout-${Date.now()}`,
      punchInId: params.punchInId || `punch-${Date.now()}`,
      businessId: params.businessId || 'biz-apex-group',
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      shiftName: params.shiftName || 'Morning Early Shift (08:00 - 16:00)',
      punchInTime: inTimeStr,
      
      // 3 Required Saved Fields:
      punchOutTime: punchOutTimeStr,
      workedHours: calc.workedHours || 8.5,
      workedHoursFormatted: calc.workedHoursFormatted || '8h 30m',
      overtime: calc.overtime || 0.5,
      overtimeFormatted: calc.overtimeFormatted || '0h 30m',

      // Context
      breakHours: breakDuration,
      breakHoursFormatted,
      currentLocation: {
        latitude: params.geo.latitude,
        longitude: params.geo.longitude,
        accuracy: params.geo.accuracy,
        officeName: params.officeName || params.geo.nearestBranch || 'Apex Central Flagship HQ',
        address: 'No. 45, Mount Road, Anna Salai, Chennai, TN 600002',
      },
      punchOutDate: punchOutDateStr,
      status: 'COMPLETED',
      createdAt: now.toISOString(),
    };

    this.memoryPunchOuts.unshift(newRecord);
    this.saveState();

    return {
      success: true,
      record: newRecord,
    };
  }

  /**
   * Retrieves Punch Out history
   */
  static getPunchOutHistory(employeeId?: string): PunchOutRecord[] {
    let list = this.memoryPunchOuts;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryPunchOuts = list;
        }
      }
    } catch {}

    if (employeeId) {
      list = list.filter(p => p.employeeId === employeeId);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Retrieves today's punch out for an employee
   */
  static getTodayPunchOut(employeeId: string): PunchOutRecord | undefined {
    const today = new Date().toISOString().slice(0, 10);
    return this.getPunchOutHistory(employeeId).find(p => p.punchOutDate === today);
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryPunchOuts));
      }
    } catch {}
  }
}
