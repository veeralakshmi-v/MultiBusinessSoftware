import { 
  NotificationChannel, 
  NotificationEvent, 
  NotificationPayload, 
  NotificationRecord, 
  NotificationTemplate 
} from '../../types/notification';

export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // 1. INVOICE_CREATED
  {
    event: 'INVOICE_CREATED',
    channel: 'WHATSAPP',
    titleTemplate: 'Invoice #{{invoiceNumber}} from {{businessName}}',
    bodyTemplate: '🧾 *{{businessName}}*\nDear {{customerName}}, thank you for your visit! Your bill for invoice *#{{invoiceNumber}}* total is *₹{{amount}}*.\nView Invoice: {{invoiceUrl}}',
    enabled: true,
  },
  {
    event: 'INVOICE_CREATED',
    channel: 'SMS',
    titleTemplate: 'Bill #{{invoiceNumber}}',
    bodyTemplate: 'Dear {{customerName}}, your bill of Rs.{{amount}} for Inv #{{invoiceNumber}} at {{businessName}} is generated. Thank you!',
    enabled: true,
  },
  {
    event: 'INVOICE_CREATED',
    channel: 'EMAIL',
    titleTemplate: 'Tax Invoice #{{invoiceNumber}} - {{businessName}}',
    bodyTemplate: 'Dear {{customerName}},\n\nPlease find attached your tax invoice #{{invoiceNumber}} for Rs.{{amount}}.\n\nWarm regards,\n{{businessName}}',
    enabled: true,
  },
  {
    event: 'INVOICE_CREATED',
    channel: 'PUSH',
    titleTemplate: 'New Bill Generated: ₹{{amount}}',
    bodyTemplate: 'Invoice #{{invoiceNumber}} processed for {{customerName}}.',
    enabled: true,
  },
  {
    event: 'INVOICE_CREATED',
    channel: 'IN_APP',
    titleTemplate: 'Invoice #{{invoiceNumber}} Completed',
    bodyTemplate: 'Successfully generated bill for ₹{{amount}} ({{customerName}}).',
    enabled: true,
  },

  // 2. PAYMENT_DUE
  {
    event: 'PAYMENT_DUE',
    channel: 'WHATSAPP',
    titleTemplate: 'Payment Reminder - {{businessName}}',
    bodyTemplate: '⚠️ *Payment Reminder - {{businessName}}*\nDear {{customerName}}, your payment of *₹{{amount}}* for invoice *#{{invoiceNumber}}* is due on *{{dueDate}}*. Kindly settle at the earliest.',
    enabled: true,
  },
  {
    event: 'PAYMENT_DUE',
    channel: 'SMS',
    titleTemplate: 'Payment Due Alert',
    bodyTemplate: 'Reminder: Rs.{{amount}} is due on {{dueDate}} for Inv #{{invoiceNumber}} at {{businessName}}. Please pay soon.',
    enabled: true,
  },
  {
    event: 'PAYMENT_DUE',
    channel: 'EMAIL',
    titleTemplate: 'Statement Reminder: Payment Due on {{dueDate}}',
    bodyTemplate: 'Dear {{customerName}},\n\nThis is a friendly reminder that an outstanding payment of Rs.{{amount}} for invoice #{{invoiceNumber}} is due on {{dueDate}}.\n\nThank you,\n{{businessName}}',
    enabled: true,
  },
  {
    event: 'PAYMENT_DUE',
    channel: 'IN_APP',
    titleTemplate: 'Credit Payment Due: {{customerName}}',
    bodyTemplate: '₹{{amount}} due on {{dueDate}} for Invoice #{{invoiceNumber}}.',
    enabled: true,
  },

  // 3. LOW_STOCK
  {
    event: 'LOW_STOCK',
    channel: 'IN_APP',
    titleTemplate: '🚨 Low Stock Alert: {{itemName}}',
    bodyTemplate: '{{itemName}} is down to {{stockRemaining}} {{unit}}. Reorder threshold reached.',
    enabled: true,
  },
  {
    event: 'LOW_STOCK',
    channel: 'PUSH',
    titleTemplate: 'Stock Alert: {{itemName}}',
    bodyTemplate: 'Only {{stockRemaining}} units left in inventory.',
    enabled: true,
  },
  {
    event: 'LOW_STOCK',
    channel: 'EMAIL',
    titleTemplate: 'Inventory Alert: Low Stock for {{itemName}}',
    bodyTemplate: 'Attention Manager,\n\nThe product {{itemName}} (SKU: {{sku}}) has dropped to {{stockRemaining}} units.\nPlease create a purchase order.\n\nInventory Bot',
    enabled: true,
  },
  {
    event: 'LOW_STOCK',
    channel: 'WHATSAPP',
    titleTemplate: 'Low Stock Alert',
    bodyTemplate: '🚨 *Inventory Alert*\nProduct *{{itemName}}* has only *{{stockRemaining}} units* remaining.',
    enabled: true,
  },

  // 4. PURCHASE_RECEIVED
  {
    event: 'PURCHASE_RECEIVED',
    channel: 'IN_APP',
    titleTemplate: '📦 Purchase GRN Inward Received',
    bodyTemplate: 'PO #{{purchaseOrderNo}} inward received from {{supplierName}} ({{itemCount}} items, ₹{{totalAmount}}).',
    enabled: true,
  },
  {
    event: 'PURCHASE_RECEIVED',
    channel: 'EMAIL',
    titleTemplate: 'Goods Receipt Note: PO #{{purchaseOrderNo}}',
    bodyTemplate: 'Purchase Order #{{purchaseOrderNo}} has been verified and stock updated.\nSupplier: {{supplierName}}\nTotal Amount: Rs.{{totalAmount}}',
    enabled: true,
  },
  {
    event: 'PURCHASE_RECEIVED',
    channel: 'PUSH',
    titleTemplate: 'Purchase Order Received',
    bodyTemplate: 'PO #{{purchaseOrderNo}} goods added to stock.',
    enabled: true,
  },

  // 5. CUSTOMER_CREATED
  {
    event: 'CUSTOMER_CREATED',
    channel: 'WHATSAPP',
    titleTemplate: 'Welcome to {{businessName}}!',
    bodyTemplate: '🎉 *Welcome to {{businessName}}!*\nDear {{customerName}}, thank you for registering with us. You have been awarded *{{loyaltyPoints}}* loyalty reward points.',
    enabled: true,
  },
  {
    event: 'CUSTOMER_CREATED',
    channel: 'SMS',
    titleTemplate: 'Welcome to {{businessName}}',
    bodyTemplate: 'Welcome to {{businessName}}, {{customerName}}! Your membership is active with {{loyaltyPoints}} loyalty points. Visit us again!',
    enabled: true,
  },
  {
    event: 'CUSTOMER_CREATED',
    channel: 'IN_APP',
    titleTemplate: 'New Customer Registered',
    bodyTemplate: '{{customerName}} ({{mobile}}) enrolled with {{loyaltyPoints}} points.',
    enabled: true,
  },

  // 6. CUSTOMER_BIRTHDAY_OFFER
  {
    event: 'CUSTOMER_BIRTHDAY_OFFER',
    channel: 'WHATSAPP',
    titleTemplate: '🎂 Happy Birthday {{customerName}} from {{businessName}}!',
    bodyTemplate: '🎂 *Happy Birthday {{customerName}}!* 🎉\nAll of us at *{{businessName}}* wish you a wonderful year ahead!\n\n🎁 As our birthday treat to you, enjoy *{{discountOffer}}* on your next visit/order!\n🔑 Use Coupon Code: *{{couponCode}}*\n⏳ Valid till: *{{validDate}}*\n\nVisit us today or shop online!',
    enabled: true,
  },
  {
    event: 'CUSTOMER_BIRTHDAY_OFFER',
    channel: 'SMS',
    titleTemplate: 'Birthday Special Offer',
    bodyTemplate: 'Happy Birthday {{customerName}}! {{businessName}} celebrates you with {{discountOffer}} off using code {{couponCode}}. Valid till {{validDate}}. Have a great day!',
    enabled: true,
  },
  {
    event: 'CUSTOMER_BIRTHDAY_OFFER',
    channel: 'EMAIL',
    titleTemplate: '🎂 Happy Birthday {{customerName}}! Special {{discountOffer}} Gift Inside',
    bodyTemplate: 'Dear {{customerName}},\n\nWarmest birthday wishes from the team at {{businessName}}! 🎂\n\nTo make your day extra special, we are delighted to offer you {{discountOffer}} discount on your next purchase.\n\nCoupon Code: {{couponCode}}\nValid Till: {{validDate}}\n\nWe look forward to serving you soon!\n\nWarm regards,\n{{businessName}}',
    enabled: true,
  },
  {
    event: 'CUSTOMER_BIRTHDAY_OFFER',
    channel: 'IN_APP',
    titleTemplate: '🎂 Birthday Offer Sent to {{customerName}}',
    bodyTemplate: 'Dispatched {{discountOffer}} offer (Code: {{couponCode}}) to {{customerName}} ({{mobile}}).',
    enabled: true,
  },

  // 7. CUSTOMER_ANNIVERSARY_OFFER
  {
    event: 'CUSTOMER_ANNIVERSARY_OFFER',
    channel: 'WHATSAPP',
    titleTemplate: '💍 Happy Anniversary {{customerName}} from {{businessName}}!',
    bodyTemplate: '💍 *Happy Anniversary {{customerName}}!* 🥂\nWishing you a joyful anniversary celebration!\n\n🎁 Celebrate with *{{discountOffer}}* off on your special milestone with us.\n🔑 Use Coupon Code: *{{couponCode}}*\n⏳ Valid till: *{{validDate}}*\n\nWarm wishes from *{{businessName}}*!',
    enabled: true,
  },
  {
    event: 'CUSTOMER_ANNIVERSARY_OFFER',
    channel: 'SMS',
    titleTemplate: 'Anniversary Special Offer',
    bodyTemplate: 'Happy Anniversary {{customerName}}! Celebrate with {{businessName}} & enjoy {{discountOffer}} with code {{couponCode}}. Valid till {{validDate}}.',
    enabled: true,
  },
  {
    event: 'CUSTOMER_ANNIVERSARY_OFFER',
    channel: 'EMAIL',
    titleTemplate: '💍 Happy Anniversary {{customerName}}! Special {{discountOffer}} Offer',
    bodyTemplate: 'Dear {{customerName}},\n\nHappy Anniversary! 🥂\n\nTo celebrate this wonderful milestone, {{businessName}} is offering you {{discountOffer}} off on your next purchase.\n\nCoupon Code: {{couponCode}}\nValid Till: {{validDate}}\n\nWarm regards,\n{{businessName}}',
    enabled: true,
  },
  {
    event: 'CUSTOMER_ANNIVERSARY_OFFER',
    channel: 'IN_APP',
    titleTemplate: '💍 Anniversary Offer Sent to {{customerName}}',
    bodyTemplate: 'Dispatched {{discountOffer}} offer (Code: {{couponCode}}) to {{customerName}} ({{mobile}}).',
    enabled: true,
  },

  // 8. STAFF_PUNCHED_IN
  {
    event: 'STAFF_PUNCHED_IN',
    channel: 'IN_APP',
    titleTemplate: '📍 Attendance: {{staffName}} Punched IN',
    bodyTemplate: '{{staffName}} punched IN at {{time}} with live location ({{location}}).',
    enabled: true,
  },

  // 7. STAFF_PUNCHED_OUT
  {
    event: 'STAFF_PUNCHED_OUT',
    channel: 'IN_APP',
    titleTemplate: '⏰ Attendance: {{staffName}} Punched OUT',
    bodyTemplate: '{{staffName}} punched OUT at {{time}}. Shift concluded.',
    enabled: true,
  },

  // 8. LEAVE_REQUESTED
  {
    event: 'LEAVE_REQUESTED',
    channel: 'IN_APP',
    titleTemplate: '📝 New Leave Application: {{staffName}}',
    bodyTemplate: '{{staffName}} requested {{type}} for {{date}}. Reason: "{{reason}}"',
    enabled: true,
  },

  // 9. LEAVE_STATUS_CHANGED
  {
    event: 'LEAVE_STATUS_CHANGED',
    channel: 'IN_APP',
    titleTemplate: '📋 Leave Application Update',
    bodyTemplate: 'Leave request for {{date}} ({{type}}) was {{status}} by Admin.',
    enabled: true,
  },
];

