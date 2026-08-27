import { 
  ReportFieldDef, 
  CustomReportDefinition, 
  ReportGroupBy, 
  ReportChartType 
} from '../../types/reports';
import { BusinessTemplate } from '../../types/template';
import { ColumnDef, KPIItem } from '../../utils/exportUtils';

export const AVAILABLE_REPORT_FIELDS: ReportFieldDef[] = [
  // Order Info
  { id: 'orderNumber', label: 'Invoice / Order #', category: 'Order Info', type: 'string' },
  { id: 'createdAt', label: 'Date & Time', category: 'Order Info', type: 'date' },
  { id: 'orderType', label: 'Invoice / Order Type', category: 'Order Info', type: 'badge' },
  { id: 'status', label: 'Status', category: 'Order Info', type: 'badge' },
  { id: 'paymentMethod', label: 'Payment Method', category: 'Order Info', type: 'badge' },
  { id: 'table', label: 'Table / Station', category: 'Order Info', type: 'string' },
  { id: 'itemCount', label: 'Items Count', category: 'Order Info', type: 'number' },

  // Financials
  { id: 'subtotal', label: 'Taxable Subtotal (₹)', category: 'Financials', type: 'currency' },
  { id: 'tax', label: 'GST Tax (₹)', category: 'Financials', type: 'currency' },
  { id: 'discount', label: 'Discount (₹)', category: 'Financials', type: 'currency' },
  { id: 'packingCharge', label: 'Packing Charges (₹)', category: 'Financials', type: 'currency' },
  { id: 'deliveryCharge', label: 'Delivery Charges (₹)', category: 'Financials', type: 'currency' },
  { id: 'total', label: 'Grand Total (₹)', category: 'Financials', type: 'currency' },

  // Customer & Professional
  { id: 'customerName', label: 'Customer / Client Name', category: 'Customer & Staff', type: 'string' },
  { id: 'customerMobile', label: 'Customer Mobile', category: 'Customer & Staff', type: 'string' },
  { id: 'doctorName', label: 'Prescribing Doctor', category: 'Customer & Staff', type: 'string' },
  { id: 'patientName', label: 'Patient Name', category: 'Customer & Staff', type: 'string' },

  // Industry Metadata
  { id: 'kitchenSection', label: 'Kitchen / Assembly Station', category: 'Industry Metadata', type: 'string' },
  { id: 'batchNumber', label: 'Batch Number', category: 'Industry Metadata', type: 'string' },
  { id: 'expiryDate', label: 'Expiry Date', category: 'Industry Metadata', type: 'date' },
  { id: 'serialNumber', label: 'Serial / IMEI', category: 'Industry Metadata', type: 'string' },
  { id: 'brand', label: 'Brand / Mfg', category: 'Industry Metadata', type: 'string' },
];

export class ReportEngine {
  private static STORAGE_KEY = 'multi_biz_custom_reports';

