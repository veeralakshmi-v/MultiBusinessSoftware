export type RuleOperator =
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS'
  | 'HAS_CATEGORY'
  | 'HAS_ATTRIBUTE'
  | 'IS_VIP';

export type RuleActionType =
  | 'APPLY_PERCENTAGE_DISCOUNT'
  | 'APPLY_FLAT_DISCOUNT'
  | 'REQUIRE_PRESCRIPTION'
  | 'REQUIRE_FIELD'
  | 'APPLY_LOYALTY_MULTIPLIER'
  | 'WAIVE_DELIVERY_CHARGE'
  | 'WAIVE_PACKING_CHARGE'
  | 'ADD_FREE_ITEM'
  | 'BLOCK_CHECKOUT';

export interface RuleCondition {
  field: 
    | 'billSubtotal'
    | 'billTotal'
    | 'itemsCount'
    | 'customerType'
    | 'customerLoyaltyPoints'
    | 'productCategory'
    | 'hasMedicineCategory'
    | 'paymentMethod'
    | 'orderType'
    | 'itemAttribute';
  operator: RuleOperator;
  value: any;
  attributeKey?: string; // If field is itemAttribute
}

export interface RuleAction {
  type: RuleActionType;
  value?: any; // e.g. 10 for 10% discount, 500 for flat discount, 'doctorName' for required field
  message?: string; // Notification message e.g. "Prescription required for scheduled medicines"
}

export interface BusinessRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number; // Higher numbers evaluate first
  conditionLogic?: 'ALL' | 'ANY'; // 'ALL' = AND, 'ANY' = OR
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface RuleContext {
  billSubtotal: number;
  billTotal: number;
  itemsCount: number;
  customer?: {
    id?: string;
    name?: string;
    mobile?: string;
    type?: string; // 'VIP', 'REGULAR', 'CORPORATE', 'WHOLESALE'
    loyaltyPoints?: number;
    isVip?: boolean;
  } | null;
  items: Array<{
    name: string;
    category?: string;
    price: number;
    quantity: number;
    attributes?: Record<string, any> | null;
  }>;
  orderType?: string;
  paymentMethod?: string;
  doctorName?: string;
  patientName?: string;
}

export interface RuleEvaluationResult {
  appliedRules: BusinessRule[];
  discountAmount: number;
  loyaltyMultiplier: number;
  requiresPrescription: boolean;
  requiredFields: string[];
  waiveDelivery: boolean;
  waivePacking: boolean;
  freeItems: Array<{ name: string; quantity: number }>;
  messages: string[];
  blockingErrors: string[];
}
