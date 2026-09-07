import React, { useState, useEffect } from 'react';
import { 
  Globe, MessageSquare, Phone, MapPin, Clock, Search, ShoppingBag, 
  Sparkles, CheckCircle2, ChevronRight, Share2, ExternalLink,
  Megaphone, Tag, Wrench, Grid, ZoomIn, X, Star,
  Instagram, Facebook, Youtube, Twitter, ArrowRight
} from 'lucide-react';
import { cn, getCategoryName } from '../lib/utils';
import { WebsiteConfig, getThemeStyles, ServiceItem, GalleryItem, PromotionOffer } from './WebsiteBuilder';

export default function PublicStorefront() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [items, setItems] = useState<any[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Load Website Config from LocalStorage
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem('universal_website_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          published: parsed.published ?? true,
          heroTitle: parsed.heroTitle || 'Welcome to Our Official Business Store',
          heroSubtitle: parsed.heroSubtitle || 'Browse our complete catalog of products & order directly on WhatsApp',
          heroCtaText: parsed.heroCtaText || 'Order via WhatsApp',
          heroBannerUrl: parsed.heroBannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          aboutText: parsed.aboutText || 'We provide top quality items, best prices, and friendly customer support. Browse our live product catalog and get direct home delivery!',
          phone: parsed.phone || '9876543210',
          whatsapp: parsed.whatsapp || '9876543210',
          email: parsed.email || 'contact@mybusiness.com',
          address: parsed.address || 'Main Market Road, City Center',
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
      heroTitle: 'Welcome to Our Official Business Store',
      heroSubtitle: 'Browse our complete catalog of products & order directly on WhatsApp',
      heroCtaText: 'Order via WhatsApp',
      heroBannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      aboutText: 'We provide top quality items, best prices, and friendly customer support. Browse our live product catalog and get direct home delivery!',
      phone: '9876543210',
      whatsapp: '9876543210',
      email: 'contact@mybusiness.com',
      address: 'Main Market Road, City Center',
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

  const themeStyles = getThemeStyles(config.themeColor);

  // Load Business Profile
  const businessName = (() => {
    try {
      const p = localStorage.getItem('business_profile');
      if (p) return JSON.parse(p).businessName || 'My Business';
    } catch (e) {}
    return 'My Business';
  })();

  // Load Items
  useEffect(() => {
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Filter only items explicitly published to website
  const websiteItems = items.filter(item => item.showInWebsite === true);

  const categories = Array.from(new Set(websiteItems.map(i => getCategoryName(i.category || i.categoryName || i.category)))).filter(Boolean);

  const filteredItems = websiteItems.filter(item => {
    const catName = getCategoryName(item.category || item.categoryName);
    const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          catName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || catName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 font-sans selection:bg-[#C5A059] selection:text-black relative">
      {/* 1. TOP ANNOUNCEMENT BAR (MARQUEE TICKER) */}
      {config.showAnnouncement && config.announcementText && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black py-2 shadow-inner sticky top-0 z-50 overflow-hidden select-none border-b border-amber-700/30">
          <div className="flex w-max animate-marquee">
            <div className="flex items-center gap-8 px-4 text-xs font-black tracking-wide uppercase">
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center gap-8 px-4 text-xs font-black tracking-wide uppercase" aria-hidden="true">
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{config.announcementText}</span>
              </span>
              <span className="text-black/40 font-bold">•</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP NAVBAR */}
      <header className={cn(
        "z-40 bg-[#131315]/95 backdrop-blur-md border-b border-[#1F1F21] px-4 sm:px-8 py-3.5 flex items-center justify-between",
        config.showAnnouncement && config.announcementText ? "sticky top-8" : "sticky top-0"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg", themeStyles.brandBg)}>
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-white tracking-tight leading-tight">{businessName}</h1>
            <span className={cn("text-[10px] font-semibold tracking-wider uppercase block", themeStyles.brandText)}>Official Online Store</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {config.phone && (
            <a
              href={`tel:${config.phone}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1C] hover:bg-[#252528] text-gray-300 border border-[#2D2D30] text-xs font-bold rounded-xl transition-all shadow"
            >
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>Call Helpline</span>
            </a>
          )}

          {/* Header WhatsApp Button - ALWAYS GREEN */}
          {config.whatsapp && (
            <a
              href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20have%20an%20inquiry`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-xl shadow-lg bg-[#25D366] hover:bg-[#20bd5a] text-white border border-[#25D366]/40 transition-all shadow-[#25D366]/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Order</span>
            </a>
          )}
        </div>
      </header>

      {/* 3. HERO BANNER */}
      <div className="relative bg-black py-16 sm:py-24 px-6 sm:px-12 border-b border-[#1F1F21] overflow-hidden">
        <img
          src={config.heroBannerUrl}
          alt="Business Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-45 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/50" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border", themeStyles.brandPill)}>
            <Sparkles className="w-3.5 h-3.5" /> Direct Store Order & Fast Delivery
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white !text-white tracking-tight leading-tight drop-shadow-xl">
            {config.heroTitle}
          </h2>
          <p className="text-sm sm:text-base text-gray-100 !text-gray-100 font-medium leading-relaxed drop-shadow-md">
            {config.heroSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Hero CTA Button - ALWAYS GREEN FOR WHATSAPP */}
            <a
              href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-extrabold text-xs rounded-xl shadow-xl bg-[#25D366] hover:bg-[#20bd5a] text-white border border-[#25D366]/40 transition-all shadow-[#25D366]/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{config.heroCtaText}</span>
            </a>

            {config.phone && (
              <a
                href={`tel:${config.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl bg-[#1A1A1C]/80 hover:bg-[#252528] text-gray-200 border border-[#2D2D30] backdrop-blur-sm transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call {config.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 4. PROMOTIONS & SPECIAL OFFERS SECTION */}
      {config.showPromotions && config.promotions && config.promotions.filter(p => p.active).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-[#C5A059]" />
            <h3 className="text-lg font-bold text-white font-serif tracking-tight">Special Deals & Offers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.promotions.filter(p => p.active).map(promo => (
              <div key={promo.id} className="bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 p-5 rounded-2xl space-y-3 relative group transition-all shadow-lg flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 uppercase tracking-wider">
                      {promo.badge}
                    </span>
                    {promo.couponCode && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#1A1A1C] text-gray-200 border border-dashed border-[#3A3A3E] font-mono text-xs font-bold">
                        {promo.couponCode}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">{promo.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{promo.description}</p>
                </div>

                <div className="pt-2 border-t border-[#1F1F21]">
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20claim%20the%20deal:%20${encodeURIComponent(promo.title)}%20(Code:%20${promo.couponCode || 'N/A'})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Claim Deal on WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. SERVICES & CAPABILITIES SECTION */}
      {config.showServices && config.services && config.services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-[#C5A059]" />
            <h3 className="text-lg font-bold text-white font-serif tracking-tight">Our Services & Solutions</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.services.map(service => (
              <div key={service.id} className="bg-[#131315] border border-[#1F1F21] hover:border-gray-600 p-5 rounded-2xl space-y-3 transition-all group flex flex-col justify-between shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl p-2 bg-[#1A1A1C] rounded-xl border border-[#2D2D30] inline-block">{service.icon || '✨'}</span>
                    {service.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Popular
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#C5A059] transition-colors">{service.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{service.description}</p>
                </div>

                {service.price && (
                  <div className="pt-3 border-t border-[#1F1F21] flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Pricing:</span>
                    <span className="font-bold text-[#C5A059]">{service.price}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. CATALOG SEARCH & PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl shadow-xl">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all",
                selectedCategory === 'ALL'
                  ? themeStyles.activeTab
                  : "bg-[#1A1A1C] text-gray-400 hover:text-white border border-[#262629]"
              )}
            >
              All Products ({websiteItems.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? themeStyles.activeTab
                    : "bg-[#1A1A1C] text-gray-400 hover:text-white border border-[#262629]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 p-5 rounded-2xl space-y-4 flex flex-col justify-between transition-all group shadow-lg">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm group-hover:text-[#C5A059] transition-colors">{item.name}</h3>
                  {config.showStockStatus && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                      In Stock
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{getCategoryName(item.category || item.categoryName)} • per {item.unit || 'Pcs'}</div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1F1F21]">
                {config.showPrices ? (
                  <div>
                    <span className="text-[10px] text-gray-500 block">Price</span>
                    <span className="font-mono font-bold text-white text-base">₹{Number(item.price || 0).toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Available</span>
                )}

                {/* Product WhatsApp Order Button - ALWAYS GREEN */}
                {config.enableWhatsAppOrder && (
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20order%20${encodeURIComponent(item.name)}%20(Price:%20₹${item.price})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-[#25D366]/20 border border-[#25D366]/40"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Order</span>
                  </a>
                )}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-2">
              <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto" />
              <div className="font-bold text-white text-sm">
                {websiteItems.length === 0 ? 'No products published to website yet' : 'No items found'}
              </div>
              <div className="text-xs text-gray-500 max-w-md mx-auto">
                {websiteItems.length === 0
                  ? 'To make products visible here, check the "Show in Website" box when adding or editing products in the Inventory or Catalog.'
                  : 'Try adjusting your search query or category filter.'}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. PHOTO GALLERY & LIGHTBOX SECTION */}
      {config.showGallery && config.gallery && config.gallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#C5A059]" />
              <h3 className="text-lg font-bold text-white font-serif tracking-tight">Store Photo Gallery</h3>
            </div>
            <span className="text-xs text-gray-400">{config.gallery.length} Photos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {config.gallery.map((g, idx) => (
              <div
                key={g.id}
                onClick={() => setLightboxImage(g.url)}
                className="relative h-44 rounded-2xl overflow-hidden cursor-pointer group bg-black border border-[#262629] shadow-lg"
              >
                <img
                  src={g.url}
                  alt={g.caption || `Gallery ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                  <ZoomIn className="w-6 h-6 text-white mb-1 drop-shadow" />
                  <span className="text-xs font-bold text-white drop-shadow">Click to Expand</span>
                </div>
                {g.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-xs text-white font-medium truncate">
                    {g.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full-Screen Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={lightboxImage} alt="Expanded Preview" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-[#2D2D30]" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-4 -right-4 p-2.5 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 8. STORE FOOTER */}
      <footer className="bg-[#131315] border-t border-[#1F1F21] py-14 px-6 sm:px-12 mt-12 text-xs text-gray-400 space-y-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <h3 className="font-serif font-bold text-lg text-white">{businessName}</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md">{config.aboutText}</p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {config.socialLinks?.instagram && (
                <a href={config.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#1A1A1C] text-gray-300 hover:text-pink-400 border border-[#262629] transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {config.socialLinks?.facebook && (
                <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#1A1A1C] text-gray-300 hover:text-blue-400 border border-[#262629] transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {config.socialLinks?.youtube && (
                <a href={config.socialLinks.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#1A1A1C] text-gray-300 hover:text-red-400 border border-[#262629] transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {config.socialLinks?.twitter && (
                <a href={config.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#1A1A1C] text-gray-300 hover:text-sky-400 border border-[#262629] transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact & Location</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <span>{config.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>{config.phone}</span>
              </div>
              {config.email && (
                <div className="flex items-center gap-2">
                  <span className="text-[#C5A059]">✉</span>
                  <span>{config.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Opening Hours</h4>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
              <span>{config.workingHours}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#1F1F21] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px]">
          <div>© {new Date().getFullYear()} {businessName}. All rights reserved.</div>
          <div className="text-gray-500">Universal Multi-Business Software • Direct WhatsApp Store</div>
        </div>
      </footer>

      {/* 9. FLOATING WHATSAPP CHAT BUTTON - ALWAYS GREEN */}
      {config.whatsapp && (
        <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <a
            href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20have%20an%20inquiry`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-full shadow-2xl transition-all hover:scale-105 border-2 border-white/20 shadow-[#25D366]/40"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <MessageSquare className="w-5 h-5 fill-current" />
            <span className="hidden sm:inline drop-shadow font-bold">Chat on WhatsApp</span>
          </a>
        </aside>
      )}
    </div>
  );
}