  /**
   * Executes a custom report definition on order records
   */
  static executeCustomReport(
    def: CustomReportDefinition, 
    rawOrders: any[]
  ): {
    title: string;
    columns: ColumnDef[];
    rows: Record<string, any>[];
    kpis: KPIItem[];
    chartData?: Array<{ name: string; value: number; count?: number }>;
  } {
    // 1. Filter Orders
    let filtered = rawOrders.filter(order => {
      const orderDateStr = order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : '';
      if (def.filters?.startDate && orderDateStr < def.filters.startDate) return false;
      if (def.filters?.endDate && orderDateStr > def.filters.endDate) return false;
      if (def.filters?.orderType && def.filters.orderType !== 'ALL' && order.orderType !== def.filters.orderType) return false;
      if (def.filters?.paymentMethod && def.filters.paymentMethod !== 'ALL' && order.paymentMethod !== def.filters.paymentMethod) return false;
      if (def.filters?.status && def.filters.status !== 'ALL' && order.status !== def.filters.status) return false;
      if (def.filters?.minAmount && Number(order.total) < Number(def.filters.minAmount)) return false;
      if (def.filters?.customerQuery) {
        const q = def.filters.customerQuery.toLowerCase();
        const cName = (order.customer?.name || order.customerName || '').toLowerCase();
        const cMob = (order.customer?.mobile || order.customerMobile || '').toLowerCase();
        if (!cName.includes(q) && !cMob.includes(q)) return false;
      }
      return true;
    });

    // 2. Build Column Definitions
    const activeFieldIds = def.columns.length > 0 ? def.columns : ['orderNumber', 'createdAt', 'customerName', 'total'];
    const columns: ColumnDef[] = activeFieldIds.map(fId => {
      const field = AVAILABLE_REPORT_FIELDS.find(f => f.id === fId) || {
        id: fId,
        label: fId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        type: 'string' as const,
        category: 'Order Info' as const,
      };

      return {
        key: field.id,
        header: field.label,
        align: field.type === 'currency' || field.type === 'number' ? 'right' : 'left',
        format: (val: any) => {
          if (val === null || val === undefined || val === '') return '—';
          if (field.type === 'currency') return `₹${Number(val).toFixed(2)}`;
          if (field.type === 'date') return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          return String(val);
        }
      };
    });

    let rows: Record<string, any>[] = [];
    let chartData: Array<{ name: string; value: number; count?: number }> = [];

    // 3. Handle Grouping
    if (def.groupBy && def.groupBy !== 'NONE') {
      const groups: Record<string, { groupKey: string; count: number; subtotal: number; tax: number; discount: number; total: number }> = {};

      filtered.forEach(o => {
        let key = 'Other';
        if (def.groupBy === 'DATE') {
          key = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Unknown Date';
        } else if (def.groupBy === 'PAYMENT_METHOD') {
          key = o.paymentMethod || 'CASH';
        } else if (def.groupBy === 'ORDER_TYPE') {
          key = o.orderType || 'GENERAL';
        } else if (def.groupBy === 'STATUS') {
          key = o.status || 'COMPLETED';
        } else if (def.groupBy === 'CUSTOMER') {
          key = o.customer?.name || o.customerName || 'Walk-in Customer';
        }

        if (!groups[key]) {
          groups[key] = { groupKey: key, count: 0, subtotal: 0, tax: 0, discount: 0, total: 0 };
        }
        groups[key].count += 1;
        groups[key].subtotal += (o.subtotal || 0);
        groups[key].tax += (o.tax || 0);
        groups[key].discount += (o.discount || 0);
        groups[key].total += (o.total || 0);
      });

      rows = Object.values(groups).map(g => ({
        ...g,
        orderNumber: g.groupKey,
        createdAt: g.groupKey,
        customerName: g.groupKey,
        orderType: g.groupKey,
        paymentMethod: g.groupKey,
        status: `${g.count} Orders`,
        itemCount: g.count,
      }));

      chartData = Object.values(groups).map(g => ({
        name: g.groupKey,
        value: Math.round(g.total),
        count: g.count,
      }));
    } else {
      // Flat rows
      rows = filtered.map(o => ({
        ...o,
        customerName: o.customer?.name || o.customerName || 'Walk-in',
        customerMobile: o.customer?.mobile || o.customerMobile || '',
        table: o.table?.name || o.table || '',
        itemCount: o.itemCount || (o.items ? o.items.length : 1),
      }));

      // Generate daily chart trajectory
      const dailyMap: Record<string, number> = {};
      filtered.forEach(o => {
        const dStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today';
        dailyMap[dStr] = (dailyMap[dStr] || 0) + (o.total || 0);
      });
      chartData = Object.entries(dailyMap).map(([name, value]) => ({ name, value: Math.round(value) }));
    }

    // 4. Compute KPIs
    const totalRevenue = filtered.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = filtered.length;
    const avgTicket = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    const totalTax = filtered.reduce((sum, o) => sum + (o.tax || 0), 0);

    const kpis: KPIItem[] = [
      { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, change: '+12.5%' },
      { label: 'Orders Count', value: totalOrders.toString() },
      { label: 'Avg Ticket Value', value: `₹${avgTicket.toFixed(2)}` },
      { label: 'GST Collected', value: `₹${totalTax.toFixed(2)}` },
    ];

    return {
      title: def.name,
      columns,
      rows,
      kpis,
      chartData: def.chartType !== 'NONE' ? chartData : undefined,
    };
  }

  /**
   * Resolves starter reports dynamically from template configuration
   */
  static getTemplateReports(template: BusinessTemplate): CustomReportDefinition[] {
    const rawReports = template.reports || [];
    return rawReports.map((rep, idx) => ({
      id: rep.id,
      name: rep.name,
      category: rep.category || 'General Sales',
      columns: rep.defaultColumns || ['orderNumber', 'createdAt', 'customerName', 'total'],
      filters: { datePreset: 'THIS_MONTH' },
      groupBy: 'NONE',
      chartType: idx === 0 ? 'BAR' : 'NONE',
      isSystemTemplate: true,
      businessType: template.templateId,
    }));
  }

  /**
   * Custom reports persistence (localStorage)
   */
  static getSavedReports(businessType?: string): CustomReportDefinition[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed: CustomReportDefinition[] = JSON.parse(data);
      if (businessType) {
        return parsed.filter(r => !r.businessType || r.businessType === businessType);
      }
      return parsed;
    } catch {
      return [];
    }
  }

  static saveReport(report: CustomReportDefinition): void {
    try {
      const existing = this.getSavedReports();
      const updated = [report, ...existing.filter(r => r.id !== report.id)];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom report', e);
    }
  }

  static deleteReport(reportId: string): void {
    try {
      const existing = this.getSavedReports();
      const updated = existing.filter(r => r.id !== reportId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete custom report', e);
    }
  }
}
