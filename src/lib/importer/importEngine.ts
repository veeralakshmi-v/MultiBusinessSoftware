import { 
  ImportFileType, 
  ImportTargetEntity, 
  StandardFieldDefinition, 
  ColumnMapping, 
  ValidationIssue, 
  ImportPreviewResult, 
  ImportExecutionResult,
  LegacySoftwareType
} from '../../types/import';

export const STANDARD_PRODUCT_FIELDS: StandardFieldDefinition[] = [
  {
    key: 'name',
    label: 'Product / Item Name',
    type: 'string',
    isRequired: true,
    aliases: ['name', 'item', 'item name', 'product', 'product name', 'particulars', 'desc', 'description', 'title', 'item_title', 'item_name', 'item description'],
  },
  {
    key: 'sku',
    label: 'SKU / Barcode',
    type: 'string',
    isRequired: false,
    aliases: ['sku', 'barcode', 'item code', 'item_code', 'code', 'product code', 'upc', 'ean', 'item_id', 'item no', 'part no'],
  },
  {
    key: 'category',
    label: 'Category / Department',
    type: 'string',
    isRequired: false,
    aliases: ['category', 'dept', 'department', 'group', 'item group', 'type', 'cat_name', 'category_name', 'sub_category'],
  },
  {
    key: 'costPrice',
    label: 'Cost / Purchase Price',
    type: 'number',
    isRequired: false,
    aliases: ['cost', 'cost price', 'cost_price', 'purchase rate', 'purchase price', 'buy rate', 'buy price', 'cost/unit', 'pur_rate', 'buy_price', 'purchase_cost'],
  },
  {
    key: 'sellingPrice',
    label: 'Selling Price / MRP',
    type: 'number',
    isRequired: true,
    aliases: ['price', 'selling price', 'selling_price', 'rate', 'sale rate', 'sale price', 'mrp', 'retail price', 'unit price', 'sales_rate', 'sale_rate', 'retail_rate'],
  },
  {
    key: 'stock',
    label: 'Available Stock Quantity',
    type: 'number',
    isRequired: false,
    aliases: ['stock', 'qty', 'quantity', 'balance', 'closing stock', 'opening stock', 'units', 'on hand', 'cur_stock', 'balance_qty', 'stock_qty', 'available_qty'],
  },
  {
    key: 'gstRate',
    label: 'GST / Tax Rate (%)',
    type: 'number',
    isRequired: false,
    aliases: ['gst', 'gst%', 'gst rate', 'tax', 'tax%', 'vat', 'tax rate', 'igst', 'tax_perc', 'vat%', 'cgst+sgst'],
  },
  {
    key: 'hsnCode',
    label: 'HSN / SAC Code',
    type: 'string',
    isRequired: false,
    aliases: ['hsn', 'hsn code', 'hsn/sac', 'sac', 'hsn_code', 'hsn_sac', 'commodity code'],
  },
  {
    key: 'unit',
    label: 'Unit of Measure (UOM)',
    type: 'string',
    isRequired: false,
    aliases: ['unit', 'uom', 'measure', 'unit of measure', 'unit_name', 'pack'],
  },
];

export const STANDARD_CUSTOMER_FIELDS: StandardFieldDefinition[] = [
  {
    key: 'name',
    label: 'Customer / Party Name',
    type: 'string',
    isRequired: true,
    aliases: ['customer', 'customer name', 'party name', 'client', 'name', 'account name', 'cust_name', 'party', 'contact name'],
  },
  {
    key: 'mobile',
    label: 'Mobile / Phone Number',
    type: 'string',
    isRequired: true,
    aliases: ['mobile', 'phone', 'contact', 'phone number', 'cell', 'mobile number', 'contact_no', 'phone_no', 'telephone'],
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'string',
    isRequired: false,
    aliases: ['email', 'e-mail', 'mail', 'email address'],
  },
  {
    key: 'gstin',
    label: 'GSTIN / Tax Identification No',
    type: 'string',
    isRequired: false,
    aliases: ['gstin', 'gst number', 'tax id', 'tin', 'vat no', 'gst_no', 'gstin/uin'],
  },
  {
    key: 'address',
    label: 'Billing / Shipping Address',
    type: 'string',
    isRequired: false,
    aliases: ['address', 'city', 'billing address', 'street', 'location', 'full address'],
  },
];

export class ImportEngine {
  /**
   * Automatically maps source file column headers to standard schema fields
   */
  static autoMapColumns(sourceHeaders: string[], targetEntity: ImportTargetEntity = 'PRODUCTS'): ColumnMapping[] {
    const standardFields = targetEntity === 'PRODUCTS' ? STANDARD_PRODUCT_FIELDS : STANDARD_CUSTOMER_FIELDS;
    const usedTargets = new Set<string>();

    return sourceHeaders.map(header => {
      const cleanHeader = header.trim().toLowerCase().replace(/[_\-./]/g, ' ');
      let bestField = 'IGNORE';
      let highestConfidence = 0;

      for (const field of standardFields) {
        // 1. Exact key match
        if (cleanHeader === field.key.toLowerCase()) {
          bestField = field.key;
          highestConfidence = 100;
          break;
        }

        // 2. Exact alias match
        for (const alias of field.aliases) {
          if (cleanHeader === alias) {
            bestField = field.key;
            highestConfidence = 95;
            break;
          }
        }

        if (highestConfidence === 95) break;

        // 3. Partial alias match (contains whole word)
        for (const alias of field.aliases) {
          if (cleanHeader.includes(alias) || alias.includes(cleanHeader)) {
            if (highestConfidence < 80) {
              bestField = field.key;
              highestConfidence = 80;
            }
          }
        }
      }

      if (bestField !== 'IGNORE') {
        usedTargets.add(bestField);
      }

      return {
        sourceColumn: header,
        targetField: bestField,
        confidence: highestConfidence,
        isAutoMatched: highestConfidence >= 75,
      };
    });
  }

