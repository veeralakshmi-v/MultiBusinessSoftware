/**
 * Normalized Multi-Tenant Database Schema
 * Every operational entity strictly references `businessId`.
 */

export interface NormalizedBusiness {
  id: string; // e.g. 'biz-apex-group'
  name: string;
  businessTypeId: string; // Foreign Key -> NormalizedBusinessType.id
  activeTemplateId: string; // Foreign Key -> NormalizedTemplate.id
  legalEntityName: string;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedBusinessType {
  id: string; // e.g. 'type-food-beverage'
  name: string;
  code: string;
  description: string;
  industryCategory: string;
}

export interface NormalizedTemplate {
  id: string; // e.g. 'tpl-restaurant'
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  name: string;
  code: string;
  category: string;
  configSnapshot: Record<string, any>;
  createdAt: string;
}

export interface NormalizedModule {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  moduleId: string;
  name: string;
  isEnabled: boolean;
  config: Record<string, any>;
}

export interface NormalizedPermission {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  role: string;
  tier: number; // 1 to 6
  action: string;
  screen: string;
  fieldRules: Record<string, 'READ_WRITE' | 'READ_ONLY' | 'HIDDEN'>;
}

export interface NormalizedProductAttribute {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  attributeKey: string;
  label: string;
  dataType: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'DATE';
  isRequired: boolean;
  options?: string[];
}

export interface NormalizedFormDefinition {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  entityType: 'PRODUCT' | 'CUSTOMER' | 'SUPPLIER' | 'ORDER';
  fields: Array<{ key: string; label: string; controlType: string; isRequired: boolean }>;
  validationRules: Record<string, any>;
}

export interface NormalizedWorkflow {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  pipelineKey: string; // e.g. 'RESTAURANT_KITCHEN_PIPELINE'
  steps: Array<{ id: string; name: string; sequence: number }>;
  transitions: Array<{ from: string; to: string; allowedRole: string }>;
}

export interface NormalizedNotification {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  event: string;
  channels: Array<'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP'>;
  templateString: string;
  isActive: boolean;
}

export interface NormalizedAutomation {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  jobKey: string;
  name: string;
  schedule: string;
  triggerType: string;
  actionType: string;
  isEnabled: boolean;
}

export interface NormalizedPlugin {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  pluginKey: string;
  name: string;
  category: 'PAYMENT' | 'HARDWARE' | 'LOGISTICS' | 'ACCOUNTING';
  isEnabled: boolean;
  settings: Record<string, any>;
}

export interface NormalizedTheme {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  colorPreset: string;
  fontPreset: string;
  invoiceThemeId: string;
  customCssVars: Record<string, string>;
}

export interface NormalizedAuditLog {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  userId: string;
  action: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  ip: string;
  device: string;
}

export interface NormalizedBranch {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  name: string;
  code: string;
  address: string;
  phone: string;
  isHeadquarters: boolean;
}

export interface NormalizedWarehouse {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  branchId: string; // Foreign Key -> NormalizedBranch.id
  name: string;
  code: string;
  capacity: number;
  type: 'CENTRAL_STORAGE' | 'OUTLET_BACKROOM' | 'COLD_CHAIN' | 'TRANSIT_DEPOT';
}

export interface NormalizedCounter {
  id: string;
  businessId: string; // Foreign Key -> NormalizedBusiness.id
  branchId: string; // Foreign Key -> NormalizedBranch.id
  name: string;
  counterNumber: string;
  type: 'MAIN_POS' | 'EXPRESS_CHECKOUT' | 'DRIVE_THRU' | 'PHARMACY_RX' | 'WHOLESALE_DESK';
  assignedStaffId?: string;
}

export interface NormalizedDatabaseState {
  businesses: NormalizedBusiness[];
  businessTypes: NormalizedBusinessType[];
  templates: NormalizedTemplate[];
  modules: NormalizedModule[];
  permissions: NormalizedPermission[];
  productAttributes: NormalizedProductAttribute[];
  formDefinitions: NormalizedFormDefinition[];
  workflows: NormalizedWorkflow[];
  notifications: NormalizedNotification[];
  automations: NormalizedAutomation[];
  plugins: NormalizedPlugin[];
  themes: NormalizedTheme[];
  auditLogs: NormalizedAuditLog[];
  branches: NormalizedBranch[];
  warehouses: NormalizedWarehouse[];
  counters: NormalizedCounter[];
}
