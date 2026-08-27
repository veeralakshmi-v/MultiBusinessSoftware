import { 
  Employee, 
  EmployeeStatus, 
  EmployeeFilterOptions, 
  PaginatedEmployeeResult, 
  EmployeeTimelineEvent 
} from '../../types/employee';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    employeeId: 'EMP-101',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    name: 'Kowsalya Sundaram',
    mobile: '+91 98765 12340',
    email: 'kowsalya.cashier@apexsuite.com',
    address: '42, North Mada Street, Mylapore, Chennai - 600004',
    department: 'Billing & Cash Desk',
    designation: 'Senior POS Cashier',
    role: 'CASHIER',
    joiningDate: '2024-02-15',
    salary: 32000,
    shift: 'MORNING',
    branchId: 'br-chennai-main',
    branchName: 'Chennai Flagship Outlet',
    status: 'ACTIVE',
    emergencyContact: {
      name: 'Sundaram K',
      relationship: 'Father',
      phone: '+91 98400 99887',
    },
    documents: [
      { id: 'doc-1', title: 'Aadhar Card Proof', docType: 'AADHAR', docNumber: 'XXXX-XXXX-8921', uploadDate: '2024-02-15' },
      { id: 'doc-2', title: 'PAN Card Copy', docType: 'PAN', docNumber: 'ABCDE1234F', uploadDate: '2024-02-15' },
      { id: 'doc-3', title: 'Signed Offer Letter', docType: 'OFFER_LETTER', uploadDate: '2024-02-14' },
    ],
    aadharNumber: '9845-1234-8921',
    panNumber: 'ABCDE1234F',
    bankDetails: {
      accountHolderName: 'Kowsalya Sundaram',
      accountNumber: '50100492819281',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001245',
      branch: 'Mylapore Branch',
    },
    reportingManager: 'Anitha Venkatesh (Operations Manager)',
    createdAt: '2024-02-15T09:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'emp-002',
    employeeId: 'EMP-102',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    name: 'Rajesh Kumar',
    mobile: '+91 98401 23456',
    email: 'rajesh.chef@apexsuite.com',
    address: '15, Anna Salai, Guindy, Chennai - 600032',
    department: 'Kitchen & Culinary',
    designation: 'Head Executive Chef',
    role: 'KITCHEN',
    joiningDate: '2023-08-10',
    salary: 45000,
    shift: 'EVENING',
    branchId: 'br-chennai-main',
    branchName: 'Chennai Flagship Outlet',
    status: 'ACTIVE',
    emergencyContact: {
      name: 'Priya Rajesh',
      relationship: 'Spouse',
      phone: '+91 98401 99881',
    },
    documents: [
      { id: 'doc-4', title: 'Culinary Degree Certificate', docType: 'CERTIFICATE', uploadDate: '2023-08-10' },
      { id: 'doc-5', title: 'Aadhar Card', docType: 'AADHAR', docNumber: 'XXXX-XXXX-4532', uploadDate: '2023-08-10' },
    ],
    aadharNumber: '4532-8871-4532',
    panNumber: 'BKPRK8821D',
    bankDetails: {
      accountHolderName: 'Rajesh Kumar',
      accountNumber: '0234101004521',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0000842',
      branch: 'Guindy Branch',
    },
    reportingManager: 'Anitha Venkatesh (Operations Manager)',
    createdAt: '2023-08-10T09:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'emp-003',
    employeeId: 'EMP-103',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    name: 'Anitha Venkatesh',
    mobile: '+91 98800 54321',
    email: 'anitha.manager@apexsuite.com',
    address: '88, 1st Cross, Indiranagar, Bangalore - 560038',
    department: 'Management & Operations',
    designation: 'Operations & General Manager',
    role: 'MANAGER',
    joiningDate: '2023-01-15',
    salary: 65000,
    shift: 'GENERAL',
    branchId: 'br-chennai-main',
    branchName: 'Chennai Flagship Outlet',
    status: 'ACTIVE',
    emergencyContact: {
      name: 'Venkatesh S',
      relationship: 'Spouse',
      phone: '+91 98800 99882',
    },
    documents: [
      { id: 'doc-6', title: 'MBA Degree', docType: 'CERTIFICATE', uploadDate: '2023-01-15' },
      { id: 'doc-7', title: 'PAN Card', docType: 'PAN', docNumber: 'AVNPK9981K', uploadDate: '2023-01-15' },
    ],
    aadharNumber: '7841-9921-6632',
    panNumber: 'AVNPK9981K',
    bankDetails: {
      accountHolderName: 'Anitha Venkatesh',
      accountNumber: '91802004819284',
      bankName: 'Axis Bank',
      ifscCode: 'UTIB0000142',
      branch: 'Indiranagar',
    },
    reportingManager: 'Admin Corporate Board',
    createdAt: '2023-01-15T09:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'emp-004',
    employeeId: 'EMP-104',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    name: 'Dr. Suresh Sharma',
    mobile: '+91 98200 45678',
    email: 'suresh.pharma@apexsuite.com',
    address: '102, Bandra West, Mumbai - 400050',
    department: 'Pharmacy & Healthcare',
    designation: 'Chief Pharmacist',
    role: 'PHARMACIST',
    joiningDate: '2024-05-01',
    salary: 42000,
    shift: 'GENERAL',
    branchId: 'br-bangalore-outlet',
    branchName: 'Bangalore Tech Park Branch',
    status: 'ACTIVE',
    emergencyContact: {
      name: 'Meena Sharma',
      relationship: 'Mother',
      phone: '+91 98200 88771',
    },
    documents: [
      { id: 'doc-8', title: 'Pharmacy License', docType: 'CERTIFICATE', uploadDate: '2024-05-01' },
    ],
    aadharNumber: '8821-4412-9901',
    panNumber: 'SSHPK4412M',
    bankDetails: {
      accountHolderName: 'Suresh Sharma',
      accountNumber: '33410291823',
      bankName: 'ICICI Bank',
      ifscCode: 'ICIC0000042',
      branch: 'Bandra Branch',
    },
    reportingManager: 'Anitha Venkatesh',
    createdAt: '2024-05-01T09:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'emp-005',
    employeeId: 'EMP-105',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    name: 'Priya Selvam',
    mobile: '+91 98402 34567',
    email: 'priya.service@apexsuite.com',
    address: '19, Cathedral Road, Chennai - 600086',
    department: 'Customer Service & Floor',
    designation: 'Floor Host & Captain',
    role: 'WAITER',
    joiningDate: '2024-09-12',
    salary: 24000,
    shift: 'MORNING',
    branchId: 'br-chennai-main',
    branchName: 'Chennai Flagship Outlet',
    status: 'ON_LEAVE',
    emergencyContact: {
      name: 'Selvam R',
      relationship: 'Father',
      phone: '+91 98402 77665',
    },
    documents: [],
    aadharNumber: '3321-7781-4412',
    panNumber: 'PSLPK7781R',
    bankDetails: {
      accountHolderName: 'Priya Selvam',
      accountNumber: '44102918281',
      bankName: 'Canara Bank',
      ifscCode: 'CNRB0001042',
      branch: 'Cathedral Road',
    },
    reportingManager: 'Anitha Venkatesh',
    createdAt: '2024-09-12T09:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  }
];

