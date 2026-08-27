import { 
  ThemeConfig, 
  ColorPreset, 
  FontPreset, 
  InvoiceThemeId 
} from '../../types/theme';
import { BusinessTemplate } from '../../types/template';

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'LUXURY_GOLD',
    name: 'Royal Gold (Default)',
    primary: '#C5A059',
    primaryHover: '#B08D4A',
    bgTint: 'rgba(197, 160, 89, 0.12)',
    borderTint: 'rgba(197, 160, 89, 0.35)',
    glow: '0 0 20px rgba(197, 160, 89, 0.25)',
  },
  {
    id: 'ROYAL_EMERALD',
    name: 'Imperial Emerald',
    primary: '#10B981',
    primaryHover: '#059669',
    bgTint: 'rgba(16, 185, 129, 0.12)',
    borderTint: 'rgba(16, 185, 129, 0.35)',
    glow: '0 0 20px rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'SAPPHIRE_BLUE',
    name: 'Sapphire Blue',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    bgTint: 'rgba(59, 130, 246, 0.12)',
    borderTint: 'rgba(59, 130, 246, 0.35)',
    glow: '0 0 20px rgba(59, 130, 246, 0.25)',
  },
  {
    id: 'AMETHYST_PURPLE',
    name: 'Amethyst Purple',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    bgTint: 'rgba(139, 92, 246, 0.12)',
    borderTint: 'rgba(139, 92, 246, 0.35)',
    glow: '0 0 20px rgba(139, 92, 246, 0.25)',
  },
  {
    id: 'RUBY_ROSE',
    name: 'Ruby Crimson',
    primary: '#F43F5E',
    primaryHover: '#E11D48',
    bgTint: 'rgba(244, 63, 94, 0.12)',
    borderTint: 'rgba(244, 63, 94, 0.35)',
    glow: '0 0 20px rgba(244, 63, 94, 0.25)',
  },
  {
    id: 'SUNSET_AMBER',
    name: 'Sunset Amber',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    bgTint: 'rgba(245, 158, 11, 0.12)',
    borderTint: 'rgba(245, 158, 11, 0.35)',
    glow: '0 0 20px rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'SLATE_CYAN',
    name: 'Nordic Cyan',
    primary: '#06B6D4',
    primaryHover: '#0891B2',
    bgTint: 'rgba(6, 182, 212, 0.12)',
    borderTint: 'rgba(6, 182, 212, 0.35)',
    glow: '0 0 20px rgba(6, 182, 212, 0.25)',
  },
];

export const FONT_PRESETS: FontPreset[] = [
  { id: 'Outfit', name: 'Outfit (Default)', fontFamily: "'Outfit', sans-serif", category: 'Modern Sans' },
  { id: 'Inter', name: 'Inter UI', fontFamily: "'Inter', sans-serif", category: 'Clean Enterprise' },
  { id: 'Roboto', name: 'Roboto', fontFamily: "'Roboto', sans-serif", category: 'Modern Sans' },
  { id: 'Cinzel', name: 'Cinzel Decorative', fontFamily: "'Cinzel', serif", category: 'Luxury Serif' },
  { id: 'JetBrains Mono', name: 'JetBrains Monospace', fontFamily: "'JetBrains Mono', monospace", category: 'Technical Mono' },
];

