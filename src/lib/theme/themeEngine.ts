import { 
  ThemeConfig, 
  ColorPreset, 
  FontPreset, 
  InvoiceThemeId 
} from '../../types/theme';
import { BusinessTemplate } from '../../types/template';

function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '197, 160, 89';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

function getContrastTextColor(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return '#FFFFFF';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#0A0A0B' : '#FFFFFF';
}

function adjustColorBrightness(hex: string, amount: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  let num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  let r = Math.min(255, Math.max(0, (num >> 16) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const COLOR_PRESETS: ColorPreset[] = [
  // ── ROW 1: CLEAN LIGHT MODE PRESETS (WHITE BACKGROUNDS) ─────
  {
    id: 'LIGHT_SAPPHIRE',
    name: 'Ice White & Sapphire Blue',
    primaryBg: '#F8FAFC',
    secondaryBtn: '#2563EB',
    secondaryHover: '#1D4ED8',
    textOnSecondary: '#FFFFFF',
    textColor: '#0F172A',
    textAccentColor: '#2563EB',
    surfaceBg: '#FFFFFF',
    cardBg: '#F1F5F9',
    borderTint: '#E2E8F0',
    glow: '0 4px 20px rgba(37, 99, 235, 0.18)',
  },
  {
    id: 'LIGHT_ROYAL_GOLD',
    name: 'Clean Ivory & Royal Gold',
    primaryBg: '#F8F9FA',
    secondaryBtn: '#C5A059',
    secondaryHover: '#B08D4A',
    textOnSecondary: '#FFFFFF',
    textColor: '#1A1A1C',
    textAccentColor: '#9B783E',
    surfaceBg: '#FFFFFF',
    cardBg: '#F1F3F5',
    borderTint: 'rgba(197, 160, 89, 0.35)',
    glow: '0 4px 20px rgba(197, 160, 89, 0.18)',
  },
  {
    id: 'LIGHT_EMERALD',
    name: 'Mint White & Imperial Emerald',
    primaryBg: '#F0FDF4',
    secondaryBtn: '#059669',
    secondaryHover: '#047857',
    textOnSecondary: '#FFFFFF',
    textColor: '#064E3B',
    textAccentColor: '#047857',
    surfaceBg: '#FFFFFF',
    cardBg: '#DCFCE7',
    borderTint: 'rgba(5, 150, 105, 0.35)',
    glow: '0 4px 20px rgba(5, 150, 105, 0.18)',
  },
  {
    id: 'LIGHT_AMETHYST',
    name: 'Soft Violet & Amethyst Purple',
    primaryBg: '#FAF5FF',
    secondaryBtn: '#7C3AED',
    secondaryHover: '#6D28D9',
    textOnSecondary: '#FFFFFF',
    textColor: '#2E1065',
    textAccentColor: '#6D28D9',
    surfaceBg: '#FFFFFF',
    cardBg: '#F3E8FF',
    borderTint: 'rgba(124, 58, 237, 0.35)',
    glow: '0 4px 20px rgba(124, 58, 237, 0.18)',
  },

  // ── ROW 2: DARK LUXURY MODE PRESETS ─────────────────────────
  {
    id: 'LUXURY_GOLD',
    name: 'Royal Gold & Obsidian',
    primaryBg: '#0A0A0B',
    secondaryBtn: '#C5A059',
    secondaryHover: '#B08D4A',
    textOnSecondary: '#0A0A0B',
    textColor: '#F3E5AB',
    textAccentColor: '#C5A059',
    surfaceBg: '#131315',
    cardBg: '#1A1A1C',
    borderTint: 'rgba(197, 160, 89, 0.35)',
    glow: '0 0 20px rgba(197, 160, 89, 0.25)',
  },
  {
    id: 'SAPPHIRE_BLUE',
    name: 'Sapphire Blue & Navy',
    primaryBg: '#0B132B',
    secondaryBtn: '#3B82F6',
    secondaryHover: '#2563EB',
    textOnSecondary: '#FFFFFF',
    textColor: '#E2E8F0',
    textAccentColor: '#60A5FA',
    surfaceBg: '#1C2541',
    cardBg: '#253259',
    borderTint: 'rgba(59, 130, 246, 0.35)',
    glow: '0 0 20px rgba(59, 130, 246, 0.25)',
  },
  {
    id: 'ROYAL_EMERALD',
    name: 'Imperial Emerald & Forest',
    primaryBg: '#051C14',
    secondaryBtn: '#10B981',
    secondaryHover: '#059669',
    textOnSecondary: '#051C14',
    textColor: '#D1FAE5',
    textAccentColor: '#34D399',
    surfaceBg: '#0A2E21',
    cardBg: '#113E2E',
    borderTint: 'rgba(16, 185, 129, 0.35)',
    glow: '0 0 20px rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'AMETHYST_PURPLE',
    name: 'Amethyst Purple & Deep Violet',
    primaryBg: '#100926',
    secondaryBtn: '#8B5CF6',
    secondaryHover: '#7C3AED',
    textOnSecondary: '#FFFFFF',
    textColor: '#F3E8FF',
    textAccentColor: '#A78BFA',
    surfaceBg: '#1E143B',
    cardBg: '#281B4D',
    borderTint: 'rgba(139, 92, 246, 0.35)',
    glow: '0 0 20px rgba(139, 92, 246, 0.25)',
  },
];

export const FONT_PRESETS: FontPreset[] = [
  { id: 'Outfit', name: 'Outfit (Default Modern Sans)', fontFamily: "'Outfit', sans-serif", category: 'Modern Sans' },
  { id: 'Inter', name: 'Inter UI (Clean Enterprise)', fontFamily: "'Inter', sans-serif", category: 'Clean Enterprise' },
  { id: 'Roboto', name: 'Roboto (Standard Sans)', fontFamily: "'Roboto', sans-serif", category: 'Modern Sans' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (SaaS Modern)', fontFamily: "'Plus Jakarta Sans', sans-serif", category: 'Modern Sans' },
  { id: 'Poppins', name: 'Poppins (Friendly Geometric)', fontFamily: "'Poppins', sans-serif", category: 'Modern Sans' },
  { id: 'Playfair Display', name: 'Playfair Display (Editorial Serif)', fontFamily: "'Playfair Display', serif", category: 'Luxury Serif' },
  { id: 'Cinzel', name: 'Cinzel Decorative', fontFamily: "'Cinzel', serif", category: 'Luxury Serif' },
  { id: 'JetBrains Mono', name: 'JetBrains Monospace', fontFamily: "'JetBrains Mono', monospace", category: 'Technical Mono' },
  { id: 'System', name: 'System Default (Native OS)', fontFamily: "system-ui, -apple-system, sans-serif", category: 'Clean Enterprise' },
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
    badgeColor: 'bg-[#1A1A1C] text-white border-gray-700',
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
    const preset = COLOR_PRESETS.find(c => c.id === config.colorPreset) || COLOR_PRESETS[0];

    const primaryBg = config.primaryBgColor || preset.primaryBg;
    const secondaryBtn = config.secondaryBtnColor || preset.secondaryBtn;
    
    // Check if background is light color
    const isLightBg = getContrastTextColor(primaryBg) === '#0A0A0B';

    const textColor = config.textColor || preset.textColor || (isLightBg ? '#1A1A1C' : '#FFFFFF');
    const textAccentColor = config.textAccentColor || preset.textAccentColor || secondaryBtn;

    const secondaryHover = config.secondaryBtnColor
      ? adjustColorBrightness(secondaryBtn, -20)
      : preset.secondaryHover;

    const textOnSecondary = config.secondaryBtnColor
      ? getContrastTextColor(secondaryBtn)
      : preset.textOnSecondary;

    const surfaceBg = config.primaryBgColor
      ? (isLightBg ? '#FFFFFF' : adjustColorBrightness(primaryBg, 14))
      : preset.surfaceBg;

    const cardBg = config.primaryBgColor
      ? (isLightBg ? '#EDF2F7' : adjustColorBrightness(primaryBg, 22))
      : preset.cardBg;

    const rgbSecondary = hexToRgb(secondaryBtn);
    const rgbText = hexToRgb(textColor);
    const borderTint = isLightBg ? 'rgba(0, 0, 0, 0.15)' : `rgba(${rgbSecondary}, 0.35)`;
    const glow = `0 0 20px rgba(${rgbSecondary}, 0.25)`;

    // Inject Primary & Secondary & Font Color & Button CSS Root Variables
    root.style.setProperty('--theme-bg-primary', primaryBg);
    root.style.setProperty('--theme-bg-surface', surfaceBg);
    root.style.setProperty('--theme-bg-card', cardBg);
    root.style.setProperty('--theme-btn-secondary', secondaryBtn);
    root.style.setProperty('--theme-btn-secondary-rgb', rgbSecondary);
    root.style.setProperty('--theme-btn-secondary-hover', secondaryHover);
    root.style.setProperty('--theme-btn-text', textOnSecondary);
    root.style.setProperty('--theme-btn-outline-bg', isLightBg ? '#EDF2F7' : '#1A1A1C');
    root.style.setProperty('--theme-btn-outline-text', isLightBg ? '#1A1A1C' : '#FFFFFF');
    root.style.setProperty('--theme-input-bg', isLightBg ? '#FFFFFF' : surfaceBg);
    root.style.setProperty('--theme-text-primary', textColor);
    root.style.setProperty('--theme-text-accent', textAccentColor);
    root.style.setProperty('--theme-text-muted', isLightBg ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.65)');
    root.style.setProperty('--theme-border-tint', borderTint);
    root.style.setProperty('--theme-glow', glow);

    // Apply document background and body text color
    document.body.style.backgroundColor = primaryBg;
    document.body.style.color = textColor;

    // Legacy variables fallback
    root.style.setProperty('--theme-primary', secondaryBtn);
    root.style.setProperty('--theme-primary-hover', secondaryHover);
    root.style.setProperty('--theme-primary-bg', `rgba(${rgbSecondary}, 0.12)`);
    root.style.setProperty('--theme-primary-border', borderTint);

    // Apply document background
    document.body.style.backgroundColor = primaryBg;

    // 2. Typography / Font
    const font = FONT_PRESETS.find(f => f.id === config.fontFamily) || FONT_PRESETS[0];
    root.style.setProperty('--theme-font', font.fontFamily);
    document.body.style.fontFamily = font.fontFamily;

    // 3. Font Size Scaling
    if (config.fontSize === 'SMALL') {
      root.style.fontSize = '13px';
      document.body.style.fontSize = '13px';
    } else if (config.fontSize === 'LARGE') {
      root.style.fontSize = '17px';
      document.body.style.fontSize = '17px';
    } else {
      root.style.fontSize = '15px';
      document.body.style.fontSize = '15px';
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
        const parsed = JSON.parse(raw);
        if (parsed.colorPreset === 'LUXURY_GOLD' && !parsed.userCustomized) {
          parsed.colorPreset = 'LIGHT_SAPPHIRE';
          parsed.primaryBgColor = '#F8FAFC';
          parsed.secondaryBtnColor = '#2563EB';
          parsed.textColor = '#0F172A';
          parsed.textAccentColor = '#2563EB';
          parsed.invoiceTheme = 'MODERN_BLUE';
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
        }
        const preset = COLOR_PRESETS.find(c => c.id === parsed.colorPreset) || COLOR_PRESETS[0];
        return {
          ...parsed,
          primaryBgColor: parsed.primaryBgColor || preset.primaryBg,
          secondaryBtnColor: parsed.secondaryBtnColor || preset.secondaryBtn,
          textColor: parsed.textColor || preset.textColor || '#0F172A',
          textAccentColor: parsed.textAccentColor || preset.textAccentColor || preset.secondaryBtn,
        };
      }
    } catch {}

    const defaultPreset = COLOR_PRESETS[0];

    // Fallback defaults from active template
    return {
      logoUrl: '',
      brandTitle: template?.invoiceLayout?.headerTitle || 'Apex Multi-Business Billing',
      brandTagline: template?.invoiceLayout?.tagline || 'Enterprise Cloud Point of Sale & Billing System',
      colorPreset: 'LIGHT_SAPPHIRE',
      primaryBgColor: defaultPreset.primaryBg,
      secondaryBtnColor: defaultPreset.secondaryBtn,
      textColor: defaultPreset.textColor,
      textAccentColor: defaultPreset.textAccentColor,
      fontFamily: 'Outfit',

      fontSize: 'MEDIUM',
      iconStyle: 'ROUNDED_ORGANIC',
      invoiceTheme: 'MODERN_BLUE',
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

