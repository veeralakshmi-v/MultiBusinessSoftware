export type NotificationType = 
  | 'LATE'
  | 'ABSENT'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'MISSED_PUNCH_OUT'
  | 'MISSED_PUNCH_IN';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type NotificationChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'WHATSAPP';

export interface AttendanceNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  isRead: boolean;
  timestamp: string;
  meta?: {
    shiftName?: string;
    shiftStartTime?: string;
    lateMinutes?: number;
    leaveType?: string;
    leaveDates?: string;
    reason?: string;
    actionBy?: string;
    date?: string;
  };
}

export interface SendNotificationDTO {
  employeeId: string;
  employeeName?: string;
  type: NotificationType;
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  meta?: Record<string, any>;
}
