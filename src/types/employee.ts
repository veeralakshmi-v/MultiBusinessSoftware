export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'PROBATION';

export type EmployeeShift = 'MORNING' | 'EVENING' | 'NIGHT' | 'GENERAL';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
}

export interface EmployeeDocument {
  id: string;
  title: string;
  docType: 'AADHAR' | 'PAN' | 'OFFER_LETTER' | 'EXPERIENCE' | 'CERTIFICATE';
  docNumber?: string;
  uploadDate: string;
}

export interface EmployeeTimelineEvent {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  date: string;
  type: 'ONBOARDING' | 'PROMOTION' | 'TRANSFER' | 'SALARY' | 'DOCUMENT' | 'STATUS_CHANGE';
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. 'EMP-101'
  photoUrl: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  department: string;
  designation: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'WAITER' | 'PHARMACIST' | 'STAFF';
  joiningDate: string;
  salary: number; // e.g. 28000
  shift: EmployeeShift;
  branchId: string;
  branchName: string;
  status: EmployeeStatus;
  emergencyContact: EmergencyContact;
  documents: EmployeeDocument[];
  aadharNumber: string;
  panNumber: string;
  bankDetails: BankDetails;
  reportingManager: string; // Manager Name or ID
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFilterOptions {
  search?: string;
  department?: string;
  branchId?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedEmployeeResult {
  employees: Employee[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