export const INITIAL_TIMELINES: Record<string, EmployeeTimelineEvent[]> = {
  'emp-001': [
    { id: 'tl-1', employeeId: 'emp-001', title: 'Joined Apex Multi-Business Group', description: 'Onboarded as Cashier at Chennai Flagship Outlet', date: '2024-02-15', type: 'ONBOARDING' },
    { id: 'tl-2', employeeId: 'emp-001', title: 'KYC Documents Verified', description: 'Aadhar and PAN details successfully verified by Compliance', date: '2024-02-16', type: 'DOCUMENT' },
    { id: 'tl-3', employeeId: 'emp-001', title: 'Promoted to Senior POS Cashier', description: 'Promoted with 6-Tier financial viewing privileges', date: '2025-01-10', type: 'PROMOTION' },
    { id: 'tl-4', employeeId: 'emp-001', title: 'Annual Compensation Revision', description: 'Salary revised from ₹26,000 to ₹32,000 / month', date: '2025-04-01', type: 'SALARY' },
  ],
  'emp-002': [
    { id: 'tl-5', employeeId: 'emp-002', title: 'Joined as Executive Chef', description: 'Assigned to Chennai Flagship Kitchen line', date: '2023-08-10', type: 'ONBOARDING' },
    { id: 'tl-6', employeeId: 'emp-002', title: 'Kitchen KOT Workflow Certified', description: 'Configured automated recipe and food prep pipeline', date: '2024-03-01', type: 'PROMOTION' },
  ],
};

export class EmployeeEngine {
  private static STORAGE_KEY = 'multi_biz_employees_db';
  private static STORAGE_TIMELINE = 'multi_biz_employees_timeline';
  private static memoryEmployees: Employee[] = [...INITIAL_EMPLOYEES];
  private static memoryTimelines: Record<string, EmployeeTimelineEvent[]> = { ...INITIAL_TIMELINES };

