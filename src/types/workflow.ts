export type WorkflowColor = 'orange' | 'blue' | 'green' | 'purple' | 'emerald' | 'red' | 'amber' | 'cyan' | 'slate';

export interface WorkflowStatusStep {
  code: string;
  label: string;
  color: WorkflowColor;
  icon?: string;
  description?: string;
  nextAllowedStatuses: string[];
  autoDeductStock?: boolean;
  notifyCustomer?: boolean;
  requiredFields?: string[];
  rolesAllowed?: string[];
}

export interface WorkflowConfig {
  orderStatusPipeline: WorkflowStatusStep[];
  defaultInitialStatus: string;
  allowSplitPayments: boolean;
  allowCreditSale: boolean;
  requireCustomerForInvoice: boolean;
  autoPrintOnCheckout: boolean;
  defaultEstimatedTimeMinutes?: number;
}
