import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Boxes, BarChart3, TrendingUp,
  IndianRupee, Receipt, RefreshCw, ArrowUpRight, ArrowDownRight,
  Printer, Sparkles, MessageSquare, Phone, Mail, Globe, CheckCircle2, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { cleanPhone } from '../utils/validation';
import { WebsiteInquiry } from '../types/website';
import PrintInvoiceModal, { OrderPrintData } from '../components/PrintInvoiceModal';
import { TenantEngine } from '../lib/tenant/tenantEngine';

interface TrendDay {
  date: string;
  count: number;
  revenue: number;
}

interface DateOrder {
  id: string;
  orderNumber: string;
  time: string;
  formattedDateTime?: string;
  dateStr?: string;
  customerName: string;
  customerMobile: string;
  orderType: string;
  paymentMethod: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  createdAt?: string;
  rawOrder?: any;
}

interface DashboardData {
  kpis: {
    todayRevenue: string;
    todayCount: number;
    todayAvgTicket: string;
    totalCustomers: number;
    revenueChange: number;
  };
  trend: TrendDay[];
  dateOrders: DateOrder[];
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function paymentBadgeClass(method: string) {
  if (method === 'CASH') return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
  if (method === 'UPI') return 'bg-blue-50 text-blue-700 border border-blue-200/60';
  if (method === 'CARD') return 'bg-purple-50 text-purple-700 border border-purple-200/60';
  if (method === 'CREDIT') return 'bg-amber-50 text-amber-700 border border-amber-200/60';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
}

export default function Dashboard() {
  const { businessProfile, activeTenant, user } = useAuth();
  const allTenants = TenantEngine.getTenants();
  const effectiveTenant = activeTenant || TenantEngine.getTenantById(user?.businessId || localStorage.getItem('businessId') || '') || (allTenants.length > 0 ? allTenants[0] : null);
  const currentBusinessId = effectiveTenant?.id || activeTenant?.id || user?.businessId || localStorage.getItem('businessId') || (allTenants.length > 0 ? allTenants[0].id : 'biz-default-business');
  const currentBusinessName = effectiveTenant?.businessName || (businessProfile.businessName !== 'My Business' ? businessProfile.businessName : (effectiveTenant?.businessName || 'My Business'));
  const currency = effectiveTenant?.currencySymbol || businessProfile.currencySymbol || '₹';
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [allOrders, setAllOrders] = useState<DateOrder[]>([]);
  const [ledgerTab, setLedgerTab] = useState<'recent' | 'date'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const [activePrintOrder, setActivePrintOrder] = useState<OrderPrintData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchDashboard = useCallback(async (targetDate?: string) => {
    setIsLoading(true);
    const dateToQuery = targetDate || selectedDate;
    const orderMap = new Map<string, DateOrder>();

    const normalize = (o: any): DateOrder => {
      const createdAtIso = o.createdAt
        ? (typeof o.createdAt === 'string' ? o.createdAt : new Date(o.createdAt).toISOString())
        : new Date().toISOString();
      const d = new Date(createdAtIso);
      const isValid = !isNaN(d.getTime());

      const dateStr = isValid
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        : (o.date || todayISO());

      const timeStr = isValid
        ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : (o.time || '12:00 PM');

      const formattedDateTime = isValid
        ? `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${timeStr}`
        : timeStr;

      const custName = o.customerName || o.customer?.name || 'Walk-in Customer';
      const custMobile = o.customerMobile || o.customer?.mobile || '';
      const items = Array.isArray(o.items) ? o.items : [];
      const itemCount = typeof o.itemCount === 'number' ? o.itemCount : items.length || 1;
      const total = Number(o.total || o.grandTotal || 0);
      const subtotal = Number(o.subtotal || total);
      const tax = Number(o.tax || o.totalTax || 0);
      const discount = Number(o.discount || 0);

      return {
        id: String(o.id || o.orderNumber || `ord-${Math.random()}`),
        orderNumber: String(o.orderNumber || o.invoiceNo || o.id || 'INV-001'),
        time: timeStr,
        formattedDateTime,
        dateStr,
        customerName: custName,
        customerMobile: custMobile,
        orderType: o.orderType || (o.isGst ? 'TAX_INVOICE' : 'NON_GST_BILL'),
        paymentMethod: o.paymentMethod || 'CASH',
        itemCount,
        subtotal,
        tax,
        discount,
        total,
        status: o.status || 'COMPLETED',
        createdAt: createdAtIso,
        rawOrder: o,
      };
    };

    // 1. Gather all local storage orders
    const storageKeys = [
      'universal_orders',
      `tenant_${currentBusinessId}_universal_orders`,
      'universal_gst_bills',
      'universal_nongst_bills',
    ];

    for (const key of storageKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              const norm = normalize(item);
              if (norm.orderNumber && !orderMap.has(norm.orderNumber)) {
                orderMap.set(norm.orderNumber, norm);
              }
            }
          }
        }
      } catch {}
    }

    // 2. Query /api/orders
    try {
      const res = await fetch(`/api/orders?businessId=${encodeURIComponent(currentBusinessId)}`, {
        headers: { 'x-business-id': currentBusinessId },
      });
      if (res.ok) {
        const remoteOrders = await res.json();
        if (Array.isArray(remoteOrders)) {
          for (const item of remoteOrders) {
            const norm = normalize(item);
            if (norm.orderNumber && !orderMap.has(norm.orderNumber)) {
              orderMap.set(norm.orderNumber, norm);
            }
          }
        }
      }
    } catch {}

    // 3. Query /api/dashboard
    let backendDash: any = null;
    try {
      const res = await fetch(`/api/dashboard?businessId=${encodeURIComponent(currentBusinessId)}&date=${dateToQuery}`, {
        headers: { 'x-business-id': currentBusinessId },
      });
      if (res.ok) {
        backendDash = await res.json();
        if (backendDash?.dateOrders && Array.isArray(backendDash.dateOrders)) {
          for (const item of backendDash.dateOrders) {
            const norm = normalize(item);
            if (norm.orderNumber && !orderMap.has(norm.orderNumber)) {
              orderMap.set(norm.orderNumber, norm);
            }
          }
        }
        if (backendDash?.recentOrders && Array.isArray(backendDash.recentOrders)) {
          for (const item of backendDash.recentOrders) {
            const norm = normalize(item);
            if (norm.orderNumber && !orderMap.has(norm.orderNumber)) {
              orderMap.set(norm.orderNumber, norm);
            }
          }
        }
      }
    } catch {}

    // Sort all merged orders descending (newest first)
    const mergedList = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    setAllOrders(mergedList);

    // Compute 14-day trend from all orders
    const trendMap = new Map<string, { count: number; revenue: number }>();
    const trendDays: TrendDay[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      trendMap.set(iso, { count: 0, revenue: 0 });
    }

    for (const ord of mergedList) {
      if (ord.dateStr && trendMap.has(ord.dateStr) && ord.status !== 'CANCELLED') {
        const curr = trendMap.get(ord.dateStr)!;
        curr.count += 1;
        curr.revenue += ord.total;
      }
    }

    trendMap.forEach((val, date) => {
      trendDays.push({ date, count: val.count, revenue: val.revenue });
    });

    // Orders for today and selected date
    const today = todayISO();
    const todayList = mergedList.filter(o => o.dateStr === today && o.status !== 'CANCELLED');
    const todayRev = todayList.reduce((sum, o) => sum + o.total, 0);
    const todayCount = todayList.length;
    const todayAvg = todayCount > 0 ? (todayRev / todayCount).toFixed(2) : '0.00';

    const dateList = mergedList.filter(o => o.dateStr === dateToQuery);

    setData({
      kpis: {
        todayRevenue: todayRev.toFixed(2),
        todayCount: todayCount,
        todayAvgTicket: todayAvg,
        totalCustomers: backendDash?.kpis?.totalCustomers ?? new Set(mergedList.map(o => o.customerMobile || o.customerName)).size,
        revenueChange: backendDash?.kpis?.revenueChange ?? 0,
      },
      trend: trendDays,
      dateOrders: dateList,
    });

    setIsLoading(false);
  }, [currentBusinessId, selectedDate]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/menu-items');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMenuItems(data);
      }
    } catch (e) {
      setMenuItems([]);
    }
  }, []);

  const [inquiries, setInquiries] = useState<WebsiteInquiry[]>([]);

  const loadInquiries = useCallback(() => {
    try {
      const saved = localStorage.getItem('universal_website_inquiries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setInquiries(parsed);
      }
    } catch {}

    fetch('/api/inquiries')
      .then(r => r.json())
      .then(json => {
        if (json?.data && Array.isArray(json.data)) {
          setInquiries(json.data);
          localStorage.setItem('universal_website_inquiries', JSON.stringify(json.data));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboard(selectedDate);
    fetchItems();
    loadInquiries();

    const handleSync = () => {
      fetchDashboard(selectedDate);
      loadInquiries();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('universal_order_created', handleSync);
    window.addEventListener('website_inquiry_added', handleSync);

    const interval = setInterval(() => {
      fetchDashboard(selectedDate);
      fetchItems();
      loadInquiries();
    }, 45000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('universal_order_created', handleSync);
      window.removeEventListener('website_inquiry_added', handleSync);
    };
  }, [selectedDate, fetchDashboard, fetchItems, loadInquiries]);

  const displayTrend = useMemo(() => {
    if (data?.trend && data.trend.length > 0) {
      return data.trend;
    }
    const days: TrendDay[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: iso, count: 0, revenue: 0 });
    }
    return days;
  }, [data?.trend]);

  const maxRevenue = useMemo(() => {
    const max = Math.max(0, ...displayTrend.map(d => Number(d.revenue) || 0));
    return max > 0 ? max : 1000;
  }, [displayTrend]);

  const kpis = data?.kpis;
  const dateOrders = data?.dateOrders ?? [];

  const displayedOrders = useMemo(() => {
    if (ledgerTab === 'recent') {
      return allOrders.slice(0, 25);
    }
    return dateOrders;
  }, [ledgerTab, allOrders, dateOrders]);

  // Low Stock Items Count
  const lowStockCount = useMemo(() => {
    return menuItems.filter(m => (m.currentStock !== undefined && m.currentStock <= (m.minStock ?? 10))).length;
  }, [menuItems]);

  // Handle Print Action from Table
  const handleOpenInvoiceModal = (order: DateOrder) => {
    const rawItems = order.rawOrder?.items;
    const printData: OrderPrintData = {
      orderNumber: order.orderNumber,
      orderType: order.orderType || 'TAX_INVOICE',
      createdAt: order.createdAt ? new Date(order.createdAt) : (order.time ? `${selectedDate}T${order.time}` : new Date()),
      status: order.status || 'COMPLETED',
      paymentMethod: order.paymentMethod || 'CASH',
      subtotal: order.subtotal || order.total,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total,
      customer: order.customerName ? { name: order.customerName, mobile: order.customerMobile } : null,
      items: Array.isArray(rawItems) && rawItems.length > 0 ? rawItems.map((it: any) => ({
        quantity: it.quantity || 1,
        price: it.price || it.menuItem?.price || (order.total / rawItems.length),
        menuItem: {
          name: it.name || it.menuItem?.name || 'Item Order Line',
          gst: it.gst ?? (it.menuItem?.gst ?? 5),
        }
      })) : [
        {
          quantity: order.itemCount || 1,
          price: order.total / (order.itemCount || 1),
          menuItem: { name: 'Item Order Line', gst: 5 }
        }
      ]
    };
    setActivePrintOrder(printData);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-8 min-w-0">
      
      {/* ── TOP HEADER GLASS CARD ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-white/60 p-5 sm:p-6 rounded-3xl shadow-lg shadow-gray-200/50">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0"
              style={{
                backgroundColor: 'var(--theme-primary-bg)',
                color: 'var(--theme-text-accent)'
              }}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#0F172A] tracking-tight truncate">
              {currentBusinessName} Dashboard
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed truncate">
            Universal Sales Overview & POS Performance for <span className="text-[#0F172A] font-bold">{currentBusinessName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-shrink-0">
          <button
            onClick={() => { fetchDashboard(selectedDate); fetchItems(); }}
            className="p-3 bg-white border border-gray-200/80 rounded-2xl hover:bg-gray-50 text-gray-600 hover:text-[#2563EB] shadow-xs transition-all flex-shrink-0 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="flex-1 sm:flex-none justify-center px-5 py-3 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 btn-theme-secondary"
            style={{
              backgroundColor: 'var(--theme-btn-secondary)',
              color: 'var(--theme-btn-text)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open POS Billing</span>
          </button>
        </div>
      </div>

      {/* ── KPI GLASS CARDS ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div 
          onClick={() => navigate('/dashboard/reports')}
          className="bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl hover:shadow-xl transition-all duration-200 cursor-pointer group shadow-lg shadow-gray-200/50 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs"
              style={{
                backgroundColor: 'var(--theme-primary-bg)',
                color: 'var(--theme-text-accent)'
              }}
            >
              <IndianRupee className="w-5 h-5" />
            </div>
            {kpis && (
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ml-2 border",
                kpis.revenueChange >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
              )}>
                {kpis.revenueChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(kpis.revenueChange).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 font-medium truncate">Today's Total Sales</div>
            <div className="text-2xl font-bold text-[#0F172A] mt-1 font-mono truncate">
              {isLoading ? '—' : `${currency}${parseFloat(kpis?.todayRevenue || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </div>
            <div className="text-[11px] text-gray-400 mt-1 truncate">Total revenue collected today</div>
          </div>
        </div>

        {/* Total Invoices */}
        <div 
          onClick={() => navigate('/dashboard/reports')}
          className="bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl hover:shadow-xl transition-all duration-200 cursor-pointer group shadow-lg shadow-gray-200/50 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 font-medium truncate">Bills / Invoices Processed</div>
            <div className="text-2xl font-bold text-[#0F172A] mt-1 font-mono">
              {isLoading ? '—' : (kpis?.todayCount ?? 0)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1 truncate">Total transactions today</div>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div 
          onClick={() => navigate('/dashboard/reports')}
          className="bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl hover:shadow-xl transition-all duration-200 cursor-pointer group shadow-lg shadow-gray-200/50 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 font-medium truncate">Average Bill Value</div>
            <div className="text-2xl font-bold text-[#0F172A] mt-1 font-mono truncate">
              {isLoading ? '—' : `${currency}${parseFloat(kpis?.todayAvgTicket || '0').toFixed(2)}`}
            </div>
            <div className="text-[11px] text-gray-400 mt-1 truncate">Average spent per customer</div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => navigate('/dashboard/inventory')}
          className="bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl hover:shadow-xl transition-all duration-200 cursor-pointer group shadow-lg shadow-gray-200/50 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
              Inventory
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 font-medium truncate">Low Stock Items</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
              {lowStockCount} Products
            </div>
            <div className="text-[11px] text-gray-400 mt-1 truncate">Needs restock in inventory</div>
          </div>
        </div>
      </div>

      {/* ── 14-DAY SALES TREND VISUALIZER GLASS CARD ── */}
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 sm:p-6 shadow-lg shadow-gray-200/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--theme-text-accent)' }} />
              <span>14-Day Sales Trajectory & Revenue Performance</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Click any date to inspect transactions and metrics</p>
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-gray-500 text-xs flex-shrink-0 font-medium">Date Focus:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-[#0F172A] px-3.5 py-1.5 rounded-xl outline-none focus:border-[#2563EB] font-mono text-xs w-full sm:w-auto shadow-2xs font-semibold"
            />
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="h-48 sm:h-52 flex items-stretch gap-1.5 sm:gap-2.5 pt-4 pb-2 border-b border-gray-100 overflow-x-auto no-scrollbar touch-pan-x">
          {displayTrend.map((d, idx) => {
            const rev = Number(d.revenue) || 0;
            const hasSales = rev > 0;
            const heightPct = hasSales ? Math.min(100, Math.max(12, Math.round((rev / maxRevenue) * 100))) : 8;
            const isSelected = d.date === selectedDate;
            const isToday = d.date === todayISO();

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDate(d.date);
                  setLedgerTab('date');
                }}
                className="flex-1 min-w-[38px] sm:min-w-[46px] h-full flex flex-col justify-end items-center group cursor-pointer select-none"
                title={`${formatDate(d.date)}: ${currency}${rev.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${d.count || 0} bills)`}
              >
                {/* Revenue Tag on Hover or Selected */}
                <div className={cn(
                  "text-[9px] font-mono transition-all mb-1.5 px-1 py-0.5 rounded text-center whitespace-nowrap",
                  isSelected
                    ? "text-[#2563EB] font-bold opacity-100 bg-blue-50 border border-blue-200/60 shadow-xs"
                    : "text-gray-500 opacity-0 group-hover:opacity-100 bg-gray-50 border border-gray-200/60"
                )}>
                  {hasSales ? (rev >= 1000 ? `${currency}${(rev / 1000).toFixed(1)}k` : `${currency}${Math.round(rev)}`) : '₹0'}
                </div>

                {/* Bar Track & Fill */}
                <div className="w-full flex-1 flex items-end justify-center px-1">
                  <div className="w-full max-w-[28px] h-full flex items-end justify-center rounded-t-xl bg-gray-100/70 relative overflow-hidden group-hover:bg-black/5 transition-colors">
                    <div
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: isSelected ? 'var(--theme-btn-secondary)' : hasSales ? 'var(--theme-text-accent)' : undefined,
                        boxShadow: isSelected ? 'var(--theme-glow)' : 'none'
                      }}
                      className={cn(
                        "w-full rounded-t-xl transition-all duration-300",
                        isSelected || hasSales ? "" : "bg-gray-300/80 group-hover:bg-gray-400"
                      )}
                    />
                  </div>
                </div>

                {/* Date Label */}
                <div className="mt-2 flex flex-col items-center">
                  <span className={cn(
                    "text-[10px] font-mono whitespace-nowrap leading-tight transition-colors",
                    isSelected ? "text-[#2563EB] font-extrabold" : "text-gray-500 group-hover:text-gray-900"
                  )}>
                    {formatDate(d.date)}
                  </span>
                  {isToday && (
                    <span className="text-[8px] font-bold text-[#2563EB] uppercase tracking-tighter">Today</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WEBSITE DIRECT INQUIRIES & LEADS CARD ── */}
      {inquiries.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 sm:p-6 shadow-lg shadow-gray-200/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#0F172A] text-base">
                    Website Inquiries & Customer Leads
                  </h3>
                  {inquiries.filter(i => i.status === 'NEW').length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                      {inquiries.filter(i => i.status === 'NEW').length} NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Direct contact submissions from your public website</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/website')}
              className="text-xs hover:underline font-bold inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              style={{ color: 'var(--theme-text-accent)' }}
            >
              <span>Manage in Website CMS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inquiries.slice(0, 6).map(inq => (
              <div
                key={inq.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs hover:border-blue-200 transition-all flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-gray-900 truncate">{inq.name}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                      inq.status === 'NEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      inq.status === 'CONTACTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      inq.status === 'CONVERTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    )}>
                      {inq.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-1">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span className="font-mono font-medium">{inq.phone}</span>
                  </div>

                  {inq.offeringName && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-bold truncate max-w-full">
                      {inq.offeringName}
                    </span>
                  )}

                  {inq.notes && (
                    <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 italic">
                      "{inq.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>

                  <a
                    href={`https://wa.me/91${cleanPhone(inq.phone)}?text=${encodeURIComponent(`Hello ${inq.name}, thank you for contacting ${businessProfile.businessName || 'our team'}!`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECENT TRANSACTIONS LEDGER GLASS CARD ── */}
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 sm:p-6 shadow-lg shadow-gray-200/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--theme-text-accent)' }} />
              <h3 className="font-bold text-[#0F172A] text-base">
                Recent Bills & Transactions Ledger
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {ledgerTab === 'recent'
                ? `Displaying latest ${displayedOrders.length} transactions recorded across all dates (${allOrders.length} total recorded)`
                : `Orders on ${selectedDate} (${dateOrders.length} bills recorded)`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Filter Switch: All Recent vs Selected Date */}
            <div className="flex items-center bg-gray-100/90 p-1 rounded-2xl border border-gray-200/80 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setLedgerTab('recent')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer",
                  ledgerTab === 'recent'
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                All Recent Bills ({allOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setLedgerTab('date')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer",
                  ledgerTab === 'date'
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {selectedDate === todayISO() ? 'Today' : selectedDate} ({dateOrders.length})
              </button>
            </div>

            <button
              onClick={() => navigate('/dashboard/reports')}
              className="text-xs hover:underline font-bold px-2 py-1.5 self-center cursor-pointer"
              style={{ color: 'var(--theme-text-accent)' }}
            >
              Full Sales Report →
            </button>
          </div>
        </div>

        {/* Mobile View: Stacked Cards (visible below 640px) */}
        <div className="block sm:hidden space-y-3">
          {displayedOrders.slice(0, 15).map(order => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#0F172A] text-xs">{order.orderNumber}</span>
                <span className="font-mono font-bold text-[#2563EB] text-sm">{currency}{order.total.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-medium truncate max-w-[160px]">{order.customerName || 'Walk-in Customer'}</span>
                <span className="text-gray-500 font-mono text-[11px]">{order.formattedDateTime || order.time || '12:00 PM'}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono", paymentBadgeClass(order.paymentMethod))}>
                    {order.paymentMethod}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {order.status || 'COMPLETED'}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenInvoiceModal(order)}
                  className="px-3 py-1 border rounded-xl text-[10px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-primary-bg)',
                    color: 'var(--theme-text-accent)',
                    borderColor: 'var(--theme-border-tint)'
                  }}
                >
                  <Printer className="w-3 h-3" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          ))}

          {displayedOrders.length === 0 && (
            <div className="py-8 text-center space-y-2 text-xs">
              <p className="text-gray-400 font-medium">
                {ledgerTab === 'date'
                  ? `No bills recorded for ${selectedDate}.`
                  : 'No bills recorded yet. Click "Open POS Billing" to start creating invoices!'}
              </p>
              {ledgerTab === 'date' && allOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLedgerTab('recent')}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--theme-primary-bg)',
                    color: 'var(--theme-text-accent)',
                    borderColor: 'var(--theme-border-tint)',
                  }}
                >
                  <span>Show all {allOrders.length} recent bills</span>
                  <span>→</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tablet & Desktop View: Table (visible 640px and up) */}
        <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100/80 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-100">
              <tr>
                <th className="p-3.5">Invoice / Bill No</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white/60">
              {displayedOrders.slice(0, 20).map(order => (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#0F172A]">{order.orderNumber}</td>
                  <td className="p-3.5 text-gray-700 font-medium">{order.customerName || 'Walk-in Customer'}</td>
                  <td className="p-3.5 text-gray-600 font-mono">{order.formattedDateTime || order.time || '12:00 PM'}</td>
                  <td className="p-3.5">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono", paymentBadgeClass(order.paymentMethod))}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#0F172A]">{currency}{order.total.toFixed(2)}</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenInvoiceModal(order)}
                      className="px-3 py-1 border rounded-xl text-[10px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                      style={{
                        backgroundColor: 'var(--theme-primary-bg)',
                        color: 'var(--theme-text-accent)',
                        borderColor: 'var(--theme-border-tint)'
                      }}
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayedOrders.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <p className="text-gray-400 text-xs font-medium">
                {ledgerTab === 'date'
                  ? `No bills recorded for ${selectedDate}.`
                  : 'No bills recorded yet. Click "Open POS Billing" to start creating invoices!'}
              </p>
              {ledgerTab === 'date' && allOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLedgerTab('recent')}
                  className="px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--theme-primary-bg)',
                    color: 'var(--theme-text-accent)',
                    borderColor: 'var(--theme-border-tint)',
                  }}
                >
                  <span>View all {allOrders.length} recently entered bills</span>
                  <span>→</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Universal Print Invoice Modal */}
      <PrintInvoiceModal
        order={activePrintOrder}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