export class NotificationEngine {
  private static STORAGE_KEY = 'multi_biz_notifications';

  /**
   * Render tokens in template string e.g. {{customerName}} -> "John Doe"
   */
  static renderTemplate(templateStr: string, data: Record<string, any>): string {
    return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, token) => {
      const val = data[token];
      if (val === undefined || val === null) return '';
      return String(val);
    });
  }

  /**
   * Dispatches notifications across requested or all enabled channels
   */
  static dispatch(payload: NotificationPayload): {
    success: boolean;
    dispatches: NotificationRecord[];
  } {
    const { event, recipient, data, channels } = payload;
    const defaultData = {
      businessName: 'Apex Multi-Business POS',
      customerName: recipient.name || 'Valued Customer',
      mobile: recipient.mobile || '',
      email: recipient.email || '',
      amount: '0.00',
      invoiceNumber: 'INV-1001',
      invoiceUrl: 'https://billing.app/view',
      dueDate: new Date().toLocaleDateString('en-IN'),
      itemName: 'Item',
      stockRemaining: '5',
      unit: 'units',
      purchaseOrderNo: 'PO-501',
      supplierName: 'Direct Wholesaler',
      itemCount: '10',
      totalAmount: '5000',
      loyaltyPoints: '100',
      ...data,
    };

    // Match templates for this event
    const matchingTemplates = DEFAULT_NOTIFICATION_TEMPLATES.filter(t => {
      if (t.event !== event) return false;
      if (!t.enabled) return false;
      if (channels && channels.length > 0) {
        return channels.includes(t.channel);
      }
      return true;
    });

    if (matchingTemplates.length === 0) {
      return { success: false, dispatches: [] };
    }

    // Select the best template for display (prefer IN_APP, then WHATSAPP, SMS, etc.)
    const primaryTmpl = matchingTemplates.find(t => t.channel === 'IN_APP') || matchingTemplates[0];
    const title = this.renderTemplate(primaryTmpl.titleTemplate, defaultData);
    const body = this.renderTemplate(primaryTmpl.bodyTemplate, defaultData);
    const activeChannels = matchingTemplates.map(t => t.channel);

    const record: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      event,
      channel: primaryTmpl.channel,
      channels: activeChannels,
      recipient,
      title,
      body,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      metadata: defaultData,
    };

    // Save single consolidated notification record to history store
    this.saveNotificationRecords([record]);

    try {
      window.dispatchEvent(new Event('notification_dispatched'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    return {
      success: true,
      dispatches: [record],
    };
  }

  /**
   * Persistence helpers
   */
  static getNotifications(limit: number = 50): NotificationRecord[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: NotificationRecord[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Deduplicate duplicate entries from previous multi-channel dispatches
      const seen = new Set<string>();
      const deduped: NotificationRecord[] = [];

      for (const item of parsed) {
        if (!item || !item.id) continue;
        // Generate a deduplication key based on event + title/metadata or createdAt minute
        const createdMin = item.createdAt ? item.createdAt.substring(0, 16) : '';
        const key = `${item.event}-${item.metadata?.invoiceNumber || item.metadata?.itemName || item.title}-${createdMin}`;
        
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(item);
        }
      }

      if (deduped.length !== parsed.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(deduped));
      }

      return deduped.slice(0, limit);
    } catch {
      return [];
    }
  }

  static saveNotificationRecords(newRecords: NotificationRecord[]): void {
    try {
      const existing = this.getNotifications(100);
      const combined = [...newRecords, ...existing.filter(e => !newRecords.some(n => n.id === e.id))];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(combined.slice(0, 100)));
    } catch (e) {
      console.error('Failed to save notification records', e);
    }
  }

  static markAsRead(id: string): void {
    const list = this.getNotifications(100);
    const updated = list.map(item => item.id === id ? { ...item, status: 'READ' as const } : item);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static markAllAsRead(): void {
    const list = this.getNotifications(100);
    const updated = list.map(item => ({ ...item, status: 'READ' as const }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static getUnreadCount(): number {
    return this.getNotifications(100).filter(n => n.status !== 'READ').length;
  }

  static clearAll(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    try {
      window.dispatchEvent(new Event('notification_dispatched'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }
}
