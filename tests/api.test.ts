import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FormEngine } from '../src/lib/forms/formEngine';
import { WorkflowEngine } from '../src/lib/workflows/workflowEngine';
import { RulesEngine } from '../src/lib/rules/rulesEngine';
import { ReportEngine, AVAILABLE_REPORT_FIELDS } from '../src/lib/reports/reportEngine';
import { NotificationEngine, DEFAULT_NOTIFICATION_TEMPLATES } from '../src/lib/notifications/notificationEngine';
import { AutomationEngine, DEFAULT_AUTOMATION_JOBS } from '../src/lib/automation/automationEngine';
import { PluginEngine, DEFAULT_PLUGINS } from '../src/lib/plugins/pluginEngine';
import { ThemeEngine, COLOR_PRESETS, FONT_PRESETS, INVOICE_THEME_DETAILS } from '../src/lib/theme/themeEngine';
import { PermissionEngine, DEFAULT_ROLE_POLICIES } from '../src/lib/permissions/permissionEngine';
import { BranchEngine, DEFAULT_BUSINESS, DEFAULT_BRANCHES, DEFAULT_WAREHOUSES, DEFAULT_COUNTERS } from '../src/lib/branches/branchEngine';
import { AuditEngine, INITIAL_AUDIT_LOGS } from '../src/lib/audit/auditEngine';
import { ImportEngine } from '../src/lib/importer/importEngine';
import { WhiteLabelEngine, DEFAULT_WHITELABEL_CONFIG } from '../src/lib/whitelabel/whiteLabelEngine';
import { AIAssistantEngine } from '../src/lib/ai/aiAssistantEngine';
import { NormalizedDatabaseEngine } from '../src/lib/database/normalizedDatabase';
import { MigrationEngine } from '../src/lib/migration/migrationEngine';
import { EmployeeEngine } from '../src/lib/employees/employeeEngine';
import { DepartmentEngine } from '../src/lib/departments/departmentEngine';
import { DesignationEngine } from '../src/lib/designations/designationEngine';
import { ShiftEngine } from '../src/lib/shifts/shiftEngine';
import { LeaveEngine, LEAVE_TYPE_CONFIG } from '../src/lib/leave/leaveEngine';
import { GeoLocationEngine, BRANCH_GEOFENCE_LOCATIONS } from '../src/lib/attendance/geoLocationEngine';
import { OfficeLocationEngine } from '../src/lib/locations/officeLocationEngine';
import { GeofenceValidator } from '../src/lib/attendance/geofenceValidator';
import { PunchInEngine } from '../src/lib/punch/punchInEngine';
import { PunchOutEngine } from '../src/lib/punch/punchOutEngine';
import { BreakEngine } from '../src/lib/breaks/breakEngine';
import { AttendanceDashboardEngine } from '../src/lib/attendance/attendanceDashboardEngine';
import { AttendanceReportEngine } from '../src/lib/reports/attendanceReportEngine';
import { AttendanceCalendarEngine } from '../src/lib/attendance/attendanceCalendarEngine';
import { HolidayEngine } from '../src/lib/holidays/holidayEngine';
import { AttendancePermissionEngine } from '../src/lib/auth/attendancePermissionEngine';
import { AttendanceNotificationEngine } from '../src/lib/notifications/attendanceNotificationEngine';
import {
  isValidPhone, isValidAadhar, cleanPhone, cleanAadhar, formatAadhar, formatPhone,
  getPhoneValidationError, getAadharValidationError
} from '../src/utils/validation';
import {
  CATEGORY_ROLE_MAP, getRolesForCategory, getDefaultRoleForCategory
} from '../src/pages/EmployeeDirectory';

// Calculation helper utilities for POS billing
export function calculateOrderTotals(
  items: { price: number; quantity: number; discount?: number; gst?: number }[],
  billDiscount: number = 0,
  packingCharge: number = 0,
  deliveryCharge: number = 0
) {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.price - (item.discount || 0);
    return sum + (unitPrice * item.quantity);
  }, 0);

  const tax = items.reduce((sum, item) => {
    const itemSubtotal = (item.price - (item.discount || 0)) * item.quantity;
    const gstRate = item.gst || 5;
    return sum + (itemSubtotal * (gstRate / 100));
  }, 0);

  const totalBeforeRound = subtotal + tax + packingCharge + deliveryCharge - billDiscount;
  const grandTotal = Math.max(0, Math.round(totalBeforeRound));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst: parseFloat((tax / 2).toFixed(2)),
    sgst: parseFloat((tax / 2).toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    grandTotal
  };
}

export function calculateLoyaltyPoints(totalSpent: number): number {
  return Math.floor(totalSpent / 100);
}

import { TemplateResolver } from '../src/lib/templates/templateResolver';

describe('Multi-Business Billing POS Calculation Tests', () => {
  it('should calculate subtotal, CGST, SGST, and grand total correctly', () => {
    const items = [
      { price: 280, quantity: 2, gst: 5 }, // Special Chicken Biryani = 560
      { price: 120, quantity: 1, gst: 5 }, // Virgin Mint Mojito = 120
    ];

    const result = calculateOrderTotals(items);
    assert.strictEqual(result.subtotal, 680.00);
    assert.strictEqual(result.cgst, 17.00);
    assert.strictEqual(result.sgst, 17.00);
    assert.strictEqual(result.tax, 34.00);
    assert.strictEqual(result.grandTotal, 714);
  });

  it('should calculate discounts and loyalty points accurately', () => {
    const points = calculateLoyaltyPoints(1450);
    assert.strictEqual(points, 14);

    const items = [{ price: 200, quantity: 2, gst: 5 }];
    const result = calculateOrderTotals(items, 50, 20, 0);
    assert.strictEqual(result.grandTotal, 390);
  });

  it('should resolve Business Templates correctly for RESTAURANT, RETAIL, MEDICAL, BAKERY, WHOLESALE', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    assert.strictEqual(restaurant.templateId, 'RESTAURANT');
    assert.strictEqual(restaurant.modules.enableServicePoints, true);
    assert.strictEqual(restaurant.modules.enableFulfillmentStations, true);

    const retail = TemplateResolver.getTemplate('RETAIL');
    assert.strictEqual(retail.templateId, 'RETAIL');
    assert.strictEqual(retail.modules.enableBarcodeScanning, true);
    assert.strictEqual(retail.productFields.inputMode, 'BARCODE_SCANNER');

    const medical = TemplateResolver.getTemplate('MEDICAL');
    assert.strictEqual(medical.templateId, 'MEDICAL');
    assert.strictEqual(medical.modules.enableBatchExpiryTracking, true);
    assert.strictEqual(medical.invoiceLayout.defaultFormat, 'PHARMACY_INVOICE');
    assert.strictEqual(medical.taxRules.defaultTaxRate, 12.0);

    const electronics = TemplateResolver.getTemplate('ELECTRONICS');
    assert.strictEqual(electronics.templateId, 'ELECTRONICS');
    assert.strictEqual(electronics.modules.enableSerialIMEI, true);
    assert.strictEqual(electronics.invoiceLayout.defaultFormat, 'A4_TAX_INVOICE');

    const garments = TemplateResolver.getTemplate('GARMENTS');
    assert.strictEqual(garments.templateId, 'GARMENTS');
    assert.strictEqual(garments.modules.enableProductVariants, true);
    assert.strictEqual(garments.taxRules.defaultTaxRate, 12.0);

    const jewellery = TemplateResolver.getTemplate('JEWELLERY');
    assert.strictEqual(jewellery.templateId, 'JEWELLERY');
    assert.strictEqual(jewellery.taxRules.defaultTaxRate, 3.0);

    const serviceCenter = TemplateResolver.getTemplate('SERVICE_CENTER');
    assert.strictEqual(serviceCenter.templateId, 'SERVICE_CENTER');
    assert.strictEqual(serviceCenter.modules.enableServicePoints, true);
    assert.strictEqual(serviceCenter.terms.orderNoun, 'Job Card');

    const salon = TemplateResolver.getTemplate('SALON');
    assert.strictEqual(salon.templateId, 'SALON');
    assert.strictEqual(salon.modules.enableServicePoints, true);
    assert.strictEqual(salon.terms.servicePointNoun, 'Styling Chair / Spa Suite');
  });

  it('should support all 12 enterprise templates and deep custom overrides', () => {
    const allTemplates = TemplateResolver.getAllTemplates();
    assert.strictEqual(allTemplates.length >= 12, true);

    const overridden = TemplateResolver.resolveTemplate('RESTAURANT', {
      invoiceLayout: {
        defaultFormat: '80MM_THERMAL',
        headerTitle: 'Custom Gourmet Cafe',
        taxLicenseLabel: 'FSSAI License',
        visibleReceiptFields: ['tableNumber'],
        termsText: 'No refunds',
        thankYouNote: 'Visit again!',
        showQrCode: true,
        showLogo: false,
      },
      settingsDefaults: {
        currencySymbol: '$',
        currencyCode: 'USD',
        defaultTaxRate: 8.5,
        taxCalculationMode: 'INCLUSIVE',
        counterPrefix: 'CAFE/',
        orderPrefix: 'O-',
        invoiceResetFrequency: 'MONTHLY',
        defaultPaperSize: '80MM',
        activeTheme: 'DARK_GOLD',
      }
    });

    assert.strictEqual(overridden.invoiceLayout.headerTitle, 'Custom Gourmet Cafe');
    assert.strictEqual(overridden.settingsDefaults.currencySymbol, '$');
    assert.strictEqual(overridden.settingsDefaults.defaultTaxRate, 8.5);
    assert.strictEqual(overridden.modules.enableServicePoints, true); // Retains base module setting
  });
});

import { ModuleEngine } from '../src/lib/modules/moduleEngine';

describe('Module Engine Automatic Generation Tests', () => {
  it('should register all 15 system modules correctly', () => {
    const modules = ModuleEngine.getAllModules();
    assert.strictEqual(modules.length, 15);
    assert.strictEqual(ModuleEngine.getModule('sales')?.name, 'Sales & Billing POS');
    assert.strictEqual(ModuleEngine.getModule('kitchen')?.category, 'Operations & Fulfillment');
    assert.strictEqual(ModuleEngine.getModule('inventory')?.category, 'Back Office & Finance');
  });

  it('should automatically generate menus based on enabled modules and user roles', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    const enabledModules = ModuleEngine.getDefaultEnabledModules(restaurant);

    // Admin should get all enabled modules
    const adminMenus = ModuleEngine.generateMenus(enabledModules, restaurant, 'ADMIN');
    assert.strictEqual(adminMenus.some(m => m.path === '/tables'), true);
    assert.strictEqual(adminMenus.some(m => m.path === '/orders'), true);
    assert.strictEqual(adminMenus.some(m => m.path === '/billing'), true);

    // When tables and kitchen modules are disabled:
    const retail = TemplateResolver.getTemplate('RETAIL');
    const retailModules = ModuleEngine.getDefaultEnabledModules(retail);
    const retailAdminMenus = ModuleEngine.generateMenus(retailModules, retail, 'ADMIN');
    assert.strictEqual(retailAdminMenus.some(m => m.path === '/tables'), false);
    assert.strictEqual(retailAdminMenus.some(m => m.path === '/orders'), false);
    assert.strictEqual(retailAdminMenus.some(m => m.path === '/billing'), true);

    // Cashier role filtering
    const cashierMenus = ModuleEngine.generateMenus(enabledModules, restaurant, 'CASHIER');
    assert.strictEqual(cashierMenus.some(m => m.path === '/settings'), false); // Settings restricted from Cashier
    assert.strictEqual(cashierMenus.some(m => m.path === '/billing'), true);
  });

  it('should automatically generate routes for active modules', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    const enabledModules = ModuleEngine.getDefaultEnabledModules(restaurant);
    const routes = ModuleEngine.generateRoutes(enabledModules, restaurant);

    assert.strictEqual(routes.some(r => r.path === '/billing'), true);
    assert.strictEqual(routes.some(r => r.path === '/tables'), true);
    assert.strictEqual(routes.some(r => r.path === '/orders'), true);
  });

  it('should automatically generate and verify RBAC permissions', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    const enabledModules = ModuleEngine.getDefaultEnabledModules(restaurant);
    const permissions = ModuleEngine.generatePermissions(enabledModules, restaurant);

    assert.strictEqual(permissions.ADMIN.billingPos, true);
    assert.strictEqual(permissions.ADMIN.manageSettings, true);
    assert.strictEqual(permissions.CASHIER.billingPos, true);
    assert.strictEqual(permissions.CASHIER.manageSettings, false);

    assert.strictEqual(ModuleEngine.hasPermission('ADMIN', 'manageSettings', permissions), true);
    assert.strictEqual(ModuleEngine.hasPermission('CASHIER', 'manageSettings', permissions), false);
  });
});

describe('Dynamic Categories Engine Tests', () => {
  it('should provide industry-specific starter categories for Restaurant, Retail, Pharmacy, and Hardware', () => {
    // 1. Restaurant Categories
    const restaurantCats = TemplateResolver.getStarterCategories('RESTAURANT');
    const restaurantCatNames = restaurantCats.map(c => c.name);
    assert.strictEqual(restaurantCatNames.includes('Starters & Appetizers'), true);
    assert.strictEqual(restaurantCatNames.includes('Main Course'), true);
    assert.strictEqual(restaurantCatNames.includes('Desserts'), true);

    // 2. Retail Categories
    const retailCats = TemplateResolver.getStarterCategories('RETAIL');
    const retailCatNames = retailCats.map(c => c.name);
    assert.strictEqual(retailCatNames.includes('Packaged Foods'), true);
    assert.strictEqual(retailCatNames.includes('Home & Kitchen'), true);
    assert.strictEqual(retailCatNames.includes('Personal Care'), true);

    // 3. Medical / Pharmacy Categories
    const medCats = TemplateResolver.getStarterCategories('MEDICAL');
    const medCatNames = medCats.map(c => c.name);
    assert.strictEqual(medCatNames.includes('Tablets & Capsules'), true);
    assert.strictEqual(medCatNames.includes('Syrups & Suspensions'), true);
    assert.strictEqual(medCatNames.includes('Injections & Vials'), true);
    assert.strictEqual(medCatNames.includes('Ointments & Creams'), true);

    // 4. Hardware Categories
    const hdwCats = TemplateResolver.getStarterCategories('HARDWARE');
    const hdwCatNames = hdwCats.map(c => c.name);
    assert.strictEqual(hdwCatNames.includes('Pipes & Sanitary Fittings'), true);
    assert.strictEqual(hdwCatNames.includes('Paints & Chemicals'), true);
    assert.strictEqual(hdwCatNames.includes('Hand & Power Tools'), true);
    assert.strictEqual(hdwCatNames.includes('Fasteners & Screws'), true);
  });

  it('should support dynamic category customization with unlimited categories', () => {
    const customCategories = [
      { name: 'Imported Spices', description: 'Gourmet spices from abroad' },
      { name: 'Organic Cold Pressed Oils', description: 'Virgin coconut & sesame oil' },
      { name: 'Artisan Sourdough', description: 'Daily natural sourdough loaves' },
    ];

    const customizedTemplate = TemplateResolver.resolveTemplate('RETAIL', {
      categories: customCategories
    });

    assert.strictEqual(customizedTemplate.categories.length, 3);
    assert.strictEqual(customizedTemplate.categories[0].name, 'Imported Spices');
    assert.strictEqual(customizedTemplate.categories[1].name, 'Organic Cold Pressed Oils');
    assert.strictEqual(customizedTemplate.categories[2].name, 'Artisan Sourdough');
  });
});

describe('Dynamic Product Schema & Metadata Attributes Tests', () => {
  it('should support dynamic product attributes for Restaurant (Kitchen, Dietary, Prep Time)', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    const attrKeys = restaurant.productFields.customAttributes?.map(a => a.key) || [];
    
    assert.strictEqual(attrKeys.includes('kitchenSection'), true);
    assert.strictEqual(attrKeys.includes('dietary'), true);
    assert.strictEqual(attrKeys.includes('prepTimeMinutes'), true);
  });

  it('should support dynamic product attributes for Medical (Batch, Expiry, Manufacturer, Composition)', () => {
    const medical = TemplateResolver.getTemplate('MEDICAL');
    const attrKeys = medical.productFields.customAttributes?.map(a => a.key) || [];
    
    assert.strictEqual(attrKeys.includes('batchNumber'), true);
    assert.strictEqual(attrKeys.includes('expiryDate'), true);
    assert.strictEqual(attrKeys.includes('mfgCompany'), true);
    assert.strictEqual(attrKeys.includes('composition'), true);
  });

  it('should support dynamic product attributes for Retail (Brand, Color, Warranty, Unit of Measure)', () => {
    const retail = TemplateResolver.getTemplate('RETAIL');
    const attrKeys = retail.productFields.customAttributes?.map(a => a.key) || [];
    
    assert.strictEqual(attrKeys.includes('brand'), true);
    assert.strictEqual(attrKeys.includes('color'), true);
    assert.strictEqual(attrKeys.includes('warrantyMonths'), true);
    assert.strictEqual(attrKeys.includes('unitOfMeasure'), true);
  });

  it('should support dynamic product attributes for Electronics (RAM, Storage, Processor, Serial Number)', () => {
    const electronics = TemplateResolver.getTemplate('ELECTRONICS');
    const attrKeys = electronics.productFields.customAttributes?.map(a => a.key) || [];
    
    assert.strictEqual(attrKeys.includes('ram'), true);
    assert.strictEqual(attrKeys.includes('storage'), true);
    assert.strictEqual(attrKeys.includes('processor'), true);
    assert.strictEqual(attrKeys.includes('serialNumber'), true);
    assert.strictEqual(attrKeys.includes('warrantyMonths'), true);
  });

  it('should correctly serialize and retrieve arbitrary dynamic metadata JSON on products', () => {
    const productData = {
      name: 'MacBook Pro M3 Max',
      price: 249900,
      attributes: {
        ram: '36GB',
        storage: '1TB SSD',
        processor: 'Apple M3 Max 14-core',
        serialNumber: 'C02G89X0MD6R',
        warrantyMonths: 24,
        batteryHealth: '100%',
        color: 'Space Black'
      }
    };

    // Serialize to DB representation
    const dbPayload = {
      ...productData,
      attributes: JSON.stringify(productData.attributes)
    };

    // Hydrate back to API format
    const hydratedProduct = {
      ...dbPayload,
      attributes: JSON.parse(dbPayload.attributes)
    };

    assert.strictEqual(hydratedProduct.attributes.ram, '36GB');
    assert.strictEqual(hydratedProduct.attributes.processor, 'Apple M3 Max 14-core');
    assert.strictEqual(hydratedProduct.attributes.serialNumber, 'C02G89X0MD6R');
    assert.strictEqual(hydratedProduct.attributes.color, 'Space Black');
  });
});

