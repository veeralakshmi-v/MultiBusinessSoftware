export type PermissionScopeLevel = 
  | 'BUSINESS' 
  | 'BRANCH' 
  | 'MODULE' 
  | 'SCREEN' 
  | 'ACTION' 
  | 'FIELD';

export type FieldAccessLevel = 'READ_WRITE' | 'READ_ONLY' | 'HIDDEN';

export type SystemActionId = 
  | 'CREATE_ORDER'
  | 'EDIT_ORDER'
  | 'CANCEL_BILL'
  | 'APPLY_DISCOUNT'
  | 'ISSUE_REFUND'
  | 'CREATE_PRODUCT'
  | 'EDIT_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'ADJUST_STOCK'
  | 'CREATE_CUSTOMER'
  | 'APPROVE_CREDIT'
  | 'EXPORT_REPORT'
  | 'VIEW_FINANCIALS'
  | 'MANAGE_USERS'
  | 'MANAGE_SETTINGS'
  | 'VERIFY_PRESCRIPTION'
  | 'UPDATE_KITCHEN_STATUS';

export type SystemScreenId = 
  | 'SCREEN_POS'
  | 'SCREEN_ORDERS'
  | 'SCREEN_MENU'
  | 'SCREEN_INVENTORY'
  | 'SCREEN_CUSTOMERS'
  | 'SCREEN_PROMOTIONS'
  | 'SCREEN_REPORTS'
  | 'SCREEN_SETTINGS'
  | 'SCREEN_FLOOR_PLAN';

export interface UserPermissionContext {
  userId: string;
  role: string;
  assignedBusinessIds?: string[];
  assignedBranchIds?: string[];
  customOverrides?: {
    allowedModules?: string[];
    allowedScreens?: SystemScreenId[];
    allowedActions?: SystemActionId[];
    fieldRules?: Record<string, FieldAccessLevel>;
  };
}

export interface RolePermissionPolicy {
  role: string;
  name: string;
  description: string;
  businessScope: string[];
  branchScope: string[];
  allowedModules: string[];
  allowedScreens: SystemScreenId[];
  allowedActions: SystemActionId[];
  fieldRules: Record<string, FieldAccessLevel>;
}
