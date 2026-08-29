import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CarouselSection from '@/components/CarouselSection';
import PartnerLogos from '@/components/PartnerLogos';
import LuxuryTravelExperts from '@/components/LuxuryTravelExperts';
import WhyIntoChinaSection from '@/components/WhyIntoChinaSection';
import ReadyToStart from '@/components/ReadyToStart';
import HomepageWayToTravel from '@/components/HomepageWayToTravel';
import PlanYourTrip from '@/pages/PlanYourTrip';
import ResponsiveImage from '@/components/ResponsiveImage';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useMediaObjectPosition } from '@/lib/media-position';


/**
 * Home Page
 * Design: Elegant luxury travel landing page with cultural carousel hero and travel package collages
 * Features: Auto-rotating hero carousel, travel package grid with collage images (2 per row)
 */

interface HeroSlide {
  id: number;
  image: string;
  title: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: '',
    title: 'Rural Life',
  },
  {
    id: 2,
    image: '',
    title: 'Mountain Majesty',
  },
];

function normalizeHeroImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((url): url is string => typeof url === 'string' && url.length > 0);
  }
  if (typeof value !== 'string' || value.length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((url): url is string => typeof url === 'string' && url.length > 0);
    }
  } catch {
    return [value];
  }
  return [];
}

interface Trip {
  id: string | number;
  eyebrow?: string;
  title: string;
  buttonText: string;
  image: string;
  href: string;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  // Image loading states
  const [heroBannerLoaded, setHeroBannerLoaded] = useState(false);
  const [heroLogoLoaded, setHeroLogoLoaded] = useState(false);
  const [tripImagesLoaded, setTripImagesLoaded] = useState<Record<string | number, boolean>>({});

  // 动态首页资产
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const getObjectPosition = useMediaObjectPosition();
  // 首页管理模块公开数据（hero/intro/stories/sponsors）
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();
  
  // Load published itineraries for Explore Our Trips.
  const { data: itineraries = [] } = trpc.cms.listItineraries.useQuery();
  
