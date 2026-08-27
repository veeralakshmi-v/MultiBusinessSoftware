import { Holiday, CreateHolidayDTO, UpdateHolidayDTO } from '../../types/holiday';

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'hol-001',
    businessId: 'biz-001',
    holidayName: 'Republic Day',
    date: '2026-01-26',
    description: '77th Indian Republic Day celebration with paid holiday.',
    branch: 'ALL',
    recurring: true,
    type: 'NATIONAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hol-002',
    businessId: 'biz-001',
    holidayName: 'Pongal / Makar Sankranti',
    date: '2026-01-14',
    description: 'Tamil harvest festival celebration with traditional holiday.',
    branch: 'ALL',
    recurring: true,
    type: 'REGIONAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hol-003',
    businessId: 'biz-001',
    holidayName: 'Labour Day / May Day',
    date: '2026-05-01',
    description: 'International Workers Day celebration and recognition.',
    branch: 'ALL',
    recurring: true,
    type: 'NATIONAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hol-004',
    businessId: 'biz-001',
    holidayName: 'Independence Day',
    date: '2026-08-15',
    description: '79th Indian Independence Day national gazetted paid holiday.',
    branch: 'ALL',
    recurring: true,
    type: 'NATIONAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hol-005',
    businessId: 'biz-001',
    holidayName: 'Gandhi Jayanti',
    date: '2026-10-02',
    description: 'Mahatma Gandhi Jayanti national gazetted holiday.',
    branch: 'ALL',
    recurring: true,
    type: 'NATIONAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hol-006',
    businessId: 'biz-001',
    holidayName: 'Diwali / Deepavali',
    date: '2026-11-08',
    description: 'Festival of Lights holiday for all staff and operations.',
    branch: 'ALL',
    recurring: false,
    type: 'NATIONAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hol-007',
    businessId: 'biz-001',
    holidayName: 'Christmas',
    date: '2026-12-25',
    description: 'Christmas Day celebration and annual winter paid holiday.',
    branch: 'ALL',
    recurring: true,
    type: 'NATIONAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

let holidaysDatabase: Holiday[] = [...INITIAL_HOLIDAYS];

export class HolidayEngine {
  /**
   * Get all holidays with optional filtering
   */
  static getHolidays(filters?: {
    search?: string;
    branch?: string;
    year?: number;
  }): Holiday[] {
    let list = [...holidaysDatabase];

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(h => 
          h.holidayName.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.branch.toLowerCase().includes(q)
        );
      }

      if (filters.branch && filters.branch !== 'ALL') {
        list = list.filter(h => h.branch === 'ALL' || h.branch === filters.branch);
      }

      if (filters.year) {
        list = list.filter(h => {
          const holYear = new Date(h.date).getFullYear();
          return holYear === filters.year || h.recurring;
        });
      }
    }

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get holiday by ID
   */
  static getHolidayById(id: string): Holiday | undefined {
    return holidaysDatabase.find(h => h.id === id);
  }

  /**
   * Create a new holiday
   */
  static createHoliday(dto: CreateHolidayDTO): { success: boolean; holiday?: Holiday; error?: string } {
    if (!dto.holidayName || dto.holidayName.trim().length === 0) {
      return { success: false, error: 'Holiday Name is required.' };
    }
    if (!dto.date) {
      return { success: false, error: 'Holiday Date is required.' };
    }

    const newHoliday: Holiday = {
      id: `hol-${Date.now().toString(36)}`,
      businessId: dto.businessId || 'biz-001',
      holidayName: dto.holidayName.trim(),
      date: dto.date,
      description: dto.description || '',
      branch: dto.branch || 'ALL',
      recurring: Boolean(dto.recurring),
      type: dto.type || 'NATIONAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    holidaysDatabase.push(newHoliday);
    return { success: true, holiday: newHoliday };
  }

  /**
   * Update an existing holiday
   */
  static updateHoliday(dto: UpdateHolidayDTO): { success: boolean; holiday?: Holiday; error?: string } {
    const index = holidaysDatabase.findIndex(h => h.id === dto.id);
    if (index === -1) {
      return { success: false, error: 'Holiday not found.' };
    }

    const current = holidaysDatabase[index];
    const updated: Holiday = {
      ...current,
      holidayName: dto.holidayName !== undefined ? dto.holidayName.trim() : current.holidayName,
      date: dto.date !== undefined ? dto.date : current.date,
      description: dto.description !== undefined ? dto.description : current.description,
      branch: dto.branch !== undefined ? dto.branch : current.branch,
      recurring: dto.recurring !== undefined ? Boolean(dto.recurring) : current.recurring,
      type: dto.type !== undefined ? dto.type : current.type,
      updatedAt: new Date().toISOString(),
    };

    holidaysDatabase[index] = updated;
    return { success: true, holiday: updated };
  }

  /**
   * Delete a holiday
   */
  static deleteHoliday(id: string): { success: boolean; error?: string } {
    const index = holidaysDatabase.findIndex(h => h.id === id);
    if (index === -1) {
      return { success: false, error: 'Holiday not found.' };
    }

    holidaysDatabase.splice(index, 1);
    return { success: true };
  }

  /**
   * Check if a specific date is a configured holiday
   */
  static isDateHoliday(date: string, branch: string = 'ALL'): { isHoliday: boolean; holiday?: Holiday } {
    const match = holidaysDatabase.find(h => {
      const isDateMatch = h.date === date;
      const isBranchMatch = h.branch === 'ALL' || h.branch === branch;
      return isDateMatch && isBranchMatch;
    });

    return {
      isHoliday: Boolean(match),
      holiday: match,
    };
  }

  /**
   * Reset to initial state (for testing)
   */
  static resetToInitial() {
    holidaysDatabase = [...INITIAL_HOLIDAYS];
  }
}
