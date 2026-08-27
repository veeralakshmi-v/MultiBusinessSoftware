export interface PunchInRecord {
  id: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shiftName: string;
  
  // Required saved fields for Punch In
  punchInTime: string; // 1. Punch In Time
  latitude: number; // 2. Latitude
  longitude: number; // 3. Longitude
  accuracy: number; // 4. Accuracy (meters)
  device: string; // 5. Device
  ipAddress: string; // 6. IP
  browser: string; // 7. Browser
  
  // Context metadata
  punchInDate: string; // YYYY-MM-DD
  operatingSystem: string;
  officeName: string;
  distanceFromOfficeMeters: number;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY';
  isGeofenceVerified: boolean;
  remarks?: string;
  createdAt: string;
}

export interface PunchOutRecord {
  id: string;
  punchInId: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shiftName: string;
  
  // Punch In reference
  punchInTime: string;
  
  // 3 Required Saved Fields on Punch Out:
  punchOutTime: string; // 1. Punch Out Time (e.g. "05:30:00 PM")
  workedHours: number; // 2. Worked Hours (e.g. 8.5)
  workedHoursFormatted: string; // "8h 30m"
  overtime: number; // 3. Overtime (e.g. 0.5 hours)
  overtimeFormatted: string; // "0h 30m"
  
  // Screen Display Fields & Context
  breakHours: number; // Break Hours (e.g. 0.75)
  breakHoursFormatted: string; // "45m"
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
    officeName: string;
    address?: string;
  };
  punchOutDate: string;
  status: 'COMPLETED';
  createdAt: string;
}

export interface PunchInScreenState {
  currentTime: string;
  currentDate: string;
  currentGPS: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  officeName: string;
  distanceFromOfficeMeters: number;
  status: 'ALLOWED_INSIDE_GEOFENCE' | 'REJECTED_OUTSIDE_OFFICE';
}