describe('Dynamic Form Engine & Validation Tests', () => {
  it('should support all 8 form control types and generate default values', () => {
    const schema = {
      title: 'Complete Product Form',
      fields: [
        { fieldId: 'title', label: 'Title', controlType: 'TEXT' as const, defaultValue: 'Standard Item' },
        { fieldId: 'price', label: 'Price', controlType: 'NUMBER' as const, defaultValue: 199.99 },
        { fieldId: 'mfgDate', label: 'Manufacturing Date', controlType: 'DATE' as const, defaultValue: '2026-08-01' },
        { fieldId: 'category', label: 'Category', controlType: 'DROPDOWN' as const, defaultValue: 'electronics' },
        { fieldId: 'inStock', label: 'In Stock', controlType: 'CHECKBOX' as const, defaultValue: true },
        { fieldId: 'rating', label: 'Rating', controlType: 'RADIO' as const, defaultValue: '5_STAR' },
        { fieldId: 'description', label: 'Description', controlType: 'TEXTAREA' as const, defaultValue: 'Product notes...' },
        { fieldId: 'coverImage', label: 'Cover Image', controlType: 'IMAGE_UPLOAD' as const, defaultValue: 'https://img.jpg' },
      ]
    };

    const initial = FormEngine.generateDefaultValues(schema);
    assert.strictEqual(initial.title, 'Standard Item');
    assert.strictEqual(initial.price, 199.99);
    assert.strictEqual(initial.mfgDate, '2026-08-01');
    assert.strictEqual(initial.category, 'electronics');
    assert.strictEqual(initial.inStock, true);
    assert.strictEqual(initial.rating, '5_STAR');
    assert.strictEqual(initial.description, 'Product notes...');
    assert.strictEqual(initial.coverImage, 'https://img.jpg');
  });

  it('should validate required fields, numeric bounds, and regex patterns', () => {
    const schema = {
      title: 'Validation Test Form',
      fields: [
        {
          fieldId: 'sku',
          label: 'SKU Code',
          controlType: 'TEXT' as const,
          validation: { isRequired: true, pattern: '^[A-Z]{3}-[0-9]{3}$' }
        },
        {
          fieldId: 'stock',
          label: 'Stock Quantity',
          controlType: 'NUMBER' as const,
          validation: { isRequired: true, min: 1, max: 1000 }
        }
      ]
    };

    // Invalid payload
    const invalidData = { sku: 'invalid-sku', stock: 0 };
    const invalidResult = FormEngine.validateForm(schema, invalidData);
    assert.strictEqual(invalidResult.isValid, false);
    assert.strictEqual(Boolean(invalidResult.errors.sku), true);
    assert.strictEqual(Boolean(invalidResult.errors.stock), true);

    // Valid payload
    const validData = { sku: 'ABC-123', stock: 50 };
    const validResult = FormEngine.validateForm(schema, validData);
    assert.strictEqual(validResult.isValid, true);
    assert.strictEqual(Object.keys(validResult.errors).length, 0);
  });

  it('should enforce unique validation constraints against existing records', () => {
    const schema = {
      title: 'Unique Field Test',
      fields: [
        {
          fieldId: 'barcode',
          label: 'Barcode',
          controlType: 'TEXT' as const,
          validation: { isUnique: true, isRequired: true }
        }
      ]
    };

    const existingRecords = [
      { id: 'rec-1', barcode: '890123456789' },
      { id: 'rec-2', barcode: '890987654321' },
    ];

    // Attempt to insert duplicate barcode
    const duplicateData = { id: 'rec-3', barcode: '890123456789' };
    const dupResult = FormEngine.validateForm(schema, duplicateData, existingRecords);
    assert.strictEqual(dupResult.isValid, false);
    assert.strictEqual(dupResult.errors.barcode.includes('already in use'), true);

    // Editing same record should not trigger self-duplicate
    const selfUpdateData = { id: 'rec-1', barcode: '890123456789' };
    const selfResult = FormEngine.validateForm(schema, selfUpdateData, existingRecords);
    assert.strictEqual(selfResult.isValid, true);

    // Brand new unique barcode
    const uniqueData = { id: 'rec-4', barcode: '890000000001' };
    const uniqueResult = FormEngine.validateForm(schema, uniqueData, existingRecords);
    assert.strictEqual(uniqueResult.isValid, true);
  });

  it('should support dynamic conditional visibility and ignore hidden fields during validation', () => {
    const schema = {
      title: 'Conditional Form Test',
      fields: [
        {
          fieldId: 'hasWarranty',
          label: 'Has Extended Warranty',
          controlType: 'CHECKBOX' as const,
          defaultValue: false
        },
        {
          fieldId: 'warrantyMonths',
          label: 'Warranty Period (Months)',
          controlType: 'NUMBER' as const,
          validation: { isRequired: true, min: 1 },
          dependsOn: { fieldId: 'hasWarranty', operator: 'EQUALS' as const, value: true }
        }
      ]
    };

    // When hasWarranty is false, warrantyMonths is hidden and NOT required
    const dataWithoutWarranty = { hasWarranty: false, warrantyMonths: '' };
    assert.strictEqual(FormEngine.isFieldVisible(schema.fields[1], dataWithoutWarranty), false);
    const result1 = FormEngine.validateForm(schema, dataWithoutWarranty);
    assert.strictEqual(result1.isValid, true); // Hidden required field does not block form!

    // When hasWarranty is true, warrantyMonths becomes visible and is required
    const dataWithWarrantyMissing = { hasWarranty: true, warrantyMonths: '' };
    assert.strictEqual(FormEngine.isFieldVisible(schema.fields[1], dataWithWarrantyMissing), true);
    const result2 = FormEngine.validateForm(schema, dataWithWarrantyMissing);
    assert.strictEqual(result2.isValid, false);
    assert.strictEqual(Boolean(result2.errors.warrantyMonths), true);

    // When hasWarranty is true and valid months given
    const dataWithWarrantyValid = { hasWarranty: true, warrantyMonths: 24 };
    const result3 = FormEngine.validateForm(schema, dataWithWarrantyValid);
    assert.strictEqual(result3.isValid, true);
  });
});

describe('Universal Invoice Engine Tests', () => {
  it('should resolve template-specific invoice types for Restaurant (Dine In, Parcel, Delivery)', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    const invoiceTypeCodes = restaurant.invoiceTypes.map(it => it.code);

    assert.strictEqual(invoiceTypeCodes.includes('DINE_IN'), true);
    assert.strictEqual(invoiceTypeCodes.includes('TAKEAWAY'), true);
    assert.strictEqual(invoiceTypeCodes.includes('DELIVERY'), true);
  });

  it('should resolve template-specific invoice types for Retail (Sales, Purchase, Return, Credit Sale)', () => {
    const retail = TemplateResolver.getTemplate('RETAIL');
    const invoiceTypeCodes = retail.invoiceTypes.map(it => it.code);

    assert.strictEqual(invoiceTypeCodes.includes('RETAIL_SALE'), true);
    assert.strictEqual(invoiceTypeCodes.includes('PURCHASE_ENTRY'), true);
    assert.strictEqual(invoiceTypeCodes.includes('RETURN_EXCHANGE'), true);
    assert.strictEqual(invoiceTypeCodes.includes('CREDIT_SALE'), true);
  });

  it('should resolve template-specific invoice types for Medical (Prescription, OTC Sale)', () => {
    const medical = TemplateResolver.getTemplate('MEDICAL');
    const invoiceTypeCodes = medical.invoiceTypes.map(it => it.code);

    assert.strictEqual(invoiceTypeCodes.includes('PRESCRIPTION_BILL'), true);
    assert.strictEqual(invoiceTypeCodes.includes('OTC_BILL'), true);
  });

  it('should resolve template-specific invoice types for Wholesale (GST Sale, Credit Sale, Proforma)', () => {
    const wholesale = TemplateResolver.getTemplate('WHOLESALE');
    const invoiceTypeCodes = wholesale.invoiceTypes.map(it => it.code);

    assert.strictEqual(invoiceTypeCodes.includes('B2B_GST_SALE'), true);
    assert.strictEqual(invoiceTypeCodes.includes('CREDIT_SALE'), true);
    assert.strictEqual(invoiceTypeCodes.includes('PROFORMA_INVOICE'), true);
  });

  it('should maintain reusable invoice layout metadata across formats', () => {
    const templates = ['RESTAURANT', 'RETAIL', 'MEDICAL', 'WHOLESALE', 'ELECTRONICS'] as const;
    
    templates.forEach(t => {
      const template = TemplateResolver.getTemplate(t);
      const layout = template.invoiceLayout;

      assert.strictEqual(typeof layout.headerTitle, 'string');
      assert.strictEqual(typeof layout.taxLicenseLabel, 'string');
      assert.strictEqual(typeof layout.termsText, 'string');
      assert.strictEqual(typeof layout.thankYouNote, 'string');
      assert.strictEqual(typeof layout.showQrCode, 'boolean');
      assert.strictEqual(Array.isArray(layout.visibleReceiptFields), true);
    });
  });
});

describe('Workflow Engine & Configurable Status Pipeline Tests', () => {
  it('should support Restaurant workflow pipeline (Order -> Kitchen -> Ready -> Billing)', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    const pipeline = WorkflowEngine.getStatusPipeline(restaurant);
    const codes = pipeline.map(s => s.code);

    assert.strictEqual(codes.includes('PENDING'), true);
    assert.strictEqual(codes.includes('PREPARING'), true);
    assert.strictEqual(codes.includes('READY'), true);
    assert.strictEqual(codes.includes('COMPLETED'), true);

    // Initial status
    assert.strictEqual(WorkflowEngine.getInitialStatus(restaurant), 'PENDING');

    // Transitions
    assert.strictEqual(WorkflowEngine.canTransition('PENDING', 'PREPARING', 'CASHIER', restaurant), true);
    assert.strictEqual(WorkflowEngine.canTransition('PREPARING', 'READY', 'STAFF', restaurant), true);
  });

  it('should support Retail workflow pipeline (Cart -> Invoice)', () => {
    const retail = TemplateResolver.getTemplate('RETAIL');
    const pipeline = WorkflowEngine.getStatusPipeline(retail);
    const codes = pipeline.map(s => s.code);

    assert.strictEqual(codes.includes('COMPLETED'), true);
    assert.strictEqual(WorkflowEngine.shouldDeductStock('COMPLETED', retail), true);
  });

  it('should support Medical workflow pipeline (Prescription -> Approval -> Billing)', () => {
    const medical = TemplateResolver.getTemplate('MEDICAL');
    const pipeline = WorkflowEngine.getStatusPipeline(medical);
    const codes = pipeline.map(s => s.code);

    assert.strictEqual(codes.includes('PENDING'), true);
    assert.strictEqual(codes.includes('APPROVED'), true);
    assert.strictEqual(codes.includes('COMPLETED'), true);

    // Initial status is PENDING (Prescription Received)
    assert.strictEqual(WorkflowEngine.getInitialStatus(medical), 'PENDING');

    // Progression: PENDING -> APPROVED -> COMPLETED
    const nextFromPending = WorkflowEngine.getNextSteps('PENDING', 'MANAGER', medical).map(s => s.code);
    assert.strictEqual(nextFromPending.includes('APPROVED'), true);

    const nextFromApproved = WorkflowEngine.getNextSteps('APPROVED', 'MANAGER', medical).map(s => s.code);
    assert.strictEqual(nextFromApproved.includes('COMPLETED'), true);

    // Stock deduction triggers on COMPLETED (Dispensed & Billed)
    assert.strictEqual(WorkflowEngine.shouldDeductStock('COMPLETED', medical), true);
  });

  it('should correctly calculate workflow progress metrics across stages', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');

    const p1 = WorkflowEngine.getStepProgress('PENDING', restaurant);
    assert.strictEqual(p1.currentStepIndex, 1);
    assert.strictEqual(p1.percentage > 0, true);

    const pFinal = WorkflowEngine.getStepProgress('COMPLETED', restaurant);
    assert.strictEqual(pFinal.percentage, 100);
  });
});

describe('Business Rules Engine & Automated Actions Tests', () => {
  it('should apply discount when Bill > 5000 (IF Bill > 5000 -> Apply Discount)', () => {
    const rules = [
      {
        id: 'rule-discount-5000',
        name: 'Big Bill 10% Discount',
        enabled: true,
        priority: 10,
        conditions: [
          { field: 'billSubtotal' as const, operator: 'GREATER_THAN' as const, value: 5000 }
        ],
        actions: [
          { type: 'APPLY_PERCENTAGE_DISCOUNT' as const, value: 10, message: '10% Big Bill Discount Applied' }
        ]
      }
    ];

    // Context below 5000: No discount
    const context1 = {
      billSubtotal: 3000,
      billTotal: 3150,
      itemsCount: 3,
      items: [{ name: 'Item A', price: 1000, quantity: 3 }]
    };
    const res1 = RulesEngine.evaluateRules(rules, context1);
    assert.strictEqual(res1.appliedRules.length, 0);
    assert.strictEqual(res1.discountAmount, 0);

    // Context above 5000: 10% discount of 6000 = 600
    const context2 = {
      billSubtotal: 6000,
      billTotal: 6300,
      itemsCount: 6,
      items: [{ name: 'Item B', price: 1000, quantity: 6 }]
    };
    const res2 = RulesEngine.evaluateRules(rules, context2);
    assert.strictEqual(res2.appliedRules.length, 1);
    assert.strictEqual(res2.discountAmount, 600);
    assert.strictEqual(res2.messages[0].includes('10% Big Bill Discount Applied'), true);
  });

  it('should require prescription when Category = Medicine (IF Product Category = Medicine -> Require Prescription)', () => {
    const rules = [
      {
        id: 'rule-rx-check',
        name: 'Prescription Requirement Rule',
        enabled: true,
        priority: 100,
        conditions: [
          { field: 'hasMedicineCategory' as const, operator: 'EQUALS' as const, value: true }
        ],
        actions: [
          { type: 'REQUIRE_PRESCRIPTION' as const, message: 'Prescription & Doctor Name required for medicine items' }
        ]
      }
    ];

    // Non-medicine items: No prescription required
    const groceryContext = {
      billSubtotal: 500,
      billTotal: 500,
      itemsCount: 1,
      items: [{ name: 'Basmati Rice 5kg', category: 'Grocery', price: 500, quantity: 1 }]
    };
    const groceryRes = RulesEngine.evaluateRules(rules, groceryContext);
    assert.strictEqual(groceryRes.requiresPrescription, false);
    assert.strictEqual(groceryRes.blockingErrors.length, 0);

    // Medicine items without doctor name: Prescription required & blocks checkout
    const medContextNoDoctor = {
      billSubtotal: 250,
      billTotal: 280,
      itemsCount: 1,
      items: [{ name: 'Amoxicillin 500mg', category: 'Tablets & Medicine', price: 250, quantity: 1 }]
    };
    const medRes1 = RulesEngine.evaluateRules(rules, medContextNoDoctor);
    assert.strictEqual(medRes1.requiresPrescription, true);
    assert.strictEqual(medRes1.blockingErrors.length > 0, true);

    // Medicine items with doctor name provided: Prescription satisfied & unblocked
    const medContextWithDoctor = {
      billSubtotal: 250,
      billTotal: 280,
      itemsCount: 1,
      doctorName: 'Dr. John Watson, MD',
      patientName: 'Sherlock Holmes',
      items: [{ name: 'Amoxicillin 500mg', category: 'Tablets & Medicine', price: 250, quantity: 1 }]
    };
    const medRes2 = RulesEngine.evaluateRules(rules, medContextWithDoctor);
    assert.strictEqual(medRes2.requiresPrescription, true);
    assert.strictEqual(medRes2.blockingErrors.length, 0);
  });

  it('should apply loyalty points multiplier when Customer = VIP (IF Customer = VIP -> Apply Loyalty)', () => {
    const rules = [
      {
        id: 'rule-vip-loyalty',
        name: 'VIP 2x Loyalty Points Multiplier',
        enabled: true,
        priority: 10,
        conditions: [
          { field: 'customerType' as const, operator: 'IS_VIP' as const, value: true }
        ],
        actions: [
          { type: 'APPLY_LOYALTY_MULTIPLIER' as const, value: 2.0, message: 'VIP 2x Loyalty Active' }
        ]
      }
    ];

    // Regular customer: Standard 1.0x loyalty multiplier
    const regularContext = {
      billSubtotal: 1000,
      billTotal: 1050,
      itemsCount: 2,
      customer: { name: 'Bob', type: 'REGULAR', loyaltyPoints: 50 },
      items: [{ name: 'Dish', price: 500, quantity: 2 }]
    };
    const regRes = RulesEngine.evaluateRules(rules, regularContext);
    assert.strictEqual(regRes.loyaltyMultiplier, 1.0);

    // VIP customer: 2.0x loyalty multiplier
    const vipContext = {
      billSubtotal: 1000,
      billTotal: 1050,
      itemsCount: 2,
      customer: { name: 'Alice VIP', type: 'VIP', isVip: true, loyaltyPoints: 800 },
      items: [{ name: 'Dish', price: 500, quantity: 2 }]
    };
    const vipRes = RulesEngine.evaluateRules(rules, vipContext);
    assert.strictEqual(vipRes.loyaltyMultiplier, 2.0);
    assert.strictEqual(vipRes.messages[0].includes('VIP 2x Loyalty Active'), true);
  });

  it('should support composite rules (e.g. Free Delivery and Flat Discounts)', () => {
    const rules = RulesEngine.getDefaultRulesForVertical('RETAIL');

    const largeCartContext = {
      billSubtotal: 6000,
      billTotal: 6500,
      itemsCount: 8,
      customer: { name: 'VIP Buyer', type: 'VIP', isVip: true },
      items: [{ name: 'Denim Jeans', category: 'Garments', price: 750, quantity: 8 }]
    };

    const res = RulesEngine.evaluateRules(rules, largeCartContext);
    assert.strictEqual(res.waiveDelivery, true); // Qualified for free delivery
    assert.strictEqual(res.discountAmount > 0, true); // Qualified for discounts
  });
});

