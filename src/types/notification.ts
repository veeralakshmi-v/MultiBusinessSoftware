export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';

export type NotificationEvent = 
  | 'INVOICE_CREATED'
  | 'PAYMENT_DUE'
  | 'LOW_STOCK'
  | 'PURCHASE_RECEIVED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_BIRTHDAY_OFFER'
  | 'CUSTOMER_ANNIVERSARY_OFFER'
  | 'STAFF_PUNCHED_IN'
  | 'STAFF_PUNCHED_OUT'
  | 'LEAVE_REQUESTED'
  | 'LEAVE_STATUS_CHANGED';

export interface NotificationRecipient {
  name?: string;
  email?: string;
  mobile?: string;
  role?: string;
  userId?: string;
}

export interface NotificationPayload {
  event: NotificationEvent;
  recipient: NotificationRecipient;
  data: Record<string, any>;
  channels?: NotificationChannel[];
}

export type NotificationStatus = 'SENT' | 'DELIVERED' | 'FAILED' | 'READ' | 'UNREAD';

export interface NotificationRecord {
  id: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  channels?: NotificationChannel[];
  recipient: NotificationRecipient;
  title: string;
  body: string;
  status: NotificationStatus;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  event: NotificationEvent;
  channel: NotificationChannel;
  titleTemplate: string;
  bodyTemplate: string;
  enabled: boolean;
}

export interface NotificationChannelConfig {
  channel: NotificationChannel;
  enabled: boolean;
  provider?: string; // e.g. 'TWILIO', 'WHATSAPP_CLOUD_API', 'SENDGRID', 'FIREBASE', 'INTERNAL'
}
