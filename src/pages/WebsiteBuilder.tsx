import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, Eye, ExternalLink, Copy, Check, Save, Sparkles, Image as ImageIcon, 
  Phone, MessageSquare, MapPin, Clock, Palette, ShoppingBag, Layout, 
  CheckCircle2, Share2, Smartphone, Monitor, AlertCircle, Plus, Trash2,
  Tag, Upload, Link as LinkIcon, Instagram, Facebook, Youtube, Twitter,
  Megaphone, Wrench, Grid, Compass, ArrowRight, X, ZoomIn, Star, Layers
} from 'lucide-react';
import { cn, getCategoryName } from '../lib/utils';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  icon?: string;
  imageUrl?: string;
  popular?: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
}

export interface PromotionOffer {
  id: string;
  title: string;
  badge: string;
  description: string;
  couponCode?: string;
  active: boolean;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
}

export interface WebsiteConfig {
  published: boolean;
  // Hero & Text
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroBannerUrl: string;
  aboutText: string;
  // Contact & Links
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  googleMapsUrl: string;
  socialLinks: SocialLinks;
  // Services
  services: ServiceItem[];
  // Gallery
  gallery: GalleryItem[];
  // Promotions & Announcement
  announcementText: string;
  promotions: PromotionOffer[];
  // Toggles
  showAnnouncement: boolean;
  showServices: boolean;
  showGallery: boolean;
  showPromotions: boolean;
  showPrices: boolean;
  showStockStatus: boolean;
  enableWhatsAppOrder: boolean;
  // Theme & Layout
  themeColor: 'gold' | 'emerald' | 'blue' | 'purple' | 'amber' | 'crimson';
  layoutStyle: 'modern' | 'compact' | 'showcase';
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
        activeTab: 'bg-emerald-600 text-white shadow',
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
        activeTab: 'bg-blue-600 text-white shadow',
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
        activeTab: 'bg-purple-600 text-white shadow',
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
        activeTab: 'bg-amber-500 text-[#0A0A0B] shadow',
      };
    case 'crimson':
      return {
        brandBg: 'bg-rose-600 text-white',
        brandText: 'text-rose-400',
        brandBorder: 'border-rose-500/30',
        brandPill: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        buttonBg: 'bg-rose-600 hover:bg-rose-500 text-white',
        accentText: 'text-rose-400',
        badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        activeTab: 'bg-rose-600 text-white shadow',
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
        activeTab: 'bg-[#C5A059] text-[#0A0A0B] shadow',
      };
  }
};