export const INVOICE_THEME_DETAILS: Record<InvoiceThemeId, { name: string; description: string; headerClass: string; borderClass: string; badgeColor: string }> = {
  LUXURY_GOLD: {
    name: 'Royal Gold Luxury',
    description: 'Gold accent lines, watermark luxury badge, and elegant serif headers.',
    headerClass: 'text-[#C5A059] border-b-2 border-[#C5A059]',
    borderClass: 'border-[#C5A059]/40',
    badgeColor: 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30',
  },
  MINIMAL_CLEAN: {
    name: 'Minimal High-Contrast',
    description: 'Ultra-clean monochrome borderless receipt optimized for fast thermal printing.',
    headerClass: 'text-white border-b border-gray-700',
    borderClass: 'border-gray-800',
    badgeColor: 'bg-white/10 text-white border-white/20',
  },
  MODERN_BLUE: {
    name: 'Sapphire Modern',
    description: 'Corporate navy and sapphire accents with dual-tone table column highlights.',
    headerClass: 'text-blue-400 border-b-2 border-blue-500',
    borderClass: 'border-blue-500/30',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  EMERALD_GREEN: {
    name: 'Botanical Emerald',
    description: 'Fresh emerald themes ideal for Medical Pharmacies, Organics, and Health retail.',
    headerClass: 'text-emerald-400 border-b-2 border-emerald-500',
    borderClass: 'border-emerald-500/30',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  COMPACT_DARK: {
    name: 'Compact Dark POS',
    description: 'High-density receipt layout with dark banner headers and condensed typography.',
    headerClass: 'bg-[#1A1A1C] text-white p-2 rounded-lg',
    borderClass: 'border-[#2D2D30]',
    badgeColor: 'bg-[#252528] text-gray-300 border-[#3D3D42]',
  },
};

export class ThemeEngine {
  private static STORAGE_KEY = 'multi_biz_theme_config';

  /**
   * Applies the theme configuration to the DOM root dynamically
   */
  static applyTheme(config: ThemeConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Color Palette Resolution
    const colorPreset = COLOR_PRESETS.find(c => c.id === config.colorPreset) || COLOR_PRESETS[0];
    const primary = config.customPrimaryColor || colorPreset.primary;
    const hover = colorPreset.primaryHover;
    const bgTint = colorPreset.bgTint;
    const borderTint = colorPreset.borderTint;

    root.style.setProperty('--theme-primary', primary);
    root.style.setProperty('--theme-primary-hover', hover);
    root.style.setProperty('--theme-primary-bg', bgTint);
    root.style.setProperty('--theme-primary-border', borderTint);

    // 2. Typography / Font
    const font = FONT_PRESETS.find(f => f.id === config.fontFamily) || FONT_PRESETS[0];
    root.style.setProperty('--theme-font', font.fontFamily);
    document.body.style.fontFamily = font.fontFamily;

    // 3. Font Size Scaling
    if (config.fontSize === 'SMALL') {
      root.style.fontSize = '13px';
    } else if (config.fontSize === 'LARGE') {
      root.style.fontSize = '16px';
    } else {
      root.style.fontSize = '14px';
    }

    // 4. Update Document Title
    if (config.brandTitle) {
      document.title = `${config.brandTitle} | Multi-Business POS`;
    }
  }

  /**
   * Retrieves active theme config with fallback to template defaults
   */
  static getThemeConfig(template?: BusinessTemplate): ThemeConfig {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    // Fallback defaults from active template
    return {
      logoUrl: '',
      brandTitle: template?.invoiceLayout?.headerTitle || 'Apex Multi-Business Billing',
      brandTagline: template?.invoiceLayout?.tagline || 'Enterprise Cloud Point of Sale & Billing System',
      colorPreset: 'LUXURY_GOLD',
      fontFamily: 'Outfit',
      fontSize: 'MEDIUM',
      iconStyle: 'ROUNDED_ORGANIC',
      invoiceTheme: 'LUXURY_GOLD',
      headerTitle: template?.invoiceLayout?.headerTitle || 'Apex Multi-Business Billing',
      tagline: template?.invoiceLayout?.tagline || 'Enterprise Point of Sale',
      termsText: template?.invoiceLayout?.termsText || 'Goods once sold cannot be returned without original bill.',
      thankYouNote: template?.invoiceLayout?.thankYouNote || 'Thank you for your business! Please visit again.',
      showLogoOnInvoice: template?.invoiceLayout?.showLogo ?? true,
      showQrCodeOnInvoice: template?.invoiceLayout?.showQrCode ?? true,
    };
  }

  /**
   * Saves and applies theme configuration
   */
  static saveThemeConfig(config: ThemeConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      this.applyTheme(config);
    } catch (e) {
      console.error('Failed to save theme config', e);
    }
  }
}