  /**
   * Retrieves paginated, filtered, and searched employees
   */
  static getEmployees(filters?: EmployeeFilterOptions): PaginatedEmployeeResult {
    let list: Employee[] = this.memoryEmployees;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryEmployees = list;
        }
      }
    } catch {}

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(e => 
          e.name.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.mobile.includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
        );
      }

      if (filters.department && filters.department !== 'ALL') {
        list = list.filter(e => e.department === filters.department);
      }

      if (filters.branchId && filters.branchId !== 'ALL') {
        list = list.filter(e => e.branchId === filters.branchId);
      }

      if (filters.role && filters.role !== 'ALL') {
        list = list.filter(e => e.role === filters.role);
      }

      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(e => e.status === filters.status);
      }
    }

    const totalCount = list.length;
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 6;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedEmployees = list.slice(startIndex, startIndex + pageSize);

    return {
      employees: paginatedEmployees,
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
    };
  }

  /**
   * Retrieves single employee by ID
   */
  static getEmployeeById(id: string): Employee | undefined {
    return this.memoryEmployees.find(e => e.id === id || e.employeeId === id);
  }

  /**
   * Adds a new employee
   */
  static addEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const nextSeq = this.memoryEmployees.length + 101;
    const newEmployee: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      employeeId: data.employeeId || `EMP-${nextSeq}`,
      photoUrl: data.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryEmployees.unshift(newEmployee);
    this.saveState();

    // Create Initial Onboarding Timeline Event
    this.addTimelineEvent({
      employeeId: newEmployee.id,
      title: 'Joined Enterprise Organization',
      description: `Onboarded as ${newEmployee.designation} in ${newEmployee.department} at ${newEmployee.branchName}`,
      date: newEmployee.joiningDate || new Date().toISOString().slice(0, 10),
      type: 'ONBOARDING',
    });

    return newEmployee;
  }

  /**
   * Updates an existing employee record
   */
  static updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
    const index = this.memoryEmployees.findIndex(e => e.id === id || e.employeeId === id);
    if (index === -1) return undefined;

    const current = this.memoryEmployees[index];
    const updated: Employee = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Track salary revision in timeline
    if (updates.salary && updates.salary !== current.salary) {
      this.addTimelineEvent({
        employeeId: current.id,
        title: 'Salary Compensation Revised',
        description: `Compensation updated from ₹${current.salary.toLocaleString()} to ₹${updates.salary.toLocaleString()} / month`,
        date: new Date().toISOString().slice(0, 10),
        type: 'SALARY',
      });
    }

    // Track promotion or designation change
    if (updates.designation && updates.designation !== current.designation) {
      this.addTimelineEvent({
        employeeId: current.id,
        title: `Promoted to ${updates.designation}`,
        description: `Role and designation changed from ${current.designation} to ${updates.designation}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'PROMOTION',
      });
    }

    // Track branch transfer
    if (updates.branchId && updates.branchId !== current.branchId) {
      this.addTimelineEvent({
        employeeId: current.id,
        title: 'Branch Location Transferred',
        description: `Transferred from ${current.branchName} to ${updates.branchName || updates.branchId}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'TRANSFER',
      });
    }

    this.memoryEmployees[index] = updated;
    this.saveState();
    return updated;
  }

  /**
   * Deletes an employee
   */
  static deleteEmployee(id: string): boolean {
    const initialLength = this.memoryEmployees.length;
    this.memoryEmployees = this.memoryEmployees.filter(e => e.id !== id && e.employeeId !== id);
    if (this.memoryEmployees.length !== initialLength) {
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Toggles employee status (Active / Inactive / On Leave / Probation)
   */
  static setEmployeeStatus(id: string, status: EmployeeStatus): Employee | undefined {
    const emp = this.updateEmployee(id, { status });
    if (emp) {
      this.addTimelineEvent({
        employeeId: emp.id,
        title: `Status Changed to ${status}`,
        description: `Employee employment status updated to ${status}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'STATUS_CHANGE',
      });
    }
    return emp;
  }

  /**
   * Retrieves timeline events for an employee
   */
  static getTimeline(employeeId: string): EmployeeTimelineEvent[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_TIMELINE);
        if (raw) {
          this.memoryTimelines = JSON.parse(raw);
        }
      }
    } catch {}

    const list = this.memoryTimelines[employeeId] || [];
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Adds a timeline event
   */
  static addTimelineEvent(event: Omit<EmployeeTimelineEvent, 'id'>): EmployeeTimelineEvent {
    const newEvent: EmployeeTimelineEvent = {
      ...event,
      id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    if (!this.memoryTimelines[event.employeeId]) {
      this.memoryTimelines[event.employeeId] = [];
    }

    this.memoryTimelines[event.employeeId].unshift(newEvent);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_TIMELINE, JSON.stringify(this.memoryTimelines));
      }
    } catch {}

    return newEvent;
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryEmployees));
      }
    } catch {}
  }
}