export default function WebsiteBuilder() {
  const { businessProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'HERO_TEXT' | 'CONTACT_LINKS' | 'GALLERY' | 'PROMOTIONS' | 'THEME' | 'PREVIEW'>('SERVICES');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  // Gallery inputs
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Hero custom banner file input
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<any[]>([]);

  // Load Website Config from LocalStorage
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem('universal_website_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          published: parsed.published ?? true,
          heroTitle: parsed.heroTitle || `Welcome to ${businessProfile.businessName || 'My Business'}`,
          heroSubtitle: parsed.heroSubtitle || businessProfile.tagline || 'Quality Products & Exceptional Service Delivered To Your Doorstep',
          heroCtaText: parsed.heroCtaText || 'Order via WhatsApp',
          heroBannerUrl: parsed.heroBannerUrl || PRESET_BANNERS[0].url,
          aboutText: parsed.aboutText || 'We provide top quality items, best prices, and friendly customer support. Browse our live product catalog and get direct home delivery!',
          phone: parsed.phone || businessProfile.phone || '9876543210',
          whatsapp: parsed.whatsapp || businessProfile.phone || '9876543210',
          email: parsed.email || businessProfile.email || 'contact@mybusiness.com',
          address: parsed.address || businessProfile.address || 'Main Road, Market Center, City',
          workingHours: parsed.workingHours || 'Mon - Sat: 9:00 AM - 9:00 PM | Sun: Closed',
          googleMapsUrl: parsed.googleMapsUrl || '',
          socialLinks: parsed.socialLinks || {
            instagram: '',
            facebook: '',
            youtube: '',
            twitter: '',
          },
          services: parsed.services?.length ? parsed.services : [
            { id: '1', title: 'Express Home Delivery', description: 'Fast doorstep delivery for all orders with safe packaging and real-time order tracking.', price: 'Free above ₹499', icon: '🚚', popular: true },
            { id: '2', title: 'Bulk & Wholesale Supply', description: 'Special volume pricing and flexible payment terms for events, offices, and institutions.', price: 'Custom Quote', icon: '📦', popular: false },
            { id: '3', title: 'Quality Assurance & Returns', description: '100% genuine products with hassle-free replacement and direct manager assistance.', price: 'Guaranteed', icon: '✨', popular: false },
            { id: '4', title: 'Custom Orders & Personal Assistance', description: 'Need something specific not listed? Message our team directly for customized procurement.', price: 'On Request', icon: '💬', popular: true },
          ],
          gallery: parsed.gallery?.length ? parsed.gallery : [
            { id: 'g1', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', caption: 'Fresh Store Aisles' },
            { id: 'g2', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', caption: 'Modern Showroom' },
            { id: 'g3', url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80', caption: 'Premium Products Selection' },
            { id: 'g4', url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80', caption: 'Quality Verified Inventory' },
          ],
          announcementText: parsed.announcementText ?? '🎉 Special Offer: Flat 10% OFF on all WhatsApp orders this month! Use code SAVE10',
          promotions: parsed.promotions?.length ? parsed.promotions : [
            { id: 'p1', title: 'Grand Seasonal Discount', badge: 'FLAT 20% OFF', description: 'Enjoy flat 20% discount on all orders placed this week via WhatsApp.', couponCode: 'SAVE20', active: true },
            { id: 'p2', title: 'Free Home Delivery', badge: 'SPECIAL OFFER', description: 'Free express delivery on all orders above ₹499 within city limits.', couponCode: 'FREEDEL', active: true },
          ],
          showAnnouncement: parsed.showAnnouncement ?? true,
          showServices: parsed.showServices ?? true,
          showGallery: parsed.showGallery ?? true,
          showPromotions: parsed.showPromotions ?? true,
          showPrices: parsed.showPrices ?? true,
          showStockStatus: parsed.showStockStatus ?? true,
          enableWhatsAppOrder: parsed.enableWhatsAppOrder ?? true,
          themeColor: parsed.themeColor || 'gold',
          layoutStyle: parsed.layoutStyle || 'modern',
        };
      }
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
      socialLinks: {
        instagram: '',
        facebook: '',
        youtube: '',
        twitter: '',
      },
      services: [
        { id: '1', title: 'Express Home Delivery', description: 'Fast doorstep delivery for all orders with safe packaging and real-time order tracking.', price: 'Free above ₹499', icon: '🚚', popular: true },
        { id: '2', title: 'Bulk & Wholesale Supply', description: 'Special volume pricing and flexible payment terms for events, offices, and institutions.', price: 'Custom Quote', icon: '📦', popular: false },
        { id: '3', title: 'Quality Assurance & Returns', description: '100% genuine products with hassle-free replacement and direct manager assistance.', price: 'Guaranteed', icon: '✨', popular: false },
        { id: '4', title: 'Custom Orders & Personal Assistance', description: 'Need something specific not listed? Message our team directly for customized procurement.', price: 'On Request', icon: '💬', popular: true },
      ],
      gallery: [
        { id: 'g1', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', caption: 'Fresh Store Aisles' },
        { id: 'g2', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', caption: 'Modern Showroom' },
        { id: 'g3', url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80', caption: 'Premium Products Selection' },
        { id: 'g4', url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80', caption: 'Quality Verified Inventory' },
      ],
      announcementText: '🎉 Special Offer: Flat 10% OFF on all WhatsApp orders this month! Use code SAVE10',
      promotions: [
        { id: 'p1', title: 'Grand Seasonal Discount', badge: 'FLAT 20% OFF', description: 'Enjoy flat 20% discount on all orders placed this week via WhatsApp.', couponCode: 'SAVE20', active: true },
        { id: 'p2', title: 'Free Home Delivery', badge: 'SPECIAL OFFER', description: 'Free express delivery on all orders above ₹499 within city limits.', couponCode: 'FREEDEL', active: true },
      ],
      showAnnouncement: true,
      showServices: true,
      showGallery: true,
      showPromotions: true,
      showPrices: true,
      showStockStatus: true,
      enableWhatsAppOrder: true,
      themeColor: 'gold',
      layoutStyle: 'modern',
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

  // Handle Gallery Upload File
  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const newItem: GalleryItem = {
          id: Date.now().toString(),
          url: base64,
          caption: file.name.split('.')[0] || 'Store Photo',
        };
        setConfig(c => ({
          ...c,
          gallery: [...c.gallery, newItem],
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Hero Banner Upload
  const handleHeroBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setConfig(c => ({ ...c, heroBannerUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Gallery item from URL
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      url: newGalleryUrl.trim(),
      caption: newGalleryCaption.trim() || 'Store Image',
    };
    setConfig(c => ({
      ...c,
      gallery: [...c.gallery, newItem],
    }));
    setNewGalleryUrl('');
    setNewGalleryCaption('');
  };

  const handleDeleteGalleryItem = (id: string) => {
    setConfig(c => ({
      ...c,
      gallery: c.gallery.filter(g => g.id !== id),
    }));
  };

  // Service helpers
  const handleAddService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: 'New Service Title',
      description: 'Describe what is included in this service for your customers.',
      price: 'Starting from ₹199',
      icon: '✨',
      popular: false,
    };
    setConfig(c => ({ ...c, services: [...c.services, newService] }));
  };

  const handleUpdateService = (id: string, field: keyof ServiceItem, value: any) => {
    setConfig(c => ({
      ...c,
      services: c.services.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const handleDeleteService = (id: string) => {
    setConfig(c => ({
      ...c,
      services: c.services.filter(s => s.id !== id),
    }));
  };

  // Promotion helpers
  const handleAddPromotion = () => {
    const newPromo: PromotionOffer = {
      id: Date.now().toString(),
      title: 'New Special Offer',
      badge: 'LIMITED TIME',
      description: 'Special discount available for our valued customers.',
      couponCode: 'OFFER10',
      active: true,
    };
    setConfig(c => ({ ...c, promotions: [...c.promotions, newPromo] }));
  };

  const handleUpdatePromotion = (id: string, field: keyof PromotionOffer, value: any) => {
    setConfig(c => ({
      ...c,
      promotions: c.promotions.map(p => p.id === id ? { ...p, [field]: value } : p),
    }));
  };

  const handleDeletePromotion = (id: string) => {
    setConfig(c => ({
      ...c,
      promotions: c.promotions.filter(p => p.id !== id),
    }));
  };

  const publishedOnlineCount = items.filter(i => i.showInWebsite === true).length;

  return (
    <div className="space-y-6 text-gray-200">
      {/* Top Banner Header */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight font-serif">Website Content & CMS Builder</h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
              config.published ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"
            )}>
              {config.published ? '● Live Online' : 'Draft'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-blue-500/15 text-blue-400 border-blue-500/30">
              🌐 {publishedOnlineCount} Products Online
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Customize all website sections: Services, Hero Banners, Gallery, Special Offers, and Contact info. Live changes appear directly on your customer storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1A1C] hover:bg-[#252528] text-gray-200 border border-[#2D2D30] text-xs font-bold rounded-xl transition-all shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href="/store"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1A1C] hover:bg-[#252528] text-gray-200 border border-[#2D2D30] text-xs font-bold rounded-xl transition-all shadow"
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

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-[#1F1F21] text-xs font-bold space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'SERVICES', label: 'SERVICES', icon: Wrench },
          { id: 'HERO_TEXT', label: 'HERO & TEXT', icon: Layout },
          { id: 'CONTACT_LINKS', label: 'CONTACT & LINKS', icon: Phone },
          { id: 'GALLERY', label: 'GALLERY', icon: Grid },
          { id: 'PROMOTIONS', label: 'PROMOTIONS', icon: Megaphone },
          { id: 'THEME', label: 'THEME & SETTINGS', icon: Palette },
          { id: 'PREVIEW', label: 'LIVE PREVIEW', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
                isActive
                  ? "text-[#C5A059] border-[#C5A059] bg-[#131315] shadow-sm font-extrabold"
                  : "text-gray-400 border-transparent hover:text-white hover:bg-[#1A1A1C]/50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SERVICES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'SERVICES' && (
        <div className="space-y-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F1F21] pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#C5A059]" />
                <span>Custom Services & Offerings</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Highlight special services, deliveries, wholesale supply, or guarantees on your storefront.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-300 bg-[#1A1A1C] px-3 py-1.5 rounded-xl border border-[#262629] cursor-pointer">
                <span>Show Services Section</span>
                <input
                  type="checkbox"
                  checked={config.showServices}
                  onChange={e => setConfig(c => ({ ...c, showServices: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <button
                type="button"
                onClick={handleAddService}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] text-xs font-bold rounded-xl shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.services.map((service, index) => (
              <div key={service.id} className="bg-[#1A1A1C] border border-[#2D2D30] rounded-2xl p-4 space-y-3.5 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={service.icon || '✨'}
                      onChange={e => handleUpdateService(service.id, 'icon', e.target.value)}
                      title="Emoji Icon"
                      className="w-9 h-9 text-center text-lg bg-[#252528] border border-[#3A3A3E] rounded-xl outline-none focus:border-[#C5A059]"
                    />
                    <span className="text-xs font-bold text-gray-400">Service #{index + 1}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 cursor-pointer">
                      <Star className="w-3 h-3" />
                      <span>Popular</span>
                      <input
                        type="checkbox"
                        checked={service.popular || false}
                        onChange={e => handleUpdateService(service.id, 'popular', e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-[#C5A059] ml-1"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.id)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Service Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={e => handleUpdateService(service.id, 'title', e.target.value)}
                      placeholder="e.g. Express Home Delivery"
                      className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={service.description}
                      onChange={e => handleUpdateService(service.id, 'description', e.target.value)}
                      placeholder="What makes this service special..."
                      className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Price Tag / Subtitle</label>
                    <input
                      type="text"
                      value={service.price || ''}
                      onChange={e => handleUpdateService(service.id, 'price', e.target.value)}
                      placeholder="e.g. Free above ₹499 or Starting from ₹199"
                      className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {config.services.length === 0 && (
            <div className="text-center py-10 border border-dashed border-[#2D2D30] rounded-2xl p-6 space-y-2">
              <Wrench className="w-8 h-8 text-gray-600 mx-auto" />
              <div className="text-xs font-bold text-white">No services added yet</div>
              <p className="text-[11px] text-gray-500">Click "Add New Service" above to showcase your unique capabilities.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO & TEXT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'HERO_TEXT' && (
        <div className="space-y-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1F1F21] pb-3">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Hero Header & Business Story</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
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
                <label className="block text-gray-400 font-bold mb-1.5">Hero Button Call-to-Action Text</label>
                <input
                  type="text"
                  value={config.heroCtaText}
                  onChange={e => setConfig(c => ({ ...c, heroCtaText: e.target.value }))}
                  placeholder="e.g. Order via WhatsApp"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">About Us & Business Story</label>
                <textarea
                  rows={4}
                  value={config.aboutText}
                  onChange={e => setConfig(c => ({ ...c, aboutText: e.target.value }))}
                  placeholder="Briefly describe your business background, offerings, and commitment to customers..."
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            {/* Banner Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-gray-400 font-bold">Hero Banner Background</label>
                <button
                  type="button"
                  onClick={() => heroFileInputRef.current?.click()}
                  className="text-xs font-bold text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 rounded-lg border border-[#C5A059]/30 hover:bg-[#C5A059]/20 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom Banner</span>
                </button>
                <input
                  type="file"
                  ref={heroFileInputRef}
                  onChange={handleHeroBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Current Banner Preview */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-[#2D2D30] group">
                <img
                  src={config.heroBannerUrl}
                  alt="Hero Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                  <div className="text-white font-bold text-xs truncate max-w-sm">
                    Current Banner Image Active
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Preset Themes</span>
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    className="text-[11px] font-bold text-[#C5A059] hover:underline"
                  >
                    {showCustomUrlInput ? 'Hide URL Box' : 'Paste Direct URL'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_BANNERS.map((preset, idx) => {
                    const isSelected = config.heroBannerUrl === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setConfig(c => ({ ...c, heroBannerUrl: preset.url }))}
                        className={cn(
                          "relative rounded-xl overflow-hidden border-2 transition-all text-left group h-16 flex flex-col justify-end p-2",
                          isSelected ? "border-[#C5A059] ring-2 ring-[#C5A059]/40 shadow-lg" : "border-[#262629] opacity-75 hover:opacity-100"
                        )}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <span className="relative z-10 font-bold text-[10px] text-white leading-tight drop-shadow truncate">{preset.name}</span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 z-10 w-3.5 h-3.5 rounded-full bg-[#C5A059] text-[#0A0A0B] flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {showCustomUrlInput && (
                  <div className="mt-3 space-y-1">
                    <label className="block text-gray-400 text-[11px] font-bold">Image URL</label>
                    <input
                      type="text"
                      value={config.heroBannerUrl}
                      onChange={e => setConfig(c => ({ ...c, heroBannerUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTACT & LINKS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'CONTACT_LINKS' && (
        <div className="space-y-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1F1F21] pb-3">
            <Phone className="w-4 h-4 text-[#C5A059]" />
            <span>Contact Information & Social Links</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Primary Contacts */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#C5A059] text-xs uppercase tracking-wider">Business Direct Contacts</h3>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                  <span>WhatsApp Business Number (Direct Ordering)</span>
                </label>
                <input
                  type="text"
                  value={config.whatsapp}
                  onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
                  placeholder="e.g. 9876543210 (Country code + Phone)"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#25D366] font-mono"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  WhatsApp buttons on website will always use this number with 1-click green chat.
                </span>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Phone Call Helpline</label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={e => setConfig(c => ({ ...c, phone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Official Email</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={e => setConfig(c => ({ ...c, email: e.target.value }))}
                  placeholder="contact@business.com"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Store Physical Address</label>
                <textarea
                  rows={2}
                  value={config.address}
                  onChange={e => setConfig(c => ({ ...c, address: e.target.value }))}
                  placeholder="Full street address, landmark, city, pincode"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Store Working Hours</label>
                <input
                  type="text"
                  value={config.workingHours}
                  onChange={e => setConfig(c => ({ ...c, workingHours: e.target.value }))}
                  placeholder="Mon - Sat: 9:00 AM - 9:00 PM | Sun: Closed"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Google Maps Link</label>
                <input
                  type="text"
                  value={config.googleMapsUrl}
                  onChange={e => setConfig(c => ({ ...c, googleMapsUrl: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#C5A059] text-xs uppercase tracking-wider">Social Media & Online Presence</h3>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  type="text"
                  value={config.socialLinks.instagram || ''}
                  onChange={e => setConfig(c => ({ ...c, socialLinks: { ...c.socialLinks, instagram: e.target.value } }))}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-400" />
                  <span>Facebook Page URL</span>
                </label>
                <input
                  type="text"
                  value={config.socialLinks.facebook || ''}
                  onChange={e => setConfig(c => ({ ...c, socialLinks: { ...c.socialLinks, facebook: e.target.value } }))}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube Channel URL</span>
                </label>
                <input
                  type="text"
                  value={config.socialLinks.youtube || ''}
                  onChange={e => setConfig(c => ({ ...c, socialLinks: { ...c.socialLinks, youtube: e.target.value } }))}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>Twitter / X Profile URL</span>
                </label>
                <input
                  type="text"
                  value={config.socialLinks.twitter || ''}
                  onChange={e => setConfig(c => ({ ...c, socialLinks: { ...c.socialLinks, twitter: e.target.value } }))}
                  placeholder="https://x.com/yourhandle"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GALLERY TAB (Matching User's Uploaded Layout) */}
      {/* ========================================================================= */}
      {activeTab === 'GALLERY' && (
        <div className="space-y-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F1F21] pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#C5A059]" />
                <span>Store Photo Gallery Manager</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload shop photos, showroom images, or showcase items. Visitors can click to expand full screen.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-300 bg-[#1A1A1C] px-3 py-1.5 rounded-xl border border-[#262629] cursor-pointer">
                <span>Show Gallery Section</span>
                <input
                  type="checkbox"
                  checked={config.showGallery}
                  onChange={e => setConfig(c => ({ ...c, showGallery: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] text-xs font-bold rounded-xl shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Image</span>
              </button>
              <input
                type="file"
                ref={galleryFileInputRef}
                onChange={handleGalleryFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Add Image Control Box (Matching User Screenshot Layout) */}
          <div className="bg-[#1A1A1C] border border-[#2D2D30] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C5A059]" />
              <span>Add Image to Gallery</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Method A: File Upload */}
              <div className="md:col-span-4 text-center border-2 border-dashed border-[#3A3A3E] rounded-xl p-4 bg-[#131315]/50 hover:border-[#C5A059] transition-colors">
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center space-y-2 py-2"
                >
                  <Upload className="w-6 h-6 text-[#C5A059]" />
                  <span className="text-xs font-bold text-white">Upload from Computer</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WebP supported</span>
                </button>
              </div>

              {/* Separator */}
              <div className="md:col-span-1 text-center font-bold text-gray-500 text-xs uppercase">
                — OR —
              </div>

              {/* Method B: URL Input */}
              <div className="md:col-span-6 space-y-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={e => setNewGalleryUrl(e.target.value)}
                  placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)"
                  className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-xs text-white outline-none focus:border-[#C5A059] font-mono text-[11px]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryCaption}
                    onChange={e => setNewGalleryCaption(e.target.value)}
                    placeholder="Image Caption (Optional)"
                    className="flex-1 px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-xs text-white outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    disabled={!newGalleryUrl.trim()}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4a] disabled:opacity-50 text-[#0A0A0B] text-xs font-bold rounded-xl transition-all shadow"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Gallery Grid (Matching user's thumbnail + upload + delete layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {config.gallery.map((item, idx) => (
              <div key={item.id} className="bg-[#1A1A1C] border border-[#2D2D30] rounded-2xl overflow-hidden group shadow-lg flex flex-col justify-between">
                <div className="relative h-44 bg-black overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.caption || `Gallery ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm">
                    #{idx + 1}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setConfig(c => ({
                        ...c,
                        gallery: c.gallery.map(g => g.id === item.id ? { ...g, caption: val } : g),
                      }));
                    }}
                    placeholder="Photo caption..."
                    className="w-full px-2.5 py-1.5 bg-[#131315] border border-[#2D2D30] rounded-lg text-xs text-white outline-none focus:border-[#C5A059]"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                      {item.url.startsWith('data:') ? 'Local Image' : 'Web URL'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="px-2.5 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {config.gallery.length === 0 && (
            <div className="text-center py-12 border border-dashed border-[#2D2D30] rounded-2xl p-6 space-y-2">
              <Grid className="w-8 h-8 text-gray-600 mx-auto" />
              <div className="text-xs font-bold text-white">No gallery images added yet</div>
              <p className="text-[11px] text-gray-500">Upload images or paste links to create an attractive storefront showcase.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROMOTIONS & ANNOUNCEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'PROMOTIONS' && (
        <div className="space-y-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
          {/* Top Announcement Bar Configuration */}
          <div className="space-y-4 border-b border-[#1F1F21] pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#C5A059]" />
                  <span>Store Top Announcement Bar</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Displays a persistent banner at the very top of your storefront.
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-300 bg-[#1A1A1C] px-3 py-1.5 rounded-xl border border-[#262629] cursor-pointer">
                <span>Show Announcement Bar</span>
                <input
                  type="checkbox"
                  checked={config.showAnnouncement}
                  onChange={e => setConfig(c => ({ ...c, showAnnouncement: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>
            </div>

            <div className="text-xs">
              <label className="block text-gray-400 font-bold mb-1.5">Announcement Text / Message</label>
              <input
                type="text"
                value={config.announcementText}
                onChange={e => setConfig(c => ({ ...c, announcementText: e.target.value }))}
                placeholder="🎉 Special Offer: Flat 10% OFF on all orders! Use code SAVE10"
                className="w-full px-3.5 py-2.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Promotion Offers Cards */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#C5A059]" />
                  <span>Special Offers & Deals Showcase</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create discount badges and promo cards to increase customer purchases.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 bg-[#1A1A1C] px-3 py-1.5 rounded-xl border border-[#262629] cursor-pointer">
                  <span>Show Promotions Section</span>
                  <input
                    type="checkbox"
                    checked={config.showPromotions}
                    onChange={e => setConfig(c => ({ ...c, showPromotions: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#C5A059]"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAddPromotion}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] text-xs font-bold rounded-xl shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Special Offer</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.promotions.map((promo, idx) => (
                <div key={promo.id} className="bg-[#1A1A1C] border border-[#2D2D30] rounded-2xl p-4 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-extrabold uppercase">
                        Offer #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 cursor-pointer">
                        <span>Active</span>
                        <input
                          type="checkbox"
                          checked={promo.active}
                          onChange={e => handleUpdatePromotion(promo.id, 'active', e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-[#C5A059] ml-1"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleDeletePromotion(promo.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-400 font-bold mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={promo.badge}
                          onChange={e => handleUpdatePromotion(promo.id, 'badge', e.target.value)}
                          placeholder="e.g. FLAT 20% OFF"
                          className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-bold text-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-bold mb-1">Coupon / Code</label>
                        <input
                          type="text"
                          value={promo.couponCode || ''}
                          onChange={e => handleUpdatePromotion(promo.id, 'couponCode', e.target.value)}
                          placeholder="e.g. SAVE20"
                          className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059] font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">Offer Title</label>
                      <input
                        type="text"
                        value={promo.title}
                        onChange={e => handleUpdatePromotion(promo.id, 'title', e.target.value)}
                        placeholder="e.g. Grand Festive Deal"
                        className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">Offer Terms / Details</label>
                      <textarea
                        rows={2}
                        value={promo.description}
                        onChange={e => handleUpdatePromotion(promo.id, 'description', e.target.value)}
                        placeholder="Details of what the customer gets with this offer..."
                        className="w-full px-3 py-2 bg-[#131315] border border-[#2D2D30] rounded-xl text-white outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {config.promotions.length === 0 && (
              <div className="text-center py-10 border border-dashed border-[#2D2D30] rounded-2xl p-6 space-y-2">
                <Tag className="w-8 h-8 text-gray-600 mx-auto" />
                <div className="text-xs font-bold text-white">No promotional offers created</div>
                <p className="text-[11px] text-gray-500">Click "Add Special Offer" above to display discounts to your visitors.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. THEME & SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'THEME' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white border-b border-[#1F1F21] pb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C5A059]" />
                <span>Color Accent Theme</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Customize brand accent colors for headers, category pills, and borders.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'gold', name: 'Luxury Gold', color: 'bg-[#C5A059]' },
                { id: 'emerald', name: 'Emerald Eco', color: 'bg-emerald-500' },
                { id: 'blue', name: 'Royal Blue', color: 'bg-blue-500' },
                { id: 'purple', name: 'Modern Violet', color: 'bg-purple-500' },
                { id: 'amber', name: 'Warm Amber', color: 'bg-amber-500' },
                { id: 'crimson', name: 'Ruby Crimson', color: 'bg-rose-600' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setConfig(c => ({ ...c, themeColor: t.id as any }))}
                  className={cn(
                    "p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left font-bold",
                    config.themeColor === t.id
                      ? "border-[#C5A059] bg-[#1A1A1C] text-white shadow-lg ring-1 ring-[#C5A059]/50"
                      : "border-[#262629] text-gray-400 hover:border-gray-500"
                  )}
                >
                  <span className={cn("w-4 h-4 rounded-full flex-shrink-0 shadow", t.color)} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>

            {/* Crucial Note About WhatsApp Green Color Rule */}
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                <span>WhatsApp Brand Integrity Rule</span>
              </div>
              <p className="text-[11px] text-gray-300">
                All WhatsApp buttons, order triggers, and chat widgets are locked to official WhatsApp green (<code className="text-[#25D366] font-mono font-bold">#25D366</code>) across all themes for maximum customer trust and instant brand recognition.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="text-sm font-bold text-white border-b border-[#1F1F21] pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C5A059]" />
              <span>Catalog & Section Display Settings</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
                <div>
                  <div className="font-bold text-white">Show Prices on Website</div>
                  <div className="text-[10px] text-gray-400">Allow visitors to see unit prices for products</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPrices}
                  onChange={e => setConfig(c => ({ ...c, showPrices: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
                <div>
                  <div className="font-bold text-white">Show Stock Status Badges</div>
                  <div className="text-[10px] text-gray-400">Display "In Stock" indicators on product cards</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showStockStatus}
                  onChange={e => setConfig(c => ({ ...c, showStockStatus: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
                <div>
                  <div className="font-bold text-white">Enable Direct WhatsApp Ordering</div>
                  <div className="text-[10px] text-gray-400">Adds 1-click WhatsApp order buttons to product cards</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableWhatsAppOrder}
                  onChange={e => setConfig(c => ({ ...c, enableWhatsAppOrder: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
                <div>
                  <div className="font-bold text-white">Display Services Section</div>
                  <div className="text-[10px] text-gray-400">Show customized service cards on storefront</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showServices}
                  onChange={e => setConfig(c => ({ ...c, showServices: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
                <div>
                  <div className="font-bold text-white">Display Photo Gallery</div>
                  <div className="text-[10px] text-gray-400">Show gallery grid with lightbox modal on storefront</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showGallery}
                  onChange={e => setConfig(c => ({ ...c, showGallery: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
                <div>
                  <div className="font-bold text-white">Display Promotions & Deals</div>
                  <div className="text-[10px] text-gray-400">Show special offers cards and discount coupons</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPromotions}
                  onChange={e => setConfig(c => ({ ...c, showPromotions: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. LIVE INTERACTIVE PREVIEW */}
      {/* ========================================================================= */}
      <div className="space-y-4 bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1F1F21] pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#C5A059]" />
            <span>Interactive Live Storefront Preview</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewDevice('DESKTOP')}
              className={cn(
                "p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                previewDevice === 'DESKTOP' ? "bg-[#C5A059] text-[#0A0A0B] shadow" : "text-gray-400 hover:text-white"
              )}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop View</span>
            </button>
            <button
              onClick={() => setPreviewDevice('MOBILE')}
              className={cn(
                "p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                previewDevice === 'MOBILE' ? "bg-[#C5A059] text-[#0A0A0B] shadow" : "text-gray-400 hover:text-white"
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
    </div>
  );
}

// =========================================================================
// Subcomponent for Full Website Interactive Preview
// =========================================================================
function WebsitePreviewRender({ config, items, businessName, isMobileView }: { config: WebsiteConfig; items: any[]; businessName: string; isMobileView?: boolean }) {
  const brand = businessName || 'My Business';
  const publishedItems = items.filter(item => item.showInWebsite === true);
  const themeStyles = getThemeStyles(config.themeColor);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <div className="bg-[#0A0A0B] text-gray-100 font-sans rounded-xl overflow-hidden shadow-2xl border border-[#1F1F21]">
      {/* Top Announcement Bar (Marquee Ticker) */}
      {config.showAnnouncement && config.announcementText && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black py-1.5 shadow-inner overflow-hidden select-none border-b border-amber-700/30">
          <div className="flex w-max animate-marquee">
            <div className="flex items-center gap-6 px-3 text-[10px] font-black tracking-wide uppercase">
              <span className="inline-flex items-center gap-1.5">
                <Megaphone className="w-3 h-3 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Megaphone className="w-3 h-3 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center gap-6 px-3 text-[10px] font-black tracking-wide uppercase" aria-hidden="true">
              <span className="inline-flex items-center gap-1.5">
                <Megaphone className="w-3 h-3 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Megaphone className="w-3 h-3 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
            </div>
          </div>
        </div>
      )}

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

        {/* Header WhatsApp Button - ALWAYS GREEN */}
        <a
          href={`https://wa.me/${config.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 font-bold text-[11px] rounded-xl flex items-center gap-1.5 flex-shrink-0 shadow-lg bg-[#25D366] hover:bg-[#20bd5a] text-white border border-[#25D366]/40 transition-all"
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
            {/* CTA Button - ALWAYS GREEN FOR WHATSAPP */}
            <a
              href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(brand)},%20I%20want%20to%20place%20an%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 font-extrabold text-xs rounded-xl shadow-lg bg-[#25D366] hover:bg-[#20bd5a] text-white border border-[#25D366]/40 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{config.heroCtaText}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Special Offers Section */}
      {config.showPromotions && config.promotions && config.promotions.filter(p => p.active).length > 0 && (
        <div className="p-4 sm:p-6 bg-[#131315] border-b border-[#1F1F21] space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-serif">Special Deals & Offers</h3>
          </div>
          <div className={cn("grid gap-3", isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
            {config.promotions.filter(p => p.active).map(promo => (
              <div key={promo.id} className="p-3.5 rounded-xl bg-[#1A1A1C] border border-[#2D2D30] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 uppercase">
                    {promo.badge}
                  </span>
                  <h4 className="font-bold text-white text-xs mt-1">{promo.title}</h4>
                  <p className="text-[11px] text-gray-400">{promo.description}</p>
                </div>
                {promo.couponCode && (
                  <span className="px-2 py-1 rounded bg-[#252528] text-gray-200 border border-dashed border-[#3A3A3E] font-mono text-[10px] font-bold whitespace-nowrap">
                    {promo.couponCode}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {config.showServices && config.services && config.services.length > 0 && (
        <div className="p-4 sm:p-6 border-b border-[#1F1F21] space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-serif">Our Services & Capabilities</h3>
          </div>
          <div className={cn("grid gap-3", isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
            {config.services.map(srv => (
              <div key={srv.id} className="p-3.5 rounded-xl bg-[#131315] border border-[#1F1F21] space-y-2 hover:border-gray-600 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{srv.icon || '✨'}</span>
                  {srv.popular && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Popular
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white text-xs">{srv.title}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-2">{srv.description}</p>
                {srv.price && (
                  <div className="text-[10px] font-bold text-[#C5A059] pt-1">{srv.price}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Catalog Grid */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-white font-serif">Featured Catalog ({publishedItems.length})</h3>
          <span className="text-[10px] text-gray-400">Live Inventory Sync</span>
        </div>

        {publishedItems.length > 0 ? (
          <div className={cn("grid gap-3", isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
            {publishedItems.map(item => (
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
                  <div className="text-[10px] text-gray-400 mt-0.5">{getCategoryName(item.category || item.categoryName)} • per {item.unit || 'Pcs'}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1F1F21] gap-1 flex-wrap">
                  {config.showPrices ? (
                    <span className="font-mono font-bold text-white text-sm">₹{Number(item.price || 0).toFixed(2)}</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">Available</span>
                  )}

                  {/* Product WhatsApp Order Button - ALWAYS GREEN */}
                  {config.enableWhatsAppOrder && (
                    <a
                      href={`https://wa.me/${config.whatsapp}?text=Hi,%20I%20want%20to%20order%20${encodeURIComponent(item.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0 bg-[#25D366] hover:bg-[#20bd5a] text-white border border-[#25D366]/40 shadow-sm"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Order</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#131315] border border-[#1F1F21] rounded-xl space-y-2">
            <ShoppingBag className="w-8 h-8 text-gray-600 mx-auto" />
            <div className="text-xs font-bold text-white">No products enabled for website</div>
            <div className="text-[11px] text-gray-500 max-w-xs mx-auto">
              Only products with "Show in Website" enabled in Inventory or Catalog will be displayed to customers.
            </div>
          </div>
        )}
      </div>

      {/* Gallery Showcase Grid */}
      {config.showGallery && config.gallery && config.gallery.length > 0 && (
        <div className="p-4 sm:p-6 bg-[#131315] border-t border-[#1F1F21] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-serif">Photo Gallery</h3>
            </div>
            <span className="text-[10px] text-gray-400">{config.gallery.length} Photos</span>
          </div>

          <div className={cn("grid gap-2", isMobileView ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
            {config.gallery.map(g => (
              <div
                key={g.id}
                onClick={() => setLightboxImage(g.url)}
                className="relative h-24 rounded-lg overflow-hidden cursor-pointer group bg-black border border-[#262629]"
              >
                <img
                  src={g.url}
                  alt={g.caption || 'Store Photo'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
                {g.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 px-1.5 py-0.5 text-[9px] text-white truncate">
                    {g.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img src={lightboxImage} alt="Expanded" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="bg-[#131315] border-t border-[#1F1F21] p-6 text-xs text-gray-400 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs font-serif">{brand}</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">{config.aboutText}</p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {config.socialLinks?.instagram && (
                <a href={config.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#1A1A1C] hover:text-pink-400 transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {config.socialLinks?.facebook && (
                <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#1A1A1C] hover:text-blue-400 transition-colors">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {config.socialLinks?.youtube && (
                <a href={config.socialLinks.youtube} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#1A1A1C] hover:text-red-400 transition-colors">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
              {config.socialLinks?.twitter && (
                <a href={config.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#1A1A1C] hover:text-sky-400 transition-colors">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{config.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{config.phone}</span>
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
