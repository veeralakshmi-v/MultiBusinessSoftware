import React, { useState, useEffect } from 'react';
import { 
  Palette, Type, Image, Sparkles, Check, Receipt, QrCode, 
  ShieldCheck, Sliders, RefreshCw, Save, Eye, Layers, RotateCcw, AlertTriangle, Info
} from 'lucide-react';
import { ThemeEngine, COLOR_PRESETS, FONT_PRESETS, INVOICE_THEME_DETAILS } from '../../lib/theme/themeEngine';
import { ThemeConfig, InvoiceThemeId, FontSizeOption } from '../../types/theme';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

// ── HELPER FUNCTIONS FOR HEX VALIDATION & CONTRAST CALCULATION ──

const isValidHex = (hex: string): boolean => /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);

const formatHex = (val: string): string => {
  let trimmed = val.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('#')) {
    trimmed = '#' + trimmed;
  }
  return trimmed;
};

function getLuminance(hex: string): number {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return 0;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  if (!isValidHex(hex1) || !isValidHex(hex2)) return 21;
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 10) / 10;
}

export default function ThemeCustomizer() {
  const { activeTemplate, businessType, updateBusinessProfile } = useAuth();
  const [config, setConfig] = useState<ThemeConfig>(() => ThemeEngine.getThemeConfig(activeTemplate));
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loaded = ThemeEngine.getThemeConfig(activeTemplate);
    setConfig(loaded);
  }, [activeTemplate]);

  // ── DYNAMIC COLOR CHANGE HANDLER ──
  const handleCustomColorChange = (field: keyof ThemeConfig, value: string) => {
    const formatted = formatHex(value);
    
    const updated: ThemeConfig = {
      ...config,
      [field]: formatted,
      colorPreset: 'CUSTOM'
    };

    setConfig(updated);
    
    // Real-time dynamic live preview sync
    if (isValidHex(formatted)) {
      ThemeEngine.applyTheme(updated);
      window.dispatchEvent(new Event('theme_changed'));
    }
  };

  // ── RESTORE PROJECT BASE DEFAULT COLORS ──
  const handleRestoreBaseDefaults = () => {
    const defaultPreset = COLOR_PRESETS[0];
    const updated: ThemeConfig = {
      ...config,
      colorPreset: defaultPreset.id,
      primaryBgColor: defaultPreset.primaryBg,
      secondaryBtnColor: defaultPreset.secondaryBtn,
      textColor: defaultPreset.textColor,
      textAccentColor: defaultPreset.textAccentColor,
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  // ── FULL RESET TO DEFAULT HANDLER (With Confirmation Dialog) ──
  const handleResetToDefault = () => {
    if (!window.confirm('Reset all project theme & typography settings to default? This cannot be undone.')) {
      return;
    }
    const defaultPreset = COLOR_PRESETS[0];
    const defaultConfig: ThemeConfig = {
      logoUrl: '',
      brandTitle: 'Apex Multi-Business Billing',
      brandTagline: 'Enterprise Cloud Point of Sale & Billing System',
      colorPreset: defaultPreset.id,
      primaryBgColor: defaultPreset.primaryBg,
      secondaryBtnColor: defaultPreset.secondaryBtn,
      textColor: defaultPreset.textColor,
      textAccentColor: defaultPreset.textAccentColor,
      fontFamily: 'Outfit',
      fontSize: 'MEDIUM',
      iconStyle: 'ROUNDED_ORGANIC',
      invoiceTheme: 'MODERN_BLUE',
      headerTitle: 'Apex Multi-Business Billing',
      tagline: 'Enterprise Point of Sale',
      termsText: 'Goods once sold cannot be returned without original bill.',
      thankYouNote: 'Thank you for your business! Please visit again.',
      showLogoOnInvoice: true,
      showQrCodeOnInvoice: true,
    };
    setConfig(defaultConfig);
    ThemeEngine.saveThemeConfig(defaultConfig);
    ThemeEngine.applyTheme(defaultConfig);
    window.dispatchEvent(new Event('theme_changed'));
  };

  // ── DYNAMIC FONT FAMILY CHANGE HANDLER ──
  const handleFontChange = (fontId: string) => {
    const updated = { ...config, fontFamily: fontId };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  // ── FONT SIZE SELECTION ──
  const handleSelectFontSize = (size: FontSizeOption) => {
    const updated = { ...config, fontSize: size };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  // ── RECEIPT THEME SELECTION ──
  const handleSelectInvoiceTheme = (themeId: InvoiceThemeId) => {
    const updated = { ...config, invoiceTheme: themeId };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  // ── SAVE & PERSIST THEME SETTINGS ──
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    ThemeEngine.saveThemeConfig(config);
    if (updateBusinessProfile) {
      updateBusinessProfile({
        businessName: config.brandTitle,
        tagline: config.brandTagline,
        logoUrl: config.logoUrl,
        termsText: config.termsText,
        thankYouNote: config.thankYouNote
      });
    }
    window.dispatchEvent(new Event('theme_changed'));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const selectedFontObj = FONT_PRESETS.find(f => f.id === config.fontFamily) || FONT_PRESETS[0];
  const bgTextContrast = getContrastRatio(config.primaryBgColor, config.textColor || '#FFFFFF');

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-7xl mx-auto">
      
      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">Project theme, color & typography settings saved and applied successfully!</span>
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: BUSINESS IDENTITY & BRANDING */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-2.5">
            <Image className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                Business Identity & Logo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize store title, tagline, and corporate logo image</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-mono font-medium">
            {businessType || 'MULTI-BUSINESS'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Title / Store Name</label>
            <input
              type="text"
              value={config.brandTitle}
              onChange={e => setConfig({ ...config, brandTitle: e.target.value })}
              placeholder="e.g. Apex Multi-Business Store"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Tagline</label>
            <input
              type="text"
              value={config.brandTagline}
              onChange={e => setConfig({ ...config, brandTagline: e.target.value })}
              placeholder="e.g. Enterprise Cloud POS & Billing System"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Logo Image URL</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={config.logoUrl || ''}
                onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                placeholder="https://your-domain.com/logo.png"
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-blue-600 font-serif font-bold text-base flex-shrink-0 overflow-hidden">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                ) : (
                  config.brandTitle.charAt(0) || 'A'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DYNAMIC OVERALL PROJECT COLOR MANAGEMENT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                Overall Project Color Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Dynamically change background colors, button accents, and typography colors for the entire application.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreBaseDefaults}
              title="Restore standard base theme colors"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Base Default Colors</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              title="Reset all settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span>Reset All</span>
            </button>
          </div>
        </div>

        {/* Dynamic Color Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Primary Background */}
          <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Base Background Color</label>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{config.primaryBgColor}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={isValidHex(config.primaryBgColor) ? config.primaryBgColor : '#F8FAFC'}
                onChange={e => handleCustomColorChange('primaryBgColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-300 dark:border-gray-600 p-0.5 flex-shrink-0"
              />
              <input
                type="text"
                value={config.primaryBgColor}
                onChange={e => handleCustomColorChange('primaryBgColor', e.target.value)}
                placeholder="#F8FAFC"
                className={cn(
                  "h-10 w-full bg-white dark:bg-gray-900 border rounded-lg px-3 text-xs text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                  !isValidHex(config.primaryBgColor) ? "border-red-500 text-red-600" : "border-gray-300 dark:border-gray-700"
                )}
              />
            </div>
            {!isValidHex(config.primaryBgColor) && (
              <span className="text-[10px] text-red-500 block">Invalid hex code (e.g. #F8FAFC)</span>
            )}
            <div className="pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-gray-400" style={{ backgroundColor: isValidHex(config.primaryBgColor) ? config.primaryBgColor : 'transparent' }} />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Controls overall page & app background</span>
            </div>
          </div>

          {/* Secondary Buttons & CTA Accent */}
          <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Button & Accent Color</label>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{config.secondaryBtnColor}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={isValidHex(config.secondaryBtnColor) ? config.secondaryBtnColor : '#2563EB'}
                onChange={e => handleCustomColorChange('secondaryBtnColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-300 dark:border-gray-600 p-0.5 flex-shrink-0"
              />
              <input
                type="text"
                value={config.secondaryBtnColor}
                onChange={e => handleCustomColorChange('secondaryBtnColor', e.target.value)}
                placeholder="#2563EB"
                className={cn(
                  "h-10 w-full bg-white dark:bg-gray-900 border rounded-lg px-3 text-xs text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                  !isValidHex(config.secondaryBtnColor) ? "border-red-500 text-red-600" : "border-gray-300 dark:border-gray-700"
                )}
              />
            </div>
            {!isValidHex(config.secondaryBtnColor) && (
              <span className="text-[10px] text-red-500 block">Invalid hex code (e.g. #2563EB)</span>
            )}
            <div className="pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-gray-400" style={{ backgroundColor: isValidHex(config.secondaryBtnColor) ? config.secondaryBtnColor : 'transparent' }} />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Controls primary buttons, CTAs & links</span>
            </div>
          </div>

          {/* Body Text Color */}
          <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Body Text Color</label>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{config.textColor || '#0F172A'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={isValidHex(config.textColor) ? config.textColor : '#0F172A'}
                onChange={e => handleCustomColorChange('textColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-300 dark:border-gray-600 p-0.5 flex-shrink-0"
              />
              <input
                type="text"
                value={config.textColor}
                onChange={e => handleCustomColorChange('textColor', e.target.value)}
                placeholder="#0F172A"
                className={cn(
                  "h-10 w-full bg-white dark:bg-gray-900 border rounded-lg px-3 text-xs text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                  !isValidHex(config.textColor) ? "border-red-500 text-red-600" : "border-gray-300 dark:border-gray-700"
                )}
              />
            </div>
            {!isValidHex(config.textColor) && (
              <span className="text-[10px] text-red-500 block">Invalid hex code (e.g. #0F172A)</span>
            )}
            <div className="pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-gray-400" style={{ backgroundColor: isValidHex(config.textColor) ? config.textColor : 'transparent' }} />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Controls main body text & descriptions</span>
            </div>
          </div>

          {/* Heading Accent Color */}
          <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Heading & Highlight Color</label>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{config.textAccentColor || config.secondaryBtnColor}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={isValidHex(config.textAccentColor) ? config.textAccentColor : (config.secondaryBtnColor || '#2563EB')}
                onChange={e => handleCustomColorChange('textAccentColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-300 dark:border-gray-600 p-0.5 flex-shrink-0"
              />
              <input
                type="text"
                value={config.textAccentColor || ''}
                onChange={e => handleCustomColorChange('textAccentColor', e.target.value)}
                placeholder="#2563EB"
                className={cn(
                  "h-10 w-full bg-white dark:bg-gray-900 border rounded-lg px-3 text-xs text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                  config.textAccentColor && !isValidHex(config.textAccentColor) ? "border-red-500 text-red-600" : "border-gray-300 dark:border-gray-700"
                )}
              />
            </div>
            {config.textAccentColor && !isValidHex(config.textAccentColor) && (
              <span className="text-[10px] text-red-500 block">Invalid hex code</span>
            )}
            <div className="pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-gray-400" style={{ backgroundColor: isValidHex(config.textAccentColor) ? config.textAccentColor : 'transparent' }} />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Controls section headings & badges</span>
            </div>
          </div>
        </div>

        {/* Contrast / Accessibility Check Warning */}
        {bgTextContrast < 4.5 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Low contrast ratio ({bgTextContrast}:1)</strong> — text may be hard to read on this background. Recommended WCAG ratio is at least 4.5:1.
            </span>
          </div>
        )}

        {/* Live Interactive Preview Box */}
        <div 
          className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4 transition-all shadow-sm"
          style={{ backgroundColor: config.primaryBgColor, color: config.textColor || '#0F172A' }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2.5">
            <span className="text-xs font-bold flex items-center gap-2" style={{ color: config.textColor || '#0F172A' }}>
              <Eye className="w-4 h-4" style={{ color: config.textAccentColor || config.secondaryBtnColor }} />
              Live Dynamic UI & Font Preview
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-current font-mono font-semibold" style={{ color: config.textAccentColor || config.secondaryBtnColor }}>
              Real-time Synced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Typography Sample */}
            <div className="space-y-1.5 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: config.textAccentColor || config.secondaryBtnColor }}>
                Heading Sample
              </p>
              <p className="text-xs font-medium" style={{ color: config.textColor || '#0F172A', fontFamily: selectedFontObj.fontFamily }}>
                Body text sample rendered in active project font family and color settings.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold" style={{ color: config.textColor || '#0F172A' }}>Action Buttons</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg shadow-sm transition-all text-white"
                  style={{
                    backgroundColor: config.secondaryBtnColor,
                  }}
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                  style={{
                    borderColor: config.secondaryBtnColor,
                    color: config.secondaryBtnColor
                  }}
                >
                  Outline Button
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold" style={{ color: config.textColor || '#0F172A' }}>Badges & Highlights</p>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${config.secondaryBtnColor}20`,
                    borderColor: `${config.secondaryBtnColor}50`,
                    color: config.textAccentColor || config.secondaryBtnColor
                  }}
                >
                  POS Active
                </span>
                <span
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold text-white"
                  style={{
                    backgroundColor: config.secondaryBtnColor,
                  }}
                >
                  ₹1,450.00
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: DYNAMIC TYPOGRAPHY & FONT SETTINGS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <Type className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                Typography & Font Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select font family and base font scale for clean readability across the app</p>
            </div>
          </div>

          {/* Segmented Control for Font Size */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 font-medium">Font Size:</span>
            {(['SMALL', 'MEDIUM', 'LARGE'] as FontSizeOption[]).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSelectFontSize(size)}
                className={cn(
                  "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150",
                  config.fontSize === size
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Select Font Family</label>
            <div className="space-y-2">
              {FONT_PRESETS.map(font => {
                const isSelected = config.fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleFontChange(font.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-900 dark:text-blue-100 font-semibold shadow-sm"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ fontFamily: font.fontFamily }}>
                        {font.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Rendered Font Preview Card */}
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Font Family Live Render</span>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">{selectedFontObj.name}</span>
              </div>

              <div className="space-y-3 pt-2" style={{ fontFamily: selectedFontObj.fontFamily, color: config.textColor || '#0F172A' }}>
                <h3 className="text-xl font-bold leading-tight" style={{ color: config.textAccentColor || config.secondaryBtnColor }}>
                  Elevate Your Business Operations
                </h3>
                <p className="text-sm leading-relaxed opacity-90">
                  Handcrafted billing POS, real-time inventory management, and multi-business reporting system built for maximum efficiency and elegance.
                </p>
                <p className="text-xs opacity-75 font-mono">
                  1234567890 • ABCDEFGHIJKLMNOPQRSTUVWXYZ • ₹450.00
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Category: <strong className="text-gray-900 dark:text-white">{selectedFontObj.category}</strong></span>
              <span>Active Scale: <strong className="text-blue-600 dark:text-blue-400">{config.fontSize}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: INVOICE & THERMAL RECEIPT THEME */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                Invoice & Thermal Receipt Theme
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select visual theme and layout terms for printed receipts & A4 bills</p>
            </div>
          </div>
        </div>

        {/* Soft warning note for invalid combination */}
        {config.fontSize === 'LARGE' && config.invoiceTheme === 'COMPACT_DARK' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300 animate-in fade-in">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Large font size is not recommended with Compact POS theme as small thermal receipt layout may overflow.</span>
          </div>
        )}

        {/* Invoice Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(INVOICE_THEME_DETAILS).map(([themeId, themeMeta]) => {
            const isSelected = config.invoiceTheme === themeId;
            return (
              <div
                key={themeId}
                onClick={() => handleSelectInvoiceTheme(themeId as InvoiceThemeId)}
                className={cn(
                  "p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between space-y-3 relative border min-h-[130px]",
                  isSelected
                    ? "border-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{themeMeta.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{themeMeta.description}</p>
                </div>

                {/* Instant Live Sample Header Preview */}
                <div
                  className={cn("p-1.5 rounded text-[10px] font-bold text-center border font-mono transition-all", themeMeta.badgeColor)}
                >
                  Sample Header
                </div>
              </div>
            );
          })}
        </div>

        {/* Receipt Terms & Header Customization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Terms & Conditions Note</label>
            <textarea
              rows={2}
              value={config.termsText}
              onChange={e => setConfig({ ...config, termsText: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Footer Thank You Message</label>
            <textarea
              rows={2}
              value={config.thankYouNote}
              onChange={e => setConfig({ ...config, thankYouNote: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 md:col-span-2 text-sm text-gray-700 dark:text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showLogoOnInvoice}
                onChange={e => setConfig({ ...config, showLogoOnInvoice: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Display Logo on Invoices & Receipts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showQrCodeOnInvoice}
                onChange={e => setConfig({ ...config, showQrCodeOnInvoice: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Print Dynamic UPI Payment QR Code</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save & Apply Theme System</span>
        </button>
      </div>

    </form>
  );
}
