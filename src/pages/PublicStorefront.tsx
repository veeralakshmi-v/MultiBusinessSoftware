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
import { ThemeEngine } from '../lib/theme/themeEngine';

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

  // Active theme settings
  const [themeConfig, setThemeConfig] = useState(() => ThemeEngine.getThemeConfig());

  // Load Saved Config & Sync dynamically across tabs
  useEffect(() => {
    const loadDynamicData = () => {
      try {
        const savedConfig = localStorage.getItem('universal_website_config');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
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

      const activeTheme = ThemeEngine.getThemeConfig();
      ThemeEngine.applyTheme(activeTheme);
      setThemeConfig(activeTheme);
    };

    loadDynamicData();
    window.addEventListener('storage', loadDynamicData);
    window.addEventListener('theme_changed', loadDynamicData);
    return () => {
      window.removeEventListener('storage', loadDynamicData);
      window.removeEventListener('theme_changed', loadDynamicData);
    };
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
    <div className="public-website min-h-screen bg-theme-primary text-gray-900 font-sans relative overflow-x-hidden transition-colors duration-300 pt-20">

      {/* ── TOAST NOTIFICATIONS ── */}
      {inquirySuccessToast && (
        <div className="fixed top-24 right-6 z-50 bg-white/95 backdrop-blur-xl text-gray-900 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-sm border border-theme-accent/20">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Inquiry Received!</p>
            <p className="text-xs text-theme-muted">Our representative will reach out to you shortly.</p>
          </div>
        </div>
      )}

      {newsletterToast && (
        <div className="fixed top-24 right-6 z-50 bg-white/95 backdrop-blur-xl text-gray-900 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-sm border border-emerald-500/20">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Subscribed Successfully!</p>
            <p className="text-xs text-theme-muted">You are now subscribed to {config.brandName} updates.</p>
          </div>
        </div>
      )}

      {/* ── 1. ULTRA-MODERN FLOATING CAPSULE NAVIGATION BAR ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 max-w-6xl w-[94%] z-50 bg-white/85 backdrop-blur-2xl rounded-full shadow-2xl shadow-black/5 ring-1 ring-white/40 px-5 sm:px-7 py-3.5 flex items-center justify-between transition-all duration-300">
        
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3 group min-w-0">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="w-9 h-9 rounded-full object-contain bg-white shadow-sm flex-shrink-0 ring-2 ring-theme-accent/20" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center font-bold text-base shadow-md flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="leading-tight min-w-0">
            <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight truncate block group-hover:text-[#2563EB] transition-colors">
              {config.brandName}
            </span>
            <span className="text-[10px] text-[#2563EB] font-bold tracking-widest uppercase block -mt-0.5 truncate">
              {config.brandSubtext || config.brandTagline || 'Enterprise Platform'}
            </span>
          </div>
        </a>

        {/* Center Navigation Links (Desktop Capsule Pills) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-gray-900/80 bg-theme-primary/20 p-1.5 rounded-full backdrop-blur-md">
          {config.showHero && (
            <a href="#hero" className="px-4 py-1.5 rounded-full hover:bg-white hover:text-[#2563EB] transition-all shadow-sm">
              Home
            </a>
          )}
          {config.showDestinations && (
            <a href="#showcase" className="px-4 py-1.5 rounded-full hover:bg-white hover:text-[#2563EB] transition-all shadow-sm">
              Offerings
            </a>
          )}
          {config.showCurated && (
            <a href="#why-us" className="px-4 py-1.5 rounded-full hover:bg-white hover:text-[#2563EB] transition-all shadow-sm">
              Why Us
            </a>
          )}
          {config.showCatalog && (
            <a href="#catalog" className="px-4 py-1.5 rounded-full hover:bg-white hover:text-[#2563EB] transition-all shadow-sm">
              Live Store
            </a>
          )}
          {config.showJournal && (
            <a href="#insights" className="px-4 py-1.5 rounded-full hover:bg-white hover:text-[#2563EB] transition-all shadow-sm">
              Insights
            </a>
          )}
          <a href="#contact" className="px-4 py-1.5 rounded-full hover:bg-white hover:text-[#2563EB] transition-all shadow-sm">
            Contact
          </a>
        </nav>

        {/* Right Action CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs tracking-wider uppercase shadow-lg shadow-theme-accent/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Get in Touch</span>
          </button>

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-full bg-theme-primary/20 text-gray-900 hover:text-[#2563EB] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl border border-white/20">
            <nav className="flex flex-col gap-2 text-xs font-bold tracking-wider uppercase text-gray-900">
              {config.showDestinations && (
                <a href="#showcase" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#2563EB] p-2.5 rounded-xl hover:bg-theme-primary/10 transition-colors">
                  Featured Offerings
                </a>
              )}
              {config.showCurated && (
                <a href="#why-us" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#2563EB] p-2.5 rounded-xl hover:bg-theme-primary/10 transition-colors">
                  Why Choose Us
                </a>
              )}
              {config.showCatalog && (
                <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#2563EB] p-2.5 rounded-xl hover:bg-theme-primary/10 transition-colors">
                  Live Store Catalog
                </a>
              )}
              {config.showJournal && (
                <a href="#insights" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#2563EB] p-2.5 rounded-xl hover:bg-theme-primary/10 transition-colors">
                  News & Insights
                </a>
              )}
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#2563EB] p-2.5 rounded-xl hover:bg-theme-primary/10 transition-colors">
                Contact & Support
              </a>
            </nav>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsInquiryModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs uppercase tracking-wider text-center shadow-lg"
              >
                Get in Touch / Inquire
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. NEXT-GEN HERO BANNER WITH AMBIENT GLOW & TRUST PROOF ── */}
      {config.showHero && config.heroSlides && config.heroSlides.length > 0 && (
        <section id="hero" className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
          
          {/* Ambient Glowing Background Mesh Halos */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-theme-accent/20 via-theme-primary/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Hero Text & CTAs */}
              <div className="lg:col-span-7 space-y-7 text-left">
                
                {/* Dynamic Kicker Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme-accent/10 backdrop-blur-md text-[#2563EB] text-xs font-bold tracking-wider uppercase border border-theme-accent/20 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
                  <span>{activeSlide?.kicker || config.brandTagline || 'Welcome to Our Store'}</span>
                </div>

                {/* Modern Display Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
                  <span>{activeSlide?.title || config.brandName} </span>
                  {activeSlide?.titleHighlight && (
                    <span className="bg-gradient-to-r from-theme-accent via-blue-500 to-theme-accent bg-clip-text text-transparent font-black block sm:inline">
                      {activeSlide.titleHighlight}
                    </span>
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-theme-muted font-normal max-w-2xl leading-relaxed">
                  {activeSlide?.subtitle || 'Explore premium products, services, and seamless digital ordering engineered for exceptional quality.'}
                </p>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById('showcase');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-theme-accent/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{activeSlide?.ctaText || 'Explore Offerings'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleWhatsAppInquiry()}
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </button>
                </div>

                {/* Live Social Proof / Trust Indicators */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-100/10 max-w-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold font-mono text-gray-900">4.9 / 5</span>
                    </div>
                    <p className="text-[10px] text-theme-muted">Verified Client Rating</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold font-mono text-gray-900">100% Quality</span>
                    </div>
                    <p className="text-[10px] text-theme-muted">Enterprise Certified</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[#2563EB]">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold font-mono text-gray-900">Instant Response</span>
                    </div>
                    <p className="text-[10px] text-theme-muted">24/7 Support Desk</p>
                  </div>
                </div>

                {/* Hero Slide Indicator Pills */}
                {config.heroSlides.length > 1 && (
                  <div className="flex items-center gap-2 pt-2">
                    {config.heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          i === currentSlide ? "w-8 bg-[#2563EB] text-white hover:bg-[#1D4ED8]" : "w-2 bg-theme-secondary/20 hover:bg-blue-50"
                        )}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Aspect-Locked Visual Preview Frame */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white aspect-[4/3] group ring-1 ring-white/30">
                  {activeSlide?.bgUrl ? (
                    <img
                      src={activeSlide.bgUrl}
                      alt={activeSlide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-theme-surface via-theme-primary/5 to-theme-accent/10">
                      <div className="w-16 h-16 rounded-3xl bg-theme-accent/15 flex items-center justify-center text-[#2563EB] mb-4 shadow-lg">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h3 className="font-extrabold text-xl text-gray-900">{config.brandName}</h3>
                      <p className="text-xs text-theme-muted mt-1 max-w-xs">{config.brandTagline}</p>
                    </div>
                  )}

                  {activeSlide?.featureBadge && (
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl flex items-center justify-between gap-3 border border-white/20">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-[#2563EB] uppercase block">
                          {activeSlide.featureBadge}
                        </span>
                        <p className="text-xs text-gray-900 font-bold line-clamp-1">
                          {activeSlide.featureDesc}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ── 3. FEATURED OFFERINGS & PRODUCTS SECTION ── */}
      {config.showDestinations && (
        <section id="showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <span className="inline-block text-xs font-bold tracking-widest text-[#2563EB] uppercase bg-theme-accent/10 px-3.5 py-1.5 rounded-full">
                {config.destinationsKicker || 'FEATURED OFFERINGS'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {config.destinationsTitle || 'Signature Products & Premier Services'}
              </h2>
            </div>

            <p className="text-sm text-theme-muted max-w-md font-normal leading-relaxed">
              {config.destinationsSubtitle || 'Explore our handpicked selection of top-tier offerings, engineered for maximum value and performance.'}
            </p>
          </div>

          {/* Cards Grid */}
          {config.destinations && config.destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {config.destinations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group cursor-pointer glass-card rounded-3xl overflow-hidden flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
                >
                  <div>
                    {/* Locked Aspect Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-theme-primary/10">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-theme-secondary/5 text-[#2563EB]">
                          <Box className="w-12 h-12" />
                        </div>
                      )}
                      
                      {/* Top Pill Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        {item.badge ? (
                          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#2563EB] shadow-md">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-md">
                            {item.category || 'Featured'}
                          </span>
                        )}

                        <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md text-gray-900 flex items-center justify-center group-hover:bg-theme-secondary group-hover:text-white transition-colors shadow-md ml-auto">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-6 space-y-2">
                      <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-extrabold text-gray-900 leading-snug group-hover:text-[#2563EB] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                        {item.subtitle || item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Pricing & Action */}
                  <div className="p-6 pt-0 flex items-center justify-between mt-3">
                    <div>
                      {item.priceFrom ? (
                        <span className="text-base font-extrabold text-gray-900 font-mono">
                          {item.priceFrom}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#2563EB]">
                          Available on Request
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openItemInquiry(item);
                      }}
                      className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Inquire</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 rounded-3xl glass-card-static max-w-md mx-auto space-y-3">
              <Box className="w-10 h-10 text-theme-muted mx-auto" />
              <p className="text-sm font-semibold text-gray-900">No Featured Offerings Yet</p>
              <p className="text-xs text-theme-muted">Configure your top products via CMS Builder in Settings.</p>
            </div>
          )}

        </section>
      )}

      {/* ── 4. BENTO BOX GRID: WHY CHOOSE US / VALUE PILLARS ── */}
      {config.showCurated && config.curatedPillars?.length > 0 && (
        <section id="why-us" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header */}
            <div className="max-w-2xl space-y-3">
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#2563EB] bg-theme-accent/10 px-3.5 py-1.5 rounded-full">
                {config.curatedKicker || 'WHY CHOOSE US'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {config.curatedTitle || 'Engineered for Excellence & Customer Satisfaction'}
              </h2>
            </div>

            {/* Bento Grid Layout System */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {config.curatedPillars.map((pillar, idx) => {
                const isLarge = idx === 0;
                return (
                  <div
                    key={pillar.id}
                    className={cn(
                      "p-8 rounded-3xl glass-card flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group",
                      isLarge ? "md:col-span-8 bg-gradient-to-br from-theme-surface via-theme-surface to-theme-accent/5" : "md:col-span-4"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-theme-accent/15 text-[#2563EB] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        {renderPillarIcon(pillar.iconType)}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                          {pillar.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed mt-2">
                          {pillar.desc}
                        </p>
                      </div>

                      {/* Flagship Bento Extra Features Checklist */}
                      {isLarge && (
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-gray-900">
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-theme-primary/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>100% Quality Verified & Tested</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-theme-primary/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Direct Concierge Support</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-theme-primary/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Seamless Digital Billing</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {(pillar as any).highlightBadge && (
                      <span className="inline-block text-[10px] font-bold font-mono tracking-wider text-[#2563EB] bg-theme-accent/10 px-3 py-1 rounded-full w-fit mt-6">
                        {(pillar as any).highlightBadge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ── 5. LIVE STORE & POS CATALOG INTEGRATION ── */}
      {config.showCatalog && (
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          {/* Header & Search Capsule Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-3">
              <span className="inline-block text-xs font-bold tracking-widest text-[#2563EB] uppercase bg-theme-accent/10 px-3.5 py-1.5 rounded-full">
                INTEGRATED POS CATALOG
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Live Store Products
              </h2>
            </div>

            {/* Rounded Pill Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                placeholder="Search live items..."
                className="w-full pl-11 pr-5 py-3 rounded-full glass-card-static text-xs text-gray-900 outline-none focus:ring-2 focus:ring-theme-accent shadow-md transition-all"
              />
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {catalogCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCatalogCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  activeCatalogCategory === cat
                    ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-lg shadow-theme-accent/25 scale-105"
                    : "glass-card-static text-gray-900 hover:shadow-md"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredCatalogItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCatalogItems.map(item => (
                <div
                  key={item.id}
                  className="glass-card rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:-translate-y-1.5 transition-all"
                >
                  <div className="space-y-3">
                    {/* Item Image */}
                    <div className="aspect-square rounded-2xl overflow-hidden bg-theme-primary/10 relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#2563EB]">
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                      )}
                      <span className={cn(
                        "absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-sm",
                        (item.stock ?? 1) > 0 
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" 
                          : "bg-red-500/15 text-red-600 border border-red-500/30"
                      )}>
                        {(item.stock ?? 1) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Title & Category */}
                    <div>
                      <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">
                        {getCategoryName(item.category)}
                      </span>
                      <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 mt-0.5">
                        {item.name}
                      </h4>
                    </div>
                  </div>

                  {/* Price & Quick Inquiry */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-extrabold text-gray-900 font-mono">
                      ₹{item.price || 0}
                    </span>
                    <button
                      onClick={() => handleWhatsAppInquiry(`Hi, I am interested in buying ${item.name} (Price: ₹${item.price}).`)}
                      className="p-2.5 rounded-xl bg-theme-accent/15 text-[#2563EB] hover:bg-theme-accent hover:text-white transition-all shadow-sm cursor-pointer"
                      title="Inquire on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 rounded-3xl glass-card-static max-w-md mx-auto space-y-2">
              <ShoppingBag className="w-10 h-10 text-theme-muted mx-auto" />
              <p className="text-sm font-semibold text-gray-900">No Products Found</p>
              <p className="text-xs text-theme-muted">No catalog items match your search or filter category.</p>
            </div>
          )}

        </section>
      )}

      {/* ── 6. NEWS & INSIGHTS (JOURNAL ARTICLES) ── */}
      {config.showJournal && config.journalArticles && config.journalArticles.length > 0 && (
        <section id="insights" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="inline-block text-xs font-bold tracking-widest text-[#2563EB] uppercase bg-theme-accent/10 px-3.5 py-1.5 rounded-full">
                  {config.journalKicker || 'NEWS & INSIGHTS'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {config.journalTitle || 'Industry Stories & Updates'}
                </h2>
              </div>

              <p className="text-sm text-theme-muted max-w-md font-normal leading-relaxed">
                {config.journalSubtitle || 'Stay informed with our latest news, operational guides, and industry insights.'}
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.journalArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedStory(article)}
                  className="group cursor-pointer glass-card rounded-3xl overflow-hidden flex flex-col justify-between hover:-translate-y-2 transition-all duration-500"
                >
                  <div>
                    {/* Article Cover Image */}
                    <div className="aspect-[16/9] overflow-hidden bg-theme-primary/10 relative">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#2563EB]">
                          <Sparkles className="w-10 h-10" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#2563EB] shadow-md">
                        {article.readTime || '3 min read'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-2">
                      <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">
                        {article.date || 'Latest Article'}
                      </span>
                      <h3 className="text-base font-extrabold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#2563EB] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center gap-1.5 text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── 7. FOOTER & FLOATING NEWSLETTER DISPATCH ── */}
      <footer id="contact" className="bg-white text-gray-900 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Newsletter Capsule Bar */}
          {config.showNewsletter && (
            <div className="bg-gradient-to-r from-theme-bg-secondary/80 via-theme-surface to-theme-bg-secondary/80 rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl ring-1 ring-white/30">
              <div className="space-y-2 max-w-xl text-center lg:text-left">
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#2563EB] uppercase block">
                  NEWSLETTER DISPATCH
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {config.newsletterTitle || 'Stay Updated with Latest Releases'}
                </h3>
                <p className="text-xs text-theme-muted font-normal leading-relaxed">
                  {config.newsletterSubtitle || 'Subscribe to receive announcements, exclusive promotions, and seasonal specials.'}
                </p>
              </div>

              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full sm:w-72 px-5 py-3.5 bg-white rounded-full text-xs text-gray-900 placeholder:text-theme-muted outline-none focus:ring-2 focus:ring-theme-accent shadow-md transition-all"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-white font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap shadow-lg shadow-theme-accent/25 hover:scale-105 active:scale-95"
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
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-contain bg-white shadow-sm flex-shrink-0 ring-2 ring-theme-accent/20" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-gray-900 uppercase block">
                    {config.brandName}
                  </span>
                  <span className="text-[9px] tracking-[0.25em] text-[#2563EB] uppercase font-mono block">
                    {config.brandSubtext || 'ENTERPRISE'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-theme-muted leading-relaxed font-normal">
                {config.brandTagline || 'Delivering world-class products, expert services, and bespoke solutions.'}
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs text-theme-muted font-medium">
                {config.showDestinations && <li><a href="#showcase" className="hover:text-[#2563EB] transition-colors">Featured Offerings</a></li>}
                {config.showCurated && <li><a href="#why-us" className="hover:text-[#2563EB] transition-colors">Why Choose Us</a></li>}
                {config.showCatalog && <li><a href="#catalog" className="hover:text-[#2563EB] transition-colors">Live Store Catalog</a></li>}
                {config.showJournal && <li><a href="#insights" className="hover:text-[#2563EB] transition-colors">News & Insights</a></li>}
              </ul>
            </div>

            {/* Col 3: Contact & Concierge */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">
                Contact & Support
              </h4>
              <ul className="space-y-2.5 text-xs text-theme-muted">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{config.phone || '+1 (555) 019-2834'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{config.email || 'contact@apexenterprise.com'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{config.address || 'Main Commercial Hub, City Center'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{config.workingHours || 'Mon - Sat: 9:00 AM - 8:00 PM'}</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Direct WhatsApp Chat */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">
                Instant WhatsApp Chat
              </h4>
              <p className="text-xs text-theme-muted leading-relaxed font-normal">
                Connect directly with our team for instant quotes, inquiries, and orders.
              </p>
              <button
                onClick={() => handleWhatsAppInquiry()}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

          </div>

          {/* Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-muted opacity-80">
            <p>© {new Date().getFullYear()} {config.brandName}. {config.copyrightText || 'All rights reserved.'}</p>
            <p className="text-[11px] font-mono text-theme-muted/80">Powered by Universal Multi-Business CMS Platform</p>
          </div>

        </div>
      </footer>

      {/* ── 8. FLOATING WHATSAPP BUTTON ── */}
      {config.showWhatsAppWidget && (
        <button
          onClick={() => handleWhatsAppInquiry()}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all group cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full text-gray-900 overflow-hidden shadow-2xl my-8">
            <div className="relative h-64 sm:h-72 bg-theme-primary/10">
              <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-theme-surface via-transparent to-black/30" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full bg-theme-accent/20 border border-theme-accent/30 text-[#2563EB] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedItem.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                  {selectedItem.name}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-bg-secondary/40">
                <div>
                  <span className="text-[10px] font-mono text-theme-muted uppercase">Rate / Price</span>
                  <p className="font-mono text-2xl font-extrabold text-gray-900">{selectedItem.priceFrom}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-theme-muted uppercase">Format</span>
                  <p className="text-xs font-bold text-[#2563EB]">{selectedItem.duration || 'Complete'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-[#2563EB] tracking-wider mb-2">
                  Overview
                </h4>
                <p className="text-xs sm:text-sm text-theme-muted font-normal leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              {selectedItem.highlights?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#2563EB] tracking-wider mb-2">
                    Key Features & Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedItem.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-900 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.inclusions?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#2563EB] tracking-wider mb-2">
                    Included Benefits
                  </h4>
                  <div className="space-y-1.5">
                    {selectedItem.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-theme-muted">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => openItemInquiry(selectedItem)}
                  className="w-full sm:flex-1 py-3.5 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-widest transition-all text-center shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Inquire / Book Now
                </button>
                <button
                  onClick={() => handleWhatsAppInquiry(`Hello, I would like to inquire about "${selectedItem.name}" (${selectedItem.priceFrom}).`)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full text-gray-900 overflow-hidden shadow-2xl my-8">
            <div className="relative h-64 bg-theme-primary/10">
              <img src={selectedStory.imageUrl} alt={selectedStory.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-theme-surface via-transparent to-black/30" />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full bg-theme-accent/20 border border-theme-accent/30 text-[#2563EB] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedStory.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
                  {selectedStory.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-theme-muted pb-3">
                <span>By {selectedStory.author}</span>
                <span>{selectedStory.date} • {selectedStory.readTime}</span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-theme-muted font-normal leading-relaxed">
                {selectedStory.content?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setSelectedStory(null)}
                  className="w-full py-3 rounded-2xl bg-white border border-gray-100 hover:bg-blue-50 text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full text-gray-900 p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsInquiryModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-theme-bg-secondary text-gray-900 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#2563EB] uppercase block">
                DIRECT INQUIRY
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Get in Touch with {config.brandName}
              </h3>
              <p className="text-xs text-theme-muted font-normal">
                Fill out the details below and our team will get back to you promptly.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-900 font-bold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={inquiryForm.name}
                  onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-theme-bg-primary border border-gray-100 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-theme-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-900 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={inquiryForm.phone}
                    onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-theme-bg-primary border border-gray-100 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inquiryForm.email}
                    onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. john@example.com"
                    className="w-full px-3.5 py-2.5 bg-theme-bg-primary border border-gray-100 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                </div>
              </div>

              {inquiryForm.offeringName && (
                <div>
                  <label className="block text-gray-900 font-bold mb-1">Interested Offering / Product</label>
                  <input
                    type="text"
                    disabled
                    value={inquiryForm.offeringName}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-100 rounded-xl text-[#2563EB] font-bold outline-none cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-900 font-bold mb-1">Your Message / Requirements</label>
                <textarea
                  rows={3}
                  value={inquiryForm.notes}
                  onChange={e => setInquiryForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Tell us about your requirements, questions, or desired timeline..."
                  className="w-full px-3.5 py-2.5 bg-theme-bg-primary border border-gray-100 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-theme-accent"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Send Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppInquiry(`Inquiry from ${inquiryForm.name || 'Customer'}: ${inquiryForm.notes || 'Please provide more details.'}`)}
                  className="px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
