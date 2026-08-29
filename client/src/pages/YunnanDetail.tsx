import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { trpc } from '../lib/trpc';

type Trip = {
  id: string | number;
  nights?: number;
  title: string;
  buttonText: string;
  image: string;
};

/**
 * YunnanDetail - /experiences/2
 * Design: Black Tomato-inspired luxury trip detail page
 * Layout: Full-screen hero → sticky section nav → overview → day-by-day cards (left image, right text) → full-width dual image dividers → similar trips
 * Color: White bg, black text, accent green for labels/CTA
 */

const similarAllTrips: Trip[] = [
  {
    id: '1',
    nights: 10,
    title: 'YUNNAN EXPLORER',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    nights: 7,
    title: 'ANCIENT SILK ROAD',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    nights: 12,
    title: 'TIBETAN HIGHLANDS',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=400&fit=crop',
  },
];

const sections = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'lijiang', label: 'LIJIANG' },
  { id: 'shangri-la', label: 'SHANGRI-LA' },
  { id: 'other', label: 'OTHER EXPERIENCES' },
];

const days = [
  {
    section: 'lijiang',
    dayRange: 'DAYS 1–3',
    sectionTitle: 'LIJIANG',
    sectionDesc: 'Your journey begins in one of China\'s most enchanting ancient towns. Lijiang\'s cobblestone lanes, carved wooden facades, and the ever-present sound of running water set the tone for everything that follows.',
    items: [
      {
        day: 'DAY 1',
        title: 'ARRIVAL IN THE OLD TOWN',
        desc: 'Settle into your courtyard guesthouse in the heart of Lijiang\'s UNESCO-listed Old Town. This evening, your guide will take you on a quiet walk through the lantern-lit alleys — away from the tourist crowds — to a family-run restaurant where the Naxi grandmother still cooks every dish by hand.',
        images: [
          'https://images.unsplash.com/photo-1548013146-72479768bada?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=700&h=520&fit=crop',
        ],
      },
      {
        day: 'DAY 2',
        title: 'JADE DRAGON SNOW MOUNTAIN',
        desc: 'Rise early to beat the crowds to Jade Dragon Snow Mountain. At 5,596 metres, its glaciers glow in the morning light. After descending, spend the afternoon in Baisha Village — a living museum of Naxi frescoes painted by a monk who once treated Ernest Hemingway.',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&h=520&fit=crop',
        ],
      },
      {
        day: 'DAY 3',
        title: 'TIGER LEAPING GORGE',
        desc: 'One of the world\'s deepest gorges, carved by the Jinsha River between two mountains. You\'ll hike the high trail — a path that rewards every step with views that feel almost impossibly grand. Lunch is a simple affair at a family guesthouse perched on the cliff edge.',
        images: [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&h=520&fit=crop',
        ],
      },
    ],
  },
  {
    section: 'shangri-la',
    dayRange: 'DAYS 4–7',
    sectionTitle: 'SHANGRI-LA',
    sectionDesc: 'Higher, quieter, and closer to Tibet. The town once known as Zhongdian was renamed Shangri-La in 2001 — and the landscape lives up to the legend. Tibetan monasteries, alpine meadows, and a pace of life that feels genuinely unhurried.',
    items: [
      {
        day: 'DAY 4',
        title: 'THE ROAD TO SHANGRI-LA',
        desc: 'The drive north from Lijiang is itself a highlight — a slow ascent through pine forests and past turquoise lakes. Arrive in time for evening prayers at Ganden Sumtseling Monastery, the largest Tibetan Buddhist monastery in Yunnan, its golden rooftops catching the last light of the day.',
        images: [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1548013146-72479768bada?w=700&h=520&fit=crop',
        ],
      },
      {
        day: 'DAY 5',
        title: 'POTATSO NATIONAL PARK',
        desc: 'China\'s first national park to be managed according to international standards. Walk the boardwalk trails through ancient spruce forests, past Shudu Lake where black-necked cranes wade in the shallows. Your guide knows where the yaks graze at dawn — and where to find silence.',
        images: [
          'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&h=520&fit=crop',
        ],
      },
      {
        day: 'DAY 6',
        title: 'A TIBETAN HOME STAY',
        desc: 'Spend the night with a Tibetan farming family in a traditional wooden house. Help prepare tsampa — roasted barley flour mixed with yak butter tea — and learn a little of the daily rhythms that have shaped this plateau for centuries. The stars here are extraordinary.',
        images: [
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=700&h=520&fit=crop',
        ],
      },
      {
        day: 'DAY 7',
        title: 'ALPINE MEADOWS & DEPARTURE',
        desc: 'A final morning walk through the Napa Lake wetlands — flamingos in winter, wildflowers in summer — before your transfer back to Lijiang for your onward flight. The mountains stay with you long after you\'ve left them.',
        images: [
          'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&h=520&fit=crop',
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&h=520&fit=crop',
        ],
      },
    ],
  },
];

