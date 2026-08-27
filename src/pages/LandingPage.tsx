import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LandingSlide } from '../context/AuthContext';
import {
  ChevronLeft, ChevronRight,
  Image as ImageIcon, Receipt, Users, BarChart3, Clock,
  Sparkles, LogIn, LayoutDashboard
} from 'lucide-react';

// ─── Carousel ─────────────────────────────────────────────────────────────────

function Carousel({ slides }: { slides: LandingSlide[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative w-full h-full min-h-[220px] overflow-hidden group rounded-[1.5rem] sm:rounded-[2rem] bg-[#070709] flex items-center justify-center">
      {slides.map((slide, i) => (
        <div key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 flex items-center justify-center ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          
          {/* Subtle blurred backdrop */}
          <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none" />
          
          {/* Main image - FULLY FITTED without cropping */}
          <img src={slide.imageUrl} alt={slide.caption} className="relative z-10 w-full h-full object-contain p-2 drop-shadow-2xl" />
          
          {/* Dark gradient overlay */}
          {(slide.caption || slide.subCaption) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent">
              {slide.caption && <p className="font-bold text-white text-xs sm:text-base drop-shadow-md">{slide.caption}</p>}
              {slide.subCaption && <p className="text-gray-300 text-[10px] sm:text-xs mt-0.5 drop-shadow">{slide.subCaption}</p>}
            </div>
          )}
        </div>
      ))}
      
      {slides.length > 1 && (
        <>
          <button onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrent(p => (p + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/10">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-[#C5A059]' : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Cards config ─────────────────────────────────────────────────────────────

const CARDS = [
  {
    id: 'billing',
    icon: Receipt,
    title: 'Billing POS',
    desc: 'Fast GST invoices & receipt printing.',
    accent: '#C5A059',
    accentBg: 'bg-[#C5A059]/15',
    accentBorder: 'border-[#C5A059]/25',
    role: 'admin' as const,
    targetRoute: '/dashboard/billing',
    watermarkType: 'receipt',
  },
  {
    id: 'employees',
    icon: Users,
    title: 'Employee Details',
    desc: 'Staff management, roles & departments.',
    accent: '#34d399',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/25',
    role: 'admin' as const,
    targetRoute: '/dashboard/employees',
    watermarkType: 'users',
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Sales Reports',
    desc: 'Daily, weekly & monthly analytics.',
    accent: '#a78bfa',
    accentBg: 'bg-purple-500/15',
    accentBorder: 'border-purple-500/25',
    role: 'admin' as const,
    targetRoute: '/dashboard/reports',
    watermarkType: 'chart',
  },
  {
    id: 'punch',
    icon: Clock,
    title: 'Punch IN / Punch OUT',
    desc: 'Selfie-based biometric attendance.',
    accent: '#22d3ee',
    accentBg: 'bg-cyan-500/15',
    accentBorder: 'border-cyan-500/25',
    role: 'employee' as const,
    targetRoute: '/employee',
    watermarkType: 'clock',
  },
];

// Decorative bottom graphic watermarks for cards
function CardWatermark({ type, accent }: { type: string; accent: string }) {
  if (type === 'receipt') {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 transition-opacity group-hover:opacity-35" viewBox="0 0 64 64" fill="none" stroke={accent} strokeWidth="2.5">
        <path d="M12 8h40v48l-8-4-8 4-8-4-8 4-8-4V8z" />
        <path d="M20 20h24M20 28h18M20 36h24M20 44h12" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'users') {
    return (
      <svg className="w-16 h-12 sm:w-20 sm:h-16 opacity-20 transition-opacity group-hover:opacity-35" viewBox="0 0 80 64" fill="none" stroke={accent} strokeWidth="2.5">
        <circle cx="28" cy="22" r="10" />
        <path d="M10 52c0-10 8-16 18-16s18 6 18 16" strokeLinecap="round" />
        <circle cx="54" cy="26" r="8" />
        <path d="M42 52c1-7 6-12 12-12s11 5 12 12" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'chart') {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 transition-opacity group-hover:opacity-35" viewBox="0 0 64 64" fill="none" stroke={accent} strokeWidth="2.5">
        <path d="M8 52h48" strokeLinecap="round" />
        <rect x="14" y="32" width="8" height="20" rx="2" />
        <rect x="28" y="20" width="8" height="32" rx="2" />
        <rect x="42" y="10" width="8" height="42" rx="2" />
        <path d="M12 28l14-12 12 8 16-16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 transition-opacity group-hover:opacity-35" viewBox="0 0 64 64" fill="none" stroke={accent} strokeWidth="2.5">
      <circle cx="32" cy="32" r="24" />
      <path d="M32 16v16l10 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, businessProfile } = useAuth();
  const slides = (businessProfile.landingSlides || []).filter(s => s.imageUrl);

  const handleCardClick = (card: typeof CARDS[0]) => {
    if (card.role === 'employee') {
      navigate('/employee-login');
    } else {
      navigate(`/login?redirect=${encodeURIComponent(card.targetRoute)}&prompt=true`);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden bg-[#070708] text-white font-sans flex flex-col p-3 sm:p-5 md:p-7 lg:p-8 relative">

      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[400px] rounded-full bg-[#C5A059]/6 blur-[180px] pointer-events-none -translate-y-1/2" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none translate-y-1/2" />

      {/* ── FLOATING HEADER CARD ── */}
      <header className="flex-shrink-0 mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 rounded-2xl border border-white/[0.08] bg-[#0E0E10]/80 backdrop-blur-xl shadow-xl flex items-center justify-between z-30 relative gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {businessProfile.logoUrl ? (
            <img src={businessProfile.logoUrl} alt="logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain border border-white/10 bg-white/5 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#E2B755] to-[#8C6D2B] flex items-center justify-center text-[#0A0A0B] font-bold font-serif text-sm sm:text-base shadow-lg shadow-[#C5A059]/20 flex-shrink-0">
              {businessProfile.businessName?.charAt(0)?.toUpperCase() || 'B'}
            </div>
          )}
          <div className="leading-tight min-w-0">
            <p className="font-serif font-bold text-sm sm:text-base text-white tracking-wide truncate">{businessProfile.businessName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT (RESPONSIVE STACK ON MOBILE, 2 COLS ON DESKTOP) ── */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-4 sm:gap-6 lg:gap-8 relative z-10">

        {/* LEFT: Carousel Frame */}
        <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl bg-[#0D0D0F] flex items-center justify-center p-1 h-52 sm:h-64 lg:h-full min-h-[200px]">
          <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] ring-1 ring-inset ring-white/[0.05] pointer-events-none z-10" />

          {slides.length > 0 ? (
            <Carousel slides={slides} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 text-center px-6 sm:px-10">
              <div className="relative">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-inner">
                  <ImageIcon className="w-6 h-6 sm:w-9 sm:h-9 text-gray-600" />
                </div>
                <div className="absolute -inset-1.5 rounded-2xl border border-[#C5A059]/20 animate-ping opacity-30" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-300 tracking-wide">No Images Yet</p>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                  Upload photos via <span className="text-[#C5A059] font-mono font-semibold">Settings → Landing Page</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <div className="w-5 sm:w-6 h-1.5 sm:h-2 rounded-full bg-[#C5A059]/30" />
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white/10" />
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white/10" />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Feature Cards (1 col on mobile, 2 cols on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 min-h-0">
          {CARDS.map(card => {
            const Icon = card.icon;
            const isAdmin = card.role === 'admin';

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="group relative rounded-[1.5rem] sm:rounded-[2rem] border border-white/[0.08] hover:border-white/20 bg-[#0E0E10] hover:bg-[#121215] p-5 sm:p-6 md:p-7 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Top Row: Icon on left, Role Pill Badge on right */}
                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${card.accentBg} border ${card.accentBorder} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: card.accent }} />
                  </div>

                  {/* Soft Pill Badge */}
                  <div className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border tracking-wide ${
                    isAdmin
                      ? 'bg-[#C5A059]/15 border-[#C5A059]/30 text-[#C5A059]'
                      : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                  }`}>
                    {isAdmin ? 'Admin' : 'Employee'}
                  </div>
                </div>

                {/* Middle Row: Title & Description */}
                <div className="my-2.5 sm:my-3 relative z-10">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg text-white group-hover:text-[#C5A059] transition-colors duration-300 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 group-hover:text-gray-300 mt-1 sm:mt-1.5 leading-relaxed transition-colors duration-300">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom Row: Soft Illustration Graphic on Left, Circular Arrow Button on Right */}
                <div className="flex items-end justify-between relative z-10 pt-1">
                  {/* Decorative soft graphic illustration watermark */}
                  <div className="transform -translate-x-1 translate-y-1 transition-transform duration-300 group-hover:scale-105">
                    <CardWatermark type={card.watermarkType} accent={card.accent} />
                  </div>

                  {/* Round Chevron Action Button */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 shadow-lg">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Soft ambient background glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.5rem] sm:rounded-[2rem]"
                  style={{ background: `radial-gradient(circle at 90% 10%, ${card.accent}12 0%, transparent 70%)` }}
                />
              </div>
            );
          })}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="flex-shrink-0 mt-4 sm:mt-5 px-4 sm:px-6 md:px-8 py-2.5 rounded-xl border border-white/[0.05] bg-black/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 z-20 relative text-center sm:text-left">
        <span className="text-[10px] font-mono text-gray-500">
          © {new Date().getFullYear()} {businessProfile.businessName}
        </span>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#C5A059]/40" />
          <span className="text-[10px] font-mono text-[#C5A059]/50 font-semibold">Powered by Foclen Software Pvt Ltd</span>
        </div>
      </footer>
    </div>
  );
}
