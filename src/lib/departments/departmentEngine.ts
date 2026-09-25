import { Department, DepartmentStatus, DepartmentFilterOptions } from '../../types/department';

export const INITIAL_DEPARTMENTS: Department[] = [];

export class DepartmentEngine {
  private static STORAGE_KEY = 'multi_biz_departments_db';
  private static memoryDepartments: Department[] = [];

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
