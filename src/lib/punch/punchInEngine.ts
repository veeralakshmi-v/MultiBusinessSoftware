import { PunchInRecord } from '../../types/punch';
import { GeofenceValidator } from '../attendance/geofenceValidator';
import { ShiftEngine } from '../shifts/shiftEngine';
import { OfficeLocationEngine } from '../locations/officeLocationEngine';
import { GeoLocationPayload } from '../../types/attendance';

export const INITIAL_PUNCH_IN_LOGS: PunchInRecord[] = [
  {
    id: 'punch-001',
    businessId: 'biz-apex-group',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    department: 'Billing & Cash Desk',
    shiftName: 'Morning Early Shift (08:00 - 16:00)',
    punchInTime: '08:05:14 AM',
    punchInDate: '2026-08-26',
    latitude: 13.0828,
    longitude: 80.2709,
    accuracy: 8.5,
    device: 'Desktop PC (Windows 11)',
    ipAddress: '192.168.1.104',
    browser: 'Google Chrome 128.0',
    operatingSystem: 'Windows 11 Enterprise (64-bit)',
    officeName: 'Apex Central Flagship HQ',
    distanceFromOfficeMeters: 24.2,
    status: 'PRESENT',
    isGeofenceVerified: true,
    remarks: 'Punched in on-time via cashier desktop terminal.',
    createdAt: '2026-08-26T08:05:14.000Z',
  },
  {
    id: 'punch-002',
    businessId: 'biz-apex-group',
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    department: 'Kitchen & Culinary',
    shiftName: 'Morning Early Shift (08:00 - 16:00)',
    punchInTime: '07:55:30 AM',
    punchInDate: '2026-08-26',
    latitude: 13.0826,
    longitude: 80.2706,
    accuracy: 12.0,
    device: 'Mobile Phone (Apple iPhone 15 Pro)',
    ipAddress: '192.168.1.112',
    browser: 'Safari Mobile 18.0',
    operatingSystem: 'iOS 18.1',
    officeName: 'Apex Central Flagship HQ',
    distanceFromOfficeMeters: 15.8,
    status: 'PRESENT',
    isGeofenceVerified: true,
    remarks: 'Early punch at kitchen prep station.',
    createdAt: '2026-08-26T07:55:30.000Z',
  },
  {
    id: 'punch-003',
    businessId: 'biz-apex-group',
    employeeId: 'emp-005',
    employeeName: 'Priya Selvam',
    department: 'Customer Service & Floor',
    shiftName: 'General Shift (09:30 - 18:30)',
    punchInTime: '09:28:45 AM',
    punchInDate: '2026-08-26',
    latitude: 13.0419,
    longitude: 80.2340,
    accuracy: 6.2,
    device: 'Mobile Phone (Samsung Galaxy S24 Ultra)',
    ipAddress: '192.168.2.45',
    browser: 'Chrome Mobile 128.0',
    operatingSystem: 'Android 15',
    officeName: 'Apex Express Retail & POS Hub',
    distanceFromOfficeMeters: 18.1,
    status: 'PRESENT',
    isGeofenceVerified: true,
    remarks: 'Verified mobile check-in inside dining lobby.',
    createdAt: '2026-08-26T09:28:45.000Z',
  }
];

export class PunchInEngine {
  private static STORAGE_KEY = 'multi_biz_punch_in_records_db';
  private static memoryPunches: PunchInRecord[] = [...INITIAL_PUNCH_IN_LOGS];

  /**
   * Records a new Punch In with Geofence verification and saves all 7 required fields:
   * 1. Punch In Time
   * 2. Latitude
   * 3. Longitude
   * 4. Accuracy
   * 5. Device
   * 6. IP
   * 7. Browser
   */
  static recordPunchIn(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    officeId?: string;
    shiftId?: string;
    geo: GeoLocationPayload;
    customPunchTime?: string;
    businessId?: string;
  }): {
    success: boolean;
    record?: PunchInRecord;
    error?: string;
  } {
    // 1. Enforce Geofence Validation
    const validation = GeofenceValidator.validatePunchInGeofence(
      params.geo.latitude,
      params.geo.longitude,
      params.officeId
    );

    if (!validation.allowed) {
      return {
        success: false,
        error: 'You are outside office premises.',
      };
    }

    // 2. Resolve Shift & Timing
    const shifts = ShiftEngine.getShifts();
    const shift = (params.shiftId ? shifts.find(s => s.id === params.shiftId) : shifts[0]) || shifts[0];
    
    const now = new Date();
    const punchTimeStr = params.customPunchTime || now.toLocaleTimeString('en-US', { hour12: true });
    const punchDateStr = now.toISOString().slice(0, 10);
    const punchHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Evaluate on-time / late status
    const evalRes = ShiftEngine.evaluateAttendancePunch(shift, punchHHmm);

    // 3. Construct and Save Punch Record with all 7 required fields
    const newRecord: PunchInRecord = {
      id: `punch-${Date.now()}`,
      businessId: params.businessId || 'biz-apex-group',
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      shiftName: shift.name,
      
      // 7 Required Fields:
      punchInTime: punchTimeStr,
      latitude: params.geo.latitude,
      longitude: params.geo.longitude,
      accuracy: params.geo.accuracy,
      device: params.geo.device,
      ipAddress: params.geo.ipAddress,
      browser: params.geo.browser,
      
      punchInDate: punchDateStr,
      operatingSystem: params.geo.operatingSystem,
      officeName: validation.officeName,
      distanceFromOfficeMeters: validation.distanceMeters,
      status: evalRes.status === 'LATE' ? 'LATE' : 'PRESENT',
      isGeofenceVerified: true,
      remarks: evalRes.ruleRemarks,
      createdAt: now.toISOString(),
    };

    this.memoryPunches.unshift(newRecord);
    this.saveState();

    return {
      success: true,
      record: newRecord,
    };
  }

  /**
   * Retrieves Punch In history
   */
  static getPunchInHistory(employeeId?: string): PunchInRecord[] {
    let list = this.memoryPunches;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryPunches = list;
        }
      }
    } catch {}

    if (employeeId) {
      list = list.filter(p => p.employeeId === employeeId);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Retrieves active today's punch in for an employee
   */
  static getTodayPunchIn(employeeId: string): PunchInRecord | undefined {
    const today = new Date().toISOString().slice(0, 10);
    return this.getPunchInHistory(employeeId).find(p => p.punchInDate === today);
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryPunches));
      }
    } catch {}
  }
}