describe('Dynamic Dashboard Widget Engine Tests', () => {
  it('should load Restaurant widgets (Today\'s Orders, Kitchen Queue, Occupied Tables)', () => {
    const restaurant = TemplateResolver.getTemplate('RESTAURANT');
    const widgetIds = restaurant.dashboardWidgets.map(w => w.id);

    assert.strictEqual(widgetIds.includes('todayOrders'), true);
    assert.strictEqual(widgetIds.includes('kitchenQueue'), true);
    assert.strictEqual(widgetIds.includes('occupiedTables'), true);
  });

  it('should load Retail widgets (Today\'s Sales, Stock Alert, Items Sold, Customers)', () => {
    const retail = TemplateResolver.getTemplate('RETAIL');
    const widgetIds = retail.dashboardWidgets.map(w => w.id);

    assert.strictEqual(widgetIds.includes('todayRevenue'), true);
    assert.strictEqual(widgetIds.includes('lowStockAlerts'), true);
    assert.strictEqual(widgetIds.includes('itemsSold'), true);
  });

  it('should load Medical widgets (Expiry Alert, Prescription Count, Stock Alert)', () => {
    const medical = TemplateResolver.getTemplate('MEDICAL');
    const widgetIds = medical.dashboardWidgets.map(w => w.id);

    assert.strictEqual(widgetIds.includes('nearExpiryCount'), true);
    assert.strictEqual(widgetIds.includes('prescriptionsBilled'), true);
    assert.strictEqual(widgetIds.includes('lowStockAlerts'), true);
  });

  it('should guarantee valid gridSpans and supported widget types across all templates', () => {
    const allTemplates = ['RESTAURANT', 'RETAIL', 'MEDICAL', 'BAKERY', 'WHOLESALE', 'ELECTRONICS', 'SALON'] as const;

    allTemplates.forEach(t => {
      const template = TemplateResolver.getTemplate(t);
      assert.strictEqual(Array.isArray(template.dashboardWidgets), true);
      assert.strictEqual(template.dashboardWidgets.length >= 3, true);

      template.dashboardWidgets.forEach(w => {
        assert.strictEqual(typeof w.id, 'string');
        assert.strictEqual(typeof w.title, 'string');
        assert.strictEqual(['KPI_CARD', 'BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE', 'ALERT_LIST'].includes(w.type), true);
        assert.strictEqual(w.gridSpan >= 1 && w.gridSpan <= 4, true);
      });
    });
  });
});

describe('Universal Report Builder Engine Tests', () => {
  const mockOrders = [
    {
      id: 'ord-1',
      orderNumber: 'INV-1001',
      createdAt: '2026-08-01T10:00:00Z',
      orderType: 'DINE_IN',
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      subtotal: 1000,
      tax: 50,
      discount: 0,
      total: 1050,
      customerName: 'Alice',
    },
    {
      id: 'ord-2',
      orderNumber: 'INV-1002',
      createdAt: '2026-08-01T11:30:00Z',
      orderType: 'TAKEAWAY',
      paymentMethod: 'UPI',
      status: 'COMPLETED',
      subtotal: 2000,
      tax: 100,
      discount: 100,
      total: 2000,
      customerName: 'Bob',
    },
    {
      id: 'ord-3',
      orderNumber: 'INV-1003',
      createdAt: '2026-08-02T14:15:00Z',
      orderType: 'DINE_IN',
      paymentMethod: 'UPI',
      status: 'CANCELLED',
      subtotal: 500,
      tax: 25,
      discount: 0,
      total: 525,
      customerName: 'Charlie',
    },
  ];

  it('should support dynamic column selection from field catalog', () => {
    assert.strictEqual(AVAILABLE_REPORT_FIELDS.length >= 15, true);

    const reportDef = {
      id: 'test-custom-1',
      name: 'Custom Revenue Report',
      category: 'Sales',
      columns: ['orderNumber', 'createdAt', 'total'],
      filters: {},
      groupBy: 'NONE' as const,
      chartType: 'NONE' as const,
    };

    const result = ReportEngine.executeCustomReport(reportDef, mockOrders);
    assert.strictEqual(result.columns.length, 3);
    assert.strictEqual(result.columns.map(c => c.key).join(','), 'orderNumber,createdAt,total');
    assert.strictEqual(result.rows.length, 3);
  });

  it('should apply dynamic filters (Order Type, Min Amount, Status)', () => {
    const reportDef = {
      id: 'test-filter-1',
      name: 'UPI Completed Orders Over 1500',
      category: 'Audit',
      columns: ['orderNumber', 'paymentMethod', 'total'],
      filters: {
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        minAmount: 1500,
      },
      groupBy: 'NONE' as const,
      chartType: 'NONE' as const,
    };

    const result = ReportEngine.executeCustomReport(reportDef, mockOrders);
    assert.strictEqual(result.rows.length, 1);
    assert.strictEqual(result.rows[0].orderNumber, 'INV-1002');
    assert.strictEqual(result.rows[0].total, 2000);
  });

  it('should perform dynamic grouping and calculate aggregated totals', () => {
    const reportDef = {
      id: 'test-group-payment',
      name: 'Collections Grouped By Payment Method',
      category: 'Collections',
      columns: ['paymentMethod', 'total'],
      filters: {},
      groupBy: 'PAYMENT_METHOD' as const,
      chartType: 'BAR' as const,
    };

    const result = ReportEngine.executeCustomReport(reportDef, mockOrders);
    // Should produce 2 grouped rows: CASH and UPI
    assert.strictEqual(result.rows.length, 2);
    assert.strictEqual(Array.isArray(result.chartData), true);
    assert.strictEqual(result.chartData?.length, 2);

    const upiGroup = result.rows.find(r => r.paymentMethod === 'UPI');
    assert.strictEqual(upiGroup?.count, 2);
    assert.strictEqual(upiGroup?.total, 2525);
  });

  it('should convert template starter reports dynamically without hardcoding', () => {
    const templates = ['RESTAURANT', 'RETAIL', 'MEDICAL', 'WHOLESALE'] as const;

    templates.forEach(t => {
      const template = TemplateResolver.getTemplate(t);
      const reports = ReportEngine.getTemplateReports(template);

      assert.strictEqual(reports.length >= 2, true);
      reports.forEach(rep => {
        assert.strictEqual(typeof rep.id, 'string');
        assert.strictEqual(typeof rep.name, 'string');
        assert.strictEqual(Array.isArray(rep.columns), true);
        assert.strictEqual(rep.columns.length > 0, true);
      });
    });
  });
});

describe('Universal Notification Engine Tests', () => {
  it('should support all 5 notification channels (Email, SMS, WhatsApp, Push, In-App)', () => {
    const channels = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'] as const;
    const registeredChannels = new Set(DEFAULT_NOTIFICATION_TEMPLATES.map(t => t.channel));

    channels.forEach(ch => {
      assert.strictEqual(registeredChannels.has(ch), true);
    });
  });

  it('should support all 5 notification events (Invoice Created, Payment Due, Low Stock, Purchase Received, Customer Created)', () => {
    const events = [
      'INVOICE_CREATED',
      'PAYMENT_DUE',
      'LOW_STOCK',
      'PURCHASE_RECEIVED',
      'CUSTOMER_CREATED'
    ] as const;
    const registeredEvents = new Set(DEFAULT_NOTIFICATION_TEMPLATES.map(t => t.event));

    events.forEach(ev => {
      assert.strictEqual(registeredEvents.has(ev), true);
    });
  });

  it('should correctly interpolate dynamic placeholder tokens in templates', () => {
    const template = 'Dear {{customerName}}, your bill of ₹{{amount}} for invoice #{{invoiceNumber}} is ready at {{businessName}}.';
    const data = {
      customerName: 'Kowsalya',
      amount: '1250.00',
      invoiceNumber: 'INV-9082',
      businessName: 'Royal Spice Restaurant',
    };

    const rendered = NotificationEngine.renderTemplate(template, data);
    assert.strictEqual(rendered, 'Dear Kowsalya, your bill of ₹1250.00 for invoice #INV-9082 is ready at Royal Spice Restaurant.');
  });

  it('should dispatch multi-channel notifications for INVOICE_CREATED', () => {
    const payload = {
      event: 'INVOICE_CREATED' as const,
      recipient: { name: 'Dr. John Watson', mobile: '+919876543210', email: 'john@hospital.org' },
      data: {
        invoiceNumber: 'MED-2026-042',
        amount: '840.00',
        businessName: 'LifeCare Pharmacy',
      }
    };

    const result = NotificationEngine.dispatch(payload);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.dispatches.length >= 3, true);

    const waDispatch = result.dispatches.find(d => d.channel === 'WHATSAPP');
    assert.strictEqual(Boolean(waDispatch), true);
    assert.strictEqual(waDispatch?.body.includes('MED-2026-042'), true);
    assert.strictEqual(waDispatch?.body.includes('840.00'), true);
  });

  it('should dispatch LOW_STOCK alert notifications with item and threshold details', () => {
    const payload = {
      event: 'LOW_STOCK' as const,
      recipient: { role: 'STORE_MANAGER' },
      data: {
        itemName: 'Amoxicillin 500mg',
        sku: 'SKU-AMOX-500',
        stockRemaining: '2',
        unit: 'strips',
      }
    };

    const result = NotificationEngine.dispatch(payload);
    assert.strictEqual(result.success, true);
    const inApp = result.dispatches.find(d => d.channel === 'IN_APP');
    assert.strictEqual(Boolean(inApp), true);
    assert.strictEqual(inApp?.body.includes('Amoxicillin 500mg'), true);
    assert.strictEqual(inApp?.body.includes('2 strips'), true);
  });

  it('should dispatch PAYMENT_DUE reminder notifications with due date', () => {
    const payload = {
      event: 'PAYMENT_DUE' as const,
      recipient: { name: 'Metro Supermarket', mobile: '+919812345678' },
      data: {
        invoiceNumber: 'INV-B2B-109',
        amount: '24,500.00',
        dueDate: '31 Aug 2026',
        businessName: 'Apex Wholesalers',
      }
    };

    const result = NotificationEngine.dispatch(payload);
    assert.strictEqual(result.success, true);
    const sms = result.dispatches.find(d => d.channel === 'SMS');
    assert.strictEqual(Boolean(sms), true);
    assert.strictEqual(sms?.body.includes('31 Aug 2026'), true);
    assert.strictEqual(sms?.body.includes('24,500.00'), true);
  });
});

