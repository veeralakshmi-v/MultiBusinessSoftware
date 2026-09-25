import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, Download, Calendar, Search, RefreshCw, 
  BarChart3, TrendingUp, IndianRupee, PieChart,
  ShoppingBag, Receipt, Package, CheckCircle2,
  ChevronLeft, ChevronRight, Layers, FileSpreadsheet, Plus, Sparkles, Trash2, Printer, SlidersHorizontal,
  Clock, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn, getCategoryName } from '../lib/utils';
import PrintInvoiceModal, { OrderPrintData } from '../components/PrintInvoiceModal';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName?: string;
  customerMobile?: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  items?: OrderItem[];
}

export default function Reports() {
  const { businessProfile } = useAuth();
  const currency = businessProfile.currencySymbol || '₹';

  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'INVOICES' | 'ITEMS' | 'CATEGORIES'>('SUMMARY');
  const [billTypeFilter, setBillTypeFilter] = useState<'ALL' | 'GST' | 'NON_GST'>('ALL');
  const [dateRangePreset, setDateRangePreset] = useState<string>('THIS_MONTH');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activePrintOrder, setActivePrintOrder] = useState<OrderPrintData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Initialize date range based on preset
  useEffect(() => {
    const today = new Date();
    const formatYMD = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let start = new Date();
    let end = new Date();

    if (dateRangePreset === 'TODAY') {
      start = today;
      end = today;
    } else if (dateRangePreset === 'YESTERDAY') {
      start = new Date(today.getTime() - 86400000);
      end = new Date(today.getTime() - 86400000);
    } else if (dateRangePreset === 'LAST_7') {
      start = new Date(today.getTime() - 6 * 86400000);
      end = today;
    } else if (dateRangePreset === 'THIS_MONTH') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
    } else if (dateRangePreset === 'LAST_MONTH') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    setStartDate(formatYMD(start));
    setEndDate(formatYMD(end));
  }, [dateRangePreset]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    let loaded: Order[] = [];

    try {
      const savedAll = localStorage.getItem('universal_orders');
      if (savedAll) {
        const parsed = JSON.parse(savedAll);
        if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
      }
    } catch {}

    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const ids = new Set(loaded.map(o => o.id));
          data.forEach(d => { if (!ids.has(d.id)) loaded.push(d); });
        }
      }
    } catch (e) {
    } finally {
      setOrders(loaded);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtered Orders according to Date Range, Bill Type, and Search Query
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = (o.createdAt || '').slice(0, 10);
      const matchDate = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);

      const isGstBill = (o.tax && o.tax > 0) || (o as any).isGst || (o as any).billType === 'GST';
      const matchBillType =
        billTypeFilter === 'ALL' ||
        (billTypeFilter === 'GST' && isGstBill) ||
        (billTypeFilter === 'NON_GST' && !isGstBill);

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerMobile && o.customerMobile.includes(q)) ||
        (o.paymentMethod && o.paymentMethod.toLowerCase().includes(q));

      return matchDate && matchBillType && matchSearch;
    });
  }, [orders, startDate, endDate, searchQuery, billTypeFilter]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalGross = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalTax = filteredOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
    const totalDiscount = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalSubtotal = filteredOrders.reduce((sum, o) => sum + (o.subtotal || o.total), 0);

    const totalPaid = filteredOrders.reduce((sum, o) => {
      const p = (o as any).paidAmount !== undefined 
        ? (o as any).paidAmount 
        : ((o.paymentMethod || '').toUpperCase() === 'CREDIT' ? 0 : (o.total || 0));
      return sum + p;
    }, 0);

    const totalPending = filteredOrders.reduce((sum, o) => {
      const b = (o as any).balanceAmount !== undefined 
        ? (o as any).balanceAmount 
        : ((o.paymentMethod || '').toUpperCase() === 'CREDIT' ? (o.total || 0) : 0);
      return sum + b;
    }, 0);

    const count = filteredOrders.length;
    const avgTicket = count > 0 ? totalGross / count : 0;

    const gstOrders = filteredOrders.filter(o => (o.tax && o.tax > 0) || (o as any).isGst || (o as any).billType === 'GST');
    const nonGstOrders = filteredOrders.filter(o => (!o.tax || o.tax === 0) && ((o as any).billType === 'NON_GST' || !(o as any).isGst));

    const gstGross = gstOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const gstTax = gstOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
    const nonGstGross = nonGstOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Payment breakdown
    const paymentMap: Record<string, { total: number; count: number }> = {
      CASH: { total: 0, count: 0 },
      UPI: { total: 0, count: 0 },
      CARD: { total: 0, count: 0 },
      CREDIT: { total: 0, count: 0 },
    };

    filteredOrders.forEach(o => {
      const pm = (o.paymentMethod || 'CASH').toUpperCase();
      if (pm.startsWith('SPLIT')) {
        const splitMethod = ((o as any).splitPaidMethod || 'CASH').toUpperCase();
        const paid = (o as any).paidAmount || 0;
        const bal = (o as any).balanceAmount || 0;

        if (!paymentMap[splitMethod]) paymentMap[splitMethod] = { total: 0, count: 0 };
        paymentMap[splitMethod].total += paid;
        paymentMap[splitMethod].count += 1;

        if (!paymentMap['CREDIT']) paymentMap['CREDIT'] = { total: 0, count: 0 };
        paymentMap['CREDIT'].total += bal;
        paymentMap['CREDIT'].count += 1;
      } else {
        if (!paymentMap[pm]) paymentMap[pm] = { total: 0, count: 0 };
        paymentMap[pm].total += o.total || 0;
        paymentMap[pm].count += 1;
      }
    });

    return {
      totalGross,
      totalPaid,
      totalPending,
      totalTax,
      totalDiscount,
      totalSubtotal,
      count,
      avgTicket,
      paymentMap,
      gstOrdersCount: gstOrders.length,
      gstGross,
      gstTax,
      nonGstOrdersCount: nonGstOrders.length,
      nonGstGross,
    };
  }, [filteredOrders]);

  // Item-wise Aggregation
  const itemWiseReport = useMemo(() => {
    const itemMap: Record<string, { name: string; category: string; qty: number; total: number }> = {};

    filteredOrders.forEach(o => {
      if (Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach(it => {
          const itemName = it.name || (it as any).menuItem?.name || 'General Product';
          const cat = getCategoryName((it as any).category || (it as any).categoryName || (it as any).menuItem?.category);
          if (!itemMap[itemName]) {
            itemMap[itemName] = { name: itemName, category: cat, qty: 0, total: 0 };
          }
          itemMap[itemName].qty += it.quantity || 1;
          itemMap[itemName].total += (it.price || 0) * (it.quantity || 1);
        });
      }
    });

    return Object.values(itemMap).sort((a, b) => b.total - a.total);
  }, [filteredOrders]);

  // Category-wise Aggregation
  const categoryWiseReport = useMemo(() => {
    const catMap: Record<string, { category: string; qty: number; total: number }> = {};
    const totalSales = summaryMetrics.totalGross || 1;

    itemWiseReport.forEach(it => {
      const cat = getCategoryName(it.category);
      if (!catMap[cat]) catMap[cat] = { category: cat, qty: 0, total: 0 };
      catMap[cat].qty += it.qty;
      catMap[cat].total += it.total;
    });

    return Object.values(catMap).map(c => ({
      ...c,
      sharePct: (c.total / totalSales) * 100,
    })).sort((a, b) => b.total - a.total);
  }, [itemWiseReport, summaryMetrics.totalGross]);

  // Export to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === 'INVOICES' || activeTab === 'SUMMARY') {
      headers = ['Invoice Number', 'Date', 'Customer Name', 'Mobile', 'Payment Mode', 'Subtotal', 'Tax', 'Discount', 'Total'];
      rows = filteredOrders.map(o => [
        o.orderNumber,
        o.createdAt ? o.createdAt.slice(0, 10) : '',
        o.customerName || 'Walk-in',
        o.customerMobile || '',
        o.paymentMethod || 'CASH',
        (o.subtotal || o.total).toFixed(2),
        (o.tax || 0).toFixed(2),
        (o.discount || 0).toFixed(2),
        o.total.toFixed(2),
      ]);
    } else if (activeTab === 'ITEMS') {
      headers = ['Product / Item Name', 'Category', 'Quantity Sold', 'Total Revenue'];
      rows = itemWiseReport.map(i => [
        i.name,
        i.category,
        i.qty.toString(),
        i.total.toFixed(2),
      ]);
    } else if (activeTab === 'CATEGORIES') {
      headers = ['Category', 'Units Sold', 'Total Sales Value', '% Share'];
      rows = categoryWiseReport.map(c => [
        c.category,
        c.qty.toString(),
        c.total.toFixed(2),
        c.sharePct.toFixed(1) + '%',
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${activeTab}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintOrder = (o: Order) => {
    const printData: OrderPrintData = {
      orderNumber: o.orderNumber,
      orderType: 'TAX_INVOICE',
      createdAt: o.createdAt || new Date(),
      status: o.status || 'COMPLETED',
      paymentMethod: o.paymentMethod || 'CASH',
      subtotal: o.subtotal || o.total,
      tax: o.tax || 0,
      discount: o.discount || 0,
      total: o.total,
      customer: o.customerName ? { name: o.customerName, mobile: o.customerMobile } : null,
      items: [
        {
          quantity: 1,
          price: o.total,
          menuItem: { name: 'Item Order Line', gst: 5 }
        }
      ]
    };
    setActivePrintOrder(printData);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white/80 backdrop-blur-md border border-white/60 p-5 sm:p-6 rounded-3xl shadow-lg shadow-gray-200/50">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563EB] flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">Sales & Revenue Reports</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">
            Complete business sales analytics, invoice register, and item & category performance breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
          <button
            onClick={fetchOrders}
            className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#2563EB] text-gray-400 hover:text-[#2563EB] transition-colors flex-shrink-0"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#2563EB]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 sm:px-4 py-2 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer btn-theme-secondary"
            style={{
              backgroundColor: 'var(--theme-btn-secondary)',
              color: 'var(--theme-btn-text)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Range & Search Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-gray-200/30">
        {/* Date Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0">
          {[
            { id: 'TODAY', label: 'Today' },
            { id: 'YESTERDAY', label: 'Yesterday' },
            { id: 'LAST_7', label: 'Last 7 Days' },
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'LAST_MONTH', label: 'Last Month' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setDateRangePreset(p.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer",
                dateRangePreset === p.id
                  ? "shadow-md font-extrabold btn-theme-secondary"
                  : "bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200"
              )}
              style={dateRangePreset === p.id ? {
                backgroundColor: 'var(--theme-btn-secondary)',
                color: 'var(--theme-btn-text)'
              } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setDateRangePreset('CUSTOM'); }}
              className="bg-gray-50 border border-gray-200 text-gray-900 px-2 py-1.5 rounded-xl outline-none focus:border-[#2563EB] font-mono text-xs w-28 sm:w-auto"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setDateRangePreset('CUSTOM'); }}
              className="bg-gray-50 border border-gray-200 text-gray-900 px-2 py-1.5 rounded-xl outline-none focus:border-[#2563EB] font-mono text-xs w-28 sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Gross Sales */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 flex-shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Total Gross Sales</div>
            <div className="text-xl font-bold text-gray-900 mt-1 font-mono">
              {currency}{summaryMetrics.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{summaryMetrics.count} Total Bills</div>
          </div>
        </div>

        {/* Amount Paid Collected */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-emerald-600 font-medium">Paid Collected</div>
            <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">
              {currency}{summaryMetrics.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-500 mt-0.5">Net cash / online in hand</div>
          </div>
        </div>

        {/* Pending Due Sales */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-3 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-red-500 font-semibold">Outstanding Due</div>
            <div className="text-xl font-bold text-red-600 mt-1 font-mono">
              {currency}{summaryMetrics.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-red-400 mt-0.5">Customer credit balance</div>
          </div>
        </div>

        {/* GST Bills Summary */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-indigo-600 font-semibold">GST Sales ({summaryMetrics.gstOrdersCount})</div>
            <div className="text-xl font-bold text-indigo-700 mt-1 font-mono">
              {currency}{summaryMetrics.gstGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-indigo-400 mt-0.5 font-mono">
              Tax: {currency}{summaryMetrics.gstTax.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Non-GST Bills Summary */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 flex-shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-amber-600 font-semibold">Non-GST ({summaryMetrics.nonGstOrdersCount})</div>
            <div className="text-xl font-bold text-amber-700 mt-1 font-mono">
              {currency}{summaryMetrics.nonGstGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-amber-400 mt-0.5 font-mono">
              Tax Exempt (0% GST)
            </div>
          </div>
        </div>
      </div>



      {/* Navigation Report Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'SUMMARY', label: 'Overview & Payments' },
          { id: 'INVOICES', label: 'Detailed Invoices Ledger' },
          { id: 'ITEMS', label: 'Item-wise Sales' },
          { id: 'CATEGORIES', label: 'Category-wise Sales' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === t.id
                ? "shadow-md btn-theme-secondary"
                : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200"
            )}
            style={activeTab === t.id ? {
              backgroundColor: 'var(--theme-btn-secondary)',
              color: 'var(--theme-btn-text)'
            } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SUMMARY & PAYMENTS */}
      {activeTab === 'SUMMARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Breakdown */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Payment Methods Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(summaryMetrics.paymentMap).map(([mode, val]) => {
                const pct = summaryMetrics.totalGross > 0 ? (val.total / summaryMetrics.totalGross) * 100 : 0;
                return (
                  <div key={mode} className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{mode}</span>
                      <span className="font-mono font-bold text-[#2563EB]">
                        {currency}{val.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({val.count} bills)
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="bg-[#C5A059] h-full rounded-full transition-all"
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono text-right">{pct.toFixed(1)}% of total sales</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Item Performance Highlight */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Top Selling Products</h3>
            <div className="divide-y divide-[#1F1F21]">
              {itemWiseReport.slice(0, 5).map((it, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{it.name}</div>
                    <div className="text-[10px] text-gray-500">{it.category} • {it.qty} sold</div>
                  </div>
                  <div className="font-mono font-bold text-white">
                    {currency}{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
              {itemWiseReport.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-xs">No item sales recorded in this period</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED INVOICES LEDGER WITH GST vs NON-GST COLUMNS */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white/90 border border-gray-100 rounded-2xl overflow-hidden shadow-md shadow-gray-100/50 shadow-xl space-y-3">
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            {/* GST vs Non-GST Column Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setBillTypeFilter('ALL')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  billTypeFilter === 'ALL'
                    ? "shadow btn-theme-secondary"
                    : "text-gray-500 hover:text-gray-900"
                )}
                style={billTypeFilter === 'ALL' ? {
                  backgroundColor: 'var(--theme-btn-secondary)',
                  color: 'var(--theme-btn-text)'
                } : {}}
              >
                All Bills ({orders.length})
              </button>
              <button
                onClick={() => setBillTypeFilter('GST')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1",
                  billTypeFilter === 'GST'
                    ? "bg-emerald-500 text-black shadow font-extrabold"
                    : "text-emerald-400 hover:text-emerald-300"
                )}
              >
                📄 GST Bills ({summaryMetrics.gstOrdersCount})
              </button>
              <button
                onClick={() => setBillTypeFilter('NON_GST')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1",
                  billTypeFilter === 'NON_GST'
                    ? "bg-amber-500 text-black shadow font-extrabold"
                    : "text-amber-400 hover:text-amber-300"
                )}
              >
                📝 Non-GST Bills ({summaryMetrics.nonGstOrdersCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Bill Type</th>
                  <th className="p-3.5 whitespace-nowrap">Invoice No</th>
                  <th className="p-3.5 whitespace-nowrap">Date & Time</th>
                  <th className="p-3.5 whitespace-nowrap">Customer</th>
                  <th className="p-3.5 whitespace-nowrap">Payment</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Subtotal</th>
                  <th className="p-3.5 whitespace-nowrap text-right">GST / Tax</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Discount</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Grand Total</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Paid</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Pending Due</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {filteredOrders.map(order => {
                  const isGst = (order.tax && order.tax > 0) || (order as any).isGst || (order as any).billType === 'GST';
                  const paidVal = (order as any).paidAmount !== undefined 
                    ? (order as any).paidAmount 
                    : ((order.paymentMethod || '').toUpperCase() === 'CREDIT' ? 0 : order.total);
                  const pendingVal = (order as any).balanceAmount !== undefined 
                    ? (order as any).balanceAmount 
                    : ((order.paymentMethod || '').toUpperCase() === 'CREDIT' ? order.total : 0);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border whitespace-nowrap",
                          isGst
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        )}>
                          {isGst ? '📄 GST' : '📝 Non-GST'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">{order.orderNumber}</td>
                      <td className="p-3.5 text-gray-400 font-mono whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{order.customerName || 'Walk-in Customer'}</div>
                        {order.customerMobile && <div className="text-[10px] text-gray-500 font-mono">{order.customerMobile}</div>}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-gray-50 border border-gray-200 text-gray-600 whitespace-nowrap inline-block">
                          {order.paymentMethod || 'CASH'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-gray-400 whitespace-nowrap">
                        {currency}{(order.subtotal || order.total).toFixed(2)}
                      </td>
                      <td className={cn("p-3.5 text-right font-mono font-bold whitespace-nowrap", isGst ? "text-emerald-400" : "text-gray-600 line-through")}>
                        {currency}{(order.tax || 0).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono text-amber-400 whitespace-nowrap">
                        -{currency}{(order.discount || 0).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white text-sm whitespace-nowrap">
                        {currency}{order.total.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-xs whitespace-nowrap">
                        {currency}{paidVal.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-xs whitespace-nowrap">
                        {pendingVal > 0 ? (
                          <span className="text-red-400 font-extrabold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 whitespace-nowrap">
                            {currency}{pendingVal.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500 font-normal whitespace-nowrap">₹0.00</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handlePrintOrder(order)}
                          className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-[#2563EB] border border-gray-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-xs">
                No invoices found matching selected dates or search query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ITEM-WISE SALES */}
      {activeTab === 'ITEMS' && (
        <div className="bg-white/90 border border-gray-100 rounded-2xl overflow-hidden shadow-md shadow-gray-100/50 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Units Sold</th>
                  <th className="p-3.5 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {itemWiseReport.map((it, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 font-bold text-white">{it.name}</td>
                    <td className="p-3.5 text-gray-400">{it.category}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-[#2563EB]">{it.qty}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                      {currency}{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {itemWiseReport.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-xs">
                No items sold in the selected period.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY-WISE SALES */}
      {activeTab === 'CATEGORIES' && (
        <div className="bg-white/90 border border-gray-100 rounded-2xl overflow-hidden shadow-md shadow-gray-100/50 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5 text-center">Total Units</th>
                  <th className="p-3.5 text-right">Total Sales Value</th>
                  <th className="p-3.5 text-right">% Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {categoryWiseReport.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 font-bold text-white">{cat.category}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-[#2563EB]">{cat.qty}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                      {currency}{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono text-gray-400">{cat.sharePct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categoryWiseReport.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-xs">
                No category sales recorded in this period.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Universal Print Modal */}
      <PrintInvoiceModal
        order={activePrintOrder}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
