import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { trpc } from '../lib/trpc';
import { useMediaObjectPosition } from '../lib/media-position';

// ─── Types (mirrors AdminItineraries) ────────────────────────────────────────

interface ItineraryBlock {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  image?: string;
  images?: string[];
}

interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  daysRange: string;
  blocks: ItineraryBlock[];
  galleryImages: string[];
}

const ITIN_DISPLAY = "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)";
const ITIN_SANS = "var(--font-travel-sans, 'Cabin', 'Helvetica Neue', Arial, sans-serif)";
const BT_PINK = '#e7247a';
const BT_GREEN = '#379c8a';
const BT_BLUE = '#5160a6';
const BT_TEXT = '#444444';
const BT_DARK = '#2f2f2f';

// ─── Gallery Strip ────────────────────────────────────────────────────────────

function GalleryStrip({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef<number | null>(null);

  const cancelInertia = () => {
    if (rafId.current !== null) { cancelAnimationFrame(rafId.current); rafId.current = null; }
  };

  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocity.current *= 0.92;
      if (Math.abs(velocity.current) < 0.5) { velocity.current = 0; return; }
      track.scrollLeft -= velocity.current;
      rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    cancelInertia();
    isDragging.current = true;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeftStart.current = trackRef.current?.scrollLeft ?? 0;
    lastX.current = e.pageX;
    velocity.current = 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };
  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startX.current) * 1.0;
    velocity.current = e.pageX - lastX.current;
    lastX.current = e.pageX;
    if (trackRef.current) { trackRef.current.scrollLeft = scrollLeftStart.current - walk; }
  };

  const scrollBy = (delta: number) => {
    cancelInertia();
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, track.scrollLeft + delta));
    const duration = 420;
    const start = track.scrollLeft;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animStep = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = start + (target - start) * ease(t);
      if (t < 1) rafId.current = requestAnimationFrame(animStep);
    };
    rafId.current = requestAnimationFrame(animStep);
  };

  if (images.length === 0) return null;

  const btnStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 20, flexShrink: 0, transition: 'background 0.2s',
  };

  return (
    <div className="gallery-strip-container" style={{ width: '100%', background: '#222', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      <button style={{ ...btnStyle, left: '16px' }} onClick={() => scrollBy(-600)}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}>
        <ChevronLeft size={20} color="white" strokeWidth={2} />
      </button>
      <div ref={trackRef} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
        className="gallery-track"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'scroll', overflowY: 'hidden', width: '100%', height: '100%', paddingLeft: '12px', paddingRight: '12px', cursor: 'grab', userSelect: 'none', overscrollBehaviorX: 'none' } as React.CSSProperties}>
        {images.map((img, idx) => (
          <div key={idx} className="gallery-img-responsive" style={{ flexShrink: 0, overflow: 'hidden', borderRadius: '4px' }}>
            <img src={img} alt="" draggable={false} style={{ height: '100%', width: 'auto', display: 'block', pointerEvents: 'none' }} />
          </div>
        ))}
      </div>
      <button style={{ ...btnStyle, right: '16px' }} onClick={() => scrollBy(600)}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}>
        <ChevronRight size={20} color="white" strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Image Carousel ───────────────────────────────────────────────────────────

