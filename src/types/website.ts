export interface HeroSlide {
  id: string;
  title: string;
  titleHighlight: string;
  kicker: string;
  subtitle: string;
  ctaText: string;
  bgUrl: string;
  featureBadge: string;
  featureDesc: string;
}

export interface ShowcaseItem {
  id: string;
  name: string;
  country?: string;
  subtitle: string;
  imageUrl: string;
  galleryUrls?: string[];
  priceFrom: string;
  duration: string; // unit, duration, or pricing basis (e.g. "Per Unit", "Per Hour", "Turnkey Package", "7 Days / 6 Nights")
  badge?: string;
  category: string;
  description: string;
  highlights: string[];
  itinerary?: { day: string; title: string; desc: string }[];
  inclusions: string[];
}

// Backward compatibility alias
export type DestinationItem = ShowcaseItem;

export interface CuratedPillar {
  id: string;
  title: string;
  desc: string;
  iconType: 'shield' | 'heart' | 'compass' | 'award' | 'star' | 'sparkles' | 'zap' | 'check' | 'box' | 'clock' | 'users';
}

export interface JournalArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  author: string;
  excerpt: string;
  content: string[];
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
}

export interface WebsiteConfig {
  logoUrl?: string;
  published: boolean;
  brandName: string;
  brandTagline: string;
  brandSubtext: string;
  
  // Hero Section
  heroSlides: HeroSlide[];
  
  // Featured Showcase / Offerings Section
  destinationsKicker: string;
  destinationsTitle: string;
  destinationsSubtitle: string;
  destinations: ShowcaseItem[];
  
  // Why Choose Us / Value Pillars Section
  curatedKicker: string;
  curatedTitle: string;
  curatedTitleHighlight: string;
  curatedSubtitle: string;
  curatedCtaText: string;
  curatedPillars: CuratedPillar[];
  
  // News & Insights / Blog Section
  journalKicker: string;
  journalTitle: string;
  journalSubtitle: string;
  journalArticles: JournalArticle[];

  // Direct POS Catalog Section
  catalogKicker: string;
  catalogTitle: string;
  showCatalog: boolean;
  
  // Contact & Social & Footer
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  googleMapsUrl: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  socialLinks: SocialLinks;
  copyrightText: string;
  
  // Toggles
  showHero: boolean;
  showDestinations: boolean;
  showCurated: boolean;
  showJournal: boolean;
  showNewsletter: boolean;
  showWhatsAppWidget: boolean;
  
  // Styling
  themeColor: 'gold' | 'emerald' | 'blue' | 'purple' | 'amber' | 'crimson';
}

