import { Designation, DesignationStatus, DesignationFilterOptions } from '../../types/designation';

export const HIERARCHY_LEVELS: Record<number, string> = {
  1: 'Level 1 - Executive / General Manager',
  2: 'Level 2 - Head of Department / Lead',
  3: 'Level 3 - Senior Specialist / Supervisor',
  4: 'Level 4 - Associate / Operations Staff',
  5: 'Level 5 - Entry Level / Junior Assistant',
};

export const INITIAL_DESIGNATIONS: Designation[] = [];

export class DesignationEngine {
  private static STORAGE_KEY = 'multi_biz_designations_db';
  private static memoryDesignations: Designation[] = [];

  /**
   * Retrieves filtered and searched designations sorted by hierarchy level
   */
  static getDesignations(filters?: DesignationFilterOptions): Designation[] {
    let list = this.memoryDesignations;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryDesignations = list;
        }
      }
    } catch {}

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(d => 
          d.title.toLowerCase().includes(q) ||
          d.departmentName.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      }

      if (filters.departmentName && filters.departmentName !== 'ALL') {
        list = list.filter(d => d.departmentName === filters.departmentName);
      }

      if (filters.hierarchyLevel && filters.hierarchyLevel !== 'ALL') {
        list = list.filter(d => d.hierarchyLevel === Number(filters.hierarchyLevel));
      }
    }

    return list.sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
  }

  /**
   * Retrieves designation by ID
   */
  static getDesignationById(id: string): Designation | undefined {
    return this.memoryDesignations.find(d => d.id === id);
  }

  /**
   * Adds a new designation
   */
  static addDesignation(data: {
    title: string;
    departmentName: string;
    hierarchyLevel: number;
    description: string;
    departmentId?: string;
    salaryBand?: { min: number; max: number };
    status?: DesignationStatus;
    businessId?: string;
  }): Designation {
    const level = Number(data.hierarchyLevel) || 3;
    const newDesig: Designation = {
      id: `desig-${Date.now()}`,
      businessId: data.businessId || 'biz-apex-group',
      title: data.title,
      departmentId: data.departmentId || 'dept-001',
      departmentName: data.departmentName,
      hierarchyLevel: level,
      hierarchyTitle: HIERARCHY_LEVELS[level] || `Level ${level}`,
      description: data.description,
      status: data.status || 'ACTIVE',
      salaryBand: data.salaryBand || { min: 20000, max: 35000 },
      employeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryDesignations.unshift(newDesig);
    this.saveState();
    return newDesig;
  }

  /**
   * Updates an existing designation
   */
  static updateDesignation(id: string, updates: Partial<Designation>): Designation | undefined {
    const index = this.memoryDesignations.findIndex(d => d.id === id);
    if (index === -1) return undefined;

    const current = this.memoryDesignations[index];
    const newLevel = updates.hierarchyLevel ? Number(updates.hierarchyLevel) : current.hierarchyLevel;

    const updated: Designation = {
      ...current,
      ...updates,
      hierarchyLevel: newLevel,
      hierarchyTitle: HIERARCHY_LEVELS[newLevel] || `Level ${newLevel}`,
      updatedAt: new Date().toISOString(),
    };

    this.memoryDesignations[index] = updated;
    this.saveState();
    return updated;
  }

  /**
   * Deletes a designation
   */
  static deleteDesignation(id: string): boolean {
    const initialLen = this.memoryDesignations.length;
    this.memoryDesignations = this.memoryDesignations.filter(d => d.id !== id);
    if (this.memoryDesignations.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryDesignations));
      }
    } catch {}
  }
}
