import { Department, DepartmentStatus, DepartmentFilterOptions } from '../../types/department';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-001',
    businessId: 'biz-apex-group',
    name: 'Billing & Accounts',
    code: 'DEPT-BILL',
    managerName: 'Anitha Venkatesh',
    description: 'POS billing counters, cash drawer management, payment reconciliation, and invoice dispatch.',
    status: 'ACTIVE',
    employeeCount: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'dept-002',
    businessId: 'biz-apex-group',
    name: 'Kitchen & Culinary',
    code: 'DEPT-KITCHEN',
    managerName: 'Chef Rajesh Kumar',
    description: 'Food preparation, kitchen order ticket (KOT) workflows, chef stations, and hygiene compliance.',
    status: 'ACTIVE',
    employeeCount: 4,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'dept-003',
    businessId: 'biz-apex-group',
    name: 'Management & Operations',
    code: 'DEPT-MGMT',
    managerName: 'Anitha Venkatesh',
    description: 'General store management, shift scheduling, statutory compliance, and executive operations.',
    status: 'ACTIVE',
    employeeCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'dept-004',
    businessId: 'biz-apex-group',
    name: 'Pharmacy & Healthcare',
    code: 'DEPT-PHARMA',
    managerName: 'Dr. Suresh Sharma',
    description: 'Prescription verification, scheduled medicine dispensation, OTC retail, and clinical inventory.',
    status: 'ACTIVE',
    employeeCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'dept-005',
    businessId: 'biz-apex-group',
    name: 'Customer Service & Floor',
    code: 'DEPT-SERVICE',
    managerName: 'Priya Selvam',
    description: 'Dining floor hosting, customer assistance, takeaway parcel dispatch, and feedback collection.',
    status: 'ACTIVE',
    employeeCount: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
  {
    id: 'dept-006',
    businessId: 'biz-apex-group',
    name: 'Warehouse & Storage',
    code: 'DEPT-INVENTORY',
    managerName: 'Rajesh Kumar',
    description: 'Central storage depot, inter-branch stock transfers, reorder tracking, and batch control.',
    status: 'ACTIVE',
    employeeCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  },
];

export class DepartmentEngine {
  private static STORAGE_KEY = 'multi_biz_departments_db';
  private static memoryDepartments: Department[] = [...INITIAL_DEPARTMENTS];

  /**
   * Retrieves filtered and searched departments
   */
  static getDepartments(filters?: DepartmentFilterOptions): Department[] {
    let list = this.memoryDepartments;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryDepartments = list;
        }
      }
    } catch {}

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(d => 
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.managerName.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(d => d.status === filters.status);
      }
    }

    return list;
  }

  /**
   * Retrieves department by ID
   */
  static getDepartmentById(id: string): Department | undefined {
    return this.memoryDepartments.find(d => d.id === id || d.code === id);
  }

  /**
   * Adds a new department
   */
  static addDepartment(data: {
    name: string;
    code: string;
    managerName: string;
    description: string;
    status?: DepartmentStatus;
    businessId?: string;
  }): Department {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      businessId: data.businessId || 'biz-apex-group',
      name: data.name,
      code: data.code.toUpperCase(),
      managerName: data.managerName,
      description: data.description,
      status: data.status || 'ACTIVE',
      employeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryDepartments.unshift(newDept);
    this.saveState();
    return newDept;
  }

  /**
   * Updates an existing department
   */
  static updateDepartment(id: string, updates: Partial<Department>): Department | undefined {
    const index = this.memoryDepartments.findIndex(d => d.id === id || d.code === id);
    if (index === -1) return undefined;

    const updated: Department = {
      ...this.memoryDepartments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.memoryDepartments[index] = updated;
    this.saveState();
    return updated;
  }

  /**
   * Toggles department status (ACTIVE <-> INACTIVE)
   */
  static toggleStatus(id: string): Department | undefined {
    const dept = this.getDepartmentById(id);
    if (!dept) return undefined;

    const nextStatus: DepartmentStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updateDepartment(id, { status: nextStatus });
  }

  /**
   * Deletes a department
   */
  static deleteDepartment(id: string): boolean {
    const initialLen = this.memoryDepartments.length;
    this.memoryDepartments = this.memoryDepartments.filter(d => d.id !== id && d.code !== id);
    if (this.memoryDepartments.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryDepartments));
      }
    } catch {}
  }
}
