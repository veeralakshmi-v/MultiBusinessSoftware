import React, { useState } from 'react';
import { 
  Crown, Globe, Building2, Receipt, Mail, MessageSquare, 
  Palette, Check, ShieldCheck, ExternalLink, Lock, Eye, 
  RefreshCw, Save, Sparkles, Image, CheckCircle2
} from 'lucide-react';
import { WhiteLabelEngine, DEFAULT_WHITELABEL_CONFIG } from '../../lib/whitelabel/whiteLabelEngine';
import { WhiteLabelConfig } from '../../types/whitelabel';
import { cn } from '../../lib/utils';

export default function WhiteLabelStudio() {
  const [config, setConfig] = useState<WhiteLabelConfig>(() => WhiteLabelEngine.getConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    WhiteLabelEngine.saveConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      
      {/* Save Toast */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-400 animate-in fade-in duration-200 shadow-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong className="block text-sm">White Label Branding Deployed!</strong>
              <span className="text-[11px] text-gray-400">
                Company name, domain, invoice templates, email, and SMS sender IDs updated without code changes.
              </span>
            </div>
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#C5A059]" />
            Enterprise White Label & Custom Branding Studio
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Full brand customization for <strong>Logo, Company Name, Custom Domain, Invoices, Email, SMS, and Theme</strong> with zero code modifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            100% White-Labeled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Section 1: Company Name & Brand Identity */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C5A059]" />
              1. Company Name & Legal Identity
            </h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Brand Display Name</label>
              <input
                type="text"
                value={config.companyName}
                onChange={e => setConfig({ ...config, companyName: e.target.value })}
                placeholder="e.g. Apex Luxury Retail"
                className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Registered Legal Entity Name</label>
              <input
                type="text"
                value={config.legalEntityName}
                onChange={e => setConfig({ ...config, legalEntityName: e.target.value })}
                placeholder="e.g. Apex Retail Private Limited"
                className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Custom Logo URL</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={config.logoUrl}
                  onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                  placeholder="https://yourbrand.com/logo.png"
                  className="flex-1 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                />
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0B] border border-[#2D2D30] flex items-center justify-center text-[#C5A059] font-bold text-xs flex-shrink-0">
                  {config.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" onError={e => (e.currentTarget.style.display = 'none')} /> : config.companyName.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Custom Domain & SSL */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C5A059]" />
              2. Custom Domain & SSL Certificate
            </h4>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> SSL ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Custom CNAME / Domain</label>
              <input
                type="text"
                value={config.customDomain}
                onChange={e => setConfig({ ...config, customDomain: e.target.value })}
                placeholder="billing.yourdomain.com"
                className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="p-3 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl text-[11px] space-y-1">
              <span className="text-gray-400 block font-mono">DNS Configuration Instructions:</span>
              <p className="text-gray-300 font-mono">Type: <strong>CNAME</strong> • Host: <strong>billing</strong> • Target: <strong className="text-[#C5A059]">cname.posbilling.cloud</strong></p>
            </div>
          </div>
        </div>

        {/* Section 3: White-Labeled Invoices */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#C5A059]" />
              3. White-Labeled Invoices & Tax Bills
            </h4>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Invoice Header Title</label>
                <input
                  type="text"
                  value={config.invoice.headerTitle}
                  onChange={e => setConfig({ ...config, invoice: { ...config.invoice, headerTitle: e.target.value } })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">GSTIN / Tax Registration</label>
                <input
                  type="text"
                  value={config.invoice.gstin}
                  onChange={e => setConfig({ ...config, invoice: { ...config.invoice, gstin: e.target.value } })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Invoice Footer Note</label>
              <input
                type="text"
                value={config.invoice.footerNote}
                onChange={e => setConfig({ ...config, invoice: { ...config.invoice, footerNote: e.target.value } })}
                className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={config.invoice.hidePlatformBranding}
                onChange={e => setConfig({ ...config, invoice: { ...config.invoice, hidePlatformBranding: e.target.checked } })}
                className="rounded bg-[#0A0A0B] border-[#2D2D30] text-[#C5A059] focus:ring-0"
              />
              <span className="text-xs text-gray-300 font-semibold">
                Hide 'Powered by Multi-Business POS' Branding on Receipts & Invoices
              </span>
            </label>
          </div>
        </div>

        {/* Section 4: Custom Email & SMS Gateway */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C5A059]" />
              4. Custom Email & SMS Gateway
            </h4>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Email Sender Name</label>
                <input
                  type="text"
                  value={config.email.senderName}
                  onChange={e => setConfig({ ...config, email: { ...config.email, senderName: e.target.value } })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Sender Email Address</label>
                <input
                  type="email"
                  value={config.email.senderEmail}
                  onChange={e => setConfig({ ...config, email: { ...config.email, senderEmail: e.target.value } })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">SMS DLT Sender ID (6 Chars)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={config.sms.senderId}
                  onChange={e => setConfig({ ...config, sms: { ...config.sms, senderId: e.target.value.toUpperCase() } })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-[#C5A059] font-mono font-bold outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Support Hotline Phone</label>
                <input
                  type="text"
                  value={config.sms.supportPhone}
                  onChange={e => setConfig({ ...config, sms: { ...config.sms, supportPhone: e.target.value } })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Deploy Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-3 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-[#C5A059]/20 flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          Deploy White Label Branding
        </button>
      </div>

    </form>
  );
}
