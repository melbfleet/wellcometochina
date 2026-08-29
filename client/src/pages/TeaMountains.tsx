/*
 * Tea Mountains of Ya'an — Experience Detail Page
 * Design: Wayseek luxury travel, clean white editorial layout
 * Reference: Black Tomato experience detail page structure
 * Font: Playfair Display (headings), system sans (body)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const IMAGES = [
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero1-4G32VK9iXnY5zQXxnmzmtg.webp',
    caption: 'Morning mist drifts through the terraced tea fields of Ya\'an',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero2-hV8GsfHpqwcv825ZiyPDip.webp',
    caption: 'Hand-picking the first flush — a ritual unchanged for centuries',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-ceremony-HSmT7ziKwEUdErnGtbJjRq.webp',
    caption: 'A private gongfu tea ceremony overlooking the valley',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-village-XCJXXi79XhsGbf6u82fzL8.webp',
    caption: 'Village life in the shadow of the tea mountains',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-processing-PgZjyE8TtmUCWv49iGQYJo.webp',
    caption: 'The art of hand-roasting — where science meets instinct',
  },
];

const SIMILAR = [
  {
    img: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-ceremony-HSmT7ziKwEUdErnGtbJjRq.webp',
    nights: '3 days',
    tag: 'Culture',
    title: 'Sichuan Opera & Teahouse Culture',
    desc: 'Step behind the painted faces of Sichuan Opera and spend an evening in a century-old Chengdu teahouse.',
  },
  {
    img: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-village-XCJXXi79XhsGbf6u82fzL8.webp',
    nights: '4 days',
    tag: 'Local Life',
    title: 'Countryside Villages of Sichuan',
    desc: 'Slow down in rural Sichuan — share a meal with a farming family, join the morning market, and learn to make baijiu.',
  },
  {
    img: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero1-4G32VK9iXnY5zQXxnmzmtg.webp',
    nights: '5 days',
    tag: 'Nature',
    title: 'Bamboo Forest Hikes',
    desc: 'Walk through cathedral-like bamboo groves, listen to the creak of the canopy, and encounter giant pandas in their natural habitat.',
  },
];

// Infinite-loop carousel: prepend last image, append first image as clones
// Real indices: 1 … N in the extended array; 0 and N+1 are clones
const EXTENDED = [IMAGES[IMAGES.length - 1], ...IMAGES, IMAGES[0]];
const FIXED_HEIGHT_VW = 70 * 0.65; // 45.5vw
const FIXED_HEIGHT_MAX = 720; // px
const GAP_PX = 0;

export default function TeaMountains() {
  // internalIdx: position in EXTENDED (1-based real slides)
  const [internalIdx, setInternalIdx] = useState(1);
  // Keep a ref always in sync so event handlers never have stale closures
  const idxRef = useRef(1);
  const setIdx = useCallback((v: number) => {
    idxRef.current = v;
    setInternalIdx(v);
  }, []);

  // animated: false during silent jump (no transition), true otherwise
  const [animated, setAnimated] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Guard: prevent handleTransitionEnd from firing while we are already jumping
  const isJumping = useRef(false);

  // Drag state
  const isDragging = useRef(false);
  const startX    = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Store image dimensions: [{ width, height }, ...]
  const [imageDims, setImageDims] = useState<Array<{ width: number; height: number }>>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  // Real slide index (0-based) for dots/caption
  const activeSlide = ((internalIdx - 1) % IMAGES.length + IMAGES.length) % IMAGES.length;

  // Calculate card widths based on image aspect ratios
  const fixedHeightPx = typeof window !== 'undefined' ? Math.min(window.innerWidth * (FIXED_HEIGHT_VW / 100), FIXED_HEIGHT_MAX) : FIXED_HEIGHT_MAX;
  const cardWidths = imageDims.map(dim => {
    if (!dim.width || !dim.height) return 0;
    const aspectRatio = dim.width / dim.height;
    return fixedHeightPx * aspectRatio;
  });

  // Calculate cumulative widths for translateX
  const cumulativeWidths = cardWidths.map((_, i) => {
    return cardWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
  });

  // Calculate translateX to center active card
  const getTranslateX = () => {
    if (cardWidths.length === 0 || containerWidth === 0) return 0;
    const activeCardWidth = cardWidths[internalIdx % EXTENDED.length];
    const offsetToActive = cumulativeWidths[internalIdx % EXTENDED.length] || 0;
    const centerOffset = (containerWidth / 2) - (activeCardWidth / 2);
    return -(offsetToActive) + centerOffset + dragOffset;
  };

  // Load image dimensions
  useEffect(() => {
    const dims: Array<{ width: number; height: number }> = [];
    let loaded = 0;
    
    EXTENDED.forEach((img, idx) => {
      const imgEl = new Image();
      imgEl.onload = () => {
        dims[idx] = { width: imgEl.naturalWidth, height: imgEl.naturalHeight };
        loaded++;
        if (loaded === EXTENDED.length) {
          setImageDims([...dims]);
        }
      };
      imgEl.onerror = () => {
        dims[idx] = { width: 16, height: 9 }; // fallback to 16:9
        loaded++;
        if (loaded === EXTENDED.length) {
          setImageDims([...dims]);
        }
      };
      imgEl.src = img.src;
    });
  }, []);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // After sliding to a clone, silently jump to the real counterpart
  // Uses idxRef (not internalIdx) to always read the latest value — no stale closure
  const handleTransitionEnd = useCallback(() => {
    if (isJumping.current) return; // already handling a jump, ignore
    const cur = idxRef.current;
    let jumpTo: number | null = null;
    if (cur === 0) jumpTo = IMAGES.length;
    else if (cur === EXTENDED.length - 1) jumpTo = 1;
    if (jumpTo === null) return;

    isJumping.current = true;
    // 1. Disable transition + update index in same render (no visible animation)
    setAnimated(false);
    setIdx(jumpTo);

    // 2. After browser paints the jumped position, re-enable transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimated(true);
        isJumping.current = false;
      });
    });
  }, [setIdx]);

  const prevSlide = useCallback(() => setIdx(idxRef.current - 1), [setIdx]);
  const nextSlide = useCallback(() => setIdx(idxRef.current + 1), [setIdx]);

  // Drag handlers
  const onDragStart = (clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
    setDragOffset(0);
  };
  const onDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    setDragOffset(clientX - startX.current);
  };
  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 60;
    if (dragOffset < -threshold) nextSlide();
    else if (dragOffset > threshold) prevSlide();
    setDragOffset(0);
  };

  // ── Similar Experiences: native DOM scrollLeft drag strip ──
  const [simShowLeftBtn, setSimShowLeftBtn] = useState(false);
  const [simShowRightBtn, setSimShowRightBtn] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const simTrackRef = useRef<HTMLDivElement>(null);
  const simDraggingRef = useRef(false);
  const simStartXRef = useRef(0);
  const simScrollStartRef = useRef(0);
  const simLastXRef = useRef(0);
  const simVelocityRef = useRef(0);
  const simRafRef = useRef<number | null>(null);

  const simCancelInertia = () => {
    if (simRafRef.current !== null) { cancelAnimationFrame(simRafRef.current); simRafRef.current = null; }
  };
  const simUpdateBtns = () => {
    const t = simTrackRef.current;
    if (!t) return;
    setSimShowLeftBtn(t.scrollLeft > 0);
    setSimShowRightBtn(t.scrollLeft < t.scrollWidth - t.clientWidth - 10);
  };
  const simStartInertia = () => {
    const t = simTrackRef.current;
    if (!t) return;
    const step = () => {
      simVelocityRef.current *= 0.92;
      if (Math.abs(simVelocityRef.current) < 0.5) { simVelocityRef.current = 0; simUpdateBtns(); return; }
      t.scrollLeft -= simVelocityRef.current;
      simUpdateBtns();
      simRafRef.current = requestAnimationFrame(step);
    };
    simRafRef.current = requestAnimationFrame(step);
  };
  const simScrollBy = (delta: number) => {
    simCancelInertia();
    const t = simTrackRef.current;
    if (!t) return;
    const start = t.scrollLeft;
    const target = start + delta;
    const duration = 420;
    const startTime = performance.now();
    const ease = (x: number) => x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
    const animStep = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      t.scrollLeft = start + (target - start) * ease(p);
      if (p < 1) simRafRef.current = requestAnimationFrame(animStep);
    };
    simRafRef.current = requestAnimationFrame(animStep);
  };
  const simOnMouseDown = (e: React.MouseEvent) => {
    simCancelInertia();
    simDraggingRef.current = true;
    simStartXRef.current = e.pageX - (simTrackRef.current?.offsetLeft ?? 0);
    simScrollStartRef.current = simTrackRef.current?.scrollLeft ?? 0;
    simLastXRef.current = e.pageX;
    simVelocityRef.current = 0;
    if (simTrackRef.current) simTrackRef.current.style.cursor = 'grabbing';
  };
  const simOnMouseLeave = () => {
    if (!simDraggingRef.current) return;
    simDraggingRef.current = false;
    if (simTrackRef.current) simTrackRef.current.style.cursor = 'grab';
    simStartInertia();
  };
  const simOnMouseUp = () => {
    if (!simDraggingRef.current) return;
    simDraggingRef.current = false;
    if (simTrackRef.current) simTrackRef.current.style.cursor = 'grab';
    simStartInertia();
  };
  const simOnMouseMove = (e: React.MouseEvent) => {
    if (!simDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - (simTrackRef.current?.offsetLeft ?? 0);
    simVelocityRef.current = e.pageX - simLastXRef.current;
    simLastXRef.current = e.pageX;
    if (simTrackRef.current) {
      simTrackRef.current.scrollLeft = simScrollStartRef.current - (x - simStartXRef.current);
      simUpdateBtns();
    }
  };

  useEffect(() => {
    const t = simTrackRef.current;
    if (!t) return;
    simUpdateBtns();
    t.addEventListener('scroll', simUpdateBtns);
    const onResize = () => { setIsDesktop(window.innerWidth >= 1024); simUpdateBtns(); };
    window.addEventListener('resize', onResize);
    return () => { t.removeEventListener('scroll', simUpdateBtns); window.removeEventListener('resize', onResize); simCancelInertia(); };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#fff', color: '#6B6B6B' }}>
      <Navigation />

      {/* ── Header Info Block (above hero) ── */}
      <div style={{ paddingTop: '55px', background: '#fff' }}>
          {/* Breadcrumb - aligned with Logo left edge */}
          <p style={{ fontSize: 12, color: '#999', marginBottom: 0, textAlign: 'left', paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)', paddingTop: '20px', paddingBottom: '0' }}>
            <Link href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
            <Link href="/experiences" style={{ color: '#999', textDecoration: 'none' }}>Experiences</Link>
            <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
            <Link href="/experiences" style={{ color: '#999', textDecoration: 'none' }}>Nature</Link>
            <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
            <span style={{ color: '#555' }}>Tea Mountains of Ya'an</span>
          </p>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px 36px', textAlign: 'center' }}>

          {/* Category label */}
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F5569B', marginBottom: 12, textAlign: 'center' }}>Nature, Sichuan</p>

          {/* Main title */}
          <h1 style={{ fontFamily: 'AlternateGotNo1D', fontSize: '40px', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.01em', color: '#111', marginBottom: 24, textTransform: 'uppercase', textAlign: 'center' }}>
            Tea Mountains of Ya'an
          </h1>

          {/* Divider */}
          <div style={{ width: 48, height: 1, background: '#ccc', margin: '0 auto 32px' }} />

          {/* Three-column meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            {[
              { label: 'WHEN', value: 'March – May & Sept – Nov', color: '#f49e0b' },
              { label: 'PRICE', value: 'From $550 per person', sub: '(based on 2 sharing)', color: '#1d902b' },
              { label: 'HOW LONG', value: '3 – 5 days ideal', color: '#2c6faa' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.color, marginBottom: 10 }}>{m.label}</p>
                <p style={{ fontFamily: 'Manrope', fontStyle: 'italic', fontSize: 15, color: '#6B6B6B', lineHeight: 1.5 }}>{m.value}</p>
                {m.sub && <p style={{ fontFamily: "Georgia, serif", fontStyle: 'italic', fontSize: 13, color: '#888', marginTop: 4 }}>{m.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero Slideshow — infinite drag carousel ── */}
      <div style={{ background: '#fff', padding: '0 0 48px', position: 'relative', userSelect: 'none' }}>
        {/* Track wrapper */}
        <div
          ref={containerRef}
          style={{ overflow: 'hidden', position: 'relative', cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onMouseDown={e => onDragStart(e.clientX)}
          onMouseMove={e => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX); }}
          onTouchEnd={onDragEnd}
        >
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: 'flex',
              transition: (!animated || isDragging.current) ? 'none' : 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
              transform: `translateX(${getTranslateX()}px)`,
            }}
          >
            {(() => {
              return EXTENDED.map((img, i) => {
                // real index for this extended slot
                const realIdx = ((i - 1) % IMAGES.length + IMAGES.length) % IMAGES.length;
                const isActive = i === internalIdx;
                const cardWidth = cardWidths[i] || 0;
                return (
                  <div
                    key={i}
                    style={{
                      flexShrink: 0,
                      width: `${cardWidth}px`,
                      height: `${fixedHeightPx}px`,
                      maxHeight: FIXED_HEIGHT_MAX,
                      marginRight: `${GAP_PX}px`,
                      transition: 'opacity 0.4s',
                      opacity: isActive ? 1 : 0.4,
                      overflow: 'hidden',
                      pointerEvents: isActive ? 'none' : 'auto',
                      cursor: isActive ? 'default' : 'pointer',
                    }}
                    onClick={() => {
                      if (!isActive) {
                        if (i < internalIdx) prevSlide();
                        else nextSlide();
                      }
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.caption}
                      draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', pointerEvents: 'none' }}
                    />
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i + 1); }}
              style={{ width: i === activeSlide ? 20 : 6, height: 6, borderRadius: 3, background: i === activeSlide ? '#1a1a1a' : '#ccc', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
            />
          ))}
        </div>

        {/* Arrows */}
        <button onClick={prevSlide} aria-label="Previous" style={{ position: 'absolute', left: 'clamp(8px, 2vw, 32px)', top: '40%', transform: 'translateY(-50%)', background: 'rgba(90,90,90,0.85)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', zIndex: 2 }}>‹</button>
        <button onClick={nextSlide} aria-label="Next" style={{ position: 'absolute', right: 'clamp(8px, 2vw, 32px)', top: '40%', transform: 'translateY(-50%)', background: 'rgba(90,90,90,0.85)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', zIndex: 2 }}>›</button>
      </div>



      {/* ── Body Content ── */}
      <div className="tea-body">
        {/* Intro */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', marginBottom: 48, textAlign: 'center', boxSizing: 'border-box' }}>
          <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0 }}>
            Go beyond sightseeing.<br />
            Live the rhythm of tea villages.<br />
            Join local farmers each day.<br />
            Learn traditions passed down for generations.<br />
            Experience tea as a way of life.
          </p>
        </div>

        {/* Section 1 — left text, right image (image on right → text container aligns right) */}
        <div className="tea-detail-row">
          <div className="tea-detail-text">
            <div className="tea-detail-text-inner">
              <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0 }}>
                Learn directly from local tea farmers<br />
                Hear their personal stories<br />
                Understand their connection to the land<br />
                Discover how tea shapes family, identity,<br />
                and the spirit of the community
              </p>
            </div>
          </div>
          <div className="tea-detail-img-wrap">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero2-hV8GsfHpqwcv825ZiyPDip.webp"
              alt="Hand-picking the first flush"
              className="tea-detail-img"
            />
          </div>
        </div>

        {/* Section 2 — left image, right text (image on left → text container aligns left) */}
        <div className="tea-detail-row mirror">
          <div className="tea-detail-img-wrap">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-processing-PgZjyE8TtmUCWv49iGQYJo.webp"
              alt="Tea roasting workshop"
              className="tea-detail-img"
            />
          </div>
          <div className="tea-detail-text">
            <div className="tea-detail-text-inner">
              <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0 }}>
                Share meals, conversations, and traditions<br />
                Step into authentic rural life<br />
                Build genuine relationships with local people<br />
                Experience meaningful cultural exchange<br />
                beyond the surface of tourism
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 — left text, right image (image on right → text container aligns right) */}
        <div className="tea-detail-row">
          <div className="tea-detail-text">
            <div className="tea-detail-text-inner">
              <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0 }}>
                Experience every stage of tea-making<br />
                Pick fresh leaves by hand<br />
                Learn traditional roasting methods<br />
                Prepare and taste tea with villagers<br />
                Understand the patience behind every cup
              </p>
            </div>
          </div>
          <div className="tea-detail-img-wrap">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-ceremony-HSmT7ziKwEUdErnGtbJjRq.webp"
              alt="Private gongfu tea ceremony"
              className="tea-detail-img"
            />
          </div>
        </div>

        {/* Section 4 — left image, right text (image on left → text container aligns left) */}
        <div className="tea-detail-row mirror">
          <div className="tea-detail-img-wrap">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-village-XCJXXi79XhsGbf6u82fzL8.webp"
              alt="Village life in the shadow of the tea mountains"
              className="tea-detail-img"
            />
          </div>
          <div className="tea-detail-text">
            <div className="tea-detail-text-inner">
              <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0 }}>
                Leave with more than tea<br />
                Take home stories and friendships<br />
                Gain deeper cultural understanding<br />
                Through immersive participation,<br />
                discover the authentic heart of China
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Experiences ── */}
      <div
        className="w-full relative flex flex-col lg:flex-row lg:items-center"
        style={{
          minHeight: '680px',
          paddingTop: '50px',
          paddingBottom: '50px',
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero1-4G32VK9iXnY5zQXxnmzmtg.webp)',
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
            Similar Experiences
          </h2>
        </div>

        {/* Left Nav Button */}
        {isDesktop && (
          <button
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: simShowLeftBtn ? 1 : 0, pointerEvents: simShowLeftBtn ? 'auto' : 'none' }}
            onClick={() => simScrollBy(-600)}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} color="white" strokeWidth={2} />
          </button>
        )}

        {/* Scroll track */}
        <div
          ref={simTrackRef}
          className="similar-track"
          onMouseDown={simOnMouseDown}
          onMouseLeave={simOnMouseLeave}
          onMouseUp={simOnMouseUp}
          onMouseMove={simOnMouseMove}
          style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'scroll', overflowY: 'hidden', cursor: 'grab', userSelect: 'none', paddingLeft: isDesktop ? '60px' : '24px', paddingRight: isDesktop ? '60px' : '24px' } as React.CSSProperties}
        >
          <div style={{ display: 'flex', flexDirection: 'row', gap: '25px', alignItems: 'flex-start', minWidth: 'max-content', paddingBottom: '8px' }}>
            {/* 大屏左边空白占位 */}
            {isDesktop && <div style={{ width: '20vw', flexShrink: 0 }} />}
            {/* Title block - Desktop only */}
            {isDesktop && (
              <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '8px' }}>
                <h2 style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: '700', fontSize: '32px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '16px', lineHeight: 1.1 }}>
                  Similar Experiences
                </h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  Explore more curated experiences from our collection.
                </p>
              </div>
            )}
            {/* Experience Cards - first 3 from SIMILAR, then 3 from allTrips */}
            {[
              { id: 's1', nights: SIMILAR[0].nights, title: SIMILAR[0].title, buttonText: 'Explore', image: SIMILAR[0].img },
              { id: 's2', nights: SIMILAR[1].nights, title: SIMILAR[1].title, buttonText: 'Explore', image: SIMILAR[1].img },
              { id: 's3', nights: SIMILAR[2].nights, title: SIMILAR[2].title, buttonText: 'Explore', image: SIMILAR[2].img },
              { id: 'e4', nights: 8, title: "Xi'an: Imperial Legacy", buttonText: 'Explore Trip', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop' },
              { id: 'e5', nights: 9, title: 'Hangzhou: West Lake Serenity', buttonText: 'Explore Trip', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop' },
              { id: 'e6', nights: 7, title: 'Guilin: Karst Mountains', buttonText: 'Explore Trip', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop' },
            ].map((card) => (
              <div key={card.id} className="relative group overflow-hidden flex-shrink-0" style={{ width: '310px', height: '550px', userSelect: 'none' }}>
                <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                  {card.nights && <div className="text-xs font-bold uppercase tracking-wider text-right" style={{ color: '#ffffff', fontWeight: '500' }}>{card.nights} NIGHTS</div>}
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider mb-4 leading-tight opacity-85" style={{ fontWeight: '300' }}>{card.title}</h3>
                    <button
                      className="trip-btn px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 opacity-85 relative overflow-hidden active:scale-95"
                      style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.color = '#111'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.55)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseDown={(e) => { e.stopPropagation(); }}
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      {card.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Nav Button */}
        {isDesktop && (
          <button
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: simShowRightBtn ? 1 : 0, pointerEvents: simShowRightBtn ? 'auto' : 'none' }}
            onClick={() => simScrollBy(600)}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} color="white" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* ── Bottom CTA (ReadyToStart) ── */}
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
          <Link href="/make-an-enquiry">
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
          </Link>
        </div>
      </section>
      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
