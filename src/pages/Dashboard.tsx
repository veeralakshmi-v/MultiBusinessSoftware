import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Boxes, BarChart3, TrendingUp, TrendingDown,
  IndianRupee, Users, Calendar, Receipt, RefreshCw, ArrowUpRight, ArrowDownRight,
  Package, CheckCircle2, AlertTriangle, Printer, Layers, CreditCard, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import PrintInvoiceModal, { OrderPrintData } from '../components/PrintInvoiceModal';

interface TrendDay {
  date: string;
  count: number;
  revenue: number;
}

interface DateOrder {
  id: string;
  orderNumber: string;
  time: string;
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
  if (method === 'CASH') return 'bg-green-500/10 text-green-400 border border-green-500/30';
  if (method === 'UPI') return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
  if (method === 'CARD') return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
  if (method === 'CREDIT') return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
  return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
}

export default function Dashboard() {
  const { businessProfile } = useAuth();
  const currency = businessProfile.currencySymbol || '₹';
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const [activePrintOrder, setActivePrintOrder] = useState<OrderPrintData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchDashboard = useCallback(async (date?: string) => {
    try {
      const url = `/api/dashboard${date ? `?date=${date}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchDashboard(selectedDate);
    fetchItems();
    const interval = setInterval(() => {
      fetchDashboard(selectedDate);
      fetchItems();
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedDate, fetchDashboard, fetchItems]);

  const trend = data?.trend ?? [];
  const maxRevenue = trend.length > 0 ? Math.max(...trend.map(d => d.revenue)) : 1;
  const kpis = data?.kpis;
  const dateOrders = data?.dateOrders ?? [];

  // Low Stock Items Count
  const lowStockCount = useMemo(() => {
    return menuItems.filter(m => (m.currentStock !== undefined && m.currentStock <= (m.minStock ?? 10))).length;
  }, [menuItems]);

  // Total Items Sold Today
  const totalItemsSold = useMemo(() => {
    return dateOrders.reduce((sum, o) => sum + (o.itemCount || 1), 0);
  }, [dateOrders]);

  // Handle Print Action from Table
  const handleOpenInvoiceModal = (order: DateOrder) => {
    const printData: OrderPrintData = {
      orderNumber: order.orderNumber,
      orderType: 'TAX_INVOICE',
      createdAt: order.time ? `${selectedDate}T${order.time}` : new Date(),
      status: order.status || 'COMPLETED',
      paymentMethod: order.paymentMethod || 'CASH',
      subtotal: order.subtotal || order.total,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total,
      customer: order.customerName ? { name: order.customerName, mobile: order.customerMobile } : null,
      items: [
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
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#C5A059]" />
            <h1 className="text-xl font-bold text-white tracking-tight">{businessProfile.businessName} Dashboard</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Universal Sales Overview & Point of Sale Performance for <span className="text-white font-semibold">{businessProfile.businessName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchDashboard(selectedDate); fetchItems(); }}
            className="p-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl hover:border-[#C5A059] text-gray-400 hover:text-[#C5A059] transition-colors"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/billing')}
            className="px-4 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#DFBA73] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg shadow-[#C5A059]/20 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open POS Billing</span>
          </button>
        </div>
      </div>

      {/* Universal KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-[#C5A059]/50 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <IndianRupee className="w-5 h-5" />
            </div>
            {kpis && (
              <span className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full font-mono",
                kpis.revenueChange >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              )}>
                {kpis.revenueChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpis.revenueChange).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-400 font-medium">Today's Total Sales</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {isLoading ? '—' : `${currency}${parseFloat(kpis?.todayRevenue || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Total revenue collected today</div>
          </div>
        </div>

        {/* Total Invoices */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-[#C5A059]/50 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-400 font-medium">Bills / Invoices Processed</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {isLoading ? '—' : (kpis?.todayCount ?? 0)}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Total transactions today</div>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-[#C5A059]/50 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-400 font-medium">Average Bill Value</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {isLoading ? '—' : `${currency}${parseFloat(kpis?.todayAvgTicket || '0').toFixed(2)}`}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Average spent per customer</div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => navigate('/inventory')}
          className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-amber-500/50 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
              Inventory
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-400 font-medium">Low Stock Items</div>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
              {lowStockCount} Products
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Needs restock in inventory</div>
          </div>
        </div>
      </div>

      {/* 14-Day Sales Trend Visualizer */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C5A059]" />
              14-Day Sales Trajectory & Revenue Performance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Click any date to inspect transactions and metrics</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Date Focus:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-[#1A1A1C] border border-[#2D2D30] text-white px-3 py-1.5 rounded-xl outline-none focus:border-[#C5A059] font-mono text-xs"
            />
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-[#1F1F21] overflow-x-auto no-scrollbar">
          {trend.map((d, idx) => {
            const heightPct = Math.max(8, Math.round((d.revenue / maxRevenue) * 100));
            const isSelected = d.date === selectedDate;
            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(d.date)}
                className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="text-[9px] text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {currency}{Math.round(d.revenue / 1000)}k
                </div>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    isSelected ? "bg-[#C5A059] shadow-lg shadow-[#C5A059]/30" : "bg-[#222226] group-hover:bg-[#333338]"
                  )}
                />
                <span className={cn("text-[10px] font-mono", isSelected ? "text-[#C5A059] font-bold" : "text-gray-500")}>
                  {formatDate(d.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders & Invoices Table */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#C5A059]" />
              Recent Bills & Transactions Ledger
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Orders on {selectedDate} ({dateOrders.length} bills recorded)</p>
          </div>
          <button onClick={() => navigate('/reports')} className="text-xs text-[#C5A059] hover:underline font-bold">
            Full Sales Report →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161618] text-gray-400 font-bold uppercase text-[10px] border-b border-[#1F1F21]">
              <tr>
                <th className="p-3">Invoice / Bill No</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Time</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {dateOrders.slice(0, 10).map(order => (
                <tr key={order.id} className="hover:bg-[#161618] transition-colors">
                  <td className="p-3 font-mono font-bold text-white">{order.orderNumber}</td>
                  <td className="p-3 text-gray-300 font-medium">{order.customerName || 'Walk-in Customer'}</td>
                  <td className="p-3 text-gray-500 font-mono">{order.time || '12:00 PM'}</td>
                  <td className="p-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold font-mono", paymentBadgeClass(order.paymentMethod))}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-white">{currency}{order.total.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                      {order.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenInvoiceModal(order)}
                      className="px-3 py-1 bg-[#1A1A1C] hover:bg-[#252528] text-[#C5A059] border border-[#2D2D30] rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {dateOrders.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-xs">
              No bills recorded for {selectedDate}. Click "Open POS Billing" to start creating invoices!
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
