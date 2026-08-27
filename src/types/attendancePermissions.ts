export type AttendanceRole = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export type AttendanceAction = 
  | 'PUNCH_IN'
  | 'PUNCH_OUT'
  | 'START_BREAK'
  | 'END_BREAK'
  | 'VIEW_OWN_ATTENDANCE'
  | 'VIEW_TEAM_ATTENDANCE'
  | 'VIEW_ALL_ATTENDANCE'
  | 'EDIT_ATTENDANCE'
  | 'OVERRIDE_GEOFENCE'
  | 'APPLY_LEAVE'
  | 'CANCEL_OWN_LEAVE'
  | 'APPROVE_LEAVE'
  | 'REJECT_LEAVE'
  | 'FORWARD_LEAVE'
  | 'HR_OVERRIDE_LEAVE'
  | 'MANAGE_HOLIDAYS'
  | 'MANAGE_OFFICES'
  | 'MANAGE_SHIFTS'
  | 'EXPORT_REPORTS';

export interface AttendancePermissionMatrix {
  role: AttendanceRole;
  roleTitle: string;
  badgeColor: string;
  description: string;
  allowedActions: AttendanceAction[];
  canEditAttendance: boolean; // True ONLY for ADMIN and HR
}

export interface PermissionCheckResult {
  allowed: boolean;
  role: AttendanceRole;
  action: AttendanceAction;
  reason?: string;
}
