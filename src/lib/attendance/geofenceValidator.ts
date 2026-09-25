import { OfficeLocationEngine } from '../locations/officeLocationEngine';
import { GeoLocationEngine } from './geoLocationEngine';
import { GeoLocationPayload, GeoAttendanceRecord } from '../../types/attendance';

export interface GeofenceValidationResult {
  allowed: boolean;
  message: string;
  distanceMeters: number;
  allowedRadiusMeters: number;
  officeName: string;
  targetLatitude: number;
  targetLongitude: number;
  employeeLatitude: number;
  employeeLongitude: number;
}

export class GeofenceValidator {
  /**
   * Validates if the employee's current GPS is within the office's allowed radius.
   * If within radius -> Allows Punch In
   * If outside radius -> Rejects Punch In with "You are outside office premises."
   */
  static validatePunchInGeofence(
    currentLat: number, 
    currentLon: number, 
    preferredOfficeIdOrBranchId?: string
  ): GeofenceValidationResult {
    const offices = OfficeLocationEngine.getOfficeLocations({ status: 'ACTIVE' });
    
    if (offices.length === 0) {
      return {
        allowed: false,
        message: 'You are outside office premises. No active office geofences configured.',
        distanceMeters: 0,
        allowedRadiusMeters: 0,
        officeName: 'Unknown',
        targetLatitude: 0,
        targetLongitude: 0,
        employeeLatitude: currentLat,
        employeeLongitude: currentLon,
      };
    }

    let targetOffice = offices[0];
    if (preferredOfficeIdOrBranchId) {
      const match = offices.find(
        o => o.id === preferredOfficeIdOrBranchId || o.branchId === preferredOfficeIdOrBranchId
      );
      if (match) targetOffice = match;
    }

    const distanceMeters = GeoLocationEngine.calculateDistanceMeters(
      currentLat,
      currentLon,
      targetOffice.latitude,
      targetOffice.longitude
    );

    const isInside = distanceMeters <= targetOffice.allowedRadiusMeters;

    if (isInside) {
      return {
        allowed: true,
        message: `Within allowed radius (${distanceMeters}m / ${targetOffice.allowedRadiusMeters}m). Punch In Allowed.`,
        distanceMeters,
        allowedRadiusMeters: targetOffice.allowedRadiusMeters,
        officeName: targetOffice.name,
        targetLatitude: targetOffice.latitude,
        targetLongitude: targetOffice.longitude,
        employeeLatitude: currentLat,
        employeeLongitude: currentLon,
      };
    }

    return {
      allowed: false,
      message: 'You are outside office premises.',
      distanceMeters,
      allowedRadiusMeters: targetOffice.allowedRadiusMeters,
      officeName: targetOffice.name,
      targetLatitude: targetOffice.latitude,
      targetLongitude: targetOffice.longitude,
      employeeLatitude: currentLat,
      employeeLongitude: currentLon,
    };
  }

  /**
   * Executes enforced Punch In with strict geofence validation
   */
  static executeEnforcedPunchIn(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    branchId: string;
    branchName: string;
    geo: GeoLocationPayload;
  }): {
    success: boolean;
    record?: GeoAttendanceRecord;
    error?: string;
    validation: GeofenceValidationResult;
  } {
    const validation = this.validatePunchInGeofence(
      params.geo.latitude,
      params.geo.longitude,
      params.branchId
    );

    if (!validation.allowed) {
      return {
        success: false,
        error: 'You are outside office premises.',
        validation,
      };
    }

    // Save verified record
    const record = GeoLocationEngine.saveGeoPunch({
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      branchId: params.branchId,
      branchName: params.branchName,
      punchType: 'IN',
      geo: {
        ...params.geo,
        geofenceStatus: 'INSIDE_GEOFENCE',
        distanceFromBranchMeters: validation.distanceMeters,
      },
      remarks: `GPS Geofence Verified: ${validation.distanceMeters}m from ${validation.officeName}`,
    });

    return {
      success: true,
      record,
      validation,
    };
  }
}
