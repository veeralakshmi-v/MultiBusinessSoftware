export type PluginCategory = 
  | 'PAYMENT_GATEWAY'
  | 'HARDWARE'
  | 'LOGISTICS'
  | 'ACCOUNTING'
  | 'MARKETING';

export type PluginHookEvent = 
  | 'PAYMENT_PROCESS'
  | 'BARCODE_SCANNED'
  | 'PRINT_LABEL'
  | 'DISPATCH_COURIER'
  | 'SYNC_ACCOUNTING'
  | 'INVOICE_GENERATED';

export interface PluginConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'select' | 'boolean';
  isRequired?: boolean;
  placeholder?: string;
  default?: any;
  options?: string[];
}

export interface PluginDefinition {
  id: string;
  name: string;
  version: string;
  category: PluginCategory;
  description: string;
  iconName: string;
  developer: string;
  isInstalled: boolean;
  isEnabled: boolean;
  configFields: PluginConfigField[];
  config: Record<string, any>;
  supportedHooks: PluginHookEvent[];
}

export interface PluginExecutionResult {
  pluginId: string;
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
