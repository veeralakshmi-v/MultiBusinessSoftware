import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, Check, X, Trash2, Send, Sparkles, Receipt, AlertTriangle, 
  Package, UserPlus, Clock, MessageSquare, Mail, Smartphone, Radio, CheckCheck
} from 'lucide-react';
import { NotificationEngine } from '../../lib/notifications/notificationEngine';
import { NotificationEvent, NotificationChannel, NotificationRecord } from '../../types/notification';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function NotificationCenter() {
  const { activeTemplate, businessType } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'ALL' | 'INVOICES' | 'STOCK' | 'CUSTOMERS'>('ALL');
  const [isSimulating, setIsSimulating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(() => {
    const list = NotificationEngine.getNotifications(50);
    setNotifications(list);
    setUnreadCount(list.filter(n => n.status !== 'READ').length);
  }, []);

  useEffect(() => {
    loadNotifications();
    window.addEventListener('notification_dispatched', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    const interval = setInterval(loadNotifications, 5000);
    return () => {
      window.removeEventListener('notification_dispatched', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
      clearInterval(interval);
    };
  }, [loadNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = (id: string) => {
    NotificationEngine.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' as const } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    NotificationEngine.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' as const })));
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications?')) {
      NotificationEngine.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Dispatch Simulator
  const simulateEventDispatch = (event: NotificationEvent) => {
    setIsSimulating(true);
    let recipient = { name: 'Rahul Sharma', mobile: '+919876543210', email: 'rahul@example.com' };
    let data: Record<string, any> = { businessName: activeTemplate?.name || 'My Business' };

    if (event === 'INVOICE_CREATED') {
      const invNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const amt = (Math.floor(300 + Math.random() * 4500)).toFixed(2);
      data = {
        ...data,
        invoiceNumber: invNum,
        amount: amt,
        customerName: recipient.name,
      };
    } else if (event === 'PAYMENT_DUE') {
      data = {
        ...data,
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: (Math.floor(500 + Math.random() * 8000)).toFixed(2),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        customerName: recipient.name,
      };
    } else if (event === 'LOW_STOCK') {
      data = {
        ...data,
        itemName: businessType === 'MEDICAL' ? 'Paracetamol 650mg' : 'Fresh Lime Soda',
        stockRemaining: '4',
        unit: 'Pcs',
        sku: 'SKU-0982',
      };
    } else if (event === 'PURCHASE_RECEIVED') {
      data = {
        ...data,
        purchaseOrderNo: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierName: 'Metro Distributors Pvt Ltd',
        itemCount: '25',
        totalAmount: '12,500.00',
      };
    } else if (event === 'CUSTOMER_CREATED') {
      data = {
        ...data,
        customerName: recipient.name,
        loyaltyPoints: '150',
      };
    }

    NotificationEngine.dispatch({
      event,
      recipient,
      data,
    });

    setTimeout(() => {
      loadNotifications();
      setIsSimulating(false);
    }, 150);
  };

  const getChannelBadges = (notif: NotificationRecord) => {
    const list = notif.channels && notif.channels.length > 0 ? notif.channels : [notif.channel];
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {list.map(ch => {
          switch (ch) {
            case 'WHATSAPP':
              return (
                <span key={ch} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold flex items-center gap-0.5 font-mono">
                  <MessageSquare className="w-2.5 h-2.5" /> WA
                </span>
              );
            case 'SMS':
              return (
                <span key={ch} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold flex items-center gap-0.5 font-mono">
                  <Smartphone className="w-2.5 h-2.5" /> SMS
                </span>
              );
            case 'EMAIL':
              return (
                <span key={ch} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold flex items-center gap-0.5 font-mono">
                  <Mail className="w-2.5 h-2.5" /> Email
                </span>
              );
            case 'PUSH':
              return (
                <span key={ch} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold flex items-center gap-0.5 font-mono">
                  <Radio className="w-2.5 h-2.5" /> Push
                </span>
              );
            case 'IN_APP':
            default:
              return (
                <span key={ch} className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold flex items-center gap-0.5 font-mono">
                  <Bell className="w-2.5 h-2.5" /> App
                </span>
              );
          }
        })}
      </div>
    );
  };

  const getEventIcon = (event: NotificationEvent) => {
    switch (event) {
      case 'INVOICE_CREATED': 
        return (
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex-shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
        );
      case 'PAYMENT_DUE': 
        return (
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'LOW_STOCK': 
        return (
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'PURCHASE_RECEIVED': 
        return (
          <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex-shrink-0">
            <Package className="w-4 h-4" />
          </div>
        );
      case 'CUSTOMER_CREATED': 
        return (
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex-shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'STAFF_PUNCHED_IN': 
      case 'STAFF_PUNCHED_OUT': 
        return (
          <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  // Filter tab data
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'INVOICES') return n.event === 'INVOICE_CREATED' || n.event === 'PAYMENT_DUE';
    if (activeTab === 'STOCK') return n.event === 'LOW_STOCK' || n.event === 'PURCHASE_RECEIVED';
    if (activeTab === 'CUSTOMERS') return n.event === 'CUSTOMER_CREATED' || n.event.startsWith('STAFF_') || n.event.startsWith('LEAVE_');
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all cursor-pointer",
          isOpen ? "bg-blue-50 border-blue-300 text-[#2563EB]" : "bg-white"
        )}
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-md shadow-blue-500/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[92vw] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-3.5 border-b border-gray-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs tracking-tight">Notification Engine</h3>
                <p className="text-[10px] text-gray-500">Live operational & billing activity alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-[#2563EB] font-bold mr-1">
                  {unreadCount} New
                </span>
              )}
              <button
                onClick={handleMarkAllAsRead}
                className="p-1.5 text-gray-400 hover:text-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClearAll}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/80 p-1 gap-1 text-[11px] font-bold">
            {[
              { id: 'ALL', label: 'All', count: notifications.length },
              { id: 'INVOICES', label: 'Invoices', count: notifications.filter(n => n.event === 'INVOICE_CREATED' || n.event === 'PAYMENT_DUE').length },
              { id: 'STOCK', label: 'Stock / PO', count: notifications.filter(n => n.event === 'LOW_STOCK' || n.event === 'PURCHASE_RECEIVED').length },
              { id: 'CUSTOMERS', label: 'Clients', count: notifications.filter(n => n.event === 'CUSTOMER_CREATED' || n.event.startsWith('STAFF_') || n.event.startsWith('LEAVE_')).length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1",
                  activeTab === tab.id
                    ? "bg-white text-[#2563EB] shadow-xs font-extrabold border border-gray-200/60"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.2 rounded-full",
                    activeTab === tab.id ? "bg-blue-100 text-[#2563EB]" : "bg-gray-200 text-gray-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-72 bg-white">
            {filteredNotifications.map(notif => {
              const isUnread = notif.status !== 'READ';
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={cn(
                    "p-3.5 transition-all cursor-pointer flex items-start gap-3 text-xs border-l-3",
                    isUnread 
                      ? "bg-blue-50/40 hover:bg-blue-50/70 border-[#2563EB]" 
                      : "bg-white hover:bg-gray-50 border-transparent opacity-85"
                  )}
                >
                  {getEventIcon(notif.event)}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn(
                        "font-bold truncate text-xs flex items-center gap-1.5",
                        isUnread ? "text-gray-900" : "text-gray-700"
                      )}>
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />}
                        <span className="truncate">{notif.title}</span>
                      </p>
                      {getChannelBadges(notif)}
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-line">
                      {notif.body}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-0.5">
                      <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      <span className="capitalize text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-sans font-medium">
                        {notif.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="py-12 px-4 text-center text-gray-400 text-xs space-y-2">
                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-medium text-gray-500">No notifications in this feed</p>
                <p className="text-[11px]">Actions like billing, low-stock alerts, and payments will appear here.</p>
              </div>
            )}
          </div>

          {/* Test Event Dispatch Simulator Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/90 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
              <span>Trigger Test Event Dispatch</span>
              <Send className="w-3 h-3 text-[#2563EB]" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold">
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('INVOICE_CREATED')}
                className="p-1.5 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 rounded-lg text-emerald-600 transition-all truncate cursor-pointer shadow-2xs font-bold"
              >
                🧾 Bill Created
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('PAYMENT_DUE')}
                className="p-1.5 bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-700 rounded-lg text-amber-600 transition-all truncate cursor-pointer shadow-2xs font-bold"
              >
                ⚠️ Pay Due
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('LOW_STOCK')}
                className="p-1.5 bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-700 rounded-lg text-rose-600 transition-all truncate cursor-pointer shadow-2xs font-bold"
              >
                🚨 Low Stock
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('PURCHASE_RECEIVED')}
                className="p-1.5 bg-white border border-gray-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 rounded-lg text-sky-600 transition-all truncate cursor-pointer shadow-2xs font-bold"
              >
                📦 PO GRN
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('CUSTOMER_CREATED')}
                className="p-1.5 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 rounded-lg text-purple-600 transition-all truncate col-span-2 cursor-pointer shadow-2xs font-bold"
              >
                🎉 Customer Enrolled
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