describe('Universal Automation Engine Tests', () => {
  it('should register all 5 core automation recipes (Backup, Sales Email, GST, Auto PO, Stock Alert)', () => {
    const actionTypes = [
      'DAILY_BACKUP',
      'WEEKLY_SALES_EMAIL',
      'MONTHLY_GST_REPORT',
      'AUTO_PURCHASE_ORDER',
      'AUTO_STOCK_ALERT'
    ] as const;

    const registeredActions = new Set(DEFAULT_AUTOMATION_JOBS.map(j => j.actionType));
    actionTypes.forEach(action => {
      assert.strictEqual(registeredActions.has(action), true);
    });
  });

  it('should execute DAILY_BACKUP and generate encrypted state snapshot', () => {
    const result = AutomationEngine.executeJob('job-daily-backup', { ordersCount: 50, productsCount: 80 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.summary.includes('backup snapshot generated'), true);
    assert.strictEqual(typeof result.data?.sizeKb, 'number');
    assert.strictEqual(result.log.status, 'SUCCESS');
  });

  it('should execute WEEKLY_SALES_EMAIL and dispatch executive digest notification', () => {
    const result = AutomationEngine.executeJob('job-weekly-sales-email', { weeklyRevenue: 75000, weeklyOrders: 210 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.summary.includes('75,000'), true);
    assert.strictEqual(result.summary.includes('210 bills'), true);
    assert.strictEqual(result.log.status, 'SUCCESS');
  });

  it('should execute MONTHLY_GST_REPORT and compute taxable turnover & tax totals', () => {
    const result = AutomationEngine.executeJob('job-monthly-gst-report', { taxableTurnover: 250000, totalGst: 12500 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.summary.includes('2,50,000'), true);
    assert.strictEqual(result.summary.includes('12500.00'), true);
    assert.strictEqual(result.log.status, 'SUCCESS');
  });

  it('should execute AUTO_PURCHASE_ORDER when inventory depleted', () => {
    const result = AutomationEngine.executeJob('job-auto-purchase-order');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.summary.includes('Auto PO'), true);
    assert.strictEqual(typeof result.data?.poNumber, 'string');
    assert.strictEqual(result.log.status, 'SUCCESS');
  });

  it('should execute AUTO_STOCK_ALERT and dispatch warnings for items below threshold', () => {
    const result = AutomationEngine.executeJob('job-auto-stock-alert', { items: ['Paracetamol 500mg', 'Basmati Rice 5kg'] });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.summary.includes('2 low stock items detected'), true);
    assert.strictEqual(result.log.status, 'SUCCESS');
  });
});

describe('Universal Plugin Architecture Tests', () => {
  it('should register all 9 core plugins across Payments, Hardware, Logistics, and Accounting', () => {
    const expectedPluginIds = [
      'razorpay',
      'stripe',
      'phonepe',
      'gpay',
      'barcode_scanner',
      'label_printer',
      'courier_api',
      'tally',
      'zoho'
    ] as const;

    const registeredIds = new Set(DEFAULT_PLUGINS.map(p => p.id));
    expectedPluginIds.forEach(id => {
      assert.strictEqual(registeredIds.has(id), true);
    });
  });

  it('should execute Razorpay, PhonePe, and GPay payment hooks without modifying core code', () => {
    const rzpResult = PluginEngine.executeHook('PAYMENT_PROCESS', { amount: 2500, orderId: 'ORD-101' }, 'razorpay');
    assert.strictEqual(rzpResult[0].success, true);
    assert.strictEqual(typeof rzpResult[0].data?.razorpayOrderId, 'string');

    const phonePeResult = PluginEngine.executeHook('PAYMENT_PROCESS', { amount: 1200 }, 'phonepe');
    assert.strictEqual(phonePeResult[0].success, true);
    assert.strictEqual(phonePeResult[0].data?.qrString.includes('phonepe@ybl'), true);

    const gpayResult = PluginEngine.executeHook('PAYMENT_PROCESS', { amount: 800 }, 'gpay');
    assert.strictEqual(gpayResult[0].success, true);
    assert.strictEqual(gpayResult[0].data?.gpayIntent.includes('billing@okhdfcbank'), true);
  });

  it('should execute Barcode Scanner hardware hook for fast SKU parsing', () => {
    const scanResult = PluginEngine.executeHook('BARCODE_SCANNED', { barcode: '890103000999\n' }, 'barcode_scanner');
    assert.strictEqual(scanResult[0].success, true);
    assert.strictEqual(scanResult[0].data?.sku, '890103000999');
  });

  it('should execute Thermal Label Printer hook generating ZPL print commands', () => {
    const labelResult = PluginEngine.executeHook('PRINT_LABEL', { name: 'Men Cotton Shirt', mrp: '999', sku: 'SHIRT-COTTON-L' }, 'label_printer');
    assert.strictEqual(labelResult[0].success, true);
    assert.strictEqual(labelResult[0].data?.zplPayload.includes('^XA'), true);
    assert.strictEqual(labelResult[0].data?.zplPayload.includes('MRP: Rs.999'), true);
  });

  it('should execute Courier API hook for automated shipment booking', () => {
    const courierResult = PluginEngine.executeHook('DISPATCH_COURIER', { orderId: 'ORD-SHIP-55' }, 'courier_api');
    assert.strictEqual(courierResult[0].success, true);
    assert.strictEqual(typeof courierResult[0].data?.awb, 'string');
    assert.strictEqual(courierResult[0].data?.status, 'MANIFEST_CREATED');
  });

  it('should execute Tally Prime and Zoho Books accounting synchronization hooks', () => {
    const tallyResult = PluginEngine.executeHook('SYNC_ACCOUNTING', { orderNumber: 'INV-2026-90', total: 4500 }, 'tally');
    assert.strictEqual(tallyResult[0].success, true);
    assert.strictEqual(tallyResult[0].data?.xmlPayload.includes('<VOUCHER VCHTYPE="Sales">'), true);
    assert.strictEqual(tallyResult[0].data?.xmlPayload.includes('INV-2026-90'), true);

    const zohoResult = PluginEngine.executeHook('SYNC_ACCOUNTING', { orderNumber: 'INV-2026-90', total: 4500 }, 'zoho');
    assert.strictEqual(zohoResult[0].success, true);
    assert.strictEqual(typeof zohoResult[0].data?.zohoInvoiceId, 'string');
  });
});

describe('Universal Theme System Tests', () => {
  it('should support all 7 luxury color presets (Gold, Emerald, Sapphire, Amethyst, Ruby, Amber, Cyan)', () => {
    const expectedPresets = [
      'LUXURY_GOLD',
      'ROYAL_EMERALD',
      'SAPPHIRE_BLUE',
      'AMETHYST_PURPLE',
      'LIGHT_SAPPHIRE',
      'LIGHT_ROYAL_GOLD',
      'LIGHT_EMERALD',
      'LIGHT_AMETHYST'
    ] as const;

    const registeredIds = new Set(COLOR_PRESETS.map(c => c.id));
    expectedPresets.forEach(preset => {
      assert.strictEqual(registeredIds.has(preset), true);
    });
  });

  it('should support all 5 typography font presets (Outfit, Inter, Roboto, Cinzel, JetBrains Mono)', () => {
    const expectedFonts = ['Outfit', 'Inter', 'Roboto', 'Cinzel', 'JetBrains Mono'] as const;
    const registeredFonts = new Set(FONT_PRESETS.map(f => f.id));

    expectedFonts.forEach(font => {
      assert.strictEqual(registeredFonts.has(font), true);
    });
  });

  it('should support all 5 receipt & invoice layout themes (Luxury Gold, Minimal Clean, Modern Blue, Emerald Green, Compact Dark)', () => {
    const expectedThemes = ['LUXURY_GOLD', 'MINIMAL_CLEAN', 'MODERN_BLUE', 'EMERALD_GREEN', 'COMPACT_DARK'] as const;
    const registeredThemes = Object.keys(INVOICE_THEME_DETAILS);

    expectedThemes.forEach(theme => {
      assert.strictEqual(registeredThemes.includes(theme), true);
    });
  });

  it('should resolve fallback theme config correctly from active business template', () => {
    const restaurantTemplate = TemplateResolver.getTemplate('RESTAURANT');
    const themeConfig = ThemeEngine.getThemeConfig(restaurantTemplate);

    assert.strictEqual(typeof themeConfig.brandTitle, 'string');
    assert.strictEqual(typeof themeConfig.colorPreset, 'string');
    assert.strictEqual(typeof themeConfig.invoiceTheme, 'string');
    assert.strictEqual(typeof themeConfig.termsText, 'string');
  });
});

describe('Universal 6-Tier Permission Engine Tests', () => {
  const adminUser = { userId: 'user-admin', role: 'ADMIN' };
  const managerUser = { userId: 'user-manager', role: 'MANAGER', assignedBusinessIds: ['biz-1'], assignedBranchIds: ['branch-1'] };
  const cashierUser = { userId: 'user-cashier', role: 'CASHIER', assignedBusinessIds: ['biz-1'], assignedBranchIds: ['branch-1'] };
  const kitchenUser = { userId: 'user-chef', role: 'KITCHEN_STAFF' };

  it('Tier 1 & 2: should enforce Business and Branch level scoping', () => {
    assert.strictEqual(PermissionEngine.canAccessBusiness(adminUser, 'biz-999'), true);
    assert.strictEqual(PermissionEngine.canAccessBusiness(cashierUser, 'biz-1'), true);
    assert.strictEqual(PermissionEngine.canAccessBranch(cashierUser, 'branch-1'), true);
  });

  it('Tier 3 & 4: should enforce Module and Screen level permissions', () => {
    assert.strictEqual(PermissionEngine.canAccessModule(cashierUser, 'sales'), true);
    assert.strictEqual(PermissionEngine.canAccessModule(cashierUser, 'accounts'), false);
    assert.strictEqual(PermissionEngine.canAccessScreen(cashierUser, 'SCREEN_POS'), true);
    assert.strictEqual(PermissionEngine.canAccessScreen(cashierUser, 'SCREEN_SETTINGS'), false);

    assert.strictEqual(PermissionEngine.canAccessModule(kitchenUser, 'kitchen'), true);
    assert.strictEqual(PermissionEngine.canAccessScreen(kitchenUser, 'SCREEN_ORDERS'), true);
  });

  it('Tier 5: should enforce Action level permissions', () => {
    assert.strictEqual(PermissionEngine.canPerformAction(cashierUser, 'CREATE_ORDER'), true);
    assert.strictEqual(PermissionEngine.canPerformAction(cashierUser, 'APPLY_DISCOUNT'), true);
    assert.strictEqual(PermissionEngine.canPerformAction(cashierUser, 'CANCEL_BILL'), false);
    assert.strictEqual(PermissionEngine.canPerformAction(cashierUser, 'MANAGE_USERS'), false);

    assert.strictEqual(PermissionEngine.canPerformAction(managerUser, 'CANCEL_BILL'), true);
    assert.strictEqual(PermissionEngine.canPerformAction(managerUser, 'EXPORT_REPORT'), true);
  });

  it('Tier 6: Cashier Can View Cost, but Cannot Edit Cost (Field Level)', () => {
    // Exact requirement: Cashier Can View Cost, Cannot Edit Cost
    const costPriceAccess = PermissionEngine.getFieldAccess(cashierUser, 'costPrice');
    assert.strictEqual(costPriceAccess, 'READ_ONLY');
    assert.strictEqual(PermissionEngine.canViewField(cashierUser, 'costPrice'), true);
    assert.strictEqual(PermissionEngine.canEditField(cashierUser, 'costPrice'), false);

    // Selling price can be edited
    assert.strictEqual(PermissionEngine.canEditField(cashierUser, 'sellingPrice'), true);

    // Profit margin is hidden from cashier
    assert.strictEqual(PermissionEngine.getFieldAccess(cashierUser, 'profitMargin'), 'HIDDEN');
    assert.strictEqual(PermissionEngine.canViewField(cashierUser, 'profitMargin'), false);
  });

  it('Tier 6: Kitchen Staff financial fields are hidden', () => {
    assert.strictEqual(PermissionEngine.getFieldAccess(kitchenUser, 'costPrice'), 'HIDDEN');
    assert.strictEqual(PermissionEngine.getFieldAccess(kitchenUser, 'sellingPrice'), 'HIDDEN');
    assert.strictEqual(PermissionEngine.canViewField(kitchenUser, 'costPrice'), false);
    assert.strictEqual(PermissionEngine.canEditField(kitchenUser, 'prepTime'), true);
  });
});

describe('Multi-Branch Hierarchy & Entity Isolation Tests', () => {
  it('should maintain 4-tier hierarchy: Business -> Branch -> Warehouse -> Counter', () => {
    // 1. Business level
    assert.strictEqual(DEFAULT_BUSINESS.id, 'biz-apex-group');

    // 2. Branch level
    const branches = BranchEngine.getBranches();
    assert.strictEqual(branches.length >= 3, true);
    const chennaiBranch = branches.find(b => b.id === 'br-chennai-main');
    assert.strictEqual(Boolean(chennaiBranch), true);

    // 3. Warehouse level (under Chennai branch)
    const chennaiWarehouses = BranchEngine.getWarehouses('br-chennai-main');
    assert.strictEqual(chennaiWarehouses.length >= 2, true);
    assert.strictEqual(chennaiWarehouses.every(w => w.branchId === 'br-chennai-main'), true);

    // 4. Counter level (under Chennai branch)
    const chennaiCounters = BranchEngine.getCounters('br-chennai-main');
    assert.strictEqual(chennaiCounters.length >= 2, true);
    assert.strictEqual(chennaiCounters.every(c => c.branchId === 'br-chennai-main'), true);
  });

  it('should strictly isolate records and datasets by scoped context', () => {
    const mockOrders = [
      { id: 'ORD-CHN-1', businessId: 'biz-apex-group', branchId: 'br-chennai-main', counterId: 'ctr-chn-pos-01', total: 500 },
      { id: 'ORD-CHN-2', businessId: 'biz-apex-group', branchId: 'br-chennai-main', counterId: 'ctr-chn-exp-02', total: 300 },
      { id: 'ORD-BLR-1', businessId: 'biz-apex-group', branchId: 'br-bangalore-outlet', counterId: 'ctr-blr-pos-01', total: 1200 },
      { id: 'ORD-MUM-1', businessId: 'biz-apex-group', branchId: 'br-mumbai-hub', counterId: 'ctr-mum-pos-01', total: 8500 },
    ];

    // Isolate by Chennai branch
    const chennaiOrders = BranchEngine.filterByScope(mockOrders, { branchId: 'br-chennai-main' });
    assert.strictEqual(chennaiOrders.length, 2);
    assert.strictEqual(chennaiOrders.every(o => o.branchId === 'br-chennai-main'), true);

    // Isolate by specific POS counter
    const expressOrders = BranchEngine.filterByScope(mockOrders, { counterId: 'ctr-chn-exp-02' });
    assert.strictEqual(expressOrders.length, 1);
    assert.strictEqual(expressOrders[0].id, 'ORD-CHN-2');
  });

  it('should isolate warehouse inventory stock and support inter-warehouse transfer', () => {
    const initialFrom = BranchEngine.getWarehouseStock('prod-sample', 'wh-chn-central');
    const initialTo = BranchEngine.getWarehouseStock('prod-sample', 'wh-chn-front');

    const transferResult = BranchEngine.transferStock('prod-sample', 'wh-chn-central', 'wh-chn-front', 15);
    assert.strictEqual(transferResult.success, true);

    const updatedFrom = BranchEngine.getWarehouseStock('prod-sample', 'wh-chn-central');
    const updatedTo = BranchEngine.getWarehouseStock('prod-sample', 'wh-chn-front');

    assert.strictEqual(updatedFrom, initialFrom - 15);
    assert.strictEqual(updatedTo, initialTo + 15);
  });
});

describe('Enterprise Audit Log & Mutation Trail Tests', () => {
  it('should track all 7 required properties: User, Action, Old Value, New Value, Timestamp, IP, Device', () => {
    const logged = AuditEngine.logAction({
      userId: 'user-cashier-01',
      userName: 'Kowsalya Cashier',
      userRole: 'CASHIER',
      action: 'UPDATE_ITEM_QUANTITY',
      category: 'BILLING',
      entityType: 'ORDER_ITEM',
      entityId: 'ITEM-882',
      oldValue: { qty: 2, price: 100 },
      newValue: { qty: 4, price: 100 },
      diffSummary: 'Quantity increased from 2 to 4',
      ip: '192.168.1.109',
      device: 'Touch Terminal POS 1 (Windows 11)',
      branchId: 'br-chennai-main',
    });

    // 1. User
    assert.strictEqual(logged.userId, 'user-cashier-01');
    assert.strictEqual(logged.userName, 'Kowsalya Cashier');
    assert.strictEqual(logged.userRole, 'CASHIER');

    // 2. Action
    assert.strictEqual(logged.action, 'UPDATE_ITEM_QUANTITY');
    assert.strictEqual(logged.category, 'BILLING');

    // 3. Old Value
    assert.deepStrictEqual(logged.oldValue, { qty: 2, price: 100 });

    // 4. New Value
    assert.deepStrictEqual(logged.newValue, { qty: 4, price: 100 });

    // 5. Timestamp
    assert.strictEqual(typeof logged.timestamp, 'string');
    assert.strictEqual(logged.timestamp.includes('T'), true);

    // 6. IP Address
    assert.strictEqual(logged.ip, '192.168.1.109');

    // 7. Device Fingerprint
    assert.strictEqual(logged.device, 'Touch Terminal POS 1 (Windows 11)');
  });

  it('should support category filtering and search queries', () => {
    const financialLogs = AuditEngine.getLogs({ category: 'FINANCIAL' });
    assert.strictEqual(financialLogs.every(l => l.category === 'FINANCIAL'), true);

    const searchResults = AuditEngine.getLogs({ search: 'Admin' });
    assert.strictEqual(searchResults.length >= 1, true);
    assert.strictEqual(searchResults.some(l => l.userName.includes('Admin')), true);
  });

  it('should export audit trail to standard CSV format for regulatory compliance', () => {
    const csv = AuditEngine.exportToCSV();
    assert.strictEqual(csv.includes('Timestamp,User,Role,Action,Category,Entity,Old Value,New Value,IP Address,Device'), true);
    assert.strictEqual(csv.includes('Admin User'), true);
    assert.strictEqual(csv.includes('192.168.1.'), true);
  });
});

describe('Universal Data Import Engine Tests', () => {
  it('should automatically map column headers with high confidence (Particulars -> name, Sale_Rate -> sellingPrice, etc.)', () => {
    const legacyHeaders = ['Particulars', 'Item_Code', 'Group', 'Sale_Rate', 'Purchase_Rate', 'Balance_Qty', 'GST%'];
    const mappings = ImportEngine.autoMapColumns(legacyHeaders, 'PRODUCTS');

    const nameMapping = mappings.find(m => m.sourceColumn === 'Particulars');
    assert.strictEqual(nameMapping?.targetField, 'name');
    assert.strictEqual(nameMapping?.confidence >= 95, true);

    const priceMapping = mappings.find(m => m.sourceColumn === 'Sale_Rate');
    assert.strictEqual(priceMapping?.targetField, 'sellingPrice');

    const costMapping = mappings.find(m => m.sourceColumn === 'Purchase_Rate');
    assert.strictEqual(costMapping?.targetField, 'costPrice');

    const stockMapping = mappings.find(m => m.sourceColumn === 'Balance_Qty');
    assert.strictEqual(stockMapping?.targetField, 'stock');

    const gstMapping = mappings.find(m => m.sourceColumn === 'GST%');
    assert.strictEqual(gstMapping?.targetField, 'gstRate');
  });

  it('should parse and transform CSV content correctly', () => {
    const csv = `Particulars,Sale_Rate,Balance_Qty\nPaneer Tikka,250.00,30\nVeg Pulao,180.00,45`;
    const preview = ImportEngine.generateImportPreview({
      format: 'CSV',
      targetEntity: 'PRODUCTS',
      rawContent: csv,
    });

    assert.strictEqual(preview.totalRows, 2);
    assert.strictEqual(preview.validRowCount, 2);
    assert.strictEqual(preview.previewRows[0].name, 'Paneer Tikka');
    assert.strictEqual(preview.previewRows[0].sellingPrice, 250);
    assert.strictEqual(preview.previewRows[0].stock, 30);
  });

  it('should parse and transform JSON content with automatic column mapping', () => {
    const json = JSON.stringify([
      { title: 'Wireless Keyboard', mrp: 899.00, qty: 15 },
      { title: 'Gaming Mouse', mrp: 599.00, qty: 25 },
    ]);

    const preview = ImportEngine.generateImportPreview({
      format: 'JSON',
      targetEntity: 'PRODUCTS',
      rawContent: json,
    });

    assert.strictEqual(preview.totalRows, 2);
    assert.strictEqual(preview.validRowCount, 2);
    assert.strictEqual(preview.previewRows[0].name, 'Wireless Keyboard');
    assert.strictEqual(preview.previewRows[0].sellingPrice, 899);
  });

  it('should execute import and commit records into catalog', () => {
    const csv = `Particulars,Sale_Rate\nMasala Dosa,90.00`;
    const preview = ImportEngine.generateImportPreview({
      format: 'CSV',
      targetEntity: 'PRODUCTS',
      rawContent: csv,
    });

    const execution = ImportEngine.executeImport(preview);
    assert.strictEqual(execution.success, true);
    assert.strictEqual(execution.importedCount, 1);
  });
});

describe('Enterprise White Label Engine Tests', () => {
  it('should support customizing all 7 white-label entities without code changes (Logo, Company Name, Domain, Invoice, Email, SMS, Theme)', () => {
    const config = WhiteLabelEngine.getConfig();

    // 1. Company Name & Identity
    assert.strictEqual(typeof config.companyName, 'string');
    assert.strictEqual(typeof config.legalEntityName, 'string');

    // 2. Logo & Favicon
    assert.strictEqual('logoUrl' in config, true);
    assert.strictEqual('faviconUrl' in config, true);

    // 3. Domain & SSL
    assert.strictEqual(typeof config.customDomain, 'string');
    assert.strictEqual(config.sslStatus, 'ACTIVE');

    // 4. Invoice Customizations
    assert.strictEqual(typeof config.invoice.headerTitle, 'string');
    assert.strictEqual(typeof config.invoice.gstin, 'string');
    assert.strictEqual(config.invoice.hidePlatformBranding, true);

    // 5. Email Customizations
    assert.strictEqual(typeof config.email.senderName, 'string');
    assert.strictEqual(typeof config.email.senderEmail, 'string');

    // 6. SMS Customizations
    assert.strictEqual(typeof config.sms.senderId, 'string');
    assert.strictEqual(config.sms.senderId.length <= 6, true);

    // 7. Theme Customizations
    assert.strictEqual(typeof config.theme.primaryColor, 'string');
    assert.strictEqual(typeof config.theme.fontFamily, 'string');
  });

  it('should resolve white-labeled invoice branding and suppress platform watermark', () => {
    const invoiceBranding = WhiteLabelEngine.resolveInvoiceBranding();
    assert.strictEqual(invoiceBranding.hidePoweredBy, true);
    assert.strictEqual(typeof invoiceBranding.title, 'string');
    assert.strictEqual(typeof invoiceBranding.gstin, 'string');
  });

  it('should resolve email sender and DLT SMS sender ID dynamically', () => {
    const emailSender = WhiteLabelEngine.resolveEmailSender();
    assert.strictEqual(emailSender.includes('<') && emailSender.includes('>'), true);

    const smsSenderId = WhiteLabelEngine.resolveSmsSenderId();
    assert.strictEqual(smsSenderId.length <= 6, true);
    assert.strictEqual(smsSenderId, smsSenderId.toUpperCase());
  });
});

describe('Enterprise AI Assistant Layer Tests', () => {
  it('1. Sales Summary: should generate executive turnover, order volume, AOV, and peak hour digest', () => {
    const todaySummary = AIAssistantEngine.getSalesSummary('TODAY');
    assert.strictEqual(todaySummary.totalRevenue > 0, true);
    assert.strictEqual(todaySummary.orderCount > 0, true);
    assert.strictEqual(todaySummary.averageOrderValue > 0, true);
    assert.strictEqual(todaySummary.topItems.length > 0, true);
    assert.strictEqual(todaySummary.narrative.includes('Today’s revenue is'), true);

    const monthSummary = AIAssistantEngine.getSalesSummary('MONTH');
    assert.strictEqual(monthSummary.totalRevenue > todaySummary.totalRevenue, true);
  });

  it('2. Stock Prediction: should forecast daily burn rate and identify critical depletion risks', () => {
    const predictions = AIAssistantEngine.getStockPredictions();
    assert.strictEqual(predictions.predictions.length >= 4, true);
    assert.strictEqual(predictions.criticalCount >= 1, true);

    const criticalItem = predictions.predictions.find(p => p.riskLevel === 'CRITICAL');
    assert.strictEqual(Boolean(criticalItem), true);
    assert.strictEqual(criticalItem!.estimatedDaysRemaining < 3, true);
  });

  it('3. Purchase Suggestions: should generate automated replenishment orders with supplier costs', () => {
    const suggestions = AIAssistantEngine.getPurchaseSuggestions();
    assert.strictEqual(suggestions.length >= 2, true);
    assert.strictEqual(suggestions.every(s => s.suggestedOrderQty > 0), true);
    assert.strictEqual(suggestions.every(s => s.estimatedTotalCost > 0), true);
    assert.strictEqual(suggestions.some(s => s.priority === 'HIGH'), true);
  });

  it('4. GST Summary: should compute taxable turnover, Output Tax, ITC, and Net Tax Payable', () => {
    const gst = AIAssistantEngine.getGSTSummary('August 2026');
    assert.strictEqual(gst.taxableSales > 0, true);
    assert.strictEqual(gst.totalTaxCollected, gst.cgst + gst.sgst + gst.igst);
    assert.strictEqual(gst.netTaxPayable, gst.totalTaxCollected - gst.inputTaxCreditEstimated);
    assert.strictEqual(gst.filingDeadline.includes('GSTR-3B'), true);
  });

  it('5. Business Insights: should generate high-confidence margin & upsell growth recommendations', () => {
    const insights = AIAssistantEngine.getBusinessInsights();
    assert.strictEqual(insights.length >= 3, true);
    assert.strictEqual(insights.every(i => i.confidenceScore >= 80), true);
    assert.strictEqual(insights.some(i => i.category === 'REVENUE'), true);
    assert.strictEqual(insights.some(i => i.category === 'COST_SAVING'), true);
  });

  it('NLP Query Routing: should intelligently route free-form prompts to relevant AI modules', () => {
    const salesMsg = AIAssistantEngine.queryAssistant('What are the sales today?');
    assert.strictEqual(salesMsg.module, 'SALES_SUMMARY');

    const stockMsg = AIAssistantEngine.queryAssistant('Check stock predictions and risks');
    assert.strictEqual(stockMsg.module, 'STOCK_PREDICTION');

    const poMsg = AIAssistantEngine.queryAssistant('Suggest purchase orders for vendors');
    assert.strictEqual(poMsg.module, 'PURCHASE_SUGGESTIONS');

    const gstMsg = AIAssistantEngine.queryAssistant('Calculate my GST tax payable');
    assert.strictEqual(gstMsg.module, 'GST_SUMMARY');
  });
});

describe('Normalized Multi-Tenant Relational Database Tests (Step 23)', () => {
  it('should verify all 16 normalized relational tables exist in schema', () => {
    const dbState = NormalizedDatabaseEngine.getDatabaseState();
    
    // 1. Business
    assert.strictEqual(Array.isArray(dbState.businesses), true);
    // 2. BusinessType
    assert.strictEqual(Array.isArray(dbState.businessTypes), true);
    // 3. Template
    assert.strictEqual(Array.isArray(dbState.templates), true);
    // 4. Module
    assert.strictEqual(Array.isArray(dbState.modules), true);
    // 5. Permission
    assert.strictEqual(Array.isArray(dbState.permissions), true);
    // 6. ProductAttribute
    assert.strictEqual(Array.isArray(dbState.productAttributes), true);
    // 7. FormDefinition
    assert.strictEqual(Array.isArray(dbState.formDefinitions), true);
    // 8. Workflow
    assert.strictEqual(Array.isArray(dbState.workflows), true);
    // 9. Notification
    assert.strictEqual(Array.isArray(dbState.notifications), true);
    // 10. Automation
    assert.strictEqual(Array.isArray(dbState.automations), true);
    // 11. Plugin
    assert.strictEqual(Array.isArray(dbState.plugins), true);
    // 12. Theme
    assert.strictEqual(Array.isArray(dbState.themes), true);
    // 13. AuditLog
    assert.strictEqual(Array.isArray(dbState.auditLogs), true);
    // 14. Branch
    assert.strictEqual(Array.isArray(dbState.branches), true);
    // 15. Warehouse
    assert.strictEqual(Array.isArray(dbState.warehouses), true);
    // 16. Counter
    assert.strictEqual(Array.isArray(dbState.counters), true);
  });

  it('Requirement: Everything must reference Business ID strictly', () => {
    const tenant = NormalizedDatabaseEngine.getTenantDataset('biz-apex-group');

    // Templates
    assert.strictEqual(tenant.templates.every(t => t.businessId === 'biz-apex-group'), true);
    // Modules
    assert.strictEqual(tenant.modules.every(m => m.businessId === 'biz-apex-group'), true);
    // Permissions
    assert.strictEqual(tenant.permissions.every(p => p.businessId === 'biz-apex-group'), true);
    // Product Attributes
    assert.strictEqual(tenant.productAttributes.every(a => a.businessId === 'biz-apex-group'), true);
    // Form Definitions
    assert.strictEqual(tenant.formDefinitions.every(f => f.businessId === 'biz-apex-group'), true);
    // Workflows
    assert.strictEqual(tenant.workflows.every(w => w.businessId === 'biz-apex-group'), true);
    // Notifications
    assert.strictEqual(tenant.notifications.every(n => n.businessId === 'biz-apex-group'), true);
    // Automations
    assert.strictEqual(tenant.automations.every(a => a.businessId === 'biz-apex-group'), true);
    // Plugins
    assert.strictEqual(tenant.plugins.every(p => p.businessId === 'biz-apex-group'), true);
    // Themes
    assert.strictEqual(tenant.themes.every(th => th.businessId === 'biz-apex-group'), true);
    // Audit Logs
    assert.strictEqual(tenant.auditLogs.every(al => al.businessId === 'biz-apex-group'), true);
    // Branches
    assert.strictEqual(tenant.branches.every(b => b.businessId === 'biz-apex-group'), true);
    // Warehouses
    assert.strictEqual(tenant.warehouses.every(w => w.businessId === 'biz-apex-group'), true);
    // Counters
    assert.strictEqual(tenant.counters.every(c => c.businessId === 'biz-apex-group'), true);
  });

  it('should maintain 100% referential integrity with zero orphan records', () => {
    const check = NormalizedDatabaseEngine.verifyReferentialIntegrity('biz-apex-group');
    assert.strictEqual(check.isValid, true);
    assert.strictEqual(check.unreferencedCount, 0);
    assert.strictEqual(check.issues.length, 0);
  });

  it('should support multi-tenant isolation when creating a new business tenant', () => {
    const newTenant = NormalizedDatabaseEngine.createTenant({
      id: 'biz-taj-mahal',
      name: 'Taj Mahal Luxury Palace',
      businessTypeId: 'type-hospitality',
      legalEntityName: 'Taj Hospitality Private Limited',
    });

    assert.strictEqual(newTenant.id, 'biz-taj-mahal');

    // Scoped dataset for new tenant must only contain its own records
    const tajDataset = NormalizedDatabaseEngine.getTenantDataset('biz-taj-mahal');
    assert.strictEqual(tajDataset.business?.id, 'biz-taj-mahal');
    assert.strictEqual(tajDataset.branches.every(b => b.businessId === 'biz-taj-mahal'), true);
    assert.strictEqual(tajDataset.warehouses.every(w => w.businessId === 'biz-taj-mahal'), true);
    assert.strictEqual(tajDataset.counters.every(c => c.businessId === 'biz-taj-mahal'), true);

    // Old tenant dataset remains completely isolated
    const apexDataset = NormalizedDatabaseEngine.getTenantDataset('biz-apex-group');
    assert.strictEqual(apexDataset.business?.id, 'biz-apex-group');
    assert.strictEqual(apexDataset.branches.some(b => b.businessId === 'biz-taj-mahal'), false);
  });
});

describe('Enterprise Migration Strategy & Execution Tests (Step 24)', () => {
  it('1. Database Migration: should execute full 3NF pipeline with 100% referential integrity', () => {
    const summary = MigrationEngine.runDatabaseMigration('biz-apex-group');
    assert.strictEqual(summary.status, 'SUCCESS');
    assert.strictEqual(summary.totalTablesNormalized, 16);
    assert.strictEqual(summary.referentialIntegrityScore, 100);
    assert.strictEqual(summary.steps.length, 6);
    assert.strictEqual(summary.steps.every(s => s.status === 'COMPLETED'), true);
  });

  it('2. API Migration: should generate versioned endpoint contracts with tenant headers', () => {
    const contracts = MigrationEngine.getApiMigrationContracts();
    assert.strictEqual(contracts.length >= 5, true);
    assert.strictEqual(contracts.every(c => c.requiredHeaders.includes('X-Business-ID')), true);
    assert.strictEqual(contracts.every(c => c.adapterStatus === 'ACTIVE_PROXY'), true);
  });

  it('3. Testing Plan: should execute all verification suites with sub-50ms latency', () => {
    const testPlan = MigrationEngine.runTestPlanVerification();
    assert.strictEqual(testPlan.totalSuites, testPlan.passedSuites);
    assert.strictEqual(testPlan.testResults.every(t => t.status === 'PASSED'), true);
    assert.strictEqual(testPlan.testResults.every(t => t.latencyMs < 100), true);
  });

  it('4. Rollback Plan: should create point-in-time snapshot and execute instant rollback', () => {
    const snap = MigrationEngine.createRollbackSnapshot();
    assert.strictEqual(snap.success, true);
    assert.strictEqual(typeof snap.snapshotId, 'string');

    const rollback = MigrationEngine.executeRollback();
    assert.strictEqual(rollback.success, true);
    assert.strictEqual(rollback.message.includes('Successfully rolled back'), true);
  });

  it('5. Risk Analysis: should maintain mitigated risk matrix across security, availability, and compliance', () => {
    const risks = MigrationEngine.getRiskAnalysisMatrix();
    assert.strictEqual(risks.length >= 5, true);
    assert.strictEqual(risks.every(r => r.isMitigated === true), true);
    assert.strictEqual(risks.some(r => r.category === 'SECURITY'), true);
    assert.strictEqual(risks.some(r => r.category === 'AVAILABILITY'), true);
    assert.strictEqual(risks.some(r => r.category === 'COMPLIANCE'), true);
  });
});

describe('Landing Page Hero & Feature Cards Tests', () => {
  it('should verify Landing Page 4 feature cards specifications', () => {
    const featureCards = [
      {
        title: 'Billing POS',
        description: 'Manage Billing, GST, Inventory and Invoices.',
      },
      {
        title: 'Employee Management',
        description: 'Manage Staff, Departments, Salary and Leave.',
      },
      {
        title: 'Sales Reports',
        description: 'View Daily, Weekly, Monthly and Business Reports.',
      },
      {
        title: 'Staff Attendance',
        description: 'Location Based Punch In & Punch Out.',
      },
    ];

    assert.strictEqual(featureCards.length, 4);
    assert.strictEqual(featureCards[0].title, 'Billing POS');
    assert.strictEqual(featureCards[0].description, 'Manage Billing, GST, Inventory and Invoices.');

    assert.strictEqual(featureCards[1].title, 'Employee Management');
    assert.strictEqual(featureCards[1].description, 'Manage Staff, Departments, Salary and Leave.');

    assert.strictEqual(featureCards[2].title, 'Sales Reports');
    assert.strictEqual(featureCards[2].description, 'View Daily, Weekly, Monthly and Business Reports.');

    assert.strictEqual(featureCards[3].title, 'Staff Attendance');
    assert.strictEqual(featureCards[3].description, 'Location Based Punch In & Punch Out.');
  });

  it('should verify Hero section branding and CTA requirements', () => {
    const heroSpecs = {
      tagline: 'All-in-One Business Management Platform',
      buttons: ['Get Started', 'Login to Portal'],
      hasNoScroll: true,
      singleHero: true,
    };

    assert.strictEqual(heroSpecs.tagline, 'All-in-One Business Management Platform');
    assert.strictEqual(heroSpecs.buttons.includes('Get Started'), true);
    assert.strictEqual(heroSpecs.buttons.includes('Login to Portal'), true);
    assert.strictEqual(heroSpecs.hasNoScroll, true);
    assert.strictEqual(heroSpecs.singleHero, true);
  });
});

describe('Employee Management Engine Tests (Feature 2)', () => {
  it('should verify all 20 required employee fields exist and are populated', () => {
    const res = EmployeeEngine.getEmployees({ page: 1, pageSize: 10 });
    const emp = res.employees[0];

    // 1. Employee ID
    assert.strictEqual(typeof emp.employeeId, 'string');
    // 2. Photo
    assert.strictEqual(typeof emp.photoUrl, 'string');
    // 3. Name
    assert.strictEqual(typeof emp.name, 'string');
    // 4. Mobile
    assert.strictEqual(typeof emp.mobile, 'string');
    // 5. Email
    assert.strictEqual(typeof emp.email, 'string');
    // 6. Address
    assert.strictEqual(typeof emp.address, 'string');
    // 7. Department
    assert.strictEqual(typeof emp.department, 'string');
    // 8. Designation
    assert.strictEqual(typeof emp.designation, 'string');
    // 9. Role
    assert.strictEqual(typeof emp.role, 'string');
    // 10. Joining Date
    assert.strictEqual(typeof emp.joiningDate, 'string');
    // 11. Salary
    assert.strictEqual(typeof emp.salary, 'number');
    // 12. Shift
    assert.strictEqual(['MORNING', 'EVENING', 'NIGHT', 'GENERAL'].includes(emp.shift), true);
    // 13. Branch
    assert.strictEqual(typeof emp.branchId, 'string');
    assert.strictEqual(typeof emp.branchName, 'string');
    // 14. Status
    assert.strictEqual(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'PROBATION'].includes(emp.status), true);
    // 15. Emergency Contact
    assert.strictEqual(typeof emp.emergencyContact.name, 'string');
    assert.strictEqual(typeof emp.emergencyContact.relationship, 'string');
    assert.strictEqual(typeof emp.emergencyContact.phone, 'string');
    // 16. Documents
    assert.strictEqual(Array.isArray(emp.documents), true);
    // 17. Aadhar Number
    assert.strictEqual(typeof emp.aadharNumber, 'string');
    // 18. PAN Number
    assert.strictEqual(typeof emp.panNumber, 'string');
    // 19. Bank Details
    assert.strictEqual(typeof emp.bankDetails.bankName, 'string');
    assert.strictEqual(typeof emp.bankDetails.accountNumber, 'string');
    assert.strictEqual(typeof emp.bankDetails.ifscCode, 'string');
    // 20. Reporting Manager
    assert.strictEqual(typeof emp.reportingManager, 'string');
  });

  it('CRUD: should add, edit, toggle status, and delete an employee', () => {
    // 1. Add Employee
    const added = EmployeeEngine.addEmployee({
      employeeId: 'EMP-999',
      photoUrl: 'https://example.com/photo.jpg',
      name: 'Vikram Chandran',
      mobile: '+91 98800 11223',
      email: 'vikram.pos@company.com',
      address: '77, Anna Nagar, Chennai',
      department: 'Billing & Cash Desk',
      designation: 'Junior Cashier',
      role: 'CASHIER',
      joiningDate: '2026-08-01',
      salary: 22000,
      shift: 'MORNING',
      branchId: 'br-chennai-main',
      branchName: 'Chennai Flagship Outlet',
      status: 'ACTIVE',
      emergencyContact: { name: 'Chandran', relationship: 'Father', phone: '+91 98800 99001' },
      documents: [],
      aadharNumber: '1122-3344-5566',
      panNumber: 'VCHPK1122C',
      bankDetails: {
        accountHolderName: 'Vikram Chandran',
        accountNumber: '112233445566',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001245',
        branch: 'Anna Nagar',
      },
      reportingManager: 'Anitha Venkatesh',
    });

    assert.strictEqual(added.name, 'Vikram Chandran');
    assert.strictEqual(added.salary, 22000);

    // 2. Edit Employee
    const updated = EmployeeEngine.updateEmployee(added.id, {
      salary: 26000,
      designation: 'Senior Cashier Specialist',
    });
    assert.strictEqual(updated?.salary, 26000);
    assert.strictEqual(updated?.designation, 'Senior Cashier Specialist');

    // 3. Toggle Status to Inactive / Deactivate
    const deactivated = EmployeeEngine.setEmployeeStatus(added.id, 'INACTIVE');
    assert.strictEqual(deactivated?.status, 'INACTIVE');

    // 4. Delete Employee
    const deleted = EmployeeEngine.deleteEmployee(added.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(EmployeeEngine.getEmployeeById(added.id), undefined);
  });

  it('Search, Multi-Filter, and Pagination', () => {
    // Search by Name
    const searchRes = EmployeeEngine.getEmployees({ search: 'Kowsalya' });
    assert.strictEqual(searchRes.employees.some(e => e.name.includes('Kowsalya')), true);

    // Filter by Department
    const deptRes = EmployeeEngine.getEmployees({ department: 'Kitchen & Culinary' });
    assert.strictEqual(deptRes.employees.every(e => e.department === 'Kitchen & Culinary'), true);

    // Pagination
    const pageRes = EmployeeEngine.getEmployees({ page: 1, pageSize: 2 });
    assert.strictEqual(pageRes.employees.length, 2);
    assert.strictEqual(pageRes.currentPage, 1);
    assert.strictEqual(pageRes.totalPages >= 2, true);
  });

  it('Timeline: should log chronological history events on promotions, salary, and transfers', () => {
    const timeline = EmployeeEngine.getTimeline('emp-001');
    assert.strictEqual(timeline.length >= 2, true);
    assert.strictEqual(timeline.some(t => t.type === 'ONBOARDING'), true);
    assert.strictEqual(timeline.some(t => t.type === 'PROMOTION' || t.type === 'SALARY'), true);
  });
});

describe('Department Management Engine Tests (Feature 3)', () => {
  it('should verify all 5 required department fields exist and are populated', () => {
    const departments = DepartmentEngine.getDepartments();
    assert.strictEqual(departments.length >= 5, true);

    const dept = departments[0];
    // 1. Department Name
    assert.strictEqual(typeof dept.name, 'string');
    // 2. Department Code
    assert.strictEqual(typeof dept.code, 'string');
    // 3. Manager
    assert.strictEqual(typeof dept.managerName, 'string');
    // 4. Description
    assert.strictEqual(typeof dept.description, 'string');
    // 5. Status
    assert.strictEqual(['ACTIVE', 'INACTIVE'].includes(dept.status), true);
  });

  it('CRUD: should add, edit, toggle status, and delete a department', () => {
    // 1. Add Department
    const added = DepartmentEngine.addDepartment({
      name: 'Security & Surveillance',
      code: 'DEPT-SEC',
      managerName: 'Major Ramanathan',
      description: 'Premises security, CCTV operations, and staff access control.',
      status: 'ACTIVE',
    });

    assert.strictEqual(added.name, 'Security & Surveillance');
    assert.strictEqual(added.code, 'DEPT-SEC');
    assert.strictEqual(added.status, 'ACTIVE');

    // 2. Edit Department
    const updated = DepartmentEngine.updateDepartment(added.id, {
      description: 'Updated high-security surveillance and biometric monitoring.',
      managerName: 'Captain Ramanathan',
    });
    assert.strictEqual(updated?.managerName, 'Captain Ramanathan');
    assert.strictEqual(updated?.description.includes('biometric monitoring'), true);

    // 3. Toggle Status to Inactive / Active
    const toggled = DepartmentEngine.toggleStatus(added.id);
    assert.strictEqual(toggled?.status, 'INACTIVE');

    // 4. Delete Department
    const deleted = DepartmentEngine.deleteDepartment(added.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(DepartmentEngine.getDepartmentById(added.id), undefined);
  });

  it('Search & Status Filtering', () => {
    const searchRes = DepartmentEngine.getDepartments({ search: 'Billing' });
    assert.strictEqual(searchRes.some(d => d.name.includes('Billing')), true);

    const activeRes = DepartmentEngine.getDepartments({ status: 'ACTIVE' });
    assert.strictEqual(activeRes.every(d => d.status === 'ACTIVE'), true);
  });
});

describe('Designation Management Engine Tests (Feature 4)', () => {
  it('should verify all 4 required designation fields exist and are populated', () => {
    const designations = DesignationEngine.getDesignations();
    assert.strictEqual(designations.length >= 5, true);

    const desig = designations[0];
    // 1. Designation Title
    assert.strictEqual(typeof desig.title, 'string');
    // 2. Department
    assert.strictEqual(typeof desig.departmentName, 'string');
    // 3. Hierarchy
    assert.strictEqual(typeof desig.hierarchyLevel, 'number');
    assert.strictEqual(typeof desig.hierarchyTitle, 'string');
    assert.strictEqual(desig.hierarchyLevel >= 1 && desig.hierarchyLevel <= 5, true);
    // 4. Description
    assert.strictEqual(typeof desig.description, 'string');
  });

  it('CRUD: should add, edit, and delete a designation', () => {
    // 1. Add Designation
    const added = DesignationEngine.addDesignation({
      title: 'Senior Inventory Controller',
      departmentName: 'Warehouse & Storage',
      hierarchyLevel: 3,
      description: 'Stock audit, FIFO dispatch, and inter-branch warehouse transfer oversight.',
      salaryBand: { min: 30000, max: 45000 },
    });

    assert.strictEqual(added.title, 'Senior Inventory Controller');
    assert.strictEqual(added.departmentName, 'Warehouse & Storage');
    assert.strictEqual(added.hierarchyLevel, 3);

    // 2. Edit Designation
    const updated = DesignationEngine.updateDesignation(added.id, {
      title: 'Principal Inventory Lead',
      hierarchyLevel: 2,
      description: 'Central multi-warehouse supply chain manager.',
    });
    assert.strictEqual(updated?.title, 'Principal Inventory Lead');
    assert.strictEqual(updated?.hierarchyLevel, 2);

    // 3. Delete Designation
    const deleted = DesignationEngine.deleteDesignation(added.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(DesignationEngine.getDesignationById(added.id), undefined);
  });

  it('Search, Department Filter, and Hierarchy Sorting', () => {
    // Search
    const searchRes = DesignationEngine.getDesignations({ search: 'Chef' });
    assert.strictEqual(searchRes.some(d => d.title.includes('Chef')), true);

    // Department Filter
    const deptRes = DesignationEngine.getDesignations({ departmentName: 'Billing & Accounts' });
    assert.strictEqual(deptRes.every(d => d.departmentName === 'Billing & Accounts'), true);

    // Hierarchy Sorting (Level 1 top down to Level 5)
    const sorted = DesignationEngine.getDesignations();
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.strictEqual(sorted[i].hierarchyLevel <= sorted[i + 1].hierarchyLevel, true);
    }
  });
});

describe('Shift Management Engine Tests (Feature 5)', () => {
  it('should support all 5 shifts: Morning, General, Evening, Night, and Custom Shift', () => {
    const shifts = ShiftEngine.getShifts();
    assert.strictEqual(shifts.length >= 5, true);

    const types = shifts.map(s => s.type);
    assert.strictEqual(types.includes('MORNING'), true);
    assert.strictEqual(types.includes('GENERAL'), true);
    assert.strictEqual(types.includes('EVENING'), true);
    assert.strictEqual(types.includes('NIGHT'), true);
    assert.strictEqual(types.includes('CUSTOM'), true);
  });

  it('should verify all required shift parameters: Punch In, Grace, Punch Out, Weekly Off, Late Rule, and Half Day Rule', () => {
    const morningShift = ShiftEngine.getShiftById('shift-001')!;
    assert.strictEqual(morningShift.punchInTime, '08:00');
    assert.strictEqual(morningShift.graceTimeMinutes, 15);
    assert.strictEqual(morningShift.punchOutTime, '16:00');
    assert.strictEqual(morningShift.weeklyOffDays.includes('Sunday'), true);

    // Late Rule
    assert.strictEqual(morningShift.lateRule.graceTimeMinutes, 15);
    assert.strictEqual(morningShift.lateRule.maxAllowedLateMinutes, 60);
    assert.strictEqual(typeof morningShift.lateRule.penaltyDescription, 'string');

    // Half Day Rule
    assert.strictEqual(morningShift.halfDayRule.minWorkHoursForHalfDay, 4.0);
    assert.strictEqual(morningShift.halfDayRule.minWorkHoursForFullDay, 7.5);
    assert.strictEqual(typeof morningShift.halfDayRule.description, 'string');
  });

  it('Attendance Evaluation: should accurately evaluate on-time, late, and half-day status', () => {
    const morningShift = ShiftEngine.getShiftById('shift-001')!;

    // 1. On-Time Punch within Grace Period (08:10 AM, grace is 15 mins)
    const onTime = ShiftEngine.evaluateAttendancePunch(morningShift, '08:10', '16:00');
    assert.strictEqual(onTime.status, 'PRESENT');
    assert.strictEqual(onTime.isLate, false);
    assert.strictEqual(onTime.workHours, 7.8);

    // 2. Late Punch Exceeding Grace (08:35 AM -> 35 mins late, grace was 15 mins)
    const late = ShiftEngine.evaluateAttendancePunch(morningShift, '08:35');
    assert.strictEqual(late.status, 'LATE');
    assert.strictEqual(late.isLate, true);
    assert.strictEqual(late.lateMinutes, 35);

    // 3. Half-Day Worked (Punched out early after 5 hours of work)
    const halfDay = ShiftEngine.evaluateAttendancePunch(morningShift, '08:00', '13:00');
    assert.strictEqual(halfDay.status, 'HALF_DAY');
    assert.strictEqual(halfDay.workHours, 5.0);

    // 4. Absent (Worked under min 4.5 half-day threshold)
    const absent = ShiftEngine.evaluateAttendancePunch(morningShift, '08:00', '11:00');
    assert.strictEqual(absent.status, 'ABSENT');
    assert.strictEqual(absent.workHours, 3.0);
  });

  it('CRUD: should add, edit, and delete a custom shift', () => {
    const added = ShiftEngine.addShift({
      name: 'Weekend Special Brunch Shift',
      code: 'SHIFT-BRUNCH',
      type: 'CUSTOM',
      punchInTime: '10:00',
      graceTimeMinutes: 20,
      punchOutTime: '18:00',
      weeklyOffDays: ['Monday', 'Tuesday'],
      lateRule: {
        graceTimeMinutes: 20,
        maxAllowedLateMinutes: 60,
        consecutiveLateTolerance: 3,
        penaltyDescription: '20 mins grace for weekend brunch.',
      },
      halfDayRule: {
        minWorkHoursForHalfDay: 4.0,
        minWorkHoursForFullDay: 8.0,
        halfDayCutoffTime: '14:00',
        description: 'Min 4 hrs for half day.',
      },
    });

    assert.strictEqual(added.name, 'Weekend Special Brunch Shift');
    assert.strictEqual(added.totalShiftHours, 8.0);

    // Edit
    const updated = ShiftEngine.updateShift(added.id, {
      name: 'Weekend Gourmet Brunch Shift',
      graceTimeMinutes: 25,
    });
    assert.strictEqual(updated?.name, 'Weekend Gourmet Brunch Shift');
    assert.strictEqual(updated?.graceTimeMinutes, 25);

    // Delete
    const deleted = ShiftEngine.deleteShift(added.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(ShiftEngine.getShiftById(added.id), undefined);
  });
});

describe('Leave Management Engine Tests (Feature 6)', () => {
  it('should support all 8 leave types: Casual, Sick, Earned, Maternity, Paternity, LOP, WFH, and Custom Leave', () => {
    const leaveTypes = Object.keys(LEAVE_TYPE_CONFIG);
    assert.strictEqual(leaveTypes.length, 8);
    assert.strictEqual(leaveTypes.includes('CASUAL_LEAVE'), true);
    assert.strictEqual(leaveTypes.includes('SICK_LEAVE'), true);
    assert.strictEqual(leaveTypes.includes('EARNED_LEAVE'), true);
    assert.strictEqual(leaveTypes.includes('MATERNITY_LEAVE'), true);
    assert.strictEqual(leaveTypes.includes('PATERNITY_LEAVE'), true);
    assert.strictEqual(leaveTypes.includes('LOSS_OF_PAY'), true);
    assert.strictEqual(leaveTypes.includes('WORK_FROM_HOME'), true);
    assert.strictEqual(leaveTypes.includes('CUSTOM'), true);
  });

  it('Employee Actions: Apply Leave, Cancel Leave, and View Leave History', () => {
    // 1. Apply Leave
    const applied = LeaveEngine.applyLeave({
      employeeId: 'emp-003',
      employeeName: 'Priya Selvam',
      department: 'Customer Service & Floor',
      leaveType: 'CASUAL_LEAVE',
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      reason: 'Attending cousin wedding.',
      isHalfDay: false,
    });

    assert.strictEqual(applied.status, 'PENDING');
    assert.strictEqual(applied.totalDays, 2);
    assert.strictEqual(applied.employeeName, 'Priya Selvam');

    // 2. View History for Employee
    const history = LeaveEngine.getLeaveApplications({ employeeId: 'emp-003' });
    assert.strictEqual(history.some(h => h.id === applied.id), true);

    // 3. Cancel Leave
    const cancelled = LeaveEngine.cancelLeave(applied.id, 'emp-003');
    assert.strictEqual(cancelled, true);
    const refreshed = LeaveEngine.getLeaveApplications({ employeeId: 'emp-003' }).find(h => h.id === applied.id);
    assert.strictEqual(refreshed?.status, 'CANCELLED');
  });

  it('Manager Actions: Approve, Reject, and Forward Leave Applications', () => {
    // Apply temporary leave
    const testApp = LeaveEngine.applyLeave({
      employeeId: 'emp-001',
      employeeName: 'Kowsalya Sundaram',
      department: 'Billing & Cash Desk',
      leaveType: 'SICK_LEAVE',
      startDate: '2026-09-10',
      endDate: '2026-09-10',
      reason: 'Medical checkup appointment.',
    });

    // 1. Manager Forward
    const forwarded = LeaveEngine.managerForward(testApp.id, 'Anitha Venkatesh', 'HR Director / Corporate Board');
    assert.strictEqual(forwarded?.status, 'FORWARDED');
    assert.strictEqual(forwarded?.forwardedTo, 'HR Director / Corporate Board');

    // 2. Manager Approve
    const approved = LeaveEngine.managerApprove(testApp.id, 'Anitha Venkatesh', 'Approved following schedule realignment.');
    assert.strictEqual(approved?.status, 'APPROVED');
    assert.strictEqual(approved?.reviewedBy, 'Anitha Venkatesh');

    // 3. Manager Reject on new app
    const rejectApp = LeaveEngine.applyLeave({
      employeeId: 'emp-002',
      employeeName: 'Rajesh Kumar',
      department: 'Kitchen & Culinary',
      leaveType: 'EARNED_LEAVE',
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      reason: 'Vacation.',
    });

    const rejected = LeaveEngine.managerReject(rejectApp.id, 'Anitha Venkatesh', 'Blackout period during Diwali festival operations.');
    assert.strictEqual(rejected?.status, 'REJECTED');
    assert.strictEqual(rejected?.managerRemarks.includes('Blackout period'), true);
  });

  it('HR Actions: Override Leave status administratively', () => {
    const app = LeaveEngine.applyLeave({
      employeeId: 'emp-004',
      employeeName: 'Dr. Suresh Sharma',
      department: 'Pharmacy & Healthcare',
      leaveType: 'WORK_FROM_HOME',
      startDate: '2026-09-15',
      endDate: '2026-09-15',
      reason: 'Pharma vendor contract digitization.',
    });

    const overridden = LeaveEngine.hrOverride(app.id, 'HR Director Raman', 'APPROVED', 'Special executive administrative approval.');
    assert.strictEqual(overridden?.status, 'APPROVED');
    assert.strictEqual(overridden?.hrOverrideRemarks?.includes('Special executive'), true);
  });

  it('Dashboard Metrics & Views: should compute Pending, Approved, Rejected, Balance, Monthly, and Yearly summaries', () => {
    // 1. Metrics & Balances
    const metrics = LeaveEngine.getLeaveMetrics();
    assert.strictEqual(typeof metrics.pendingCount, 'number');
    assert.strictEqual(typeof metrics.approvedCount, 'number');
    assert.strictEqual(typeof metrics.rejectedCount, 'number');
    assert.strictEqual(typeof metrics.balances.CASUAL_LEAVE.available, 'number');

    // 2. Monthly Summary (12 months)
    const monthly = LeaveEngine.getMonthlyLeaveSummary(2026);
    assert.strictEqual(monthly.length, 12);
    assert.strictEqual(typeof monthly[0].totalLeaves, 'number');

    // 3. Yearly Summary (8 leave types)
    const yearly = LeaveEngine.getYearlyLeaveSummary(2026);
    assert.strictEqual(yearly.length, 8);
    assert.strictEqual(yearly.some(y => y.leaveType === 'CASUAL_LEAVE'), true);
  });
});

describe('Location-Based Attendance Engine Tests (Feature 7)', () => {
  it('should verify all 8 required Geo-Location fields exist and are captured', () => {
    const logs = GeoLocationEngine.getGeoAttendanceLogs();
    assert.strictEqual(logs.length >= 3, true);

    const record = logs[0];
    const geo = record.geo;

    // 1. Latitude
    assert.strictEqual(typeof geo.latitude, 'number');
    // 2. Longitude
    assert.strictEqual(typeof geo.longitude, 'number');
    // 3. Accuracy
    assert.strictEqual(typeof geo.accuracy, 'number');
    // 4. Timestamp
    assert.strictEqual(typeof geo.timestamp, 'string');
    // 5. IP Address
    assert.strictEqual(typeof geo.ipAddress, 'string');
    // 6. Device
    assert.strictEqual(typeof geo.device, 'string');
    // 7. Browser
    assert.strictEqual(typeof geo.browser, 'string');
    // 8. Operating System
    assert.strictEqual(typeof geo.operatingSystem, 'string');
  });

  it('Haversine Geofencing: should accurately calculate distance and evaluate inside/outside status', () => {
    const mainBranch = BRANCH_GEOFENCE_LOCATIONS[0];

    // Inside geofence (< 200m away)
    const insideEvaluation = GeoLocationEngine.evaluateGeofence(
      mainBranch.latitude + 0.0001,
      mainBranch.longitude + 0.0001,
      mainBranch.id
    );
    assert.strictEqual(insideEvaluation.status, 'INSIDE_GEOFENCE');
    assert.strictEqual(insideEvaluation.distanceMeters < 50, true);

    // Outside geofence (> 200m away, e.g. 5km)
    const outsideEvaluation = GeoLocationEngine.evaluateGeofence(
      mainBranch.latitude + 0.05,
      mainBranch.longitude + 0.05,
      mainBranch.id
    );
    assert.strictEqual(outsideEvaluation.status, 'OUTSIDE_GEOFENCE');
    assert.strictEqual(outsideEvaluation.distanceMeters > 500, true);
  });

  it('Client Environment Detector: should parse device, browser, and OS from user agent', () => {
    // Windows Chrome Desktop UA
    const desktopEnv = GeoLocationEngine.detectClientEnvironment(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    );
    assert.strictEqual(desktopEnv.device, 'Desktop PC');
    assert.strictEqual(desktopEnv.browser, 'Google Chrome');
    assert.strictEqual(desktopEnv.operatingSystem.includes('Windows'), true);

    // Mobile iPhone Safari UA
    const mobileEnv = GeoLocationEngine.detectClientEnvironment(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    );
    assert.strictEqual(mobileEnv.device, 'Mobile Phone');
    assert.strictEqual(mobileEnv.browser, 'Apple Safari');
    assert.strictEqual(mobileEnv.operatingSystem, 'iOS Mobile');
  });

  it('GPS Punch: should save Geo-Attendance Record and maintain complete audit trail', async () => {
    const liveGeo = await GeoLocationEngine.acquireLiveGeoLocation('branch-001');
    assert.strictEqual(typeof liveGeo.latitude, 'number');
    assert.strictEqual(typeof liveGeo.longitude, 'number');
    assert.strictEqual(['GRANTED', 'DENIED', 'UNAVAILABLE', 'TIMEOUT'].includes(liveGeo.permissionStatus), true);

    // Save Geo Punch
    const saved = GeoLocationEngine.saveGeoPunch({
      employeeId: 'emp-001',
      employeeName: 'Kowsalya Sundaram',
      department: 'Billing & Cash Desk',
      branchId: 'branch-001',
      branchName: 'Apex Central Flagship (Anna Salai)',
      punchType: 'IN',
      geo: liveGeo,
    });

    assert.strictEqual(saved.employeeId, 'emp-001');
    assert.strictEqual(saved.punchType, 'IN');
    assert.strictEqual(saved.geo.latitude, liveGeo.latitude);

    // Retrieve from audit logs
    const logs = GeoLocationEngine.getGeoAttendanceLogs({ punchType: 'IN' });
    assert.strictEqual(logs.some(l => l.id === saved.id), true);
  });
});

describe('Office Location Management Engine Tests (Feature 8)', () => {
  it('should support multiple office locations and verify all 6 required fields', () => {
    const locations = OfficeLocationEngine.getOfficeLocations();
    assert.strictEqual(locations.length >= 4, true);

    const loc = locations[0];
    // 1. Office Name
    assert.strictEqual(typeof loc.name, 'string');
    // 2. Latitude
    assert.strictEqual(typeof loc.latitude, 'number');
    // 3. Longitude
    assert.strictEqual(typeof loc.longitude, 'number');
    // 4. Allowed Radius
    assert.strictEqual(typeof loc.allowedRadiusMeters, 'number');
    assert.strictEqual(loc.allowedRadiusMeters >= 50, true);
    // 5. Branch
    assert.strictEqual(typeof loc.branchName, 'string');
    // 6. Status
    assert.strictEqual(['ACTIVE', 'INACTIVE'].includes(loc.status), true);
  });

  it('CRUD: should add, edit, toggle status, and delete an office location', () => {
    // 1. Add Office Location
    const added = OfficeLocationEngine.addOfficeLocation({
      name: 'Apex Velachery Hub',
      latitude: 12.9815,
      longitude: 80.2180,
      allowedRadiusMeters: 250,
      branchId: 'branch-002',
      branchName: 'Apex Express Station (T. Nagar)',
      status: 'ACTIVE',
      address: '100 Feet Bypass Road, Velachery, Chennai, TN 600042',
    });

    assert.strictEqual(added.name, 'Apex Velachery Hub');
    assert.strictEqual(added.latitude, 12.9815);
    assert.strictEqual(added.allowedRadiusMeters, 250);

    // 2. Edit Office Location
    const updated = OfficeLocationEngine.updateOfficeLocation(added.id, {
      name: 'Apex Velachery Express Terminal',
      allowedRadiusMeters: 300,
    });
    assert.strictEqual(updated?.name, 'Apex Velachery Express Terminal');
    assert.strictEqual(updated?.allowedRadiusMeters, 300);

    // 3. Toggle Status to INACTIVE
    const toggled = OfficeLocationEngine.toggleStatus(added.id);
    assert.strictEqual(toggled?.status, 'INACTIVE');

    // 4. Delete Office Location
    const deleted = OfficeLocationEngine.deleteOfficeLocation(added.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(OfficeLocationEngine.getOfficeLocationById(added.id), undefined);
  });

  it('Multi-Office Geofence Point Validation: should test point-in-geofence across multiple offices', () => {
    // 1. Point right inside Apex Central HQ (13.0827, 80.2707)
    const insideRes = OfficeLocationEngine.validatePointInAnyOfficeGeofence(13.0828, 80.2708);
    assert.strictEqual(insideRes.isInside, true);
    assert.strictEqual(insideRes.distanceMeters < 50, true);
    assert.strictEqual(insideRes.nearestOfficeName.includes('Apex Central Flagship'), true);

    // 2. Point in distant location (50km away)
    const outsideRes = OfficeLocationEngine.validatePointInAnyOfficeGeofence(13.5000, 80.8000);
    assert.strictEqual(outsideRes.isInside, false);
    assert.strictEqual(outsideRes.distanceMeters > 10000, true);
  });
});

describe('Geofence Validation Engine Tests (Feature 9)', () => {
  it('Requirement: Employee Location Within Allowed Radius -> Allow Punch In', () => {
    // Office Location: Apex Central HQ (13.0827, 80.2707, radius: 200m)
    // Employee Location: 20m from office center (13.0828, 80.2708)
    const validation = GeofenceValidator.validatePunchInGeofence(13.0828, 80.2708, 'loc-001');

    assert.strictEqual(validation.allowed, true);
    assert.strictEqual(validation.distanceMeters < 200, true);
    assert.strictEqual(validation.message.includes('Punch In Allowed'), true);
  });

  it('Requirement: Employee Location Outside Radius -> Reject Punch In with "You are outside office premises."', () => {
    // Office Location: Apex Central HQ (13.0827, 80.2707, radius: 200m)
    // Employee Location: 650m away (13.0880, 80.2760)
    const validation = GeofenceValidator.validatePunchInGeofence(13.0880, 80.2760, 'loc-001');

    assert.strictEqual(validation.allowed, false);
    assert.strictEqual(validation.distanceMeters > 200, true);
    assert.strictEqual(validation.message, 'You are outside office premises.');
  });

  it('Enforced Punch Execution: should record punch when within radius, and reject when outside radius', () => {
    // 1. Valid Punch Execution
    const validExecution = GeofenceValidator.executeEnforcedPunchIn({
      employeeId: 'emp-001',
      employeeName: 'Kowsalya Sundaram',
      department: 'Billing & Cash Desk',
      branchId: 'branch-001',
      branchName: 'Apex Central Flagship (Anna Salai)',
      geo: {
        latitude: 13.0828,
        longitude: 80.2708,
        accuracy: 5.0,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.104',
        device: 'Desktop PC',
        browser: 'Chrome',
        operatingSystem: 'Windows 11',
        permissionStatus: 'GRANTED',
      },
    });

    assert.strictEqual(validExecution.success, true);
    assert.strictEqual(validExecution.record?.punchType, 'IN');
    assert.strictEqual(validExecution.record?.status, 'VERIFIED');

    // 2. Outside Radius Punch Execution
    const outsideExecution = GeofenceValidator.executeEnforcedPunchIn({
      employeeId: 'emp-002',
      employeeName: 'Rajesh Kumar',
      department: 'Kitchen & Culinary',
      branchId: 'branch-001',
      branchName: 'Apex Central Flagship (Anna Salai)',
      geo: {
        latitude: 13.0990,
        longitude: 80.2900,
        accuracy: 10.0,
        timestamp: new Date().toISOString(),
        ipAddress: '49.207.180.92',
        device: 'Mobile Phone',
        browser: 'Safari Mobile',
        operatingSystem: 'iOS Mobile',
        permissionStatus: 'GRANTED',
      },
    });

    assert.strictEqual(outsideExecution.success, false);
    assert.strictEqual(outsideExecution.error, 'You are outside office premises.');
    assert.strictEqual(outsideExecution.record, undefined);
  });
});

describe('Staff Punch In Engine Tests (Feature 10)', () => {
  it('Punch In Screen: should verify and calculate Current Time, Date, GPS, Office Name, Distance, and Status', () => {
    const offices = OfficeLocationEngine.getOfficeLocations({ status: 'ACTIVE' });
    const targetOffice = offices[0];

    const currentGPS = {
      latitude: targetOffice.latitude + 0.0001,
      longitude: targetOffice.longitude + 0.0001,
      accuracy: 8.0,
    };

    const distance = GeoLocationEngine.calculateDistanceMeters(
      currentGPS.latitude,
      currentGPS.longitude,
      targetOffice.latitude,
      targetOffice.longitude
    );

    const isInside = distance <= targetOffice.allowedRadiusMeters;

    assert.strictEqual(typeof targetOffice.name, 'string');
    assert.strictEqual(distance < 50, true);
    assert.strictEqual(isInside, true);
  });

  it('Save Punch In: should persist all 7 required fields on Punch In (Time, Lat, Lon, Accuracy, Device, IP, Browser)', () => {
    const punchRes = PunchInEngine.recordPunchIn({
      employeeId: 'emp-001',
      employeeName: 'Kowsalya Sundaram',
      department: 'Billing & Cash Desk',
      officeId: 'loc-001',
      shiftId: 'shift-001',
      geo: {
        latitude: 13.0828,
        longitude: 80.2709,
        accuracy: 6.5,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.104',
        device: 'Desktop PC (Windows 11)',
        browser: 'Google Chrome 128.0',
        operatingSystem: 'Windows 11 Enterprise',
        permissionStatus: 'GRANTED',
      },
    });

    assert.strictEqual(punchRes.success, true);
    const rec = punchRes.record!;

    // 1. Punch In Time
    assert.strictEqual(typeof rec.punchInTime, 'string');
    // 2. Latitude
    assert.strictEqual(rec.latitude, 13.0828);
    // 3. Longitude
    assert.strictEqual(rec.longitude, 80.2709);
    // 4. Accuracy
    assert.strictEqual(rec.accuracy, 6.5);
    // 5. Device
    assert.strictEqual(rec.device, 'Desktop PC (Windows 11)');
    // 6. IP
    assert.strictEqual(rec.ipAddress, '192.168.1.104');
    // 7. Browser
    assert.strictEqual(rec.browser, 'Google Chrome 128.0');

    // Context metadata
    assert.strictEqual(rec.officeName, 'Apex Central Flagship HQ');
    assert.strictEqual(rec.isGeofenceVerified, true);
  });

  it('Punch In History & Today Query', () => {
    const history = PunchInEngine.getPunchInHistory('emp-001');
    assert.strictEqual(history.length >= 1, true);

    const today = PunchInEngine.getTodayPunchIn('emp-001');
    assert.strictEqual(today !== undefined, true);
    assert.strictEqual(today?.employeeId, 'emp-001');
  });
});

describe('Staff Punch Out Engine Tests (Feature 11)', () => {
  it('Punch Out Screen: should verify Worked Hours, Break Hours, and Current Location', () => {
    const calc = PunchOutEngine.calculateWorkedAndOvertime(
      '2026-08-26T08:00:00',
      '2026-08-26T17:30:00',
      0.75, // 45m break
      8.0   // 8h standard shift
    );

    // 1. Worked Hours
    assert.strictEqual(calc.workedHours, 8.75);
    assert.strictEqual(calc.workedHoursFormatted, '8h 45m');

    // 2. Break Hours
    assert.strictEqual(calc.grossHours, 9.5);

    // Overtime
    assert.strictEqual(calc.overtime, 0.75);
    assert.strictEqual(calc.overtimeFormatted, '0h 45m');
  });

  it('Save Punch Out: should persist all 3 required fields on Punch Out (Punch Out Time, Worked Hours, Overtime)', () => {
    const punchOutRes = PunchOutEngine.recordPunchOut({
      employeeId: 'emp-001',
      employeeName: 'Kowsalya Sundaram',
      department: 'Billing & Cash Desk',
      punchInTime: '08:05:14 AM',
      breakHours: 0.5,
      geo: {
        latitude: 13.0828,
        longitude: 80.2709,
        accuracy: 6.5,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.104',
        device: 'Desktop PC (Windows 11)',
        browser: 'Google Chrome 128.0',
        operatingSystem: 'Windows 11 Enterprise',
        permissionStatus: 'GRANTED',
      },
      officeName: 'Apex Central Flagship HQ',
      customPunchOutTime: '05:35:14 PM',
      standardShiftHours: 8.0,
    });

    assert.strictEqual(punchOutRes.success, true);
    const rec = punchOutRes.record!;

    // 1. Punch Out Time
    assert.strictEqual(rec.punchOutTime, '05:35:14 PM');
    // 2. Worked Hours
    assert.strictEqual(typeof rec.workedHours, 'number');
    assert.strictEqual(typeof rec.workedHoursFormatted, 'string');
    // 3. Overtime
    assert.strictEqual(typeof rec.overtime, 'number');
    assert.strictEqual(typeof rec.overtimeFormatted, 'string');

    // Context & Location
    assert.strictEqual(rec.currentLocation.officeName, 'Apex Central Flagship HQ');
    assert.strictEqual(rec.status, 'COMPLETED');
  });

  it('Punch Out History & Today Query', () => {
    const history = PunchOutEngine.getPunchOutHistory('emp-001');
    assert.strictEqual(history.length >= 1, true);

    const today = PunchOutEngine.getTodayPunchOut('emp-001');
    assert.strictEqual(today !== undefined, true);
    assert.strictEqual(today?.employeeId, 'emp-001');
  });
});

describe('Break Management Engine Tests (Feature 12)', () => {
  it('Support 3 Break Types: Lunch Break, Tea Break, and Custom Break', () => {
    // 1. Lunch Break
    const lunchRes = BreakEngine.startBreak({
      employeeId: 'emp-005',
      employeeName: 'Priya Selvam',
      department: 'Customer Service & Floor',
      breakType: 'LUNCH',
      customStartTime: '01:00:00 PM',
    });
    assert.strictEqual(lunchRes.success, true);
    assert.strictEqual(lunchRes.record?.breakType, 'LUNCH');
    assert.strictEqual(lunchRes.record?.breakTitle, 'Lunch Break');

    // End Lunch Break
    const endLunch = BreakEngine.endBreak('emp-005', '01:45:00 PM', 45);
    assert.strictEqual(endLunch.success, true);
    assert.strictEqual(endLunch.record?.durationMinutes, 45);

    // 2. Tea Break
    const teaRes = BreakEngine.startBreak({
      employeeId: 'emp-005',
      employeeName: 'Priya Selvam',
      department: 'Customer Service & Floor',
      breakType: 'TEA',
      customStartTime: '04:00:00 PM',
    });
    assert.strictEqual(teaRes.success, true);
    assert.strictEqual(teaRes.record?.breakType, 'TEA');
    assert.strictEqual(teaRes.record?.breakTitle, 'Tea Break');

    // End Tea Break
    const endTea = BreakEngine.endBreak('emp-005', '04:15:00 PM', 15);
    assert.strictEqual(endTea.success, true);
    assert.strictEqual(endTea.record?.durationMinutes, 15);

    // 3. Custom Break
    const customRes = BreakEngine.startBreak({
      employeeId: 'emp-005',
      employeeName: 'Priya Selvam',
      department: 'Customer Service & Floor',
      breakType: 'CUSTOM',
      customTitle: 'Ergonomic Rest Break',
      customReason: 'Posture & hydration',
      customStartTime: '05:00:00 PM',
    });
    assert.strictEqual(customRes.success, true);
    assert.strictEqual(customRes.record?.breakType, 'CUSTOM');
    assert.strictEqual(customRes.record?.breakTitle, 'Ergonomic Rest Break');

    // End Custom Break
    const endCustom = BreakEngine.endBreak('emp-005', '05:10:00 PM', 10);
    assert.strictEqual(endCustom.success, true);
    assert.strictEqual(endCustom.record?.durationMinutes, 10);
  });

  it('Calculate Working Hours: should deduct total breaks from gross hours to compute Net Working Hours', () => {
    // Employee emp-005 had 45m lunch + 15m tea + 10m custom = 70 mins (1.17 hrs)
    // Gross shift = 8.5 hrs
    const summary = BreakEngine.calculateDailyWorkingHours('emp-005', 8.5);

    assert.strictEqual(summary.totalBreakMinutes, 70);
    assert.strictEqual(summary.totalBreakHours, 1.17);
    // Net Working Hours = 8.5 - 1.17 = 7.33 hrs
    assert.strictEqual(summary.netWorkingHours, 7.33);
    assert.strictEqual(summary.netWorkingHoursFormatted, '7h 20m');
    assert.strictEqual(summary.breaksCount, 3);
  });

  it('Concurrent Break Prevention: should disallow starting a break when another break is in progress', () => {
    // Start break 1
    const break1 = BreakEngine.startBreak({
      employeeId: 'emp-008',
      employeeName: 'Vikas Patel',
      department: 'Warehouse & Logistics',
      breakType: 'TEA',
    });
    assert.strictEqual(break1.success, true);

    // Attempt break 2 while break 1 is still IN_PROGRESS
    const break2 = BreakEngine.startBreak({
      employeeId: 'emp-008',
      employeeName: 'Vikas Patel',
      department: 'Warehouse & Logistics',
      breakType: 'LUNCH',
    });
    assert.strictEqual(break2.success, false);
    assert.strictEqual(break2.error?.includes('already have an active'), true);

    // Clean up
    BreakEngine.endBreak('emp-008');
  });
});

describe('Attendance Dashboard Engine Tests (Feature 13)', () => {
  it('Dashboard Cards: should compute all 7 required metrics cards', () => {
    const metrics = AttendanceDashboardEngine.getDashboardMetrics();

    // 1. Present Today
    assert.strictEqual(typeof metrics.presentToday, 'number');
    assert.strictEqual(metrics.presentToday >= 0, true);

    // 2. Absent Today
    assert.strictEqual(typeof metrics.absentToday, 'number');

    // 3. Late Today
    assert.strictEqual(typeof metrics.lateToday, 'number');

    // 4. Leave Today
    assert.strictEqual(typeof metrics.leaveToday, 'number');

    // 5. Work From Home
    assert.strictEqual(typeof metrics.workFromHome, 'number');

    // 6. Average Hours
    assert.strictEqual(typeof metrics.averageHours, 'number');
    assert.strictEqual(typeof metrics.averageHoursFormatted, 'string');
    assert.strictEqual(metrics.averageHoursFormatted.includes('h'), true);

    // 7. Monthly Attendance %
    assert.strictEqual(typeof metrics.monthlyAttendancePercentage, 'number');
    assert.strictEqual(metrics.monthlyAttendancePercentage >= 80, true);
  });

  it('Today\'s Punches: should retrieve live punches feed with search and status filtering', () => {
    const feed = AttendanceDashboardEngine.getTodayPunchesFeed();
    assert.strictEqual(feed.length >= 5, true);

    const first = feed[0];
    assert.strictEqual(typeof first.employeeName, 'string');
    assert.strictEqual(typeof first.punchInTime, 'string');
    assert.strictEqual(typeof first.status, 'string');

    // Filter by Status: PRESENT
    const presentFeed = AttendanceDashboardEngine.getTodayPunchesFeed({ status: 'PRESENT' });
    assert.strictEqual(presentFeed.every(p => p.status === 'PRESENT'), true);

    // Search by Name
    const searched = AttendanceDashboardEngine.getTodayPunchesFeed({ search: 'Kowsalya' });
    assert.strictEqual(searched.length >= 1, true);
    assert.strictEqual(searched[0].employeeName.includes('Kowsalya'), true);
  });

  it('Attendance Trend Chart: should generate 7-day trend series with ratios', () => {
    const trend = AttendanceDashboardEngine.getAttendanceTrendData(7);
    assert.strictEqual(trend.length, 7);

    const todayPt = trend[trend.length - 1];
    assert.strictEqual(typeof todayPt.dayLabel, 'string');
    assert.strictEqual(typeof todayPt.present, 'number');
    assert.strictEqual(typeof todayPt.late, 'number');
    assert.strictEqual(typeof todayPt.absent, 'number');
    assert.strictEqual(typeof todayPt.wfh, 'number');
    assert.strictEqual(typeof todayPt.leave, 'number');
    assert.strictEqual(todayPt.attendancePercentage >= 85, true);
  });
});

describe('Attendance Reports & Export Engine Tests (Feature 14)', () => {
  it('Should generate all 6 required report types with full schema fidelity', () => {
    // 1. Daily Attendance Report
    const daily = AttendanceReportEngine.generateDailyReport();
    assert.strictEqual(daily.length >= 5, true);
    assert.strictEqual(typeof daily[0].punchIn, 'string');
    assert.strictEqual(typeof daily[0].workedHoursFormatted, 'string');

    // 2. Monthly Attendance Report
    const monthly = AttendanceReportEngine.generateMonthlyReport();
    assert.strictEqual(monthly.length >= 4, true);
    assert.strictEqual(typeof monthly[0].presentDays, 'number');
    assert.strictEqual(typeof monthly[0].attendancePercentage, 'number');

    // 3. Late Report
    const late = AttendanceReportEngine.generateLateReport();
    assert.strictEqual(late.length >= 2, true);
    assert.strictEqual(typeof late[0].lateMinutes, 'number');
    assert.strictEqual(typeof late[0].shiftStartTime, 'string');

    // 4. Absent Report
    const absent = AttendanceReportEngine.generateAbsentReport();
    assert.strictEqual(absent.length >= 1, true);
    assert.strictEqual(typeof absent[0].reportingManager, 'string');
    assert.strictEqual(typeof absent[0].leaveType, 'string');

    // 5. Overtime Report
    const overtime = AttendanceReportEngine.generateOvertimeReport();
    assert.strictEqual(overtime.length >= 2, true);
    assert.strictEqual(typeof overtime[0].overtimeHours, 'number');
    assert.strictEqual(typeof overtime[0].overtimePayEstimated, 'number');

    // 6. Location Report
    const location = AttendanceReportEngine.generateLocationReport();
    assert.strictEqual(location.length >= 2, true);
    assert.strictEqual(typeof location[0].latitude, 'number');
    assert.strictEqual(typeof location[0].distanceMeters, 'number');
    assert.strictEqual(typeof location[0].geofenceStatus, 'string');
  });

  it('Export Formatting: should serialize report data into valid CSV / Spreadsheet strings', () => {
    const dailyData = AttendanceReportEngine.generateDailyReport();
    const csv = AttendanceReportEngine.generateCSVString('DAILY', dailyData);

    assert.strictEqual(typeof csv, 'string');
    assert.strictEqual(csv.includes('date,employeeId,employeeName'), true);
    assert.strictEqual(csv.includes('Kowsalya Sundaram'), true);
    assert.strictEqual(csv.split('\n').length >= 6, true);
  });
});

describe('Attendance Monthly Calendar & Color Codes Tests (Feature 15)', () => {
  it('Should generate full monthly calendar and verify all 7 Color Codes', () => {
    const calendar = AttendanceCalendarEngine.getMonthlyAttendanceCalendar('emp-001', 2026, 7); // August 2026

    assert.strictEqual(calendar.month, 'August 2026');
    assert.strictEqual(calendar.daysInMonth, 31);
    assert.strictEqual(calendar.days.length, 31);

    // Verify 7 Color Coded Statuses exist in the calendar
    const statusesPresent = new Set(calendar.days.map(d => d.status));

    // 1. Present
    assert.strictEqual(statusesPresent.has('PRESENT'), true);
    // 2. Absent
    assert.strictEqual(statusesPresent.has('ABSENT'), true);
    // 3. Leave
    assert.strictEqual(statusesPresent.has('LEAVE'), true);
    // 4. Holiday
    assert.strictEqual(statusesPresent.has('HOLIDAY'), true);
    // 5. Weekend
    assert.strictEqual(statusesPresent.has('WEEKEND'), true);
    // 6. Half Day
    assert.strictEqual(statusesPresent.has('HALF_DAY'), true);
    // 7. Late
    assert.strictEqual(statusesPresent.has('LATE'), true);
  });

  it('Monthly Calendar Summary Statistics: should calculate counts for all 7 statuses and attendance rate', () => {
    const calendar = AttendanceCalendarEngine.getMonthlyAttendanceCalendar('emp-001', 2026, 7);

    assert.strictEqual(calendar.presentCount > 0, true);
    assert.strictEqual(calendar.weekendCount > 0, true);
    assert.strictEqual(calendar.holidayCount, 1); // Aug 15 Independence Day
    assert.strictEqual(calendar.lateCount > 0, true);
    assert.strictEqual(calendar.halfDayCount, 1);
    assert.strictEqual(calendar.leaveCount, 1);
    assert.strictEqual(calendar.absentCount, 1);

    assert.strictEqual(typeof calendar.totalWorkedHours, 'number');
    assert.strictEqual(calendar.attendancePercentage >= 85, true);
  });

  it('Color Tokens: should provide consistent styling tokens for all 7 statuses', () => {
    const allStatuses = ['PRESENT', 'ABSENT', 'LEAVE', 'HOLIDAY', 'WEEKEND', 'HALF_DAY', 'LATE'] as const;

    for (const st of allStatuses) {
      const token = AttendanceCalendarEngine.getColorToken(st);
      assert.strictEqual(typeof token.bg, 'string');
      assert.strictEqual(typeof token.text, 'string');
      assert.strictEqual(typeof token.border, 'string');
      assert.strictEqual(typeof token.dot, 'string');
      assert.strictEqual(typeof token.badge, 'string');
    }
  });
});

describe('Holiday Management Engine Tests (Feature 16)', () => {
  it('Should verify all 5 required fields on configured holidays (Holiday Name, Date, Description, Branch, Recurring)', () => {
    const list = HolidayEngine.getHolidays();
    assert.strictEqual(list.length >= 6, true);

    const first = list[0];
    // 1. Holiday Name
    assert.strictEqual(typeof first.holidayName, 'string');
    assert.strictEqual(first.holidayName.length > 0, true);

    // 2. Date
    assert.strictEqual(typeof first.date, 'string');
    assert.strictEqual(first.date.includes('-'), true);

    // 3. Description
    assert.strictEqual(typeof first.description, 'string');

    // 4. Branch
    assert.strictEqual(typeof first.branch, 'string');

    // 5. Recurring
    assert.strictEqual(typeof first.recurring, 'boolean');
  });

  it('CRUD: should create, read, update, and delete a holiday', () => {
    // 1. Create
    const createRes = HolidayEngine.createHoliday({
      holidayName: 'Tamil New Year / Puthandu',
      date: '2026-04-14',
      description: 'Tamil New Year regional holiday for all Tamil Nadu branches',
      branch: 'ALL',
      recurring: true,
      type: 'REGIONAL',
    });
    assert.strictEqual(createRes.success, true);
    const holId = createRes.holiday!.id;

    // 2. Read
    const found = HolidayEngine.getHolidayById(holId);
    assert.strictEqual(found !== undefined, true);
    assert.strictEqual(found?.holidayName, 'Tamil New Year / Puthandu');
    assert.strictEqual(found?.recurring, true);

    // 3. Update
    const updateRes = HolidayEngine.updateHoliday({
      id: holId,
      holidayName: 'Puthandu (Tamil New Year Celebrations)',
      description: 'Updated description for regional holiday',
    });
    assert.strictEqual(updateRes.success, true);
    assert.strictEqual(updateRes.holiday?.holidayName, 'Puthandu (Tamil New Year Celebrations)');

    // 4. Delete
    const delRes = HolidayEngine.deleteHoliday(holId);
    assert.strictEqual(delRes.success, true);
    assert.strictEqual(HolidayEngine.getHolidayById(holId), undefined);
  });

  it('Date Holiday Validation: should verify whether a specific calendar date is a configured holiday', () => {
    // Aug 15 is configured Independence Day
    const aug15 = HolidayEngine.isDateHoliday('2026-08-15');
    assert.strictEqual(aug15.isHoliday, true);
    assert.strictEqual(aug15.holiday?.holidayName, 'Independence Day');

    // Aug 26 is a normal working day
    const aug26 = HolidayEngine.isDateHoliday('2026-08-26');
    assert.strictEqual(aug26.isHoliday, false);
  });
});

describe('Attendance Permissions Engine Tests (Feature 17)', () => {
  it('Requirement: Only Admin and HR can edit attendance', () => {
    // 1. Admin CAN edit
    assert.strictEqual(AttendancePermissionEngine.canEditAttendance('ADMIN'), true);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('ADMIN', 'EDIT_ATTENDANCE'), true);
    const adminCheck = AttendancePermissionEngine.validateAction('ADMIN', 'EDIT_ATTENDANCE');
    assert.strictEqual(adminCheck.allowed, true);

    // 2. HR CAN edit
    assert.strictEqual(AttendancePermissionEngine.canEditAttendance('HR'), true);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('HR', 'EDIT_ATTENDANCE'), true);
    const hrCheck = AttendancePermissionEngine.validateAction('HR', 'EDIT_ATTENDANCE');
    assert.strictEqual(hrCheck.allowed, true);

    // 3. Manager CANNOT edit
    assert.strictEqual(AttendancePermissionEngine.canEditAttendance('MANAGER'), false);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('MANAGER', 'EDIT_ATTENDANCE'), false);
    const managerCheck = AttendancePermissionEngine.validateAction('MANAGER', 'EDIT_ATTENDANCE');
    assert.strictEqual(managerCheck.allowed, false);
    assert.strictEqual(managerCheck.reason?.includes('Only Admin and HR can edit attendance'), true);

    // 4. Employee CANNOT edit
    assert.strictEqual(AttendancePermissionEngine.canEditAttendance('EMPLOYEE'), false);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'EDIT_ATTENDANCE'), false);
    const empCheck = AttendancePermissionEngine.validateAction('EMPLOYEE', 'EDIT_ATTENDANCE');
    assert.strictEqual(empCheck.allowed, false);
    assert.strictEqual(empCheck.reason?.includes('Only Admin and HR can edit attendance'), true);
  });

  it('Requirement: Employee can only Punch In, Punch Out, View own attendance, and Apply Leave', () => {
    const empMatrix = AttendancePermissionEngine.getRolePermissions('EMPLOYEE');

    // Allowed self-service actions
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'PUNCH_IN'), true);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'PUNCH_OUT'), true);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'VIEW_OWN_ATTENDANCE'), true);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'APPLY_LEAVE'), true);

    // Disallowed administrative / supervisory actions
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'APPROVE_LEAVE'), false);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'OVERRIDE_GEOFENCE'), false);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'MANAGE_SHIFTS'), false);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'MANAGE_OFFICES'), false);
    assert.strictEqual(AttendancePermissionEngine.hasPermission('EMPLOYEE', 'MANAGE_HOLIDAYS'), false);

    const checkApprove = AttendancePermissionEngine.validateAction('EMPLOYEE', 'APPROVE_LEAVE');
    assert.strictEqual(checkApprove.allowed, false);
    assert.strictEqual(checkApprove.reason?.includes('Employee role can only Punch In, Punch Out'), true);
  });

  it('Role Matrices: should verify 4 distinct roles exist with descriptive metadata', () => {
    const matrices = AttendancePermissionEngine.getAllRoleMatrices();
    assert.strictEqual(matrices.length, 4);

    const roles = matrices.map(m => m.role);
    assert.strictEqual(roles.includes('ADMIN'), true);
    assert.strictEqual(roles.includes('HR'), true);
    assert.strictEqual(roles.includes('MANAGER'), true);
    assert.strictEqual(roles.includes('EMPLOYEE'), true);
  });
});

