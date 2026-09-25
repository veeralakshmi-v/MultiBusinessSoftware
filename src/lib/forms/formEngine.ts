import { FormSchemaDefinition, FormFieldDefinition, ConditionalRule } from '../../types/form';

export class FormEngine {
  /**
   * Generates initial form state from schema default values and optional initial data
   */
  static generateDefaultValues(
    schema: FormSchemaDefinition,
    initialData: Record<string, any> = {}
  ): Record<string, any> {
    const result: Record<string, any> = { ...initialData };

    schema.fields.forEach(field => {
      if (result[field.fieldId] === undefined) {
        if (field.defaultValue !== undefined) {
          result[field.fieldId] = field.defaultValue;
        } else {
          switch (field.controlType) {
            case 'CHECKBOX':
              result[field.fieldId] = false;
              break;
            case 'NUMBER':
              result[field.fieldId] = '';
              break;
            default:
              result[field.fieldId] = '';
          }
        }
      }
    });

    return result;
  }

  /**
   * Evaluates if a single conditional rule passes
   */
  static evaluateRule(rule: ConditionalRule, formData: Record<string, any>): boolean {
    const targetValue = formData[rule.fieldId];

    switch (rule.operator) {
      case 'EQUALS':
        return String(targetValue) === String(rule.value);
      case 'NOT_EQUALS':
        return String(targetValue) !== String(rule.value);
      case 'IN':
        return Array.isArray(rule.value) && rule.value.map(String).includes(String(targetValue));
      case 'NOT_IN':
        return Array.isArray(rule.value) && !rule.value.map(String).includes(String(targetValue));
      case 'TRUTHY':
        return Boolean(targetValue) === true && targetValue !== '' && targetValue !== 0;
      case 'FALSY':
        return !targetValue || targetValue === '' || targetValue === 0;
      case 'GREATER_THAN':
        return Number(targetValue) > Number(rule.value);
      case 'LESS_THAN':
        return Number(targetValue) < Number(rule.value);
      default:
        return true;
    }
  }

  /**
   * Checks if a field should be visible based on its dependsOn / conditional rules
   */
  static isFieldVisible(field: FormFieldDefinition, formData: Record<string, any>): boolean {
    const rules = field.conditional || field.dependsOn;
    if (!rules) return true;

    if (Array.isArray(rules)) {
      return rules.every(rule => this.evaluateRule(rule, formData));
    }
    return this.evaluateRule(rules, formData);
  }

  /**
   * Validates a single field value against its validation rules
   */
  static validateField(
    field: FormFieldDefinition,
    value: any,
    formData: Record<string, any> = {},
    existingRecords: any[] = []
  ): string | null {
    // If field is hidden by conditional rules, it has no validation errors
    if (!this.isFieldVisible(field, formData)) {
      return null;
    }

    const validation = field.validation;
    if (!validation) return null;

    const customError = validation.customErrorMessage;
    const isValEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '');

    // 1. Required Check
    if (validation.isRequired) {
      if (field.controlType === 'CHECKBOX') {
        if (!value) return customError || `${field.label} must be checked`;
      } else if (isValEmpty) {
        return customError || `${field.label} is required`;
      }
    }

    // If empty and not required, skip remaining value checks
    if (isValEmpty) return null;

    // 2. Unique Check
    if (validation.isUnique && existingRecords && existingRecords.length > 0) {
      const currentId = formData.id;
      const duplicate = existingRecords.some(record => {
        if (currentId && (record.id === currentId || record._id === currentId)) {
          return false;
        }
        const recordVal = record[field.fieldId];
        if (typeof value === 'string' && typeof recordVal === 'string') {
          return recordVal.trim().toLowerCase() === value.trim().toLowerCase();
        }
        return recordVal === value;
      });

      if (duplicate) {
        return customError || `${field.label} '${value}' is already in use. Must be unique.`;
      }
    }

    // 3. String Length Checks
    if (typeof value === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        return customError || `${field.label} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        return customError || `${field.label} cannot exceed ${validation.maxLength} characters`;
      }
    }

    // 4. Numeric Range Checks
    if (field.controlType === 'NUMBER' || typeof value === 'number') {
      const num = Number(value);
      if (!isNaN(num)) {
        if (validation.min !== undefined && num < validation.min) {
          return customError || `${field.label} must be at least ${validation.min}`;
        }
        if (validation.max !== undefined && num > validation.max) {
          return customError || `${field.label} cannot exceed ${validation.max}`;
        }
      }
    }

    // 5. Regular Expression Pattern Check
    if (validation.pattern) {
      try {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(String(value))) {
          return customError || `${field.label} format is invalid`;
        }
      } catch (err) {
        // Ignore invalid regex
      }
    }

    return null;
  }

  /**
   * Validates all fields in a form schema
   */
  static validateForm(
    schema: FormSchemaDefinition,
    formData: Record<string, any>,
    existingRecords: any[] = []
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    schema.fields.forEach(field => {
      const error = this.validateField(field, formData[field.fieldId], formData, existingRecords);
      if (error) {
        errors[field.fieldId] = error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
