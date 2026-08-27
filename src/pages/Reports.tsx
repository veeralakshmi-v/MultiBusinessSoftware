import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, Download, Calendar, Search, RefreshCw, 
  BarChart3, TrendingUp, IndianRupee, PieChart,
  ShoppingBag, Receipt, Package, CheckCircle2,
  ChevronLeft, ChevronRight, Layers, FileSpreadsheet, Plus, Sparkles, Trash2, Printer, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
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
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (e) {
      console.error('Failed to load orders for reports', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtered Orders according to Date Range and Search Query
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = (o.createdAt || '').slice(0, 10);
      const matchDate = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerMobile && o.customerMobile.includes(q)) ||
        (o.paymentMethod && o.paymentMethod.toLowerCase().includes(q));

      return matchDate && matchSearch;
    });
  }, [orders, startDate, endDate, searchQuery]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalGross = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalTax = filteredOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
    const totalDiscount = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalSubtotal = filteredOrders.reduce((sum, o) => sum + (o.subtotal || o.total), 0);
    const count = filteredOrders.length;
    const avgTicket = count > 0 ? totalGross / count : 0;

    // Payment breakdown
    const paymentMap: Record<string, { total: number; count: number }> = {
      CASH: { total: 0, count: 0 },
      UPI: { total: 0, count: 0 },
      CARD: { total: 0, count: 0 },
      CREDIT: { total: 0, count: 0 },
    };

    filteredOrders.forEach(o => {
      const pm = (o.paymentMethod || 'CASH').toUpperCase();
      if (!paymentMap[pm]) paymentMap[pm] = { total: 0, count: 0 };
      paymentMap[pm].total += o.total || 0;
      paymentMap[pm].count += 1;
    });

    return {
      totalGross,
      totalTax,
      totalDiscount,
      totalSubtotal,
      count,
      avgTicket,
      paymentMap,
    };
  }, [filteredOrders]);

  // Item-wise Aggregation
  const itemWiseReport = useMemo(() => {
    const itemMap: Record<string, { name: string; category: string; qty: number; total: number }> = {};

    filteredOrders.forEach(o => {
      if (Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach(it => {
          const itemName = it.name || (it as any).menuItem?.name || 'General Product';
          const cat = (it as any).category || (it as any).menuItem?.category?.name || 'General';
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
      const cat = it.category || 'General';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#C5A059]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Sales & Revenue Reports</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Complete business sales analytics, invoice register, and item & category performance breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl hover:border-[#C5A059] text-gray-400 hover:text-[#C5A059] transition-colors"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#1A1A1C] hover:bg-[#252528] text-white border border-[#2D2D30] rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#C5A059]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-[#DFBA73] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg shadow-[#C5A059]/20 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Range & Search Filter Bar */}
      <div className="bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Date Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                dateRangePreset === p.id
                  ? "bg-[#C5A059] text-[#0A0A0B] shadow-md shadow-[#C5A059]/20"
                  : "bg-[#1A1A1C] text-gray-400 hover:text-white border border-[#262629]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setDateRangePreset('CUSTOM'); }}
            className="bg-[#1A1A1C] border border-[#2D2D30] text-white px-2.5 py-1.5 rounded-xl outline-none focus:border-[#C5A059] font-mono text-xs"
          />
          <span className="text-gray-400">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setDateRangePreset('CUSTOM'); }}
            className="bg-[#1A1A1C] border border-[#2D2D30] text-white px-2.5 py-1.5 rounded-xl outline-none focus:border-[#C5A059] font-mono text-xs"
          />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl shadow-md">
          <div className="text-[11px] text-gray-400 font-medium">Total Gross Sales</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {currency}{summaryMetrics.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">{summaryMetrics.count} Total Invoices</div>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl shadow-md">
          <div className="text-[11px] text-gray-400 font-medium">Tax Collected</div>
          <div className="text-2xl font-bold text-[#C5A059] mt-1 font-mono">
            {currency}{summaryMetrics.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">GST / VAT amount</div>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl shadow-md">
          <div className="text-[11px] text-gray-400 font-medium">Total Discounts</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {currency}{summaryMetrics.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Bill & item discounts</div>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl shadow-md">
          <div className="text-[11px] text-gray-400 font-medium">Avg Ticket Size</div>
          <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">
            {currency}{summaryMetrics.avgTicket.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Average spend per bill</div>
        </div>
      </div>

      {/* Navigation Report Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F1F21] pb-2">
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
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === t.id
                ? "bg-[#C5A059] text-[#0A0A0B] shadow-md shadow-[#C5A059]/20"
                : "bg-[#131315] text-gray-400 hover:text-white border border-[#1F1F21]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SUMMARY & PAYMENTS */}
      {activeTab === 'SUMMARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Breakdown */}
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Payment Methods Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(summaryMetrics.paymentMap).map(([mode, val]) => {
                const pct = summaryMetrics.totalGross > 0 ? (val.total / summaryMetrics.totalGross) * 100 : 0;
                return (
                  <div key={mode} className="bg-[#1A1A1C] border border-[#262629] p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{mode}</span>
                      <span className="font-mono font-bold text-[#C5A059]">
                        {currency}{val.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({val.count} bills)
                      </span>
                    </div>
                    <div className="w-full bg-[#131315] rounded-full h-2 overflow-hidden">
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
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Top Selling Products</h3>
            <div className="divide-y divide-[#1F1F21]">
              {itemWiseReport.slice(0, 5).map((it, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{it.name}</div>
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

      {/* TAB 2: DETAILED INVOICES LEDGER */}
      {activeTab === 'INVOICES' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#1F1F21] flex items-center justify-between">
            <span className="font-bold text-white text-xs">All Bills & Invoices ({filteredOrders.length})</span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161618] text-gray-400 font-bold uppercase text-[10px] border-b border-[#1F1F21]">
                <tr>
                  <th className="p-3.5">Invoice No</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                  <th className="p-3.5 text-right">Tax</th>
                  <th className="p-3.5 text-right">Discount</th>
                  <th className="p-3.5 text-right">Grand Total</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#18181A] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">{order.orderNumber}</td>
                    <td className="p-3.5 text-gray-400 font-mono">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{order.customerName || 'Walk-in Customer'}</div>
                      {order.customerMobile && <div className="text-[10px] text-gray-500 font-mono">{order.customerMobile}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#1A1A1C] border border-[#2D2D30] text-gray-300">
                        {order.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-gray-400">
                      {currency}{(order.subtotal || order.total).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-gray-400">
                      {currency}{(order.tax || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-amber-400">
                      -{currency}{(order.discount || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                      {currency}{order.total.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="px-2.5 py-1 bg-[#1A1A1C] hover:bg-[#252528] text-[#C5A059] border border-[#2D2D30] rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
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
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161618] text-gray-400 font-bold uppercase text-[10px] border-b border-[#1F1F21]">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Units Sold</th>
                  <th className="p-3.5 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {itemWiseReport.map((it, idx) => (
                  <tr key={idx} className="hover:bg-[#18181A] transition-colors">
                    <td className="p-3.5 font-bold text-white">{it.name}</td>
                    <td className="p-3.5 text-gray-400">{it.category}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-[#C5A059]">{it.qty}</td>
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
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161618] text-gray-400 font-bold uppercase text-[10px] border-b border-[#1F1F21]">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5 text-center">Total Units</th>
                  <th className="p-3.5 text-right">Total Sales Value</th>
                  <th className="p-3.5 text-right">% Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {categoryWiseReport.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-[#18181A] transition-colors">
                    <td className="p-3.5 font-bold text-white">{cat.category}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-[#C5A059]">{cat.qty}</td>
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
