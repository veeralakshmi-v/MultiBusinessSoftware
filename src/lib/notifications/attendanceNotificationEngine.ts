import { 
  AttendanceNotification, 
  NotificationType, 
  SendNotificationDTO 
} from '../../types/attendanceNotification';

export const INITIAL_NOTIFICATIONS: AttendanceNotification[] = [];

let notificationsDatabase: AttendanceNotification[] = [];

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
