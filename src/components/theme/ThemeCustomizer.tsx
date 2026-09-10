import React, { useState, useEffect } from 'react';
import { 
  Palette, Type, Image, Sparkles, Check, Receipt, QrCode, 
  ShieldCheck, Sliders, RefreshCw, Save, Eye, Layers, RotateCcw
} from 'lucide-react';
import { ThemeEngine, COLOR_PRESETS, FONT_PRESETS, INVOICE_THEME_DETAILS } from '../../lib/theme/themeEngine';
import { ThemeConfig, InvoiceThemeId, IconStyle, FontSizeOption } from '../../types/theme';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function ThemeCustomizer() {
  const { activeTemplate, businessType, updateBusinessProfile } = useAuth();
  const [config, setConfig] = useState<ThemeConfig>(() => ThemeEngine.getThemeConfig(activeTemplate));
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loaded = ThemeEngine.getThemeConfig(activeTemplate);
    setConfig(loaded);
  }, [activeTemplate]);

  const handleSelectPreset = (presetId: string) => {
    const preset = COLOR_PRESETS.find(p => p.id === presetId) || COLOR_PRESETS[0];
    const updated: ThemeConfig = { 
      ...config, 
      colorPreset: presetId,
      primaryBgColor: preset.primaryBg,
      secondaryBtnColor: preset.secondaryBtn,
      textColor: preset.textColor,
      textAccentColor: preset.textAccentColor,
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleCustomPrimaryBg = (colorHex: string) => {
    const updated: ThemeConfig = {
      ...config,
      primaryBgColor: colorHex,
      colorPreset: 'CUSTOM'
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleCustomSecondaryBtn = (colorHex: string) => {
    const updated: ThemeConfig = {
      ...config,
      secondaryBtnColor: colorHex,
      colorPreset: 'CUSTOM'
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleCustomTextColor = (colorHex: string) => {
    const updated: ThemeConfig = {
      ...config,
      textColor: colorHex,
      colorPreset: 'CUSTOM'
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleCustomTextAccentColor = (colorHex: string) => {
    const updated: ThemeConfig = {
      ...config,
      textAccentColor: colorHex,
      colorPreset: 'CUSTOM'
    };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleResetToDefault = () => {
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


  const handleSelectFont = (fontId: string) => {
    const updated = { ...config, fontFamily: fontId };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const handleSelectFontSize = (size: FontSizeOption) => {
    const updated = { ...config, fontSize: size };
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


  const activePreset = COLOR_PRESETS.find(c => c.id === config.colorPreset);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-400 animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Theme & Branding settings saved and applied successfully across all modules!</span>
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>
      )}

      {/* Section 1: Business Identity & Logo */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Image className="w-5 h-5 text-theme-secondary" />
              Business Identity & Logo
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Customize store title, tagline, and corporate logo image</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-[10px] text-theme-secondary font-mono">
            {businessType}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Brand Title / Store Name</label>
            <input
              type="text"
              value={config.brandTitle}
              onChange={e => setConfig({ ...config, brandTitle: e.target.value })}
              placeholder="e.g. Apex Luxury Diner"
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-gray-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Brand Tagline</label>
            <input
              type="text"
              value={config.brandTagline}
              onChange={e => setConfig({ ...config, brandTagline: e.target.value })}
              placeholder="e.g. Premium Food & Beverages Experience"
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-gray-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-300">Custom Logo Image URL</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={config.logoUrl || ''}
                onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                placeholder="https://your-domain.com/logo.png"
                className="flex-1 bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-gray-100"
              />
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-gray-200 flex items-center justify-center text-theme-secondary font-serif font-bold text-base flex-shrink-0">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" onError={e => (e.currentTarget.style.display = 'none')} />
                ) : (
                  config.brandTitle.charAt(0) || 'A'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Color Palette (Primary Background & Secondary Button System) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Palette className="w-5 h-5 text-theme-secondary" />
              Theme Color Palette System
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Set <span className="text-white font-semibold">Primary Color for Backgrounds</span> and <span className="text-white font-semibold">Secondary Color for Buttons</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-300 hover:text-gray-900 hover:border-gray-500 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-gray-200">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: config.primaryBgColor }} title="Primary Background" />
                <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: config.secondaryBtnColor }} title="Secondary Button" />
              </div>
              <span className="text-xs text-white font-mono font-bold">
                {activePreset ? activePreset.name : 'Custom Pair'}
              </span>
            </div>
          </div>
        </div>

        {/* Curated Color Palettes - Row 1: Dark Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Row 1: Dark Luxury Color Palettes
            </label>
            <span className="text-[10px] text-gray-400">Dark Obsidian & Deep Background Themes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {COLOR_PRESETS.slice(0, 4).map(preset => {
              const isSelected = config.colorPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={cn(
                    "p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group relative border",
                    isSelected
                      ? "border-2 shadow-xl scale-[1.02]"
                      : "border-white/10 hover:border-white/30 opacity-90 hover:opacity-100"
                  )}
                  style={isSelected ? {
                    backgroundColor: `${preset.secondaryBtn}22`,
                    borderColor: preset.secondaryBtn,
                    boxShadow: `0 4px 20px ${preset.secondaryBtn}30`
                  } : {
                    backgroundColor: 'rgba(10, 10, 11, 0.6)',
                    borderColor: 'rgba(150, 150, 150, 0.2)'
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-xs truncate transition-colors" style={{ color: isSelected ? preset.secondaryBtn : '#FFFFFF' }}>
                      {preset.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 font-mono">Bg: {preset.primaryBg}</span>
                      <span className="text-[10px] text-gray-400 font-mono">Btn: {preset.secondaryBtn}</span>
                    </div>
                  </div>

                  {/* Dual Color Swatch Preview */}
                  <div className="flex items-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-l-xl border-y border-l border-white/10 flex items-center justify-center text-white text-[10px] font-mono shadow-sm" style={{ backgroundColor: preset.primaryBg }}>
                      P
                    </div>
                    <div className="w-7 h-7 rounded-r-xl border-y border-r border-white/10 flex items-center justify-center text-black text-[10px] font-mono shadow-sm font-bold" style={{ backgroundColor: preset.secondaryBtn }}>
                      S
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curated Color Palettes - Row 2: Light Mode (White Backgrounds) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Row 2: Clean Light Mode Palettes (White / Light Backgrounds)
            </label>
            <span className="text-[10px] text-emerald-400 font-semibold">Clean White & Light Background Themes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {COLOR_PRESETS.slice(4).map(preset => {
              const isSelected = config.colorPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={cn(
                    "p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group relative border",
                    isSelected
                      ? "border-2 shadow-xl scale-[1.02]"
                      : "border-white/10 hover:border-white/30 opacity-90 hover:opacity-100"
                  )}
                  style={isSelected ? {
                    backgroundColor: `${preset.secondaryBtn}22`,
                    borderColor: preset.secondaryBtn,
                    boxShadow: `0 4px 20px ${preset.secondaryBtn}30`
                  } : {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(150, 150, 150, 0.25)'
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate transition-colors" style={{ color: isSelected ? preset.secondaryBtn : '#1A1A1C' }}>
                      {preset.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 font-mono">Bg: {preset.primaryBg}</span>
                      <span className="text-[10px] text-gray-500 font-mono">Btn: {preset.secondaryBtn}</span>
                    </div>
                  </div>

                  {/* Dual Color Swatch Preview */}
                  <div className="flex items-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-l-xl border-y border-l border-black/15 flex items-center justify-center text-black text-[10px] font-mono shadow-sm font-bold" style={{ backgroundColor: preset.primaryBg }}>
                      P
                    </div>
                    <div className="w-7 h-7 rounded-r-xl border-y border-r border-black/15 flex items-center justify-center text-white text-[10px] font-mono shadow-sm font-bold" style={{ backgroundColor: preset.secondaryBtn }}>
                      S
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Custom Hex Color Pickers */}
        <div className="p-4 bg-[#F8FAFC] border border-gray-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-theme-secondary" />
              Custom Color Pickers
            </label>
            <span className="text-[11px] text-gray-400">Pick any custom hex code for background & button colors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Primary Background Color Picker */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-gray-200">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Primary (Background)</span>
                <span className="text-[10px] text-gray-400 font-mono">{config.primaryBgColor}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.primaryBgColor || '#0A0A0B'}
                  onChange={e => handleCustomPrimaryBg(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                />
                <input
                  type="text"
                  value={config.primaryBgColor || '#0A0A0B'}
                  onChange={e => handleCustomPrimaryBg(e.target.value)}
                  placeholder="#0A0A0B"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 font-mono outline-none focus:border-gray-100"
                />
              </div>
            </div>

            {/* Secondary Button Color Picker */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-gray-200">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Secondary (Buttons)</span>
                <span className="text-[10px] text-gray-400 font-mono">{config.secondaryBtnColor}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.secondaryBtnColor || '#C5A059'}
                  onChange={e => handleCustomSecondaryBtn(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                />
                <input
                  type="text"
                  value={config.secondaryBtnColor || '#C5A059'}
                  onChange={e => handleCustomSecondaryBtn(e.target.value)}
                  placeholder="#C5A059"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 font-mono outline-none focus:border-gray-100"
                />
              </div>
            </div>

            {/* Primary Font / Text Color Picker */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-gray-200">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Font / Body Text Color</span>
                <span className="text-[10px] text-gray-400 font-mono">{config.textColor || '#FFFFFF'}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.textColor || '#FFFFFF'}
                  onChange={e => handleCustomTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                />
                <input
                  type="text"
                  value={config.textColor || '#FFFFFF'}
                  onChange={e => handleCustomTextColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 font-mono outline-none focus:border-gray-100"
                />
              </div>
            </div>

            {/* Accent Font / Highlight Color Picker */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-gray-200">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Font Accent Color</span>
                <span className="text-[10px] text-gray-400 font-mono">{config.textAccentColor || config.secondaryBtnColor || '#C5A059'}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.textAccentColor || config.secondaryBtnColor || '#C5A059'}
                  onChange={e => handleCustomTextAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                />
                <input
                  type="text"
                  value={config.textAccentColor || config.secondaryBtnColor || '#C5A059'}
                  onChange={e => handleCustomTextAccentColor(e.target.value)}
                  placeholder="#C5A059"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 font-mono outline-none focus:border-gray-100"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live UI Interactive Preview Box */}
        <div className="p-5 border border-white/10 rounded-2xl space-y-3 transition-colors shadow-2xl" style={{ backgroundColor: config.primaryBgColor, color: config.textColor || '#FFFFFF' }}>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold flex items-center gap-2" style={{ color: config.textColor || '#FFFFFF' }}>
              <Eye className="w-4 h-4" style={{ color: config.textAccentColor || config.secondaryBtnColor }} />
              Live Interactive UI Theme & Font Preview
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 font-mono" style={{ color: config.textAccentColor || config.secondaryBtnColor }}>
              Live Font & Palette
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Font Color & Accent Text Sample */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: config.textAccentColor || config.secondaryBtnColor }}>
                Font Accent Heading
              </p>
              <p className="text-xs font-semibold" style={{ color: config.textColor || '#FFFFFF' }}>
                Primary Body Text Sample: Clean readability across all screen resolutions.
              </p>
            </div>

            {/* Action Buttons Preview */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold" style={{ color: config.textColor || '#FFFFFF' }}>Action Buttons (Secondary Color)</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-bold uppercase rounded-xl shadow-md transition-all"
                  style={{
                    backgroundColor: config.secondaryBtnColor,
                    color: config.secondaryBtnColor ? (parseInt(config.secondaryBtnColor.replace('#',''), 16) > 0x888888 ? '#0A0A0B' : '#FFFFFF') : '#0A0A0B'
                  }}
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all"
                  style={{
                    borderColor: config.secondaryBtnColor,
                    color: config.secondaryBtnColor
                  }}
                >
                  Outline Button
                </button>
              </div>
            </div>

            {/* Badges & Highlights Preview */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold" style={{ color: config.textColor || '#FFFFFF' }}>Badges & Highlights</p>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: `${config.secondaryBtnColor}20`,
                    borderColor: `${config.secondaryBtnColor}50`,
                    color: config.textAccentColor || config.secondaryBtnColor
                  }}
                >
                  Billing POS Active
                </span>
                <span
                  className="px-3 py-1 rounded-xl text-xs font-mono font-bold"
                  style={{
                    backgroundColor: config.secondaryBtnColor,
                    color: '#0A0A0B'
                  }}
                >
                  ₹1,450.00
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Section 3: Typography / Font */}
      <div className="bg-white border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: config.textColor || '#FFFFFF' }}>
              <Type className="w-5 h-5 text-theme-secondary" />
              Typography & Font Family
            </h3>
            <p className="text-xs opacity-75 mt-0.5">Choose typeface and base font scale for clean readability</p>
          </div>

          <div className="flex items-center gap-1 border rounded-xl p-1 text-xs" style={{ backgroundColor: `${config.secondaryBtnColor}10`, borderColor: 'rgba(150, 150, 150, 0.2)' }}>
            {(['SMALL', 'MEDIUM', 'LARGE'] as FontSizeOption[]).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSelectFontSize(size)}
                className={cn(
                  "px-3 py-1 rounded-lg font-bold transition-all text-[11px]",
                  config.fontSize === size
                    ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FONT_PRESETS.map(font => {
            const isSelected = config.fontFamily === font.id;
            return (
              <div
                key={font.id}
                onClick={() => handleSelectFont(font.id)}
                className={cn(
                  "p-3.5 rounded-2xl transition-all cursor-pointer space-y-1.5 relative border",
                  isSelected
                    ? "border-2 shadow-xl scale-[1.02]"
                    : "border-white/10 hover:border-white/30"
                )}
                style={isSelected ? {
                  backgroundColor: `${config.secondaryBtnColor}22`,
                  borderColor: config.secondaryBtnColor,
                  boxShadow: `0 4px 20px ${config.secondaryBtnColor}25`
                } : {
                  backgroundColor: config.primaryBgColor && (config.primaryBgColor === '#F8F9FA' || config.primaryBgColor.startsWith('#F')) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 11, 0.5)',
                  borderColor: 'rgba(150, 150, 150, 0.2)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ fontFamily: font.fontFamily, color: isSelected ? config.textAccentColor || config.secondaryBtnColor : config.textColor || 'inherit' }}>{font.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center shadow-md flex-shrink-0">
                      <Check className="w-3 h-3 text-current" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] opacity-80" style={{ fontFamily: font.fontFamily, color: config.textColor || 'inherit' }}>
                  Quick brown fox jumps
                </p>
                <p className="text-[9px] font-mono pt-1 uppercase" style={{ color: isSelected ? config.textAccentColor || config.secondaryBtnColor : 'gray' }}>{font.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Invoice Theme & Receipt Styling */}
      <div className="bg-white border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-bold text-base flex items-center gap-2" style={{ color: config.textColor || '#FFFFFF' }}>
            <Receipt className="w-5 h-5 text-theme-secondary" />
            Invoice & Thermal Receipt Theme
          </h3>
          <p className="text-xs opacity-75 mt-0.5">Select visual theme and layout terms for printed receipts & A4 bills</p>
        </div>

        {/* Invoice Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(INVOICE_THEME_DETAILS).map(([themeId, themeMeta]) => {
            const isSelected = config.invoiceTheme === themeId;
            return (
              <div
                key={themeId}
                onClick={() => {
                  const updated = { ...config, invoiceTheme: themeId as InvoiceThemeId };
                  setConfig(updated);
                  ThemeEngine.applyTheme(updated);
                  window.dispatchEvent(new Event('theme_changed'));
                }}
                className={cn(
                  "p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-2 relative border",
                  isSelected
                    ? "border-2 shadow-xl scale-[1.02]"
                    : "border-white/10 hover:border-white/30"
                )}
                style={isSelected ? {
                  backgroundColor: `${config.secondaryBtnColor}22`,
                  borderColor: config.secondaryBtnColor,
                  boxShadow: `0 4px 20px ${config.secondaryBtnColor}25`
                } : {
                  backgroundColor: config.primaryBgColor && (config.primaryBgColor === '#F8F9FA' || config.primaryBgColor.startsWith('#F')) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 11, 0.5)',
                  borderColor: 'rgba(150, 150, 150, 0.2)'
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: isSelected ? config.textAccentColor || config.secondaryBtnColor : config.textColor || 'inherit' }}>{themeMeta.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center shadow-md flex-shrink-0">
                        <Check className="w-3 h-3 text-current" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] opacity-80 leading-relaxed" style={{ color: config.textColor || 'inherit' }}>{themeMeta.description}</p>
                </div>
                <div
                  className={cn("p-1.5 rounded text-[9px] font-bold text-center border font-mono", themeMeta.badgeColor)}
                  style={themeId === 'COMPACT_DARK' ? { backgroundColor: '#1A1A1C', color: '#FFFFFF', borderColor: '#3D3D42' } : {}}
                >
                  Sample Header
                </div>

              </div>
            );
          })}
        </div>


        {/* Receipt Terms & Header Customization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Invoice Terms & Conditions Note</label>
            <textarea
              rows={2}
              value={config.termsText}
              onChange={e => setConfig({ ...config, termsText: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-gray-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Receipt Footer Thank You Message</label>
            <textarea
              rows={2}
              value={config.thankYouNote}
              onChange={e => setConfig({ ...config, thankYouNote: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-gray-100"
            />
          </div>

          <div className="flex items-center gap-6 pt-1 md:col-span-2 text-xs text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showLogoOnInvoice}
                onChange={e => setConfig({ ...config, showLogoOnInvoice: e.target.checked })}
                className="rounded bg-[#F8FAFC] border-gray-200 text-theme-secondary focus:ring-0"
              />
              <span>Display Logo on Invoices & Receipts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showQrCodeOnInvoice}
                onChange={e => setConfig({ ...config, showQrCodeOnInvoice: e.target.checked })}
                className="rounded bg-[#F8FAFC] border-gray-200 text-theme-secondary focus:ring-0"
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
          className="px-6 py-3 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save & Apply Theme System
        </button>
      </div>

    </form>
  );
}

