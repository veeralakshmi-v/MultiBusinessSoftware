import { 
  PermissionScopeLevel, 
  FieldAccessLevel, 
  SystemActionId, 
  SystemScreenId, 
  UserPermissionContext, 
  RolePermissionPolicy 
} from '../../types/permissions';

export const DEFAULT_ROLE_POLICIES: Record<string, RolePermissionPolicy> = {
  ADMIN: {
    role: 'ADMIN',
    name: 'Full System Administrator',
    description: 'Unrestricted enterprise access across all businesses, branches, modules, screens, actions, and fields.',
    businessScope: ['*'],
    branchScope: ['*'],
    allowedModules: ['*'],
    allowedScreens: [
      'SCREEN_POS', 'SCREEN_ORDERS', 'SCREEN_MENU', 'SCREEN_INVENTORY', 
      'SCREEN_CUSTOMERS', 'SCREEN_PROMOTIONS', 'SCREEN_REPORTS', 
      'SCREEN_SETTINGS', 'SCREEN_FLOOR_PLAN'
    ],
    allowedActions: [
      'CREATE_ORDER', 'EDIT_ORDER', 'CANCEL_BILL', 'APPLY_DISCOUNT', 'ISSUE_REFUND',
      'CREATE_PRODUCT', 'EDIT_PRODUCT', 'DELETE_PRODUCT', 'ADJUST_STOCK',
      'CREATE_CUSTOMER', 'APPROVE_CREDIT', 'EXPORT_REPORT', 'VIEW_FINANCIALS',
      'MANAGE_USERS', 'MANAGE_SETTINGS', 'VERIFY_PRESCRIPTION', 'UPDATE_KITCHEN_STATUS'
    ],
    fieldRules: {
      costPrice: 'READ_WRITE',
      sellingPrice: 'READ_WRITE',
      mrp: 'READ_WRITE',
      profitMargin: 'READ_WRITE',
      discount: 'READ_WRITE',
      tax: 'READ_WRITE',
      batchNumber: 'READ_WRITE',
      expiryDate: 'READ_WRITE',
    },
  },

  MANAGER: {
    role: 'MANAGER',
    name: 'Store / Branch Manager',
    description: 'Operational management across billing, catalog, stock adjustments, discounts, and reporting.',
    businessScope: ['assigned'],
    branchScope: ['assigned'],
    allowedModules: ['sales', 'inventory', 'purchase', 'crm', 'reports', 'kitchen', 'delivery', 'accounts'],
    allowedScreens: [
      'SCREEN_POS', 'SCREEN_ORDERS', 'SCREEN_MENU', 'SCREEN_INVENTORY', 
      'SCREEN_CUSTOMERS', 'SCREEN_PROMOTIONS', 'SCREEN_REPORTS', 'SCREEN_FLOOR_PLAN'
    ],
    allowedActions: [
      'CREATE_ORDER', 'EDIT_ORDER', 'CANCEL_BILL', 'APPLY_DISCOUNT', 'ISSUE_REFUND',
      'CREATE_PRODUCT', 'EDIT_PRODUCT', 'ADJUST_STOCK', 'CREATE_CUSTOMER', 
      'APPROVE_CREDIT', 'EXPORT_REPORT', 'VIEW_FINANCIALS', 'VERIFY_PRESCRIPTION', 'UPDATE_KITCHEN_STATUS'
    ],
    fieldRules: {
      costPrice: 'READ_WRITE',
      sellingPrice: 'READ_WRITE',
      mrp: 'READ_WRITE',
      profitMargin: 'READ_ONLY',
      discount: 'READ_WRITE',
      tax: 'READ_WRITE',
      batchNumber: 'READ_WRITE',
      expiryDate: 'READ_WRITE',
    },
  },

  CASHIER: {
    role: 'CASHIER',
    name: 'Billing Counter Cashier',
    description: 'POS sales, customer lookup, and bill generation. Can view item cost but CANNOT edit cost.',
    businessScope: ['assigned'],
    branchScope: ['assigned'],
    allowedModules: ['sales', 'crm'],
    allowedScreens: ['SCREEN_POS', 'SCREEN_ORDERS', 'SCREEN_CUSTOMERS'],
    allowedActions: ['CREATE_ORDER', 'APPLY_DISCOUNT', 'CREATE_CUSTOMER'],
    fieldRules: {
      costPrice: 'READ_ONLY',     // Specific requirement: Can View Cost, Cannot Edit Cost
      profitMargin: 'HIDDEN',     // Margin confidential
      sellingPrice: 'READ_WRITE', // Can apply selling price
      mrp: 'READ_ONLY',
      discount: 'READ_WRITE',
      tax: 'READ_ONLY',
      batchNumber: 'READ_ONLY',
      expiryDate: 'READ_ONLY',
    },
  },

  KITCHEN_STAFF: {
    role: 'KITCHEN_STAFF',
    name: 'Kitchen Chef / Line Cook',
    description: 'Order fulfillment queue and prep station. Financial fields and pricing are hidden.',
    businessScope: ['assigned'],
    branchScope: ['assigned'],
    allowedModules: ['kitchen'],
    allowedScreens: ['SCREEN_ORDERS', 'SCREEN_FLOOR_PLAN'],
    allowedActions: ['UPDATE_KITCHEN_STATUS'],
    fieldRules: {
      costPrice: 'HIDDEN',
      sellingPrice: 'HIDDEN',
      profitMargin: 'HIDDEN',
      mrp: 'HIDDEN',
      discount: 'HIDDEN',
      tax: 'HIDDEN',
      recipeNotes: 'READ_WRITE',
      prepTime: 'READ_WRITE',
    },
  },

  PHARMACIST: {
    role: 'PHARMACIST',
    name: 'Registered Pharmacist / Chemist',
    description: 'Dispensing Rx drugs, batch expiry verification, and doctor prescription audits.',
    businessScope: ['assigned'],
    branchScope: ['assigned'],
    allowedModules: ['sales', 'inventory', 'crm'],
    allowedScreens: ['SCREEN_POS', 'SCREEN_ORDERS', 'SCREEN_INVENTORY', 'SCREEN_CUSTOMERS'],
    allowedActions: ['CREATE_ORDER', 'VERIFY_PRESCRIPTION', 'ADJUST_STOCK', 'CREATE_CUSTOMER'],
    fieldRules: {
      costPrice: 'READ_ONLY',     // Pharmacist can view cost, cannot edit
      sellingPrice: 'READ_WRITE',
      mrp: 'READ_WRITE',
      batchNumber: 'READ_WRITE',
      expiryDate: 'READ_WRITE',
      doctorName: 'READ_WRITE',
      scheduleH: 'READ_ONLY',
      profitMargin: 'HIDDEN',
    },
  },
};