  const exploreTrips: Trip[] = itineraries.map((itinerary) => ({
    id: itinerary.id,
    eyebrow: itinerary.place || undefined,
    title: itinerary.name,
    buttonText: 'Explore Trip',
    image: itinerary.coverImage || itinerary.bannerImage || '',
    href: `/itinerary/${itinerary.slug}`,
  }));
  // 始终使用静态图片作为 fallback，只有 API 返回且有数据时才替换
  const FALLBACK_BANNER = '';
  const apiBanners = homepageAssets?.banners as Array<{ url: string; id: number }> | undefined;
  const activeLogo = '';
  // 若 homepage_hero 有 backgroundImage，优先使用；否则回退到 media assets banners
  const heroBackgroundImages = normalizeHeroImages(homepageData?.hero?.backgroundImage);
  const activeBanners = heroBackgroundImages.length > 0
    ? heroBackgroundImages
    : (apiBanners && apiBanners.length > 0) ? apiBanners.map((b) => b.url) : [FALLBACK_BANNER];
  const heroTitle = homepageData?.hero?.title || 'The Immersive China Experts';
  const heroSubtitle = homepageData?.hero?.subtitle || 'Tailor-made experiences, crafted with local insight.';

  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tripsShowLeftBtn, setTripsShowLeftBtn] = useState(false);
  const [tripsShowRightBtn, setTripsShowRightBtn] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  // ── Explore Our Trips: native DOM scrollLeft (same as GalleryStrip) ──
  const tripsTrackRef = useRef<HTMLDivElement>(null);
  const tripsDraggingRef = useRef(false);
  const tripsStartXRef = useRef(0);
  const tripsScrollStartRef = useRef(0);
  const tripsLastXRef = useRef(0);
  const tripsVelocityRef = useRef(0);
  const tripsRafRef = useRef<number | null>(null);

  const tripsCancelInertia = () => {
    if (tripsRafRef.current !== null) { cancelAnimationFrame(tripsRafRef.current); tripsRafRef.current = null; }
  };

  const tripsUpdateButtonVisibility = () => {
    const track = tripsTrackRef.current;
    if (!track) return;
    const isAtStart = track.scrollLeft <= 0;
    const isAtEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 10;
    setTripsShowLeftBtn(!isAtStart);
    setTripsShowRightBtn(!isAtEnd);
  };

  const tripsStartInertia = () => {
    const track = tripsTrackRef.current;
    if (!track) return;
    const step = () => {
      tripsVelocityRef.current *= 0.92;
      if (Math.abs(tripsVelocityRef.current) < 0.5) { tripsVelocityRef.current = 0; tripsUpdateButtonVisibility(); return; }
      track.scrollLeft -= tripsVelocityRef.current;
      tripsUpdateButtonVisibility();
      tripsRafRef.current = requestAnimationFrame(step);
    };
    tripsRafRef.current = requestAnimationFrame(step);
  };

  const tripsScrollBy = (delta: number) => {
    tripsCancelInertia();
    const track = tripsTrackRef.current;
    if (!track) return;
    const target = track.scrollLeft + delta;
    const duration = 420;
    const start = track.scrollLeft;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animStep = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = start + (target - start) * ease(t);
      if (t < 1) tripsRafRef.current = requestAnimationFrame(animStep);
    };
    tripsRafRef.current = requestAnimationFrame(animStep);
  };

  const tripsOnMouseDown = (e: React.MouseEvent) => {
    tripsCancelInertia();
    tripsDraggingRef.current = true;
    tripsStartXRef.current = e.pageX - (tripsTrackRef.current?.offsetLeft ?? 0);
    tripsScrollStartRef.current = tripsTrackRef.current?.scrollLeft ?? 0;
    tripsLastXRef.current = e.pageX;
    tripsVelocityRef.current = 0;
    if (tripsTrackRef.current) tripsTrackRef.current.style.cursor = 'grabbing';
  };

  const tripsOnMouseLeave = () => {
    if (!tripsDraggingRef.current) return;
    tripsDraggingRef.current = false;
    if (tripsTrackRef.current) tripsTrackRef.current.style.cursor = 'grab';
    tripsStartInertia();
  };

  const tripsOnMouseUp = () => {
    if (!tripsDraggingRef.current) return;
    tripsDraggingRef.current = false;
    if (tripsTrackRef.current) tripsTrackRef.current.style.cursor = 'grab';
    tripsStartInertia();
  };

  const tripsOnMouseMove = (e: React.MouseEvent) => {
    if (!tripsDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - (tripsTrackRef.current?.offsetLeft ?? 0);
    const walk = (x - tripsStartXRef.current) * 1.0;
    tripsVelocityRef.current = e.pageX - tripsLastXRef.current;
    tripsLastXRef.current = e.pageX;
    if (tripsTrackRef.current) {
      tripsTrackRef.current.scrollLeft = tripsScrollStartRef.current - walk;
      tripsUpdateButtonVisibility();
    }
  };

  useEffect(() => () => tripsCancelInertia(), []);

  useEffect(() => {
    const track = tripsTrackRef.current;
    if (!track) return;
    tripsUpdateButtonVisibility();
    // 监听滚动事件
    const handleScroll = () => tripsUpdateButtonVisibility();
    track.addEventListener('scroll', handleScroll);
    // 监听窗口 resize：更新 isDesktop
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      tripsUpdateButtonVisibility();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setHeroBannerLoaded(false);
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section - Full Screen Image Background */}
      <section className="relative w-full h-screen bg-black overflow-hidden">
        {/* Image Background */}
        <div className="relative w-full h-full">
          <div className="w-full h-full">
            {heroBannerLoaded && (
              <img
                src={activeBanners[currentSlide % activeBanners.length]}
                alt="China countryside landscape"
                className="w-full h-full object-cover object-center"
                style={{ objectPosition: getObjectPosition(activeBanners[currentSlide % activeBanners.length]) }}
                onLoad={() => setHeroBannerLoaded(true)}
                onError={() => setHeroBannerLoaded(false)}
              />
            )}
            {!heroBannerLoaded && (
              <img
                src={activeBanners[currentSlide % activeBanners.length]}
                alt="China countryside landscape"
                className="w-full h-full object-cover object-center"
                style={{ display: 'none' }}
                onLoad={() => setHeroBannerLoaded(true)}
                onError={() => setHeroBannerLoaded(false)}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Hero Logo - Center */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-4">
            {heroLogoLoaded && (
              <img
                src={activeLogo || ''}
                alt="Wellcometochina"
                style={{ height: 'clamp(60px, 12vw, 160px)', width: 'auto', maxWidth: '60vw', objectFit: 'contain' }}
                onLoad={() => setHeroLogoLoaded(true)}
                onError={() => setHeroLogoLoaded(false)}
              />
            )}
            {!heroLogoLoaded && activeLogo && (
              <img
                src={activeLogo}
                alt="Wellcometochina"
                style={{ height: 'clamp(60px, 12vw, 160px)', width: 'auto', maxWidth: '60vw', objectFit: 'contain', display: 'none' }}
                onLoad={() => setHeroLogoLoaded(true)}
                onError={() => setHeroLogoLoaded(false)}
              />
            )}
            {heroLogoLoaded && <div className="w-32 h-px bg-[#F5F3EF]"></div>}
          </div>
        </div>

        {/* Hero Text - Center */}
        <div className="absolute inset-0 flex items-center justify-center z-30 px-6">
          <div style={{ width: 'min(980px, 92vw)', textAlign: 'center', color: '#fff', transform: 'translateY(3vh)' }}>
            <h1
              style={{
                fontFamily: "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)",
                fontSize: 'clamp(36px, 6vw, 77px)',
                fontWeight: 400,
                letterSpacing: '0.045em',
                lineHeight: 0.88,
                textTransform: 'uppercase',
                margin: '0 0 18px',
                textShadow: '0 3px 20px rgba(0,0,0,0.38)',
              }}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-travel-sans, 'Cabin', 'Josefin Sans', 'Helvetica Neue', Arial, sans-serif)",
                fontSize: 'clamp(10px, 1.03vw, 14px)',
                fontWeight: 500,
                letterSpacing: '0.13em',
                lineHeight: 1.45,
                textTransform: 'uppercase',
                margin: 0,
                textShadow: '0 2px 14px rgba(0,0,0,0.42)',
              }}
            >
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Luxury Travel Experts Section */}
      <div className="bg-[#F5F3EF]">
        <LuxuryTravelExperts />
      </div>

      {/* Plan Your Trip Section */}
      <PlanYourTrip />

      {/* Way to Travel first-level categories */}
      <HomepageWayToTravel settings={homepageData?.wayToTravelSection} />

      {/* Explore Our Trips Section - native DOM scrollLeft, zero jank */}
      <div
        className="w-full relative flex flex-col lg:flex-row lg:items-center"
        style={{
          minHeight: '680px',
          paddingTop: '50px',
          paddingBottom: '50px',
          backgroundImage: `url(${activeBanners[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: getObjectPosition(activeBanners[0]),
          backgroundAttachment: 'scroll',
        }}
      >
        {/* Dark frosted glass overlay */}
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', backgroundColor: 'rgba(10,10,10,0.85)', zIndex: 0 }} />

        {/* Mobile: Title above carousel */}
        <div className="lg:hidden w-full px-6 mb-6 relative z-10">
          <h2 style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: 400, fontSize: '28px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '12px', lineHeight: 1.1 }}>
            Explore Our Trips
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: 1.6 }}>
            Explore our sample trips or get in touch to begin your bespoke adventure.
          </p>
        </div>

        {/* Left Nav Button - Desktop only; hidden when at leftmost position */}
        {isDesktop && (
          <button
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: tripsShowLeftBtn ? 1 : 0, pointerEvents: tripsShowLeftBtn ? 'auto' : 'none' }}
            onClick={() => tripsScrollBy(-600)}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} color="white" strokeWidth={2} />
          </button>
        )}

        {/* Scroll track */}
        <div
          ref={tripsTrackRef}
          className="similar-track"
          onMouseDown={tripsOnMouseDown}
          onMouseLeave={tripsOnMouseLeave}
          onMouseUp={tripsOnMouseUp}
          onMouseMove={tripsOnMouseMove}
          style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'scroll', overflowY: 'hidden', cursor: 'grab', userSelect: 'none', paddingLeft: isDesktop ? '60px' : '24px', paddingRight: isDesktop ? '60px' : '24px' } as React.CSSProperties}
        >
          <div style={{ display: 'flex', flexDirection: 'row', gap: '25px', alignItems: 'flex-start', minWidth: 'max-content', paddingBottom: '8px' }}>
            {/* 大屏左边 20vw 空白占位，竖屏不显示 */}
            {isDesktop && <div style={{ width: '20vw', flexShrink: 0 }} />}
            {/* Title block - Desktop only (JS controlled) */}
            {isDesktop && (
              <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '8px' }}>
                <h2 style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: '700', fontSize: '32px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '16px', lineHeight: 1.1 }}>
                  Explore Our Trips
                </h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  Explore our sample trips or get in touch to begin your bespoke adventure.
                </p>
              </div>
            )}
            {/* Trip Cards */}
            {exploreTrips.map((trip) => (
              <div key={trip.id} className="relative group overflow-hidden flex-shrink-0" style={{ width: '310px', height: '550px', userSelect: 'none' }}>
                {tripImagesLoaded[trip.id] && (
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: getObjectPosition(trip.image) }}
                    draggable={false}
                    onLoad={() => setTripImagesLoaded(prev => ({ ...prev, [trip.id]: true }))}
                    onError={() => setTripImagesLoaded(prev => ({ ...prev, [trip.id]: false }))}
                  />
                )}
                {!tripImagesLoaded[trip.id] && trip.image && (
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    draggable={false}
                    style={{ display: 'none' }}
                    onLoad={() => setTripImagesLoaded(prev => ({ ...prev, [trip.id]: true }))}
                    onError={() => setTripImagesLoaded(prev => ({ ...prev, [trip.id]: false }))}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                  {trip.eyebrow && <div className="text-xs font-bold uppercase tracking-wider text-yellow-300 text-right" style={{color: '#ffffff', fontWeight: '500'}}>{trip.eyebrow}</div>}
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider mb-4 leading-tight opacity-85" style={{fontWeight: '300'}}>{trip.title}</h3>
                    <button
                      className="trip-btn px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 opacity-85 relative overflow-hidden active:scale-95"
                      style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.color = '#111'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.55)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // ripple effect
                        const btn = e.currentTarget;
                        const circle = document.createElement('span');
                        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
                        const radius = diameter / 2;
                        const rect = btn.getBoundingClientRect();
                        circle.style.cssText = `position:absolute;width:${diameter}px;height:${diameter}px;left:${e.clientX - rect.left - radius}px;top:${e.clientY - rect.top - radius}px;background:rgba(255,255,255,0.35);border-radius:50%;transform:scale(0);animation:ripple 0.5s linear;pointer-events:none;`;
                        btn.appendChild(circle);
                        setTimeout(() => circle.remove(), 600);
                      }}
                      onClick={(e) => { e.stopPropagation(); navigate(trip.href); }}
                    >
                      {trip.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* View More */}
            <div className="flex-shrink-0" style={{ width: '155px', height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <button
                className="px-6 py-3 rounded-sm transition-all duration-300 bg-white/20 border border-white/50 text-white font-semibold uppercase tracking-wider text-sm"
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#ffffff'; }}
              >View More</button>
            </div>
          </div>
        </div>

        {/* Right Nav Button - Desktop only; hidden when at rightmost position */}
        {isDesktop && (
          <button
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: tripsShowRightBtn ? 1 : 0, pointerEvents: tripsShowRightBtn ? 'auto' : 'none' }}
            onClick={() => tripsScrollBy(600)}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} color="white" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Discover China Carousel Section */}
      <CarouselSection />

      {/* Partner Logos Section */}
      <div style={{ marginTop: '48px' }}>
        <PartnerLogos />
      </div>

      {/* Why Into China Section */}
      <WhyIntoChinaSection />

      {/* Ready To Start CTA */}
      <ReadyToStart />

      {/* Footer */}
      <Footer />
    </div>
  );
}
