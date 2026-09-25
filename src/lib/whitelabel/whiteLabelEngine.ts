import { WhiteLabelConfig } from '../../types/whitelabel';

export const DEFAULT_WHITELABEL_CONFIG: WhiteLabelConfig = {
  companyName: 'Apex Multi-Business POS',
  legalEntityName: 'Apex Retail & Foodtech Private Limited',
  logoUrl: '',
  faviconUrl: '',
  customDomain: 'billing.apexenterprise.com',
  isDomainVerified: true,
  sslStatus: 'ACTIVE',
  
  invoice: {
    headerTitle: 'Apex Multi-Business Store',
    tagline: 'Authentic Quality & Premium Experience',
    watermarkText: 'AUTHENTIC & PAID',
    footerNote: 'Thank you for your patronage! Please visit again.',
    termsAndConditions: 'Goods once sold cannot be returned without original tax bill. E&OE.',
    hidePlatformBranding: true,
    gstin: '33AAAAA0000A1Z5',
    cin: 'U72900TN2024PTC123456',
    fssai: '12421001000543',
  },

  email: {
    senderName: 'Apex Invoicing & Receipts',
    senderEmail: 'invoices@apexenterprise.com',
    replyToEmail: 'support@apexenterprise.com',
    emailFooterSignature: '© 2026 Apex Enterprise Group. All rights reserved.',
  },

  sms: {
    senderId: 'APEXBK',
    templatePrefix: 'Dear Customer, your bill at Apex',
    supportPhone: '+91 98765 43210',
  },

  theme: {
    primaryColor: '#C5A059',
    accentColor: '#F3E5AB',
    fontFamily: 'Outfit',
    borderRadius: 'ROUNDED',
    mode: 'DARK',
  },
};

export class WhiteLabelEngine {
  private static STORAGE_KEY = 'multi_biz_whitelabel_config';
  private static memoryConfig: WhiteLabelConfig = { ...DEFAULT_WHITELABEL_CONFIG };

  /**
   * Retrieves active white label settings
   */
  static getConfig(): WhiteLabelConfig {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          this.memoryConfig = JSON.parse(raw);
          return this.memoryConfig;
        }
      }
    } catch {}
    return this.memoryConfig;
  }

  /**
   * Saves and deploys white label settings
   */
  static saveConfig(newConfig: WhiteLabelConfig): void {
    this.memoryConfig = { ...newConfig };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));
      }
    } catch {}
    this.applyWhiteLabel(newConfig);
  }

  /**
   * Dynamically applies title, favicon, and CSS variables without modifying core code
   */
  static applyWhiteLabel(config: WhiteLabelConfig): void {
    if (typeof document === 'undefined') return;

    // 1. Browser Tab Title
    if (config.companyName) {
      document.title = `${config.companyName} | Cloud POS`;
    }

    // 2. Favicon
    if (config.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.faviconUrl;
    }

    // 3. Dynamic CSS Theme Tokens
    const root = document.documentElement;
    if (config.theme?.primaryColor) {
      root.style.setProperty('--theme-primary', config.theme.primaryColor);
    }
  }

  /**
   * Resolves white-labeled invoice header and legal metadata
   */
  static resolveInvoiceBranding(): {
    title: string;
    tagline: string;
    gstin: string;
    fssai?: string;
    watermark?: string;
    footerNote: string;
    terms: string;
    hidePoweredBy: boolean;
  } {
    const config = this.getConfig();
    return {
      title: config.invoice.headerTitle || config.companyName,
      tagline: config.invoice.tagline,
      gstin: config.invoice.gstin,
      fssai: config.invoice.fssai,
      watermark: config.invoice.watermarkText,
      footerNote: config.invoice.footerNote,
      terms: config.invoice.termsAndConditions,
      hidePoweredBy: config.invoice.hidePlatformBranding,
    };
  }

  /**
   * Resolves email sender header
   */
  static resolveEmailSender(): string {
    const config = this.getConfig();
    return `"${config.email.senderName}" <${config.email.senderEmail}>`;
  }

  /**
   * Resolves DLT approved SMS sender ID
   */
  static resolveSmsSenderId(): string {
    const config = this.getConfig();
    return (config.sms.senderId || 'APEXBK').toUpperCase().slice(0, 6);
  }
}
