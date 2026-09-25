export type DesignationStatus = 'ACTIVE' | 'INACTIVE';

export interface Designation {
  id: string;
  businessId: string;
  title: string; // Designation Title
  departmentId: string;
  departmentName: string; // Department
  hierarchyLevel: number; // 1 (Top / Executive) to 5 (Junior / Entry)
  hierarchyTitle: string; // Hierarchy
  description: string; // Description
  status: DesignationStatus;
  salaryBand?: { min: number; max: number };
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DesignationFilterOptions {
  search?: string;
  departmentName?: string;
  hierarchyLevel?: number | 'ALL';
}
