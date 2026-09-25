import { 
  OfficeLocation, 
  OfficeLocationStatus, 
  OfficeLocationFilterOptions 
} from '../../types/officeLocation';
import { GeoLocationEngine } from '../attendance/geoLocationEngine';

export const INITIAL_OFFICE_LOCATIONS: OfficeLocation[] = [];

export class OfficeLocationEngine {
  private static STORAGE_KEY = 'multi_biz_office_locations_db';
  private static memoryLocations: OfficeLocation[] = [];

  /**
   * Retrieves filtered and searched office locations
   */
  static getOfficeLocations(filters?: OfficeLocationFilterOptions): OfficeLocation[] {
    let list = this.memoryLocations;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          list = JSON.parse(raw);
          this.memoryLocations = list;
        }
      }
    } catch {}

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(l => 
          l.name.toLowerCase().includes(q) ||
          l.branchName.toLowerCase().includes(q) ||
          (l.address && l.address.toLowerCase().includes(q))
        );
      }

      if (filters.branchId && filters.branchId !== 'ALL') {
        list = list.filter(l => l.branchId === filters.branchId);
      }

      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(l => l.status === filters.status);
      }
    }

    return list;
  }

  /**
   * Retrieves location by ID
   */
  static getOfficeLocationById(id: string): OfficeLocation | undefined {
    return this.memoryLocations.find(l => l.id === id);
  }

  /**
   * Adds a new office location
   */
  static addOfficeLocation(data: {
    name: string;
    latitude: number;
    longitude: number;
    allowedRadiusMeters: number;
    branchId: string;
    branchName: string;
    status?: OfficeLocationStatus;
    address?: string;
    businessId?: string;
  }): OfficeLocation {
    const newLoc: OfficeLocation = {
      id: `loc-${Date.now()}`,
      businessId: data.businessId || 'biz-apex-group',
      name: data.name,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      allowedRadiusMeters: Number(data.allowedRadiusMeters) || 150,
      branchId: data.branchId,
      branchName: data.branchName,
      status: data.status || 'ACTIVE',
      address: data.address || 'Chennai Prime Premises',
      assignedStaffCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryLocations.unshift(newLoc);
    this.saveState();
    return newLoc;
  }

  /**
   * Updates an existing office location
   */
  static updateOfficeLocation(id: string, updates: Partial<OfficeLocation>): OfficeLocation | undefined {
    const index = this.memoryLocations.findIndex(l => l.id === id);
    if (index === -1) return undefined;

    const current = this.memoryLocations[index];
    const updated: OfficeLocation = {
      ...current,
      ...updates,
      latitude: updates.latitude !== undefined ? Number(updates.latitude) : current.latitude,
      longitude: updates.longitude !== undefined ? Number(updates.longitude) : current.longitude,
      allowedRadiusMeters: updates.allowedRadiusMeters !== undefined ? Number(updates.allowedRadiusMeters) : current.allowedRadiusMeters,
      updatedAt: new Date().toISOString(),
    };

    this.memoryLocations[index] = updated;
    this.saveState();
    return updated;
  }

  /**
   * Deletes an office location
   */
  static deleteOfficeLocation(id: string): boolean {
    const initialLen = this.memoryLocations.length;
    this.memoryLocations = this.memoryLocations.filter(l => l.id !== id);
    if (this.memoryLocations.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Toggles status (Active / Inactive)
   */
  static toggleStatus(id: string): OfficeLocation | undefined {
    const loc = this.memoryLocations.find(l => l.id === id);
    if (!loc) return undefined;

    loc.status = loc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    loc.updatedAt = new Date().toISOString();
    this.saveState();
    return loc;
  }

  /**
   * Tests if coordinates fall inside any configured active office geofence
   */
  static validatePointInAnyOfficeGeofence(lat: number, lon: number): {
    isInside: boolean;
    matchingOffice?: OfficeLocation;
    distanceMeters: number;
    nearestOfficeName: string;
  } {
    const activeLocs = this.memoryLocations.filter(l => l.status === 'ACTIVE');
    if (activeLocs.length === 0) {
      return { isInside: false, distanceMeters: 0, nearestOfficeName: 'None' };
    }

    let nearest = activeLocs[0];
    let minDistance = GeoLocationEngine.calculateDistanceMeters(lat, lon, nearest.latitude, nearest.longitude);
    let matched: OfficeLocation | undefined = undefined;

    for (const loc of activeLocs) {
      const dist = GeoLocationEngine.calculateDistanceMeters(lat, lon, loc.latitude, loc.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = loc;
      }
      if (dist <= loc.allowedRadiusMeters) {
        matched = loc;
      }
    }

    return {
      isInside: matched !== undefined,
      matchingOffice: matched,
      distanceMeters: minDistance,
      nearestOfficeName: nearest.name,
    };
  }

  private static saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryLocations));
      }
    } catch {}
  }
}