export class PermissionEngine {
  /**
   * 1. BUSINESS LEVEL PERMISSION
   */
  static canAccessBusiness(userContext: UserPermissionContext, targetBusinessId: string): boolean {
    if (userContext.role === 'ADMIN') return true;
    const scopes = userContext.assignedBusinessIds || ['assigned'];
    if (scopes.includes('*') || scopes.includes('ALL')) return true;
    return scopes.includes(targetBusinessId) || scopes.includes('assigned');
  }

  /**
   * 2. BRANCH LEVEL PERMISSION
   */
  static canAccessBranch(userContext: UserPermissionContext, targetBranchId: string): boolean {
    if (userContext.role === 'ADMIN') return true;
    const scopes = userContext.assignedBranchIds || ['assigned'];
    if (scopes.includes('*') || scopes.includes('ALL')) return true;
    return scopes.includes(targetBranchId) || scopes.includes('assigned');
  }

  /**
   * 3. MODULE LEVEL PERMISSION
   */
  static canAccessModule(userContext: UserPermissionContext, moduleId: string): boolean {
    if (userContext.role === 'ADMIN') return true;
    if (userContext.customOverrides?.allowedModules) {
      return userContext.customOverrides.allowedModules.includes(moduleId) || userContext.customOverrides.allowedModules.includes('*');
    }
    const policy = DEFAULT_ROLE_POLICIES[userContext.role];
    if (!policy) return false;
    if (policy.allowedModules.includes('*')) return true;
    return policy.allowedModules.includes(moduleId.toLowerCase());
  }

  /**
   * 4. SCREEN LEVEL PERMISSION
   */
  static canAccessScreen(userContext: UserPermissionContext, screenId: SystemScreenId): boolean {
    if (userContext.role === 'ADMIN') return true;
    if (userContext.customOverrides?.allowedScreens) {
      return userContext.customOverrides.allowedScreens.includes(screenId);
    }
    const policy = DEFAULT_ROLE_POLICIES[userContext.role];
    if (!policy) return false;
    return policy.allowedScreens.includes(screenId);
  }

  /**
   * 5. ACTION LEVEL PERMISSION
   */
  static canPerformAction(userContext: UserPermissionContext, actionId: SystemActionId): boolean {
    if (userContext.role === 'ADMIN') return true;
    if (userContext.customOverrides?.allowedActions) {
      return userContext.customOverrides.allowedActions.includes(actionId);
    }
    const policy = DEFAULT_ROLE_POLICIES[userContext.role];
    if (!policy) return false;
    return policy.allowedActions.includes(actionId);
  }

  /**
   * 6. FIELD LEVEL PERMISSION (READ_WRITE | READ_ONLY | HIDDEN)
   */
  static getFieldAccess(userContext: UserPermissionContext, fieldName: string): FieldAccessLevel {
    if (userContext.role === 'ADMIN') return 'READ_WRITE';
    if (userContext.customOverrides?.fieldRules && userContext.customOverrides.fieldRules[fieldName]) {
      return userContext.customOverrides.fieldRules[fieldName];
    }
    const policy = DEFAULT_ROLE_POLICIES[userContext.role];
    if (!policy) return 'HIDDEN';
    return policy.fieldRules[fieldName] || 'READ_WRITE';
  }

  static canViewField(userContext: UserPermissionContext, fieldName: string): boolean {
    const access = this.getFieldAccess(userContext, fieldName);
    return access === 'READ_WRITE' || access === 'READ_ONLY';
  }

  static canEditField(userContext: UserPermissionContext, fieldName: string): boolean {
    const access = this.getFieldAccess(userContext, fieldName);
    return access === 'READ_WRITE';
  }
}
