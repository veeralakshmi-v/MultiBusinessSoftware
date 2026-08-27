export type FormFieldControlType = 
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'DROPDOWN'
  | 'CHECKBOX'
  | 'RADIO'
  | 'TEXTAREA'
  | 'IMAGE_UPLOAD';

export interface FormFieldOption {
  label: string;
  value: string | number | boolean;
  badgeColor?: string;
}

export interface ConditionalRule {
  fieldId: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'TRUTHY' | 'FALSY' | 'GREATER_THAN' | 'LESS_THAN';
  value?: any;
}

export interface FormFieldValidation {
  isRequired?: boolean;
  isUnique?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customErrorMessage?: string;
}

export interface FormFieldDefinition {
  fieldId: string;
  label: string;
  controlType: FormFieldControlType;
  gridSpan?: number; // 1 - 12 columns
  displayOrder?: number;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  conditional?: ConditionalRule | ConditionalRule[];
  dependsOn?: ConditionalRule | ConditionalRule[];
}

export interface FormSchemaDefinition {
  id?: string;
  title: string;
  description?: string;
  submitButtonText?: string;
  fields: FormFieldDefinition[];
}
