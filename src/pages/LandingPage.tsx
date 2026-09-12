import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LandingSlide } from '../context/AuthContext';
import {
  Layers, Globe, ChevronLeft, ChevronRight,
  Image as ImageIcon, Receipt, Users, BarChart3, Clock, Sparkles
} from 'lucide-react';

// ─── Carousel Component ──────────────────────────────────────────────────────
function Carousel({ slides }: { slides: LandingSlide[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative w-full h-full min-h-[260px] overflow-hidden group rounded-3xl bg-white flex items-center justify-center shadow-sm border border-gray-200/90">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 flex items-center justify-center ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          {/* Soft background glow */}
          <img
            src={slide.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-110 pointer-events-none"
          />
          {/* Main image */}
          <img
            src={slide.imageUrl}
            alt={slide.caption || 'Slide'}
            className="relative z-10 w-full h-full object-contain p-2 drop-shadow-md"
          />
          {/* Caption overlay */}
          {(slide.caption || slide.subCaption) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white/95 via-white/70 to-transparent">
              {slide.caption && (
                <p className="font-bold text-gray-900 text-sm drop-shadow-xs">{slide.caption}</p>
              )}
              {slide.subCaption && (
                <p className="text-gray-600 text-xs mt-0.5">{slide.subCaption}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-gray-200 shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent(p => (p + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-gray-200 shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-[#2563EB]' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


// ─── Landing Page Component ─────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { user, businessProfile } = useAuth();

  const brandName = businessProfile.businessName || "My Business";
  const brandInitials = brandName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'MB';

  const slides = (businessProfile.landingSlides || []).filter(s => s.imageUrl);

  const quickLinks = [
    {
      title: 'Billing POS',
      desc: 'Create invoices & print receipts',
      icon: Receipt,
      bg: 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-100',
      iconColor: 'text-[#2563EB]',
      badge: 'ADMIN',
      badgeBg: 'bg-blue-200/60 text-[#2563EB]',
      route: '/login?redirect=%2Fdashboard%2Fbilling'
    },
    {
      title: 'Employee Details',
      desc: 'Staff management & team roles',
      icon: Users,
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-100',
      iconColor: 'text-emerald-600',
      badge: 'EMPLOYEE',
      badgeBg: 'bg-emerald-200/60 text-emerald-700',
      route: '/login?redirect=%2Fdashboard%2Femployees'
    },
    {
      title: 'Sales Reports',
      desc: 'Daily & monthly revenue reports',
      icon: BarChart3,
      bg: 'bg-purple-50/80 hover:bg-purple-100/80 border-purple-100',
      iconColor: 'text-purple-600',
      badge: 'ADMIN',
      badgeBg: 'bg-purple-200/60 text-purple-700',
      route: '/login?redirect=%2Fdashboard%2Freports'
    },
    {
      title: 'Attendance',
      desc: 'Selfie check-in & shift attendance',
      icon: Clock,
      bg: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-100',
      iconColor: 'text-cyan-600',
      badge: 'STAFF',
      badgeBg: 'bg-cyan-200/60 text-cyan-800',
      route: '/employee-login'
    }
  ];


  const getStoreSlug = () => {
    try {
      const saved = localStorage.getItem('universal_website_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeSlug) return parsed.storeSlug;
        if (parsed.brandName) {
          return parsed.brandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }
      }
    } catch {}
    return brandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'apex-enterprise';
  };

  const storeSlug = getStoreSlug();

  return (
    <div className="h-screen w-full bg-[#F4F6FB] text-[#0F172A] font-sans flex flex-col justify-between overflow-hidden relative selection:bg-blue-500 selection:text-white">

      {/* Soft background ambient gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-100/50 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ── TOP HEADER BAR ── */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between flex-shrink-0">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-black text-lg text-[#0F172A] leading-tight tracking-tight">
              {brandName}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              MANAGE MORE. STRESS LESS.
            </p>
          </div>
        </div>

        {/* Right Badges & Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/${storeSlug}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200/80 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Store Website</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYSTEM ACTIVE</span>
          </div>

          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-xs text-[#0F172A] transition-all cursor-pointer shadow-inner"
            title="User Profile"
          >
            {brandInitials}
          </button>
        </div>
      </header>

      {/* ── MAIN SHOWCASE & CARDS CONTENT ── */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 my-auto py-2 flex flex-col lg:flex-row items-stretch justify-between gap-6 lg:gap-8 flex-1 max-h-[calc(100vh-140px)]">

        {/* Left Side: Carousel / Showcase Gallery replacing text block */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {slides.length > 0 ? (
            <Carousel slides={slides} />
          ) : (
            <div className="w-full h-full min-h-[300px] border-2 border-dashed border-blue-200/90 bg-white rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50/80 text-[#2563EB] flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-300">
                  <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#0F172A]">
                    Showcase Gallery
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                    Bring every brand, branch, and business into one beautifully organized portfolio.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 w-full flex items-center justify-center gap-1.5 text-purple-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                  BUILT TO GROW WITH YOU
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Quick Access Feature Cards */}
        <div className="w-full lg:w-[460px] grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-shrink-0 my-auto">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(item.route)}
                className={`p-4 rounded-2xl border ${item.bg} shadow-sm transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 flex flex-col justify-between h-[145px]`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl bg-white/90 shadow-xs flex items-center justify-center ${item.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono uppercase ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* ── FOOTER BAR ── */}
      <footer className="border-t border-gray-200/60 bg-white/80 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-[11px]">© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-gray-400 font-mono text-[10px]">
            <Sparkles className="w-3 h-3 text-[#2563EB]" />
            <span>Foclen Software Solutions Pvt Ltd</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
