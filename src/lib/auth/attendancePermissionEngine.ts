import { 
  AttendanceRole, 
  AttendanceAction, 
  AttendancePermissionMatrix, 
  PermissionCheckResult 
} from '../../types/attendancePermissions';

export const ROLE_PERMISSION_MATRICES: Record<AttendanceRole, AttendancePermissionMatrix> = {
  ADMIN: {
    role: 'ADMIN',
    roleTitle: 'System & Business Administrator',
    badgeColor: 'bg-[#C5A059]/20 text-[#E5C07B] border-[#C5A059]/40',
    description: 'Full unrestricted governance across all staff attendance, geofences, offices, and payroll.',
    canEditAttendance: true,
    allowedActions: [
      'PUNCH_IN',
      'PUNCH_OUT',
      'START_BREAK',
      'END_BREAK',
      'VIEW_OWN_ATTENDANCE',
      'VIEW_TEAM_ATTENDANCE',
      'VIEW_ALL_ATTENDANCE',
      'EDIT_ATTENDANCE',
      'OVERRIDE_GEOFENCE',
      'APPLY_LEAVE',
      'CANCEL_OWN_LEAVE',
      'APPROVE_LEAVE',
      'REJECT_LEAVE',
      'FORWARD_LEAVE',
      'HR_OVERRIDE_LEAVE',
      'MANAGE_HOLIDAYS',
      'MANAGE_OFFICES',
      'MANAGE_SHIFTS',
      'EXPORT_REPORTS',
    ],
  },
  HR: {
    role: 'HR',
    roleTitle: 'Human Resources Executive / Manager',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Staff lifecycle administration, shift planning, holiday calendars, leave overrides, and attendance editing.',
    canEditAttendance: true,
    allowedActions: [
      'PUNCH_IN',
      'PUNCH_OUT',
      'START_BREAK',
      'END_BREAK',
      'VIEW_OWN_ATTENDANCE',
      'VIEW_TEAM_ATTENDANCE',
      'VIEW_ALL_ATTENDANCE',
      'EDIT_ATTENDANCE',
      'OVERRIDE_GEOFENCE',
      'APPLY_LEAVE',
      'CANCEL_OWN_LEAVE',
      'APPROVE_LEAVE',
      'REJECT_LEAVE',
      'FORWARD_LEAVE',
      'HR_OVERRIDE_LEAVE',
      'MANAGE_HOLIDAYS',
      'MANAGE_SHIFTS',
      'EXPORT_REPORTS',
    ],
  },
  MANAGER: {
    role: 'MANAGER',
    roleTitle: 'Department & Branch Manager',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Team supervision, leave review & approvals, attendance monitoring. Cannot edit raw attendance logs.',
    canEditAttendance: false,
    allowedActions: [
      'PUNCH_IN',
      'PUNCH_OUT',
      'START_BREAK',
      'END_BREAK',
      'VIEW_OWN_ATTENDANCE',
      'VIEW_TEAM_ATTENDANCE',
      'APPLY_LEAVE',
      'CANCEL_OWN_LEAVE',
      'APPROVE_LEAVE',
      'REJECT_LEAVE',
      'FORWARD_LEAVE',
      'EXPORT_REPORTS',
    ],
  },
  EMPLOYEE: {
    role: 'EMPLOYEE',
    roleTitle: 'Staff Member / Frontline Employee',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Self-service mobile/desktop terminal: punch in/out, view own logs, and apply for leaves.',
    canEditAttendance: false,
    allowedActions: [
      'PUNCH_IN',
      'PUNCH_OUT',
      'START_BREAK',
      'END_BREAK',
      'VIEW_OWN_ATTENDANCE',
      'APPLY_LEAVE',
      'CANCEL_OWN_LEAVE',
    ],
  },
};

export class AttendancePermissionEngine {
  /**
   * Returns permission matrix for a specific role
   */
  static getRolePermissions(role: AttendanceRole): AttendancePermissionMatrix {
    return ROLE_PERMISSION_MATRICES[role] || ROLE_PERMISSION_MATRICES.EMPLOYEE;
  }

  /**
   * Returns all 4 role matrices
   */
  static getAllRoleMatrices(): AttendancePermissionMatrix[] {
    return [
      ROLE_PERMISSION_MATRICES.ADMIN,
      ROLE_PERMISSION_MATRICES.HR,
      ROLE_PERMISSION_MATRICES.MANAGER,
      ROLE_PERMISSION_MATRICES.EMPLOYEE,
    ];
  }

  /**
   * Core Requirement: Only Admin and HR can edit attendance.
   * Returns true ONLY if role is 'ADMIN' or 'HR'.
   */
  static canEditAttendance(role: AttendanceRole): boolean {
    return role === 'ADMIN' || role === 'HR';
  }

  /**
   * Check if a role has permission for a specific action
   */
  static hasPermission(role: AttendanceRole, action: AttendanceAction): boolean {
    // Special constraint: Only Admin & HR can edit attendance
    if (action === 'EDIT_ATTENDANCE') {
      return this.canEditAttendance(role);
    }

    const matrix = this.getRolePermissions(role);
    return matrix.allowedActions.includes(action);
  }

  /**
   * Validate action with explicit success/denial result
   */
  static validateAction(role: AttendanceRole, action: AttendanceAction): PermissionCheckResult {
    const allowed = this.hasPermission(role, action);

    if (allowed) {
      return {
        allowed: true,
        role,
        action,
      };
    }

    // Custom denial messages based on specification
    if (action === 'EDIT_ATTENDANCE') {
      return {
        allowed: false,
        role,
        action,
        reason: 'Access Denied: Only Admin and HR can edit attendance records.',
      };
    }

    if (role === 'EMPLOYEE') {
      return {
        allowed: false,
        role,
        action,
        reason: 'Access Denied: Employee role can only Punch In, Punch Out, View own attendance, and Apply Leave.',
      };
    }

    return {
      allowed: false,
      role,
      action,
      reason: `Access Denied: Role "${role}" is not authorized to perform action "${action}".`,
    };
  }
}
