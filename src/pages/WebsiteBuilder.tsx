import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, Eye, ExternalLink, Copy, Check, Save, Sparkles, Image, 
  Phone, MessageSquare, MapPin, Clock, Palette, ShoppingBag, Layout, 
  CheckCircle2, Share2, Smartphone, Monitor, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface WebsiteConfig {
  published: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroBannerUrl: string;
  aboutText: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  googleMapsUrl: string;
  themeColor: 'gold' | 'emerald' | 'blue' | 'purple' | 'amber';
  layoutStyle: 'modern' | 'compact' | 'showcase';
  showPrices: boolean;
  showStockStatus: boolean;
  enableWhatsAppOrder: boolean;
}

const PRESET_BANNERS = [
  { name: 'Supermarket & Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Restaurant & Dining', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Pharmacy & Healthcare', url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Electronics & Gadgets', url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Fashion & Boutique', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
];

export const getThemeStyles = (theme: string = 'gold') => {
  switch (theme) {
    case 'emerald':
      return {
        brandBg: 'bg-emerald-600 text-white',
        brandText: 'text-emerald-400',
        brandBorder: 'border-emerald-500/30',
        brandPill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        accentText: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        orderBtn: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600 hover:text-white',
      };
    case 'blue':
      return {
        brandBg: 'bg-blue-600 text-white',
        brandText: 'text-blue-400',
        brandBorder: 'border-blue-500/30',
        brandPill: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        buttonBg: 'bg-blue-600 hover:bg-blue-500 text-white',
        accentText: 'text-blue-400',
        badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        orderBtn: 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white',
      };
    case 'purple':
      return {
        brandBg: 'bg-purple-600 text-white',
        brandText: 'text-purple-400',
        brandBorder: 'border-purple-500/30',
        brandPill: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white',
        accentText: 'text-purple-400',
        badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        orderBtn: 'bg-purple-600/20 text-purple-400 border-purple-500/30 hover:bg-purple-600 hover:text-white',
      };
    case 'amber':
      return {
        brandBg: 'bg-amber-500 text-[#0A0A0B]',
        brandText: 'text-amber-400',
        brandBorder: 'border-amber-500/30',
        brandPill: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        buttonBg: 'bg-amber-500 hover:bg-amber-400 text-[#0A0A0B]',
        accentText: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        orderBtn: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-[#0A0A0B]',
      };
    case 'gold':
    default:
      return {
        brandBg: 'bg-[#C5A059] text-[#0A0A0B]',
        brandText: 'text-[#C5A059]',
        brandBorder: 'border-[#C5A059]/30',
        brandPill: 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30',
        buttonBg: 'bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B]',
        accentText: 'text-[#C5A059]',
        badgeBg: 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30',
        orderBtn: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/30 hover:bg-[#C5A059] hover:text-[#0A0A0B]',
      };
  }
};

export default function WebsiteBuilder() {
  const { businessProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'THEME' | 'PREVIEW'>('CONTENT');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  const [items, setItems] = useState<any[]>([]);

  // Load Website Config from LocalStorage
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem('universal_website_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      published: true,
      heroTitle: `Welcome to ${businessProfile.businessName || 'My Business'}`,
      heroSubtitle: businessProfile.tagline || 'Quality Products & Exceptional Service Delivered To Your Doorstep',
      heroCtaText: 'Order via WhatsApp',
      heroBannerUrl: PRESET_BANNERS[0].url,
      aboutText: 'We provide top quality items, best prices, and friendly customer support. Browse our live product catalog and get direct home delivery!',
      phone: businessProfile.phone || '9876543210',
      whatsapp: businessProfile.phone || '9876543210',
      email: businessProfile.email || 'contact@mybusiness.com',
      address: businessProfile.address || 'Main Road, Market Center, City',
      workingHours: 'Mon - Sat: 9:00 AM - 9:00 PM | Sun: Closed',
      googleMapsUrl: '',
      themeColor: 'gold',
      layoutStyle: 'modern',
      showPrices: true,
      showStockStatus: true,
      enableWhatsAppOrder: true,
    };
  });

  // Load Catalog Items
  useEffect(() => {
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const publicUrl = `${window.location.origin}/store`;

  const handleSave = () => {
    localStorage.setItem('universal_website_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-gray-200">
      {/* Top Banner Header */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight font-serif">Business Website Builder</h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
              config.published ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"
            )}>
              {config.published ? '● Live Online' : 'Draft'}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Create, customize, and publish your business website in minutes. Share your live catalog link with customers for direct orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1A1C] hover:bg-[#252528] text-gray-200 border border-[#2D2D30] text-xs font-bold rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href="/store"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1A1C] hover:bg-[#252528] text-gray-200 border border-[#2D2D30] text-xs font-bold rounded-xl transition-all"
          >
            <ExternalLink className="w-4 h-4 text-[#C5A059]" />
            <span>Open Website</span>
          </a>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] text-xs font-extrabold rounded-xl shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Saved & Published!' : 'Publish Website'}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-[#1F1F21] text-xs font-bold space-x-2">
        <button
          onClick={() => setActiveTab('CONTENT')}
          className={cn(
            "px-4 py-2.5 rounded-t-xl transition-colors border-b-2 flex items-center gap-2",
            activeTab === 'CONTENT'
              ? "text-[#C5A059] border-[#C5A059] bg-[#131315]"
              : "text-gray-400 border-transparent hover:text-white"
          )}
        >
          <Layout className="w-4 h-4" />
          <span>Website Content & Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('THEME')}
          className={cn(
            "px-4 py-2.5 rounded-t-xl transition-colors border-b-2 flex items-center gap-2",
            activeTab === 'THEME'
              ? "text-[#C5A059] border-[#C5A059] bg-[#131315]"
              : "text-gray-400 border-transparent hover:text-white"
          )}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Catalog Display</span>
        </button>

        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={cn(
            "px-4 py-2.5 rounded-t-xl transition-colors border-b-2 flex items-center gap-2",
            activeTab === 'PREVIEW'
              ? "text-[#C5A059] border-[#C5A059] bg-[#131315]"
              : "text-gray-400 border-transparent hover:text-white"
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Live Storefront Preview</span>
        </button>
      </div>

      {/* TAB 1: CONTENT EDITING */}
      {activeTab === 'CONTENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1F1F21] pb-3">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Hero Header Banner</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Hero Headline Title</label>
                <input
                  type="text"
                  value={config.heroTitle}
                  onChange={e => setConfig(c => ({ ...c, heroTitle: e.target.value }))}
                  placeholder="e.g. Welcome to Veeralakshmi Supermarket"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={config.heroSubtitle}
                  onChange={e => setConfig(c => ({ ...c, heroSubtitle: e.target.value }))}
                  placeholder="e.g. Quality fresh goods & same day delivery"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Button Text (CTA)</label>
                <input
                  type="text"
                  value={config.heroCtaText}
                  onChange={e => setConfig(c => ({ ...c, heroCtaText: e.target.value }))}
                  placeholder="e.g. Order via WhatsApp"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-400 font-bold">Banner Image Preset</label>
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    className="text-[11px] font-bold text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    {showCustomUrlInput ? 'Hide Custom Link' : '⚙️ Custom Image Link'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_BANNERS.map((preset, idx) => {
                    const isSelected = config.heroBannerUrl === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setConfig(c => ({ ...c, heroBannerUrl: preset.url }))}
                        className={cn(
                          "relative rounded-xl overflow-hidden border-2 transition-all text-left group h-20 flex flex-col justify-end p-2.5",
                          isSelected ? "border-[#C5A059] shadow-lg ring-2 ring-[#C5A059]/40" : "border-[#262629] hover:border-gray-500 opacity-80 hover:opacity-100"
                        )}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                        <span className="relative z-10 font-bold text-[11px] text-white leading-tight drop-shadow">{preset.name}</span>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 z-10 w-4 h-4 rounded-full bg-[#C5A059] text-[#0A0A0B] flex items-center justify-center font-bold text-[10px] shadow">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {showCustomUrlInput && (
                  <div className="mt-3 space-y-1">
                    <label className="block text-gray-400 text-[11px] font-bold">Paste Custom Image URL</label>
                    <input
                      type="text"
                      value={config.heroBannerUrl}
                      onChange={e => setConfig(c => ({ ...c, heroBannerUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">About Business Summary</label>
                <textarea
                  rows={3}
                  value={config.aboutText}
                  onChange={e => setConfig(c => ({ ...c, aboutText: e.target.value }))}
                  placeholder="Briefly describe your business, history, and offerings..."
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1F1F21] pb-3">
              <Phone className="w-4 h-4 text-[#C5A059]" />
              <span>Contact & Store Hours</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1.5">WhatsApp Order Number</label>
                <input
                  type="text"
                  value={config.whatsapp}
                  onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Phone Helpline</label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={e => setConfig(c => ({ ...c, phone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Store Address</label>
                <input
                  type="text"
                  value={config.address}
                  onChange={e => setConfig(c => ({ ...c, address: e.target.value }))}
                  placeholder="Full store address"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Working Hours</label>
                <input
                  type="text"
                  value={config.workingHours}
                  onChange={e => setConfig(c => ({ ...c, workingHours: e.target.value }))}
                  placeholder="Mon - Sat: 9:00 AM - 9:00 PM"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Google Maps Link (Optional)</label>
                <input
                  type="text"
                  value={config.googleMapsUrl}
                  onChange={e => setConfig(c => ({ ...c, googleMapsUrl: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEME & DISPLAY */}
      {activeTab === 'THEME' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6">
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-white border-b border-[#1F1F21] pb-3">Color Accent Theme</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'gold', name: 'Luxury Gold', color: 'bg-[#C5A059]' },
                { id: 'emerald', name: 'Emerald Eco', color: 'bg-emerald-500' },
                { id: 'blue', name: 'Royal Blue', color: 'bg-blue-500' },
                { id: 'purple', name: 'Modern Violet', color: 'bg-purple-500' },
                { id: 'amber', name: 'Warm Amber', color: 'bg-amber-500' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setConfig(c => ({ ...c, themeColor: t.id as any }))}
                  className={cn(
                    "p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left font-bold",
                    config.themeColor === t.id
                      ? "border-[#C5A059] bg-[#1A1A1C] text-white shadow-lg"
                      : "border-[#262629] text-gray-400 hover:border-gray-500"
                  )}
                >
                  <span className={cn("w-4 h-4 rounded-full flex-shrink-0 shadow", t.color)} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="text-sm font-bold text-white border-b border-[#1F1F21] pb-3">Catalog Display Settings</h2>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer">
                <div>
                  <div className="font-bold text-white">Show Prices on Website</div>
                  <div className="text-[10px] text-gray-500">Allow visitors to see item unit prices</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPrices}
                  onChange={e => setConfig(c => ({ ...c, showPrices: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer">
                <div>
                  <div className="font-bold text-white">Show Stock Status Badges</div>
                  <div className="text-[10px] text-gray-500">Display "In Stock" or "Low Stock" indicators</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showStockStatus}
                  onChange={e => setConfig(c => ({ ...c, showStockStatus: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer">
                <div>
                  <div className="font-bold text-white">Enable Direct WhatsApp Ordering</div>
                  <div className="text-[10px] text-gray-500">Adds 1-click WhatsApp order buttons to product cards</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableWhatsAppOrder}
                  onChange={e => setConfig(c => ({ ...c, enableWhatsAppOrder: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PREVIEW */}
      {(activeTab === 'PREVIEW' || activeTab === 'CONTENT' || activeTab === 'THEME') && (
        <div className="space-y-4 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C5A059]" />
              <span>Interactive Website Preview</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewDevice('DESKTOP')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                  previewDevice === 'DESKTOP' ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400 hover:text-white"
                )}
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Desktop View</span>
              </button>
              <button
                onClick={() => setPreviewDevice('MOBILE')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                  previewDevice === 'MOBILE' ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400 hover:text-white"
                )}
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile Frame</span>
              </button>
            </div>
          </div>

          {/* Render Store Preview Component */}
          <div className={cn("mx-auto transition-all", previewDevice === 'MOBILE' ? "max-w-sm border-8 border-[#262629] rounded-3xl overflow-hidden shadow-2xl" : "w-full")}>
            <WebsitePreviewRender config={config} items={items} businessName={businessProfile.businessName} isMobileView={previewDevice === 'MOBILE'} />
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for Website Preview
function WebsitePreviewRender({ config, items, businessName, isMobileView }: { config: WebsiteConfig; items: any[]; businessName: string; isMobileView?: boolean }) {
  const brand = businessName || 'My Business';
  const displayItems = items.length > 0 ? items : [
    { id: 'demo-1', name: 'Fresh Organic Apples', price: 120, category: 'Fresh Produce', unit: 'Kg', currentStock: 25 },
    { id: 'demo-2', name: 'Whole Wheat Bread 400g', price: 45, category: 'Bakery', unit: 'Pkt', currentStock: 10 },
    { id: 'demo-3', name: 'Pure Cow Milk 1 Litre', price: 65, category: 'Dairy', unit: 'Litre', currentStock: 50 },
  ];

  const themeStyles = getThemeStyles(config.themeColor);

  return (
    <div className="bg-[#0A0A0B] text-gray-100 font-sans rounded-xl overflow-hidden shadow-2xl border border-[#1F1F21]">
      {/* Store Header */}
      <header className="bg-[#131315] border-b border-[#1F1F21] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 shadow", themeStyles.brandBg)}>
            {brand.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <h1 className="font-serif font-bold text-xs sm:text-sm text-white leading-tight truncate">{brand}</h1>
            <span className={cn("text-[10px] block truncate font-semibold uppercase", themeStyles.accentText)}>Official Storefront</span>
          </div>
        </div>

        <a
          href={`https://wa.me/${config.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("px-2.5 py-1.5 font-bold text-[11px] rounded-xl flex items-center gap-1 flex-shrink-0 shadow", themeStyles.buttonBg)}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp Us</span>
        </a>
      </header>

      {/* Hero Banner Section */}
      <div className="relative bg-black py-10 px-5 overflow-hidden">
        <img
          src={config.heroBannerUrl}
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-45 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/50" />
        <div className="relative z-10 max-w-xl space-y-2.5">
          <h2
            className="text-lg sm:text-2xl font-serif font-extrabold tracking-tight leading-snug drop-shadow-xl"
            style={{ color: '#ffffff' }}
          >
            {config.heroTitle}
          </h2>
          <p
            className="text-xs sm:text-sm font-medium drop-shadow-md"
            style={{ color: '#f3f4f6' }}
          >
            {config.heroSubtitle}
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(brand)},%20I%20want%20to%20place%20an%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("inline-flex items-center gap-2 px-3.5 py-2 font-extrabold text-xs rounded-xl shadow-lg transition-all", themeStyles.buttonBg)}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{config.heroCtaText}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-white font-serif">Featured Catalog ({displayItems.length})</h3>
          <span className="text-[10px] text-gray-400">Live Inventory Sync</span>
        </div>

        <div className={cn("grid gap-3", isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
          {displayItems.map(item => (
            <div key={item.id} className="bg-[#131315] border border-[#1F1F21] p-3.5 rounded-xl space-y-3 flex flex-col justify-between hover:border-gray-600 transition-all">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-white text-xs truncate max-w-[140px]">{item.name}</h4>
                  {config.showStockStatus && (
                    <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 border", themeStyles.badgeBg)}>
                      In Stock
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{item.category || 'General'} • per {item.unit || 'Pcs'}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1F1F21] gap-1 flex-wrap">
                {config.showPrices ? (
                  <span className="font-mono font-bold text-white text-sm">₹{Number(item.price || 0).toFixed(2)}</span>
                ) : (
                  <span className="text-[10px] text-gray-400">Available</span>
                )}

                {config.enableWhatsAppOrder && (
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=Hi,%20I%20want%20to%20order%20${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("px-2.5 py-1 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0 border", themeStyles.orderBtn)}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Order</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="bg-[#131315] border-t border-[#1F1F21] p-6 text-xs text-gray-400 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs font-serif">{brand}</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">{config.aboutText}</p>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{config.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{config.workingHours}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