const CURSOR_LEFT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='14' fill='rgba(0%2C0%2C0%2C0.45)'/%3E%3Cpolyline points='17%2C10 12%2C15 17%2C20' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 15 15, w-resize`;
const CURSOR_RIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='14' fill='rgba(0%2C0%2C0%2C0.45)'/%3E%3Cpolyline points='13%2C10 18%2C15 13%2C20' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 15 15, e-resize`;

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const getObjectPosition = useMediaObjectPosition();
  const [current, setCurrent] = useState(0);
  const [mouseOnLeft, setMouseOnLeft] = useState(false);
  const [mouseInside, setMouseInside] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);
  const [prev, setPrev] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!mouseInside || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const { x, y } = lastMousePos.current;
      if (!(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) setMouseInside(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mouseInside]);

  const navigate = (dir: 'next' | 'prev') => {
    if (animating || images.length <= 1) return;
    const nextIdx = dir === 'next' ? (current + 1) % images.length : (current - 1 + images.length) % images.length;
    setDirection(dir);
    setPrev(current);
    setCurrent(nextIdx);
    setAnimKey(k => k + 1);
    setAnimating(true);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 460);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setMouseInside(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouseOnLeft(e.clientX - rect.left < rect.width / 2);
  };

  const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); navigate(mouseOnLeft ? 'prev' : 'next'); };
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { e.stopPropagation(); navigate(dx < 0 ? 'next' : 'prev'); }
  };

  const exitTo = direction === 'next' ? '-100%' : '100%';
  const enterFrom = direction === 'next' ? '100%' : '-100%';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: images.length > 1 ? (mouseInside ? (mouseOnLeft ? CURSOR_LEFT : CURSOR_RIGHT) : 'pointer') : 'default' }}
      onClick={handleClick} onMouseMove={handleMouseMove} onMouseLeave={() => setMouseInside(false)}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {prev !== null && (
        <img key={`prev-${animKey}`} src={images[prev]} alt={alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: getObjectPosition(images[prev]), animation: `slideOut 460ms cubic-bezier(0.23,1,0.32,1) forwards`, ['--exit-to' as any]: exitTo }} />
      )}
      <img key={`curr-${animKey}`} src={images[current]} alt={alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: getObjectPosition(images[current]), animation: prev !== null ? `slideIn 460ms cubic-bezier(0.23,1,0.32,1) forwards` : 'none', ['--enter-from' as any]: enterFrom }} />
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10, pointerEvents: 'none' }}>
          {images.map((_, idx) => (
            <div key={idx} style={{ width: '7px', height: '7px', borderRadius: '50%', background: idx === current ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.45)', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Similar Trips ────────────────────────────────────────────────────────────

interface Trip {
  id: string | number;
  nights?: number;
  title: string;
  buttonText: string;
  image: string;
}

function SimilarTripsSection({ currentSlug }: { currentSlug: string }) {
  const [, navigate] = useLocation();
  const getObjectPosition = useMediaObjectPosition();
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  const { data: rawItineraries = [] } = trpc.cms.listItineraries.useQuery();
  
  const itineraries: Trip[] = rawItineraries
    .filter(i => i.slug !== currentSlug)
    .map((itin) => ({
      id: itin.id,
      nights: itin.days,
      title: itin.name,
      buttonText: 'Explore Trip',
      image: itin.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    }));

  const cancelInertia = () => {
    if (rafIdRef.current !== null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
  };

  const updateBtnVisibility = () => {
    const track = trackRef.current;
    if (!track) return;
    const isAtStart = track.scrollLeft <= 0;
    const isAtEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 10;
    setShowLeftBtn(!isAtStart);
    setShowRightBtn(!isAtEnd);
  };

  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) < 0.5) { velocityRef.current = 0; updateBtnVisibility(); return; }
      track.scrollLeft -= velocityRef.current;
      updateBtnVisibility();
      rafIdRef.current = requestAnimationFrame(step);
    };
    rafIdRef.current = requestAnimationFrame(step);
  };

  const scrollBy = (delta: number) => {
    cancelInertia();
    const track = trackRef.current;
    if (!track) return;
    const target = track.scrollLeft + delta;
    const duration = 420;
    const start = track.scrollLeft;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animStep = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = start + (target - start) * ease(t);
      if (t < 1) rafIdRef.current = requestAnimationFrame(animStep);
    };
    rafIdRef.current = requestAnimationFrame(animStep);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    cancelInertia();
    isDraggingRef.current = true;
    startXRef.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeftStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.pageX;
    velocityRef.current = 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };

  const onMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startXRef.current) * 1.0;
    velocityRef.current = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;
    if (trackRef.current) {
      trackRef.current.scrollLeft = scrollLeftStartRef.current - walk;
      updateBtnVisibility();
    }
  };

  useEffect(() => () => cancelInertia(), []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateBtnVisibility();
    const handleScroll = () => updateBtnVisibility();
    track.addEventListener('scroll', handleScroll);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      updateBtnVisibility();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (itineraries.length === 0) return null;

  return (
    <div
      className="w-full relative flex flex-col lg:flex-row lg:items-center"
      style={{
        minHeight: '680px',
        paddingTop: '50px',
        paddingBottom: '50px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Mobile: Title above carousel */}
      <div className="lg:hidden w-full px-6 mb-6 relative z-10">
        <h2 style={{ fontFamily: ITIN_DISPLAY, fontWeight: 400, fontSize: '34px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px', lineHeight: 0.95 }}>
          Explore Our Trips
        </h2>
        <p style={{ fontFamily: ITIN_SANS, fontSize: '15px', color: '#666', fontStyle: 'italic', lineHeight: 1.55, letterSpacing: '0.02em' }}>
          Explore our sample trips or get in touch to begin your bespoke adventure.
        </p>
      </div>

      {/* Left Nav Button - Desktop only */}
      {isDesktop && (
        <button
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: showLeftBtn ? 1 : 0, pointerEvents: showLeftBtn ? 'auto' : 'none' }}
          onClick={() => scrollBy(-600)}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} color="white" strokeWidth={2} />
        </button>
      )}

      {/* Scroll track */}
      <div
        ref={trackRef}
        className="similar-track"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'scroll', overflowY: 'hidden', cursor: 'grab', userSelect: 'none', paddingLeft: isDesktop ? '60px' : '24px', paddingRight: isDesktop ? '60px' : '24px' } as React.CSSProperties}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: '25px', alignItems: 'flex-start', minWidth: 'max-content', paddingBottom: '8px' }}>
          {/* 大屏左边 20vw 空白占位，竖屏不显示 */}
          {isDesktop && <div style={{ width: '20vw', flexShrink: 0 }} />}
          {/* Title block - Desktop only (JS controlled) */}
          {isDesktop && (
            <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '8px' }}>
              <h2 style={{ fontFamily: ITIN_DISPLAY, fontWeight: 400, fontSize: '40px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px', lineHeight: 0.95 }}>
                Explore Our Trips
              </h2>
              <p style={{ fontFamily: ITIN_SANS, fontSize: '17px', color: '#666', fontStyle: 'italic', lineHeight: 1.5, letterSpacing: '0.02em' }}>
                Explore our sample trips or get in touch to begin your bespoke adventure.
              </p>
            </div>
          )}
          {/* Trip Cards */}
          {(itineraries && itineraries.length > 0 ? itineraries : []).map((trip) => (
            <div key={trip.id} className="relative group overflow-hidden flex-shrink-0" style={{ width: '310px', height: '550px', userSelect: 'none' }}>
              <img src={trip.image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: getObjectPosition(trip.image) }} draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                {trip.nights && <div className="text-xs font-bold uppercase tracking-wider text-yellow-300 text-right" style={{ fontFamily: ITIN_SANS, color: '#ffffff', fontWeight: 700, letterSpacing: '0.1em' }}>{trip.nights} NIGHTS</div>}
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider mb-4 leading-tight opacity-85" style={{ fontFamily: ITIN_SANS, fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1.25 }}>{trip.title}</h3>
                  <button
                    className="trip-btn px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 opacity-85 relative overflow-hidden active:scale-95"
                    style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', fontFamily: ITIN_SANS, letterSpacing: '0.1em' }}
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
                    onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.id}`); }}
                  >
                    {trip.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* View More */}
          <div className="flex-shrink-0" style={{ width: '155px', height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              style={{
                backgroundColor: '#111111',
                color: '#ffffff',
                fontFamily: ITIN_SANS,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '14px 36px',
                border: '2px solid #111111',
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s, transform 0.1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#111111';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#111111';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >View More</button>
          </div>
        </div>
      </div>

      {/* Right Nav Button - Desktop only */}
      {isDesktop && (
        <button
          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: showRightBtn ? 1 : 0, pointerEvents: showRightBtn ? 'auto' : 'none' }}
          onClick={() => scrollBy(600)}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} color="white" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ItineraryDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [activeSection, setActiveSection] = useState('overview');
  const getObjectPosition = useMediaObjectPosition();

  const { data: itin, isLoading, error } = trpc.cms.getItineraryBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const ctaTexture = (homepageAssets as any)?.cta?.url || '';
  const ctaTextureOpacity = Math.max(0, Math.min(1, Number((homepageAssets as any)?.cta?.opacity ?? 28) / 100));

  // Parse sections - handle both JSON string and array formats
  let sections: ItinerarySection[] = [];
  if (itin?.sections) {
    try {
      let parsed = itin.sections;
      // Handle multiple levels of JSON stringification
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      sections = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      sections = [];
    }
  }
  const navSections = [
    { id: 'overview', label: 'Overview' },
    ...sections.map(s => ({ id: `section-${s.id}`, label: s.title || 'Section' })),
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      setActiveSection(id);
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navigation />
        <p style={{ fontSize: '14px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    );
  }

  if (error || !itin) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Navigation />
        <p style={{ fontSize: '14px', color: '#888' }}>Itinerary not found.</p>
      </div>
    );
  }

  const timelineColor = (itin as any).timelineColor || '#52b788';

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: ITIN_SANS, color: BT_TEXT }}>
      <style>{`
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(var(--exit-to)); }
        }
        @keyframes slideIn {
          from { transform: translateX(var(--enter-from)); }
          to { transform: translateX(0); }
        }
      `}</style>

      <Navigation />

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {itin.bannerImage ? (
          <img src={itin.bannerImage} alt={itin.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: getObjectPosition(itin.bannerImage) }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(46px, 6vw, 60px)', letterSpacing: '3px', fontFamily: ITIN_DISPLAY, fontWeight: 400, lineHeight: 0.9, margin: '0 0 20px', maxWidth: '980px', textTransform: 'uppercase', textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)' }}>
            {itin.name}
          </h1>
          {itin.shortDescription && (
            <p style={{ color: '#fff', fontSize: 'clamp(15px, 1.5vw, 19px)', fontFamily: ITIN_SANS, fontWeight: 700, letterSpacing: '0.09em', margin: 0, maxWidth: '900px', lineHeight: 1.4, textTransform: 'uppercase' }}>
              {itin.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* ── SECTION NAV ── */}
      <div className="w-full" style={{ height: '48px', backgroundColor: '#F3F3F3' }}>
        <style>{`
          .tab-underline { position: relative; padding-bottom: 2px; }
          .tab-underline::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: #F5569B; transition: width 0.25s ease; }
          .tab-underline:hover::after, .tab-underline.tab-active::after { width: 100%; }
        `}</style>
        <div className="h-full flex items-center justify-center px-4 md:px-0">
          <nav className="flex gap-3 md:gap-12 h-full items-center flex-wrap md:flex-nowrap justify-center">
            {navSections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`tab-underline text-xs font-semibold uppercase tracking-wider text-black flex-shrink-0 ${activeSection === s.id ? 'tab-active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      <div id="overview" style={{ maxWidth: '760px', margin: '0 auto', padding: '64px 24px', textAlign: 'center', scrollMarginTop: '60px' }}>
        <h2 style={{ fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 400, lineHeight: 0.98, marginBottom: '30px', color: '#000', fontFamily: ITIN_DISPLAY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {itin.overviewTitle || itin.name}
        </h2>
        {itin.description && (
          <p style={{ fontSize: '17px', color: BT_TEXT, lineHeight: 1.58, fontFamily: ITIN_SANS, letterSpacing: '0.03em', marginBottom: '48px' }}>
            {itin.description}
          </p>
        )}

        {/* WHEN / PRICE / HOW LONG */}
        {(itin.when || itin.price || itin.howLong) && (
          <div>
            <div style={{ width: 48, height: 1, background: '#ccc', margin: '0 auto 32px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              {itin.when && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase', color: BT_PINK, marginBottom: '10px', fontFamily: ITIN_DISPLAY }}>When</p>
                  <p style={{ fontStyle: 'italic', fontSize: '17px', color: '#666', lineHeight: 1.5, fontFamily: ITIN_SANS }}>{itin.when}</p>
                </div>
              )}
              {itin.price && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase', color: BT_GREEN, marginBottom: '10px', fontFamily: ITIN_DISPLAY }}>Price</p>
                  <p style={{ fontStyle: 'italic', fontSize: '17px', color: '#666', lineHeight: 1.5, fontFamily: ITIN_SANS }}>{itin.price}</p>
                </div>
              )}
              {itin.howLong && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase', color: BT_BLUE, marginBottom: '10px', fontFamily: ITIN_DISPLAY }}>How long</p>
                  <p style={{ fontStyle: 'italic', fontSize: '17px', color: '#666', lineHeight: 1.5, fontFamily: ITIN_SANS }}>{itin.howLong}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── ITINERARY SECTIONS ── */}
      {sections.map((section, si) => (
        <React.Fragment key={section.id}>
          <div id={`section-${section.id}`} style={{ backgroundColor: '#ededed', position: 'relative', scrollMarginTop: '60px' }}>
            <div style={{ display: 'flex', padding: '0 24px 0 0', maxWidth: '1100px', margin: '0 auto' }}>
              {/* Left: timeline */}
              <div style={{ width: '55px', flexShrink: 0, position: 'relative', alignSelf: 'stretch' }}>
                <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: `repeating-linear-gradient(to bottom, ${timelineColor} 0px, ${timelineColor} 3px, transparent 3px, transparent 5px)`, transform: 'translateX(-50%)', zIndex: 0 }} />
                {section.blocks.map((_, i) => {
                  const HEADER = 210, GAP = 50;
                  let topOffset = HEADER;
                  for (let j = 0; j < i; j++) topOffset += (j % 2 === 0 ? 480 : 510) + GAP;
                  return (
                    <div key={i} style={{ position: 'absolute', left: '20px', top: `${topOffset + 40}px`, width: '15px', height: '15px', borderRadius: '50%', background: timelineColor, zIndex: 3, transform: 'translateX(-50%)', pointerEvents: 'none' }} />
                  );
                })}
              </div>

              {/* Right: content */}
              <div style={{ flex: 1, minWidth: 0, maxWidth: '964px' }}>
                {/* Section header */}
                <div style={{ paddingTop: '64px', paddingBottom: '32px' }}>
                  <h2 style={{ fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ITIN_DISPLAY, marginBottom: '16px', color: '#000', lineHeight: 0.98 }}>
                    {section.title}
                  </h2>
                  {section.description && (
                    <p style={{ fontSize: '17px', color: BT_TEXT, lineHeight: 1.58, fontFamily: ITIN_SANS, letterSpacing: '0.03em', maxWidth: '640px' }}>
                      {section.description}
                    </p>
                  )}
                  {section.daysRange && (
                    <p style={{ marginTop: '16px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, fontFamily: ITIN_SANS, color: BT_GREEN }}>
                      {section.daysRange}
                    </p>
                  )}
                </div>

                {/* Day cards */}
                <div style={{ paddingBottom: '64px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                    {section.blocks.map((block, i) => {
                      const imageLeft = i % 2 === 1;
                      const cardHeight = i % 2 === 0 ? '480px' : '510px';
                      const images = block.images?.length ? block.images : block.image ? [block.image] : [];
                      return (
                        <div key={block.id}>
                          <div style={{ display: 'flex', flexDirection: imageLeft ? 'row' : 'row-reverse', width: '100%', maxWidth: '964px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '4px 4px 16px rgba(0,0,0,0.13)', height: cardHeight }}>
                            {/* Image side */}
                            {images.length > 0 ? (
                              <div style={{ width: '45%', flexShrink: 0, overflow: 'hidden' }}>
                                <ImageCarousel images={images} alt={block.title} />
                              </div>
                            ) : (
                              <div style={{ width: '45%', flexShrink: 0, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#aaa', letterSpacing: '0.1em' }}>No Image</span>
                              </div>
                            )}
                            {/* Text side */}
                            <div style={{ flex: 1, padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden' }}>
                              <p style={{ fontFamily: ITIN_SANS, fontSize: '12px', letterSpacing: '0.1em', color: BT_GREEN, fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                                DAY {block.dayNumber}
                              </p>
                              <h3 style={{ fontFamily: ITIN_DISPLAY, fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '18px', lineHeight: 0.98, color: '#000' }}>
                                {block.title}
                              </h3>
                              <p style={{ fontFamily: ITIN_SANS, fontSize: '17px', color: BT_TEXT, lineHeight: 1.58, letterSpacing: '0.03em' }}>
                                {block.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery strip after each section */}
          {section.galleryImages.length > 0 && (
            <GalleryStrip images={section.galleryImages} />
          )}
        </React.Fragment>
      ))}

      {/* ── SIMILAR TRIPS ── */}
      <SimilarTripsSection currentSlug={slug!} />

      {/* ── ENQUIRE CTA ── */}
      <section style={{ position: 'relative', width: '100%', height: 'clamp(260px, 30vw, 275px)', backgroundColor: '#a84900', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: ctaTexture ? `url(${ctaTexture})` : '', backgroundSize: '420px 420px', backgroundRepeat: 'repeat', opacity: ctaTextureOpacity, mixBlendMode: 'normal', filter: 'contrast(1.45) brightness(1.08)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', textAlign: 'center', padding: '0 24px' }}>
          <h2 style={{ fontFamily: ITIN_DISPLAY, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 400, color: '#ffffff', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, lineHeight: 0.95 }}>
            So, ready to start?
          </h2>
          <a href="/make-an-enquiry">
            <button
              style={{ backgroundColor: '#111111', color: '#ffffff', fontFamily: ITIN_SANS, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 36px', border: '2px solid #111111', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s, transform 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#111111'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Get in Touch
            </button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
