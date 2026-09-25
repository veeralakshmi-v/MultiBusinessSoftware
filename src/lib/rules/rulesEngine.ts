import { 
  BusinessRule, 
  RuleCondition, 
  RuleAction, 
  RuleContext, 
  RuleEvaluationResult 
} from '../../types/rules';
import { BusinessType } from '../../types/template';

export class RulesEngine {
  /**
   * Evaluates a collection of rules against the given shopping/billing context
   */
  static evaluateRules(rules: BusinessRule[], context: RuleContext): RuleEvaluationResult {
    const result: RuleEvaluationResult = {
      appliedRules: [],
      discountAmount: 0,
      loyaltyMultiplier: 1.0,
      requiresPrescription: false,
      requiredFields: [],
      waiveDelivery: false,
      waivePacking: false,
      freeItems: [],
      messages: [],
      blockingErrors: [],
    };

    if (!rules || rules.length === 0) {
      return result;
    }

    // Sort rules by priority descending
    const activeRules = rules
      .filter(r => r.enabled)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const rule of activeRules) {
      const isMatch = this.matchesRule(rule, context);
      if (isMatch) {
        result.appliedRules.push(rule);
        
        for (const action of rule.actions) {
          this.applyAction(action, context, result, rule.name);
        }
      }
    }