const similarTrips = [
  {
    id: '1',
    title: 'Sichuan: Culture & Nature',
    nights: 12,
    price: 'From £5,200pp',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    title: "Xi'an: Imperial Legacy",
    nights: 8,
    price: 'From £3,800pp',
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    title: 'Hangzhou: West Lake Serenity',
    nights: 9,
    price: 'From £4,100pp',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop',
  },
];

// 8 Yunnan gallery images — varied aspect ratios for natural rhythm
// Mix of portrait (3:4), landscape (4:3), wide (16:9), square-ish (1:1)
const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=420&h=560&fit=crop', alt: 'Lijiang Old Town' },           // portrait 3:4
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=820&h=550&fit=crop', alt: 'Jade Dragon Snow Mountain' }, // wide landscape
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&h=560&fit=crop', alt: 'Tiger Leaping Gorge' },      // near square
  { src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=380&h=560&fit=crop', alt: 'Shangri-La Monastery' },        // tall portrait
  { src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=750&h=560&fit=crop', alt: 'Potatso National Park' },    // landscape 4:3
  { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=440&h=560&fit=crop', alt: 'Alpine Meadows' },           // portrait
  { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=900&h=560&fit=crop', alt: 'Yunnan Landscape' },         // ultra wide
  { src: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=480&h=560&fit=crop', alt: 'Ancient Temple' },              // portrait
];

// Triple the images for infinite loop: [clone][original][clone]
const tripleImages = [...galleryImages, ...galleryImages, ...galleryImages];

function GalleryStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef<number | null>(null);
  const oneSectionWidth = useRef(0);
  const isJumping = useRef(false);

  // After mount: measure one section width and jump to middle section
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Wait one frame for images to lay out
    const init = () => {
      const totalWidth = track.scrollWidth;
      const oneSection = totalWidth / 3;
      oneSectionWidth.current = oneSection;
      // Start at beginning of middle section (no animation)
      track.scrollLeft = oneSection;
    };
    requestAnimationFrame(init);
  }, []);

  // Seamless loop: when entering clone zones, silently jump back to real zone
  const checkLoop = () => {
    const track = trackRef.current;
    if (!track || oneSectionWidth.current === 0) return;
    const w = oneSectionWidth.current;
    if (track.scrollLeft >= w * 2) {
      isJumping.current = true;
      track.scrollLeft -= w;
      isJumping.current = false;
    } else if (track.scrollLeft <= 0) {
      isJumping.current = true;
      track.scrollLeft += w;
      isJumping.current = false;
    }
  };

  const cancelInertia = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocity.current *= 0.92;
      if (Math.abs(velocity.current) < 0.5) {
        velocity.current = 0;
        return;
      }
      track.scrollLeft -= velocity.current;
      checkLoop();
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
    if (trackRef.current) {
      trackRef.current.scrollLeft = scrollLeftStart.current - walk;
      checkLoop();
    }
  };

  // Scroll gallery by a fixed amount with smooth inertia
  const scrollBy = (delta: number) => {
    cancelInertia();
    const track = trackRef.current;
    if (!track) return;
    velocity.current = 0;
    // Animate scroll smoothly
    const target = track.scrollLeft + delta;
    const duration = 420;
    const start = track.scrollLeft;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animStep = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      track.scrollLeft = start + (target - start) * ease(t);
      checkLoop();
      if (t < 1) rafId.current = requestAnimationFrame(animStep);
    };
    rafId.current = requestAnimationFrame(animStep);
  };

  // Shared button style
  const btnStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.45)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    flexShrink: 0,
    transition: 'background 0.2s',
  };

  return (
    <div
      className="gallery-strip-container"
      style={{
        width: '100%',
        background: '#222222',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left scroll button */}
      <button
        style={{ ...btnStyle, left: '16px' }}
        onClick={() => scrollBy(-600)}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} color="white" strokeWidth={2} />
      </button>

      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className="gallery-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          overflowX: 'scroll',
          overflowY: 'hidden',
          width: '100%',
          height: '100%',
          paddingLeft: '40px',
          paddingRight: '40px',
          cursor: 'grab',
          userSelect: 'none',
          overscrollBehaviorX: 'none',
        } as React.CSSProperties}
      >
        {tripleImages.map((img, idx) => (
          <div
            key={idx}
            className="gallery-img-responsive"
            style={{
              flexShrink: 0,
              width: 'auto',
              overflow: 'hidden',
              borderRadius: '4px',
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              draggable={false}
              style={{
                height: '100%',
                width: 'auto',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <button
        style={{ ...btnStyle, right: '16px' }}
        onClick={() => scrollBy(600)}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
        aria-label="Scroll right"
      >
        <ChevronRight size={20} color="white" strokeWidth={2} />
      </button>
    </div>
  );
}

// ── IMAGE CAROUSEL for day cards ──
// Custom cursors: 30×30px, smaller arrow inside circle
const CURSOR_LEFT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='14' fill='rgba(0%2C0%2C0%2C0.45)'/%3E%3Cpolyline points='17%2C10 12%2C15 17%2C20' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 15 15, w-resize`;
const CURSOR_RIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='14' fill='rgba(0%2C0%2C0%2C0.45)'/%3E%3Cpolyline points='13%2C10 18%2C15 13%2C20' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 15 15, e-resize`;

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = React.useState(0);
  const [mouseOnLeft, setMouseOnLeft] = React.useState(false);
  const [mouseInside, setMouseInside] = React.useState(false);
  // animKey increments on each navigation to re-trigger CSS animations
  const [animKey, setAnimKey] = React.useState(0);
  const [direction, setDirection] = React.useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = React.useState(false);
  const [prev, setPrev] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastMousePos = React.useRef({ x: 0, y: 0 });
  // Touch swipe support
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);

  // On scroll: check if mouse is still inside the container; if not, reset cursor
  React.useEffect(() => {
    const handleScroll = () => {
      if (!mouseInside || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const { x, y } = lastMousePos.current;
      const stillInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (!stillInside) {
        setMouseInside(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mouseInside]);

  const navigate = (dir: 'next' | 'prev') => {
    if (animating) return;
    const nextIdx = dir === 'next'
      ? (current + 1) % images.length
      : (current - 1 + images.length) % images.length;
    setDirection(dir);
    setPrev(current);
    setCurrent(nextIdx);
    setAnimKey(k => k + 1);
    setAnimating(true);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 460);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setMouseInside(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouseOnLeft(e.clientX - rect.left < rect.width / 2);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(mouseOnLeft ? 'prev' : 'next');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger if horizontal swipe dominates (avoid conflict with page scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      e.stopPropagation();
      navigate(dx < 0 ? 'next' : 'prev');
    }
  };

  // slide-out keyframes: exit image slides away
  const exitTo = direction === 'next' ? '-100%' : '100%';
  // slide-in keyframes: enter image slides in from opposite side
  const enterFrom = direction === 'next' ? '100%' : '-100%';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: mouseInside ? (mouseOnLeft ? CURSOR_LEFT : CURSOR_RIGHT) : 'default',
        background: '#000',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseInside(false)}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images: use CSS animation via style tag for zero-gap simultaneous slide */}
      <style>{`
        @keyframes carousel-slide-in-${animKey} {
          from { transform: translateX(${enterFrom}); }
          to   { transform: translateX(0%); }
        }
        @keyframes carousel-slide-out-${animKey} {
          from { transform: translateX(0%); }
          to   { transform: translateX(${exitTo}); }
        }
      `}</style>
      {images.map((src, idx) => {
        const isCurrent = idx === current;
        const isExiting = idx === prev;
        let animStyle: React.CSSProperties = {};
        if (isCurrent && prev !== null) {
          // entering: slide in
          animStyle = {
            animation: `carousel-slide-in-${animKey} 0.45s cubic-bezier(0.4,0,0.2,1) forwards`,
            zIndex: 2,
          };
        } else if (isExiting) {
          // exiting: slide out
          animStyle = {
            animation: `carousel-slide-out-${animKey} 0.45s cubic-bezier(0.4,0,0.2,1) forwards`,
            zIndex: 1,
          };
        } else if (isCurrent) {
          // initial state, no animation
          animStyle = { transform: 'translateX(0%)', zIndex: 2 };
        } else {
          // hidden
          animStyle = { transform: 'translateX(100%)', zIndex: 0 };
        }
        return (
          <img
            key={idx}
            src={src}
            alt={alt}
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
              ...animStyle,
            }}
          />
        );
      })}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          {images.map((_, idx) => (
            <div key={idx} style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: idx === current ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.45)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── SIMILAR EXPERIENCES SECTION (mirrors Home's Explore Our Trips) ──

function SimilarExperiencesSection() {
  const [, navigate] = useLocation();
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

  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const { data: rawItineraries = [] } = trpc.cms.listItineraries.useQuery();
  
  const itineraries: Trip[] = rawItineraries.map((itin) => ({
    id: itin.id,
    nights: itin.days,
    title: itin.name,
    buttonText: 'Explore Trip',
    image: itin.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  }));
  const FALLBACK_BANNER = '';
  const apiBanners = homepageAssets?.banners as Array<{ url: string; id: number }> | undefined;
  const activeBanners = (apiBanners && apiBanners.length > 0) ? apiBanners.map((b) => b.url) : [FALLBACK_BANNER];
  const activeCta = homepageAssets?.cta?.url;

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
        <h2 style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: 400, fontSize: '28px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '12px', lineHeight: 1.1 }}>
          Explore Our Trips
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', fontStyle: 'italic', lineHeight: 1.6 }}>
          Explore our sample trips or get in touch to begin your bespoke adventure.
        </p>
      </div>

      {/* Left Nav Button - Desktop only; hidden when at leftmost position */}
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
              <h2 style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: '700', fontSize: '32px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '16px', lineHeight: 1.1 }}>
                Explore Our Trips
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', fontStyle: 'italic', lineHeight: 1.6 }}>
                Explore our sample trips or get in touch to begin your bespoke adventure.
              </p>
            </div>
          )}
          {/* Trip Cards */}
          {(itineraries && itineraries.length > 0 ? itineraries : similarAllTrips).map((trip) => (
            <div key={trip.id} className="relative group overflow-hidden flex-shrink-0" style={{ width: '310px', height: '550px', userSelect: 'none' }}>
              <img src={trip.image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                {trip.nights && <div className="text-xs font-bold uppercase tracking-wider text-yellow-300 text-right" style={{color: '#ffffff', fontWeight: '500'}}>{trip.nights} NIGHTS</div>}
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
                fontFamily: 'Lato, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.15em',
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

      {/* Right Nav Button - Desktop only; hidden when at rightmost position */}
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

export default function YunnanDetail() {
  const [activeSection, setActiveSection] = useState('overview');
  // stickyFixed: true = nav has scrolled past its natural position, now fixed at top
  const [stickyFixed, setStickyFixed] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const tripNavRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;
      const navEl = tripNavRef.current;
      // Natural position of the trip nav (bottom of hero)
      const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;

      if (currentY > heroHeight) {
        // Past the trip nav's natural position
        if (scrollingDown) {
          // Scrolling down → trip nav sticks to top, main nav hides
          setStickyFixed(true);
        } else {
          // Scrolling up → trip nav returns to flow, main nav reappears
          setStickyFixed(false);
        }
      } else {
        setStickyFixed(false);
      }

      lastScrollY.current = currentY;

      // Update active section: find which section occupies the top of the viewport
      const navOffset = stickyFixed ? 48 : 0;
      const triggerY = currentY + navOffset + 60; // 60px below nav
      let current = 'overview';
      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top + currentY <= triggerY) {
          current = s.id;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Immediately update active section so underline shows right away
      setActiveSection(id);
      // When trip nav is fixed at top (48px), offset by 48px; otherwise no offset needed
      const offset = stickyFixed ? 48 : 0;
      const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
      <Navigation forceHide={stickyFixed} />

      {/* ── HERO ── */}
      <div ref={heroRef} className="relative w-full h-screen overflow-hidden">
        <img
          src=""
          alt="Yunnan landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />

        {/* Hero text - centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white leading-tight mb-6" style={{ fontSize: '40px', letterSpacing: '-0.01em', fontFamily: 'Lato', fontWeight: '500' }}>
            A Journey Through China's Most Diverse Province
          </h1>
          <p className="text-white" style={{ fontSize: '30px', fontFamily: 'lato', fontWeight: '500', letterSpacing: '0.02em' }}>
            England & Scotland
          </p>
        </div>

      </div>

      {/* ── TRIP SECTION NAV ── */}
      {/* Wrapper: in normal flow; when stickyFixed, inner nav becomes fixed at top */}
      <div ref={tripNavRef} style={{ height: '48px', position: 'relative', zIndex: 39 }}>
        <div
          className="w-full"
          style={{
            position: stickyFixed ? 'fixed' : 'relative',
            top: stickyFixed ? 0 : 'auto',
            left: 0,
            right: 0,
            zIndex: 39,
            background: 'rgba(245,245,245,0.97)',
          }}
        >
          <div className="flex items-center justify-center px-2 md:px-16">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="relative px-2 md:px-5 py-3 uppercase transition-colors"
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 'clamp(8px, 2vw, 12px)',
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                  color: activeSection === s.id ? '#111' : '#888',
                  borderBottom: activeSection === s.id ? '2px solid #111' : '2px solid transparent',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      <div id="overview" className="max-w-3xl mx-auto px-6 py-12 text-center" style={{ scrollMarginTop: '60px' }}>
        <h2 className="font-light mb-8 leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
          Where Ancient Kingdoms Meet the Himalayas
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6" style={{ fontSize: '17px', fontFamily: 'Georgia, serif' }}>
          Yunnan is China at its most extraordinary. Sixteen of the country's fifty-six ethnic minorities call this province home, each with their own language, dress, and way of life. The landscape shifts from subtropical valleys to Tibetan plateau in the space of a single day's drive.
        </p>
        <p className="text-gray-600 leading-relaxed mb-16" style={{ fontSize: '17px', fontFamily: 'Georgia, serif' }}>
          This ten-night journey moves at a pace that allows you to actually arrive somewhere — to sit with a Naxi grandmother, to watch the sun rise over a monastery courtyard, to feel the altitude in your lungs and the silence in your chest. It cannot be rushed. It should not be.
        </p>

        {/* WHEN / PRICE / HOW LONG */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          {[
            { label: 'WHEN', value: 'Apr – Jun, Sep – Nov', color: '#f49e0b' },
            { label: 'PRICE', value: 'From £4,800pp', sub: '(based on 2 ppl sharing)', color: '#1d902b' },
            { label: 'HOW LONG', value: '10 nights', color: '#2c6faa' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center', flex: 1 }}>
              <p style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.color, marginBottom: 10, fontFamily: 'Lato' }}>{m.label}</p>
              <p style={{ fontFamily: 'Manrope', fontStyle: 'italic', fontSize: 15, color: '#6B6B6B', lineHeight: 1.5 }}>{m.value}</p>
              {m.sub && <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#888', marginTop: 4 }}>{m.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── DAY-BY-DAY SECTIONS ── */}
      {days.map((section, si) => (
        <React.Fragment key={section.section}>
        {/* Each section wrapped in its own relative container for sticky sidebar */}
        <div style={{ position: 'relative' }}>
          {/* Right-side sticky route marker — only visible on desktop, bounded to this section */}
          <div className="hidden" style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '33.33%',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <div style={{ position: 'sticky', top: '120px', display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663313440852/9vw75P8eDmCGGYvHEDTM7H/yunnan-route-marker-hMM5swcUXyUvxVtUgmXAeE.webp"
                alt="Yunnan Route: Lijiang to Shangri-La"
                style={{ width: '220px', opacity: 0.92, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.10))' }}
              />
            </div>
          </div>
        <div id={section.section} style={{backgroundColor: '#ededed', position: 'relative', scrollMarginTop: '60px'}}>
          {/* Left timeline column + Right content column — right edge at 2/3 of page */}
          <div className="day-section-container">
            {/* Left: timeline (line + dots) */}
            <div style={{ width: '55px', flexShrink: 0, position: 'relative', alignSelf: 'stretch' }}>
              {/* Vertical dashed line: 1px line + 0.5px gap */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'repeating-linear-gradient(to bottom, #52b788 0px, #52b788 3px, transparent 3px, transparent 5px)',
                transform: 'translateX(-50%)',
                zIndex: 0,
              }} />
              {/* Dots */}
              {section.items.map((item, i) => {
                const HEADER = 210;
                const GAP = 50;
                let topOffset = HEADER;
                for (let j = 0; j < i; j++) {
                  topOffset += (j % 2 === 0 ? 480 : 510) + GAP;
                }
                return (
                  <div key={`dot-${i}`} style={{
                    position: 'absolute',
                    left: '20px',
                    top: `${topOffset + 40}px`,
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: '#52b788',
                    zIndex: 3,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                  }} />
                );
              })}
            </div>

            {/* Right: section header + cards */}
            <div style={{ flex: 1, minWidth: 0, maxWidth: '964px' }}>
              {/* Section header */}
              <div style={{ paddingRight: '24px', paddingTop: '64px', paddingBottom: '32px' }}>
                <h2 className="font-bold uppercase mb-4" style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '0.05em', fontFamily: 'sans-serif' }}>
                  {section.sectionTitle}
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-2xl" style={{ fontSize: '17px', fontFamily: 'Georgia, serif' }}>
                  {section.sectionDesc}
                </p>
                <p className="mt-4 text-xs tracking-widest uppercase font-semibold" style={{ fontFamily: 'sans-serif', color: '#2d6a4f' }}>
                  {section.dayRange}
                </p>
              </div>

          {/* Day cards */}
          <div style={{ position: 'relative', paddingRight: '24px', paddingBottom: '64px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
              {section.items.map((item, i) => {
                const imageLeft = i % 2 === 1;
                const cardHeight = i % 2 === 0 ? '480px' : '510px';
                return (
                  <div key={i}>
                    {/* Card */}
                    <div style={{
                      display: 'flex',
                      flexDirection: imageLeft ? 'row' : 'row-reverse',
                      width: '100%',
                      maxWidth: '964px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '4px 4px 16px rgba(0,0,0,0.13)',
                      height: cardHeight,
                    }} className="day-card-responsive">
                      {/* Image side */}
                      <div style={{ width: '45%', flexShrink: 0, overflow: 'hidden' }} className="day-card-img">
                        <ImageCarousel images={item.images} alt={item.title} />
                      </div>
                      {/* Text side */}
                      <div style={{ flex: 1, padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden' }}>
                        <p style={{ fontFamily: 'sans-serif', fontSize: '12px', letterSpacing: '0.15em', color: '#2d6a4f', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                          {item.day}
                        </p>
                        <h3 style={{ fontFamily: 'sans-serif', fontSize: 'clamp(15px, 1.8vw, 21px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '18px', lineHeight: 1.2, color: '#111' }}>
                          {item.title}
                        </h3>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#555', lineHeight: 1.75 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </div> {/* end right column */}
          </div> {/* end flex row */}
        </div> {/* end section div */}
        </div> {/* end outer relative wrapper */}
        {/* Gallery strip — outside the sticky sidebar wrapper, after each section */}
        <GalleryStrip />
        </React.Fragment>
      ))}

      {/* ── SIMILAR EXPERIENCES (Explore Our Trips style) ── */}
      <SimilarExperiencesSection />

      {/* ── ENQUIRE CTA ── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(260px, 30vw, 275px)',
          backgroundColor: '#a84900',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: '',
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat',
            opacity: 0.65,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            textAlign: 'center',
            padding: '0 24px',
          }}
        >
          <h2
            style={{
              fontFamily: 'AlternateGotNo1D',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            So, ready to start?
          </h2>

          <a href="/make-an-enquiry">
            <button
              style={{
                backgroundColor: '#111111',
                color: '#ffffff',
                fontFamily: 'Lato, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '14px 36px',
                border: '2px solid #111111',
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s, transform 0.1s',
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
            >
              Get in Touch
            </button>
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
