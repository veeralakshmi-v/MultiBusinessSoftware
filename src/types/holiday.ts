export interface Holiday {
  id: string;
  businessId: string;
  holidayName: string; // 1. Holiday Name
  date: string; // 2. Date (YYYY-MM-DD)
  description: string; // 3. Description
  branch: string; // 4. Branch ("ALL" or specific branch name)
  recurring: boolean; // 5. Recurring (annually)
  type?: 'NATIONAL' | 'REGIONAL' | 'COMPANY_OPTIONAL';
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayDTO {
  businessId?: string;
  holidayName: string;
  date: string;
  description: string;
  branch: string;
  recurring: boolean;
  type?: 'NATIONAL' | 'REGIONAL' | 'COMPANY_OPTIONAL';
}

export interface UpdateHolidayDTO extends Partial<CreateHolidayDTO> {
  id: string;
}
