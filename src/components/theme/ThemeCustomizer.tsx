import React, { useState, useEffect } from 'react';
import { 
  Palette, Type, Image, Sparkles, Check, Receipt, QrCode, 
  Sliders, RefreshCw, Save, Eye, Layers, RotateCcw,
  Sun, Moon, CheckCircle2, ChevronRight, Wand2
} from 'lucide-react';
import { ThemeEngine, FONT_PRESETS, INVOICE_THEME_DETAILS } from '../../lib/theme/themeEngine';
import { ThemeConfig, InvoiceThemeId, FontSizeOption } from '../../types/theme';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

// Quick baseline tone suggestions for fast admin custom picking
const BG_SWATCHES = [
  { name: 'Slate Light', hex: '#F8FAFC' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Warm Ivory', hex: '#F8F9FA' },
  { name: 'Mint Tint', hex: '#F0FDF4' },
  { name: 'Soft Lavender', hex: '#FAF5FF' },
  { name: 'Deep Obsidian', hex: '#0A0A0B' },
  { name: 'Midnight Navy', hex: '#0B132B' },
  { name: 'Forest Dark', hex: '#051C14' },
  { name: 'Regal Violet', hex: '#100926' },
];

const BUTTON_SWATCHES = [
  { name: 'Sapphire Blue', hex: '#2563EB' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Royal Gold', hex: '#C5A059' },
  { name: 'Imperial Emerald', hex: '#059669' },
  { name: 'Amethyst Purple', hex: '#7C3AED' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Sunset Orange', hex: '#F97316' },
  { name: 'Teal Cyan', hex: '#0D9488' },
  { name: 'Rose Pink', hex: '#DB2777' },
];

const TEXT_SWATCHES = [
  { name: 'Slate Black', hex: '#0F172A' },
  { name: 'Charcoal', hex: '#1E293B' },
  { name: 'Pure Black', hex: '#000000' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Ivory Cream', hex: '#F3E5AB' },
  { name: 'Cool Slate', hex: '#E2E8F0' },
];

const SURFACE_SWATCHES = [
  { name: 'Card White', hex: '#FFFFFF' },
  { name: 'Card Light', hex: '#F8FAFC' },
  { name: 'Card Slate', hex: '#F1F5F9' },
  { name: 'Dark Surface', hex: '#131315' },
  { name: 'Navy Surface', hex: '#1C2541' },
];

export default function ThemeCustomizer() {
  const { activeTemplate, businessType, updateBusinessProfile } = useAuth();
  const [config, setConfig] = useState<ThemeConfig>(() => ThemeEngine.getThemeConfig(activeTemplate));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customFontInput, setCustomFontInput] = useState('');

  useEffect(() => {
    const loaded = ThemeEngine.getThemeConfig(activeTemplate);
    setConfig(loaded);
    if (!FONT_PRESETS.some(f => f.id.toLowerCase() === (loaded.fontFamily || '').toLowerCase())) {
      setCustomFontInput(loaded.fontFamily || '');
    }
  }, [activeTemplate]);

  const updateConfig = (newPartial: Partial<ThemeConfig>) => {
    const updated: ThemeConfig = { ...config, ...newPartial, colorPreset: 'CUSTOM' };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleCustomPrimaryBg = (colorHex: string) => {
    updateConfig({ primaryBgColor: colorHex });
  };

  const handleCustomSecondaryBtn = (colorHex: string) => {
    updateConfig({ secondaryBtnColor: colorHex });
  };

  const handleCustomTextColor = (colorHex: string) => {
    updateConfig({ textColor: colorHex });
  };

  const handleCustomTextAccentColor = (colorHex: string) => {
    updateConfig({ textAccentColor: colorHex });
  };

  const handleCustomCardBg = (colorHex: string) => {
    updateConfig({ cardBgColor: colorHex });
  };

  const handleSelectFont = (fontId: string) => {
    updateConfig({ fontFamily: fontId });
  };

  const handleApplyCustomFont = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customFontInput.trim();
    if (trimmed) {
      ThemeEngine.loadGoogleFont(trimmed);
      updateConfig({ fontFamily: trimmed });
    }
  };

  const handleSelectFontSize = (size: FontSizeOption) => {
    updateConfig({ fontSize: size });
  };

  const handleSelectFontWeight = (weight: string) => {
    updateConfig({ fontWeight: weight });
  };

  const handleResetToDefault = () => {
    const updated: ThemeConfig = {
      ...config,
      colorPreset: 'CUSTOM',
      primaryBgColor: '#F8FAFC',
      secondaryBtnColor: '#2563EB',
      textColor: '#0F172A',
      textAccentColor: '#2563EB',
      cardBgColor: '#FFFFFF',
      fontFamily: 'Outfit',
      fontWeight: '400',
      fontSize: 'MEDIUM',
    };
    setConfig(updated);
    setCustomFontInput('');
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleApplyDarkModeBase = () => {
    const updated: ThemeConfig = {
      ...config,
      primaryBgColor: '#0A0A0B',
      secondaryBtnColor: '#C5A059',
      textColor: '#F3E5AB',
      textAccentColor: '#C5A059',
      cardBgColor: '#131315',
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleApplyLightModeBase = () => {
    const updated: ThemeConfig = {
      ...config,
      primaryBgColor: '#F8FAFC',
      secondaryBtnColor: '#2563EB',
      textColor: '#0F172A',
      textAccentColor: '#2563EB',
      cardBgColor: '#FFFFFF',
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

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

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-sm text-emerald-800 animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Custom theme and font settings saved and applied successfully across all modules!</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSaveSuccess(false)} 
            className="text-emerald-600 hover:text-emerald-900 font-bold px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: BUSINESS IDENTITY & BRANDING */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Image className="w-5 h-5 text-[#2563EB]" />
              Business Identity & Logo
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Customize store title, tagline, and corporate logo image</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-[#2563EB] font-mono font-bold">
            {businessType || 'Universal'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Brand Title / Store Name</label>
            <input
              type="text"
              value={config.brandTitle}
              onChange={e => setConfig({ ...config, brandTitle: e.target.value })}
              placeholder="e.g. Apex Multi-Business Billing"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Brand Tagline</label>
            <input
              type="text"
              value={config.brandTagline}
              onChange={e => setConfig({ ...config, brandTagline: e.target.value })}
              placeholder="e.g. Enterprise Cloud Point of Sale & Billing System"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700">Custom Logo Image URL</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={config.logoUrl || ''}
                onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                placeholder="https://your-domain.com/logo.png"
                className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
              />
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-gray-200 flex items-center justify-center text-[#2563EB] font-serif font-bold text-lg flex-shrink-0 shadow-xs overflow-hidden">
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

      {/* SECTION 2: CUSTOM COLOR PALETTE STUDIO */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#2563EB]" />
              Custom Color Palette Studio
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select precise custom colors for background, buttons, body typography, and accent highlights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Quick Base Fillers */}
            <button
              type="button"
              onClick={handleApplyLightModeBase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-gray-200 text-xs font-semibold text-gray-700 transition-all cursor-pointer"
              title="Quickly fill light theme colors"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Base</span>
            </button>
            <button
              type="button"
              onClick={handleApplyDarkModeBase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-gray-200 text-xs font-semibold text-gray-700 transition-all cursor-pointer"
              title="Quickly fill dark luxury colors"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Dark Base</span>
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-gray-200 text-xs font-semibold text-gray-700 transition-all cursor-pointer"
              title="Reset to default system colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Custom Color Pickers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Primary Background Color */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: config.primaryBgColor }} />
                Primary Background
              </label>
              <span className="text-[11px] font-mono text-gray-500 font-bold">{config.primaryBgColor}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl border border-gray-300 overflow-hidden shadow-xs flex-shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={config.primaryBgColor || '#F8FAFC'}
                  onChange={e => handleCustomPrimaryBg(e.target.value)}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={config.primaryBgColor || '#F8FAFC'}
                onChange={e => handleCustomPrimaryBg(e.target.value)}
                placeholder="#F8FAFC"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Quick Palette Swatches */}
            <div className="pt-1">
              <span className="text-[10px] font-semibold text-gray-400 block mb-1.5 uppercase">Quick Tone Swatches</span>
              <div className="flex flex-wrap gap-1.5">
                {BG_SWATCHES.map(s => (
                  <button
                    key={s.hex}
                    type="button"
                    onClick={() => handleCustomPrimaryBg(s.hex)}
                    title={`${s.name} (${s.hex})`}
                    className={cn(
                      "w-5 h-5 rounded-lg border transition-all cursor-pointer",
                      config.primaryBgColor.toUpperCase() === s.hex.toUpperCase()
                        ? "border-2 border-blue-600 ring-2 ring-blue-300 scale-110"
                        : "border-gray-300 hover:scale-105"
                    )}
                    style={{ backgroundColor: s.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. Secondary Button & Interactive Color */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: config.secondaryBtnColor }} />
                Secondary (Buttons & CTAs)
              </label>
              <span className="text-[11px] font-mono text-gray-500 font-bold">{config.secondaryBtnColor}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl border border-gray-300 overflow-hidden shadow-xs flex-shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={config.secondaryBtnColor || '#2563EB'}
                  onChange={e => handleCustomSecondaryBtn(e.target.value)}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={config.secondaryBtnColor || '#2563EB'}
                onChange={e => handleCustomSecondaryBtn(e.target.value)}
                placeholder="#2563EB"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Quick Palette Swatches */}
            <div className="pt-1">
              <span className="text-[10px] font-semibold text-gray-400 block mb-1.5 uppercase">Quick Accent Swatches</span>
              <div className="flex flex-wrap gap-1.5">
                {BUTTON_SWATCHES.map(s => (
                  <button
                    key={s.hex}
                    type="button"
                    onClick={() => handleCustomSecondaryBtn(s.hex)}
                    title={`${s.name} (${s.hex})`}
                    className={cn(
                      "w-5 h-5 rounded-lg border transition-all cursor-pointer",
                      config.secondaryBtnColor.toUpperCase() === s.hex.toUpperCase()
                        ? "border-2 border-blue-600 ring-2 ring-blue-300 scale-110"
                        : "border-gray-300 hover:scale-105"
                    )}
                    style={{ backgroundColor: s.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. Primary Body Text / Font Color */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: config.textColor }} />
                Font / Body Text Color
              </label>
              <span className="text-[11px] font-mono text-gray-500 font-bold">{config.textColor}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl border border-gray-300 overflow-hidden shadow-xs flex-shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={config.textColor || '#0F172A'}
                  onChange={e => handleCustomTextColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={config.textColor || '#0F172A'}
                onChange={e => handleCustomTextColor(e.target.value)}
                placeholder="#0F172A"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Quick Palette Swatches */}
            <div className="pt-1">
              <span className="text-[10px] font-semibold text-gray-400 block mb-1.5 uppercase">Quick Text Swatches</span>
              <div className="flex flex-wrap gap-1.5">
                {TEXT_SWATCHES.map(s => (
                  <button
                    key={s.hex}
                    type="button"
                    onClick={() => handleCustomTextColor(s.hex)}
                    title={`${s.name} (${s.hex})`}
                    className={cn(
                      "w-5 h-5 rounded-lg border transition-all cursor-pointer",
                      config.textColor.toUpperCase() === s.hex.toUpperCase()
                        ? "border-2 border-blue-600 ring-2 ring-blue-300 scale-110"
                        : "border-gray-300 hover:scale-105"
                    )}
                    style={{ backgroundColor: s.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4. Font Accent & Highlight Color */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: config.textAccentColor }} />
                Font Accent & Highlights
              </label>
              <span className="text-[11px] font-mono text-gray-500 font-bold">{config.textAccentColor}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl border border-gray-300 overflow-hidden shadow-xs flex-shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={config.textAccentColor || config.secondaryBtnColor || '#2563EB'}
                  onChange={e => handleCustomTextAccentColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={config.textAccentColor || config.secondaryBtnColor || '#2563EB'}
                onChange={e => handleCustomTextAccentColor(e.target.value)}
                placeholder="#2563EB"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Match Button Accent */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleCustomTextAccentColor(config.secondaryBtnColor)}
                className="w-full py-1 px-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-[10px] font-bold text-gray-700 flex items-center justify-center gap-1 transition-all"
              >
                <Wand2 className="w-3 h-3 text-[#2563EB]" />
                <span>Sync with Button Color</span>
              </button>
            </div>
          </div>

        </div>

        {/* Optional Card & Container Surface Background Color */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              Card / Panel Surface Background Color
            </label>
            <p className="text-[11px] text-gray-500">Customize the background tone for inner panels and widgets</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg border border-gray-300 overflow-hidden shadow-xs flex-shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={config.cardBgColor || '#FFFFFF'}
                  onChange={e => handleCustomCardBg(e.target.value)}
                  className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={config.cardBgColor || '#FFFFFF'}
                onChange={e => handleCustomCardBg(e.target.value)}
                placeholder="#FFFFFF"
                className="w-24 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-gray-900 outline-none"
              />
            </div>

            <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
              {SURFACE_SWATCHES.map(s => (
                <button
                  key={s.hex}
                  type="button"
                  onClick={() => handleCustomCardBg(s.hex)}
                  title={s.name}
                  className={cn(
                    "w-5 h-5 rounded-md border transition-all cursor-pointer",
                    (config.cardBgColor || '#FFFFFF').toUpperCase() === s.hex.toUpperCase()
                      ? "border-2 border-blue-600 scale-110"
                      : "border-gray-300 hover:scale-105"
                  )}
                  style={{ backgroundColor: s.hex }}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: CUSTOM TYPOGRAPHY & FONT STUDIO */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Type className="w-5 h-5 text-[#2563EB]" />
              Custom Typography & Font Studio
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose from popular typography or enter ANY custom Google font family for your system.
            </p>
          </div>

          {/* Font Controls: Size & Weight */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Font Size Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-gray-200 text-xs">
              <span className="text-[10px] font-bold text-gray-500 px-2 uppercase">Size:</span>
              {(['SMALL', 'MEDIUM', 'LARGE'] as FontSizeOption[]).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSelectFontSize(size)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer",
                    config.fontSize === size
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Font Weight Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-gray-200 text-xs">
              <span className="text-[10px] font-bold text-gray-500 px-2 uppercase">Weight:</span>
              {[
                { label: 'Regular', val: '400' },
                { label: 'Medium', val: '500' },
                { label: 'Semi-Bold', val: '600' },
                { label: 'Bold', val: '700' }
              ].map(w => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => handleSelectFontWeight(w.val)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer",
                    (config.fontWeight || '400') === w.val
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Font Name Input (Any Google Font / System Font) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              Pick or Type Any Custom Google Font / Web Font
            </label>
            <span className="text-[11px] text-[#2563EB] font-semibold">Loads automatically from Google Fonts</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customFontInput}
              onChange={e => setCustomFontInput(e.target.value)}
              placeholder="e.g. Manrope, Space Grotesk, DM Sans, Lora, Caveat, Orbitron..."
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2563EB] font-medium"
            />
            <button
              type="button"
              onClick={() => handleApplyCustomFont()}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Apply Custom Font</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            Current Active Font: <strong className="text-gray-800 font-mono">{config.fontFamily}</strong>
          </p>
        </div>

        {/* Curated Font Preset Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 block">Or Select from Popular Curated Typefaces:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {FONT_PRESETS.map(font => {
              const isSelected = config.fontFamily.toLowerCase() === font.id.toLowerCase();
              return (
                <div
                  key={font.id}
                  onClick={() => {
                    handleSelectFont(font.id);
                    setCustomFontInput('');
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl transition-all cursor-pointer space-y-1.5 border bg-white relative group",
                    isSelected
                      ? "border-2 border-[#2563EB] shadow-md ring-2 ring-blue-100 bg-blue-50/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-slate-50/70"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm font-bold text-gray-900"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      {font.name.split(' (')[0]}
                    </span>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-gray-500">{font.category}</span>
                    )}
                  </div>
                  
                  <p 
                    className="text-xs text-gray-600 truncate"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    The quick brown fox jumps
                  </p>
                  
                  <span className="text-[10px] text-gray-400 font-mono block pt-0.5">
                    {font.fontFamily}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION 4: LIVE INTERACTIVE UI THEME & TYPOGRAPHY PREVIEW */}
      <div 
        className="rounded-2xl p-6 shadow-xl transition-all border space-y-4"
        style={{ 
          backgroundColor: config.primaryBgColor || '#F8FAFC',
          borderColor: 'rgba(150, 150, 150, 0.25)',
          fontFamily: config.fontFamily ? `'${config.fontFamily}', sans-serif` : 'inherit',
          color: config.textColor || '#0F172A'
        }}
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(150, 150, 150, 0.2)' }}>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" style={{ color: config.textAccentColor || config.secondaryBtnColor }} />
            <h4 className="font-bold text-base tracking-tight" style={{ color: config.textColor || '#0F172A' }}>
              Live Interactive Theme & Font Preview
            </h4>
          </div>
          <span 
            className="text-xs px-3 py-1 rounded-full font-mono font-bold border shadow-xs"
            style={{ 
              backgroundColor: `${config.secondaryBtnColor}18`,
              borderColor: `${config.secondaryBtnColor}40`,
              color: config.textAccentColor || config.secondaryBtnColor
            }}
          >
            Font: {config.fontFamily} · {config.fontSize}
          </span>
        </div>

        {/* Live UI Mockup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          
          {/* Card 1: Typography Sample */}
          <div 
            className="p-4 rounded-xl border space-y-2 shadow-xs"
            style={{ 
              backgroundColor: config.cardBgColor || '#FFFFFF',
              borderColor: 'rgba(150, 150, 150, 0.2)'
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: config.textAccentColor || config.secondaryBtnColor }}>
              {config.brandTitle || 'Store Heading Sample'}
            </p>
            <p className="text-sm font-semibold" style={{ color: config.textColor || '#0F172A' }}>
              Clean readability across all customer billing receipts & screens.
            </p>
            <p className="text-xs opacity-75 leading-relaxed" style={{ color: config.textColor || '#0F172A' }}>
              {config.brandTagline || 'Enterprise Multi-Business POS & Billing System'}
            </p>
          </div>

          {/* Card 2: Action Buttons & CTAs */}
          <div 
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{ 
              backgroundColor: config.cardBgColor || '#FFFFFF',
              borderColor: 'rgba(150, 150, 150, 0.2)'
            }}
          >
            <p className="text-xs font-bold" style={{ color: config.textColor || '#0F172A' }}>Action Buttons Preview</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold uppercase rounded-xl shadow-md transition-all cursor-pointer"
                style={{
                  backgroundColor: config.secondaryBtnColor,
                  color: '#FFFFFF'
                }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer"
                style={{
                  borderColor: config.secondaryBtnColor,
                  color: config.secondaryBtnColor,
                  backgroundColor: 'transparent'
                }}
              >
                Outline Button
              </button>
            </div>
          </div>

          {/* Card 3: Badges & POS Live Totals */}
          <div 
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{ 
              backgroundColor: config.cardBgColor || '#FFFFFF',
              borderColor: 'rgba(150, 150, 150, 0.2)'
            }}
          >
            <p className="text-xs font-bold" style={{ color: config.textColor || '#0F172A' }}>POS Badges & Highlights</p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `${config.secondaryBtnColor}20`,
                  borderColor: `${config.secondaryBtnColor}50`,
                  color: config.textAccentColor || config.secondaryBtnColor
                }}
              >
                Active Session
              </span>
              <span
                className="px-3.5 py-1 rounded-xl text-xs font-mono font-bold shadow-xs text-white"
                style={{
                  backgroundColor: config.secondaryBtnColor,
                }}
              >
                ₹2,840.00
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 5: INVOICE & THERMAL RECEIPT THEME */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#2563EB]" />
            Invoice & Thermal Receipt Theme
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Select visual theme and layout terms for printed receipts & A4 bills</p>
        </div>

        {/* Invoice Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(INVOICE_THEME_DETAILS).map(([themeId, themeMeta]) => {
            const isSelected = config.invoiceTheme === themeId;
            return (
              <div
                key={themeId}
                onClick={() => updateConfig({ invoiceTheme: themeId as InvoiceThemeId })}
                className={cn(
                  "p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-2 relative border bg-white",
                  isSelected
                    ? "border-2 border-[#2563EB] shadow-md ring-2 ring-blue-100 bg-blue-50/20"
                    : "border-gray-200 hover:border-gray-300 hover:bg-slate-50/70"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{themeMeta.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{themeMeta.description}</p>
                </div>
                <div
                  className={cn("p-1.5 rounded text-[9px] font-bold text-center border font-mono", themeMeta.badgeColor)}
                >
                  Header Sample
                </div>
              </div>
            );
          })}
        </div>

        {/* Receipt Terms & Header Customization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Invoice Terms & Conditions Note</label>
            <textarea
              rows={2}
              value={config.termsText}
              onChange={e => setConfig({ ...config, termsText: e.target.value })}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Receipt Footer Thank You Message</label>
            <textarea
              rows={2}
              value={config.thankYouNote}
              onChange={e => setConfig({ ...config, thankYouNote: e.target.value })}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1 md:col-span-2 text-xs text-gray-700 font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showLogoOnInvoice}
                onChange={e => updateConfig({ showLogoOnInvoice: e.target.checked })}
                className="rounded border-gray-300 text-[#2563EB] focus:ring-0 w-4 h-4"
              />
              <span>Display Logo on Invoices & Receipts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showQrCodeOnInvoice}
                onChange={e => updateConfig({ showQrCodeOnInvoice: e.target.checked })}
                className="rounded border-gray-300 text-[#2563EB] focus:ring-0 w-4 h-4"
              />
              <span>Print Dynamic UPI Payment QR Code</span>
            </label>
          </div>
        </div>
      </div>

      {/* SAVE & APPLY CTA */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-7 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save & Apply Custom Theme
        </button>
      </div>

    </form>
  );
}
