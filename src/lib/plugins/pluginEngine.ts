import { 
  PluginDefinition, 
  PluginCategory, 
  PluginHookEvent, 
  PluginExecutionResult 
} from '../../types/plugin';

export const DEFAULT_PLUGINS: PluginDefinition[] = [
  // 1. Razorpay
  {
    id: 'razorpay',
    name: 'Razorpay Payment Gateway',
    version: '3.4.0',
    category: 'PAYMENT_GATEWAY',
    description: 'Accept UPI, Credit/Debit Cards, NetBanking, and generate dynamic POS QR codes.',
    iconName: 'CreditCard',
    developer: 'Razorpay Software Pvt Ltd',
    isInstalled: true,
    isEnabled: true,
    supportedHooks: ['PAYMENT_PROCESS', 'INVOICE_GENERATED'],
    configFields: [
      { key: 'keyId', label: 'Key ID', type: 'text', placeholder: 'rzp_live_XXXXXXXXXXXX', isRequired: true },
      { key: 'keySecret', label: 'Key Secret', type: 'password', isRequired: true },
      { key: 'autoCapture', label: 'Auto-Capture Payments', type: 'boolean', default: true },
    ],
    config: {
      keyId: 'rzp_live_test_983742',
      autoCapture: true,
    },
  },

  // 2. Stripe
  {
    id: 'stripe',
    name: 'Stripe Global Payments',
    version: '4.1.2',
    category: 'PAYMENT_GATEWAY',
    description: 'International credit card processing, Apple Pay, Google Pay, and multi-currency billing.',
    iconName: 'Globe',
    developer: 'Stripe Inc.',
    isInstalled: true,
    isEnabled: false,
    supportedHooks: ['PAYMENT_PROCESS'],
    configFields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_XXXXXXXX', isRequired: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', isRequired: true },
      { key: 'currency', label: 'Settlement Currency', type: 'select', options: ['INR', 'USD', 'EUR', 'GBP', 'AED'], default: 'INR' },
    ],
    config: {
      currency: 'INR',
    },
  },

  // 3. PhonePe
  {
    id: 'phonepe',
    name: 'PhonePe Payment Gateway & Soundbox',
    version: '2.8.0',
    category: 'PAYMENT_GATEWAY',
    description: 'Dynamic UPI QR generation, instant settlement notifications, and smart soundbox audio broadcast.',
    iconName: 'Smartphone',
    developer: 'PhonePe Pvt Ltd',
    isInstalled: true,
    isEnabled: true,
    supportedHooks: ['PAYMENT_PROCESS'],
    configFields: [
      { key: 'merchantId', label: 'Merchant ID', type: 'text', isRequired: true },
      { key: 'saltKey', label: 'Salt Key', type: 'password', isRequired: true },
      { key: 'enableSoundbox', label: 'Audio Voice Alerts', type: 'boolean', default: true },
    ],
    config: {
      merchantId: 'PHONEPE_APEX_MERCHANT',
      enableSoundbox: true,
    },
  },

  // 4. Google Pay
  {
    id: 'gpay',
    name: 'Google Pay for Business',
    version: '2.1.0',
    category: 'PAYMENT_GATEWAY',
    description: 'Instant UPI deep-linking and dynamic Google Pay QR codes for quick customer checkout.',
    iconName: 'QrCode',
    developer: 'Google LLC',
    isInstalled: true,
    isEnabled: true,
    supportedHooks: ['PAYMENT_PROCESS'],
    configFields: [
      { key: 'merchantVpa', label: 'Merchant UPI VPA', type: 'text', placeholder: 'billing@okhdfcbank', isRequired: true },
      { key: 'merchantName', label: 'Verified Merchant Name', type: 'text', isRequired: true },
    ],
    config: {
      merchantVpa: 'billing@okhdfcbank',
      merchantName: 'Apex Multi-Business Store',
    },
  },

  // 5. Barcode Scanner
  {
    id: 'barcode_scanner',
    name: 'High-Speed Barcode / 2D Scanner',
    version: '1.9.0',
    category: 'HARDWARE',
    description: 'Hardware USB HID / Bluetooth barcode reader with automated keystroke buffer interceptor.',
    iconName: 'Scan',
    developer: 'Universal Hardware Drivers',
    isInstalled: true,
    isEnabled: true,
    supportedHooks: ['BARCODE_SCANNED'],
    configFields: [
      { key: 'scannerMode', label: 'Scanner Mode', type: 'select', options: ['USB_HID_KEYBOARD', 'SERIAL_COM_PORT', 'BLUETOOTH'], default: 'USB_HID_KEYBOARD' },
      { key: 'minCharLength', label: 'Minimum Barcode Length', type: 'number', default: 4 },
      { key: 'autoAddToCart', label: 'Auto Add to POS Cart', type: 'boolean', default: true },
    ],
    config: {
      scannerMode: 'USB_HID_KEYBOARD',
      minCharLength: 4,
      autoAddToCart: true,
    },
  },

  // 6. Label Printer
  {
    id: 'label_printer',
    name: 'Zebra / TSC Thermal Label Printer',
    version: '2.5.0',
    category: 'HARDWARE',
    description: 'Direct thermal barcode, SKU, MRP price tag, and batch expiry label printer (ZPL / EPL).',
    iconName: 'Printer',
    developer: 'AutoID Peripheral Core',
    isInstalled: true,
    isEnabled: true,
    supportedHooks: ['PRINT_LABEL'],
    configFields: [
      { key: 'printerModel', label: 'Printer Model', type: 'select', options: ['ZEBRA_ZPL', 'TSC_TSPL', 'CITIZEN', 'GENERIC_ESC_POS'], default: 'ZEBRA_ZPL' },
      { key: 'labelSize', label: 'Label Dimension', type: 'select', options: ['50mm x 25mm (Standard Tag)', '38mm x 25mm (Jewellery/Pharma)', '100mm x 150mm (Shipping)'], default: '50mm x 25mm (Standard Tag)' },
      { key: 'dpi', label: 'Print Resolution', type: 'select', options: ['203 DPI', '300 DPI'], default: '203 DPI' },
    ],
    config: {
      printerModel: 'ZEBRA_ZPL',
      labelSize: '50mm x 25mm (Standard Tag)',
      dpi: '203 DPI',
    },
  },

  // 7. Courier API
  {
    id: 'courier_api',
    name: 'Shiprocket & Delhivery Courier API',
    version: '3.0.1',
    category: 'LOGISTICS',
    description: 'Automated courier rate calculation, instant AWB generation, and package tracking for delivery orders.',
    iconName: 'Truck',
    developer: 'Logistics Aggregator',
    isInstalled: true,
    isEnabled: true,
    supportedHooks: ['DISPATCH_COURIER'],
    configFields: [
      { key: 'provider', label: 'Courier Provider', type: 'select', options: ['SHIPROCKET', 'DELHIVERY', 'DUNZO_DIRECT', 'PORTER'], default: 'SHIPROCKET' },
      { key: 'apiKey', label: 'Courier API Key', type: 'password', isRequired: true },
      { key: 'pickupPincode', label: 'Store Pickup Pincode', type: 'text', isRequired: true },
    ],
    config: {
      provider: 'SHIPROCKET',
      pickupPincode: '600001',
    },
  },

  // 8. Tally Prime
  {
    id: 'tally',
    name: 'TallyPrime XML/ODBC Connector',
    version: '5.2.0',
    category: 'ACCOUNTING',
    description: 'Real-time sales vouchers, customer ledgers, and inventory journal entry sync with TallyPrime.',
    iconName: 'Database',
    developer: 'Tally Solutions Partner',
    isInstalled: true,
    isEnabled: true,
    supportedHooks: ['SYNC_ACCOUNTING', 'INVOICE_GENERATED'],
    configFields: [
      { key: 'tallyServerHost', label: 'Tally Server IP / Host', type: 'text', default: 'localhost', isRequired: true },
      { key: 'tallyServerPort', label: 'Tally HTTP Port', type: 'number', default: 9000, isRequired: true },
      { key: 'companyName', label: 'Tally Company Name', type: 'text', placeholder: 'My Business Pvt Ltd', isRequired: true },
      { key: 'salesLedger', label: 'Sales Ledger Account', type: 'text', default: 'Sales Account' },
    ],
    config: {
      tallyServerHost: 'localhost',
      tallyServerPort: 9000,
      companyName: 'Apex Multi-Business Store',
      salesLedger: 'Sales Account',
    },
  },

  // 9. Zoho Books
  {
    id: 'zoho',
    name: 'Zoho Books Cloud Accounting',
    version: '2.9.0',
    category: 'ACCOUNTING',
    description: 'Cloud accounting integration for GST tax compliance, invoices, customer credits, and expense ledgers.',
    iconName: 'BookOpen',
    developer: 'Zoho Corporation',
    isInstalled: true,
    isEnabled: false,
    supportedHooks: ['SYNC_ACCOUNTING', 'INVOICE_GENERATED'],
    configFields: [
      { key: 'organizationId', label: 'Zoho Organization ID', type: 'text', isRequired: true },
      { key: 'clientId', label: 'Zoho Client ID', type: 'text', isRequired: true },
      { key: 'clientSecret', label: 'Zoho Client Secret', type: 'password', isRequired: true },
    ],
    config: {
      organizationId: '6000987261',
    },
  },
];

