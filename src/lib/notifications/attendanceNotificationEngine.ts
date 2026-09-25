import { 
  AttendanceNotification, 
  NotificationType, 
  SendNotificationDTO 
} from '../../types/attendanceNotification';

export const INITIAL_NOTIFICATIONS: AttendanceNotification[] = [
  {
    id: 'notif-001',
    employeeId: 'emp-001',
    employeeName: 'Kowsalya Sundaram',
    type: 'LEAVE_APPROVED',
    title: 'Leave Application Approved',
    message: 'Your Casual Leave request for Aug 28 – Aug 29, 2026 has been approved by Venkatesh Prabhu.',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL', 'WHATSAPP'],
    isRead: false,
    timestamp: '2026-08-26T09:15:00.000Z',
    meta: {
      leaveType: 'Casual Leave (CL)',
      leaveDates: 'Aug 28 – Aug 29, 2026',
      actionBy: 'Venkatesh Prabhu (General Manager)',
    }
  },
  {
    id: 'notif-002',
    employeeId: 'emp-003',
    employeeName: 'Dinesh Karthik',
    type: 'LATE',
    title: 'Late Arrival Notice',
    message: 'You punched in 35 minutes after shift start (08:35:10 AM) for Morning Early Shift. 15-minute grace tolerance exceeded.',
    priority: 'HIGH',
    channels: ['IN_APP', 'SMS'],
    isRead: false,
    timestamp: '2026-08-26T08:36:00.000Z',
    meta: {
      shiftName: 'Morning Early Shift',
      lateMinutes: 35,
    }
  },
  {
    id: 'notif-003',
    employeeId: 'emp-007',
    employeeName: 'Meenakshi Sundaram',
    type: 'ABSENT',
    title: 'Unnotified Absence Alert',
    message: 'You have been marked ABSENT for today (2026-08-26). If you are on leave, please apply immediately for HR approval.',
    priority: 'URGENT',
    channels: ['IN_APP', 'SMS', 'EMAIL'],
    isRead: false,
    timestamp: '2026-08-26T10:30:00.000Z',
    meta: {
      date: '2026-08-26',
    }
  },
  {
    id: 'notif-004',
    employeeId: 'emp-006',
    employeeName: 'Vikram Raghavan',
    type: 'LEAVE_REJECTED',
    title: 'Leave Application Rejected',
    message: 'Your Earned Leave request was rejected by Chef Rajesh Kumar. Reason: Kitchen staffing shortage during peak weekend hours.',
    priority: 'HIGH',
    channels: ['IN_APP', 'EMAIL'],
    isRead: true,
    timestamp: '2026-08-25T17:00:00.000Z',
    meta: {
      leaveType: 'Earned Leave (EL)',
      reason: 'Kitchen staffing shortage during peak weekend hours.',
      actionBy: 'Chef Rajesh Kumar (Executive Chef)',
    }
  },
  {
    id: 'notif-005',
    employeeId: 'emp-005',
    employeeName: 'Priya Selvam',
    type: 'MISSED_PUNCH_IN',
    title: 'Missed Punch In Alert',
    message: 'Your General Shift started at 09:30 AM. No GPS punch has been detected after 30 minutes.',
    priority: 'HIGH',
    channels: ['IN_APP', 'WHATSAPP'],
    isRead: false,
    timestamp: '2026-08-26T10:00:00.000Z',
    meta: {
      shiftName: 'General Shift',
      shiftStartTime: '09:30 AM',
    }
  },
  {
    id: 'notif-006',
    employeeId: 'emp-002',
    employeeName: 'Chef Rajesh Kumar',
    type: 'MISSED_PUNCH_OUT',
    title: 'Missed Punch Out Reminder',
    message: 'No punch-out recorded for yesterday evening. Please regularize your attendance record with manager sign-off.',
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL'],
    isRead: true,
    timestamp: '2026-08-26T07:00:00.000Z',
    meta: {
      shiftName: 'Morning Early Shift',
    }
  }
];

let notificationsDatabase: AttendanceNotification[] = [...INITIAL_NOTIFICATIONS];