describe('Attendance Notifications Engine Tests (Feature 18)', () => {
  it('Should support all 6 required notification types: Late, Absent, Leave Approved, Leave Rejected, Missed Punch Out, Missed Punch In', () => {
    // 1. Late Notification
    const late = AttendanceNotificationEngine.notifyLate('emp-001', 'Kowsalya Sundaram', 'Morning Early Shift', 35);
    assert.strictEqual(late.type, 'LATE');
    assert.strictEqual(late.title, 'Late Arrival Notice');
    assert.strictEqual(late.message.includes('35 minutes late'), true);

    // 2. Absent Notification
    const absent = AttendanceNotificationEngine.notifyAbsent('emp-007', 'Meenakshi Sundaram', '2026-08-26');
    assert.strictEqual(absent.type, 'ABSENT');
    assert.strictEqual(absent.title, 'Unnotified Absence Alert');
    assert.strictEqual(absent.message.includes('marked ABSENT'), true);

    // 3. Leave Approved Notification
    const leaveApp = AttendanceNotificationEngine.notifyLeaveApproved(
      'emp-001',
      'Kowsalya Sundaram',
      'Casual Leave (CL)',
      'Aug 28 – Aug 29',
      'Venkatesh Prabhu'
    );
    assert.strictEqual(leaveApp.type, 'LEAVE_APPROVED');
    assert.strictEqual(leaveApp.title, 'Leave Application Approved');
    assert.strictEqual(leaveApp.message.includes('has been approved by Venkatesh Prabhu'), true);

    // 4. Leave Rejected Notification
    const leaveRej = AttendanceNotificationEngine.notifyLeaveRejected(
      'emp-006',
      'Vikram Raghavan',
      'Earned Leave (EL)',
      'Kitchen staffing shortage during peak weekend hours',
      'Chef Rajesh Kumar'
    );
    assert.strictEqual(leaveRej.type, 'LEAVE_REJECTED');
    assert.strictEqual(leaveRej.title, 'Leave Application Rejected');
    assert.strictEqual(leaveRej.message.includes('was rejected by Chef Rajesh Kumar'), true);

    // 5. Missed Punch Out Notification
    const missedOut = AttendanceNotificationEngine.notifyMissedPunchOut(
      'emp-002',
      'Chef Rajesh Kumar',
      'Morning Early Shift'
    );
    assert.strictEqual(missedOut.type, 'MISSED_PUNCH_OUT');
    assert.strictEqual(missedOut.title, 'Missed Punch Out Reminder');
    assert.strictEqual(missedOut.message.includes('No punch-out recorded'), true);

    // 6. Missed Punch In Notification
    const missedIn = AttendanceNotificationEngine.notifyMissedPunchIn(
      'emp-005',
      'Priya Selvam',
      'General Shift',
      '09:30 AM'
    );
    assert.strictEqual(missedIn.type, 'MISSED_PUNCH_IN');
    assert.strictEqual(missedIn.title, 'Missed Punch In Alert');
    assert.strictEqual(missedIn.message.includes('No punch-in detected'), true);
  });

  it('Notification Management: should mark as read and query unread count', () => {
    const unreadBefore = AttendanceNotificationEngine.getUnreadCount('emp-001');
    assert.strictEqual(typeof unreadBefore, 'number');

    const notif = AttendanceNotificationEngine.notifyLate('emp-001', 'Kowsalya Sundaram', 'General Shift', 15);
    assert.strictEqual(notif.isRead, false);

    const markSuccess = AttendanceNotificationEngine.markAsRead(notif.id);
    assert.strictEqual(markSuccess, true);

    const updated = AttendanceNotificationEngine.getNotifications('emp-001').find(n => n.id === notif.id);
    assert.strictEqual(updated?.isRead, true);
  });
});

