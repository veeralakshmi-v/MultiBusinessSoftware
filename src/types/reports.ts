export type ReportFieldType = 'string' | 'number' | 'date' | 'currency' | 'badge';

export interface ReportFieldDef {
  id: string;
  label: string;
  category: 'Order Info' | 'Financials' | 'Customer & Staff' | 'Industry Metadata';
  type: ReportFieldType;
}

export interface ReportFilterConfig {
  datePreset?: 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  orderType?: string;
  paymentMethod?: string;
  status?: string;
  category?: string;
  minAmount?: number;
  customerQuery?: string;
}

export type ReportGroupBy = 'NONE' | 'DATE' | 'CATEGORY' | 'PAYMENT_METHOD' | 'ORDER_TYPE' | 'STATUS' | 'CUSTOMER';
export type ReportChartType = 'NONE' | 'BAR' | 'LINE' | 'PIE';

export interface CustomReportDefinition {
  id: string;
  name: string;
  description?: string;
  category: string;
  columns: string[];
  filters: ReportFilterConfig;
  groupBy: ReportGroupBy;
  chartType: ReportChartType;
  isSystemTemplate?: boolean;
  businessType?: string;
  createdAt?: string;
}