// =========================================================================
// UNIVERSAL MULTI-BUSINESS DEFAULT CONFIGURATION
// =========================================================================
export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  published: true,
  brandName: 'APEX ENTERPRISE',
  brandTagline: 'Excellence, Innovation & Premium Quality',
  brandSubtext: 'MULTI-BUSINESS SOLUTIONS',
  
  heroSlides: [
    {
      id: 'slide-1',
      title: 'Elevate Your Standard with',
      titleHighlight: 'Premium Quality',
      kicker: 'INNOVATION & CRAFTSMANSHIP',
      subtitle: 'Delivering world-class products, expert services, and bespoke solutions tailored to your unique requirements.',
      ctaText: 'EXPLORE OFFERINGS',
      bgUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85',
      featureBadge: 'SIGNATURE COLLECTION',
      featureDesc: 'Handcrafted excellence engineered to exceed your highest expectations.'
    },
    {
      id: 'slide-2',
      title: 'Precision Driven,',
      titleHighlight: 'Exceptional Service',
      kicker: 'PROVEN INDUSTRY EXPERTISE',
      subtitle: 'Trusted by thousands of clients for reliability, transparent execution, and dedicated 24/7 client care.',
      ctaText: 'VIEW SERVICES',
      bgUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85',
      featureBadge: 'ENTERPRISE SOLUTIONS',
      featureDesc: 'Seamless fulfillment and dedicated account management.'
    },
    {
      id: 'slide-3',
      title: 'Crafted for Success,',
      titleHighlight: 'Built to Last',
      kicker: 'UNCOMPROMISING STANDARDS',
      subtitle: 'From consultation to delivery, experience end-to-end satisfaction backed by our guarantee.',
      ctaText: 'GET IN TOUCH',
      bgUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=2000&q=85',
      featureBadge: 'GUARANTEED VALUE',
      featureDesc: 'Certified quality benchmarked to global standards.'
    }
  ],
  
  destinationsKicker: 'FEATURED OFFERINGS',
  destinationsTitle: 'Signature Products & Premier Services',
  destinationsSubtitle: 'Explore our handpicked selection of top-tier offerings, engineered with precision and designed to deliver outstanding results.',
  destinations: [
    {
      id: 'item-1',
      name: 'Signature Executive Package',
      subtitle: 'Comprehensive premium solution for modern requirements',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
      priceFrom: '$1,250',
      duration: 'Complete Package',
      badge: 'Best Seller',
      category: 'Premium Tier',
      description: 'Our flagship offering engineered for superior performance and dependability. Includes end-to-end setup, priority support, and bespoke customizations tailored to your exact specifications.',
      highlights: [
        'Dedicated Senior Specialist & Project Lead',
        'Customized Architecture & Rapid Implementation',
        'Comprehensive 12-Month Guarantee & Support',
        'Full Performance Analytics & Detailed Reports'
      ],
      itinerary: [
        { day: 'Phase 1', title: 'Consultation & Discovery', desc: 'In-depth assessment of requirements, objective setting, and bespoke solution roadmap.' },
        { day: 'Phase 2', title: 'Execution & Quality Assurance', desc: 'Precision implementation with continuous quality audits and progress milestones.' },
        { day: 'Phase 3', title: 'Final Handover & Continuous Support', desc: 'Seamless deployment, comprehensive training, and ongoing 24/7 dedicated support.' }
      ],
      inclusions: [
        'Full Turnkey Solution Delivery',
        '24/7 Priority Support & Concierge',
        'Quarterly Strategy Reviews',
        'Complete Satisfaction Warranty'
      ]
    },
    {
      id: 'item-2',
      name: 'Essential Growth Tier',
      subtitle: 'Streamlined, high-impact foundational offering',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85',
      priceFrom: '$550',
      duration: 'Standard Tier',
      badge: 'Popular',
      category: 'Core Service',
      description: 'The optimal choice for growing teams and individuals seeking maximum value and fast turnaround without compromising on build quality.',
      highlights: [
        'Rapid 48-Hour Turnaround Time',
        'Standard Quality Assurance Certification',
        'Standard Integration & Direct Access',
        'Responsive Email & Phone Support'
      ],
      itinerary: [
        { day: 'Step 1', title: 'Rapid Onboarding', desc: 'Instant intake review and standard setup initiation within 24 hours.' },
        { day: 'Step 2', title: 'Deployment', desc: 'System configuration, verification checks, and final testing.' }
      ],
      inclusions: [
        'Core Module Capabilities',
        'Self-Service Documentation & Guides',
        'Business Hours Helpdesk Support'
      ]
    },
    {
      id: 'item-3',
      name: 'Custom Enterprise Suite',
      subtitle: 'Tailored for scale, security, and high performance',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
      priceFrom: '$3,800',
      duration: 'Enterprise Tier',
      badge: 'Exclusive',
      category: 'Enterprise',
      description: 'Fully custom solution designed for enterprise-grade scalability, advanced workflows, and mission-critical reliability.',
      highlights: [
        'Custom Architecture & Unlimited Scalability',
        'SLA-Backed 99.9% Availability & Support',
        'Multi-Branch & Multi-User Support',
        'Dedicated Account Director'
      ],
      itinerary: [
        { day: 'Phase 1', title: 'Enterprise Blueprint', desc: 'Deep architectural design and compliance alignment.' },
        { day: 'Phase 2', title: 'Enterprise Staging', desc: 'Integration testing, security audit, and user acceptance testing.' },
        { day: 'Phase 3', title: 'Global Rollout', desc: 'Phased deployment with zero downtime and staff training.' }
      ],
      inclusions: [
        'Unlimited License & Team Access',
        'Custom API Integrations',
        'Dedicated 24/7 SLA Hotline',
        'Annual On-Site Audit & Training'
      ]
    },
    {
      id: 'item-4',
      name: 'Artisanal Signature Collection',
      subtitle: 'Limited edition craftsmanship with unmatched elegance',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
      priceFrom: '$290',
      duration: 'Signature Unit',
      badge: 'Limited',
      category: 'Crafted Series',
      description: 'Carefully curated and handcrafted using only top-grade materials, delivering timeless appeal and exquisite finishing.',
      highlights: [
        'Hand-Selected Premium Raw Materials',
        'Individually Inspected & Numbered',
        'Eco-Friendly & Sustainable Production',
        'Exclusive Presentation Packaging'
      ],
      itinerary: [
        { day: 'Stage 1', title: 'Material Selection', desc: 'Ethical sourcing and precision grading of all raw materials.' },
        { day: 'Stage 2', title: 'Artisan Assembly', desc: 'Handcrafted production with rigorous multi-point inspection.' }
      ],
      inclusions: [
        'Certificate of Authenticity',
        'Lifetime Craftsmanship Warranty',
        'Luxury Gift Packaging Included'
      ]
    }
  ],
  
  curatedKicker: 'WHY CHOOSE US',
  curatedTitle: 'Excellence in Every Detail,',
  curatedTitleHighlight: 'Engineered For You',
  curatedSubtitle: 'Discover the core pillars that set our business apart—unmatched quality, dependable fulfillment, and personalized service.',
  curatedCtaText: 'Explore All Offerings',
  curatedPillars: [
    {
      id: 'p-1',
      title: 'Certified Quality',
      desc: 'Every product and service complies with the highest standards of quality, safety, and reliability.',
      iconType: 'shield'
    },
    {
      id: 'p-2',
      title: 'Customer-Centric Care',
      desc: 'Dedicated support specialists committed to your complete satisfaction from inquiry to delivery.',
      iconType: 'heart'
    },
    {
      id: 'p-3',
      title: 'Fast & Reliable Execution',
      desc: 'Rapid turnaround times, transparent communication, and dependable schedules you can count on.',
      iconType: 'zap'
    },
    {
      id: 'p-4',
      title: 'Award-Winning Expertise',
      desc: 'Over a decade of proven industry experience delivering exceptional value to thousands of clients.',
      iconType: 'award'
    }
  ],
  
  journalKicker: 'NEWS & INSIGHTS',
  journalTitle: 'Latest Updates, Articles & Stories',
  journalSubtitle: 'Stay informed with industry analysis, practical advice, product announcements, and company news.',
  journalArticles: [
    {
      id: 'story-1',
      title: '5 Key Standards Shaping Modern Business Quality',
      category: 'Industry Insights',
      date: 'June 10, 2024',
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      author: 'Executive Strategy Team',
      excerpt: 'How modern businesses maintain superior quality control and customer loyalty through transparent operations and innovation.',
      content: [
        'In today’s competitive landscape, delivering consistent quality is no longer just an advantage—it is the foundational benchmark of sustainable customer relationships.',
        'From rigorous internal audits to automated quality checkpoints, companies that invest in continuous refinement consistently outperform industry benchmarks.',
        'We believe that genuine excellence is revealed in every customer touchpoint, from initial discovery to long-term post-purchase support.'
      ]
    },
    {
      id: 'story-2',
      title: 'Streamlining Operations for Maximum Client Value',
      category: 'Operations',
      date: 'June 02, 2024',
      readTime: '5 min read',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      author: 'Operations Director',
      excerpt: 'A behind-the-scenes look at how we optimize our fulfillment cycle to deliver speed without sacrificing precision.',
      content: [
        'Efficiency and precision are not mutually exclusive. By modernizing our supply chain and workflow automations, we reduce friction and pass significant time savings to our clients.',
        'Our transparent reporting structures ensure that every client has full visibility into project milestones and deliverables at all times.'
      ]
    },
    {
      id: 'story-3',
      title: 'Sustainable Practices in Modern Production & Supply',
      category: 'Sustainability',
      date: 'May 28, 2024',
      readTime: '3 min read',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      author: 'Sustainability Lead',
      excerpt: 'Our commitment to eco-conscious sourcing, ethical workflows, and positive community impact.',
      content: [
        'Building a resilient future requires intentional choices today. We are proud to source materials responsibly, reduce packaging waste, and support local community initiatives.'
      ]
    }
  ],

  catalogKicker: 'LIVE STORE & INVENTORY',
  catalogTitle: 'Direct Catalog & Real-Time Ordering',
  showCatalog: true,

  phone: '9876543210',
  whatsapp: '9876543210',
  email: 'contact@apexenterprise.com',
  address: 'Main Commercial Hub, City Center, Suite 500',
  workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  googleMapsUrl: '',
  newsletterTitle: 'Stay Updated',
  newsletterSubtitle: 'Subscribe to our mailing list for latest product launches, exclusive offers, and industry updates.',
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com'
  },
  copyrightText: 'All rights reserved.',

  showHero: true,
  showDestinations: true,
  showCurated: true,
  showJournal: true,
  showNewsletter: true,
  showWhatsAppWidget: true,
  
  themeColor: 'gold'
};

