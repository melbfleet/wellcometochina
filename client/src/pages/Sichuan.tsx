import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';

/**
 * Sichuan Province Destination Page
 * Design: Replicates Black Tomato destination page format
 * Style: Literary, conversational tone with cultural depth
 * Layout: Clean white background, text-focused sections with images
 */

interface Trip {
  id: string;
  nights?: number;
  title: string;
  buttonText: string;
  image: string;
}

const allTrips: Trip[] = [
  {
    id: '1',
    nights: 12,
    title: 'Sichuan: Culture & Nature',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    nights: 10,
    title: 'Yunnan: Mountains & Minorities',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Create Your Own Itinerary',
    buttonText: 'Create Trip',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
  {
    id: '4',
    nights: 8,
    title: 'Xi\'an: Imperial Legacy',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
  {
    id: '5',
    nights: 9,
    title: 'Hangzhou: West Lake Serenity',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop',
  },
  {
    id: '6',
    nights: 7,
    title: 'Guilin: Karst Mountains',
    buttonText: 'Explore Trip',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
];

export default function Sichuan() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('Overview');
  const [expandedSections, setExpandedSections] = useState({
    grandHotels: false,
    honeymoon: false,
    siCuisine: false
  });
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

  const toggleSection = (section: 'grandHotels' | 'honeymoon' | 'siCuisine') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <div className="relative w-full bg-cover bg-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop)',
        backgroundAttachment: 'scroll',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        height: '400px',
      }}>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Hero Text - Centered */}
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white uppercase text-center px-6" style={{
            letterSpacing: '0.12em',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
            fontWeight: '600',
            lineHeight: '1.8'
          }}>
            Luxury Holidays & Honeymoons in Sichuan
          </h1>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="w-full" style={{ height: '48px', backgroundColor: '#F3F3F3' }}>
        <style>{`
          .tab-underline {
            position: relative;
            padding-bottom: 2px;
          }
          .tab-underline::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: #F5569B;
            transition: width 0.25s ease;
          }
          .tab-underline:hover::after,
          .tab-underline.tab-active::after {
            width: 100%;
          }
        `}</style>
        <div className="h-full flex items-center justify-center px-4 md:px-0">
          <nav className="flex gap-3 md:gap-12 h-full items-center flex-wrap md:flex-nowrap justify-center">
            {[
              { label: 'Overview', id: 'overview' },
              { label: 'Itineraries', id: 'itineraries' },
              { label: 'See & Do', id: 'see-do' },
              { label: 'Food', id: 'food' }
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  const element = document.getElementById(tab.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`tab-underline text-xs font-semibold uppercase tracking-wider text-black flex-shrink-0 ${
                  activeTab === tab.label ? 'tab-active' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Overview Section */}
      <div id="overview" className="w-full bg-white py-8 md:py-12" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', marginBottom: '0' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
            Why Should You Travel to Sichuan With Us?
          </h2>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">
            Come for the landscapes, stay for the cities and return for a combination of both. A luxury holiday in Sichuan offers a melting pot of beauty and culture that always catches us off-guard. Clad in cobbles, fringed with architectural brilliance and dearly holding onto tradition, Chengdu adds panache to everything it touches. Beyond the capital, natural beauty takes centre stage doing enough to make you emigrate.
          </p>
        </div>
      </div>
      
      {/* Explore Our Trips Section - native DOM scrollLeft, zero jank */}
      <div
        id="itineraries"
        className="w-full relative flex flex-col lg:flex-row lg:items-center"
        style={{
          minHeight: '680px',
          marginTop: '48px',
          paddingTop: '50px',
          paddingBottom: '50px',
          backgroundImage: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
            {allTrips.map((trip) => (
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
                      onClick={(e) => { e.stopPropagation(); if (trip.id === '1') navigate('/experiences/1'); else if (trip.id === '2') navigate('/experiences/2'); }}
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
      
      {/* What to See and Do in Sichuan Section */}
      <div id="see-do" className="w-full bg-white py-0" style={{ marginTop: '100px' }}>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-black mb-12 text-center font-display">
              What to See and Do in Sichuan
            </h2>
          </div>
          
          {/* Mobile: Image on top, text below */}
          <div className="lg:hidden w-full">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
              alt="Sichuan scenic landscape"
              className="w-full object-cover"
              style={{ height: '375px', objectFit: 'cover' }}
            />
            <div className="px-6 py-6">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                More About Sichuan
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                Where the mala spice tingles on your tongue and misty mountains rise like ancient guardians, Sichuan is a province of surprising subtlety and depth. Experience sacred peaks, profound spirituality, and cuisine that has captivated emperors and travelers for millennia.
              </p>
              <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                EXPLORE
              </button>
            </div>
          </div>
          
          {/* Desktop: Text left, image right */}
          <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
            <div className="w-1/2 px-3 flex flex-col justify-center items-center">
              <div className="max-w-md">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                More About Sichuan
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                Where the mala spice tingles on your tongue and misty mountains rise like ancient guardians, Sichuan is a province of surprising subtlety and depth. Experience sacred peaks, profound spirituality, and cuisine that has captivated emperors and travelers for millennia.
              </p>
              <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                EXPLORE
              </button>
              </div>
            </div>
            
            <div className="flex items-center" style={{ minHeight: '380px', marginRight: '-9999px', paddingRight: '9999px', width: 'calc(50% + 9999px)' }}>
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Sichuan scenic landscape"
                className="object-cover"
                style={{ width: '940px', height: '630px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Meet the Giant Pandas Section - Image Left, Text Right */}
      <div className="w-full bg-white py-0">
        <div className="relative">
          {/* Mobile: Image on top, text below */}
          <div className="lg:hidden w-full">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
              alt="Giant Pandas"
              className="w-full object-cover"
              style={{ height: '375px', objectFit: 'cover' }}
            />
            <div className="px-6 py-6">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                Meet the Giant Pandas
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                You might have heard of them lounging against bamboo stalks or tumbling playfully in the grass but nothing quite prepares you for meeting a giant panda in person. A private early-morning visit gives you exclusive access before the crowds arrive.
              </p>
              <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                EXPLORE
              </button>
            </div>
          </div>
          
          {/* Desktop: Image left, text right */}
          <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
            <div className="flex items-center" style={{ minHeight: '380px', marginLeft: '-9999px', paddingLeft: '9999px', width: 'calc(50% + 9999px)' }}>
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Giant Pandas"
                className="object-cover"
                style={{ width: '940px', height: '630px', objectFit: 'cover' }}
              />
            </div>
            
            <div className="w-1/2 px-3 flex flex-col justify-center items-center">
              <div className="max-w-md">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                Meet the Giant Pandas
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                You might have heard of them lounging against bamboo stalks or tumbling playfully in the grass but nothing quite prepares you for meeting a giant panda in person. A private early-morning visit gives you exclusive access before the crowds arrive.
              </p>
              <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                EXPLORE
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What to See and Do - Expandable Section */}
      <div style={{ display: expandedSections.siCuisine ? 'block' : 'block' }}>
      {/* Sichuan Cuisine Section */}
      <div id="food" className="w-full bg-white py-0" style={{ marginBottom: '0', paddingBottom: '0' }}>
        <div className="relative">
          {/* Mobile: Image on top, text below */}
          <div className="lg:hidden w-full">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
              alt="Sichuan Cuisine"
              className="w-full object-cover"
              style={{ height: '375px', objectFit: 'cover' }}
            />
            <div className="px-6 py-6">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                Sichuan Cuisine
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                Sichuan cuisine is renowned for its bold flavors, spicy heat, and complex taste profiles. From mapo tofu to chongqing chicken, every dish tells a story of culinary mastery developed over centuries.
              </p>
              <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                EXPLORE
              </button>
            </div>
          </div>
          
          {/* Desktop: Text left, image right */}
          <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
            <div className="w-1/2 px-3 flex flex-col justify-center items-center">
              <div className="max-w-md">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                Sichuan Cuisine
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                Sichuan cuisine is renowned for its bold flavors, spicy heat, and complex taste profiles. From mapo tofu to chongqing chicken, every dish tells a story of culinary mastery developed over centuries.
              </p>
              <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                EXPLORE
              </button>
              </div>
            </div>
            
            <div className="flex items-center" style={{ minHeight: '380px', marginRight: '-9999px', paddingRight: '9999px', width: 'calc(50% + 9999px)' }}>
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Sichuan Cuisine"
                className="object-cover"
                style={{ width: '940px', height: '630px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      
      {/* Hidden Content - Show on expand */}
      <div style={{ display: expandedSections.siCuisine ? 'block' : 'none' }}>
        {/* Hidden Item 1 */}
        <div className="w-full bg-white py-0">
          <div className="relative">
            {/* Mobile: Image on top, text below */}
            <div className="lg:hidden w-full">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Sichuan scenic landscape"
                className="w-full object-cover"
                style={{ height: '375px', objectFit: 'cover' }}
              />
              <div className="px-6 py-6">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                  More About Sichuan
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  Where the mala spice tingles on your tongue and misty mountains rise like ancient guardians, Sichuan is a province of surprising subtlety and depth. Experience sacred peaks, profound spirituality, and cuisine that has captivated emperors and travelers for millennia.
                </p>
                <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                  EXPLORE
                </button>
              </div>
            </div>
            
            {/* Desktop: Image left, text right */}
            <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
              <div className="flex items-center" style={{ minHeight: '380px', marginLeft: '-9999px', paddingLeft: '9999px', width: 'calc(50% + 9999px)' }}>
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                  alt="Sichuan scenic landscape"
                  className="object-cover"
                  style={{ width: '940px', height: '630px', objectFit: 'cover' }}
                />
              </div>
              
              <div className="w-1/2 px-3 flex flex-col justify-center items-center">
                <div className="max-w-md">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                  More About Sichuan
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  Where the mala spice tingles on your tongue and misty mountains rise like ancient guardians, Sichuan is a province of surprising subtlety and depth. Experience sacred peaks, profound spirituality, and cuisine that has captivated emperors and travelers for millennia.
                </p>
                <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                  EXPLORE
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hidden Item 2 */}
        <div className="w-full bg-white py-0">
          <div className="relative">
            {/* Mobile: Image on top, text below */}
            <div className="lg:hidden w-full">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Giant Pandas"
                className="w-full object-cover"
                style={{ height: '375px', objectFit: 'cover' }}
              />
              <div className="px-6 py-6">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                  Meet the Giant Pandas
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  You might have heard of them lounging against bamboo stalks or tumbling playfully in the grass but nothing quite prepares you for meeting a giant panda in person. A private early-morning visit gives you exclusive access before the crowds arrive.
                </p>
                <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                  EXPLORE
                </button>
              </div>
            </div>
            
            {/* Desktop: Text left, image right */}
            <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
              <div className="w-1/2 px-3 flex flex-col justify-center items-center">
                <div className="max-w-md">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                  Meet the Giant Pandas
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  You might have heard of them lounging against bamboo stalks or tumbling playfully in the grass but nothing quite prepares you for meeting a giant panda in person. A private early-morning visit gives you exclusive access before the crowds arrive.
                </p>
                <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                  EXPLORE
                </button>
                </div>
              </div>
              
              <div className="flex items-center" style={{ minHeight: '380px', marginRight: '-9999px', paddingRight: '9999px', width: 'calc(50% + 9999px)' }}>
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                  alt="Giant Pandas"
                  className="object-cover"
                  style={{ width: '940px', height: '630px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Hidden Item 3 */}
        <div className="w-full bg-white py-0">
          <div className="relative">
            {/* Mobile: Image on top, text below */}
            <div className="lg:hidden w-full">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Sichuan Cuisine"
                className="w-full object-cover"
                style={{ height: '375px', objectFit: 'cover' }}
              />
              <div className="px-6 py-6">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                  Sichuan Cuisine
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  Sichuan cuisine is renowned for its bold flavors, spicy heat, and complex taste profiles. From mapo tofu to chongqing chicken, every dish tells a story of culinary mastery developed over centuries.
                </p>
                <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                  EXPLORE
                </button>
              </div>
            </div>
            
            {/* Desktop: Image left, text right */}
            <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
              <div className="flex items-center" style={{ minHeight: '380px', marginLeft: '-9999px', paddingLeft: '9999px', width: 'calc(50% + 9999px)' }}>
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                  alt="Sichuan Cuisine"
                  className="object-cover"
                  style={{ width: '940px', height: '630px', objectFit: 'cover' }}
                />
              </div>
              
              <div className="w-1/2 px-3 flex flex-col justify-center items-center">
                <div className="max-w-md">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                  Sichuan Cuisine
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  Sichuan cuisine is renowned for its bold flavors, spicy heat, and complex taste profiles. From mapo tofu to chongqing chicken, every dish tells a story of culinary mastery developed over centuries.
                </p>
                <button className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                  EXPLORE
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* VIEW MORE / SHOW LESS Button */}
      <div className="w-full bg-white py-8 flex justify-center">
        <button
          onClick={() => setExpandedSections({ ...expandedSections, siCuisine: !expandedSections.siCuisine })}
          className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {expandedSections.siCuisine ? 'SHOW LESS' : 'VIEW MORE'}
        </button>
      </div>
      </div>

      {/* Culinary Travel Section */}
      <CulinaryTravel />

      {/* Ready To Start CTA - Above Other Popular Destinations */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '150px',
          backgroundColor: '#a84900',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '40px',
          paddingRight: '40px',
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

        {/* Content - Text Left */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '12px',
            textAlign: 'left',
            flex: 1,
          }}
        >
          <h2
            style={{
              fontFamily: 'AlternateGotNo1D',
              fontSize: '32px',
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
        </div>

        {/* Button - Right */}
        <button
          style={{
            position: 'relative',
            zIndex: 1,
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
            marginLeft: '40px',
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
      </section>

      {/* Other Popular Destinations Section */}
      <OtherPopularDestinations />

      <Footer />
    </div>
  );
}


// Culinary Travel Component
function CulinaryTravel() {
  const [expandedSections, setExpandedSections] = React.useState({
    culinaryTravel: false
  });
  return (
    <div className="w-full bg-white" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Title */}
      <h2 className="text-center text-2xl md:text-4xl font-bold uppercase tracking-wider mb-16 px-4" style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: 400 }}>
        Culinary Travel
      </h2>

      {/* Large Card - Image Left, Text Right */}
      <div className="mx-auto px-4 md:px-8 mb-12" style={{ maxWidth: '1320px' }}>
        <div className="hidden xl:flex items-center bg-gray-100" style={{ height: '640px' }}>
          {/* Image Left - 60% */}
          <div className="flex items-center bg-gray-100" style={{ width: '60%', height: '640px', flex: '0 0 auto' }}>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
              alt="Sichuan Cuisine"
              className="object-cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Text Right - 40% */}
          <div className="flex flex-col justify-center items-center bg-gray-100 pl-8 pr-8" style={{ width: '40%', height: '640px' }}>
            <div className="max-w-md">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
                Mapo Tofu & Chongqing Chicken
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Sichuan cuisine is renowned for its bold flavors and the distinctive numbing sensation from Sichuan peppercorns. Mapo tofu, with its silky tofu in a fiery chili oil, represents the essence of Sichuan cooking. Chongqing chicken, crispy and coated in dried chilies, is a beloved dish that showcases the region's fearless approach to spice. These iconic dishes embody centuries of culinary tradition and the bold spirit of Sichuan.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="xl:hidden w-full bg-gray-100">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
            alt="Sichuan Cuisine"
            className="w-full object-cover"
            style={{ height: '375px', objectFit: 'cover' }}
          />
          <div className="p-6">
            <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6">
              Mapo Tofu & Chongqing Chicken
            </h3>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed" style={{fontSize: '16px'}}>
              Sichuan cuisine is renowned for its bold flavors and the distinctive numbing sensation from Sichuan peppercorns. Mapo tofu, with its silky tofu in a fiery chili oil, represents the essence of Sichuan cooking. Chongqing chicken, crispy and coated in dried chilies, is a beloved dish that showcases the region's fearless approach to spice. These iconic dishes embody centuries of culinary tradition and the bold spirit of Sichuan.
            </p>
          </div>
        </div>
      </div>

      {/* Two Small Cards - Image Top, Text Bottom */}
      <div className="mx-auto px-4 md:px-8" style={{ maxWidth: '1320px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="flex flex-col bg-gray-100" style={{ height: '600px' }}>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop"
              alt="Hot Pot"
              className="w-full object-cover"
              style={{ height: '390px', objectFit: 'cover' }}
            />
            <div className="p-6" style={{ height: '210px', overflow: 'hidden' }}>
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-4">
                Sichuan Hot Pot
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed" style={{fontSize: '16px'}}>
                A communal dining experience where diners cook raw ingredients in a bubbling broth infused with chilies and Sichuan peppercorns. Hot pot brings people together, allowing each guest to customize their meal with fresh vegetables, tender meats, and delicate seafood.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col bg-gray-100" style={{ height: '600px' }}>
            <img
              src="https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop"
              alt="Dumplings"
              className="w-full object-cover"
              style={{ height: '390px', objectFit: 'cover' }}
            />
            <div className="p-6" style={{ height: '210px', overflow: 'hidden' }}>
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-4">
                Wontons & Dumplings
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed" style={{fontSize: '16px'}}>
                Delicate wontons and hand-folded dumplings filled with pork, shrimp, and vegetables, served in aromatic broths or with chili oil. These bite-sized treasures showcase the artistry of Sichuan cooking, where every fold and filling tells a story of tradition and skill.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Other Popular Destinations Component
function OtherPopularDestinations() {
  const [, navigate] = useLocation();
  const destinationsRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [velocity, setVelocity] = React.useState(0);
  const [lastX, setLastX] = React.useState(0);
  const [lastTime, setLastTime] = React.useState(0);
  const animationRef = React.useRef<number | null>(null);

  // 5 base destinations (will be duplicated for infinite scroll)
  const baseDestinations = [
    { id: '1', name: 'Sichuan', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', link: '/template/city' },
    { id: '2', name: 'Yunnan', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop', link: '/template/city' },
    { id: '4', name: 'Xi\'an', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', link: '/template/city' },
    { id: '5', name: 'Hangzhou', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop', link: '/template/city' },
    { id: '6', name: 'Guilin', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', link: '/template/city' },
  ];

  // 无限滑动：复制数组3次实现首尾相接
  const destinations = [...baseDestinations, ...baseDestinations, ...baseDestinations];
  const cardWidth = 220 + 16; // 220px + 16px gap
  const totalWidth = baseDestinations.length * cardWidth;

  React.useEffect(() => {
    if (destinationsRef.current) {
      // 初始化滚动位置到中间副本的开始
      destinationsRef.current.scrollLeft = totalWidth;
    }
  }, [totalWidth]);

  const handleScroll = () => {
    if (!destinationsRef.current) return;
    const container = destinationsRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // 检查是否滚动到了开始或结束
    if (scrollLeft < totalWidth * 0.3) {
      // 滚动到开始，跳转到中间副本
      container.scrollLeft = totalWidth + scrollLeft;
    } else if (scrollLeft > totalWidth * 2.7 || scrollLeft >= maxScroll - 10) {
      // 滚动到结束，跳转回中间副本
      container.scrollLeft = scrollLeft - totalWidth;
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(destinationsRef.current?.scrollLeft || 0);
    setLastX(e.clientX);
    setLastTime(Date.now());
    setVelocity(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const x = e.clientX;
    const walk = (x - startX) * 0.8;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    const xDiff = x - lastX;
    setVelocity(timeDiff > 0 ? xDiff / timeDiff : 0);
    setLastX(x);
    setLastTime(currentTime);
    if (destinationsRef.current) {
      const newScroll = scrollLeft - walk;
      destinationsRef.current.scrollLeft = newScroll;
      handleScroll();
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    let currentVelocity = velocity;
    const animate = () => {
      if (destinationsRef.current && Math.abs(currentVelocity) > 0.1) {
        destinationsRef.current.scrollLeft -= currentVelocity * 30;
        handleScroll();
        currentVelocity *= 0.92;
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      let currentVelocity = velocity;
      const animate = () => {
        if (destinationsRef.current && Math.abs(currentVelocity) > 0.1) {
          destinationsRef.current.scrollLeft -= currentVelocity * 30;
          handleScroll();
          currentVelocity *= 0.92;
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();
    }
  };

  const handleDestinationClick = (dest: typeof destinations[0]) => {
    if (!isDragging) {
      navigate(dest.link);
    }
  };

  return (
    <div className="w-full bg-white py-16 md:py-20">
      {/* Title */}
      <h2 className="text-center text-2xl md:text-4xl font-bold uppercase tracking-wider mb-12 md:mb-16 px-4" style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: 400 }}>
        Other Popular Destinations
      </h2>

      {/* Carousel - Full width, no padding */}
      <div
        ref={destinationsRef}
          className="flex gap-0 overflow-x-scroll pl-4 pr-4"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onScroll={handleScroll}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            scrollBehavior: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {destinations.map((dest, index) => (
            <div
              key={`${dest.id}-${index}`}
              className="flex-shrink-0 relative overflow-hidden group cursor-pointer mr-4"
              style={{ width: '220px', height: '320px' }}
              onClick={() => handleDestinationClick(dest)}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                draggable={false}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
              {/* City name in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-lg md:text-xl font-bold uppercase tracking-wider text-center" style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: 400 }}>
                  {dest.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
