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
    NotificationEngine.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  };

  // Dispatch Simulator
  const simulateEventDispatch = (event: NotificationEvent) => {
    setIsSimulating(true);
    let recipient = { name: 'Rahul Sharma', mobile: '+919876543210', email: 'rahul@example.com' };
    let data: Record<string, any> = { businessName: activeTemplate.name };

    if (event === 'INVOICE_CREATED') {
      data = {
        ...data,
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: (Math.floor(300 + Math.random() * 4500)).toFixed(2),
        customerName: recipient.name,
      };
    } else if (event === 'PAYMENT_DUE') {
      data = {
        ...data,
        invoiceNumber: 'INV-4092',
        amount: '8,500.00',
        dueDate: '30 Aug 2026',
        customerName: recipient.name,
      };
    } else if (event === 'LOW_STOCK') {
      data = {
        ...data,
        itemName: businessType === 'MEDICAL' ? 'Amoxicillin 500mg' : 'Premium Filter Coffee Beans',
        stockRemaining: '3',
        unit: 'packs',
        sku: 'SKU-0982',
      };
    } else if (event === 'PURCHASE_RECEIVED') {
      data = {
        ...data,
        purchaseOrderNo: 'PO-8841',
        supplierName: 'Metro Distributors Pvt Ltd',
        itemCount: '15',
        totalAmount: '45,000',
      };
    } else if (event === 'CUSTOMER_CREATED') {
      data = {
        ...data,
        customerName: recipient.name,
        loyaltyPoints: '250',
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
    }, 200);
  };

  const getChannelBadge = (channel: NotificationChannel) => {
    switch (channel) {
      case 'WHATSAPP':
        return (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1 font-mono">
            <MessageSquare className="w-2.5 h-2.5" /> WA
          </span>
        );
      case 'SMS':
        return (
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[9px] font-bold flex items-center gap-1 font-mono">
            <Smartphone className="w-2.5 h-2.5" /> SMS
          </span>
        );
      case 'EMAIL':
        return (
          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[9px] font-bold flex items-center gap-1 font-mono">
            <Mail className="w-2.5 h-2.5" /> Email
          </span>
        );
      case 'PUSH':
        return (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1 font-mono">
            <Radio className="w-2.5 h-2.5" /> Push
          </span>
        );
      case 'IN_APP':
        return (
          <span className="px-1.5 py-0.5 rounded bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[9px] font-bold flex items-center gap-1 font-mono">
            <Bell className="w-2.5 h-2.5" /> App
          </span>
        );
    }
  };

  const getEventIcon = (event: NotificationEvent) => {
    switch (event) {
      case 'INVOICE_CREATED': return <Receipt className="w-4 h-4 text-emerald-400" />;
      case 'PAYMENT_DUE': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'LOW_STOCK': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'PURCHASE_RECEIVED': return <Package className="w-4 h-4 text-sky-400" />;
      case 'CUSTOMER_CREATED': return <UserPlus className="w-4 h-4 text-teal-400" />;
      case 'STAFF_PUNCHED_IN': return <Clock className="w-4 h-4 text-emerald-400" />;
      case 'STAFF_PUNCHED_OUT': return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'LEAVE_REQUESTED': return <MessageSquare className="w-4 h-4 text-[#C5A059]" />;
      case 'LEAVE_STATUS_CHANGED': return <CheckCheck className="w-4 h-4 text-purple-400" />;
    }
  };

  // Filter tab data
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'INVOICES') return n.event === 'INVOICE_CREATED' || n.event === 'PAYMENT_DUE';
    if (activeTab === 'STOCK') return n.event === 'LOW_STOCK' || n.event === 'PURCHASE_RECEIVED';
    if (activeTab === 'CUSTOMERS') return n.event === 'CUSTOMER_CREATED';
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1A1A1C] border border-[#1F1F21] transition-all"
        title="Notification Center"
      >
        <Bell className="w-5 h-5 text-gray-300 hover:text-[#C5A059] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C5A059] text-[#0A0A0B] text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-[#C5A059]/40">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#131315] border border-[#2D2D30] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 text-gray-200">
          
          {/* Header */}
          <div className="p-3.5 border-b border-[#1F1F21] bg-[#161618] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <h3 className="font-bold text-white text-xs tracking-tight">Notification Engine</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[10px] text-[#C5A059] font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={handleMarkAllAsRead}
                className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#252528]"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClearAll}
                className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-[#252528]"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex border-b border-[#1F1F21] bg-[#0A0A0B] text-[10px] font-bold">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'INVOICES', label: 'Invoices' },
              { id: 'STOCK', label: 'Stock / PO' },
              { id: 'CUSTOMERS', label: 'Clients' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-2 text-center transition-colors border-b-2",
                  activeTab === tab.id
                    ? "text-[#C5A059] border-[#C5A059] bg-[#141416]"
                    : "text-gray-400 border-transparent hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1F1F21] max-h-72">
            {filteredNotifications.map(notif => {
              const isUnread = notif.status !== 'READ';
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={cn(
                    "p-3 transition-colors cursor-pointer flex items-start gap-3 text-xs",
                    isUnread ? "bg-[#1A1A1D]/60 hover:bg-[#1A1A1D]" : "hover:bg-[#161618] opacity-75"
                  )}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-[#0A0A0B] border border-[#2D2D30] flex-shrink-0">
                    {getEventIcon(notif.event)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn("font-bold truncate text-xs", isUnread ? "text-white" : "text-gray-300")}>
                        {notif.title}
                      </p>
                      {getChannelBadge(notif.channel)}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed whitespace-pre-line">
                      {notif.body}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono pt-0.5">
                      <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="capitalize">{notif.status.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-xs">
                No notifications in this feed.
              </div>
            )}
          </div>

          {/* Test Event Dispatch Simulator Footer */}
          <div className="p-3 border-t border-[#1F1F21] bg-[#0A0A0B] space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Trigger Test Event Dispatch</span>
              <Send className="w-3 h-3 text-[#C5A059]" />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-semibold">
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('INVOICE_CREATED')}
                className="p-1.5 bg-[#141416] border border-[#2D2D30] hover:border-emerald-500/50 rounded-lg text-emerald-400 truncate"
              >
                🧾 Bill Created
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('PAYMENT_DUE')}
                className="p-1.5 bg-[#141416] border border-[#2D2D30] hover:border-amber-500/50 rounded-lg text-amber-400 truncate"
              >
                ⚠️ Pay Due
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('LOW_STOCK')}
                className="p-1.5 bg-[#141416] border border-[#2D2D30] hover:border-rose-500/50 rounded-lg text-rose-400 truncate"
              >
                🚨 Low Stock
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('PURCHASE_RECEIVED')}
                className="p-1.5 bg-[#141416] border border-[#2D2D30] hover:border-sky-500/50 rounded-lg text-sky-400 truncate"
              >
                📦 PO GRN
              </button>
              <button
                disabled={isSimulating}
                onClick={() => simulateEventDispatch('CUSTOMER_CREATED')}
                className="p-1.5 bg-[#141416] border border-[#2D2D30] hover:border-teal-500/50 rounded-lg text-teal-400 truncate col-span-2"
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