export class PluginEngine {
  private static STORAGE_KEY = 'multi_biz_plugins_config';

  /**
   * Retrieves all registered plugins
   */
  static getPlugins(category?: PluginCategory): PluginDefinition[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      let list: PluginDefinition[] = DEFAULT_PLUGINS;
      if (raw) {
        const saved: PluginDefinition[] = JSON.parse(raw);
        list = DEFAULT_PLUGINS.map(def => {
          const matched = saved.find(s => s.id === def.id);
          return matched ? { ...def, isEnabled: matched.isEnabled, config: { ...def.config, ...matched.config } } : def;
        });
      }
      if (category) {
        return list.filter(p => p.category === category);
      }
      return list;
    } catch {
      return DEFAULT_PLUGINS;
    }
  }

  static getPlugin(id: string): PluginDefinition | undefined {
    return this.getPlugins().find(p => p.id === id);
  }

  static togglePlugin(pluginId: string, isEnabled: boolean): void {
    const all = this.getPlugins();
    const updated = all.map(p => p.id === pluginId ? { ...p, isEnabled } : p);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static updatePluginConfig(pluginId: string, newConfig: Record<string, any>): void {
    const all = this.getPlugins();
    const updated = all.map(p => p.id === pluginId ? { ...p, config: { ...p.config, ...newConfig } } : p);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  /**
   * Executes a plugin hook across active plugins without modifying core code
   */
  static executeHook(event: PluginHookEvent, context: any, targetPluginId?: string): PluginExecutionResult[] {
    const all = this.getPlugins();
    const targetList = targetPluginId 
      ? all.filter(p => p.id === targetPluginId && p.supportedHooks.includes(event))
      : all.filter(p => p.isEnabled && p.supportedHooks.includes(event));

    const results: PluginExecutionResult[] = targetList.map(plugin => {
      try {
        switch (event) {
          case 'PAYMENT_PROCESS': {
            const amount = context?.amount || 100;
            const orderId = context?.orderId || 'ORD-TEST';
            if (plugin.id === 'razorpay') {
              return {
                pluginId: plugin.id,
                success: true,
                message: `Razorpay order generated for ₹${amount} (Order: ${orderId})`,
                data: { razorpayOrderId: `order_rzp_${Date.now()}`, qrUrl: 'https://upi.qr/rzp' }
              };
            }
            if (plugin.id === 'stripe') {
              return {
                pluginId: plugin.id,
                success: true,
                message: `Stripe PaymentIntent created for ₹${amount}`,
                data: { clientSecret: `pi_${Date.now()}_secret` }
              };
            }
            if (plugin.id === 'phonepe') {
              return {
                pluginId: plugin.id,
                success: true,
                message: `PhonePe Dynamic QR generated for ₹${amount}`,
                data: { qrString: `upi://pay?pa=phonepe@ybl&am=${amount}` }
              };
            }
            if (plugin.id === 'gpay') {
              return {
                pluginId: plugin.id,
                success: true,
                message: `Google Pay intent generated`,
                data: { gpayIntent: `upi://pay?pa=${plugin.config.merchantVpa}&am=${amount}` }
              };
            }
            break;
          }

          case 'BARCODE_SCANNED': {
            const rawCode = String(context?.barcode || '890103000001');
            const cleanSku = rawCode.trim();
            return {
              pluginId: plugin.id,
              success: true,
              message: `Barcode parsed: ${cleanSku}`,
              data: { sku: cleanSku, parsedAt: new Date().toISOString() }
            };
          }

          case 'PRINT_LABEL': {
            const itemName = context?.name || 'Item Name';
            const mrp = context?.mrp || '199';
            const zplCode = `^XA^FO50,50^ADN,36,20^FD${itemName}^FS^FO50,100^B3N,N,100,Y,N^FD${context?.sku || 'SKU123'}^FS^FO50,220^ADN,24,14^FDMRP: Rs.${mrp}^FS^XZ`;
            return {
              pluginId: plugin.id,
              success: true,
              message: `ZPL Thermal Label Generated for ${itemName}`,
              data: { zplPayload: zplCode, printerModel: plugin.config.printerModel }
            };
          }

          case 'DISPATCH_COURIER': {
            const awbNo = `DEL-${Math.floor(10000000 + Math.random() * 90000000)}`;
            return {
              pluginId: plugin.id,
              success: true,
              message: `Courier booked with ${plugin.config.provider}: AWB #${awbNo}`,
              data: { awb: awbNo, provider: plugin.config.provider, status: 'MANIFEST_CREATED' }
            };
          }

          case 'SYNC_ACCOUNTING':
          case 'INVOICE_GENERATED': {
            const invoiceNo = context?.orderNumber || 'INV-1001';
            const total = context?.total || 1000;
            if (plugin.id === 'tally') {
              const xmlVoucher = `<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDATA><TALLYMESSAGE><VOUCHER VCHTYPE="Sales"><VOUCHERNUMBER>${invoiceNo}</VOUCHERNUMBER><AMOUNT>${total}</AMOUNT></VOUCHER></TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`;
              return {
                pluginId: plugin.id,
                success: true,
                message: `Synced Invoice ${invoiceNo} (₹${total}) to Tally Server`,
                data: { xmlPayload: xmlVoucher, host: plugin.config.tallyServerHost }
              };
            }
            if (plugin.id === 'zoho') {
              return {
                pluginId: plugin.id,
                success: true,
                message: `Synced Invoice ${invoiceNo} to Zoho Books`,
                data: { zohoInvoiceId: `zoho_inv_${Date.now()}` }
              };
            }
            break;
          }
        }

        return {
          pluginId: plugin.id,
          success: true,
          message: `Hook ${event} executed for plugin ${plugin.name}`,
        };
      } catch (err: any) {
        return {
          pluginId: plugin.id,
          success: false,
          error: err?.message || 'Plugin execution failed',
        };
      }
    });

    return results;
  }
}
