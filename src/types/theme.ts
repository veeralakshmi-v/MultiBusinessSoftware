export type InvoiceThemeId = 
  | 'LUXURY_GOLD' 
  | 'MINIMAL_CLEAN' 
  | 'MODERN_BLUE' 
  | 'EMERALD_GREEN' 
  | 'COMPACT_DARK';

export type IconStyle = 'ROUNDED_ORGANIC' | 'SHARP_GEOMETRIC' | 'CLASSIC_OUTLINE';

export type FontSizeOption = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  bgTint: string;
  borderTint: string;
  glow: string;
}

export interface FontPreset {
  id: string;
  name: string;
  fontFamily: string;
  category: 'Modern Sans' | 'Clean Enterprise' | 'Luxury Serif' | 'Technical Mono';
}

export interface ThemeConfig {
  logoUrl?: string;
  brandTitle: string;
  brandTagline: string;
  colorPreset: string;
  customPrimaryColor?: string;
  fontFamily: string;
  fontSize: FontSizeOption;
  iconStyle: IconStyle;
  invoiceTheme: InvoiceThemeId;
  headerTitle: string;
  tagline: string;
  termsText: string;
  thankYouNote: string;
  showLogoOnInvoice: boolean;
  showQrCodeOnInvoice: boolean;
}
