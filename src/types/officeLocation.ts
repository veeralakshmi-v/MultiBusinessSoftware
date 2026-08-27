export type OfficeLocationStatus = 'ACTIVE' | 'INACTIVE';

export interface OfficeLocation {
  id: string;
  businessId: string;
  name: string; // Office Name
  latitude: number; // Latitude
  longitude: number; // Longitude
  allowedRadiusMeters: number; // Allowed Radius (in meters)
  branchId: string; // Branch
  branchName: string; // Branch Name
  status: OfficeLocationStatus; // Status
  address?: string;
  assignedStaffCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeLocationFilterOptions {
  search?: string;
  branchId?: string | 'ALL';
  status?: 'ALL' | OfficeLocationStatus;
}
