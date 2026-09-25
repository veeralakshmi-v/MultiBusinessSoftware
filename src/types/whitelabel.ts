export interface WhiteLabelConfig {
  companyName: string;
  legalEntityName: string;
  logoUrl: string;
  faviconUrl: string;
  customDomain: string;
  isDomainVerified: boolean;
  sslStatus: 'ACTIVE' | 'PENDING' | 'DISABLED';
  
  invoice: {
    headerTitle: string;
    tagline: string;
    watermarkText?: string;
    footerNote: string;
    termsAndConditions: string;
    hidePlatformBranding: boolean;
    gstin: string;
    cin?: string;
    fssai?: string;
  };

  email: {
    senderName: string;
    senderEmail: string;
    replyToEmail: string;
    emailFooterSignature: string;
  };

  sms: {
    senderId: string; // 6-character DLT ID
    templatePrefix: string;
    supportPhone: string;
  };

  theme: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: 'ROUNDED' | 'SQUARE' | 'PILL';
    mode: 'DARK' | 'LIGHT' | 'SYSTEM';
  };
}