    return result;
  }

  /**
   * Evaluates whether a rule's conditions match the context
   */
  static matchesRule(rule: BusinessRule, context: RuleContext): boolean {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true;
    }

    const logic = rule.conditionLogic || 'ALL';

    if (logic === 'ALL') {
      return rule.conditions.every(cond => this.evaluateCondition(cond, context));
    } else {
      return rule.conditions.some(cond => this.evaluateCondition(cond, context));
    }
  }

  /**
   * Evaluates a single rule condition against context
   */
  static evaluateCondition(cond: RuleCondition, context: RuleContext): boolean {
    switch (cond.field) {
      case 'billSubtotal':
      case 'billTotal': {
        const amount = cond.field === 'billSubtotal' ? context.billSubtotal : context.billTotal;
        return this.compareNumbers(amount, cond.operator, Number(cond.value));
      }

      case 'itemsCount': {
        const count = context.itemsCount || context.items.reduce((sum, i) => sum + i.quantity, 0);
        return this.compareNumbers(count, cond.operator, Number(cond.value));
      }

      case 'customerType':
      case 'customerLoyaltyPoints':
      case 'itemAttribute': {
        if (cond.operator === 'IS_VIP') {
          return Boolean(
            context.customer?.isVip ||
            context.customer?.type?.toUpperCase() === 'VIP' ||
            (context.customer?.loyaltyPoints && context.customer.loyaltyPoints >= 500)
          );
        }
        if (cond.field === 'customerType') {
          const cType = context.customer?.type || 'REGULAR';
          return this.compareStrings(cType, cond.operator, String(cond.value));
        }
        if (cond.field === 'customerLoyaltyPoints') {
          const points = context.customer?.loyaltyPoints || 0;
          return this.compareNumbers(points, cond.operator, Number(cond.value));
        }
        if (cond.field === 'itemAttribute' && cond.attributeKey) {
          return context.items.some(item => {
            const attrVal = item.attributes ? item.attributes[cond.attributeKey!] : undefined;
            return attrVal === cond.value;
          });
        }
        return false;
      }

      case 'productCategory': {
        const targetCategory = String(cond.value).toLowerCase();
        return context.items.some(item => {
          const itemCat = (item.category || '').toLowerCase();
          if (cond.operator === 'EQUALS') return itemCat === targetCategory;
          if (cond.operator === 'CONTAINS' || cond.operator === 'HAS_CATEGORY') return itemCat.includes(targetCategory);
          return false;
        });
      }

      case 'hasMedicineCategory': {
        const medicineKeywords = ['medicine', 'tablet', 'syrup', 'capsule', 'injection', 'pharma', 'drug', 'rx'];
        return context.items.some(item => {
          const cat = (item.category || '').toLowerCase();
          const isMed = medicineKeywords.some(kw => cat.includes(kw));
          const isScheduleH = item.attributes && Boolean(item.attributes.scheduleH);
          return isMed || isScheduleH;
        });
      }

      case 'paymentMethod': {
        return this.compareStrings(context.paymentMethod || '', cond.operator, String(cond.value));
      }

      case 'orderType': {
        return this.compareStrings(context.orderType || '', cond.operator, String(cond.value));
      }

      default:
        return false;
    }
  }

  /**
   * Applies an action to the evaluation result
   */
  private static applyAction(
    action: RuleAction, 
    context: RuleContext, 
    result: RuleEvaluationResult,
    ruleName: string
  ): void {
    switch (action.type) {
      case 'APPLY_PERCENTAGE_DISCOUNT': {
        const pct = Number(action.value) || 0;
        const discount = Math.round((context.billSubtotal * (pct / 100)) * 100) / 100;
        result.discountAmount += discount;
        result.messages.push(action.message || `Applied ${pct}% discount from rule: ${ruleName}`);
        break;
      }

      case 'APPLY_FLAT_DISCOUNT': {
        const flat = Number(action.value) || 0;
        result.discountAmount += flat;
        result.messages.push(action.message || `Applied ₹${flat} flat discount from rule: ${ruleName}`);
        break;
      }

      case 'APPLY_LOYALTY_MULTIPLIER': {
        const mult = Number(action.value) || 1.0;
        result.loyaltyMultiplier *= mult;
        result.messages.push(action.message || `Applied ${mult}x loyalty points multiplier from rule: ${ruleName}`);
        break;
      }

      case 'REQUIRE_PRESCRIPTION': {
        result.requiresPrescription = true;
        result.requiredFields.push('doctorName', 'patientName');
        if (!context.doctorName || context.doctorName.trim().length === 0) {
          result.blockingErrors.push(action.message || 'Prescription and Doctor Name are required for scheduled medicine items.');
        }
        break;
      }

      case 'REQUIRE_FIELD': {
        const field = String(action.value);
        result.requiredFields.push(field);
        if (!(context as any)[field]) {
          result.blockingErrors.push(action.message || `Field '${field}' is required by rule: ${ruleName}`);
        }
        break;
      }

      case 'WAIVE_DELIVERY_CHARGE': {
        result.waiveDelivery = true;
        result.messages.push(action.message || 'Delivery fee waived!');
        break;
      }

      case 'WAIVE_PACKING_CHARGE': {
        result.waivePacking = true;
        result.messages.push(action.message || 'Packing charges waived!');
        break;
      }

      case 'ADD_FREE_ITEM': {
        const freeItem = typeof action.value === 'object' ? action.value : { name: String(action.value), quantity: 1 };
        result.freeItems.push(freeItem);
        result.messages.push(action.message || `Unlocked Free Item: ${freeItem.name}`);
        break;
      }

      case 'BLOCK_CHECKOUT': {
        result.blockingErrors.push(action.message || `Checkout blocked by rule: ${ruleName}`);
        break;
      }
    }
  }

  private static compareNumbers(val: number, op: string, target: number): boolean {
    switch (op) {
      case 'GREATER_THAN': return val > target;
      case 'GREATER_THAN_OR_EQUAL': return val >= target;
      case 'LESS_THAN': return val < target;
      case 'LESS_THAN_OR_EQUAL': return val <= target;
      case 'EQUALS': return val === target;
      case 'NOT_EQUALS': return val !== target;
      default: return false;
    }
  }

  private static compareStrings(val: string, op: string, target: string): boolean {
    const s1 = (val || '').toUpperCase();
    const s2 = (target || '').toUpperCase();
    switch (op) {
      case 'EQUALS': return s1 === s2;
      case 'NOT_EQUALS': return s1 !== s2;
      case 'CONTAINS': return s1.includes(s2);
      default: return false;
    }
  }

  /**
   * Returns vertical-specific business rules
   */
  static getDefaultRulesForVertical(businessType: BusinessType): BusinessRule[] {
    switch (businessType) {
      case 'RESTAURANT':
        return [
          {
            id: 'rule-rest-1',
            name: 'Big Feast 10% Discount',
            description: 'Apply 10% discount when bill subtotal exceeds ₹5000',
            enabled: true,
            priority: 10,
            conditions: [
              { field: 'billSubtotal', operator: 'GREATER_THAN', value: 5000 }
            ],
            actions: [
              { type: 'APPLY_PERCENTAGE_DISCOUNT', value: 10, message: '🎉 Big Feast Reward: 10% discount applied for bill > ₹5000!' }
            ]
          },
          {
            id: 'rule-rest-2',
            name: 'VIP 2x Loyalty Points',
            description: 'VIP Customers earn 2x bonus loyalty points',
            enabled: true,
            priority: 8,
            conditions: [
              { field: 'customerType', operator: 'IS_VIP', value: true }
            ],
            actions: [
              { type: 'APPLY_LOYALTY_MULTIPLIER', value: 2.0, message: '⭐ VIP Benefit: Earning 2x Loyalty Points on this order!' }
            ]
          }
        ];

      case 'RETAIL':
      case 'SUPERMARKET':
        return [
          {
            id: 'rule-retail-1',
            name: 'Mega Cart Flat ₹500 Off',
            description: 'Apply flat ₹500 discount for shopping bills above ₹5000',
            enabled: true,
            priority: 10,
            conditions: [
              { field: 'billSubtotal', operator: 'GREATER_THAN', value: 5000 }
            ],
            actions: [
              { type: 'APPLY_FLAT_DISCOUNT', value: 500, message: '🏷️ Mega Cart Offer: Flat ₹500 discount applied!' }
            ]
          },
          {
            id: 'rule-retail-2',
            name: 'VIP Member 5% Extra Off',
            description: 'VIP members get 5% discount on all purchases',
            enabled: true,
            priority: 9,
            conditions: [
              { field: 'customerType', operator: 'IS_VIP', value: true }
            ],
            actions: [
              { type: 'APPLY_PERCENTAGE_DISCOUNT', value: 5, message: '👑 VIP Member: 5% discount applied!' }
            ]
          },
          {
            id: 'rule-retail-3',
            name: 'Free Home Delivery Above ₹1000',
            description: 'Waive delivery fee when bill exceeds ₹1000',
            enabled: true,
            priority: 5,
            conditions: [
              { field: 'billSubtotal', operator: 'GREATER_THAN_OR_EQUAL', value: 1000 }
            ],
            actions: [
              { type: 'WAIVE_DELIVERY_CHARGE', message: '🚚 Free Delivery: Order qualifies for free home delivery!' }
            ]
          }
        ];

      case 'MEDICAL':
        return [
          {
            id: 'rule-med-1',
            name: 'Scheduled Drug Prescription Enforcement',
            description: 'Require doctor name and prescription if bill contains medicine categories',
            enabled: true,
            priority: 100,
            conditions: [
              { field: 'hasMedicineCategory', operator: 'EQUALS', value: true }
            ],
            actions: [
              { 
                type: 'REQUIRE_PRESCRIPTION', 
                message: '⚠️ Regulatory Notice: Doctor Name and Prescription are mandatory for dispensing scheduled medicines.' 
              }
            ]
          },
          {
            id: 'rule-med-2',
            name: 'VIP Patient 10% Wellness Discount',
            description: 'VIP patients receive 10% wellness discount',
            enabled: true,
            priority: 10,
            conditions: [
              { field: 'customerType', operator: 'IS_VIP', value: true }
            ],
            actions: [
              { type: 'APPLY_PERCENTAGE_DISCOUNT', value: 10, message: '🩺 VIP Wellness: 10% healthcare discount applied!' },
              { type: 'APPLY_LOYALTY_MULTIPLIER', value: 2.0 }
            ]
          }
        ];

      case 'WHOLESALE':
        return [
          {
            id: 'rule-ws-1',
            name: 'High-Volume Wholesale 15% Slab',
            description: 'Apply 15% bulk discount for volume bills above ₹50000',
            enabled: true,
            priority: 10,
            conditions: [
              { field: 'billSubtotal', operator: 'GREATER_THAN', value: 50000 }
            ],
            actions: [
              { type: 'APPLY_PERCENTAGE_DISCOUNT', value: 15, message: '📦 Bulk Tier 1: 15% volume discount applied!' }
            ]
          }
        ];

      default:
        return [
          {
            id: 'rule-gen-1',
            name: 'High Value Bill Discount',
            description: 'Apply 10% discount when bill exceeds ₹5000',
            enabled: true,
            priority: 10,
            conditions: [
              { field: 'billSubtotal', operator: 'GREATER_THAN', value: 5000 }
            ],
            actions: [
              { type: 'APPLY_PERCENTAGE_DISCOUNT', value: 10, message: '🎉 High Value Bill: 10% discount applied!' }
            ]
          }
        ];
    }
  }
}
