export type BreakType = 'LUNCH' | 'TEA' | 'CUSTOM';
export type BreakStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface BreakRecord {
  id: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  punchInId?: string;
  
  breakType: BreakType; // 'LUNCH' | 'TEA' | 'CUSTOM'
  breakTitle: string; // e.g. "Lunch Break", "Morning Tea Break", "Custom Rest Break"
  customReason?: string;
  
  breakStart: string; // ISO or "01:00:00 PM"
  breakEnd?: string; // ISO or "01:45:00 PM"
  
  durationMinutes: number; // in minutes (e.g. 45)
  durationHours: number; // in decimal hours (e.g. 0.75)
  durationFormatted: string; // "45m" or "1h 15m"
  
  status: BreakStatus;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface DailyWorkBreakSummary {
  employeeId: string;
  employeeName: string;
  date: string;
  grossWorkHours: number;
  totalBreakMinutes: number;
  totalBreakHours: number;
  netWorkingHours: number;
  netWorkingHoursFormatted: string;
  breaksCount: number;
  breaks: BreakRecord[];
  activeBreak?: BreakRecord;
}