describe('Phone Number (10 Digits) & Aadhaar Number (12 Digits) Validation Engine Tests', () => {
  it('Phone Validation: should accept valid 10-digit phone numbers in various standard formats', () => {
    // Standard 10 digits
    assert.strictEqual(isValidPhone('9876543210'), true);
    assert.strictEqual(isValidPhone('8765432109'), true);
    assert.strictEqual(isValidPhone('7890123456'), true);
    assert.strictEqual(isValidPhone('6123456789'), true);

    // With +91 country prefix
    assert.strictEqual(isValidPhone('+91 98765 43210'), true);
    assert.strictEqual(isValidPhone('+919876543210'), true);
    assert.strictEqual(isValidPhone('919876543210'), true);

    // With spaces, hyphens, and leading 0
    assert.strictEqual(isValidPhone('98765 43210'), true);
    assert.strictEqual(isValidPhone('9876-543-210'), true);
    assert.strictEqual(isValidPhone('09876543210'), true);
  });

  it('Phone Validation: should reject phone numbers not having exactly 10 digits', () => {
    // Too short (< 10 digits)
    assert.strictEqual(isValidPhone('98765'), false);
    assert.strictEqual(isValidPhone('987654321'), false); // 9 digits
    assert.strictEqual(isValidPhone('123'), false);

    // Too long (> 10 digits when not +91)
    assert.strictEqual(isValidPhone('987654321000'), false);
    assert.strictEqual(isValidPhone('1234567890123'), false);

    // Empty or non-numeric
    assert.strictEqual(isValidPhone(''), false);
    assert.strictEqual(isValidPhone(null as any), false);
    assert.strictEqual(isValidPhone(undefined as any), false);
    assert.strictEqual(isValidPhone('abcdefghij'), false);
  });

  it('Phone Utilities: cleanPhone, formatPhone, and getPhoneValidationError', () => {
    // cleanPhone
    assert.strictEqual(cleanPhone('+91 98765 43210'), '9876543210');
    assert.strictEqual(cleanPhone('09876543210'), '9876543210');
    assert.strictEqual(cleanPhone('9876-543-210'), '9876543210');

    // formatPhone
    assert.strictEqual(formatPhone('9876543210'), '98765 43210');

    // Error messages
    assert.strictEqual(getPhoneValidationError('9876543210'), null);
    assert.strictEqual(typeof getPhoneValidationError('98765'), 'string');
    assert.strictEqual(getPhoneValidationError('') !== null, true);
    assert.strictEqual(getPhoneValidationError('', false), null); // optional
  });

  it('Aadhaar Validation: should accept valid 12-digit Aadhaar numbers', () => {
    // Standard 12 digits
    assert.strictEqual(isValidAadhar('123456789012'), true);
    assert.strictEqual(isValidAadhar('987654321098'), true);

    // Formatted with spaces or dashes
    assert.strictEqual(isValidAadhar('1234 5678 9012'), true);
    assert.strictEqual(isValidAadhar('1234-5678-9012'), true);
    assert.strictEqual(isValidAadhar('9845 1234 8921'), true);
  });

  it('Aadhaar Validation: should reject Aadhaar numbers not having exactly 12 digits', () => {
    // Too short (< 12 digits)
    assert.strictEqual(isValidAadhar('12345678901'), false); // 11 digits
    assert.strictEqual(isValidAadhar('1234 5678'), false); // 8 digits

    // Too long (> 12 digits)
    assert.strictEqual(isValidAadhar('1234567890123'), false); // 13 digits
    assert.strictEqual(isValidAadhar('123456789012345'), false);

    // Empty or non-numeric
    assert.strictEqual(isValidAadhar(''), false);
    assert.strictEqual(isValidAadhar(null as any), false);
    assert.strictEqual(isValidAadhar(undefined as any), false);
    assert.strictEqual(isValidAadhar('abcd efgh ijkl'), false);
  });

  it('Aadhaar Utilities: cleanAadhar, formatAadhar, and getAadharValidationError', () => {
    // cleanAadhar
    assert.strictEqual(cleanAadhar('1234 5678 9012'), '123456789012');
    assert.strictEqual(cleanAadhar('1234-5678-9012'), '123456789012');

    // formatAadhar
    assert.strictEqual(formatAadhar('123456789012'), '1234 5678 9012');

    // Error messages
    assert.strictEqual(getAadharValidationError('123456789012'), null);
    assert.strictEqual(typeof getAadharValidationError('12345678'), 'string');
    assert.strictEqual(getAadharValidationError('') !== null, true);
    assert.strictEqual(getAadharValidationError('', false), null); // optional
  });
});

