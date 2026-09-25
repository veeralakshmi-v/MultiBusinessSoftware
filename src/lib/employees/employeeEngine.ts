import { 
  Employee, 
  EmployeeStatus, 
  EmployeeFilterOptions, 
  PaginatedEmployeeResult, 
  EmployeeTimelineEvent 
} from '../../types/employee';

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_TIMELINES: Record<string, EmployeeTimelineEvent[]> = {};

export class EmployeeEngine {
  private static STORAGE_KEY = 'multi_biz_employees_db';
  private static STORAGE_TIMELINE = 'multi_biz_employees_timeline';
  private static memoryEmployees: Employee[] = [];
  private static memoryTimelines: Record<string, EmployeeTimelineEvent[]> = {};

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
