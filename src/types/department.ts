export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  id: string;
  businessId: string;
  name: string;
  code: string; // e.g. 'DEPT-BILL'
  managerId?: string;
  managerName: string;
  description: string;
  status: DepartmentStatus;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentFilterOptions {
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
}