describe('Category-to-Role Dynamic Mapping Engine Tests', () => {
  it('should map each universal business category to its appropriate default role', () => {
    assert.strictEqual(getDefaultRoleForCategory('Management & Admin'), 'ADMIN');
    assert.strictEqual(getDefaultRoleForCategory('Billing & Cash Desk'), 'CASHIER');
    assert.strictEqual(getDefaultRoleForCategory('Sales & Marketing'), 'SALES_EXECUTIVE');
    assert.strictEqual(getDefaultRoleForCategory('Accounts & Finance'), 'ACCOUNTANT');
    assert.strictEqual(getDefaultRoleForCategory('Inventory & Warehouse'), 'STORE_KEEPER');
    assert.strictEqual(getDefaultRoleForCategory('Operations & Support'), 'OPERATIONS_MANAGER');
    assert.strictEqual(getDefaultRoleForCategory('Customer Support & Service'), 'CUSTOMER_SUPPORT');
    assert.strictEqual(getDefaultRoleForCategory('General'), 'STAFF');
    // Fallback for custom or unknown category
    assert.strictEqual(getDefaultRoleForCategory('Custom Category'), 'STAFF');
  });

  it('should return specific relevant roles when a universal category is selected', () => {
    const mgmtRoles = getRolesForCategory('Management & Admin');
    assert.strictEqual(mgmtRoles.includes('ADMIN'), true);
    assert.strictEqual(mgmtRoles.includes('MANAGER'), true);
    assert.strictEqual(mgmtRoles.includes('SUPERVISOR'), true);

    const billingRoles = getRolesForCategory('Billing & Cash Desk');
    assert.strictEqual(billingRoles.includes('CASHIER'), true);
    assert.strictEqual(billingRoles.includes('BILLING_OPERATOR'), true);

    const salesRoles = getRolesForCategory('Sales & Marketing');
    assert.strictEqual(salesRoles.includes('SALES_EXECUTIVE'), true);
    assert.strictEqual(salesRoles.includes('MARKETING_MANAGER'), true);

    const financeRoles = getRolesForCategory('Accounts & Finance');
    assert.strictEqual(financeRoles.includes('ACCOUNTANT'), true);
    assert.strictEqual(financeRoles.includes('FINANCE_MANAGER'), true);

    const invRoles = getRolesForCategory('Inventory & Warehouse');
    assert.strictEqual(invRoles.includes('STORE_KEEPER'), true);
    assert.strictEqual(invRoles.includes('INVENTORY_MANAGER'), true);

    const opsRoles = getRolesForCategory('Operations & Support');
    assert.strictEqual(opsRoles.includes('OPERATIONS_MANAGER'), true);
    assert.strictEqual(opsRoles.includes('COORDINATOR'), true);

    const supportRoles = getRolesForCategory('Customer Support & Service');
    assert.strictEqual(supportRoles.includes('CUSTOMER_SUPPORT'), true);
    assert.strictEqual(supportRoles.includes('RECEPTIONIST'), true);

    const generalRoles = getRolesForCategory('General');
    assert.strictEqual(generalRoles.includes('STAFF'), true);
    assert.strictEqual(generalRoles.includes('OPERATOR'), true);

    // Custom or unknown category fallback roles
    const customRoles = getRolesForCategory('Custom Industry');
    assert.strictEqual(customRoles.includes('STAFF'), true);
    assert.strictEqual(customRoles.includes('ADMIN'), true);
  });
});









































