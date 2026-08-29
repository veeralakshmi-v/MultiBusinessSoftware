import React, { useState, useEffect } from 'react';
import { 
  Globe, MessageSquare, Phone, MapPin, Clock, Search, ShoppingBag, 
  Sparkles, CheckCircle2, ChevronRight, Share2, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WebsiteConfig } from './WebsiteBuilder';

export default function PublicStorefront() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [items, setItems] = useState<any[]>([]);

  // Load Website Config from LocalStorage
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem('universal_website_config');
      if (saved) return JSON.parse(saved);
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
      themeColor: 'gold',
      layoutStyle: 'modern',
      showPrices: true,
      showStockStatus: true,
      enableWhatsAppOrder: true,
    };
  });

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

  const categories = Array.from(new Set(items.map(i => i.category || 'General')));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          (item.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 font-sans selection:bg-[#C5A059] selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#131315]/90 backdrop-blur-md border-b border-[#1F1F21] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C5A059] flex items-center justify-center font-bold text-[#0A0A0B] text-lg shadow-lg">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-white tracking-tight leading-tight">{businessName}</h1>
            <span className="text-[10px] text-[#C5A059] font-semibold tracking-wider uppercase block">Official Online Catalog</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {config.phone && (
            <a
              href={`tel:${config.phone}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1C] hover:bg-[#252528] text-gray-300 border border-[#2D2D30] text-xs font-bold rounded-xl transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Call Us</span>
            </a>
          )}

          {config.whatsapp && (
            <a
              href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20have%20an%20inquiry`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Order</span>
            </a>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-black/95 via-black/75 to-transparent py-16 sm:py-24 px-6 sm:px-12 border-b border-[#1F1F21] overflow-hidden">
        <img
          src={config.heroBannerUrl}
          alt="Business Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Direct Store Order
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            {config.heroTitle}
          </h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {config.heroSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-extrabold text-xs rounded-xl shadow-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{config.heroCtaText}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Catalog Search & Category Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl shadow-xl">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all",
                selectedCategory === 'ALL'
                  ? "bg-[#C5A059] text-[#0A0A0B] shadow"
                  : "bg-[#1A1A1C] text-gray-400 hover:text-white border border-[#262629]"
              )}
            >
              All Items ({items.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-[#C5A059] text-[#0A0A0B] shadow"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                <div className="text-xs text-gray-500">{item.category || 'General'} • per {item.unit || 'Pcs'}</div>
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

                {config.enableWhatsAppOrder && (
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20order%20${encodeURIComponent(item.name)}%20(Price:%20₹${item.price})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
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
              <div className="font-bold text-white text-sm">No items found</div>
              <div className="text-xs text-gray-500">Try adjusting your search query or category filter</div>
            </div>
          )}
        </div>
      </div>

      {/* Store Footer */}
      <footer className="bg-[#131315] border-t border-[#1F1F21] py-12 px-6 sm:px-12 mt-12 text-xs text-gray-400 space-y-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-base text-white">{businessName}</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">{config.aboutText}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact & Address</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <span>{config.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059]" />
                <span>{config.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Store Hours</h4>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              <span>{config.workingHours}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#1F1F21] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px]">
          <div>© {new Date().getFullYear()} {businessName}. All rights reserved.</div>
          <div className="text-gray-500">Powered by Universal Billing System</div>
        </div>
      </footer>
    </div>
  );
}
