import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, Eye, ExternalLink, Copy, Check, Save, Sparkles, Image as ImageIcon, 
  Phone, MessageSquare, MapPin, Clock, Palette, ShoppingBag, Layout, 
  CheckCircle2, Share2, Smartphone, Monitor, AlertCircle, Plus, Trash2,
  Tag, Upload, Link as LinkIcon, Instagram, Facebook, Youtube, Twitter,
  Megaphone, Wrench, Grid, Compass, ArrowRight, X, ZoomIn, Star, Layers,
  Shield, Heart, Award, FileText, ChevronRight, BookOpen, Sliders, Zap,
  Check as CheckIcon, Box, Users, HelpCircle, RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  WebsiteConfig, HeroSlide, ShowcaseItem, CuratedPillar, 
  JournalArticle, DEFAULT_WEBSITE_CONFIG, INDUSTRY_PRESETS 
} from '../types/website';

export default function WebsiteBuilder() {
  const { businessProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'HERO_SLIDES' | 'SHOWCASE' | 'PILLARS' | 'JOURNAL' | 'CATALOG' | 'CONTACT_FOOTER' | 'TOGGLES' | 'PREVIEW'
  >('HERO_SLIDES');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [templateToast, setTemplateToast] = useState<string | null>(null);

  // Active sub-item editors
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [selectedShowcaseId, setSelectedShowcaseId] = useState<string | null>(null);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);

  // Load Website Config from LocalStorage
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem('universal_website_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_WEBSITE_CONFIG,
          ...parsed,
          brandName: parsed.brandName || businessProfile.businessName || DEFAULT_WEBSITE_CONFIG.brandName,
          phone: parsed.phone || businessProfile.phone || DEFAULT_WEBSITE_CONFIG.phone,
          whatsapp: parsed.whatsapp || businessProfile.phone || DEFAULT_WEBSITE_CONFIG.whatsapp,
          email: parsed.email || businessProfile.email || DEFAULT_WEBSITE_CONFIG.email,
          heroSlides: parsed.heroSlides?.length ? parsed.heroSlides : DEFAULT_WEBSITE_CONFIG.heroSlides,
          destinations: parsed.destinations?.length ? parsed.destinations : DEFAULT_WEBSITE_CONFIG.destinations,
          curatedPillars: parsed.curatedPillars?.length ? parsed.curatedPillars : DEFAULT_WEBSITE_CONFIG.curatedPillars,
          journalArticles: parsed.journalArticles?.length ? parsed.journalArticles : DEFAULT_WEBSITE_CONFIG.journalArticles,
        };
      }
    } catch (e) {}

    return {
      ...DEFAULT_WEBSITE_CONFIG,
      brandName: businessProfile.businessName || DEFAULT_WEBSITE_CONFIG.brandName,
      phone: businessProfile.phone || DEFAULT_WEBSITE_CONFIG.phone,
      whatsapp: businessProfile.phone || DEFAULT_WEBSITE_CONFIG.whatsapp,
      email: businessProfile.email || DEFAULT_WEBSITE_CONFIG.email,
    };
  });

  const [items, setItems] = useState<any[]>([]);

  // Load Catalog Items
  useEffect(() => {
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const publicUrl = `${window.location.origin}/website`;

  const handleSave = () => {
    localStorage.setItem('universal_website_config', JSON.stringify(config));
    window.dispatchEvent(new Event('storage'));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset website configuration to clean universal multi-business defaults?')) {
      setConfig({
        ...DEFAULT_WEBSITE_CONFIG,
        brandName: businessProfile.businessName || DEFAULT_WEBSITE_CONFIG.brandName,
        phone: businessProfile.phone || DEFAULT_WEBSITE_CONFIG.phone,
        whatsapp: businessProfile.phone || DEFAULT_WEBSITE_CONFIG.whatsapp,
        email: businessProfile.email || DEFAULT_WEBSITE_CONFIG.email,
      });
      localStorage.setItem('universal_website_config', JSON.stringify(DEFAULT_WEBSITE_CONFIG));
      window.dispatchEvent(new Event('storage'));
      setTemplateToast('Reset to Universal Multi-Business defaults!');
      setTimeout(() => setTemplateToast(null), 3000);
    }
  };

  // ── HERO SLIDES MANAGEMENT ──
  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      title: 'Crafted with Excellence,',
      titleHighlight: 'Built For You',
      kicker: 'PREMIUM QUALITY & RELIABILITY',
      subtitle: 'Experience world-class products and dedicated professional service tailored to your needs.',
      ctaText: 'EXPLORE OFFERINGS',
      bgUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85',
      featureBadge: 'SIGNATURE QUALITY',
      featureDesc: 'Certified standards and end-to-end satisfaction guaranteed.'
    };
    setConfig(c => ({
      ...c,
      heroSlides: [...c.heroSlides, newSlide]
    }));
    setSelectedSlideIndex(config.heroSlides.length);
  };

  const handleUpdateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setConfig(c => {
      const updated = [...c.heroSlides];
      updated[index] = { ...updated[index], [field]: value };
      return { ...c, heroSlides: updated };
    });
  };

  const handleDeleteSlide = (index: number) => {
    if (config.heroSlides.length <= 1) {
      alert('You must have at least one hero slide.');
      return;
    }
    setConfig(c => ({
      ...c,
      heroSlides: c.heroSlides.filter((_, i) => i !== index)
    }));
    setSelectedSlideIndex(0);
  };

  // ── FEATURED SHOWCASE / OFFERINGS MANAGEMENT ──
  const handleAddShowcaseItem = () => {
    const newItem: ShowcaseItem = {
      id: `item-${Date.now()}`,
      name: 'Signature Offering Package',
      subtitle: 'Premium quality engineered for superior results',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
      priceFrom: '$450',
      duration: 'Complete Package',
      badge: 'Featured',
      category: 'Signature Collection',
      description: 'Comprehensive solution designed with highest industry standards and precision execution.',
      highlights: [
        'Dedicated Project Specialist',
        'Quality Assurance Guarantee',
        'Fast Turnaround & Delivery'
      ],
      itinerary: [
        { day: 'Phase 1', title: 'Consultation & Setup', desc: 'Requirements review and customized setup.' },
        { day: 'Phase 2', title: 'Fulfillment & Delivery', desc: 'Precision execution with continuous quality checkpoints.' }
      ],
      inclusions: [
        'Full Product/Service Package',
        'Direct Priority Support',
        '100% Satisfaction Warranty'
      ]
    };
    setConfig(c => ({
      ...c,
      destinations: [...c.destinations, newItem]
    }));
    setSelectedShowcaseId(newItem.id);
  };

  const handleUpdateShowcaseItem = (id: string, field: keyof ShowcaseItem, value: any) => {
    setConfig(c => ({
      ...c,
      destinations: c.destinations.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const handleDeleteShowcaseItem = (id: string) => {
    if (config.destinations.length <= 1) {
      alert('You must keep at least one showcase offering card.');
      return;
    }
    setConfig(c => ({
      ...c,
      destinations: c.destinations.filter(d => d.id !== id)
    }));
    if (selectedShowcaseId === id) setSelectedShowcaseId(null);
  };

  // ── CURATED VALUE PILLARS MANAGEMENT ──
  const handleUpdatePillar = (id: string, field: keyof CuratedPillar, value: any) => {
    setConfig(c => ({
      ...c,
      curatedPillars: c.curatedPillars.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // ── NEWS & INSIGHTS ARTICLES MANAGEMENT ──
  const handleAddArticle = () => {
    const newArticle: JournalArticle = {
      id: `article-${Date.now()}`,
      title: 'Modern Trends in Quality & Business Excellence',
      category: 'Industry Insights',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      author: 'Editorial Team',
      excerpt: 'How modern businesses maintain consistent quality control and exceed customer expectations.',
      content: [
        'In today’s fast-moving market, delivering reliable quality across every interaction is essential.',
        'Continuous refinement, ethical workflows, and customer-first support create enduring value.'
      ]
    };
    setConfig(c => ({
      ...c,
      journalArticles: [...c.journalArticles, newArticle]
    }));
    setSelectedJournalId(newArticle.id);
  };

  const handleUpdateArticle = (id: string, field: keyof JournalArticle, value: any) => {
    setConfig(c => ({
      ...c,
      journalArticles: c.journalArticles.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  const handleDeleteArticle = (id: string) => {
    if (config.journalArticles.length <= 1) {
      alert('You must keep at least one article.');
      return;
    }
    setConfig(c => ({
      ...c,
      journalArticles: c.journalArticles.filter(a => a.id !== id)
    }));
    if (selectedJournalId === id) setSelectedJournalId(null);
  };

  const activeSlide = config.heroSlides[selectedSlideIndex] || config.heroSlides[0];
  const activeShowcase = config.destinations.find(d => d.id === selectedShowcaseId) || config.destinations[0];
  const activeJournal = config.journalArticles.find(a => a.id === selectedJournalId) || config.journalArticles[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20 w-full">
      
      {/* ── TOAST NOTIFICATIONS ── */}
      {savedSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">Website Published Successfully!</p>
            <p className="text-xs text-gray-500">Your live website is instantly updated.</p>
          </div>
        </div>
      )}

      {templateToast && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">{templateToast}</p>
            <p className="text-xs text-gray-500">Review the updated content below and click Publish to go live.</p>
          </div>
        </div>
      )}

      {/* ── TOP HEADER / PUBLISH BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-lg shadow-gray-200/50">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Website CMS Builder
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Dynamic
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Universal multi-business dynamic website manager. Real-time updates publish instantly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Reset to clean multi-business defaults"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Website</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg btn-theme-secondary font-medium text-sm shadow-sm transition-colors flex-shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Publish Website</span>
          </button>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max border-b border-gray-200">
          {[
            { id: 'HERO_SLIDES', label: 'Hero & Branding', icon: Layout },
            { id: 'SHOWCASE', label: 'Featured Showcase', icon: Star },
            { id: 'PILLARS', label: 'Why Choose Us', icon: Shield },
            { id: 'JOURNAL', label: 'News & Insights', icon: BookOpen },
            { id: 'CATALOG', label: 'Live Catalog (POS)', icon: ShoppingBag },
            { id: 'CONTACT_FOOTER', label: 'Contact & Footer', icon: Phone },
            { id: 'TOGGLES', label: 'Section Toggles', icon: Sliders },
            { id: 'PREVIEW', label: 'Live Preview', icon: Eye },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px",
                  isActive 
                    ? "border-blue-600 text-blue-600 font-semibold" 
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-gray-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO & BRANDING TAB */}
      {/* ========================================================================= */}
      {activeTab === 'HERO_SLIDES' && (
        <div className="space-y-6">
          
          {/* Brand Identity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Brand Identity & Header Configuration</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure core business naming, industry tags, and global tagline display.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={config.brandName}
                  onChange={e => setConfig(c => ({ ...c, brandName: e.target.value }))}
                  placeholder="e.g. APEX ENTERPRISE"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtext / Industry</label>
                <input
                  type="text"
                  value={config.brandSubtext}
                  onChange={e => setConfig(c => ({ ...c, brandSubtext: e.target.value }))}
                  placeholder="e.g. MULTI-BUSINESS SOLUTIONS / RETAIL / HEALTHCARE"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={config.brandTagline}
                  onChange={e => setConfig(c => ({ ...c, brandTagline: e.target.value }))}
                  placeholder="e.g. Excellence, Innovation & Premium Quality"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Hero Slides CRUD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Hero Slides & Banners ({config.heroSlides.length})
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Configure dynamic full-bleed hero slides with custom headlines, call-to-actions, and background photography.
                </p>
              </div>
              <button
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-theme-secondary font-medium text-sm transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            {/* Slide Selector Badges */}
            <div className="flex flex-wrap gap-2">
              {config.heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => setSelectedSlideIndex(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all max-w-[240px]",
                    selectedSlideIndex === idx
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-800"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  )}
                >
                  <span className="truncate">Slide {String(idx + 1).padStart(2, '0')}: {slide.title || 'Untitled'}</span>
                  {config.heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      className="hover:text-red-600 text-gray-400 ml-1 p-0.5 rounded flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Slide Editor Panel */}
            {activeSlide && (
              <div className="p-5 bg-gray-50/50 border border-gray-200 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <span className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Editing Slide {String(selectedSlideIndex + 1).padStart(2, '0')}: {activeSlide.title} {activeSlide.titleHighlight}
                  </span>
                  <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">Slide ID: {activeSlide.id}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Left Column: Text Content */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kicker Tagline (Top Accent Label)
                      </label>
                      <input
                        type="text"
                        value={activeSlide.kicker}
                        onChange={e => handleUpdateSlide(selectedSlideIndex, 'kicker', e.target.value)}
                        placeholder="e.g. INNOVATION & CRAFTSMANSHIP"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline Part 1</label>
                        <input
                          type="text"
                          value={activeSlide.title}
                          onChange={e => handleUpdateSlide(selectedSlideIndex, 'title', e.target.value)}
                          placeholder="e.g. Elevate Your Standard with"
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline Part 2 (Accent)</label>
                        <input
                          type="text"
                          value={activeSlide.titleHighlight}
                          onChange={e => handleUpdateSlide(selectedSlideIndex, 'titleHighlight', e.target.value)}
                          placeholder="e.g. Premium Quality"
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-serif italic"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slide Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={activeSlide.subtitle}
                        onChange={e => handleUpdateSlide(selectedSlideIndex, 'subtitle', e.target.value)}
                        placeholder="Short compelling description of your business offering."
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={activeSlide.ctaText}
                        onChange={e => handleUpdateSlide(selectedSlideIndex, 'ctaText', e.target.value)}
                        placeholder="e.g. EXPLORE OFFERINGS / SHOP NOW / BOOK APPOINTMENT"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Right Column: Background & Floating Glass Box */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
                      <input
                        type="text"
                        value={activeSlide.bgUrl}
                        onChange={e => handleUpdateSlide(selectedSlideIndex, 'bgUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-3">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                        Floating Highlight Feature Card
                      </span>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Feature Badge</label>
                        <input
                          type="text"
                          value={activeSlide.featureBadge}
                          onChange={e => handleUpdateSlide(selectedSlideIndex, 'featureBadge', e.target.value)}
                          placeholder="e.g. SIGNATURE QUALITY"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Feature Description</label>
                        <input
                          type="text"
                          value={activeSlide.featureDesc}
                          onChange={e => handleUpdateSlide(selectedSlideIndex, 'featureDesc', e.target.value)}
                          placeholder="e.g. Handcrafted excellence engineered to exceed expectations."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FEATURED SHOWCASE & OFFERINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'SHOWCASE' && (
        <div className="space-y-6">
          
          {/* Section Headers Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" />
                <span>Featured Showcase & Offerings Section Headers</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Customize titles and subtitles for your featured products/services section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Kicker</label>
                <input
                  type="text"
                  value={config.destinationsKicker}
                  onChange={e => setConfig(c => ({ ...c, destinationsKicker: e.target.value }))}
                  placeholder="e.g. FEATURED OFFERINGS / TOP PRODUCTS / SERVICES"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Headline</label>
                <input
                  type="text"
                  value={config.destinationsTitle}
                  onChange={e => setConfig(c => ({ ...c, destinationsTitle: e.target.value }))}
                  placeholder="e.g. Signature Products & Premier Services"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={config.destinationsSubtitle}
                  onChange={e => setConfig(c => ({ ...c, destinationsSubtitle: e.target.value }))}
                  placeholder="e.g. Explore our handpicked selection of top-tier offerings..."
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Showcase Items CRUD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Configured Offerings & Packages ({config.destinations.length})
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create showcase cards for your top products, key services, signature packages, or projects.
                </p>
              </div>
              <button
                onClick={handleAddShowcaseItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-theme-secondary font-medium text-sm transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item / Offering</span>
              </button>
            </div>

            {/* Grid of Showcase Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.destinations.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedShowcaseId(item.id)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group",
                    (selectedShowcaseId === item.id || (!selectedShowcaseId && config.destinations[0]?.id === item.id))
                      ? "bg-blue-50/50 border-blue-600 dark:bg-blue-900/20 dark:border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium">
                        {item.duration || 'Offering'}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-blue-600 block truncate">
                        {item.category}
                      </span>
                      <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-200">
                    <span className="font-semibold text-sm text-gray-900">
                      {item.priceFrom}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteShowcaseItem(item.id);
                      }}
                      className="p-1 hover:text-red-600 text-gray-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Showcase Item Detail Editor */}
            {activeShowcase && (
              <div className="p-5 bg-gray-50/50 border border-gray-200 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <span className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Editing Offering: <span className="text-blue-600">{activeShowcase.name}</span>
                  </span>
                  <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">Item ID: {activeShowcase.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Title / Name *</label>
                    <input
                      type="text"
                      value={activeShowcase.name}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'name', e.target.value)}
                      placeholder="e.g. Signature Executive Package / Deluxe Suite"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category / Tag</label>
                    <input
                      type="text"
                      value={activeShowcase.category}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'category', e.target.value)}
                      placeholder="e.g. Premium Tier / Signature / Medical Care"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={activeShowcase.badge || ''}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'badge', e.target.value)}
                      placeholder="e.g. Best Seller / Popular / New / Exclusive"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price / Rate</label>
                    <input
                      type="text"
                      value={activeShowcase.priceFrom}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'priceFrom', e.target.value)}
                      placeholder="e.g. $1,250 / ₹450 / Custom Quote"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit / Duration / Format</label>
                    <input
                      type="text"
                      value={activeShowcase.duration}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'duration', e.target.value)}
                      placeholder="e.g. Complete Package / Per Unit / 1-Hour Session"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={activeShowcase.imageUrl}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'imageUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={activeShowcase.subtitle}
                    onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'subtitle', e.target.value)}
                    placeholder="Short one-line description of the offering."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overview Description</label>
                  <textarea
                    rows={3}
                    value={activeShowcase.description}
                    onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'description', e.target.value)}
                    placeholder="Comprehensive description of this offering."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Features / Highlights (1 per line)</label>
                    <textarea
                      rows={4}
                      value={activeShowcase.highlights?.join('\n') || ''}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'highlights', e.target.value.split('\n').filter(Boolean))}
                      placeholder="Dedicated Specialist&#10;24/7 Priority Support&#10;Full Quality Warranty"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions / Included Benefits (1 per line)</label>
                    <textarea
                      rows={4}
                      value={activeShowcase.inclusions?.join('\n') || ''}
                      onChange={e => handleUpdateShowcaseItem(activeShowcase.id, 'inclusions', e.target.value.split('\n').filter(Boolean))}
                      placeholder="Full Turnkey Delivery&#10;Quarterly Strategy Reviews&#10;Dedicated Concierge"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WHY CHOOSE US / VALUE PILLARS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'PILLARS' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Why Choose Us (Core Value Pillars) Headers</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure your key value propositions and business differentiators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Kicker</label>
                <input
                  type="text"
                  value={config.curatedKicker}
                  onChange={e => setConfig(c => ({ ...c, curatedKicker: e.target.value }))}
                  placeholder="e.g. WHY CHOOSE US / OUR PROMISE"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline Part 1</label>
                <input
                  type="text"
                  value={config.curatedTitle}
                  onChange={e => setConfig(c => ({ ...c, curatedTitle: e.target.value }))}
                  placeholder="e.g. Excellence in Every Detail,"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline Part 2 (Accent)</label>
                <input
                  type="text"
                  value={config.curatedTitleHighlight}
                  onChange={e => setConfig(c => ({ ...c, curatedTitleHighlight: e.target.value }))}
                  placeholder="e.g. Engineered For You"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 font-serif italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={config.curatedSubtitle}
                onChange={e => setConfig(c => ({ ...c, curatedSubtitle: e.target.value }))}
                placeholder="Discover the core pillars that set our business apart..."
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.curatedPillars.map((pillar, idx) => (
              <div key={pillar.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                  <span className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Pillar 0{idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 font-medium">Icon:</span>
                    <select
                      value={pillar.iconType}
                      onChange={e => handleUpdatePillar(pillar.id, 'iconType', e.target.value)}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="shield">🛡️ Shield (Security & Trust)</option>
                      <option value="heart">❤️ Heart (Customer Care)</option>
                      <option value="zap">⚡ Lightning (Speed & Execution)</option>
                      <option value="award">🏆 Award (Expertise & Certifications)</option>
                      <option value="star">⭐ Star (Premier Quality)</option>
                      <option value="box">📦 Box (Fulfillment & Delivery)</option>
                      <option value="clock">⏰ Clock (24/7 Availability)</option>
                      <option value="check">✔️ Check (Guaranteed Results)</option>
                      <option value="sparkles">✨ Sparkles (Bespoke & Innovation)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={e => handleUpdatePillar(pillar.id, 'title', e.target.value)}
                    placeholder="e.g. Certified Quality"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={pillar.desc}
                    onChange={e => handleUpdatePillar(pillar.id, 'desc', e.target.value)}
                    placeholder="Detailed explanation of this core value..."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. NEWS & INSIGHTS ARTICLES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'JOURNAL' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>News, Insights & Blog Section Headers</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage section titles and subtitle text for your business blog / news updates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Kicker</label>
                <input
                  type="text"
                  value={config.journalKicker}
                  onChange={e => setConfig(c => ({ ...c, journalKicker: e.target.value }))}
                  placeholder="e.g. NEWS & INSIGHTS / ARTICLES / BLOG"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Headline</label>
                <input
                  type="text"
                  value={config.journalTitle}
                  onChange={e => setConfig(c => ({ ...c, journalTitle: e.target.value }))}
                  placeholder="e.g. Latest Updates, Articles & Stories"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Articles CRUD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Published Articles ({config.journalArticles.length})
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Share company updates, expert tips, product spotlights, and industry guides.
                </p>
              </div>
              <button
                onClick={handleAddArticle}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-theme-secondary font-medium text-sm transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Article / Story</span>
              </button>
            </div>

            {/* Articles List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {config.journalArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => setSelectedJournalId(article.id)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group",
                    (selectedJournalId === article.id || (!selectedJournalId && config.journalArticles[0]?.id === article.id))
                      ? "bg-blue-50/50 border-blue-600 dark:bg-blue-900/20 dark:border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="space-y-2">
                    <div className="h-28 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-blue-600 block truncate">
                        {article.category} • {article.readTime}
                      </span>
                      <h3 className="font-semibold text-xs text-gray-900 leading-tight line-clamp-2 mt-0.5">
                        {article.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">{article.date}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArticle(article.id);
                      }}
                      className="p-1 hover:text-red-600 text-gray-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Article Editor */}
            {activeJournal && (
              <div className="p-5 bg-gray-50/50 border border-gray-200 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <span className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Editing Article: <span className="text-blue-600">{activeJournal.title}</span>
                  </span>
                  <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">Article ID: {activeJournal.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Article Title *</label>
                    <input
                      type="text"
                      value={activeJournal.title}
                      onChange={e => handleUpdateArticle(activeJournal.id, 'title', e.target.value)}
                      placeholder="e.g. 5 Key Standards Shaping Modern Business"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Tag</label>
                    <input
                      type="text"
                      value={activeJournal.category}
                      onChange={e => handleUpdateArticle(activeJournal.id, 'category', e.target.value)}
                      placeholder="e.g. Insights / Updates / Guides"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Name / Title</label>
                    <input
                      type="text"
                      value={activeJournal.author}
                      onChange={e => handleUpdateArticle(activeJournal.id, 'author', e.target.value)}
                      placeholder="e.g. Strategy Team / Quality Lead"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                    <input
                      type="text"
                      value={activeJournal.date}
                      onChange={e => handleUpdateArticle(activeJournal.id, 'date', e.target.value)}
                      placeholder="e.g. June 10, 2024"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                    <input
                      type="text"
                      value={activeJournal.readTime}
                      onChange={e => handleUpdateArticle(activeJournal.id, 'readTime', e.target.value)}
                      placeholder="e.g. 4 min read"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={activeJournal.imageUrl}
                      onChange={e => handleUpdateArticle(activeJournal.id, 'imageUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Excerpt / Summary</label>
                  <textarea
                    rows={2}
                    value={activeJournal.excerpt}
                    onChange={e => handleUpdateArticle(activeJournal.id, 'excerpt', e.target.value)}
                    placeholder="Short engaging summary to preview in the card grid."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Article Paragraphs (Separate with double enter)</label>
                  <textarea
                    rows={4}
                    value={activeJournal.content?.join('\n\n') || ''}
                    onChange={e => handleUpdateArticle(activeJournal.id, 'content', e.target.value.split('\n\n').filter(Boolean))}
                    placeholder="Write detailed paragraphs here. Separate paragraphs with double enter."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LIVE POS CATALOG TAB */}
      {/* ========================================================================= */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Live POS Inventory Catalog Settings</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure your real-time POS product store section on your public website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catalog Section Kicker</label>
                <input
                  type="text"
                  value={config.catalogKicker}
                  onChange={e => setConfig(c => ({ ...c, catalogKicker: e.target.value }))}
                  placeholder="e.g. LIVE STORE & INVENTORY"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catalog Section Headline</label>
                <input
                  type="text"
                  value={config.catalogTitle}
                  onChange={e => setConfig(c => ({ ...c, catalogTitle: e.target.value }))}
                  placeholder="e.g. Direct Catalog & Real-Time Ordering"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-gray-900 block">Display Live POS Inventory on Website</span>
                <span className="text-xs text-gray-500">
                  Automatically pulls all {items.length} products & services created in your POS database with direct WhatsApp ordering.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.showCatalog}
                onChange={e => setConfig(c => ({ ...c, showCatalog: e.target.checked }))}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CONTACT & FOOTER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'CONTACT_FOOTER' && (
        <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Business Contact, Operating Hours & Footer Configuration</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Set contact numbers, business address, working hours, and newsletter footer options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={config.phone}
                onChange={e => setConfig(c => ({ ...c, phone: e.target.value }))}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Concierge Number</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={config.email}
                onChange={e => setConfig(c => ({ ...c, email: e.target.value }))}
                placeholder="e.g. contact@apexenterprise.com"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Business Address</label>
              <input
                type="text"
                value={config.address}
                onChange={e => setConfig(c => ({ ...c, address: e.target.value }))}
                placeholder="e.g. Main Commercial Hub, City Center, Suite 500"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
              <input
                type="text"
                value={config.workingHours}
                onChange={e => setConfig(c => ({ ...c, workingHours: e.target.value }))}
                placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Title</label>
              <input
                type="text"
                value={config.newsletterTitle}
                onChange={e => setConfig(c => ({ ...c, newsletterTitle: e.target.value }))}
                placeholder="e.g. Stay Updated"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Subtitle</label>
              <input
                type="text"
                value={config.newsletterSubtitle}
                onChange={e => setConfig(c => ({ ...c, newsletterSubtitle: e.target.value }))}
                placeholder="e.g. Subscribe to our mailing list for latest product launches..."
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SECTION TOGGLES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'TOGGLES' && (
        <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Website Section Visibility Toggles</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Toggle specific sections on or off to customize your public website experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Hero Slideshow Section', key: 'showHero' as const },
              { label: 'Featured Showcase & Offerings', key: 'showDestinations' as const },
              { label: 'Why Choose Us (Value Pillars)', key: 'showCurated' as const },
              { label: 'News & Insights Magazine', key: 'showJournal' as const },
              { label: 'Live Catalog & POS Store', key: 'showCatalog' as const },
              { label: 'Newsletter Subscription Bar', key: 'showNewsletter' as const },
              { label: 'Floating WhatsApp Chat Widget', key: 'showWhatsAppWidget' as const },
            ].map(t => (
              <label key={t.key} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <span className="font-medium text-sm text-gray-900">{t.label}</span>
                <input
                  type="checkbox"
                  checked={config[t.key] as boolean}
                  onChange={e => setConfig(c => ({ ...c, [t.key]: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. LIVE PREVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'PREVIEW' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-gray-900">Device View:</span>
              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('DESKTOP')}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all", previewDevice === 'DESKTOP' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('MOBILE')}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all", previewDevice === 'MOBILE' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm font-medium"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex justify-center bg-gray-950 p-4 rounded-2xl border border-gray-800 overflow-x-auto">
            <div className={cn(
              "transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-white min-w-0",
              previewDevice === 'DESKTOP' ? "w-full max-w-6xl h-[750px]" : "w-[390px] h-[750px]"
            )}>
              <iframe
                src="/website"
                title="Website Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
