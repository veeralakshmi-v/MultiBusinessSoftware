export type BusinessType =
  | 'RESTAURANT'
  | 'RETAIL'
  | 'SUPERMARKET'
  | 'MEDICAL'
  | 'BAKERY'
  | 'ELECTRONICS'
  | 'HARDWARE'
  | 'GARMENTS'
  | 'JEWELLERY'
  | 'WHOLESALE'
  | 'SERVICE_CENTER'
  | 'SALON'
  | 'CUSTOM';

export type TemplateType = BusinessType;

export interface ModuleConfig {
  enableServicePoints: boolean;        // Dining Tables / Seating / Chairs / Bays
  enableFulfillmentStations: boolean;  // Kitchen KDS / Assembly Workstations / Dispensing
  enableBarcodeScanning: boolean;      // Barcode / SKU Scanner Reader
  enableBatchExpiryTracking: boolean;  // Batch No & Expiry Dates
  enableSerialIMEI: boolean;           // Serial Number / IMEI Tracking
  enableProductVariants: boolean;      // Size / Color / Dimension Matrix
  enableProductBOM: boolean;           // Recipe Ingredients / Kit Assembly BOM
  enableCustomerCreditLedger: boolean; // B2B Credit Limits & Pay Later
  enableLoyaltyProgram: boolean;       // Reward Points & Memberships
  enablePromotionsEngine: boolean;     // BOGO & Discount Rules Engine
  enableInventory: boolean;            // Inventory & Stock Tracking
  enableCrm: boolean;                  // Customer Relationship Management
  enablePromotions: boolean;           // Promotions & Coupons Management
  enableReports: boolean;              // Analytics & Audit Reports
  enableStaffManagement: boolean;      // Staff Users & PIN Auth
}

export interface MenuItemConfig {
  name: string;
  path: string;
  icon: string;
  rolesAllowed: Array<'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN_STAFF' | 'STAFF'>;
}

export interface CustomAttributeConfig {
  key: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE' | 'BOOLEAN';
  options?: string[];
  default?: any;
  placeholder?: string;
  helpText?: string;
  isRequired?: boolean;
  showInGrid?: boolean;
}

export interface ProductFieldsConfig {
  inputMode: 'TOUCH_GRID' | 'BARCODE_SCANNER' | 'SKU_LOOKUP' | 'BATCH_PICKER' | 'SERVICE_PICKER';
  visibleFields: string[];
  requiredFields: string[];
  customAttributes: CustomAttributeConfig[];
}

export interface CustomerFieldsConfig {
  visibleFields: string[];
  requiredFields: string[];
  allowCreditBilling: boolean;
  customAttributes?: CustomAttributeConfig[];
}

export interface InvoiceLayoutConfig {
  defaultFormat: '80MM_THERMAL' | '58MM_THERMAL' | 'A4_TAX_INVOICE' | 'PHARMACY_INVOICE' | 'B2B_WHOLESALE' | 'KOT_TOKEN' | 'SERVICE_JOB_SHEET';
  headerTitle: string;
  tagline?: string;
  taxLicenseLabel: string;
  visibleReceiptFields: string[];
  termsText: string;
  thankYouNote: string;
  showQrCode: boolean;
  showLogo: boolean;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  type: 'KPI_CARD' | 'BAR_CHART' | 'LINE_CHART' | 'TABLE' | 'ALERT_LIST';
  gridSpan: number;
  metricKey?: string;
}

export interface ReportConfig {
  id: string;
  category: 'Sales & Revenue' | 'Product & Inventory' | 'Collections' | 'Compliance & Audit' | 'Operations';
  name: string;
  defaultColumns: string[];
}

export interface BusinessTermsConfig {
  itemNoun: string;               // e.g. "Dish", "Product", "Medicine", "Spare Part", "Garment"
  categoryNoun: string;           // e.g. "Category", "Department", "Drug Class", "Section"
  orderNoun: string;              // e.g. "Order", "Sale", "Prescription", "Job Card", "Tax Invoice"
  invoiceTitle: string;           // e.g. "Restaurant Receipt", "Tax Invoice", "Cash Memo"
  customerNoun: string;           // e.g. "Diner", "Customer", "Patient", "Client", "Dealer"
  servicePointNoun?: string;      // e.g. "Table", "Room", "Service Bay", "Chair"
  fulfillmentNoun?: string;       // e.g. "Kitchen", "Pharmacy", "Workshop", "Packing"
}

export interface InvoiceTypeConfig {
  code: string;
  name: string;
  direction?: 'OUTWARD_SALES' | 'INWARD_PURCHASE' | 'RETURN';
  requiresServicePoint?: boolean;
  requiresCustomer?: boolean;
  requiresDoctor?: boolean;
  requiresCreditApproval?: boolean;
  defaultPaymentMethod?: string;
}

export interface DefaultCategoryConfig {
  name: string;
  description?: string;
  icon?: string;
  defaultTaxRate?: number;
}

export interface TaxRuleConfig {
  taxSystemName: string;          // e.g. 'GST', 'VAT', 'Sales Tax'
  defaultTaxRate: number;         // e.g. 5, 12, 18, 3, 0
  taxCalculationMode: 'EXCLUSIVE' | 'INCLUSIVE';
  cgstSgstSplit: boolean;
  defaultHsnCode: string;
  taxExemptAllowed: boolean;
  taxSlabs: Array<{ label: string; rate: number; hsnPrefix?: string }>;
}

import type { WorkflowConfig, WorkflowStatusStep, WorkflowColor } from './workflow';
export type { WorkflowConfig, WorkflowStatusStep, WorkflowColor };

export interface SettingsDefaultsConfig {
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number;
  taxCalculationMode: 'EXCLUSIVE' | 'INCLUSIVE';
  counterPrefix: string;
  orderPrefix: string;
  invoiceResetFrequency: 'NEVER' | 'DAILY' | 'MONTHLY' | 'YEARLY';
  defaultPaperSize: '80MM' | '58MM' | 'A4';
  activeTheme: string;
}

export * from './form';
export * from './rules';

export interface BusinessTemplate {
  templateId: BusinessType;
  name: string;
  description: string;
  industryCategory: 'Hospitality & Food' | 'Retail & FMCG' | 'Healthcare' | 'Apparel & Luxury' | 'Industrial & Hardware' | 'Services & Care';
  icon: string;
  themeColor: string;
  modules: ModuleConfig;
  menus: MenuItemConfig[];
  permissions: Record<string, Record<string, boolean>>;
  dashboardWidgets: DashboardWidgetConfig[];
  invoiceTypes: InvoiceTypeConfig[];
  categories: DefaultCategoryConfig[];
  productFields: ProductFieldsConfig;
  customerFields: CustomerFieldsConfig;
  reports: ReportConfig[];
  taxRules: TaxRuleConfig;
  workflows: WorkflowConfig;
  rules?: import('./rules').BusinessRule[];
  settingsDefaults: SettingsDefaultsConfig;
  invoiceLayout: InvoiceLayoutConfig;
  terms: BusinessTermsConfig;
}

