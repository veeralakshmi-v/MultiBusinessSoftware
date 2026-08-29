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
  primaryBg: string;       // Primary color for background
  secondaryBtn: string;    // Secondary color for buttons & CTAs
  secondaryHover: string; // Secondary button hover color
  textOnSecondary: string; // Button text color for optimal contrast
  textColor: string;       // Primary text / font color
  textAccentColor: string; // Accent text / font color
  surfaceBg: string;      // Card / Panel background surface
  cardBg: string;         // Container surface background
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
  primaryBgColor: string;    // Primary background color hex
  secondaryBtnColor: string; // Secondary button color hex
  textColor: string;         // Custom font / text color hex
  textAccentColor: string;   // Custom font accent color hex
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


