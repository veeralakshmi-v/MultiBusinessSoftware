export type ImportFileType = 'EXCEL' | 'CSV' | 'JSON' | 'LEGACY_BILLING';

export type ImportTargetEntity = 'PRODUCTS' | 'CUSTOMERS' | 'INVENTORY';

export type LegacySoftwareType = 'TALLY' | 'MARG_ERP' | 'PETPOOJA' | 'VYAPAR' | 'BUSY_WIN' | 'GENERIC';

export interface StandardFieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  isRequired: boolean;
  aliases: string[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string; // Target field key, or 'IGNORE'
  confidence: number;  // 0 to 100
  isAutoMatched: boolean;
}

export interface ValidationIssue {
  row: number;
  column: string;
  value: any;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ImportPreviewResult {
  detectedFormat: ImportFileType;
  targetEntity: ImportTargetEntity;
  rawHeaders: string[];
  totalRows: number;
  mappings: ColumnMapping[];
  previewRows: Record<string, any>[];
  validationIssues: ValidationIssue[];
  validRowCount: number;
  invalidRowCount: number;
}

export interface ImportExecutionResult {
  success: boolean;
  targetEntity: ImportTargetEntity;
  importedCount: number;
  failedCount: number;
  importedRecords?: any[];
  errors?: string[];
  message: string;
}
