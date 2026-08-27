export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';

export type NotificationEvent = 
  | 'INVOICE_CREATED'
  | 'PAYMENT_DUE'
  | 'LOW_STOCK'
  | 'PURCHASE_RECEIVED'
  | 'CUSTOMER_CREATED'
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

export interface NotificationRecord {
  id: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  title: string;
  body: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
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