// =========================================================================
// 1-CLICK INDUSTRY PRESETS FOR ALL BUSINESS TYPES
// =========================================================================
export const INDUSTRY_PRESETS: Record<string, { name: string; icon: string; config: Partial<WebsiteConfig> }> = {
  UNIVERSAL: {
    name: 'Universal Multi-Business',
    icon: '🏢',
    config: DEFAULT_WEBSITE_CONFIG
  },
  RETAIL: {
    name: 'Retail & Supermarket / Store',
    icon: '🛍️',
    config: {
      brandTagline: 'Curated Products & Everyday Essentials',
      brandSubtext: 'RETAIL & SHOPPING',
      destinationsKicker: 'FEATURED PRODUCTS',
      destinationsTitle: 'Best Selling Items & New Arrivals',
      destinationsSubtitle: 'Browse our curated collection of top-rated merchandise, premium goods, and exclusive specials.',
      curatedKicker: 'WHY SHOP WITH US',
      curatedTitle: 'Quality Guaranteed,',
      curatedTitleHighlight: 'Fast Delivery',
      curatedSubtitle: 'Enjoy seamless shopping with authentic products, secure payments, and hassle-free returns.',
      curatedCtaText: 'Browse Catalog',
      journalKicker: 'RETAIL STORIES & TRENDS',
      journalTitle: 'Shopping Guides & Product Reviews',
      catalogKicker: 'LIVE INVENTORY',
      catalogTitle: 'Browse All Store Items & Order via WhatsApp'
    }
  },
  RESTAURANT: {
    name: 'Restaurant, Cafe & Dining',
    icon: '🍽️',
    config: {
      brandTagline: 'Artisanal Flavors & Memorable Dining',
      brandSubtext: 'CULINARY & BISTRO',
      destinationsKicker: 'CHEF’S SPECIALS',
      destinationsTitle: 'Signature Dishes & Seasonal Menus',
      destinationsSubtitle: 'Experience handcrafted culinary creations prepared with farm-fresh organic ingredients.',
      curatedKicker: 'OUR CULINARY PROMISE',
      curatedTitle: 'Farm-to-Table Freshness,',
      curatedTitleHighlight: 'Master Craft',
      curatedSubtitle: 'Passionate chefs crafting authentic flavors with sustainable, locally-sourced ingredients.',
      curatedCtaText: 'View Full Menu',
      journalKicker: 'CULINARY JOURNAL',
      journalTitle: 'Chef Stories, Recipes & Wine Pairings',
      catalogKicker: 'LIVE MENU',
      catalogTitle: 'Order Online & Reserve Table'
    }
  },
  HEALTHCARE: {
    name: 'Healthcare, Clinic & Pharmacy',
    icon: '🏥',
    config: {
      brandTagline: 'Compassionate Care & Advanced Medicine',
      brandSubtext: 'HEALTHCARE & WELLNESS',
      destinationsKicker: 'OUR MEDICAL SERVICES',
      destinationsTitle: 'Specialized Treatments & Health Programs',
      destinationsSubtitle: 'Comprehensive health solutions delivered by experienced medical specialists and state-of-the-art technology.',
      curatedKicker: 'WHY PATIENTS TRUST US',
      curatedTitle: 'Patient-First Excellence,',
      curatedTitleHighlight: 'Certified Doctors',
      curatedSubtitle: 'Providing safe, compassionate, and personalized healthcare for you and your loved ones.',
      curatedCtaText: 'Book Appointment',
      journalKicker: 'HEALTH & WELLNESS',
      journalTitle: 'Doctor Advice & Preventive Care Tips',
      catalogKicker: 'PHARMACY & HEALTHCARE',
      catalogTitle: 'Medicines & Health Packages'
    }
  },
  SERVICES: {
    name: 'Professional Services & Consulting',
    icon: '💼',
    config: {
      brandTagline: 'Strategic Solutions & Measurable Growth',
      brandSubtext: 'PROFESSIONAL CONSULTING',
      destinationsKicker: 'OUR SERVICES & PACKAGES',
      destinationsTitle: 'Advisory, Strategy & Implementation',
      destinationsSubtitle: 'Helping businesses scale efficiently with tailored advisory, financial management, and technical solutions.',
      curatedKicker: 'OUR VALUE PROPOSITION',
      curatedTitle: 'Proven Results,',
      curatedTitleHighlight: 'Dedicated Specialists',
      curatedSubtitle: 'Data-driven insights, transparent communication, and guaranteed return on your investment.',
      curatedCtaText: 'Schedule Consultation',
      journalKicker: 'BUSINESS INSIGHTS',
      journalTitle: 'Industry Trends & Case Studies',
      catalogKicker: 'SERVICE CATALOG',
      catalogTitle: 'Standard Packages & Custom Quotations'
    }
  },
  CONSTRUCTION: {
    name: 'Construction, Hardware & Contracting',
    icon: '🛠️',
    config: {
      brandTagline: 'Building Strong Foundations for the Future',
      brandSubtext: 'CONSTRUCTION & HARDWARE',
      destinationsKicker: 'FEATURED PROJECTS & SUPPLIES',
      destinationsTitle: 'Turnkey Construction & Premium Materials',
      destinationsSubtitle: 'Industrial-grade materials, precision structural contracting, and architectural excellence.',
      curatedKicker: 'WHY BUILD WITH US',
      curatedTitle: 'Structural Durability,',
      curatedTitleHighlight: 'On-Time Delivery',
      curatedSubtitle: 'Certified engineers, heavy-duty materials, and rigorous safety compliance.',
      curatedCtaText: 'Request Project Quote',
      journalKicker: 'PROJECT DISPATCHES',
      journalTitle: 'Construction Insights & Material Guides',
      catalogKicker: 'HARDWARE INVENTORY',
      catalogTitle: 'Materials & Equipment Inquiries'
    }
  },
  EDUCATION: {
    name: 'Education, Coaching & Academy',
    icon: '🎓',
    config: {
      brandTagline: 'Empowering Minds & Accelerating Careers',
      brandSubtext: 'ACADEMY & TRAINING',
      destinationsKicker: 'FEATURED COURSES & PROGRAMS',
      destinationsTitle: 'Certified Mentorship & Skill Development',
      destinationsSubtitle: 'Learn from industry veterans with hands-on projects, real-world case studies, and career guidance.',
      curatedKicker: 'OUR LEARNING METHOD',
      curatedTitle: 'Practical Mastery,',
      curatedTitleHighlight: '1-on-1 Mentorship',
      curatedSubtitle: 'Interactive curriculum designed to fast-track your career and practical knowledge.',
      curatedCtaText: 'Enroll Now',
      journalKicker: 'CAMPUS & CAREER',
      journalTitle: 'Student Success Stories & Learning Tips',
      catalogKicker: 'COURSE CATALOG',
      catalogTitle: 'Programs & Batch Admissions'
    }
  },
  AUTOMOTIVE: {
    name: 'Automotive & Service Garage',
    icon: '🚗',
    config: {
      brandTagline: 'Precision Engineering & Vehicle Care',
      brandSubtext: 'AUTOMOTIVE SERVICES',
      destinationsKicker: 'OUR VEHICLE SERVICES',
      destinationsTitle: 'Diagnostics, Repairs & Maintenance',
      destinationsSubtitle: 'Complete automotive care powered by certified technicians and genuine OEM replacement parts.',
      curatedKicker: 'OUR SERVICE GUARANTEE',
      curatedTitle: 'Precision Diagnostics,',
      curatedTitleHighlight: 'Genuine Parts',
      curatedSubtitle: 'Transparent pricing, digital diagnostic reports, and warranty on all services.',
      curatedCtaText: 'Book Service Slot',
      journalKicker: 'AUTO GUIDE',
      journalTitle: 'Car Care Tips & Technical Insights',
      catalogKicker: 'PARTS & PACKAGES',
      catalogTitle: 'Genuine Spare Parts & Service Plans'
    }
  },
  HOSPITALITY: {
    name: 'Travel & Hospitality (Luxury)',
    icon: '✈️',
    config: {
      brandTagline: 'Curated Journeys, Extraordinary Places',
      brandSubtext: 'TRAVEL & HOSPITALITY',
      destinationsKicker: 'FEATURED EXPERIENCES',
      destinationsTitle: 'Handpicked Places, Unforgettable Stories',
      destinationsSubtitle: 'From hidden gems to iconic escapes, explore experiences that inspire awe and create memories that last a lifetime.',
      curatedKicker: 'CURATED EXPERIENCES',
      curatedTitle: 'More Than Travel,',
      curatedTitleHighlight: 'It’s Personal',
      curatedSubtitle: 'Every journey is designed around you. Your preferences, your pace, your passions.',
      curatedCtaText: 'Explore Experiences',
      journalKicker: 'TRAVEL JOURNAL',
      journalTitle: 'Insights, Inspiration & Travel Stories',
      catalogKicker: 'DIRECT CATALOG',
      catalogTitle: 'Live Offerings & Suites'
    }
  }
};
