import React, { useState, useEffect } from 'react';
import { 
  Globe, MessageSquare, Phone, MapPin, Clock, Search, ShoppingBag, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Share2, ExternalLink,
  Megaphone, Tag, Wrench, Grid, ZoomIn, X, Star, Users,
  Instagram, Facebook, Youtube, Twitter, ArrowRight, Compass, Shield, Award,
  Heart, Menu, ArrowUpRight, BedDouble, Plane, Check, Send, Mail, Play,
  Zap, Check as CheckIcon, Box, HelpCircle
} from 'lucide-react';
import { cn, getCategoryName } from '../lib/utils';
import { isValidPhone, cleanPhone } from '../utils/validation';
import { 
  WebsiteConfig, HeroSlide, ShowcaseItem, DestinationItem, CuratedPillar, 
  JournalArticle, DEFAULT_WEBSITE_CONFIG 
} from '../types/website';

// Helper to render icon for curated value pillars
const renderPillarIcon = (iconType: string) => {
  switch (iconType) {
    case 'shield': return <Shield className="w-6 h-6" />;
    case 'heart': return <Heart className="w-6 h-6" />;
    case 'compass': return <Compass className="w-6 h-6" />;
    case 'award': return <Award className="w-6 h-6" />;
    case 'star': return <Star className="w-6 h-6" />;
    case 'sparkles': return <Sparkles className="w-6 h-6" />;
    case 'zap': return <Zap className="w-6 h-6" />;
    case 'check': return <CheckIcon className="w-6 h-6" />;
    case 'box': return <Box className="w-6 h-6" />;
    case 'clock': return <Clock className="w-6 h-6" />;
    case 'users': return <Users className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

export default function PublicStorefront() {
  // Dynamic CMS Configuration State
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem('universal_website_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_WEBSITE_CONFIG,
          ...parsed,
          heroSlides: parsed.heroSlides?.length ? parsed.heroSlides : DEFAULT_WEBSITE_CONFIG.heroSlides,
          destinations: parsed.destinations?.length ? parsed.destinations : DEFAULT_WEBSITE_CONFIG.destinations,
          curatedPillars: parsed.curatedPillars?.length ? parsed.curatedPillars : DEFAULT_WEBSITE_CONFIG.curatedPillars,
          journalArticles: parsed.journalArticles?.length ? parsed.journalArticles : DEFAULT_WEBSITE_CONFIG.journalArticles,
        };
      }
    } catch (e) {}
    return DEFAULT_WEBSITE_CONFIG;
  });

  // UI State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [selectedStory, setSelectedStory] = useState<JournalArticle | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    offeringName: '',
    category: '',
    timeline: '',
    notes: ''
  });
  const [inquirySuccessToast, setInquirySuccessToast] = useState(false);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterToast, setNewsletterToast] = useState(false);

  // Products from Store/POS (Integrated Live Catalog)
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [activeCatalogCategory, setActiveCatalogCategory] = useState<string>('ALL');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Load Saved Config & Sync dynamically across tabs
  useEffect(() => {
    const loadDynamicData = () => {
      try {
        const saved = localStorage.getItem('universal_website_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          setConfig(prev => ({
            ...prev,
            ...parsed,
            heroSlides: parsed.heroSlides?.length ? parsed.heroSlides : prev.heroSlides,
            destinations: parsed.destinations?.length ? parsed.destinations : prev.destinations,
            curatedPillars: parsed.curatedPillars?.length ? parsed.curatedPillars : prev.curatedPillars,
            journalArticles: parsed.journalArticles?.length ? parsed.journalArticles : prev.journalArticles,
          }));
        }
      } catch (e) {}

      try {
        const savedItems = localStorage.getItem('universal_items');
        if (savedItems) {
          setStoreItems(JSON.parse(savedItems));
        }
      } catch (e) {}
    };

    loadDynamicData();
    window.addEventListener('storage', loadDynamicData);
    return () => window.removeEventListener('storage', loadDynamicData);
  }, []);

  // Auto Hero Slider Timer
  useEffect(() => {
    if (!config.heroSlides || config.heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % config.heroSlides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [config.heroSlides]);

  // Handle WhatsApp Inquiries
  const handleWhatsAppInquiry = (customText?: string) => {
    const phone = config.whatsapp || config.phone || '9876543210';
    const text = encodeURIComponent(customText || `Hello ${config.brandName}, I would like to inquire about your offerings.`);
    window.open(`https://wa.me/${cleanPhone(phone)}?text=${text}`, '_blank');
  };

  // Handle Inquiry Form Submission
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.phone) {
      alert('Please provide your name and phone number.');
      return;
    }
    setInquirySuccessToast(true);
    setIsInquiryModalOpen(false);
    setInquiryForm({
      name: '',
      phone: '',
      email: '',
      offeringName: '',
      category: '',
      timeline: '',
      notes: ''
    });
    setTimeout(() => setInquirySuccessToast(false), 4000);
  };

  // Open item inquiry
  const openItemInquiry = (item: ShowcaseItem) => {
    setInquiryForm(prev => ({
      ...prev,
      offeringName: item.name,
      category: item.category
    }));
    setSelectedItem(null);
    setIsInquiryModalOpen(true);
  };

  // Handle Newsletter
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setNewsletterToast(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterToast(false), 4000);
  };

  // Categories list from store items
  const catalogCategories = ['ALL', ...Array.from(new Set(storeItems.map(i => getCategoryName(i.category))))];
  const filteredCatalogItems = storeItems.filter(item => {
    const itemCat = getCategoryName(item.category);
    const matchesCat = activeCatalogCategory === 'ALL' || itemCat === activeCatalogCategory;
    const matchesQuery = !catalogSearch.trim() || (item.name && item.name.toLowerCase().includes(catalogSearch.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const activeSlide = config.heroSlides[currentSlide] || config.heroSlides[0] || DEFAULT_WEBSITE_CONFIG.heroSlides[0];

  return (
    <div className="luxora-storefront min-h-screen bg-[#FAF9F6] text-[#121316] font-sans selection:bg-[#C5A059] selection:text-black relative overflow-x-hidden">

      {/* ── TOAST NOTIFICATIONS ── */}
      {inquirySuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#16171A] border border-[#C5A059] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-xl bg-[#C5A059] flex items-center justify-center text-black flex-shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm font-luxury">Inquiry Received!</p>
            <p className="text-xs text-gray-300">Our representative will reach out to you shortly.</p>
          </div>
        </div>
      )}

      {newsletterToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#16171A] border border-emerald-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-black flex-shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Welcome to {config.brandName} Updates</p>
            <p className="text-xs text-gray-300">You are now subscribed to our newsletter dispatch.</p>
          </div>
        </div>
      )}

      {/* ── 1. LUXURY TOP NAVIGATION BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#090A0C]/85 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo on Left */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E2B755] to-[#8C6D2B] p-0.5 shadow-lg shadow-[#C5A059]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div className="leading-tight">
              <span className="font-luxury font-bold text-base sm:text-xl tracking-[0.25em] text-white uppercase block">
                {config.brandName}
              </span>
              <span className="text-[9px] tracking-[0.35em] text-[#C5A059] uppercase font-mono block -mt-0.5">
                {config.brandSubtext || 'ENTERPRISE'}
              </span>
            </div>
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
            {config.showDestinations && <a href="#showcase" className="hover:text-[#C5A059] transition-colors">Offerings</a>}
            {config.showCurated && <a href="#why-us" className="hover:text-[#C5A059] transition-colors">Why Choose Us</a>}
            {config.showCatalog && <a href="#catalog" className="hover:text-[#C5A059] transition-colors">Live Store</a>}
            {config.showJournal && <a href="#insights" className="hover:text-[#C5A059] transition-colors">Insights</a>}
            <a href="#contact" className="hover:text-[#C5A059] transition-colors">Contact</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#C5A059] hover:bg-[#b08d4a] text-black font-bold text-xs tracking-widest uppercase shadow-lg shadow-[#C5A059]/20 transition-all transform active:scale-95"
            >
              Get in Touch
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 text-white hover:text-[#C5A059] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#090A0C] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase text-gray-300">
              {config.showDestinations && (
                <a href="#showcase" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C5A059] py-1 border-b border-white/5">
                  Featured Offerings
                </a>
              )}
              {config.showCurated && (
                <a href="#why-us" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C5A059] py-1 border-b border-white/5">
                  Why Choose Us
                </a>
              )}
              {config.showCatalog && (
                <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C5A059] py-1 border-b border-white/5">
                  Live Store Catalog
                </a>
              )}
              {config.showJournal && (
                <a href="#insights" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C5A059] py-1 border-b border-white/5">
                  News & Insights
                </a>
              )}
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C5A059] py-1">
                Contact & Location
              </a>
            </nav>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsInquiryModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#C5A059] text-black font-bold text-xs uppercase tracking-widest text-center"
              >
                Get in Touch / Inquire
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO SLIDESHOW SECTION (DYNAMIC CMS) ── */}
      {config.showHero && (
        <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center bg-[#060709] text-white pt-20 overflow-hidden">
          
          {/* Background Image Carousel with Cinematic Ken Burns & Gradient Overlays */}
          {config.heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              <img
                src={slide.bgUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-black/40" />
            </div>
          ))}

          {/* Hero Content Grid */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-6 max-w-3xl">
              
              {/* Dynamic Kicker */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#E2B755] uppercase">
                  {activeSlide.kicker || config.brandTagline}
                </span>
              </div>

              {/* Dynamic Headline */}
              <h1 className="font-luxury text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
                <span>{activeSlide.title} </span>
                <span className="font-serif italic font-normal text-[#E2B755] block sm:inline">
                  {activeSlide.titleHighlight}
                </span>
              </h1>

              {/* Dynamic Subtitle */}
              <p className="text-base sm:text-lg text-gray-300 font-light max-w-2xl leading-relaxed">
                {activeSlide.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => {
                    const el = document.getElementById('showcase');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#C5A059] hover:bg-[#b08d4a] text-black font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl shadow-[#C5A059]/25 transition-all transform active:scale-95 group"
                >
                  <span>{activeSlide.ctaText || 'EXPLORE OFFERINGS'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Slide Counter Stepper */}
              {config.heroSlides.length > 1 && (
                <div className="flex items-center gap-4 pt-6">
                  <span className="text-xs font-mono font-bold text-white tracking-widest">
                    {String(currentSlide + 1).padStart(2, '0')}
                  </span>
                  <div className="w-20 h-0.5 bg-white/20 relative overflow-hidden rounded-full">
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-[#C5A059] transition-all duration-500"
                      style={{ width: `${((currentSlide + 1) / config.heroSlides.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    {String(config.heroSlides.length).padStart(2, '0')}
                  </span>

                  <div className="flex items-center gap-1.5 ml-4">
                    {config.heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          i === currentSlide ? "bg-[#C5A059] w-5" : "bg-white/30 hover:bg-white/60"
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Floating Glass Highlight Card */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="bg-[#121316]/75 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-3 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#C5A059] uppercase">
                    {activeSlide.featureBadge || 'SIGNATURE HIGHLIGHT'}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                </div>
                <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
                  {activeSlide.featureDesc}
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById('showcase');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#C5A059] tracking-widest uppercase pt-2 group transition-colors"
                >
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#C5A059]" />
                </button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── 3. FEATURED SHOWCASE & OFFERINGS SECTION ── */}
      {config.showDestinations && (
        <section id="showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#C5A059] uppercase block">
                {config.destinationsKicker || 'FEATURED OFFERINGS'}
              </span>
              <h2 className="font-luxury text-3xl sm:text-5xl font-bold text-[#111827] tracking-tight">
                {config.destinationsTitle || 'Signature Products & Premier Services'}
              </h2>
            </div>

            <div className="max-w-md space-y-3">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {config.destinationsSubtitle || 'Explore our handpicked selection of top-tier offerings, engineered with precision and designed to deliver outstanding results.'}
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.destinations.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-2xl hover:border-[#C5A059]/40 transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Container */}
                  <div className="relative h-64 overflow-hidden bg-gray-900">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      {item.badge && (
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-black shadow-md">
                          {item.badge}
                        </span>
                      )}
                      <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-[#C5A059] group-hover:text-black transition-colors ml-auto">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Bottom Info Overlay on Image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#E2B755] uppercase block mb-0.5">
                        {item.category}
                      </span>
                      <h3 className="font-luxury text-xl font-bold leading-tight">
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-5 space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {item.subtitle || item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Price & Duration / Unit */}
                <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase block font-semibold">
                      {item.duration || 'Offering'}
                    </span>
                    <span className="font-serif text-lg font-bold text-[#111827]">
                      {item.priceFrom}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openItemInquiry(item);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-[#C5A059] hover:text-black text-gray-800 text-[11px] font-bold tracking-wider uppercase transition-colors"
                  >
                    Inquire
                  </button>
                </div>

              </div>
            ))}
          </div>

        </section>
      )}

      {/* ── 4. WHY CHOOSE US (CORE VALUE PILLARS) ── */}
      {config.showCurated && (
        <section id="why-us" className="bg-[#0A0B0E] text-white py-20 sm:py-28 relative overflow-hidden">
          
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#C5A059] uppercase block">
                {config.curatedKicker || 'WHY CHOOSE US'}
              </span>
              <h2 className="font-luxury text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                <span>{config.curatedTitle} </span>
                <span className="font-serif italic font-normal text-[#E2B755]">
                  {config.curatedTitleHighlight}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                {config.curatedSubtitle}
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.curatedPillars.map((pillar, idx) => (
                <div
                  key={pillar.id}
                  className="bg-[#141519] border border-white/10 hover:border-[#C5A059]/60 rounded-3xl p-6 sm:p-7 space-y-4 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/25 text-[#C5A059] flex items-center justify-center group-hover:bg-[#C5A059] group-hover:text-black transition-colors">
                    {renderPillarIcon(pillar.iconType)}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">
                      PILLAR 0{idx + 1}
                    </span>
                    <h3 className="font-luxury font-bold text-lg text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Inquire Banner */}
            <div className="mt-14 text-center">
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C5A059] hover:bg-[#b08d4a] text-black font-bold text-xs tracking-widest uppercase shadow-lg shadow-[#C5A059]/20 transition-all transform active:scale-95"
              >
                <span>{config.curatedCtaText || 'Get in Touch with Our Team'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ── 5. LIVE POS CATALOG STOREFRONT ── */}
      {config.showCatalog && storeItems.length > 0 && (
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#C5A059] uppercase block">
                {config.catalogKicker || 'LIVE STORE & INVENTORY'}
              </span>
              <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mt-1">
                {config.catalogTitle || 'Direct Catalog & Real-Time Ordering'}
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products & items..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#111827] outline-none focus:border-[#C5A059] shadow-sm"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {catalogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCatalogCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all border",
                  activeCatalogCategory === cat
                    ? "bg-[#C5A059] text-black border-[#C5A059] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* POS Store Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredCatalogItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="h-36 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-gray-300" />
                    )}
                    {item.stock !== undefined && (
                      <span className={cn(
                        "absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold",
                        item.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      )}>
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                      {getCategoryName(item.category)}
                    </span>
                    <h4 className="font-bold text-sm text-[#111827] line-clamp-1">
                      {item.name}
                    </h4>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#111827]">
                    ${Number(item.price || 0).toLocaleString()}
                  </span>

                  <button
                    onClick={() => handleWhatsAppInquiry(`Hello, I would like to order "${item.name}" (Price: $${item.price}).`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold tracking-wider uppercase transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* ── 6. NEWS & INSIGHTS ARTICLES SECTION ── */}
      {config.showJournal && (
        <section id="insights" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-gray-200">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#C5A059] uppercase block">
                {config.journalKicker || 'NEWS & INSIGHTS'}
              </span>
              <h2 className="font-luxury text-3xl sm:text-5xl font-bold text-[#111827] tracking-tight">
                {config.journalTitle || 'Latest Updates, Articles & Stories'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md leading-relaxed font-normal">
              {config.journalSubtitle || 'Stay informed with industry analysis, practical advice, product announcements, and company news.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.journalArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => setSelectedStory(article)}
                className="group cursor-pointer space-y-4"
              >
                <div className="relative h-64 rounded-3xl overflow-hidden bg-gray-900 border border-gray-200/80 shadow-sm">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-black">
                    {article.category}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-luxury font-bold text-xl text-[#111827] group-hover:text-[#C5A059] transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C5A059] uppercase tracking-wider pt-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>

        </section>
      )}

      {/* ── 7. FOOTER & CONTACT SECTION ── */}
      <footer id="contact" className="bg-[#0A0B0E] text-white pt-20 pb-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Newsletter Bar */}
          {config.showNewsletter && (
            <div className="bg-[#141519] border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-xl text-center lg:text-left">
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#C5A059] uppercase block">
                  NEWSLETTER DISPATCH
                </span>
                <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white">
                  {config.newsletterTitle || 'Stay Updated with Latest Releases'}
                </h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  {config.newsletterSubtitle || 'Subscribe to receive announcements, exclusive promotions, and seasonal specials.'}
                </p>
              </div>

              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full sm:w-72 px-4 py-3 bg-[#1A1A1E] border border-white/15 rounded-full text-xs text-white placeholder-gray-500 outline-none focus:border-[#C5A059]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C5A059] hover:bg-[#b08d4a] text-black font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}

          {/* Footer 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Col 1: Brand Story */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E2B755] to-[#8C6D2B] p-0.5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                  <span className="font-luxury font-bold text-lg tracking-[0.2em] text-white uppercase block">
                    {config.brandName}
                  </span>
                  <span className="text-[9px] tracking-[0.35em] text-[#C5A059] uppercase font-mono block">
                    {config.brandSubtext || 'ENTERPRISE'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                {config.brandTagline || 'Delivering world-class products, expert services, and bespoke solutions.'}
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-[#C5A059] uppercase">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs text-gray-400 font-medium">
                {config.showDestinations && <li><a href="#showcase" className="hover:text-white transition-colors">Featured Offerings</a></li>}
                {config.showCurated && <li><a href="#why-us" className="hover:text-white transition-colors">Why Choose Us</a></li>}
                {config.showCatalog && <li><a href="#catalog" className="hover:text-white transition-colors">Live Store Catalog</a></li>}
                {config.showJournal && <li><a href="#insights" className="hover:text-white transition-colors">News & Insights</a></li>}
              </ul>
            </div>

            {/* Col 3: Contact & Concierge */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-[#C5A059] uppercase">
                Contact & Support
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{config.phone || '+1 (555) 019-2834'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{config.email || 'contact@apexenterprise.com'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{config.address || 'Main Commercial Hub, City Center'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{config.workingHours || 'Mon - Sat: 9:00 AM - 8:00 PM'}</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Direct WhatsApp Chat */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-[#C5A059] uppercase">
                Instant WhatsApp Chat
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Connect directly with our team for instant quotes, inquiries, and orders.
              </p>
              <button
                onClick={() => handleWhatsAppInquiry()}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

          </div>

          {/* Copyright Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} {config.brandName}. {config.copyrightText || 'All rights reserved.'}</p>
            <p className="text-[11px] font-mono text-gray-600">Powered by Universal Multi-Business CMS Platform</p>
          </div>

        </div>
      </footer>

      {/* ── 8. FLOATING WHATSAPP BUTTON ── */}
      {config.showWhatsAppWidget && (
        <button
          onClick={() => handleWhatsAppInquiry()}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all group"
          title="Direct WhatsApp Inquiry"
        >
          <MessageSquare className="w-7 h-7" />
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
            Chat with Us
          </span>
        </button>
      )}

      {/* ── 9. OFFERING / SHOWCASE DETAIL MODAL ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-2xl w-full text-white overflow-hidden shadow-2xl my-8">
            <div className="relative h-64 sm:h-72 bg-gray-900">
              <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-transparent to-black/40" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full bg-[#C5A059] text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedItem.category}
                </span>
                <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
                  {selectedItem.name}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Rate / Price</span>
                  <p className="font-serif text-2xl font-bold text-[#E2B755]">{selectedItem.priceFrom}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Format</span>
                  <p className="text-xs font-bold text-white">{selectedItem.duration || 'Complete'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-[#C5A059] tracking-wider mb-2">
                  Overview
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              {selectedItem.highlights?.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-[#C5A059] tracking-wider mb-2">
                    Key Features & Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedItem.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 text-xs text-gray-200">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.inclusions?.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-[#C5A059] tracking-wider mb-2">
                    Included Benefits
                  </h4>
                  <div className="space-y-1.5">
                    {selectedItem.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => openItemInquiry(selectedItem)}
                  className="w-full sm:flex-1 py-3.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08d4a] text-black font-bold text-xs uppercase tracking-widest transition-all text-center"
                >
                  Inquire / Book Now
                </button>
                <button
                  onClick={() => handleWhatsAppInquiry(`Hello, I would like to inquire about "${selectedItem.name}" (${selectedItem.priceFrom}).`)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. ARTICLE / STORY READER MODAL ── */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-2xl w-full text-white overflow-hidden shadow-2xl my-8">
            <div className="relative h-64 bg-gray-900">
              <img src={selectedStory.imageUrl} alt={selectedStory.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-transparent to-black/40" />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full bg-[#C5A059] text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedStory.category}
                </span>
                <h3 className="font-luxury text-xl sm:text-2xl font-bold text-white mt-1">
                  {selectedStory.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-3">
                <span>By {selectedStory.author}</span>
                <span>{selectedStory.date} • {selectedStory.readTime}</span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                {selectedStory.content?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedStory(null)}
                  className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. GENERAL INQUIRY / GET IN TOUCH MODAL ── */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-lg w-full text-white p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsInquiryModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C5A059] uppercase block">
                DIRECT INQUIRY
              </span>
              <h3 className="font-luxury text-2xl font-bold text-white">
                Get in Touch with {config.brandName}
              </h3>
              <p className="text-xs text-gray-400 font-light">
                Fill out the details below and our team will get back to you promptly.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={inquiryForm.name}
                  onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-white/15 rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={inquiryForm.phone}
                    onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-white/15 rounded-xl text-white outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inquiryForm.email}
                    onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. john@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-white/15 rounded-xl text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {inquiryForm.offeringName && (
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Interested Offering / Product</label>
                  <input
                    type="text"
                    disabled
                    value={inquiryForm.offeringName}
                    className="w-full px-3.5 py-2.5 bg-[#111215] border border-white/10 rounded-xl text-[#C5A059] font-bold outline-none cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-400 font-bold mb-1">Your Message / Requirements</label>
                <textarea
                  rows={3}
                  value={inquiryForm.notes}
                  onChange={e => setInquiryForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Tell us about your requirements, questions, or desired timeline..."
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-white/15 rounded-xl text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-[#C5A059] hover:bg-[#b08d4a] text-black font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Send Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppInquiry(`Inquiry from ${inquiryForm.name || 'Customer'}: ${inquiryForm.notes || 'Please provide more details.'}`)}
                  className="px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