  /**
   * Parses raw CSV / TSV text
   */
  static parseCSV(csvText: string): { headers: string[]; rows: Record<string, any>[] } {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const rowObj: Record<string, any> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] !== undefined ? values[idx] : '';
      });
      rows.push(rowObj);
    }

    return { headers, rows };
  }

  /**
   * Parses JSON file content
   */
  static parseJSON(jsonText: string): { headers: string[]; rows: Record<string, any>[] } {
    try {
      const parsed = JSON.parse(jsonText);
      let list: any[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        list = arrayKey ? parsed[arrayKey] : [parsed];
      }

      if (list.length === 0) return { headers: [], rows: [] };
      const headers = Array.from(new Set(list.flatMap(item => Object.keys(item))));
      return { headers, rows: list };
    } catch {
      return { headers: [], rows: [] };
    }
  }

  /**
   * Parses legacy billing software presets (Tally, Marg ERP, Petpooja, Vyapar)
   */
  static parseLegacyFormat(content: string, software: LegacySoftwareType): { headers: string[]; rows: Record<string, any>[] } {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return this.parseJSON(content);
    }
    return this.parseCSV(content);
  }

  /**
   * Performs data validation and builds preview result
   */
  static generateImportPreview(params: {
    format: ImportFileType;
    targetEntity: ImportTargetEntity;
    rawContent: string;
    customMappings?: ColumnMapping[];
  }): ImportPreviewResult {
    let parsed = { headers: [] as string[], rows: [] as Record<string, any>[] };

    if (params.format === 'JSON') {
      parsed = this.parseJSON(params.rawContent);
    } else {
      parsed = this.parseCSV(params.rawContent);
    }

    const mappings = params.customMappings || this.autoMapColumns(parsed.headers, params.targetEntity);
    const standardFields = params.targetEntity === 'PRODUCTS' ? STANDARD_PRODUCT_FIELDS : STANDARD_CUSTOMER_FIELDS;
    const requiredFields = standardFields.filter(f => f.isRequired).map(f => f.key);

    const validationIssues: ValidationIssue[] = [];
    let validRowCount = 0;

    const previewRows = parsed.rows.map((rawRow, rowIndex) => {
      const transformedRow: Record<string, any> = {};
      let rowHasError = false;

      mappings.forEach(mapping => {
        if (mapping.targetField !== 'IGNORE') {
          let value = rawRow[mapping.sourceColumn];
          const fieldDef = standardFields.find(f => f.key === mapping.targetField);

          if (fieldDef?.type === 'number') {
            const num = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
            value = isNaN(num) ? (fieldDef.isRequired ? 0 : undefined) : num;
          }

          transformedRow[mapping.targetField] = value;
        }
      });

      // Validate required fields
      requiredFields.forEach(reqKey => {
        const val = transformedRow[reqKey];
        if (val === undefined || val === null || val === '') {
          rowHasError = true;
          validationIssues.push({
            row: rowIndex + 1,
            column: reqKey,
            value: val,
            message: `Required field '${reqKey}' is missing or empty`,
            severity: 'ERROR',
          });
        }
      });

      if (!rowHasError) {
        validRowCount++;
      }

      return transformedRow;
    });

    return {
      detectedFormat: params.format,
      targetEntity: params.targetEntity,
      rawHeaders: parsed.headers,
      totalRows: parsed.rows.length,
      mappings,
      previewRows,
      validationIssues,
      validRowCount,
      invalidRowCount: parsed.rows.length - validRowCount,
    };
  }

  /**
   * Commits the validated import to the active catalog
   */
  static executeImport(preview: ImportPreviewResult): ImportExecutionResult {
    try {
      const validRecords = preview.previewRows.filter(row => {
        const hasName = row.name && String(row.name).trim().length > 0;
        const hasPrice = preview.targetEntity === 'PRODUCTS' ? (typeof row.sellingPrice === 'number' && row.sellingPrice >= 0) : true;
        return hasName && hasPrice;
      });

      // Save to catalog in storage
      if (preview.targetEntity === 'PRODUCTS') {
        if (typeof localStorage !== 'undefined') {
          const existingRaw = localStorage.getItem('multi_biz_imported_products');
          const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
          const merged = [...existing, ...validRecords];
          localStorage.setItem('multi_biz_imported_products', JSON.stringify(merged));
        }
      }

      return {
        success: true,
        targetEntity: preview.targetEntity,
        importedCount: validRecords.length,
        failedCount: preview.totalRows - validRecords.length,
        importedRecords: validRecords,
        message: `Successfully imported ${validRecords.length} ${preview.targetEntity.toLowerCase()} into system!`,
      };
    } catch (e: any) {
      return {
        success: false,
        targetEntity: preview.targetEntity,
        importedCount: 0,
        failedCount: preview.totalRows,
        errors: [e?.message || 'Import execution failed'],
        message: 'Import execution failed',
      };
    }
  }
}
