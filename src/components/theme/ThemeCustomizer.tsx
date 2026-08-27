import React, { useState, useEffect } from 'react';
import { 
  Palette, Type, Image, Sparkles, Check, Receipt, QrCode, 
  ShieldCheck, Sliders, RefreshCw, Save, Eye, Layers
} from 'lucide-react';
import { ThemeEngine, COLOR_PRESETS, FONT_PRESETS, INVOICE_THEME_DETAILS } from '../../lib/theme/themeEngine';
import { ThemeConfig, InvoiceThemeId, IconStyle, FontSizeOption } from '../../types/theme';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function ThemeCustomizer() {
  const { activeTemplate, businessType } = useAuth();
  const [config, setConfig] = useState<ThemeConfig>(() => ThemeEngine.getThemeConfig(activeTemplate));
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loaded = ThemeEngine.getThemeConfig(activeTemplate);
    setConfig(loaded);
  }, [activeTemplate]);

  const handleSelectColor = (presetId: string) => {
    const updated = { ...config, colorPreset: presetId };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
  };

  const handleSelectFont = (fontId: string) => {
    const updated = { ...config, fontFamily: fontId };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
  };

  const handleSelectFontSize = (size: FontSizeOption) => {
    const updated = { ...config, fontSize: size };
    setConfig(updated);
    ThemeEngine.applyTheme(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    ThemeEngine.saveThemeConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const currentColorPreset = COLOR_PRESETS.find(c => c.id === config.colorPreset) || COLOR_PRESETS[0];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-400 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Theme & Branding settings saved and applied successfully across all modules!</span>
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Section 1: Business Identity & Logo */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Image className="w-5 h-5 text-[#C5A059]" />
              Business Identity & Logo
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Customize brand name, tagline, and corporate logo</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#1A1A1C] border border-[#2D2D30] text-[10px] text-[#C5A059] font-mono">
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
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Brand Tagline</label>
            <input
              type="text"
              value={config.brandTagline}
              onChange={e => setConfig({ ...config, brandTagline: e.target.value })}
              placeholder="e.g. Premium Food & Beverages Experience"
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#C5A059]"
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
                className="flex-1 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#C5A059]"
              />
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0B] border border-[#2D2D30] flex items-center justify-center text-[#C5A059] font-serif font-bold text-base flex-shrink-0">
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

      {/* Section 2: Color Palette */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#C5A059]" />
              Color Palette & UI Accent
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Select a curated luxury color scheme for buttons, badges, charts, and highlights</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: currentColorPreset.primary }} />
            <span className="text-xs text-white font-mono font-bold">{currentColorPreset.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {COLOR_PRESETS.map(preset => {
            const isSelected = config.colorPreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectColor(preset.id)}
                className={cn(
                  "p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3",
                  isSelected
                    ? "bg-[#1A1A1D] border-[#C5A059] shadow-lg"
                    : "bg-[#0A0A0B] border-[#1F1F21] hover:border-[#2D2D30]"
                )}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-[#0A0A0B]"
                  style={{ backgroundColor: preset.primary }}
                >
                  {isSelected && <Check className="w-4 h-4 font-bold" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate">{preset.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{preset.primary}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Typography / Font */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Type className="w-5 h-5 text-[#C5A059]" />
              Typography & Font Family
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Choose typeface and base font scale for clean readability</p>
          </div>

          <div className="flex items-center gap-1 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl p-1 text-xs">
            {(['SMALL', 'MEDIUM', 'LARGE'] as FontSizeOption[]).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSelectFontSize(size)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-bold transition-all text-[11px]",
                  config.fontSize === size
                    ? "bg-[#C5A059] text-[#0A0A0B]"
                    : "text-gray-400 hover:text-white"
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
                  "p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                  isSelected
                    ? "bg-[#1A1A1D] border-[#C5A059] shadow-lg"
                    : "bg-[#0A0A0B] border-[#1F1F21] hover:border-[#2D2D30]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white" style={{ fontFamily: font.fontFamily }}>{font.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A059]" />}
                </div>
                <p className="text-[11px] text-gray-400" style={{ fontFamily: font.fontFamily }}>
                  Quick brown fox jumps
                </p>
                <p className="text-[9px] text-gray-500 font-mono pt-1 uppercase">{font.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Invoice Theme & Receipt Styling */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-[#1F1F21] pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#C5A059]" />
            Invoice & Thermal Receipt Theme
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Select visual theme and layout terms for printed receipts & A4 bills</p>
        </div>

        {/* Invoice Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(INVOICE_THEME_DETAILS).map(([themeId, themeMeta]) => {
            const isSelected = config.invoiceTheme === themeId;
            return (
              <div
                key={themeId}
                onClick={() => setConfig({ ...config, invoiceTheme: themeId as InvoiceThemeId })}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2",
                  isSelected
                    ? "bg-[#1A1A1D] border-[#C5A059] shadow-lg"
                    : "bg-[#0A0A0B] border-[#1F1F21] hover:border-[#2D2D30]"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{themeMeta.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A059]" />}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{themeMeta.description}</p>
                </div>
                <div className={cn("p-1.5 rounded text-[9px] font-bold text-center border font-mono", themeMeta.badgeColor)}>
                  Sample Header
                </div>
              </div>
            );
          })}
        </div>

        {/* Receipt Terms & Header Customization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#1F1F21]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Invoice Terms & Conditions Note</label>
            <textarea
              rows={2}
              value={config.termsText}
              onChange={e => setConfig({ ...config, termsText: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Receipt Footer Thank You Message</label>
            <textarea
              rows={2}
              value={config.thankYouNote}
              onChange={e => setConfig({ ...config, thankYouNote: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="flex items-center gap-6 pt-1 md:col-span-2 text-xs text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showLogoOnInvoice}
                onChange={e => setConfig({ ...config, showLogoOnInvoice: e.target.checked })}
                className="rounded bg-[#0A0A0B] border-[#2D2D30] text-[#C5A059] focus:ring-0"
              />
              <span>Display Logo on Invoices & Receipts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showQrCodeOnInvoice}
                onChange={e => setConfig({ ...config, showQrCodeOnInvoice: e.target.checked })}
                className="rounded bg-[#0A0A0B] border-[#2D2D30] text-[#C5A059] focus:ring-0"
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
          className="px-6 py-3 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-[#C5A059]/20 flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          Save & Apply Theme System
        </button>
      </div>

    </form>
  );
}
