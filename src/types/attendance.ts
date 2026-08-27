export type LocationPermissionStatus = 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNAVAILABLE' | 'TIMEOUT';

export type GeofenceStatus = 'INSIDE_GEOFENCE' | 'OUTSIDE_GEOFENCE' | 'REMOTE_ALLOWED';

export interface GeoLocationPayload {
  latitude: number; // Latitude
  longitude: number; // Longitude
  accuracy: number; // Accuracy in meters
  timestamp: string; // Timestamp ISO
  ipAddress: string; // IP Address
  device: string; // Device (e.g. Desktop / Mobile / Tablet)
  browser: string; // Browser (e.g. Chrome 128 / Safari Mobile)
  operatingSystem: string; // Operating System (e.g. Windows 11 / iOS 18 / Android)
  permissionStatus: LocationPermissionStatus;
  geofenceStatus?: GeofenceStatus;
  distanceFromBranchMeters?: number;
  nearestBranch?: string;
}

export interface GeoAttendanceRecord {
  id: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  branchId: string;
  branchName: string;
  punchType: 'IN' | 'OUT';
  geo: GeoLocationPayload;
  status: 'VERIFIED' | 'FLAGGED_OUTSIDE_GEOFENCE' | 'REMOTE';
  remarks?: string;
  createdAt: string;
}

export interface GeoAttendanceFilterOptions {
  search?: string;
  punchType?: 'ALL' | 'IN' | 'OUT';
  status?: 'ALL' | 'VERIFIED' | 'FLAGGED_OUTSIDE_GEOFENCE' | 'REMOTE';
  branchId?: string;
}
