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
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (SaaS Modern)', fontFamily: "'Plus Jakarta Sans', sans-serif", category: 'Modern Sans' },
  { id: 'Poppins', name: 'Poppins (Friendly Geometric)', fontFamily: "'Poppins', sans-serif", category: 'Modern Sans' },
  { id: 'Roboto', name: 'Roboto (Standard Sans)', fontFamily: "'Roboto', sans-serif", category: 'Modern Sans' },
  { id: 'Montserrat', name: 'Montserrat (Bold Modern)', fontFamily: "'Montserrat', sans-serif", category: 'Modern Sans' },
  { id: 'Open Sans', name: 'Open Sans (Neutral Clean)', fontFamily: "'Open Sans', sans-serif", category: 'Modern Sans' },
  { id: 'Lato', name: 'Lato (Warm Corporate)', fontFamily: "'Lato', sans-serif", category: 'Modern Sans' },
  { id: 'Playfair Display', name: 'Playfair Display (Editorial Serif)', fontFamily: "'Playfair Display', serif", category: 'Luxury Serif' },
  { id: 'Cinzel', name: 'Cinzel Decorative', fontFamily: "'Cinzel', serif", category: 'Luxury Serif' },
  { id: 'Merriweather', name: 'Merriweather (Classic Editorial)', fontFamily: "'Merriweather', serif", category: 'Luxury Serif' },
  { id: 'JetBrains Mono', name: 'JetBrains Monospace', fontFamily: "'JetBrains Mono', monospace", category: 'Technical Mono' },
  { id: 'Fira Code', name: 'Fira Code (Developer Mono)', fontFamily: "'Fira Code', monospace", category: 'Technical Mono' },
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
   * Dynamically loads a Google Font by name into the document head
   */
  static loadGoogleFont(fontName: string): void {
    if (typeof document === 'undefined' || !fontName) return;
    const cleanName = fontName.replace(/['",]/g, '').trim();
    const isSystem = ['system', 'system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace', 'arial', 'helvetica'].includes(cleanName.toLowerCase());
    if (isSystem || !cleanName) return;

    const linkId = `google-font-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName).replace(/%20/g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap`;
      document.head.appendChild(link);
    }
  }

  /**
   * Applies the theme configuration to the DOM root dynamically
   */
  static applyTheme(config: ThemeConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Color Palette Resolution
    const primaryBg = config.primaryBgColor || '#F8FAFC';
    const secondaryBtn = config.secondaryBtnColor || '#2563EB';
    
    // Check if background is light color
    const isLightBg = getContrastTextColor(primaryBg) === '#0A0A0B';

    const textColor = config.textColor || (isLightBg ? '#0F172A' : '#FFFFFF');
    const textAccentColor = config.textAccentColor || secondaryBtn;

    const secondaryHover = adjustColorBrightness(secondaryBtn, -20);
    const textOnSecondary = getContrastTextColor(secondaryBtn);

    const surfaceBg = config.cardBgColor || (isLightBg ? '#FFFFFF' : adjustColorBrightness(primaryBg, 14));
    const cardBg = config.cardBgColor || (isLightBg ? '#F1F5F9' : adjustColorBrightness(primaryBg, 22));

    const rgbSecondary = hexToRgb(secondaryBtn);
    const borderTint = isLightBg ? 'rgba(0, 0, 0, 0.12)' : `rgba(${rgbSecondary}, 0.35)`;
    const glow = `0 4px 20px rgba(${rgbSecondary}, 0.20)`;

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

    // Font Weight
    if (config.fontWeight) {
      root.style.setProperty('--theme-font-weight', config.fontWeight);
    }

    // Legacy variables fallback
    root.style.setProperty('--theme-primary', secondaryBtn);
    root.style.setProperty('--theme-primary-hover', secondaryHover);
    root.style.setProperty('--theme-primary-bg', `rgba(${rgbSecondary}, 0.12)`);
    root.style.setProperty('--theme-primary-border', borderTint);

    // Ensure document body background
    document.body.style.backgroundColor = primaryBg;
    document.body.style.color = textColor;

    // 2. Typography / Font
    const selectedFont = FONT_PRESETS.find(f => f.id === config.fontFamily);
    const fontToApply = selectedFont ? selectedFont.fontFamily : `'${config.fontFamily}', sans-serif`;
    
    // Dynamically load Google font if needed
    const fontNameForGoogle = selectedFont ? selectedFont.id : config.fontFamily;
    this.loadGoogleFont(fontNameForGoogle);

    root.style.setProperty('--theme-font', fontToApply);

    // 3. Update Document Title
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
        return {
          ...parsed,
          primaryBgColor: parsed.primaryBgColor || '#F8FAFC',
          secondaryBtnColor: parsed.secondaryBtnColor || '#2563EB',
          textColor: parsed.textColor || '#0F172A',
          textAccentColor: parsed.textAccentColor || '#2563EB',
          cardBgColor: parsed.cardBgColor || '#FFFFFF',
          fontFamily: parsed.fontFamily || 'Outfit',
          fontWeight: parsed.fontWeight || '400',
          fontSize: parsed.fontSize || 'MEDIUM',
        };
      }
    } catch {}

    // Fallback defaults from active template
    return {
      logoUrl: '',
      brandTitle: template?.invoiceLayout?.headerTitle || 'Apex Multi-Business Billing',
      brandTagline: template?.invoiceLayout?.tagline || 'Enterprise Cloud Point of Sale & Billing System',
      colorPreset: 'CUSTOM',
      primaryBgColor: '#F8FAFC',
      secondaryBtnColor: '#2563EB',
      textColor: '#0F172A',
      textAccentColor: '#2563EB',
      cardBgColor: '#FFFFFF',
      fontFamily: 'Outfit',
      fontWeight: '400',
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