export class AttendanceNotificationEngine {
  /**
   * Get all notifications with optional filters
   */
  static getNotifications(
    employeeId?: string,
    filters?: { type?: string; isRead?: boolean }
  ): AttendanceNotification[] {
    let list = [...notificationsDatabase];

    if (employeeId && employeeId !== 'ALL') {
      list = list.filter(n => n.employeeId === employeeId);
    }

    if (filters) {
      if (filters.type && filters.type !== 'ALL') {
        list = list.filter(n => n.type === filters.type);
      }
      if (filters.isRead !== undefined) {
        list = list.filter(n => n.isRead === filters.isRead);
      }
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Send a new generic notification
   */
  static sendNotification(dto: SendNotificationDTO): AttendanceNotification {
    const notif: AttendanceNotification = {
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      employeeId: dto.employeeId,
      employeeName: dto.employeeName || 'Staff Member',
      type: dto.type,
      title: dto.title || this.getDefaultTitle(dto.type),
      message: dto.message || 'Attendance notification update.',
      priority: dto.priority || 'MEDIUM',
      channels: dto.channels || ['IN_APP', 'EMAIL'],
      isRead: false,
      timestamp: new Date().toISOString(),
      meta: dto.meta,
    };

    notificationsDatabase.unshift(notif);
    return notif;
  }

  /**
   * 1. Notify Employee: Late Arrival
   */
  static notifyLate(
    employeeId: string,
    employeeName: string,
    shiftName: string = 'Standard Shift',
    lateMinutes: number = 20
  ): AttendanceNotification {
    return this.sendNotification({
      employeeId,
      employeeName,
      type: 'LATE',
      title: 'Late Arrival Notice',
      message: `You checked in ${lateMinutes} minutes late for ${shiftName}. Grace tolerance period exceeded.`,
      priority: 'HIGH',
      channels: ['IN_APP', 'SMS'],
      meta: { shiftName, lateMinutes },
    });
  }

  /**
   * 2. Notify Employee: Absent Notice
   */
  static notifyAbsent(
    employeeId: string,
    employeeName: string,
    date: string = new Date().toISOString().slice(0, 10)
  ): AttendanceNotification {
    return this.sendNotification({
      employeeId,
      employeeName,
      type: 'ABSENT',
      title: 'Unnotified Absence Alert',
      message: `You have been marked ABSENT for ${date}. Please apply for leave or contact HR.`,
      priority: 'URGENT',
      channels: ['IN_APP', 'SMS', 'EMAIL'],
      meta: { date },
    });
  }

  /**
   * 3. Notify Employee: Leave Approved
   */
  static notifyLeaveApproved(
    employeeId: string,
    employeeName: string,
    leaveType: string = 'Casual Leave',
    leaveDates: string = 'Next Shift',
    approvedBy: string = 'Reporting Manager'
  ): AttendanceNotification {
    return this.sendNotification({
      employeeId,
      employeeName,
      type: 'LEAVE_APPROVED',
      title: 'Leave Application Approved',
      message: `Your ${leaveType} for ${leaveDates} has been approved by ${approvedBy}.`,
      priority: 'MEDIUM',
      channels: ['IN_APP', 'EMAIL', 'WHATSAPP'],
      meta: { leaveType, leaveDates, actionBy: approvedBy },
    });
  }

  /**
   * 4. Notify Employee: Leave Rejected
   */
  static notifyLeaveRejected(
    employeeId: string,
    employeeName: string,
    leaveType: string = 'Casual Leave',
    reason: string = 'Operational requirements',
    rejectedBy: string = 'Reporting Manager'
  ): AttendanceNotification {
    return this.sendNotification({
      employeeId,
      employeeName,
      type: 'LEAVE_REJECTED',
      title: 'Leave Application Rejected',
      message: `Your ${leaveType} request was rejected by ${rejectedBy}. Reason: ${reason}`,
      priority: 'HIGH',
      channels: ['IN_APP', 'EMAIL'],
      meta: { leaveType, reason, actionBy: rejectedBy },
    });
  }

  /**
   * 5. Notify Employee: Missed Punch Out
   */
  static notifyMissedPunchOut(
    employeeId: string,
    employeeName: string,
    shiftName: string = 'Standard Shift'
  ): AttendanceNotification {
    return this.sendNotification({
      employeeId,
      employeeName,
      type: 'MISSED_PUNCH_OUT',
      title: 'Missed Punch Out Reminder',
      message: `No punch-out recorded for your ${shiftName}. Please regularize your attendance with HR.`,
      priority: 'MEDIUM',
      channels: ['IN_APP', 'EMAIL'],
      meta: { shiftName },
    });
  }

  /**
   * 6. Notify Employee: Missed Punch In
   */
  static notifyMissedPunchIn(
    employeeId: string,
    employeeName: string,
    shiftName: string = 'Standard Shift',
    shiftStartTime: string = '08:00 AM'
  ): AttendanceNotification {
    return this.sendNotification({
      employeeId,
      employeeName,
      type: 'MISSED_PUNCH_IN',
      title: 'Missed Punch In Alert',
      message: `Your shift (${shiftName}) began at ${shiftStartTime}. No punch-in detected yet.`,
      priority: 'HIGH',
      channels: ['IN_APP', 'WHATSAPP'],
      meta: { shiftName, shiftStartTime },
    });
  }

  /**
   * Mark a single notification as read
   */
  static markAsRead(notificationId: string): boolean {
    const item = notificationsDatabase.find(n => n.id === notificationId);
    if (item) {
      item.isRead = true;
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications for an employee as read
   */
  static markAllAsRead(employeeId?: string): number {
    let count = 0;
    notificationsDatabase.forEach(n => {
      if (!employeeId || employeeId === 'ALL' || n.employeeId === employeeId) {
        if (!n.isRead) {
          n.isRead = true;
          count++;
        }
      }
    });
    return count;
  }

  /**
   * Get unread notifications count
   */
  static getUnreadCount(employeeId?: string): number {
    return this.getNotifications(employeeId, { isRead: false }).length;
  }

  private static getDefaultTitle(type: NotificationType): string {
    switch (type) {
      case 'LATE': return 'Late Arrival Notice';
      case 'ABSENT': return 'Unnotified Absence Alert';
      case 'LEAVE_APPROVED': return 'Leave Application Approved';
      case 'LEAVE_REJECTED': return 'Leave Application Rejected';
      case 'MISSED_PUNCH_OUT': return 'Missed Punch Out Reminder';
      case 'MISSED_PUNCH_IN': return 'Missed Punch In Alert';
    }
  }

  /**
   * Reset database (for testing)
   */
  static resetToInitial() {
    notificationsDatabase = [...INITIAL_NOTIFICATIONS];
  }
}
